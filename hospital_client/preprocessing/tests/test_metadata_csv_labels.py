"""
Module 4 -> Module 5 with image labels from a metadata CSV (ISIC-style). Runs the
real Module 4 ingestion, then the Module 5 engine on its profile, and checks the
labels, lesion-level (grouped) splitting, sample accounting and source immutability.
"""
import hashlib
import json
import os

import pandas as pd
import pytest
from PIL import Image

from hospital_client.dataset.ingestion.image_ingestor import ingest_image_dataset
from hospital_client.dataset.ingestion.metadata_labels import ImageLabelSource
from hospital_client.preprocessing.config import OutputMode, PreprocessingConfig
from hospital_client.preprocessing.engine import PreprocessingEngine

LABEL_MAP = {"MEL": "malignant", "NV": "benign", "UNK": None}


def make_dataset(root, lesions=40, per_lesion=3, missing_group=False):
    (root / "images").mkdir(parents=True)
    rows, n = [], 0
    for lesion in range(lesions):
        diagnosis = "MEL" if lesion % 3 == 0 else "NV"
        for _ in range(per_lesion):
            Image.new("RGB", (16, 16), color=(n % 256, (n * 7) % 256, (n * 13) % 256)).save(root / "images" / f"IMG_{n:04d}.jpg")
            rows.append({"image": f"IMG_{n:04d}", "dx": diagnosis, "lesion": "" if missing_group and n == 0 else f"L{lesion}"})
            n += 1
    Image.new("RGB", (16, 16), color=(250, 1, 1)).save(root / "images" / "IMG_UNK.jpg")
    rows.append({"image": "IMG_UNK", "dx": "UNK", "lesion": "LU"})
    Image.new("RGB", (16, 16), color=(1, 250, 1)).save(root / "images" / "IMG_NOROW.jpg")
    pd.DataFrame(rows).to_csv(root / "meta.csv", index=False)
    return root, n


def run(tmp_path, root, mode=OutputMode.LAZY, group="lesion"):
    src = ImageLabelSource(str(root / "meta.csv"), "image", "dx", group, LABEL_MAP)
    profile_path = tmp_path / "profile.json"
    profile_path.write_text(json.dumps(ingest_image_dataset(str(root), src).to_dict()))
    config = PreprocessingConfig()
    config.dataset.input_path = str(root)
    config.dataset.output_path = str(tmp_path / "m5")
    config.dataset.output_mode = mode
    PreprocessingEngine(config).run(str(profile_path))
    out = tmp_path / "m5"
    manifests = {s: json.loads((out / f"{s}_manifest.json").read_text()) for s in ("train", "validation", "test")}
    return manifests, json.loads((out / "preprocessing_report.json").read_text())


def tree_hash(root):
    h = hashlib.sha256()
    for path in sorted(p for p in root.rglob("*") if p.is_file()):
        h.update(str(path.relative_to(root)).encode())
        h.update(path.read_bytes())
    return h.hexdigest()


def test_labels_come_from_the_csv_and_no_lesion_spans_two_splits(tmp_path):
    root, n = make_dataset(tmp_path / "ds")
    before = tree_hash(root)
    manifests, report = run(tmp_path, root)

    records = [r for m in manifests.values() for r in m["records"]]
    assert len(records) == n                                            # every labelled image, once
    assert {r["label"] for r in records} == {"benign", "malignant"}
    assert all(r["subtype"] == ("MEL" if r["label"] == "malignant" else "NV") for r in records)  # raw value kept
    assert all(m["records"] for m in manifests.values())                # all three splits used

    lesions = pd.read_csv(root / "meta.csv").set_index("image")["lesion"]
    split_of = {}
    for split, m in manifests.items():
        for r in m["records"]:
            lesion = lesions[os.path.splitext(os.path.basename(r["rel_path"]))[0]]
            assert split_of.setdefault(lesion, split) == split           # lesion-level split, no leakage

    q = report["quarantine"]
    assert q["accepted"] == n and q["rejected"] == 2                    # UNK (excluded) + image with no row
    assert q["total_discovered"] == n + 2                               # the CSV file is not a sample
    assert report["reconciliation"]["is_balanced"]
    ls = report["label_source"]
    assert ls["grouped_split"] and ls["label_column"] == "dx" and ls["csv_file"] == "meta.csv"
    assert sum(sum(c.values()) for c in ls["class_distribution_per_split"].values()) == n
    assert report["config"]["split_strategy"] == "grouped"
    assert tree_hash(root) == before                                    # source never modified


def test_materialized_output_uses_the_csv_class_names(tmp_path):
    root, n = make_dataset(tmp_path / "ds", lesions=12)
    manifests, _ = run(tmp_path, root, mode=OutputMode.MATERIALIZED)
    out = tmp_path / "m5"
    for split, m in manifests.items():
        for r in m["records"]:
            assert os.path.commonpath([str(out), r["processed_path"]]) == str(out)
            assert os.path.basename(os.path.dirname(r["processed_path"])) == r["label"]


def test_without_a_group_column_the_split_is_stratified(tmp_path):
    root, n = make_dataset(tmp_path / "ds")
    manifests, report = run(tmp_path, root, group=None)
    assert report["config"]["split_strategy"] == "stratified" and not report["label_source"]["grouped_split"]
    assert sum(m["total_records"] for m in manifests.values()) == n


def test_a_labelled_image_without_a_lesion_id_stops_grouped_splitting(tmp_path):
    root, _ = make_dataset(tmp_path / "ds", missing_group=True)
    with pytest.raises(ValueError, match="metadata CSV group column"):
        run(tmp_path, root)


def test_train_and_test_folders_get_a_validation_split_carved_from_train_by_lesion(tmp_path):
    """train/ and test/ folders, labels from the CSV: test is kept exactly, validation comes out of train."""
    root = tmp_path / "ds"
    rows, n = [], 0
    for split, lesions in (("train", range(0, 30)), ("test", range(30, 40))):
        (root / split).mkdir(parents=True)
        for lesion in lesions:
            for _ in range(2):
                Image.new("RGB", (16, 16), color=(n % 256, (n * 7) % 256, (n * 13) % 256)).save(root / split / f"IMG_{n:04d}.jpg")
                rows.append({"image": f"IMG_{n:04d}", "dx": "MEL" if lesion % 3 == 0 else "NV", "lesion": f"L{lesion}"})
                n += 1
    pd.DataFrame(rows).to_csv(root / "meta.csv", index=False)
    original_test = {str(p) for p in (root / "test").glob("*.jpg")}

    src = ImageLabelSource(str(root / "meta.csv"), "image", "dx", "lesion", LABEL_MAP)
    profile = ingest_image_dataset(str(root), src)
    assert profile.splits["detected_splits"] == ["test", "train"]
    profile_path = tmp_path / "profile.json"
    profile_path.write_text(json.dumps(profile.to_dict()))
    config = PreprocessingConfig()
    config.dataset.input_path, config.dataset.output_path = str(root), str(tmp_path / "m5")
    config.split.generate_missing_splits_from_train = True
    PreprocessingEngine(config).run(str(profile_path))

    m = {s: json.loads((tmp_path / "m5" / f"{s}_manifest.json").read_text()) for s in ("train", "validation", "test")}
    assert {r["source_path"] for r in m["test"]["records"]} == original_test                 # test untouched
    assert m["validation"]["total_records"] > 0
    assert all(os.path.dirname(r["rel_path"]) == "train" for r in m["validation"]["records"])  # carved from train
    lesion = pd.read_csv(root / "meta.csv").set_index("image")["lesion"]
    groups = {s: {lesion[os.path.splitext(os.path.basename(r["rel_path"]))[0]] for r in m[s]["records"]} for s in m}
    assert not (groups["train"] & groups["validation"])                                       # no lesion in both
    assert m["validation"]["metadata"]["split_assignment"]["source"] == "existing_partial_generated_from_train"
