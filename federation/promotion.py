import uuid
from typing import Dict, Any

from .models import GlobalModelStatus, PromotionDecision, PromotionDecisionValue, now_iso
from .storage import FederationStorage
from .events import EventEmitter, FederationEvent

class PromotionPolicy:
    def __init__(self, accuracy_threshold: float = 0.0, require_improvement: bool = True):
        self.accuracy_threshold = accuracy_threshold
        self.require_improvement = require_improvement

    def evaluate(self, candidate_eval: Any, main_eval: Any) -> bool:
        if candidate_eval.accuracy < self.accuracy_threshold:
            return False
            
        if self.require_improvement and main_eval is not None:
            # simple deterministic policy: accuracy must be strictly greater
            return candidate_eval.accuracy > main_eval.accuracy
            
        return True

class PromotionManager:
    def __init__(self, storage: FederationStorage, event_emitter: EventEmitter, policy: PromotionPolicy):
        self.storage = storage
        self.event_emitter = event_emitter
        self.policy = policy

    def evaluate_promotion(self, candidate_global_model_id: str, evaluation_record_id: str) -> PromotionDecision:
        candidate_model = self.storage.get_global_model(candidate_global_model_id)
        if not candidate_model:
            raise ValueError(f"Candidate model {candidate_global_model_id} not found.")
            
        # Fetch the evaluation record directly
        # For simplicity, we just use the evaluation id passed
        import sqlite3
        candidate_eval = None
        with sqlite3.connect(self.storage.db_path) as conn:
            cursor = conn.execute('SELECT * FROM evaluation_records WHERE evaluation_id = ?', (evaluation_record_id,))
            row = cursor.fetchone()
            if row:
                from .models import EvaluationRecord
                import json
                candidate_eval = EvaluationRecord(
                    evaluation_id=row[0], global_model_id=row[1], model_version=row[2], task=row[3], architecture=row[4],
                    evaluation_dataset_id=row[5], evaluation_dataset_version=row[6], sample_count=row[7],
                    accuracy=row[8], precision=row[9], recall=row[10], f1=row[11], per_class_metrics=json.loads(row[12]),
                    confusion_matrix=json.loads(row[13]), predictions_location=row[14], metrics_location=row[15],
                    inference_configuration=json.loads(row[16]), status=row[17], started_at=row[18], completed_at=row[19]
                )
                
        if not candidate_eval:
            raise ValueError(f"Evaluation record {evaluation_record_id} not found.")
            
        # Get current main model
        current_main = self.storage.get_main_global_model(candidate_model.task, candidate_model.architecture, candidate_model.schema_hash)
        
        main_eval = None
        if current_main:
            with sqlite3.connect(self.storage.db_path) as conn:
                cursor = conn.execute('SELECT * FROM evaluation_records WHERE global_model_id = ? ORDER BY completed_at DESC LIMIT 1', (current_main.global_model_id,))
                row = cursor.fetchone()
                if row:
                    from .models import EvaluationRecord
                    import json
                    main_eval = EvaluationRecord(
                        evaluation_id=row[0], global_model_id=row[1], model_version=row[2], task=row[3], architecture=row[4],
                        evaluation_dataset_id=row[5], evaluation_dataset_version=row[6], sample_count=row[7],
                        accuracy=row[8], precision=row[9], recall=row[10], f1=row[11], per_class_metrics=json.loads(row[12]),
                        confusion_matrix=json.loads(row[13]), predictions_location=row[14], metrics_location=row[15],
                        inference_configuration=json.loads(row[16]), status=row[17], started_at=row[18], completed_at=row[19]
                    )

        should_promote = self.policy.evaluate(candidate_eval, main_eval)
        
        decision_val = PromotionDecisionValue.PROMOTED if should_promote else PromotionDecisionValue.NOT_PROMOTED
        reason = "Candidate exceeded main accuracy" if should_promote else "Candidate did not exceed main accuracy"
        if main_eval is None and should_promote:
            reason = "First model, promoted by default"
            
        decision_id = f"PROMO-{uuid.uuid4().hex[:8].upper()}"
        
        pd = PromotionDecision(
            promotion_decision_id=decision_id,
            candidate_global_model_id=candidate_model.global_model_id,
            previous_main_global_model_id=current_main.global_model_id if current_main else None,
            decision=decision_val,
            promotion_policy_version="v1_deterministic_accuracy",
            evaluation_record_id=candidate_eval.evaluation_id,
            reason=reason,
            metric_summary={"accuracy": candidate_eval.accuracy}
        )
        self.storage.save_promotion_decision(pd)
        
        if should_promote:
            if current_main:
                current_main.status = GlobalModelStatus.HISTORICAL
                self.storage.save_global_model(current_main)
            candidate_model.status = GlobalModelStatus.MAIN
            self.storage.save_global_model(candidate_model)
        else:
            candidate_model.status = GlobalModelStatus.EVALUATED_NOT_PROMOTED
            self.storage.save_global_model(candidate_model)
            
        self.event_emitter.emit(FederationEvent.PROMOTION_DECIDED, global_model_id=candidate_model.global_model_id, decision=decision_val.value)
        return pd
