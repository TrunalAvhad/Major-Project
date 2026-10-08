import sqlite3
import json

con = sqlite3.connect('federation_metadata.db')
con.row_factory = sqlite3.Row

print("=== JOB ===")
job = con.execute("SELECT * FROM federation_jobs WHERE federation_job_id = 'JOB_MAL_MNV3S_CLS2_1'").fetchone()
if job:
    d = dict(job)
    print(f"federation_job_id: {d['federation_job_id']}")
    print(f"status: {d['status']}")
    print(f"expected_participants: {d['expected_participants']}")
    print(f"minimum_participants: {d['minimum_participants']}")

print("\n=== ROUND ===")
rnd = con.execute("SELECT * FROM federation_rounds WHERE round_id = 'ROUND_MAL_MNV3S_R1'").fetchone()
if rnd:
    d = dict(rnd)
    print(f"round_id: {d['round_id']}")
    print(f"status: {d['status']}")
    print(f"expected_participants: {d['expected_participants']}")
    print(f"received_participants: {d['received_participants']}")
    print(f"accepted_participants: {d['accepted_participants']}")
    print(f"rejected_participants: {d['rejected_participants']}")
    print(f"minimum_participants: {d['minimum_participants']}")

print("\n=== ALL UPDATES FOR ROUND ===")
updates = con.execute("SELECT * FROM federation_updates WHERE round_id = 'ROUND_MAL_MNV3S_R1'").fetchall()
for u in updates:
    d = dict(u)
    print(f"\nupdate_id: {d['update_id']}")
    print(f"participant_id: {d['participant_id']}")
    print(f"status: {d['status']}")
    print(f"rejection_reason: {d.get('rejection_reason', '')}")
    print(f"received_at: {d['received_at']}")

print("\n=== ANY UPDATES FROM HOSP_123456 ===")
updates2 = con.execute("SELECT * FROM federation_updates WHERE participant_id = 'HOSP_123456'").fetchall()
if updates2:
    for u in updates2:
        print(dict(u))
else:
    print("NO UPDATES FOUND FROM HOSP_123456")

print("\n=== ALL UPDATES (any participant) ===")
all_updates = con.execute("SELECT update_id, participant_id, federation_job_id, round_id, status FROM federation_updates").fetchall()
for u in all_updates:
    print(dict(u))
