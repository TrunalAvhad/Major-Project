"""
Module 4: image labels (and lesion/patient groups) from a metadata CSV, for image
datasets that are not sorted into class folders (ISIC-style: one image folder +
a CSV). Synthetic data only.
"""
import json
import os
import subprocess
import sys

import pandas as pd
import pytest
from PIL import Image

from hospital_client.dataset.ingestion.dataset_detector import detect_and_ingest
from hospital_client.dataset.ingestion.image_ingestor import ingest_image_dataset
from hospital_client.dataset.ingestion.metadata_labels import ImageLabelSource, label_value_counts

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
LABEL_MAP = {"MEL": "malignant", "BCC": "malignant", "NV": "benign", "UNK": None}


def make_isic_like(root, n=12):
    """root/images/ISIC_<i>.jpg plus root/metadata.csv (ids without extension)."""
    img_dir = root / "images"
    img_dir.mkdir(parents=True)
    rows = []
    for i in range(n):
        Image.new("RGB", (16, 16), color=(i * 20 % 256, i * 7 % 256, 90)).save(img_dir / f"ISIC_{i:04d}.jpg")
        diagnosis = ["MEL", "NV", "NV", "BCC"][i % 4] if i < n - 2 else "UNK"
        rows.append({"isic_id": f"ISIC_{i:04d}", "diagnosis": diagnosis, "lesion_id": f"IL_{i // 2}"})
    rows.append({"isic_id": "ISIC_9999", "diagnosis": "NV", "lesion_id": "IL_X"})      # no such image
    Image.new("RGB", (16, 16), color=(1, 2, 3)).save(img_dir / "ISIC_8888.jpg")      # image with no row
    pd.DataFrame(rows).to_csv(root / "metadata.csv", index=False)
    return root


def source(root, **kw):
    args = dict(csv_path=str(root / "metadata.csv"), image_column="isic_id", label_column="diagnosis",
                group_column="lesion_id", label_map=LABEL_MAP)
    args.update(kw)
    return ImageLabelSource(**args)


def test_classes_come_from_the_csv_and_every_image_is_accounted_for(tmp_path):
    root = make_isic_like(tmp_path / "isic")
    profile = ingest_image_dataset(str(root), source(root))

    assert profile.classes == ["benign", "malignant"]                 # not the folder name "images"
    assert profile.class_distribution == {"malignant": 5, "benign": 5}
    s = profile.label_source["summary"]
    assert s["labelled_images"] == 10 and s["images_excluded_by_label_map"] == 2
    assert s["images_without_label"] == 1 and s["rows_without_matching_image"] == 1
    assert s["labelled_images"] + s["images_excluded_by_label_map"] + s["images_without_label"] == profile.total_samples
    assert s["groups"] == 5 and s["labelled_images_without_group"] == 0
    assert not any("Unsupported" in e for e in profile.errors)         # the CSV itself is not a stray file
    d = profile.to_dict()
    assert d["label_source"]["label_column"] == "diagnosis" and d["label_source"]["label_map"] == LABEL_MAP


def test_folder_labelled_profiles_are_unchanged(tmp_path):
    for c in ("benign", "malignant"):
        (tmp_path / "ds" / c).mkdir(parents=True)
        Image.new("RGB", (8, 8)).save(tmp_path / "ds" / c / "a.jpg")
    profile = detect_and_ingest(str(tmp_path / "ds"))
    assert profile.classes == ["benign", "malignant"]
    assert "label_source" not in profile.to_dict()


def test_without_a_label_map_the_raw_values_are_the_classes(tmp_path):
    root = make_isic_like(tmp_path / "isic")
    profile = ingest_image_dataset(str(root), source(root, label_map=None, group_column=None))
    assert profile.classes == ["BCC", "MEL", "NV", "UNK"]
    assert profile.label_source["summary"]["groups"] is None


@pytest.mark.parametrize("change, message", [
    ({"label_map": {"MEL": "malignant"}}, "not in the label map"),
    ({"label_map": {**LABEL_MAP, "NV": "../escape"}}, "not allowed"),
    ({"image_column": "lesion_id", "group_column": None}, "None of the"),
    ({"label_column": "nope"}, "not found in metadata CSV"),
    ({"group_column": "isic_id"}, "must be different"),
])
def test_bad_configuration_is_refused_not_guessed(tmp_path, change, message):
    root = make_isic_like(tmp_path / "isic")
    with pytest.raises(ValueError, match=message):
        ingest_image_dataset(str(root), source(root, **change))


def test_conflicting_or_ambiguous_rows_are_refused(tmp_path):
    root = make_isic_like(tmp_path / "isic")
    df = pd.read_csv(root / "metadata.csv")
    pd.concat([df, pd.DataFrame([{"isic_id": "ISIC_0001", "diagnosis": "MEL", "lesion_id": "IL_0"}])]) \
        .to_csv(root / "metadata.csv", index=False)
    with pytest.raises(ValueError, match="different labels"):
        ingest_image_dataset(str(root), source(root))

    root2 = make_isic_like(tmp_path / "isic2")
    Image.new("RGB", (8, 8)).save(root2 / "images" / "ISIC_0001.png")   # same id, two files
    with pytest.raises(ValueError, match="more than one file"):
        ingest_image_dataset(str(root2), source(root2))


def test_label_value_counts_reads_distinct_values(tmp_path):
    root = make_isic_like(tmp_path / "isic")
    assert label_value_counts(str(root / "metadata.csv"), "diagnosis") == {"NV": 6, "MEL": 3, "BCC": 2, "UNK": 2}


def test_cli_records_the_label_source_in_the_profile(tmp_path):
    root = make_isic_like(tmp_path / "isic")
    out = tmp_path / "out"
    res = subprocess.run([sys.executable, "-m", "hospital_client.dataset", "inspect", str(root), "--output", str(out),
                          "--labels-csv", str(root / "metadata.csv"), "--image-column", "isic_id",
                          "--label-column", "diagnosis", "--group-column", "lesion_id",
                          "--label-map", json.dumps(LABEL_MAP)], cwd=REPO, capture_output=True, text=True)
    assert res.returncode == 0, res.stdout + res.stderr
    profile = json.loads((out / "dataset_profile.json").read_text())
    assert profile["classes"] == ["benign", "malignant"] and profile["label_source"]["group_column"] == "lesion_id"
    assert "Labels From Metadata CSV" in (out / "dataset_report.md").read_text()

    bad = subprocess.run([sys.executable, "-m", "hospital_client.dataset", "inspect", str(root), "--output", str(out),
                          "--labels-csv", str(root / "metadata.csv")], cwd=REPO, capture_output=True, text=True)
    assert bad.returncode == 1 and "needs --image-column" in bad.stdout
