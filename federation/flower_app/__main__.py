"""
Started by the backend when the admin clicks Start federation:

    python -m federation.flower_app --job-id JOB --port 8090 --backend-url http://localhost:5000/api/v1 \
        --status-file federation_artifacts/flower/JOB/status.json [--public-host 127.0.0.1]

Runs the job's remaining planned rounds over Flower (federation/flower_app/server.py) and exits.
"""
import argparse
import json
import os
import ssl
import sys
import time
from typing import Callable, Optional
import urllib.error
import urllib.request

AUTH_TTL_SECONDS = 60


def backend_identity_check(backend_url: str, backend_ca: Optional[str] = None) -> Callable[[str, str], bool]:
    """A hospital is who it says when the backend knows its token as a hospital operator of that hospital.
    The server has no JWT secret; it asks the backend, as the hospital service does."""
    cache = {}
    ctx = None
    if backend_url.startswith("https://"):
        if backend_ca and os.path.isfile(backend_ca):
            ctx = ssl.create_default_context(cafile=backend_ca)
        else:
            ctx = ssl.create_default_context()
        ctx.check_hostname = True
        ctx.verify_mode = ssl.CERT_REQUIRED

    def check(hospital_id: str, token: str) -> bool:
        if not token:
            return False
        hit = cache.get(token)
        if hit and hit[0] > time.time():
            user = hit[1]
        else:
            req = urllib.request.Request(f"{backend_url}/auth/me", headers={"Authorization": f"Bearer {token}",
                                                                            "Accept": "application/json"})
            try:
                with urllib.request.urlopen(req, timeout=5, context=ctx) as r:
                    user = json.load(r)["data"]["user"]
            except (urllib.error.URLError, OSError, ValueError, KeyError, TypeError, ssl.SSLError):
                return False
            cache[token] = (time.time() + AUTH_TTL_SECONDS, user)
        return user.get("role") == "hospital_operator" and user.get("hospital_id") == hospital_id

    return check


def main(argv=None) -> None:
    p = argparse.ArgumentParser(prog="python -m federation.flower_app")
    p.add_argument("--job-id", required=True)
    p.add_argument("--port", type=int, required=True)
    p.add_argument("--backend-url", required=True)
    p.add_argument("--status-file", required=True)
    p.add_argument("--bind-host", default=os.environ.get("FLOWER_BIND_HOST", "0.0.0.0"))
    p.add_argument("--public-host", default=os.environ.get("FLOWER_PUBLIC_HOST", "127.0.0.1"))
    p.add_argument("--db", default="federation_metadata.db")
    p.add_argument("--artifacts", default="federation_artifacts")
    p.add_argument("--eval-datasets", default="evaluation_datasets")
    p.add_argument("--ca-cert", default=None, help="Path to CA certificate for Flower TLS")
    p.add_argument("--server-cert", default=None, help="Path to server certificate for Flower TLS")
    p.add_argument("--server-key", default=None, help="Path to server private key for Flower TLS")
    p.add_argument("--backend-ca", default=None, help="Path to CA certificate for backend verification")
    a = p.parse_args(argv)

    certificates = None
    if a.ca_cert and a.server_cert and a.server_key:
        if not os.path.isfile(a.ca_cert):
            print(f"Error: Flower CA certificate not found: '{a.ca_cert}'", file=sys.stderr)
            sys.exit(1)
        if not os.path.isfile(a.server_cert):
            print(f"Error: Flower server certificate not found: '{a.server_cert}'", file=sys.stderr)
            sys.exit(1)
        if not os.path.isfile(a.server_key):
            print(f"Error: Flower server key not found: '{a.server_key}'", file=sys.stderr)
            sys.exit(1)
        with open(a.ca_cert, "rb") as f:
            ca_bytes = f.read()
        with open(a.server_cert, "rb") as f:
            cert_bytes = f.read()
        with open(a.server_key, "rb") as f:
            key_bytes = f.read()
        certificates = (ca_bytes, cert_bytes, key_bytes)

    from federation.flower_app.server import serve
    from federation.storage import FederationStorage
    storage = FederationStorage(a.db, a.artifacts)
    close_path = os.path.join(os.path.dirname(a.status_file), "close_round")
    try:
        final = serve(storage, a.job_id, f"{a.bind_host}:{a.port}", a.status_file,
                      backend_identity_check(a.backend_url, backend_ca=a.backend_ca),
                      close_path=close_path, public_address=f"{a.public_host}:{a.port}",
                      eval_datasets_dir=a.eval_datasets, certificates=certificates)
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    print(f"Flower run of {a.job_id} ended: {final['state']}. {final.get('message', '')}")


if __name__ == "__main__":
    main()
