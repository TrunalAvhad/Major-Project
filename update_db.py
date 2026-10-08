import sqlite3
import json

con = sqlite3.connect('federation_metadata.db')

# Update Job
job = con.execute("SELECT expected_participants FROM federation_jobs WHERE federation_job_id = 'JOB_MAL_MNV3S_CLS2_1'").fetchone()
if job:
    participants = ["HOSP_868720"]
    con.execute("UPDATE federation_jobs SET expected_participants = ? WHERE federation_job_id = 'JOB_MAL_MNV3S_CLS2_1'", (json.dumps(participants),))

# Update Round
rnd = con.execute("SELECT expected_participants FROM federation_rounds WHERE round_id = 'ROUND_MAL_MNV3S_R1'").fetchone()
if rnd:
    participants = ["HOSP_868720"]
    con.execute("UPDATE federation_rounds SET expected_participants = ? WHERE round_id = 'ROUND_MAL_MNV3S_R1'", (json.dumps(participants),))

con.commit()
print("Updated expected_participants in SQLite")
