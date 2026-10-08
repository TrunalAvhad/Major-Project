import os
import json
import shutil
import uuid
from typing import List, Dict, Any, Tuple

def filter_manifest(input_path: str, output_path: str, required_classes: List[str]) -> int:
    if not os.path.exists(input_path):
        return 0
        
    with open(input_path, 'r') as f:
        manifest = json.load(f)
        
    if "records" not in manifest:
        return 0
        
    req_set = set(required_classes)
    filtered_records = [r for r in manifest["records"] if r.get("label") in req_set]
    
    manifest["records"] = filtered_records
    manifest["total_records"] = len(filtered_records)
    
    with open(output_path, 'w') as f:
        json.dump(manifest, f, indent=2)
        
    return len(filtered_records)

def create_job_manifests(
    job_id: str,
    original_manifest_dir: str,
    output_base_dir: str,
    class_mapping: Dict[str, int]
) -> Tuple[str, Dict[str, int]]:
    """
    Creates job-specific manifests for a federation run.
    Output filenames match M7 dataloader expectations:
        train_manifest.json, validation_manifest.json, test_manifest.json
    Returns the run directory and a dictionary of filtered sample counts.
    """
    run_id = f"run_{uuid.uuid4().hex[:8]}"
    run_dir = os.path.join(output_base_dir, job_id, run_id)
    os.makedirs(run_dir, exist_ok=True)
    
    required_classes = list(class_mapping.keys())
    
    # M7 dataloader expects these exact filenames
    split_map = {
        "train": "train_manifest.json",
        "val": "validation_manifest.json",
        "test": "test_manifest.json",
    }
    
    counts = {}
    for split_key, out_name in split_map.items():
        # Source manifests: M5 uses train_manifest.json, validation_manifest.json, test_manifest.json
        if split_key == "val":
            in_name = "validation_manifest.json"
        else:
            in_name = f"{split_key}_manifest.json"
        in_path = os.path.join(original_manifest_dir, in_name)
        out_path = os.path.join(run_dir, out_name)
        counts[split_key] = filter_manifest(in_path, out_path, required_classes)
    
    # Copy preprocessing_report.json so M8 dataset inspection works in run_dir
    preprocess_report = os.path.join(original_manifest_dir, "preprocessing_report.json")
    if os.path.exists(preprocess_report):
        shutil.copy2(preprocess_report, os.path.join(run_dir, "preprocessing_report.json"))
        
    run_metadata = {
        "job_id": job_id,
        "run_id": run_id,
        "class_mapping": class_mapping,
        "counts": counts
    }
    
    with open(os.path.join(run_dir, "run_metadata.json"), 'w') as f:
        json.dump(run_metadata, f, indent=2)
        
    return run_dir, counts

