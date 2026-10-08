import os
import unittest
import json
import sqlite3
import tempfile
from federation.storage import FederationStorage
from federation.api_adapter import get_all_global_models
from federation.models import GlobalModelVersion, GlobalModelStatus, UpdateStatus, FederationUpdate

class TestParticipatingHospitals(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.db_path = os.path.join(self.temp_dir.name, "federation_metadata.db")
        self.storage = FederationStorage(db_path=self.db_path)
        
    def tearDown(self):
        self.temp_dir.cleanup()
        
    def test_dynamic_derivation(self):
        # 1. & 4. Prove no hospital IDs are hardcoded and derived dynamically
        # Create a Global Model
        gm = GlobalModelVersion(
            global_model_id="GM-TEST-V1",
            task="TestTask",
            task_type="image_classification",
            architecture="test_arch",
            version=1,
            artifact_location="/path/to/artifact",
            artifact_checksum="checksum",
            artifact_size=100,
            parameter_count=100,
            parameter_metadata={},
            federation_job_id="JOB_TEST",
            round_id="ROUND_TEST_1",
            source_update_ids=["UPD1", "UPD2"],
            aggregation_method="weighted_fedavg",
            aggregation_metadata={},
            status=GlobalModelStatus.EVALUATION_PENDING
        )
        self.storage.save_global_model(gm)
        
        # Add updates to the round
        upd1 = FederationUpdate(
            update_id="UPD1", federation_job_id="JOB_TEST", round_id="ROUND_TEST_1",
            participant_id="HOSP_A", model_id="M1", architecture="test_arch",
            artifact_location="", artifact_checksum="", parameter_count=100,
            parameter_metadata={}, num_train_samples=100, training_configuration={},
            status=UpdateStatus.USED_IN_AGGREGATION
        )
        upd2 = FederationUpdate(
            update_id="UPD2", federation_job_id="JOB_TEST", round_id="ROUND_TEST_1",
            participant_id="HOSP_B", model_id="M2", architecture="test_arch",
            artifact_location="", artifact_checksum="", parameter_count=100,
            parameter_metadata={}, num_train_samples=100, training_configuration={},
            status=UpdateStatus.USED_IN_AGGREGATION
        )
        # Unused update
        upd3 = FederationUpdate(
            update_id="UPD3", federation_job_id="JOB_TEST", round_id="ROUND_TEST_1",
            participant_id="HOSP_C", model_id="M3", architecture="test_arch",
            artifact_location="", artifact_checksum="", parameter_count=100,
            parameter_metadata={}, num_train_samples=100, training_configuration={},
            status=UpdateStatus.REJECTED
        )
        self.storage.save_update(upd1)
        self.storage.save_update(upd2)
        self.storage.save_update(upd3)
        
        # Call the api_adapter method
        models = get_all_global_models(self.storage)
        self.assertEqual(len(models), 1)
        
        # 2. two hospitals appear correctly (only USED_IN_AGGREGATION)
        hosp_list = models[0].get("participating_hospitals", [])
        self.assertEqual(sorted(hosp_list), ["HOSP_A", "HOSP_B"])
        
        # 6. model artifact reference remains unchanged
        self.assertEqual(models[0]["artifact_location"], "/path/to/artifact")
        self.assertEqual(models[0]["artifact_checksum"], "checksum")
        
    def test_different_participant_set(self):
        # 3. a different participant set would produce a different list
        gm2 = GlobalModelVersion(
            global_model_id="GM-TEST-V2",
            task="TestTask",
            task_type="image_classification",
            architecture="test_arch",
            version=2,
            artifact_location="/path/to/artifact2",
            artifact_checksum="checksum2",
            artifact_size=100,
            parameter_count=100,
            parameter_metadata={},
            federation_job_id="JOB_TEST",
            round_id="ROUND_TEST_2",
            source_update_ids=["UPD4", "UPD5", "UPD6"],
            aggregation_method="weighted_fedavg",
            aggregation_metadata={},
            status=GlobalModelStatus.EVALUATION_PENDING
        )
        self.storage.save_global_model(gm2)
        
        upd4 = FederationUpdate(
            update_id="UPD4", federation_job_id="JOB_TEST", round_id="ROUND_TEST_2",
            participant_id="HOSP_X", model_id="M4", architecture="test_arch",
            artifact_location="", artifact_checksum="", parameter_count=100,
            parameter_metadata={}, num_train_samples=100, training_configuration={},
            status=UpdateStatus.USED_IN_AGGREGATION
        )
        upd5 = FederationUpdate(
            update_id="UPD5", federation_job_id="JOB_TEST", round_id="ROUND_TEST_2",
            participant_id="HOSP_Y", model_id="M5", architecture="test_arch",
            artifact_location="", artifact_checksum="", parameter_count=100,
            parameter_metadata={}, num_train_samples=100, training_configuration={},
            status=UpdateStatus.USED_IN_AGGREGATION
        )
        upd6 = FederationUpdate(
            update_id="UPD6", federation_job_id="JOB_TEST", round_id="ROUND_TEST_2",
            participant_id="HOSP_Z", model_id="M6", architecture="test_arch",
            artifact_location="", artifact_checksum="", parameter_count=100,
            parameter_metadata={}, num_train_samples=100, training_configuration={},
            status=UpdateStatus.USED_IN_AGGREGATION
        )
        self.storage.save_update(upd4)
        self.storage.save_update(upd5)
        self.storage.save_update(upd6)
        
        models = get_all_global_models(self.storage)
        self.assertEqual(len(models), 1)
        hosp_list = models[0].get("participating_hospitals", [])
        self.assertEqual(sorted(hosp_list), ["HOSP_X", "HOSP_Y", "HOSP_Z"])

if __name__ == "__main__":
    unittest.main()
