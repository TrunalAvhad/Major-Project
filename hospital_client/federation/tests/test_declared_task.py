"""
Tests for M9 multi-job hospital eligibility with explicit task association.
Tests the declared_task architecture: dataset name != medical task.
"""
import json
import os
import pytest
from hospital_client.federation.eligibility import evaluate_eligibility, FederationEligibilityResult


def _write_manifest(path, records, metadata=None):
    manifest = {
        "total_records": len(records),
        "records": records,
    }
    if metadata:
        manifest["metadata"] = metadata
    with open(path, "w") as f:
        json.dump(manifest, f)


@pytest.fixture
def malaria_manifest_dir(tmp_path):
    """M5 output for a Malaria dataset with Parasitized + Uninfected."""
    m5 = tmp_path / "m5_malaria"
    m5.mkdir()

    train_records = (
        [{"image_path": f"/img/p_{i}.png", "label": "Parasitized"} for i in range(50)]
        + [{"image_path": f"/img/u_{i}.png", "label": "Uninfected"} for i in range(50)]
    )
    val_records = (
        [{"image_path": f"/img/vp_{i}.png", "label": "Parasitized"} for i in range(10)]
        + [{"image_path": f"/img/vu_{i}.png", "label": "Uninfected"} for i in range(10)]
    )
    test_records = (
        [{"image_path": f"/img/tp_{i}.png", "label": "Parasitized"} for i in range(5)]
        + [{"image_path": f"/img/tu_{i}.png", "label": "Uninfected"} for i in range(5)]
    )

    _write_manifest(m5 / "train_manifest.json", train_records)
    _write_manifest(m5 / "validation_manifest.json", val_records)
    _write_manifest(m5 / "test_manifest.json", test_records)
    with open(m5 / "preprocessing_report.json", "w") as f:
        json.dump({"classes": ["Parasitized", "Uninfected"]}, f)
    return str(m5)


@pytest.fixture
def extended_malaria_manifest_dir(tmp_path):
    """M5 output for a Malaria dataset with extra classes (CLASS_SUBSET scenario)."""
    m5 = tmp_path / "m5_extended"
    m5.mkdir()

    train_records = (
        [{"image_path": f"/img/p_{i}.png", "label": "Parasitized"} for i in range(30)]
        + [{"image_path": f"/img/u_{i}.png", "label": "Uninfected"} for i in range(30)]
        + [{"image_path": f"/img/v_{i}.png", "label": "Vivax"} for i in range(15)]
        + [{"image_path": f"/img/m_{i}.png", "label": "Malariae"} for i in range(10)]
        + [{"image_path": f"/img/o_{i}.png", "label": "Ovale"} for i in range(5)]
    )
    val_records = (
        [{"image_path": f"/img/vp_{i}.png", "label": "Parasitized"} for i in range(8)]
        + [{"image_path": f"/img/vu_{i}.png", "label": "Uninfected"} for i in range(8)]
        + [{"image_path": f"/img/vv_{i}.png", "label": "Vivax"} for i in range(4)]
    )
    test_records = (
        [{"image_path": f"/img/tp_{i}.png", "label": "Parasitized"} for i in range(4)]
        + [{"image_path": f"/img/tu_{i}.png", "label": "Uninfected"} for i in range(4)]
        + [{"image_path": f"/img/tv_{i}.png", "label": "Vivax"} for i in range(2)]
    )

    _write_manifest(m5 / "train_manifest.json", train_records)
    _write_manifest(m5 / "validation_manifest.json", val_records)
    _write_manifest(m5 / "test_manifest.json", test_records)
    with open(m5 / "preprocessing_report.json", "w") as f:
        json.dump({"classes": ["Parasitized", "Uninfected", "Vivax", "Malariae", "Ovale"]}, f)
    return str(m5)


@pytest.fixture
def valid_recs():
    return {
        "all_model_assessments": {
            "resnet18": {"feasible": True, "recommendation_tier": "RECOMMENDED"}
        }
    }

@pytest.fixture
def invalid_recs():
    return {
        "all_model_assessments": {
            "resnet18": {"feasible": False, "recommendation_tier": "UNKNOWN"}
        }
    }

MALARIA_JOB = {
    "federation_job_id": "JOB_MAL_RES18_CLS2_1",
    "task": "Malaria",
    "architecture": "resnet18",
    "num_classes": 2,
    "class_mapping": {"Parasitized": 0, "Uninfected": 1},
}

CANCER_JOB = {
    "federation_job_id": "JOB_CAN_RES18_CLS2_1",
    "task": "Cancer",
    "architecture": "resnet18",
    "num_classes": 2,
    "class_mapping": {"Benign": 0, "Malignant": 1},
}


class TestDeclaredTaskArchitecture:
    """Tests that dataset_name is NEVER used as the medical task."""

    def test_1_dataset_name_not_equal_task(self, malaria_manifest_dir, valid_recs):
        """Dataset name 'cell_images' must not be used as task. Only declared_task matters."""
        profile = {"classes": ["Parasitized", "Uninfected"]}
        result = evaluate_eligibility(
            hospital_task="Malaria",  # Explicit declared_task
            hospital_dataset_profile=profile,
            manifest_dir=malaria_manifest_dir,
            job=MALARIA_JOB,
            m8_recommendation_set=valid_recs,
        )
        assert result.task_match is True
        assert result.eligible is True
        assert result.dataset_eligibility_type == "FULL_DATASET"
        # The string 'cell_images' should never appear in reasons
        for r in result.dataset_reasons:
            assert "cell_images" not in r

    def test_2_explicit_task_mismatch(self, malaria_manifest_dir, valid_recs):
        """Declared task Malaria vs job task Cancer => NOT_ELIGIBLE with clear reason."""
        profile = {"classes": ["Parasitized", "Uninfected"]}
        result = evaluate_eligibility(
            hospital_task="Malaria",
            hospital_dataset_profile=profile,
            manifest_dir=malaria_manifest_dir,
            job=CANCER_JOB,
            m8_recommendation_set=valid_recs,
        )
        assert result.eligible is False
        assert result.dataset_eligibility_type == "NOT_ELIGIBLE"
        assert result.task_match is False
        # Reason must reference semantic task names, not dataset name
        assert any('Dataset task "Malaria"' in r and 'job task "Cancer"' in r for r in result.dataset_reasons)

    def test_3_missing_task_association(self, malaria_manifest_dir, valid_recs):
        """declared_task=None => NOT_ELIGIBLE with 'task association required'."""
        profile = {"classes": ["Parasitized", "Uninfected"]}
        result = evaluate_eligibility(
            hospital_task=None,  # Not yet associated
            hospital_dataset_profile=profile,
            manifest_dir=malaria_manifest_dir,
            job=MALARIA_JOB,
            m8_recommendation_set=valid_recs,
        )
        assert result.eligible is False
        assert result.dataset_eligibility_type == "NOT_ELIGIBLE"
        assert result.task_match is False
        assert any("Task association required" in r for r in result.dataset_reasons)
        # Must NOT say 'Hospital task "cell_images"'
        for r in result.dataset_reasons:
            assert "cell_images" not in r

    def test_3b_empty_string_task_association(self, malaria_manifest_dir, valid_recs):
        """declared_task='' => NOT_ELIGIBLE with 'task association required'."""
        profile = {"classes": ["Parasitized", "Uninfected"]}
        result = evaluate_eligibility(
            hospital_task="",
            hospital_dataset_profile=profile,
            manifest_dir=malaria_manifest_dir,
            job=MALARIA_JOB,
            m8_recommendation_set=valid_recs,
        )
        assert result.eligible is False
        assert result.task_match is False
        assert any("Task association required" in r for r in result.dataset_reasons)

    def test_4_full_dataset(self, malaria_manifest_dir, valid_recs):
        """Exact class match => FULL_DATASET."""
        profile = {"classes": ["Parasitized", "Uninfected"]}
        result = evaluate_eligibility(
            hospital_task="Malaria",
            hospital_dataset_profile=profile,
            manifest_dir=malaria_manifest_dir,
            job=MALARIA_JOB,
            m8_recommendation_set=valid_recs,
        )
        assert result.eligible is True
        assert result.dataset_eligibility_type == "FULL_DATASET"
        assert result.missing_classes == []
        assert result.extra_classes == []
        assert result.train_sample_count == 100  # 50+50

    def test_5_class_subset(self, extended_malaria_manifest_dir, valid_recs):
        """Extra classes => CLASS_SUBSET. Only required classes count."""
        profile = {"classes": ["Parasitized", "Uninfected", "Vivax", "Malariae", "Ovale"]}
        result = evaluate_eligibility(
            hospital_task="Malaria",
            hospital_dataset_profile=profile,
            manifest_dir=extended_malaria_manifest_dir,
            job=MALARIA_JOB,
            m8_recommendation_set=valid_recs,
        )
        assert result.eligible is True
        assert result.dataset_eligibility_type == "CLASS_SUBSET"
        assert set(result.extra_classes) == {"Vivax", "Malariae", "Ovale"}
        assert result.train_sample_count == 60  # 30+30, extras excluded
        assert result.validation_sample_count == 16  # 8+8
        assert result.test_sample_count == 8  # 4+4

    def test_6_missing_required_class(self, malaria_manifest_dir, valid_recs):
        """Missing a required class => NOT_ELIGIBLE."""
        profile = {"classes": ["Parasitized"]}  # Missing Uninfected
        result = evaluate_eligibility(
            hospital_task="Malaria",
            hospital_dataset_profile=profile,
            manifest_dir=malaria_manifest_dir,
            job=MALARIA_JOB,
            m8_recommendation_set=valid_recs,
        )
        assert result.eligible is False
        assert result.dataset_eligibility_type == "NOT_ELIGIBLE"
        assert "Uninfected" in result.missing_classes

    def test_7_multiple_jobs_same_dataset(self, malaria_manifest_dir, valid_recs):
        """One dataset evaluated against two jobs: only matching task is eligible."""
        profile = {"classes": ["Parasitized", "Uninfected"]}

        result_mal = evaluate_eligibility(
            hospital_task="Malaria",
            hospital_dataset_profile=profile,
            manifest_dir=malaria_manifest_dir,
            job=MALARIA_JOB,
            m8_recommendation_set=valid_recs,
        )
        result_can = evaluate_eligibility(
            hospital_task="Malaria",
            hospital_dataset_profile=profile,
            manifest_dir=malaria_manifest_dir,
            job=CANCER_JOB,
            m8_recommendation_set=valid_recs,
        )

        assert result_mal.eligible is True
        assert result_can.eligible is False
        assert result_can.task_match is False

    def test_8_switch_selected_dataset(self, malaria_manifest_dir, valid_recs):
        """Switching declared_task changes eligibility for the same job."""
        profile_mal = {"classes": ["Parasitized", "Uninfected"]}
        profile_can = {"classes": ["Benign", "Malignant"]}

        # Dataset A: declared_task=Malaria
        r1 = evaluate_eligibility("Malaria", profile_mal, malaria_manifest_dir, MALARIA_JOB, valid_recs)
        r2 = evaluate_eligibility("Malaria", profile_mal, malaria_manifest_dir, CANCER_JOB, valid_recs)
        assert r1.eligible is True
        assert r2.eligible is False

        # Conceptual Dataset B: declared_task=Cancer (different profile/manifests would exist)
        # Here we test the task switch logic specifically
        r3 = evaluate_eligibility("Cancer", profile_can, malaria_manifest_dir, MALARIA_JOB, valid_recs)
        r4 = evaluate_eligibility("Cancer", profile_can, malaria_manifest_dir, CANCER_JOB, valid_recs)
        assert r3.eligible is False  # Task mismatch
        assert r3.task_match is False

    def test_9_no_mutation_during_eligibility(self, malaria_manifest_dir, tmp_path, valid_recs):
        """Evaluating eligibility must NOT create any files in the output directory."""
        output_dir = tmp_path / "output_check"
        output_dir.mkdir()
        before = set(os.listdir(str(output_dir)))

        profile = {"classes": ["Parasitized", "Uninfected"]}
        evaluate_eligibility("Malaria", profile, malaria_manifest_dir, MALARIA_JOB, valid_recs)

        after = set(os.listdir(str(output_dir)))
        assert before == after, "Eligibility evaluation must not create files"

    def test_10_hardware_incompatible(self, malaria_manifest_dir, invalid_recs):
        """Hardware incompatibility => NOT_ELIGIBLE even if task and classes match."""
        profile = {"classes": ["Parasitized", "Uninfected"]}
        result = evaluate_eligibility(
            hospital_task="Malaria",
            hospital_dataset_profile=profile,
            manifest_dir=malaria_manifest_dir,
            job=MALARIA_JOB,
            m8_recommendation_set=invalid_recs,
        )
        assert result.eligible is False
        assert result.architecture_eligible is False
        assert any("feasible" in r for r in result.architecture_reasons)

    def test_11_case_insensitive_task_match(self, malaria_manifest_dir, valid_recs):
        """Task matching is case-insensitive."""
        profile = {"classes": ["Parasitized", "Uninfected"]}
        result = evaluate_eligibility(
            hospital_task="malaria",  # lowercase
            hospital_dataset_profile=profile,
            manifest_dir=malaria_manifest_dir,
            job=MALARIA_JOB,  # task = "Malaria"
            m8_recommendation_set=valid_recs,
        )
        assert result.task_match is True
        assert result.eligible is True

    def test_12_to_dict_keys(self, malaria_manifest_dir, valid_recs):
        """Verify to_dict produces all required keys."""
        profile = {"classes": ["Parasitized", "Uninfected"]}
        result = evaluate_eligibility("Malaria", profile, malaria_manifest_dir, MALARIA_JOB, valid_recs)
        d = result.to_dict()
        required_keys = {
            "job_id", "eligible", "dataset_eligibility_type", "task_match",
            "architecture_eligible", "architecture_tier", "required_classes", "available_classes",
            "missing_classes", "extra_classes", "train_sample_count",
            "validation_sample_count", "test_sample_count", "reasons",
            "dataset_eligible", "dataset_reasons", "architecture_reasons",
            "required_architecture", "selected_architecture"
        }
        assert required_keys.issubset(set(d.keys()))
