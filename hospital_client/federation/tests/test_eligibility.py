"""
Tests for hospital_client.federation.eligibility and manifest_filter.
"""
import json
import os
import pytest
from hospital_client.federation.eligibility import evaluate_eligibility, FederationEligibilityResult
from hospital_client.federation.manifest_filter import create_job_manifests, filter_manifest


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
def sample_manifest_dir(tmp_path):
    """Create a sample M5 output directory with manifests."""
    m5 = tmp_path / "m5"
    m5.mkdir()
    
    train_records = [
        {"image_path": f"/img/parasitized_{i}.png", "label": "Parasitized"} for i in range(40)
    ] + [
        {"image_path": f"/img/uninfected_{i}.png", "label": "Uninfected"} for i in range(40)
    ] + [
        {"image_path": f"/img/leukemia_{i}.png", "label": "Leukemia"} for i in range(20)
    ]
    
    val_records = [
        {"image_path": f"/img/val_parasitized_{i}.png", "label": "Parasitized"} for i in range(10)
    ] + [
        {"image_path": f"/img/val_uninfected_{i}.png", "label": "Uninfected"} for i in range(10)
    ] + [
        {"image_path": f"/img/val_leukemia_{i}.png", "label": "Leukemia"} for i in range(5)
    ]
    
    test_records = [
        {"image_path": f"/img/test_parasitized_{i}.png", "label": "Parasitized"} for i in range(5)
    ] + [
        {"image_path": f"/img/test_uninfected_{i}.png", "label": "Uninfected"} for i in range(5)
    ] + [
        {"image_path": f"/img/test_leukemia_{i}.png", "label": "Leukemia"} for i in range(3)
    ]
    
    _write_manifest(m5 / "train_manifest.json", train_records)
    _write_manifest(m5 / "validation_manifest.json", val_records)
    _write_manifest(m5 / "test_manifest.json", test_records)
    
    # Write a dummy preprocessing_report.json
    with open(m5 / "preprocessing_report.json", "w") as f:
        json.dump({"classes": ["Parasitized", "Uninfected", "Leukemia"]}, f)
    
    return str(m5)


@pytest.fixture
def m8_recommendation_set():
    return {
        "all_model_assessments": {
            "ResNet18": {
                "feasible": True,
                "recommendation_tier": "RECOMMENDED"
            },
            "ViT_Large": {
                "feasible": False,
                "recommendation_tier": "UNKNOWN"
            },
            "MobileNetV3": {
                "feasible": True,
                "recommendation_tier": "NOT_RECOMMENDED"
            }
        }
    }


class TestEligibility:
    def test_full_dataset_eligibility(self, sample_manifest_dir, m8_recommendation_set):
        """Hospital has all required classes — FULL_DATASET."""
        job = {
            "federation_job_id": "JOB_01",
            "task": "Malaria",
            "architecture": "ResNet18",
            "num_classes": 3,
            "class_mapping": {"Parasitized": 0, "Uninfected": 1, "Leukemia": 2}
        }
        profile = {"classes": ["Parasitized", "Uninfected", "Leukemia"]}
        
        result = evaluate_eligibility(
            hospital_task="Malaria",
            hospital_dataset_profile=profile,
            manifest_dir=sample_manifest_dir,
            job=job,
            m8_recommendation_set=m8_recommendation_set
        )
        
        assert result.eligible is True
        assert result.dataset_eligible is True
        assert result.architecture_eligible is True
        assert result.dataset_eligibility_type == "FULL_DATASET"
        assert result.architecture_tier == "RECOMMENDED"
        assert result.task_match is True
        assert result.missing_classes == []
        assert result.extra_classes == []
        assert result.train_sample_count == 100  # 40+40+20
    
    def test_class_subset_eligibility(self, sample_manifest_dir, m8_recommendation_set):
        """Hospital has extra classes beyond what the job needs — CLASS_SUBSET."""
        job = {
            "federation_job_id": "JOB_02",
            "task": "Malaria",
            "architecture": "ResNet18",
            "num_classes": 2,
            "class_mapping": {"Parasitized": 0, "Uninfected": 1}
        }
        profile = {"classes": ["Parasitized", "Uninfected", "Leukemia"]}
        
        result = evaluate_eligibility(
            hospital_task="Malaria",
            hospital_dataset_profile=profile,
            manifest_dir=sample_manifest_dir,
            job=job,
            m8_recommendation_set=m8_recommendation_set
        )
        
        assert result.eligible is True
        assert result.dataset_eligibility_type == "CLASS_SUBSET"
        assert result.extra_classes == ["Leukemia"]
        assert result.train_sample_count == 80  # 40+40, Leukemia excluded

    def test_missing_classes_not_eligible(self, sample_manifest_dir, m8_recommendation_set):
        """Hospital is missing required classes — NOT_ELIGIBLE."""
        job = {
            "federation_job_id": "JOB_03",
            "task": "Malaria",
            "architecture": "ResNet18",
            "num_classes": 2,
            "class_mapping": {"Parasitized": 0, "COVID": 1}
        }
        profile = {"classes": ["Parasitized", "Uninfected", "Leukemia"]}
        
        result = evaluate_eligibility(
            hospital_task="Malaria",
            hospital_dataset_profile=profile,
            manifest_dir=sample_manifest_dir,
            job=job,
            m8_recommendation_set=m8_recommendation_set
        )
        
        assert result.eligible is False
        assert result.dataset_eligible is False
        assert result.dataset_eligibility_type == "NOT_ELIGIBLE"
        assert "COVID" in result.missing_classes
        assert result.architecture_eligible is False
        assert result.architecture_tier == "NOT_EVALUATED"

    def test_task_mismatch_not_eligible(self, sample_manifest_dir, m8_recommendation_set):
        """Task mismatch — NOT_ELIGIBLE."""
        job = {
            "federation_job_id": "JOB_04",
            "task": "Pneumonia",
            "architecture": "ResNet18",
            "num_classes": 2,
            "class_mapping": {"Parasitized": 0, "Uninfected": 1}
        }
        profile = {"classes": ["Parasitized", "Uninfected", "Leukemia"]}
        
        result = evaluate_eligibility(
            hospital_task="Malaria",
            hospital_dataset_profile=profile,
            manifest_dir=sample_manifest_dir,
            job=job,
            m8_recommendation_set=m8_recommendation_set
        )
        
        assert result.eligible is False
        assert result.task_match is False
        assert result.dataset_eligible is False
        assert result.architecture_tier == "NOT_EVALUATED"

    def test_hardware_incompatible_not_eligible(self, sample_manifest_dir, m8_recommendation_set):
        """Hardware incompatible — NOT_ELIGIBLE."""
        job = {
            "federation_job_id": "JOB_05",
            "task": "Malaria",
            "architecture": "ViT_Large",
            "num_classes": 2,
            "class_mapping": {"Parasitized": 0, "Uninfected": 1}
        }
        profile = {"classes": ["Parasitized", "Uninfected", "Leukemia"]}
        
        result = evaluate_eligibility(
            hospital_task="Malaria",
            hospital_dataset_profile=profile,
            manifest_dir=sample_manifest_dir,
            job=job,
            m8_recommendation_set=m8_recommendation_set
        )
        
        assert result.dataset_eligible is True
        assert result.architecture_eligible is False
        assert result.eligible is False
        assert result.architecture_tier == "UNKNOWN"
        assert any("feasible" in r for r in result.architecture_reasons)

    def test_architecture_not_recommended(self, sample_manifest_dir, m8_recommendation_set):
        """Hardware is feasible but tier is NOT_RECOMMENDED."""
        job = {
            "federation_job_id": "JOB_06",
            "task": "Malaria",
            "architecture": "MobileNetV3",
            "num_classes": 2,
            "class_mapping": {"Parasitized": 0, "Uninfected": 1}
        }
        profile = {"classes": ["Parasitized", "Uninfected", "Leukemia"]}
        
        result = evaluate_eligibility(
            hospital_task="Malaria",
            hospital_dataset_profile=profile,
            manifest_dir=sample_manifest_dir,
            job=job,
            m8_recommendation_set=m8_recommendation_set
        )
        
        assert result.dataset_eligible is True
        assert result.architecture_eligible is False
        assert result.eligible is False
        assert result.architecture_tier == "NOT_RECOMMENDED"

    def test_to_dict(self, sample_manifest_dir, m8_recommendation_set):
        """Verify to_dict produces the right keys."""
        job = {
            "federation_job_id": "JOB_07",
            "task": "Malaria",
            "architecture": "ResNet18",
            "num_classes": 2,
            "class_mapping": {"Parasitized": 0, "Uninfected": 1}
        }
        profile = {"classes": ["Parasitized", "Uninfected"]}
        
        result = evaluate_eligibility(
            hospital_task="Malaria",
            hospital_dataset_profile=profile,
            manifest_dir=sample_manifest_dir,
            job=job,
            m8_recommendation_set=m8_recommendation_set
        )
        
        d = result.to_dict()
        assert "eligible" in d
        assert "dataset_eligibility_type" in d
        assert "architecture_tier" in d
        assert "train_sample_count" in d
        assert "reasons" in d


class TestManifestFilter:
    def test_filter_manifest_keeps_only_required_classes(self, tmp_path):
        records = [
            {"image_path": "/a.png", "label": "Cat"},
            {"image_path": "/b.png", "label": "Dog"},
            {"image_path": "/c.png", "label": "Cat"},
            {"image_path": "/d.png", "label": "Bird"},
        ]
        in_path = str(tmp_path / "input.json")
        out_path = str(tmp_path / "output.json")
        _write_manifest(in_path, records)
        
        count = filter_manifest(in_path, out_path, ["Cat", "Dog"])
        assert count == 3
        
        with open(out_path) as f:
            result = json.load(f)
        assert result["total_records"] == 3
        labels = [r["label"] for r in result["records"]]
        assert "Bird" not in labels

    def test_filter_manifest_missing_file_returns_zero(self, tmp_path):
        count = filter_manifest(str(tmp_path / "missing.json"), str(tmp_path / "out.json"), ["Cat"])
        assert count == 0

    def test_create_job_manifests_creates_correct_structure(self, sample_manifest_dir, tmp_path):
        class_mapping = {"Parasitized": 0, "Uninfected": 1}
        output_base = str(tmp_path / "federation_runs")
        
        run_dir, counts = create_job_manifests(
            job_id="JOB_TEST",
            original_manifest_dir=sample_manifest_dir,
            output_base_dir=output_base,
            class_mapping=class_mapping
        )
        
        assert os.path.isdir(run_dir)
        assert "JOB_TEST" in run_dir
        
        # Verify M7-compatible manifest names exist
        assert os.path.isfile(os.path.join(run_dir, "train_manifest.json"))
        assert os.path.isfile(os.path.join(run_dir, "validation_manifest.json"))
        assert os.path.isfile(os.path.join(run_dir, "test_manifest.json"))
        
        # Verify preprocessing_report.json was copied
        assert os.path.isfile(os.path.join(run_dir, "preprocessing_report.json"))
        
        # Verify run_metadata.json
        assert os.path.isfile(os.path.join(run_dir, "run_metadata.json"))
        with open(os.path.join(run_dir, "run_metadata.json")) as f:
            meta = json.load(f)
        assert meta["job_id"] == "JOB_TEST"
        assert meta["class_mapping"] == class_mapping
        
        # Verify filtered counts (Leukemia excluded)
        assert counts["train"] == 80  # 40 parasitized + 40 uninfected
        assert counts["val"] == 20    # 10 + 10
        assert counts["test"] == 10   # 5 + 5

    def test_create_job_manifests_excludes_extra_classes(self, sample_manifest_dir, tmp_path):
        """Ensure excluded classes never appear in filtered manifests."""
        class_mapping = {"Parasitized": 0, "Uninfected": 1}
        output_base = str(tmp_path / "federation_runs")
        
        run_dir, counts = create_job_manifests(
            job_id="JOB_SUBSET",
            original_manifest_dir=sample_manifest_dir,
            output_base_dir=output_base,
            class_mapping=class_mapping
        )
        
        # Check train manifest has no Leukemia
        with open(os.path.join(run_dir, "train_manifest.json")) as f:
            train = json.load(f)
        labels = {r["label"] for r in train["records"]}
        assert "Leukemia" not in labels
        assert labels == {"Parasitized", "Uninfected"}
