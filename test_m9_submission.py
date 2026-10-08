import urllib.request
import json

# 1. Login to get token for HOSP_123456
req = urllib.request.Request(
    "http://localhost:5000/api/v1/auth/login",
    data=json.dumps({"hospital_id": "HOSP_123456", "password": "password"}).encode('utf-8'),
    headers={'Content-Type': 'application/json'},
    method='POST'
)
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        token = data.get('token')
        print(f"Logged in as HOSP_123456. Token: {token[:10]}...")
except Exception as e:
    print(f"Login failed: {e}")
    exit(1)

# 2. Register Participant
job_id = "JOB_MAL_MNV3S_CLS2_1"
round_id = "ROUND_MAL_MNV3S_R1"
req = urllib.request.Request(
    f"http://localhost:5000/api/v1/federation/jobs/{job_id}/rounds/{round_id}/participate",
    headers={'Authorization': f'Bearer {token}'},
    method='POST'
)
try:
    with urllib.request.urlopen(req) as response:
        print(f"Participant registered: {json.loads(response.read().decode('utf-8'))}")
except Exception as e:
    print(f"Registration failed: {e}")
    if hasattr(e, 'read'):
        print(e.read().decode('utf-8'))

# 3. Submit Update
handoff_dir = r"C:\Users\SHUBHAM\medfl_ml_work\trained\FED_JOB_MAL_MNV3S_CLS2_1_20261007_202031_federation_handoff"
req = urllib.request.Request(
    f"http://localhost:5000/api/v1/federation/jobs/{job_id}/rounds/{round_id}/submit",
    data=json.dumps({"handoff_dir": handoff_dir}).encode('utf-8'),
    headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'},
    method='POST'
)
try:
    with urllib.request.urlopen(req) as response:
        print(f"Update submitted: {json.loads(response.read().decode('utf-8'))}")
except Exception as e:
    print(f"Submission failed: {e}")
    if hasattr(e, 'read'):
        print(e.read().decode('utf-8'))
