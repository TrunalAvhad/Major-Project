import json
import subprocess
import os

repo_root = r"d:\SHUBHAM_FULLBACKUP\Desktop\Desktop Backup\Major-Project"
adapter = os.path.join(repo_root, "federation", "api_adapter.py")
job_id = "JOB_MAL_MNV3S_CLS2_1"
round_id = "ROUND_MAL_MNV3S_R1"
hosp_id = "HOSP_123456"

# 1. Register Participant
req_reg = {
    "action": "register_participant",
    "job_id": job_id,
    "round_id": round_id,
    "participant_id": hosp_id
}
proc1 = subprocess.run(
    ["python", adapter],
    cwd=repo_root,
    input=json.dumps(req_reg),
    text=True,
    capture_output=True,
    env={**os.environ, "PYTHONPATH": "."}
)
print(f"Register Participant:\nSTDOUT: {proc1.stdout}\nSTDERR: {proc1.stderr}")

# 2. Submit Update
req_sub = {
    "action": "submit_update",
    "job_id": job_id,
    "round_id": round_id,
    "participant_id": hosp_id,
    "handoff_dir": r"C:\Users\SHUBHAM\medfl_ml_work\trained\FED_JOB_MAL_MNV3S_CLS2_1_20261007_202031_federation_handoff"
}
proc2 = subprocess.run(
    ["python", adapter],
    cwd=repo_root,
    input=json.dumps(req_sub),
    text=True,
    capture_output=True,
    env={**os.environ, "PYTHONPATH": "."}
)
print(f"Submit Update:\nSTDOUT: {proc2.stdout}\nSTDERR: {proc2.stderr}")

