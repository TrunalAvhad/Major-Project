import os
import json
import enum
import time
import shutil
import tempfile
import requests
import subprocess
import dataclasses
from federation.storage import FederationStorage
from federation.jobs import JobManager
from federation.rounds import RoundManager
from federation.aggregation import Aggregator
from federation.api_adapter import EventEmitter

WORK_DIR = os.path.expanduser("~/medfl_ml_work")
ARCHITECTURE = "mobilenet_v3_small"
HOSPITAL_IDS = ["HOSP_868720", "HOSP_123456"]
# Created once, then the SAME artifact is copied into every hospital's workspace
# (the local ML service keeps each hospital's models in <WORK_DIR>/<hospital_id>/trained/<architecture>/models).
MODELS_DIR = os.path.join(tempfile.mkdtemp(prefix="medfl_canonical_"), "models")
BACKEND_URL = "http://localhost:5000/api/v1"
LOCAL_API_URL = "http://localhost:8765"
LOCAL_HEADERS = {"Origin": "http://localhost:5173"}
CANONICAL_MODEL_ID = "CANONICAL_SEED_MOBILENET_V3"
CANONICAL_VERSION = 1


def enum_safe(obj):
    if dataclasses.is_dataclass(obj) and not isinstance(obj, type):
        return {k: enum_safe(v) for k, v in dataclasses.asdict(obj).items()}
    elif isinstance(obj, dict):
        return {k: enum_safe(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [enum_safe(i) for i in obj]
    elif isinstance(obj, enum.Enum):
        return obj.value
    return obj


# ── A: Canonical Seed Model ───────────────────
cmd = [
    "python", "-m", "hospital_client.model_management", "init",
    "--architecture", ARCHITECTURE,
    "--num-classes", "2",
    "--output", MODELS_DIR,
    "--model-id", CANONICAL_MODEL_ID
]
subprocess.run(cmd, check=True)

# Derive checksum using the SAME method the Trainer uses: SHA-256 of parameter arrays
from hospital_client.model_management.store import ModelStore
from hospital_client.model_management.parameters import get_parameters
from hospital_client.training.federation import _compute_parameters_checksum

store = ModelStore(MODELS_DIR)
_model, _meta = store.load_checkpoint(CANONICAL_MODEL_ID, CANONICAL_VERSION, device="cpu")
_params = get_parameters(_model)
canonical_checksum = _compute_parameters_checksum(_params)
del _model, _params

canonical_id = CANONICAL_MODEL_ID
canonical_version = CANONICAL_VERSION
print(f"Canonical: {canonical_id} v{canonical_version}")
print(f"  param-checksum: {canonical_checksum}")

for hosp in HOSPITAL_IDS:
    dest = os.path.join(WORK_DIR, hosp, "trained", ARCHITECTURE, "models", CANONICAL_MODEL_ID)
    shutil.copytree(os.path.join(MODELS_DIR, CANONICAL_MODEL_ID), dest, dirs_exist_ok=True)
    print(f"  provisioned for {hosp}: {dest}")

# ── B: Job & Round ────────────────────────────
storage = FederationStorage(db_path="federation_metadata.db")
jm = JobManager(storage)
rm = RoundManager(storage)
events = EventEmitter()

job_id   = "JOB_MAL_MNV3S_CANONICAL_E2E_3"
round_id = "ROUND_MAL_MNV3S_CANONICAL_E2E_R3"

try:
    jm.create_job(
        federation_job_id=job_id, task="Malaria", task_type="image_classification",
        architecture="mobilenet_v3_small", num_classes=2,
        class_mapping={"Parasitized": 0, "Uninfected": 1},
        expected_participants=["HOSP_868720", "HOSP_123456"],
        minimum_participants=2, deadline="2099-01-01T00:00:00Z",
        training_requirements={"epochs": 1}, aggregation_configuration={}
    )
    print(f"Job created: {job_id}")
except ValueError:
    print(f"Job {job_id} already exists.")

try:
    rm.create_round(
        federation_job_id=job_id, round_id=round_id, round_number=1,
        expected_participants=["HOSP_868720", "HOSP_123456"],
        minimum_participants=2, deadline="2099-01-01T00:00:00Z",
        base_model_id=canonical_id, base_model_version=canonical_version,
        base_model_checksum=canonical_checksum
    )
    rm.open_round(round_id)
    print(f"Round created: {round_id}")
except ValueError:
    # Round exists — ensure checksum is correct (param-level hash)
    rnd = storage.get_round(round_id)
    if rnd.base_model_checksum != canonical_checksum:
        rnd.base_model_checksum = canonical_checksum
        storage.save_round(rnd)
        print(f"Round {round_id} exists — checksum corrected to param-level hash.")
    else:
        print(f"Round {round_id} already exists with correct checksum.")


def build_job_payload():
    job_d   = enum_safe(storage.get_job(job_id))
    round_d = enum_safe(storage.get_round(round_id))
    job_d["rounds"] = [round_d] if round_d else []
    return job_d


def run_hospital(hosp_id, email, password):
    print(f"\n=== {hosp_id} ===")
    r = requests.post(f"{BACKEND_URL}/auth/login",
                      json={"identifier": email, "password": password, "role": "hospital_operator"})
    r.raise_for_status()
    token = r.json()["data"]["access_token"]
    auth = {**LOCAL_HEADERS, "Authorization": f"Bearer {token}"}
    print("  Logged in.")

    # Register participation on the backend
    r = requests.post(
        f"{BACKEND_URL}/federation/jobs/{job_id}/rounds/{round_id}/participate",
        headers={"Authorization": f"Bearer {token}"}
    )
    if r.status_code not in (200, 201, 409):
        r.raise_for_status()
    print("  Participation registered." if r.status_code != 409 else "  Already registered.")

    # Submit to local_api (retry if busy)
    payload = {
        "job": build_job_payload(),
        "dataset_id": "04ab4a394cda",
        "round_id": round_id,
        "auth_token": token,
        "api_url": BACKEND_URL
    }
    for attempt in range(15):
        r = requests.post(f"{LOCAL_API_URL}/api/ml/federation/participate",
                          json=payload, headers=auth)
        if r.status_code == 409:
            print(f"  Local API busy, waiting 20 s (attempt {attempt+1})...")
            time.sleep(20)
            continue
        r.raise_for_status()
        break
    else:
        raise RuntimeError("Local API remained busy after all retries.")

    task_id = r.json()["job_id"]
    print(f"  Training started: {task_id}")

    while True:
        sr = requests.get(f"{LOCAL_API_URL}/api/ml/jobs/{task_id}", headers=auth)
        sr.raise_for_status()
        d = sr.json()
        print(f"  status={d['status']}")
        if d["status"] == "succeeded":
            print(f"  Training done for {hosp_id}.")
            return d.get("result")
        if d["status"] in ("failed", "cancelled"):
            raise RuntimeError(f"Training failed for {hosp_id}: {d.get('error')}")
        time.sleep(15)


hosp1 = run_hospital("HOSP_868720", "hosp868720@test.com", "Password123!")
hosp2 = run_hospital("HOSP_123456", "hosp123456@test.com", "Password123!")

# ── Admin aggregation ─────────────────────────
print("\n=== Aggregation ===")
ar = requests.post(f"{BACKEND_URL}/auth/login",
                   json={"identifier": "admin@consortium.org", "password": "admin123", "role": "admin"})
ar.raise_for_status()
admin_token = ar.json()["data"]["access_token"]

ag = requests.post(f"{BACKEND_URL}/federation/rounds/aggregate",
                   json={"round_id": round_id, "force_close": True},
                   headers={"Authorization": f"Bearer {admin_token}"})
ag.raise_for_status()
agg = ag.json()
print(f"Aggregation: {json.dumps(agg, indent=2)}")

results = {
    "canonical": {"id": canonical_id, "version": canonical_version, "checksum": canonical_checksum},
    "hosp1_result": hosp1, "hosp2_result": hosp2, "aggregation": agg
}
with open("e2e_results.json", "w") as f:
    json.dump(results, f, indent=2, default=str)

print("\nDone. Results -> e2e_results.json")
