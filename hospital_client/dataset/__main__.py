
import argparse
import json
import sys
from hospital_client.dataset.ingestion.dataset_detector import detect_and_ingest
from hospital_client.dataset.ingestion.report_generator import generate_reports
from hospital_client.dataset.ingestion.metadata_labels import ImageLabelSource

def main():
    parser = argparse.ArgumentParser(description="Module 4: Dataset Ingestion and Inspection")
    subparsers = parser.add_subparsers(dest="command", required=True)
    
    inspect_parser = subparsers.add_parser("inspect", help="Inspect a dataset")
    inspect_parser.add_argument("dataset_path", help="Path to the dataset (directory for images, file for CSV/Excel)")
    inspect_parser.add_argument("--output", default=".", help="Directory to save the generated reports")
    labels = inspect_parser.add_argument_group("image labels from a metadata CSV (instead of class folder names)")
    labels.add_argument("--labels-csv", default=None, help="CSV with one row per image")
    labels.add_argument("--image-column", default=None, help="Column holding the image file name, id (name without extension) or relative path")
    labels.add_argument("--label-column", default=None, help="Column holding each image's class")
    labels.add_argument("--group-column", default=None, help="Optional lesion/patient id column, used by Module 5 for grouped splitting")
    labels.add_argument("--label-map", default=None, help='Optional JSON {"raw value": "class name" or null to exclude}')

    args = parser.parse_args()

    if args.command == "inspect":
        print(f"Starting inspection for: {args.dataset_path}")
        try:
            label_source = None
            if args.labels_csv:
                if not (args.image_column and args.label_column):
                    raise ValueError("--labels-csv needs --image-column and --label-column.")
                label_map = json.loads(args.label_map) if args.label_map else None
                if label_map is not None and not (isinstance(label_map, dict) and all(
                        isinstance(k, str) and (v is None or isinstance(v, str)) for k, v in label_map.items())):
                    raise ValueError('--label-map must be a JSON object of {"raw value": "class name" or null}.')
                label_source = ImageLabelSource(args.labels_csv, args.image_column, args.label_column,
                                                args.group_column, label_map)
            profile = detect_and_ingest(args.dataset_path, label_source)
            generate_reports(profile, args.output)
            print(f"Inspection complete. Reports generated in: {args.output}")
            if profile.errors:
                print(f"WARNING: Encountered {len(profile.errors)} errors during inspection.")
            sys.exit(0)
        except Exception as e:
            print(f"FATAL ERROR: {str(e)}")
            sys.exit(1)

if __name__ == "__main__":
    main()

