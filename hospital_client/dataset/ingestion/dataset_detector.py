
import os
from hospital_client.dataset.ingestion.image_ingestor import ingest_image_dataset
from hospital_client.dataset.ingestion.tabular_ingestor import ingest_tabular_dataset
from hospital_client.dataset.ingestion.excel_ingestor import ingest_excel_dataset

def detect_and_ingest(dataset_path: str, label_source=None):
    """label_source: optional ImageLabelSource - image labels from a metadata CSV instead of folder names."""
    if not os.path.exists(dataset_path):
        raise ValueError("Dataset path does not exist.")
    if label_source is not None and not os.path.isdir(dataset_path):
        raise ValueError("Labels from a metadata CSV apply to image folders only.")

    if os.path.isdir(dataset_path):
        # Assume Image Dataset directory structure
        return ingest_image_dataset(dataset_path, label_source)
    elif os.path.isfile(dataset_path):
        ext = os.path.splitext(dataset_path)[1].lower()
        if ext == ".csv":
            return ingest_tabular_dataset(dataset_path)
        elif ext in {".xls", ".xlsx"}:
            return ingest_excel_dataset(dataset_path)
        else:
            raise ValueError(f"Unsupported file format: {ext}")

