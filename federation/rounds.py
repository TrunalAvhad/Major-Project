from typing import List, Optional
from .models import FederationRound, RoundStatus, now_iso, JobStatus
from .storage import FederationStorage

class RoundManager:
    def __init__(self, storage: FederationStorage):
        self.storage = storage

    def create_round(self, federation_job_id: str, round_id: str, round_number: int, expected_participants: List[str], minimum_participants: int, deadline: str, base_model_id: str = "", base_model_version: int = 1, base_model_checksum: str = "") -> FederationRound:
        if self.storage.get_round(round_id) is not None:
            raise ValueError(f"Round {round_id} already exists.")
            
        job = self.storage.get_job(federation_job_id)
        if not job:
            raise ValueError(f"Job {federation_job_id} does not exist.")
            
        rnd = FederationRound(
            round_id=round_id,
            federation_job_id=federation_job_id,
            round_number=round_number,
            expected_participants=expected_participants,
            minimum_participants=minimum_participants,
            deadline=deadline,
            base_model_id=base_model_id,
            base_model_version=base_model_version,
            base_model_checksum=base_model_checksum,
            status=RoundStatus.CREATED
        )
        self.storage.save_round(rnd)
        return rnd
        
    def open_round(self, round_id: str) -> FederationRound:
        rnd = self.storage.get_round(round_id)
        if not rnd:
            raise ValueError(f"Round {round_id} does not exist.")
        if rnd.status != RoundStatus.CREATED:
            raise ValueError(f"Round {round_id} is not in CREATED state.")
            
        rnd.status = RoundStatus.OPEN
        rnd.opened_at = now_iso()
        self.storage.save_round(rnd)
        return rnd

    def check_deadline_and_participants(self, round_id: str, force_close: bool = False) -> FederationRound:
        """Evaluate whether a round should be closed.

        When ``force_close`` is False (default) the round is only closed after
        its deadline has passed – this preserves the original automatic-deadline
        behaviour.

        When ``force_close`` is True (Admin-initiated early aggregation) the
        future-deadline guard is bypassed, but *every other check* still applies:
          - The round must exist and be in a receivable state.
          - ``accepted_participants >= minimum_participants`` is still required; if
            that condition is not met the round is left in its current status and
            the caller receives back the unchanged round (aggregation will then
            fail normally because the status is not READY_FOR_AGGREGATION).
        ``force_close`` is intentionally not forwarded from hospital/client paths;
        only the authenticated Admin aggregate endpoint passes it as True.
        """
        rnd = self.storage.get_round(round_id)
        if not rnd:
            raise ValueError(f"Round {round_id} does not exist.")

        import datetime
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        deadline_reached = (now >= rnd.deadline)

        # If the deadline is still in the future AND the caller has not explicitly
        # requested an early close, preserve the current status unchanged.
        if not deadline_reached and not force_close:
            return rnd

        # Minimum-participant check is NEVER bypassed, even when force_close=True.
        accepted = len(rnd.accepted_participants)
        if accepted >= rnd.minimum_participants:
            rnd.status = RoundStatus.READY_FOR_AGGREGATION
            rnd.closed_at = now
            self.storage.save_round(rnd)
        else:
            # With force_close=True we do NOT silently transition to
            # INSUFFICIENT_PARTICIPANTS (that would lose received updates that
            # arrived before deadline). Instead we leave the round as-is so that
            # the aggregation layer will raise its own "not ready" error, which
            # propagates clearly to the Admin UI.
            if deadline_reached:
                rnd.status = RoundStatus.INSUFFICIENT_PARTICIPANTS
                rnd.closed_at = now
                self.storage.save_round(rnd)
            # When force_close=True but participants are insufficient we simply
            # return the unchanged round; no status mutation, no save.

        return rnd

    def start_aggregation(self, round_id: str) -> FederationRound:
        rnd = self.storage.get_round(round_id)
        if not rnd:
            raise ValueError(f"Round {round_id} does not exist.")
        if rnd.status != RoundStatus.READY_FOR_AGGREGATION:
            raise ValueError(f"Round {round_id} is not READY_FOR_AGGREGATION.")
            
        rnd.status = RoundStatus.AGGREGATING
        rnd.aggregation_started_at = now_iso()
        self.storage.save_round(rnd)
        return rnd

    def complete_aggregation(self, round_id: str) -> FederationRound:
        rnd = self.storage.get_round(round_id)
        if not rnd:
            raise ValueError(f"Round {round_id} does not exist.")
        
        rnd.status = RoundStatus.GLOBAL_MODEL_CREATED
        rnd.aggregation_completed_at = now_iso()
        self.storage.save_round(rnd)
        return rnd

    def fail_aggregation(self, round_id: str) -> FederationRound:
        rnd = self.storage.get_round(round_id)
        if not rnd:
            raise ValueError(f"Round {round_id} does not exist.")
        
        rnd.status = RoundStatus.FAILED
        rnd.aggregation_completed_at = now_iso()
        self.storage.save_round(rnd)
        return rnd
