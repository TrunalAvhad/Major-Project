import os
import json
from dataclasses import dataclass
from typing import List, Dict, Any, Optional

ACCEPTED_TIERS = {
    "RECOMMENDED", "RECOMMENDED_ALTERNATIVE", 
    "FAST", "FAST_ALTERNATIVE", 
    "HIGH_CAPACITY", "HIGH_CAPACITY_ALTERNATIVE"
}

@dataclass
class FederationEligibilityResult:
    job_id: str
    
    dataset_eligible: bool
    dataset_eligibility_type: str  # 'FULL_DATASET', 'CLASS_SUBSET', 'NOT_ELIGIBLE'
    dataset_reasons: List[str]
    
    architecture_eligible: bool
    architecture_tier: str
    architecture_reasons: List[str]
    
    required_architecture: str
    selected_architecture: Optional[str]
    
    eligible: bool
    
    # Dataset statistics
    task_match: bool
    required_classes: List[str]
    available_classes: List[str]
    missing_classes: List[str]
    extra_classes: List[str]
    train_sample_count: int
    validation_sample_count: int
    test_sample_count: int

    def to_dict(self):
        return {
            "job_id": self.job_id,
            "dataset_eligible": self.dataset_eligible,
            "dataset_eligibility_type": self.dataset_eligibility_type,
            "dataset_reasons": self.dataset_reasons,
            "architecture_eligible": self.architecture_eligible,
            "architecture_tier": self.architecture_tier,
            "architecture_reasons": self.architecture_reasons,
            "required_architecture": self.required_architecture,
            "selected_architecture": self.selected_architecture,
            "eligible": self.eligible,
            "task_match": self.task_match,
            "required_classes": self.required_classes,
            "available_classes": self.available_classes,
            "missing_classes": self.missing_classes,
            "extra_classes": self.extra_classes,
            "train_sample_count": self.train_sample_count,
            "validation_sample_count": self.validation_sample_count,
            "test_sample_count": self.test_sample_count,
            "reasons": self.dataset_reasons + self.architecture_reasons  # For backward compat in UI mapping
        }

def _count_samples(manifest_path: str, required_classes: List[str]) -> int:
    if not os.path.exists(manifest_path):
        return 0
    with open(manifest_path, 'r') as f:
        manifest = json.load(f)
    if "records" not in manifest:
        return 0
    req_set = set(required_classes)
    return sum(1 for r in manifest["records"] if r.get("label") in req_set)

def evaluate_eligibility(
    hospital_task,
    hospital_dataset_profile: Dict[str, Any],
    manifest_dir: str,
    job: Dict[str, Any],
    m8_recommendation_set: Dict[str, Any]
) -> FederationEligibilityResult:
    """
    Evaluates eligibility sequentially: Dataset Eligibility -> Architecture Eligibility.
    """
    dataset_reasons = []
    
    # 1. Dataset Eligibility
    if hospital_task is None or (isinstance(hospital_task, str) and not hospital_task.strip()):
        task_match = False
        dataset_reasons.append("Task association required. This dataset has not been associated with a federation task.")
    else:
        task_match = hospital_task.strip().lower() == job["task"].strip().lower()
        if not task_match:
            dataset_reasons.append(f'Dataset task "{hospital_task}" does not match job task "{job["task"]}".')

    required_classes = list(job.get("class_mapping", {}).keys())
    available_classes = hospital_dataset_profile.get("classes", [])
    
    missing_classes = [c for c in required_classes if c not in available_classes]
    extra_classes = [c for c in available_classes if c not in required_classes]
    
    if missing_classes:
        dataset_reasons.append(f"Missing required classes: {missing_classes}")
        
    train_count = _count_samples(os.path.join(manifest_dir, "train_manifest.json"), required_classes)
    val_count = _count_samples(os.path.join(manifest_dir, "validation_manifest.json"), required_classes)
    test_count = _count_samples(os.path.join(manifest_dir, "test_manifest.json"), required_classes)
    
    if train_count == 0 and task_match and not missing_classes:
        dataset_reasons.append("Filtered train dataset has 0 samples.")
        
    dataset_eligible = task_match and not missing_classes and train_count > 0
    
    dataset_eligibility_type = "NOT_ELIGIBLE"
    if dataset_eligible:
        if extra_classes:
            dataset_eligibility_type = "CLASS_SUBSET"
            dataset_reasons.append(f"Eligible using class subset. Extra classes will be excluded: {extra_classes}")
        else:
            dataset_eligibility_type = "FULL_DATASET"

    # 2. Architecture Eligibility (Gated by Dataset Eligibility)
    job_arch = job.get("architecture")
    architecture_reasons = []
    
    if not dataset_eligible:
        architecture_eligible = False
        architecture_tier = "NOT_EVALUATED"
        selected_architecture = None
    else:
        all_assessments = m8_recommendation_set.get("all_model_assessments", {})
        assessment = all_assessments.get(job_arch)
        
        if not assessment:
            architecture_eligible = False
            architecture_tier = "NOT_EVALUATED"
            architecture_reasons.append("Required architecture was not evaluated by M8.")
            selected_architecture = None
        elif not assessment.get("feasible"):
            architecture_eligible = False
            architecture_tier = assessment.get("recommendation_tier", "UNKNOWN")
            architecture_reasons.append("Required architecture is not technically feasible on this hardware.")
            selected_architecture = None
        else:
            tier = assessment.get("recommendation_tier")
            if tier in ACCEPTED_TIERS:
                architecture_eligible = True
                architecture_tier = tier
                selected_architecture = job_arch
            else:
                architecture_eligible = False
                architecture_tier = tier or "UNKNOWN"
                architecture_reasons.append(f"Required architecture is not in an accepted M8 recommendation tier (Tier: {architecture_tier}).")
                selected_architecture = None

    # 3. Final Eligibility
    final_eligible = dataset_eligible and architecture_eligible

    return FederationEligibilityResult(
        job_id=job.get("federation_job_id", ""),
        dataset_eligible=dataset_eligible,
        dataset_eligibility_type=dataset_eligibility_type,
        dataset_reasons=dataset_reasons,
        architecture_eligible=architecture_eligible,
        architecture_tier=architecture_tier,
        architecture_reasons=architecture_reasons,
        required_architecture=job_arch,
        selected_architecture=selected_architecture,
        eligible=final_eligible,
        task_match=task_match,
        required_classes=required_classes,
        available_classes=available_classes,
        missing_classes=missing_classes,
        extra_classes=extra_classes,
        train_sample_count=train_count,
        validation_sample_count=val_count,
        test_sample_count=test_count
    )
