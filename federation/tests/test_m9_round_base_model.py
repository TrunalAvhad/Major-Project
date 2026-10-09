"""
Opening a round through the API adapter: the deadline is validated and the round
gets a base checkpoint every hospital can download (seed for round 1, the job's
latest global model afterwards) whose checksum matches what the Trainer verifies.
"""
import datetime
import json
import os
import subprocess
import sys

import numpy as np
import pytest

from federation.base_models import BASE_MODEL_FILES, base_model_store
from federation.models import GlobalModelVersion
from federation.storage import FederationStorage
from hospital_client.model_management.parameters import get_parameters
from hospital_client.training.federation import _compute_parameters_checksum, build_federation_handoff

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ARCH = "mobilenet_v3_small"


def adapter(cwd, **req):
    out = subprocess.run([sys.executable, os.path.join(REPO, "federation", "api_adapter.py")], input=json.dumps(req),
                         capture_output=True, text=True, cwd=cwd, env={**os.environ, "PYTHONPATH": REPO}, check=True)
    return json.loads(out.stdout)


def future(hours=1):
    return (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=hours)).isoformat()


@pytest.fixture
def cwd(tmp_path):
    res = adapter(tmp_path, action="create_job", job_id="JOB1", task="Malaria", architecture=ARCH, num_classes=2,
                  class_mapping={"Parasitized": 0, "Uninfected": 1}, minimum_participants=2)
    assert res["success"], res
    return tmp_path


def stored_checksum(storage, model_id, version):
    model, _ = base_model_store(storage).load_checkpoint(model_id, version)
    return _compute_parameters_checksum(get_parameters(model))


def test_round_deadline_is_required_and_in_the_future(cwd):
    for deadline in ("", "tomorrow", "2026-01-01T00:00:00", "2000-01-01T00:00:00Z"):
        res = adapter(cwd, action="create_round", job_id="JOB1", round_id="R1", round_number=1, deadline=deadline)
        assert not res["success"]
    assert adapter(cwd, action="list_jobs")["jobs"][0]["rounds"] == []


def test_round_one_starts_from_a_downloadable_seed(cwd):
    res = adapter(cwd, action="create_round", job_id="JOB1", round_id="R1", round_number=1, deadline=future())
    assert res["success"], res
    rnd = res["round"]
    assert res["base_model_source"] == "seed" and rnd["status"] == "OPEN"
    assert rnd["base_model_id"] == "SEED_JOB1" and rnd["base_model_version"] == 1
    assert rnd["minimum_participants"] == 2                       # defaults to the job's minimum
    assert rnd["deadline"].endswith("+00:00")                     # stored in one UTC format

    storage = FederationStorage(db_path=str(cwd / "federation_metadata.db"), artifacts_dir=str(cwd / "federation_artifacts"))
    assert stored_checksum(storage, "SEED_JOB1", 1) == rnd["base_model_checksum"]

    dl = adapter(cwd, action="get_base_model", round_id="R1")
    assert dl["success"] and sorted(os.listdir(dl["dir"])) == sorted(BASE_MODEL_FILES)
    assert not adapter(cwd, action="get_base_model", round_id="NOPE")["success"]


def test_later_round_starts_from_the_latest_global_model(cwd):
    first = adapter(cwd, action="create_round", job_id="JOB1", round_id="R1", round_number=1, deadline=future())["round"]
    storage = FederationStorage(db_path=str(cwd / "federation_metadata.db"), artifacts_dir=str(cwd / "federation_artifacts"))

    # Stand-in for an aggregated global model: the seed's parameters shifted by 0.5.
    seed, _ = base_model_store(storage).load_checkpoint("SEED_JOB1", 1)
    params = [p + np.asarray(0.5, dtype=p.dtype) if p.dtype.kind == "f" else p for p in get_parameters(seed)]
    gm_dir = str(cwd / "gm")
    build_federation_handoff(params, "GM-MALARIA-V1", 1, ARCH, first["base_model_id"], 1, first["base_model_checksum"],
                             10, {"Parasitized": 0, "Uninfected": 1}, {}, {}, {}, "cpu", "fp32", "GLOBAL_MODEL_CREATED").save(gm_dir)
    storage.save_global_model(GlobalModelVersion(
        global_model_id="GM-MALARIA-V1", task="Malaria", task_type="image_classification", architecture=ARCH, version=1,
        artifact_location=gm_dir, artifact_checksum="", artifact_size=0, parameter_count=len(params), parameter_metadata={},
        federation_job_id="JOB1", round_id="R1", source_update_ids=[], aggregation_method="fedavg", aggregation_metadata={}))

    res = adapter(cwd, action="create_round", job_id="JOB1", round_id="R2", round_number=2, deadline=future())
    assert res["success"], res
    rnd = res["round"]
    assert res["base_model_source"] == "GM-MALARIA-V1" and rnd["base_model_id"] == "GM-MALARIA-V1"
    assert rnd["base_model_checksum"] == stored_checksum(storage, "GM-MALARIA-V1", 1) == _compute_parameters_checksum(params)
