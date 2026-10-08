import sqlite3
import json

con = sqlite3.connect('federation_metadata.db')
con.row_factory = sqlite3.Row

update = con.execute("SELECT * FROM federation_updates WHERE update_id = 'UPD-659296DE'").fetchone()
if update:
    d = dict(update)
    print('=== UPDATE ===')
    for k, v in d.items():
        print(f'{k}: {v}')

print('\n=== ROUND ===')
rnd = con.execute("SELECT * FROM federation_rounds WHERE round_id = 'ROUND_MAL_MNV3S_R1'").fetchone()
if rnd:
    d = dict(rnd)
    print(f"status: {d['status']}")
    print(f"received: {d['received_participants']}")
    print(f"accepted: {d['accepted_participants']}")
    print(f"rejected: {d['rejected_participants']}")
