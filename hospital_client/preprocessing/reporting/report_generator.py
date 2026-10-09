import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional
from hospital_client.preprocessing.config import PreprocessingConfig

class ReportGenerator:
    def __init__(self, output_dir: str):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    def generate_report(
        self,
        quarantine_summary: Dict[str, int],
        config: PreprocessingConfig,
        splits_map: Dict[str, List[Any]],
        split_validation: Optional[Dict[str, Any]] = None,
        label_source: Optional[Dict[str, Any]] = None,
    ):
        report_data = {
            "generated_at": datetime.utcnow().isoformat(),
            "config": {
                "output_mode": config.dataset.output_mode.value,
                "split_strategy": config.split.strategy.value
            },
            "quarantine": quarantine_summary,
            "splits": {k: len(v) for k, v in splits_map.items()}
        }
        if split_validation is not None:
            # Existing train/validation/test split inspection result (see
            # splitting/split_validation.py). Contains only counts, class
            # names, relative paths, and status - no raw medical data.
            report_data["split_validation"] = split_validation
        if label_source is not None:
            # Image labels from a metadata CSV: columns, label map, match counts and
            # per-split class counts. Counts only - no ids, paths or CSV rows.
            report_data["label_source"] = label_source

        # Verify reconciliation
        accepted = len(splits_map.get("train", [])) + len(splits_map.get("validation", [])) + len(splits_map.get("test", []))
        report_data["reconciliation"] = {
            "accepted_samples": accepted,
            "quarantine_accepted": quarantine_summary["accepted"],
            "is_balanced": accepted == quarantine_summary["accepted"]
        }
        
        json_path = os.path.join(self.output_dir, "preprocessing_report.json")
        with open(json_path, "w") as f:
            json.dump(report_data, f, indent=2)
            
        md_path = os.path.join(self.output_dir, "preprocessing_report.md")
        with open(md_path, "w") as f:
            f.write(f"# Module 5 Preprocessing Report\n\n")
            f.write(f"Generated at: {report_data['generated_at']}\n\n")
            f.write(f"## Dataset Output Mode: {report_data['config']['output_mode']}\n")
            f.write(f"## Splits Summary\n")
            for k, v in report_data["splits"].items():
                f.write(f"- **{k}**: {v} samples\n")
            f.write(f"\n## Quarantine Summary\n")
            for k, v in report_data["quarantine"].items():
                f.write(f"- **{k}**: {v}\n")
            f.write(f"\n## Reconciliation\n")
            f.write(f"Accepted Output Samples: {accepted}\n")
            f.write(f"Quarantine Accepted Samples: {quarantine_summary['accepted']}\n")
            f.write(f"Reconciled: {report_data['reconciliation']['is_balanced']}\n")
            if split_validation is not None:
                f.write(f"\n## Existing Split Validation\n")
                f.write(f"- **Status**: {split_validation['status']}\n")
                f.write(f"- **Detected splits**: {split_validation['detected_splits']}\n")
                f.write(f"- **Split counts**: {split_validation['split_counts']}\n")
                if split_validation['empty_splits']:
                    f.write(f"- **Empty splits**: {split_validation['empty_splits']}\n")
                if split_validation['duplicate_leakage']:
                    f.write(f"- **Cross-split duplicate leakage**: {split_validation['duplicate_leakage']}\n")
                f.write(f"- **Group/patient leakage**: {split_validation['group_leakage']}\n")
                if split_validation['class_distribution_warnings']:
                    f.write(f"- **Class distribution warnings**: {split_validation['class_distribution_warnings']}\n")
                if split_validation['reasons']:
                    f.write(f"- **Reasons**: {split_validation['reasons']}\n")
            if label_source is not None:
                f.write(f"\n## Labels From Metadata CSV\n")
                f.write(f"- **CSV**: {label_source['csv_file']} (image `{label_source['image_column']}`, "
                        f"label `{label_source['label_column']}`, group `{label_source['group_column']}`)\n")
                f.write(f"- **Label map**: {label_source['label_map']}\n")
                f.write(f"- **Grouped (lesion/patient-level) split**: {label_source['grouped_split']}\n")
                f.write(f"- **Match summary**: {label_source['summary']}\n")
                for split_name, counts in label_source["class_distribution_per_split"].items():
                    f.write(f"- **{split_name} classes**: {counts}\n")

