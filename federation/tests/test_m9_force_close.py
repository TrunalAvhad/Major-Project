"""
Tests for RoundManager.check_deadline_and_participants(force_close=...).

Covers the six cases mandated by the implementation spec:
  1. future deadline + enough participants + force_close=False  -> RECEIVING (no change)
  2. future deadline + enough participants + force_close=True   -> READY_FOR_AGGREGATION
  3. future deadline + insufficient participants + force_close=True -> RECEIVING (no change, aggregation fails)
  4. deadline reached + enough participants + force_close=False -> existing auto-close preserved (READY_FOR_AGGREGATION)
  5. Admin aggregate endpoint: eligible round closes + aggregates successfully
  6. Non-Admin cannot invoke the forced aggregation path (route is ADMIN-only; verified via route config)
"""

import os
import shutil
import tempfile
import unittest
from datetime import datetime, timedelta, timezone

from federation.aggregation import Aggregator
from federation.events import EventEmitter
from federation.intake import IntakeManager
from federation.jobs import JobManager
from federation.rounds import RoundManager
from federation.security_hooks import M12SecurityHook
from federation.storage import FederationStorage
from federation.validation import UpdateValidator
from hospital_client.model_management.config import ModelConfig
from hospital_client.model_management.parameters import get_parameters
from hospital_client.model_management.registry import build_model
from hospital_client.training.federation import (
    _compute_parameters_checksum,
    build_federation_handoff,
)


def _future(days=30):
    return (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()


def _past(days=1):
    return (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()


class ForceCloseTestBase(unittest.TestCase):
    ARCHITECTURE = "resnet18"
    BASE_ID = "BASE-RESNET18-FC"
    BASE_VER = 1
    JOB_ID = "JOB-FC-TEST"
    ROUND_ID = "ROUND-FC-R1"
    HOSP_A = "HospA"
    HOSP_B = "HospB"

    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        db_path = os.path.join(self.temp_dir, "test_fc.db")
        artifacts_dir = os.path.join(self.temp_dir, "artifacts")
        self.storage = FederationStorage(db_path=db_path, artifacts_dir=artifacts_dir)
        self.job_mgr = JobManager(self.storage)
        self.round_mgr = RoundManager(self.storage)
        self.events = EventEmitter()
        validator = UpdateValidator(self.storage)
        self.intake_mgr = IntakeManager(self.storage, validator, M12SecurityHook(), self.events)
        self.agg = Aggregator(self.storage, self.events)
        dummy = build_model(ModelConfig(architecture=self.ARCHITECTURE, num_classes=2, input_size=(224, 224), color_mode="RGB"))
        self.base_params = get_parameters(dummy)
        self.base_chk = _compute_parameters_checksum(self.base_params)
        self.job_mgr.create_job(
            federation_job_id=self.JOB_ID, task="cancer", task_type="image_classification",
            architecture=self.ARCHITECTURE, num_classes=2, class_mapping={"0": 0, "1": 1},
            expected_participants=[self.HOSP_A, self.HOSP_B], minimum_participants=2,
            deadline="", training_requirements={"epochs": 1}, aggregation_configuration={},
        )

    def tearDown(self):
        shutil.rmtree(self.temp_dir)

    def _open_round(self, deadline, minimum_participants=2):
        self.round_mgr.create_round(
            federation_job_id=self.JOB_ID, round_id=self.ROUND_ID, round_number=1,
            expected_participants=[self.HOSP_A, self.HOSP_B], minimum_participants=minimum_participants,
            deadline=deadline, base_model_id=self.BASE_ID, base_model_version=self.BASE_VER,
            base_model_checksum=self.base_chk,
        )
        self.round_mgr.open_round(self.ROUND_ID)

    def _submit_handoff(self, participant):
        handoff = build_federation_handoff(
            parameters=self.base_params, model_id=f"LOCAL-{participant}", model_version=1,
            architecture=self.ARCHITECTURE, base_model_id=self.BASE_ID, base_model_version=self.BASE_VER,
            base_model_checksum=self.base_chk, num_train_samples=100, class_mapping={"0": 0, "1": 1},
            training_metrics={}, validation_metrics={}, training_configuration={"epochs": 1},
            device="cpu", precision="fp32", status="TRAINING_COMPLETED_AWAITING_FEDERATION",
        )
        hdir = os.path.join(self.temp_dir, f"handoff_{participant}")
        os.makedirs(hdir, exist_ok=True)
        handoff.save(hdir)
        upd = self.intake_mgr.receive_handoff(self.JOB_ID, self.ROUND_ID, participant, hdir)
        self.assertEqual(upd.status.value, "ACCEPTED", f"{participant}: {upd.rejection_reason}")

    def _round_status(self):
        return self.storage.get_round(self.ROUND_ID).status.value


class TestCase1_FutureDeadlineNoForce(ForceCloseTestBase):
    def test_future_deadline_enough_participants_no_force(self):
        self._open_round(_future(30))
        self._submit_handoff(self.HOSP_A)
        self._submit_handoff(self.HOSP_B)
        self.round_mgr.check_deadline_and_participants(self.ROUND_ID, force_close=False)
        self.assertEqual(self._round_status(), "RECEIVING",
                         "Status must remain RECEIVING when force_close=False and deadline is future")


class TestCase2_FutureDeadlineWithForce(ForceCloseTestBase):
    def test_future_deadline_enough_participants_force(self):
        self._open_round(_future(30))
        self._submit_handoff(self.HOSP_A)
        self._submit_handoff(self.HOSP_B)
        self.round_mgr.check_deadline_and_participants(self.ROUND_ID, force_close=True)
        self.assertEqual(self._round_status(), "READY_FOR_AGGREGATION",
                         "Status must become READY_FOR_AGGREGATION when force_close=True and participants are sufficient")


class TestCase3_FutureDeadlineInsufficientForce(ForceCloseTestBase):
    def test_force_close_insufficient_stays_receiving(self):
        self._open_round(_future(30))
        self._submit_handoff(self.HOSP_A)   # only 1 of 2 required
        self.round_mgr.check_deadline_and_participants(self.ROUND_ID, force_close=True)
        self.assertEqual(self._round_status(), "RECEIVING",
                         "Status must stay RECEIVING when force_close=True but accepted < minimum")

    def test_force_close_insufficient_aggregation_raises(self):
        self._open_round(_future(30))
        self._submit_handoff(self.HOSP_A)
        self.round_mgr.check_deadline_and_participants(self.ROUND_ID, force_close=True)
        with self.assertRaisesRegex(ValueError, "not ready for aggregation"):
            self.agg.aggregate_round(self.JOB_ID, self.ROUND_ID)


class TestCase4_PastDeadlineAutoClose(ForceCloseTestBase):
    def test_past_deadline_enough_participants_default(self):
        self._open_round(_future(30))
        self._submit_handoff(self.HOSP_A)
        self._submit_handoff(self.HOSP_B)
        rnd = self.storage.get_round(self.ROUND_ID)
        rnd.deadline = _past(1)
        self.storage.save_round(rnd)
        self.round_mgr.check_deadline_and_participants(self.ROUND_ID)   # force_close=False default
        self.assertEqual(self._round_status(), "READY_FOR_AGGREGATION",
                         "Existing deadline-based auto-close must still work with force_close=False")


class TestCase5_AdminAggregation(ForceCloseTestBase):
    def test_admin_aggregate_eligible_round_end_to_end(self):
        self._open_round(_future(30))
        self._submit_handoff(self.HOSP_A)
        self._submit_handoff(self.HOSP_B)
        # Exactly what api_adapter does for action=="aggregate"
        self.round_mgr.check_deadline_and_participants(self.ROUND_ID, force_close=True)
        self.assertEqual(self._round_status(), "READY_FOR_AGGREGATION")
        gm = self.agg.aggregate_round(self.JOB_ID, self.ROUND_ID)
        self.assertIn(self._round_status(), ("GLOBAL_MODEL_CREATED", "AGGREGATING"))
        self.assertIsNotNone(gm)
        self.assertEqual(gm.federation_job_id, self.JOB_ID)


class TestCase6_NonAdminRouteGuard(unittest.TestCase):
    ROUTES_FILE = os.path.normpath(os.path.join(
        os.path.dirname(__file__), "..", "..", "backend", "src", "routes", "federationRoutes.js"
    ))
    ADAPTER_FILE = os.path.normpath(os.path.join(
        os.path.dirname(__file__), "..", "api_adapter.py"
    ))

    def test_aggregate_route_is_admin_only(self):
        self.assertTrue(os.path.isfile(self.ROUTES_FILE), f"Routes file not found: {self.ROUTES_FILE}")
        content = open(self.ROUTES_FILE, encoding="utf-8").read()
        self.assertIn("requireRole(ROLES.ADMIN), aggregateRound", content,
                      "The /rounds/aggregate POST route must be guarded by requireRole(ROLES.ADMIN)")
        agg_route_lines = [l.strip() for l in content.splitlines() if "aggregateRound" in l and "router." in l]
        for line in agg_route_lines:
            self.assertNotIn("HOSPITAL_OPERATOR", line,
                             f"aggregateRound must not be accessible to HOSPITAL_OPERATOR: {line}")

    def test_force_close_not_in_submit_update_block(self):
        self.assertTrue(os.path.isfile(self.ADAPTER_FILE))
        content = open(self.ADAPTER_FILE, encoding="utf-8").read()
        submit_start = content.find('elif action == "submit_update"')
        next_action = content.find('\n        elif action ==', submit_start + 1)
        submit_block = content[submit_start:next_action] if next_action != -1 else content[submit_start:]
        self.assertNotIn("force_close", submit_block,
                         "submit_update block must not reference force_close")

    def test_force_close_true_in_aggregate_block(self):
        content = open(self.ADAPTER_FILE, encoding="utf-8").read()
        agg_start = content.find('elif action == "aggregate"')
        next_action = content.find('\n        elif action ==', agg_start + 1)
        agg_block = content[agg_start:next_action] if next_action != -1 else content[agg_start:]
        self.assertIn("force_close=True", agg_block,
                      "The aggregate action block must pass force_close=True")


if __name__ == "__main__":
    unittest.main()
