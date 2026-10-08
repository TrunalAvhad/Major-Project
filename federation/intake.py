import uuid
import os
import shutil
from typing import Optional

from hospital_client.training.federation import FederationHandoff
from .models import FederationUpdate, UpdateStatus, now_iso, RoundStatus
from .storage import FederationStorage
from .validation import UpdateValidator
from .security_hooks import M12SecurityHook
from .events import EventEmitter, FederationEvent

class IntakeManager:
    def __init__(self, storage: FederationStorage, validator: UpdateValidator, security_hook: M12SecurityHook, event_emitter: EventEmitter):
        self.storage = storage
        self.validator = validator
        self.security_hook = security_hook
        self.event_emitter = event_emitter

    def receive_handoff(self, 
                        federation_job_id: str, 
                        round_id: str, 
                        participant_id: str, 
                        handoff_dir: str) -> FederationUpdate:
                        
        job = self.storage.get_job(federation_job_id)
        if not job:
            raise ValueError(f"Job {federation_job_id} does not exist.")
            
        rnd = self.storage.get_round(round_id)
        if not rnd:
            raise ValueError(f"Round {round_id} does not exist.")
            
        if rnd.status not in (RoundStatus.OPEN, RoundStatus.RECEIVING):
            raise ValueError(f"Round {round_id} is not open for receiving (status: {rnd.status})")
            
        update_id = f"UPD-{uuid.uuid4().hex[:8].upper()}"
        
        # Load handoff
        try:
            handoff = FederationHandoff.load(handoff_dir)
        except Exception as e:
            raise ValueError(f"Failed to load handoff: {e}")
            
        # If the handoff is missing federation info, we inject it for tracking
        handoff.federation_job_id = federation_job_id
        handoff.round_id = round_id
        
        import datetime
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        is_expired = now > rnd.deadline
        
        # Create Update record
        update = FederationUpdate(
            update_id=update_id,
            federation_job_id=federation_job_id,
            round_id=round_id,
            participant_id=participant_id,
            model_id=handoff.model_id,
            architecture=handoff.architecture,
            artifact_location="",
            artifact_checksum=handoff.parameters_checksum,
            parameter_count=handoff.parameter_count,
            parameter_metadata={"shapes": handoff.parameter_shapes, "dtypes": handoff.parameter_dtypes},
            num_train_samples=handoff.num_train_samples,
            training_configuration=handoff.training_configuration,
            status=UpdateStatus.EXPIRED if is_expired else UpdateStatus.RECEIVED
        )
        self.storage.save_update(update)
        self.event_emitter.emit(FederationEvent.UPDATE_RECEIVED, update_id=update.update_id)
        
        if is_expired:
            # Expired updates are not processed further, nor added to received_participants.
            # They stay as EXPIRED.
            return update
            
        if rnd.status == RoundStatus.OPEN:
            rnd.status = RoundStatus.RECEIVING
            self.storage.save_round(rnd)
            
        if participant_id not in rnd.received_participants:
            rnd.received_participants.append(participant_id)
            self.storage.save_round(rnd)
        
        # 1. Basic validation
        try:
            self.validator.validate(job, rnd, handoff, participant_id, update.update_id)
        except ValueError as e:
            update.status = UpdateStatus.REJECTED
            update.rejection_reason = str(e)
            self.storage.save_update(update)
            
            if participant_id not in rnd.rejected_participants:
                rnd.rejected_participants.append(participant_id)
                self.storage.save_round(rnd)
                
            self.event_emitter.emit(FederationEvent.UPDATE_REJECTED, update_id=update.update_id, reason=str(e))
            return update
            
        # 2. Security validation (M12 hook)
        security_decision = self.security_hook.evaluate_update(update, handoff)
        if security_decision == "REJECT":
            update.status = UpdateStatus.REJECTED
            update.rejection_reason = "Rejected by M12 Security Hook"
            self.storage.save_update(update)
            if participant_id not in rnd.rejected_participants:
                rnd.rejected_participants.append(participant_id)
                self.storage.save_round(rnd)
            self.event_emitter.emit(FederationEvent.UPDATE_REJECTED, update_id=update.update_id, reason=update.rejection_reason)
            return update
        elif security_decision == "QUARANTINE":
            update.status = UpdateStatus.QUARANTINE
            update.rejection_reason = "Quarantined by M12 Security Hook"
            self.storage.save_update(update)
            if participant_id not in rnd.quarantined_participants:
                rnd.quarantined_participants.append(participant_id)
                self.storage.save_round(rnd)
            self.event_emitter.emit(FederationEvent.UPDATE_QUARANTINED, update_id=update.update_id)
            return update
            
        # 3. Accepted
        # Move artifact to secure storage
        dest_dir = os.path.join(self.storage.get_round_artifact_dir(federation_job_id, round_id), update_id)
        os.makedirs(dest_dir, exist_ok=True)
        # We can just use handoff.save to write it to the new location
        handoff.save(dest_dir)
        
        update.artifact_location = dest_dir
        update.status = UpdateStatus.ACCEPTED
        update.validated_at = now_iso()
        self.storage.save_update(update)
        
        if participant_id not in rnd.accepted_participants:
            rnd.accepted_participants.append(participant_id)
            self.storage.save_round(rnd)
            
        self.event_emitter.emit(FederationEvent.UPDATE_ACCEPTED, update_id=update.update_id)
        return update
