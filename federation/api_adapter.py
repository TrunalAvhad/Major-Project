import json
import sys
import argparse
import dataclasses
from enum import Enum
import sqlite3

from federation.storage import FederationStorage
from federation.jobs import JobManager
from federation.rounds import RoundManager
from federation.intake import IntakeManager
from federation.validation import UpdateValidator
from federation.security_hooks import M12SecurityHook
from federation.events import EventEmitter
from federation.aggregation import Aggregator
from federation.evaluation import EvaluationManager
from federation.promotion import PromotionManager, PromotionPolicy
from federation.models import now_iso, JobStatus, RoundStatus

class EnhancedJSONEncoder(json.JSONEncoder):
    def default(self, o):
        if dataclasses.is_dataclass(o):
            return dataclasses.asdict(o)
        if isinstance(o, Enum):
            return o.value
        return super().default(o)

def get_all_jobs(storage):
    with sqlite3.connect(storage.db_path) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM federation_jobs")
        rows = cur.fetchall()
        jobs = []
        for row in rows:
            job = dict(row)
            job['class_mapping'] = json.loads(job['class_mapping'])
            job['expected_participants'] = json.loads(job['expected_participants'])
            job['training_requirements'] = json.loads(job['training_requirements'])
            job['aggregation_configuration'] = json.loads(job['aggregation_configuration'])
            jobs.append(job)
        return jobs

def get_job_rounds(storage, job_id):
    with sqlite3.connect(storage.db_path) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM federation_rounds WHERE federation_job_id = ?", (job_id,))
        rows = cur.fetchall()
        rounds = []
        for row in rows:
            r = dict(row)
            r['expected_participants'] = json.loads(r['expected_participants'])
            r['received_participants'] = json.loads(r['received_participants'])
            r['accepted_participants'] = json.loads(r['accepted_participants'])
            r['rejected_participants'] = json.loads(r['rejected_participants'])
            r['quarantined_participants'] = json.loads(r['quarantined_participants'])
            rounds.append(r)
        return rounds

def get_round_updates(storage, round_id):
    with sqlite3.connect(storage.db_path) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM federation_updates WHERE round_id = ?", (round_id,))
        rows = cur.fetchall()
        updates = []
        for row in rows:
            u = dict(row)
            if u['parameter_metadata']:
                u['parameter_metadata'] = json.loads(u['parameter_metadata'])
            if u['training_configuration']:
                u['training_configuration'] = json.loads(u['training_configuration'])
            if u['validation_result']:
                u['validation_result'] = json.loads(u['validation_result'])
            updates.append(u)
        return updates

def get_all_global_models(storage):
    with sqlite3.connect(storage.db_path) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM global_model_versions")
        rows = cur.fetchall()
        models = []
        for row in rows:
            m = dict(row)
            if m.get('source_update_ids'):
                m['source_update_ids'] = json.loads(m['source_update_ids'])
            if m.get('parameter_metadata'):
                m['parameter_metadata'] = json.loads(m['parameter_metadata'])
            if m.get('aggregation_metadata'):
                m['aggregation_metadata'] = json.loads(m['aggregation_metadata'])
            if m.get('class_mapping'):
                try:
                    m['class_mapping'] = json.loads(m['class_mapping'])
                except (json.JSONDecodeError, TypeError):
                    # Guard: if stored value is not JSON (e.g., a status string due to a
                    # past column-order bug), leave it as a string so the error is visible
                    # in the response but the listing does not crash.
                    pass
            
            round_id = m.get('round_id')
            if round_id:
                cur2 = conn.cursor()
                cur2.execute("SELECT participant_id FROM federation_updates WHERE round_id = ? AND status = ?", (round_id, "USED_IN_AGGREGATION"))
                m['participating_hospitals'] = [r['participant_id'] for r in cur2.fetchall()]
            else:
                m['participating_hospitals'] = []
                
            models.append(m)
        return models


def get_all_evaluations(storage):
    with sqlite3.connect(storage.db_path) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM evaluation_records")
        rows = cur.fetchall()
        evals = []
        for row in rows:
            e = dict(row)
            if e.get('per_class_metrics'):
                e['per_class_metrics'] = json.loads(e['per_class_metrics'])
            if e.get('confusion_matrix'):
                e['confusion_matrix'] = json.loads(e['confusion_matrix'])
            if e.get('inference_configuration'):
                e['inference_configuration'] = json.loads(e['inference_configuration'])
            evals.append(e)
        return evals

def get_hospital_updates(storage, hospital_id):
    with sqlite3.connect(storage.db_path) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM federation_updates WHERE participant_id = ?", (hospital_id,))
        rows = cur.fetchall()
        updates = []
        for row in rows:
            u = dict(row)
            if u['parameter_metadata']:
                u['parameter_metadata'] = json.loads(u['parameter_metadata'])
            if u['training_configuration']:
                u['training_configuration'] = json.loads(u['training_configuration'])
            if u['validation_result']:
                u['validation_result'] = json.loads(u['validation_result'])
            updates.append(u)
        return updates

def main():
    try:
        input_data = sys.stdin.read()
        if not input_data.strip():
            print(json.dumps({"success": False, "error": "No input provided"}))
            return
            
        req = json.loads(input_data)
        action = req.get("action")
        storage = FederationStorage()
        events = EventEmitter()

        if action == "get_architectures":
            import hospital_client.model_management.registry as registry
            # Get catalog and convert to dict list
            archs = []
            for name in registry.list_architectures():
                info = registry.get_architecture_info(name)
                archs.append(info.to_dict())
            print(json.dumps({"success": True, "architectures": archs}, cls=EnhancedJSONEncoder))
            return

        if action == "list_jobs":
            jobs = get_all_jobs(storage)
            for j in jobs:
                j['rounds'] = get_job_rounds(storage, j['federation_job_id'])
            print(json.dumps({"success": True, "jobs": jobs}, cls=EnhancedJSONEncoder))
            
        elif action == "get_job_details":
            job_id = req.get("job_id")
            jobs = get_all_jobs(storage)
            job = next((j for j in jobs if j['federation_job_id'] == job_id), None)
            if not job:
                print(json.dumps({"success": False, "error": "Job not found"}))
                return
            job['rounds'] = get_job_rounds(storage, job_id)
            for r in job['rounds']:
                r['updates'] = get_round_updates(storage, r['round_id'])
            print(json.dumps({"success": True, "job": job}, cls=EnhancedJSONEncoder))

        elif action == "create_job":
            jm = JobManager(storage)
            job = jm.create_job(
                federation_job_id=req["job_id"],
                task=req["task"],
                task_type=req.get("task_type", "image_classification"),
                architecture=req["architecture"],
                num_classes=req["num_classes"],
                class_mapping=req.get("class_mapping", {}),
                expected_participants=req.get("expected_participants", []),
                minimum_participants=req.get("minimum_participants", 2),
                deadline=req.get("deadline", ""),
                training_requirements=req.get("training_requirements", {}),
                aggregation_configuration=req.get("aggregation_configuration", {})
            )
            print(json.dumps({"success": True, "job": job}, cls=EnhancedJSONEncoder))

        elif action == "create_round":
            rm = RoundManager(storage)
            rnd = rm.create_round(
                federation_job_id=req["job_id"],
                round_id=req["round_id"],
                round_number=req["round_number"],
                expected_participants=req.get("expected_participants", []),
                minimum_participants=req.get("minimum_participants", 2),
                deadline=req.get("deadline", ""),
                base_model_id=req.get("base_model_id", ""),
                base_model_version=req.get("base_model_version", 1),
                base_model_checksum=req.get("base_model_checksum", "")
            )
            rm.open_round(req["round_id"])
            print(json.dumps({"success": True, "round": rnd}, cls=EnhancedJSONEncoder))

        elif action == "aggregate":
            rm = RoundManager(storage)
            # force_close=True: Admin may close the round before the deadline
            # if the minimum accepted participant count has been reached.
            # All non-deadline checks (minimum_participants, participant validation,
            # security hooks, state guards) remain fully active.
            force_close = bool(req.get("force_close", False))
            rm.check_deadline_and_participants(req["round_id"], force_close=force_close)
            agg = Aggregator(storage, events)
            # Look up job_id from the round if not explicitly provided
            job_id = req.get("job_id")
            if not job_id:
                rnd = storage.get_round(req["round_id"])
                job_id = rnd.federation_job_id
            gm = agg.aggregate_round(job_id, req["round_id"])
            print(json.dumps({"success": True, "global_model": gm}, cls=EnhancedJSONEncoder))


        elif action == "list_global_models":
            models = get_all_global_models(storage)
            evals = get_all_evaluations(storage)
            # attach evals to models
            for m in models:
                m['evaluations'] = [e for e in evals if e['global_model_id'] == m['global_model_id']]
            print(json.dumps({"success": True, "models": models}, cls=EnhancedJSONEncoder))

        elif action == "evaluate":
            ev = EvaluationManager(storage, events, eval_datasets_dir=req.get("eval_datasets_dir", "evaluation_datasets"))
            record = ev.evaluate(req["global_model_id"])
            print(json.dumps({"success": True, "evaluation": record}, cls=EnhancedJSONEncoder))

        elif action == "promote":
            pm = PromotionManager(storage, events, PromotionPolicy())
            pd = pm.evaluate_promotion(req["global_model_id"], req["eval_record_id"])
            print(json.dumps({"success": True, "decision": pd}, cls=EnhancedJSONEncoder))
            
        elif action == "get_hospital_status":
            hosp_id = req["hospital_id"]
            updates = get_hospital_updates(storage, hosp_id)
            print(json.dumps({"success": True, "updates": updates}, cls=EnhancedJSONEncoder))

        elif action == "register_participant":
            # Add participant to expected_participants for job and round
            job_id = req["job_id"]
            round_id = req["round_id"]
            participant_id = req["participant_id"]
            
            job = storage.get_job(job_id)
            if not job:
                print(json.dumps({"success": False, "error": "Job not found"}))
                return
            if participant_id not in job.expected_participants:
                job.expected_participants.append(participant_id)
                storage.save_job(job)
            
            if round_id:
                rnd = storage.get_round(round_id)
                if rnd:
                    if participant_id not in rnd.expected_participants:
                        rnd.expected_participants.append(participant_id)
                        storage.save_round(rnd)
            print(json.dumps({"success": True}))

        elif action == "submit_update":
            job_id = req["job_id"]
            round_id = req["round_id"]
            participant_id = req["participant_id"]
            handoff_dir = req["handoff_dir"]
            
            im = IntakeManager(storage, UpdateValidator(storage), M12SecurityHook(), events)
            try:
                update = im.receive_handoff(job_id, round_id, participant_id, handoff_dir)
                print(json.dumps({"success": True, "update": update}, cls=EnhancedJSONEncoder))
            except Exception as e:
                print(json.dumps({"success": False, "error": str(e)}))

        elif action == "delete_job":
            job_id = req["job_id"]
            admin = req.get("admin_id", "admin")
            job = storage.get_job(job_id)
            if not job:
                print(json.dumps({"success": False, "error": "Job not found"}))
                return
            
            rounds = get_job_rounds(storage, job_id)
            has_history = False
            for r in rounds:
                updates = get_round_updates(storage, r["round_id"])
                if r["status"] not in ["CREATED", "OPEN", "RECEIVING"] or any(u["status"] in ["ACCEPTED", "USED_IN_AGGREGATION"] for u in updates):
                    has_history = True
            
            if has_history:
                job.status = JobStatus.ARCHIVED
                storage.save_job(job)
                events.emit("audit", action="federation_job_archived", job_id=job_id, admin=admin, timestamp=now_iso())
                print(json.dumps({"success": True, "action_taken": "archived"}))
            else:
                for r in rounds:
                    storage.delete_round(r["round_id"])
                storage.delete_job(job_id)
                import shutil, os
                job_dir = storage.get_job_artifact_dir(job_id)
                if os.path.exists(job_dir):
                    shutil.rmtree(job_dir)
                events.emit("audit", action="federation_job_deleted", job_id=job_id, admin=admin, timestamp=now_iso())
                print(json.dumps({"success": True, "action_taken": "deleted"}))

        elif action == "delete_round":
            round_id = req["round_id"]
            admin = req.get("admin_id", "admin")
            r = storage.get_round(round_id)
            if not r:
                print(json.dumps({"success": False, "error": "Round not found"}))
                return
                
            updates = get_round_updates(storage, round_id)
            has_history = False
            if r.status not in ["CREATED", "OPEN", "RECEIVING"] or any(u["status"] in ["ACCEPTED", "USED_IN_AGGREGATION"] for u in updates):
                has_history = True
                
            if has_history:
                r.status = RoundStatus.CANCELLED
                storage.save_round(r)
                events.emit("audit", action="federation_round_cancelled", round_id=round_id, admin=admin, timestamp=now_iso())
                print(json.dumps({"success": True, "action_taken": "cancelled"}))
            else:
                storage.delete_round(round_id)
                import shutil, os
                # get_round_artifact_dir returns the updates dir, but we should just rm the round dir
                round_dir = os.path.join(storage.artifacts_dir, "jobs", r.federation_job_id, "rounds", round_id)
                if os.path.exists(round_dir):
                    shutil.rmtree(round_dir)
                events.emit("audit", action="federation_round_deleted", round_id=round_id, admin=admin, timestamp=now_iso())
                print(json.dumps({"success": True, "action_taken": "deleted"}))

        else:
            print(json.dumps({"success": False, "error": f"Unknown action: {action}"}))

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    main()
