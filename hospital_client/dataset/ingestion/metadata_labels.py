"""
Image labels (and optional lesion/patient group ids) read from a metadata CSV.

For image datasets whose images are NOT sorted into class folders - e.g. ISIC:
one image folder plus a CSV with an image-id column and a diagnosis/target
column. Folder-name labelling (label_detection.py) is unchanged; this is only
used when a metadata CSV is explicitly configured.

The CSV is read in chunks and only the configured columns are loaded, so a
large metadata file is never held in memory as a whole. Nothing here modifies
the dataset or the CSV.
"""
import os
import re
from dataclasses import asdict, dataclass, field
from pathlib import PurePath
from typing import Any, Dict, List, Optional

import pandas as pd

# Class names become folder names in Module 5's materialized output, so they are
# restricted to a safe set (no path separators, no '..').
CLASS_NAME_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9 _.\-]{0,63}$")
MAX_LABEL_VALUES = 100
_CHUNK_ROWS = 100_000
_AMBIGUOUS = object()


@dataclass
class ImageLabelSource:
    csv_path: str
    image_column: str
    label_column: str
    group_column: Optional[str] = None
    # raw CSV value -> class name. A value mapped to None is explicitly excluded.
    # Without a map, the raw values are the class names.
    label_map: Optional[Dict[str, Optional[str]]] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> "ImageLabelSource":
        return cls(csv_path=d["csv_path"], image_column=d["image_column"], label_column=d["label_column"],
                   group_column=d.get("group_column") or None, label_map=d.get("label_map") or None)


@dataclass
class ImageLabels:
    labels: Dict[str, str] = field(default_factory=dict)      # rel_path -> class name
    raw_labels: Dict[str, str] = field(default_factory=dict)  # rel_path -> raw CSV value
    groups: Dict[str, str] = field(default_factory=dict)      # rel_path -> lesion/patient id
    excluded: Dict[str, str] = field(default_factory=dict)    # rel_path -> reason it has no usable label
    summary: Dict[str, Any] = field(default_factory=dict)     # counts only, safe for reports


def _rel(path: str, root: str) -> str:
    return os.path.relpath(path, root)


def _is_missing(value) -> bool:
    return value is None or (isinstance(value, float) and pd.isna(value)) or str(value).strip() == ""


def _index_images(image_files: List[str], root: str) -> Dict[str, Any]:
    """CSV ids may be a relative path, a file name, or a file name without extension."""
    index: Dict[str, Any] = {}

    def put(key, rel):
        index[key] = rel if index.get(key, rel) == rel else _AMBIGUOUS

    for f in image_files:
        rel = _rel(f, root)
        put(PurePath(rel).as_posix().casefold(), rel)
        put(os.path.basename(rel).casefold(), rel)
        put(os.path.splitext(os.path.basename(rel))[0].casefold(), rel)
    return index


def read_csv_columns(csv_path: str) -> List[str]:
    return list(pd.read_csv(csv_path, nrows=0).columns)


def label_value_counts(csv_path: str, column: str) -> Dict[str, int]:
    """Distinct values of one column with their row counts (for building a label map)."""
    if column not in read_csv_columns(csv_path):
        raise ValueError(f"Column '{column}' not found in {os.path.basename(csv_path)}.")
    counts: Dict[str, int] = {}
    for chunk in pd.read_csv(csv_path, usecols=[column], dtype=str, chunksize=_CHUNK_ROWS):
        for value, n in chunk[column].fillna("").str.strip().value_counts().items():
            counts[value] = counts.get(value, 0) + int(n)
            if len(counts) > MAX_LABEL_VALUES:
                raise ValueError(f"Column '{column}' has more than {MAX_LABEL_VALUES} distinct values; "
                                 "it does not look like a class label column.")
    return counts


def load_image_labels(source: ImageLabelSource, dataset_root: str, image_files: List[str]) -> ImageLabels:
    """Matches CSV rows to discovered image files and resolves each image's class (and group)."""
    csv_path = source.csv_path
    if not os.path.isfile(csv_path) or os.path.splitext(csv_path)[1].lower() != ".csv":
        raise ValueError(f"Metadata CSV not found or not a .csv file: {csv_path}")
    columns = read_csv_columns(csv_path)
    wanted = [source.image_column, source.label_column] + ([source.group_column] if source.group_column else [])
    missing_cols = [c for c in wanted if c not in columns]
    if missing_cols:
        raise ValueError(f"Column(s) {missing_cols} not found in metadata CSV. Available columns: {columns}")
    if len(set(wanted)) != len(wanted):
        raise ValueError("The image id, label and group columns must be different columns.")

    root = os.path.abspath(dataset_root)
    index = _index_images(image_files, root)
    label_map = source.label_map

    raw: Dict[str, str] = {}
    groups: Dict[str, str] = {}
    conflicts, ambiguous, unmapped = [], [], set()
    rows = rows_without_image = duplicate_rows = 0

    for chunk in pd.read_csv(csv_path, usecols=list(dict.fromkeys(wanted)), dtype=str, chunksize=_CHUNK_ROWS):
        for rec in chunk.to_dict(orient="records"):
            rows += 1
            image_id = rec[source.image_column]
            if _is_missing(image_id):
                rows_without_image += 1
                continue
            rel = index.get(PurePath(str(image_id).strip()).as_posix().casefold())
            if rel is _AMBIGUOUS:
                ambiguous.append(image_id)
                continue
            if rel is None:
                rows_without_image += 1
                continue
            value = None if _is_missing(rec[source.label_column]) else str(rec[source.label_column]).strip()
            if value is not None and label_map is not None and value not in label_map:
                unmapped.add(value)
            if rel in raw:
                duplicate_rows += 1
                if raw[rel] != value:
                    conflicts.append(image_id)
                continue
            raw[rel] = value
            if source.group_column and not _is_missing(rec[source.group_column]):
                groups[rel] = str(rec[source.group_column]).strip()

    if ambiguous:
        raise ValueError(f"{len(ambiguous)} CSV image id(s) match more than one file (e.g. {ambiguous[:5]}); "
                         "use relative paths in the image id column.")
    if conflicts:
        raise ValueError(f"{len(conflicts)} image(s) are listed more than once with different labels "
                         f"(e.g. {conflicts[:5]}).")
    if unmapped:
        raise ValueError(f"Label value(s) {sorted(unmapped)[:20]} are not in the label map. Map each value "
                         "to a class name, or to null to exclude it explicitly.")
    if image_files and not raw:
        raise ValueError(f"None of the {rows} CSV rows matched an image file through column "
                         f"'{source.image_column}'. Check the image id column.")

    result = ImageLabels()
    for f in image_files:
        rel = _rel(f, root)
        if rel not in raw:
            result.excluded[rel] = "UNLABELED: image has no row in the metadata CSV"
            continue
        value = raw[rel]
        if value is None:
            result.excluded[rel] = "UNLABELED: empty label in the metadata CSV"
            continue
        label = label_map[value] if label_map is not None else value
        if label is None:
            result.excluded[rel] = f"EXCLUDED_BY_LABEL_MAP: '{value}'"
            continue
        if not CLASS_NAME_RE.match(label) or label in (".", ".."):
            raise ValueError(f"Class name '{label}' is not allowed (letters, digits, space, '_', '-', '.'; "
                             "max 64 characters). Map it to a different class name.")
        result.labels[rel] = label
        result.raw_labels[rel] = value
        if rel in groups:
            result.groups[rel] = groups[rel]

    labelled_without_group = sum(1 for rel in result.labels if rel not in result.groups)
    result.summary = {
        "csv_rows": rows,
        "rows_without_matching_image": rows_without_image,
        "duplicate_rows": duplicate_rows,
        "labelled_images": len(result.labels),
        "images_without_label": sum(1 for r in result.excluded.values() if r.startswith("UNLABELED")),
        "images_excluded_by_label_map": sum(1 for r in result.excluded.values() if r.startswith("EXCLUDED")),
        "groups": len(set(result.groups.values())) if source.group_column else None,
        "labelled_images_without_group": labelled_without_group if source.group_column else None,
    }
    return result
