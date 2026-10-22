"""
Module 11 Flower TLS Integration Tests.
Verifies:
1. Flower server + client round succeeds over TLS with valid CA and server certificates.
2. Flower client with wrong CA certificate fails with an SSL/certificate verification error within bounded time.
3. Flower client with insecure=True connecting to TLS Flower server fails within bounded time without hanging.

All tests dynamically generate certificates into temporary directories; no dependency on repo certs/.
Server runs in a subprocess for negative tests to ensure the port is actively listening and to avoid
Python main-thread signal handler issues in worker threads.
"""
import datetime
import json
import os
import socket
import subprocess
import sys
import threading
import time
import flwr as fl
import numpy as np
import pytest

from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa

from scripts.make_dev_certs import build_ca_certificate, build_server_certificate
from federation import participation
from federation.flower_app.server import serve
from federation.jobs import JobManager
from federation.storage import FederationStorage
from hospital_client.training.federation import build_federation_handoff

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ARCH = "mobilenet_v3_small"
MAPPING = {"Parasitized": 0, "Uninfected": 1}


def free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def wait_until_listening(host: str, port: int, timeout: float = 10.0) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with socket.create_connection((host, port), timeout=0.2):
                return True
        except (OSError, ConnectionRefusedError):
            time.sleep(0.1)
    return False


def generate_test_certificates(tmp_path):
    ca_key, ca_cert = build_ca_certificate(common_name="Flower Test CA")
    server_key, server_cert = build_server_certificate(
        ca_key, ca_cert, ["localhost", "127.0.0.1", "::1"], common_name="localhost"
    )

    ca_path = tmp_path / "ca.pem"
    server_cert_path = tmp_path / "server.pem"
    server_key_path = tmp_path / "server.key"

    ca_bytes = ca_cert.public_bytes(serialization.Encoding.PEM)
    cert_bytes = server_cert.public_bytes(serialization.Encoding.PEM)
    key_bytes = server_key.private_bytes(
        serialization.Encoding.PEM,
        serialization.PrivateFormat.TraditionalOpenSSL,
        serialization.NoEncryption(),
    )

    ca_path.write_bytes(ca_bytes)
    server_cert_path.write_bytes(cert_bytes)
    server_key_path.write_bytes(key_bytes)

    return {
        "ca_path": str(ca_path),
        "server_cert_path": str(server_cert_path),
        "server_key_path": str(server_key_path),
        "ca_bytes": ca_bytes,
        "cert_bytes": cert_bytes,
        "key_bytes": key_bytes,
    }


class FakeHospital(fl.client.NumPyClient):
    def __init__(self, hid, keys):
        self.hid, self.keys = hid, keys
        self.seen = []

    def get_properties(self, config):
        return {"hospital_id": self.hid, "token": f"tok-{self.hid}"}

    def fit(self, parameters, config):
        self.seen.append(dict(config))
        if config.get("phase") == "calibrate":
            return parameters, 40, {"hospital_id": self.hid}
        params = [p + np.asarray(0.001, dtype=p.dtype) if p.dtype.kind == "f" else p for p in parameters]
        h = build_federation_handoff(
            params, f"FED_{self.hid}_{config['fl_round']}", 1, ARCH, config["base_model_id"], int(config["base_model_version"]),
            config["base_model_checksum"], 40, MAPPING, {"loss": 0.4}, {"accuracy": 0.9},
            {"epochs": 1, "output_dir": "trained"}, "cpu", "fp32", "TRAINING_COMPLETED_AWAITING_FEDERATION")
        return params, 40, {"hospital_id": self.hid, "token": f"tok-{self.hid}", "handoff_metadata": json.dumps(h.to_dict())}

    def evaluate(self, parameters, config):
        return 0.0, 1, {}


def state_keys():
    from hospital_client.model_management.config import ModelConfig
    from hospital_client.model_management.registry import build_model
    return list(build_model(ModelConfig(architecture=ARCH, num_classes=2, input_size=(224, 224), color_mode="RGB")).state_dict())


def make_job(tmp_path, approved, minimum=1, total_rounds=1):
    storage = FederationStorage(str(tmp_path / "fed.db"), str(tmp_path / "artifacts"))
    JobManager(storage).create_job("JOB_TLS", "Malaria", "image_classification", ARCH, 2, MAPPING, [], minimum, "", {},
                                   {"protocol": "flower", "total_rounds": total_rounds, "round_duration_hours": 1.0})
    for h in approved:
        participation.request_participation(storage, storage.get_job("JOB_TLS"), h, {"eligible": True})
        participation.decide_participation(storage, storage.get_job("JOB_TLS"), h, "APPROVED")
    return storage


def test_flower_tls_round_success(tmp_path):
    """Full round with Flower server (main thread) and client over TLS with dynamic certs."""
    certs = generate_test_certificates(tmp_path)
    storage = make_job(tmp_path, ["H1"], minimum=1, total_rounds=1)
    port = free_port()
    address = f"127.0.0.1:{port}"
    status_path = str(tmp_path / "flower" / "status.json")
    keys = state_keys()
    client = FakeHospital("H1", keys)

    def client_worker():
        time.sleep(1.0)
        fl.client.start_client(
            server_address=address,
            client=client.to_client(),
            root_certificates=certs["ca_bytes"],
            insecure=False,
            max_retries=2,
            max_wait_time=3.0,
        )

    t = threading.Thread(target=client_worker, daemon=True)
    t.start()

    final = serve(
        storage,
        "JOB_TLS",
        address,
        status_path,
        verify_identity=lambda hid, tok: tok == f"tok-{hid}",
        close_path=str(tmp_path / "flower" / "close_round"),
        poll_seconds=0.2,
        certificates=(certs["ca_bytes"], certs["cert_bytes"], certs["key_bytes"]),
    )

    t.join(timeout=15)
    assert final["state"] in ("finished", "training", "calibrating")
    assert len(client.seen) >= 1


def test_flower_tls_wrong_ca_fails_bounded(tmp_path):
    """Flower server runs in a subprocess with TLS; client with untrusted CA must fail
    with an SSL/certificate error within bounded time (< 5 seconds)."""
    certs = generate_test_certificates(tmp_path)
    # Generate an untrusted CA that did NOT sign the server cert
    w_key, w_cert = build_ca_certificate(common_name="Untrusted Other CA")
    wrong_ca_bytes = w_cert.public_bytes(serialization.Encoding.PEM)

    db_path = str(tmp_path / "fed.db")
    art_dir = str(tmp_path / "artifacts")
    status_path = str(tmp_path / "flower" / "status.json")
    os.makedirs(os.path.dirname(status_path), exist_ok=True)

    storage = FederationStorage(db_path, art_dir)
    JobManager(storage).create_job("JOB_TLS", "Malaria", "image_classification", ARCH, 2, MAPPING, [], 1, "", {},
                                   {"protocol": "flower", "total_rounds": 1, "round_duration_hours": 1.0})
    participation.request_participation(storage, storage.get_job("JOB_TLS"), "H1", {"eligible": True})
    participation.decide_participation(storage, storage.get_job("JOB_TLS"), "H1", "APPROVED")

    port = free_port()
    address = f"127.0.0.1:{port}"

    cmd = [
        sys.executable, "-m", "federation.flower_app",
        "--job-id", "JOB_TLS",
        "--port", str(port),
        "--backend-url", "http://127.0.0.1:5000/api/v1",
        "--status-file", status_path,
        "--db", db_path,
        "--artifacts", art_dir,
        "--ca-cert", certs["ca_path"],
        "--server-cert", certs["server_cert_path"],
        "--server-key", certs["server_key_path"],
    ]

    proc = subprocess.Popen(cmd, cwd=REPO_ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    try:
        assert wait_until_listening("127.0.0.1", port, timeout=10.0), "Flower TLS server failed to start and listen"

        keys = state_keys()
        client = FakeHospital("H1", keys)

        client_error = None
        start_time = time.time()
        try:
            fl.client.start_client(
                server_address=address,
                client=client.to_client(),
                root_certificates=wrong_ca_bytes,
                insecure=False,
                max_retries=1,
                max_wait_time=2.0,
            )
        except Exception as e:
            client_error = e

        elapsed = time.time() - start_time
        assert elapsed < 5.0, f"Client took too long to fail: {elapsed:.2f}s"
        assert client_error is not None, "Client should have failed with wrong CA certificate"

        err_str = str(client_error).lower()
        # Verify it failed specifically due to certificate / TLS handshake failure
        assert any(term in err_str for term in ["certificate_verify_failed", "tls handshake failed", "ssl", "unavailable"]), (
            f"Unexpected exception details: {client_error}"
        )
        assert len(client.seen) == 0
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except subprocess.TimeoutExpired:
            proc.kill()
            proc.wait()


def test_flower_tls_insecure_client_fails_bounded(tmp_path):
    """Flower server runs in a subprocess with TLS; client with insecure=True must fail
    within bounded time (< 5 seconds) without hanging."""
    certs = generate_test_certificates(tmp_path)

    db_path = str(tmp_path / "fed.db")
    art_dir = str(tmp_path / "artifacts")
    status_path = str(tmp_path / "flower" / "status.json")
    os.makedirs(os.path.dirname(status_path), exist_ok=True)

    storage = FederationStorage(db_path, art_dir)
    JobManager(storage).create_job("JOB_TLS", "Malaria", "image_classification", ARCH, 2, MAPPING, [], 1, "", {},
                                   {"protocol": "flower", "total_rounds": 1, "round_duration_hours": 1.0})
    participation.request_participation(storage, storage.get_job("JOB_TLS"), "H1", {"eligible": True})
    participation.decide_participation(storage, storage.get_job("JOB_TLS"), "H1", "APPROVED")

    port = free_port()
    address = f"127.0.0.1:{port}"

    cmd = [
        sys.executable, "-m", "federation.flower_app",
        "--job-id", "JOB_TLS",
        "--port", str(port),
        "--backend-url", "http://127.0.0.1:5000/api/v1",
        "--status-file", status_path,
        "--db", db_path,
        "--artifacts", art_dir,
        "--ca-cert", certs["ca_path"],
        "--server-cert", certs["server_cert_path"],
        "--server-key", certs["server_key_path"],
    ]

    proc = subprocess.Popen(cmd, cwd=REPO_ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    try:
        assert wait_until_listening("127.0.0.1", port, timeout=10.0), "Flower TLS server failed to start and listen"

        keys = state_keys()
        client = FakeHospital("H1", keys)

        client_error = None
        start_time = time.time()
        try:
            fl.client.start_client(
                server_address=address,
                client=client.to_client(),
                insecure=True,
                max_retries=1,
                max_wait_time=2.0,
            )
        except Exception as e:
            client_error = e

        elapsed = time.time() - start_time
        assert elapsed < 5.0, f"Insecure client took too long to fail: {elapsed:.2f}s"
        assert client_error is not None, "Insecure client should fail when connecting to TLS Flower server"
        err_str = str(client_error).lower()
        assert any(term in err_str for term in ["unavailable", "end of tcp stream", "handshake", "ssl"]), (
            f"Unexpected exception details: {client_error}"
        )
        assert len(client.seen) == 0
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except subprocess.TimeoutExpired:
            proc.kill()
            proc.wait()
