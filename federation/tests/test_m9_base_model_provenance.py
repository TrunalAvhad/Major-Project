import pytest
import os
import json
import shutil
from unittest.mock import patch, MagicMock

from federation.rounds import RoundManager
from federation.validation import UpdateValidator
from federation.storage import FederationStorage
from federation.api_adapter import EventEmitter
from hospital_client.training.result import TrainingResult, TrainingStatus
from hospital_client.training.trainer import build_federation_handoff
from hospital_client.training.config import TrainingConfig
from hospital_client.model_management.config import ModelConfig
from federation.jobs import JobManager


class TestBaseModelProvenance:

    @pytest.fixture
    def storage(self):
        import tempfile
        fd, path = tempfile.mkstemp(suffix=".db")
        os.close(fd)
        store = FederationStorage(db_path=path)
        yield store
        if os.path.exists(path):
            os.remove(path)

    def test_canonical_base_model_threaded_to_handoff(self):
        # M7 test: verify build_federation_handoff correctly uses canonical provenance
        # when provided, and differentiates it from the local checkpoint ID.
        tc = TrainingConfig(
            model_id="FED_LOCAL_123",
            model_config=ModelConfig(architecture="mobilenet_v3_small", num_classes=2, input_size=[224,224]),
            dataset_dir="/fake",
            output_dir="/fake_out",
            canonical_base_model_id="FED_CANONICAL_001",
            canonical_base_model_version=3,
            canonical_base_model_checksum="sha256_canonical"
        )
        
        tr = TrainingResult(
            model_id="FED_LOCAL_123",
            architecture="mobilenet_v3_small",
            status=TrainingStatus.TRAINING_COMPLETED_AWAITING_FEDERATION,
            checkpoint_model_id="FED_LOCAL_123",
            checkpoint_version=1,
            training_metrics={"sample_count": 10},
            validation_metrics={},
            training_configuration=tc.to_dict(),
            resolved_precision="fp32",
            training_duration_seconds=1.0,
            class_mapping={"A": 0, "B": 1}
        )

        with patch("hospital_client.training.trainer.get_model") as mock_get_model, \
             patch("hospital_client.training.trainer.get_parameters") as mock_get_params:
            
            mock_model = MagicMock()
            mock_get_model.return_value = (mock_model, None)
            mock_param = MagicMock()
            mock_param.shape = [1]
            mock_param.dtype = "float32"
            mock_get_params.return_value = [mock_param]

            with patch("hospital_client.training.trainer._compute_parameters_checksum", return_value="sha256_local"), \
                 patch("hospital_client.training.federation._compute_parameters_checksum", return_value="sha256_local"):
                handoff = build_federation_handoff(tr, "/fake_out", "ROUND_1", "HOSP_1")

        # Identity matches what was produced locally
        assert handoff.model_id == "FED_LOCAL_123"
        assert handoff.model_version == 1
        assert handoff.parameters_checksum == "sha256_local"
        
        # Provenance matches the round
        assert handoff.base_model_id == "FED_CANONICAL_001"
        assert handoff.base_model_version == 3
        assert handoff.base_model_checksum == "sha256_canonical"

    def test_strict_m9_validation(self, storage):
        # M9 test: verify validator enforces strict provenance checks
        rm = RoundManager(storage)
        events = EventEmitter()
        
        # Create job
        jm = JobManager(storage)
        jm.create_job("JOB_1", "Task", "image_classification", "mobilenet_v3_small", 2, {}, [], 2, "2099-01-01T00:00:00Z", {}, {})
        
        # Create round with canonical provenance
        rm.create_round(
            "JOB_1", "ROUND_1", 1, [], 2, "2099-01-01T00:00:00Z",
            base_model_id="CANONICAL_ID",
            base_model_version=1,
            base_model_checksum="CANONICAL_SHA"
        )
        
        validator = UpdateValidator(storage)
        
        # Get job and round objects
        job = storage.get_job("JOB_1")
        # Ensure job has expected_participants populated so authorization passes
        job.expected_participants = ["HOSP1", "HOSP2"]
        rnd = storage.get_round("ROUND_1")
        rnd.expected_participants = ["HOSP1", "HOSP2"]
        
        # Helper to make a handoff
        def make_handoff(b_id, b_ver, b_sha, l_id="LOCAL_1", l_sha="LOCAL_SHA"):
            handoff = MagicMock()
            handoff.federation_job_id = "JOB_1"
            handoff.round_id = "ROUND_1"
            handoff.base_model_id = b_id
            handoff.base_model_version = b_ver
            handoff.base_model_checksum = b_sha
            handoff.model_id = l_id
            handoff.artifact_checksum = l_sha
            handoff.architecture = "mobilenet_v3_small"
            handoff.num_classes = 2
            handoff.class_mapping = {}
            handoff.status = "TRAINING_COMPLETED_AWAITING_FEDERATION"
            return handoff
            
        # Case B & C: Correct canonical provenance is accepted (different local IDs)
        h1 = make_handoff("CANONICAL_ID", 1, "CANONICAL_SHA", l_id="HOSP1_MODEL")
        h2 = make_handoff("CANONICAL_ID", 1, "CANONICAL_SHA", l_id="HOSP2_MODEL")
        # Should not raise
        validator.validate(job, rnd, h1, "HOSP1")
        validator.validate(job, rnd, h2, "HOSP2")
        
        # Case D: Wrong base_model_id (even if checksum matches)
        h_bad_id = make_handoff("WRONG_ID", 1, "CANONICAL_SHA")
        with pytest.raises(ValueError, match="Base model ID mismatch"):
            validator.validate(job, rnd, h_bad_id, "HOSP1")
        
        # Case E: Wrong checksum
        h_bad_sha = make_handoff("CANONICAL_ID", 1, "WRONG_SHA")
        with pytest.raises(ValueError, match="Base model checksum mismatch"):
            validator.validate(job, rnd, h_bad_sha, "HOSP1")
        
        # Case F: Wrong version
        h_bad_ver = make_handoff("CANONICAL_ID", 2, "CANONICAL_SHA")
        with pytest.raises(ValueError, match="Base model version mismatch"):
            validator.validate(job, rnd, h_bad_ver, "HOSP1")

