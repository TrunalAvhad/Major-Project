import os
import shutil
import unittest
import tempfile
import numpy as np
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta, timezone

from federation.storage import FederationStorage
from federation.jobs import JobManager
from federation.rounds import RoundManager
from federation.intake import IntakeManager
from federation.validation import UpdateValidator
from federation.models import JobStatus, RoundStatus, FederationJob, FederationRound
from hospital_client.training.federation import build_federation_handoff, _compute_parameters_checksum
from hospital_client.model_management.registry import build_model
from hospital_client.model_management.config import ModelConfig
from hospital_client.model_management.parameters import get_parameters

class TestM9Hardening(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.db_path = os.path.join(self.temp_dir, "test_metadata.db")
        self.artifacts_dir = os.path.join(self.temp_dir, "test_artifacts")
        
        self.storage = FederationStorage(db_path=self.db_path, artifacts_dir=self.artifacts_dir)
        
        self.job_mgr = JobManager(self.storage)
        self.round_mgr = RoundManager(self.storage)

        
        from federation.security_hooks import M12SecurityHook
        from federation.events import EventEmitter
        self.validator = UpdateValidator(self.storage)
        self.intake_mgr = IntakeManager(self.storage, self.validator, M12SecurityHook(), EventEmitter())

        # Basic setup for tests
        self.job_id = "FED-TEST-JOB"
        self.job = self.job_mgr.create_job(
            federation_job_id=self.job_id,
            task="cancer",
            task_type="image_classification",
            architecture="resnet18",
            num_classes=2,
            class_mapping={"0":0, "1":1},
            expected_participants=["HospA"],
            minimum_participants=1,
            deadline="",
            training_requirements={"epochs": 1},
            aggregation_configuration={}
        )
        self.round_id = "R01"
        self.future = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
        
        dummy = build_model(ModelConfig(architecture="resnet18", num_classes=2, input_size=(224, 224), color_mode="RGB"))
        self.base_params = get_parameters(dummy)
        self.base_chk = _compute_parameters_checksum(self.base_params)

        self.round = self.round_mgr.create_round(
            federation_job_id=self.job_id,
            round_id=self.round_id,
            round_number=1,
            expected_participants=["HospA", "HospB"],
            minimum_participants=1,
            deadline=self.future,
            base_model_id="BASE-RESNET18",
            base_model_version=1,
            base_model_checksum=self.base_chk
        )
        self.round_mgr.open_round(self.round_id)
        
    def tearDown(self):
        shutil.rmtree(self.temp_dir)
        
    def _create_handoff(self, participant="HospA", base_id="BASE-RESNET18", base_ver=1, base_chk=None, params=None):
        if params is None:
            params = self.base_params
        if base_chk is None:
            base_chk = self.base_chk
            
        handoff = build_federation_handoff(
            parameters=params,
            model_id=f"LOCAL-{participant}",
            model_version=1,
            architecture="resnet18",
            base_model_id=base_id,
            base_model_version=base_ver,
            base_model_checksum=base_chk,
            num_train_samples=100,
            class_mapping={"0":0, "1":1},
            training_metrics={},
            validation_metrics={},
            training_configuration={"epochs": 1},
            device="cpu",
            precision="fp32",
            status="TRAINING_COMPLETED_AWAITING_FEDERATION"
        )
        handoff_dir = os.path.join(self.temp_dir, f"handoff_{participant}_{base_id}")
        os.makedirs(handoff_dir, exist_ok=True)
        handoff.save(handoff_dir)
        return handoff_dir

    # ============================================================
    # 1. BASE MODEL VERIFICATION
    # ============================================================
    def test_base_model_same_accepted(self):
        h_dir = self._create_handoff()
        upd = self.intake_mgr.receive_handoff(self.job_id, self.round_id, "HospA", h_dir)
        self.assertEqual(upd.status.value, "ACCEPTED")

    def test_base_model_different_id_rejected(self):
        h_dir = self._create_handoff(base_id="WRONG-ID")
        upd = self.intake_mgr.receive_handoff(self.job_id, self.round_id, "HospA", h_dir)
        self.assertEqual(upd.status.value, "REJECTED")
        self.assertIn("Base model ID mismatch", upd.rejection_reason)
        
    def test_base_model_different_version_rejected(self):
        h_dir = self._create_handoff(base_ver=99)
        upd = self.intake_mgr.receive_handoff(self.job_id, self.round_id, "HospA", h_dir)
        self.assertEqual(upd.status.value, "REJECTED")
        self.assertIn("Base model version mismatch", upd.rejection_reason)

    def test_base_model_different_checksum_rejected(self):
        h_dir = self._create_handoff(base_chk="bad-checksum-12345")
        upd = self.intake_mgr.receive_handoff(self.job_id, self.round_id, "HospA", h_dir)
        self.assertEqual(upd.status.value, "REJECTED")
        self.assertIn("Base model checksum mismatch", upd.rejection_reason)

    def test_base_model_different_starting_weights_rejected(self):
        dummy2 = build_model(ModelConfig(architecture="resnet18", num_classes=2, input_size=(224, 224), color_mode="RGB"))
        diff_params = get_parameters(dummy2)
        diff_chk = _compute_parameters_checksum(diff_params)
        h_dir = self._create_handoff(base_chk=diff_chk, params=diff_params)
        upd = self.intake_mgr.receive_handoff(self.job_id, self.round_id, "HospA", h_dir)
        self.assertEqual(upd.status.value, "REJECTED")
        self.assertIn("Base model checksum mismatch", upd.rejection_reason)

    # ============================================================
    # 2. PARTICIPANT AUTHORIZATION (Native M9)
    # ============================================================
    def test_auth_valid_enrolled(self):
        # HospA is in expected_participants for both Job and Round
        h_dir = self._create_handoff()
        upd = self.intake_mgr.receive_handoff(self.job_id, self.round_id, "HospA", h_dir)
        self.assertEqual(upd.status.value, "ACCEPTED")

    def test_auth_unknown_hospital_job(self):
        # HospB is in round's expected_participants, but NOT in Job's expected_participants
        h_dir = self._create_handoff("HospB")
        upd = self.intake_mgr.receive_handoff(self.job_id, self.round_id, "HospB", h_dir)
        self.assertEqual(upd.status.value, "REJECTED")
        self.assertIn("not authorized for job", upd.rejection_reason)
        
    def test_auth_unknown_hospital_round(self):
        # Update round to NOT include HospA
        rnd_record = self.round_mgr.storage.get_round(self.round_id)
        rnd_record.expected_participants = []
        self.round_mgr.storage.save_round(rnd_record)
        
        h_dir = self._create_handoff("HospA")
        upd = self.intake_mgr.receive_handoff(self.job_id, self.round_id, "HospA", h_dir)
        self.assertEqual(upd.status.value, "REJECTED")
        self.assertIn("has no expected participants configured", upd.rejection_reason)

    def test_auth_not_in_round(self):
        # Update round to only include HospC
        rnd_record = self.round_mgr.storage.get_round(self.round_id)
        rnd_record.expected_participants = ["HospC"]
        self.round_mgr.storage.save_round(rnd_record)
        
        h_dir = self._create_handoff("HospA")
        upd = self.intake_mgr.receive_handoff(self.job_id, self.round_id, "HospA", h_dir)
        self.assertEqual(upd.status.value, "REJECTED")
        self.assertIn("not authorized for round", upd.rejection_reason)

    # ============================================================
    # 3. DEADLINE / EXPIRATION
    # ============================================================
    def test_deadline_before_accepted(self):
        h_dir = self._create_handoff()
        upd = self.intake_mgr.receive_handoff(self.job_id, self.round_id, "HospA", h_dir)
        self.assertEqual(upd.status.value, "ACCEPTED")

    def test_deadline_after_expired(self):
        rnd_record = self.round_mgr.storage.get_round(self.round_id)
        rnd_record.deadline = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
        self.round_mgr.storage.save_round(rnd_record)
        
        h_dir = self._create_handoff()
        upd = self.intake_mgr.receive_handoff(self.job_id, self.round_id, "HospA", h_dir)
        self.assertEqual(upd.status.value, "EXPIRED")

    def test_deadline_expired_cannot_aggregate(self):
        rnd_record = self.round_mgr.storage.get_round(self.round_id)
        rnd_record.deadline = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
        self.round_mgr.storage.save_round(rnd_record)
        
        h_dir = self._create_handoff()
        self.intake_mgr.receive_handoff(self.job_id, self.round_id, "HospA", h_dir)
        
        self.round_mgr.check_deadline_and_participants(self.round_id)
        
        from federation.aggregation import Aggregator
        from federation.events import EventEmitter
        agg_mgr = Aggregator(self.storage, EventEmitter())
        with self.assertRaisesRegex(ValueError, "not ready for aggregation"):
            agg_mgr.aggregate_round(self.job_id, self.round_id)
            
    def test_deadline_min_participants_reached(self):
        h_dir = self._create_handoff()
        self.intake_mgr.receive_handoff(self.job_id, self.round_id, "HospA", h_dir)
        
        # Fast forward time to past deadline so it closes
        rnd_record = self.round_mgr.storage.get_round(self.round_id)
        rnd_record.deadline = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
        self.round_mgr.storage.save_round(rnd_record)
        
        # Check should close round
        self.round_mgr.check_deadline_and_participants(self.round_id)
        rnd_record = self.round_mgr.storage.get_round(self.round_id)
        self.assertEqual(rnd_record.status.value, "READY_FOR_AGGREGATION")

    def test_deadline_old_round_rejected(self):
        h_dir = self._create_handoff()
        self.intake_mgr.receive_handoff(self.job_id, self.round_id, "HospA", h_dir)
        
        rnd_record = self.round_mgr.storage.get_round(self.round_id)
        rnd_record.deadline = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
        self.round_mgr.storage.save_round(rnd_record)
        self.round_mgr.check_deadline_and_participants(self.round_id) # Closes R01
        
        # Now R01 is closed. Any new update should be rejected/expired
        h_dir2 = self._create_handoff(participant="HospB")
        with self.assertRaisesRegex(ValueError, "not open for receiving"):
            self.intake_mgr.receive_handoff(self.job_id, self.round_id, "HospB", h_dir2)

if __name__ == '__main__':
    unittest.main()
