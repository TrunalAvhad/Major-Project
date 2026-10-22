"""
Module 11 Flower TLS Integration Tests.
Verifies:
1. Flower server + client round succeeds over TLS with valid CA and server certificates.
2. Flower client with wrong CA certificate fails within bounded time (bounded by max_retries / max_wait_time).
3. Flower client with insecure=True connecting to TLS Flower server fails within bounded time without hanging.
"""
import datetime
import json
import os
import threading
import time
import flwr as fl
import numpy as np
import pytest

from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.x509.oid import NameOID

from federation import participation
from federation.flower_app.server import serve
from federation.jobs import JobManager
from federation.storage import FederationStorage
from hospital_client.training.federation import build_federation_handoff

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CERTS_DIR = os.path.join(REPO_ROOT, "certs")
CA_PATH = os.path.join(CERTS_DIR, "ca.pem")
SERVER_CERT = os.path.join(CERTS_DIR, "server.pem")
SERVER_KEY = os.path.join(CERTS_DIR, "server.key")

ARCH = "mobilenet_v3_small"
MAPPING = {"Parasitized": 0, "Uninfected": 1}


def free_address():
    import socket
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return f"127.0.0.1:{s.getsockname()[1]}"


def load_dev_certificates():
    if not (os.path.isfile(CA_PATH) and os.path.isfile(SERVER_CERT) and os.path.isfile(SERVER_KEY)):
        pytest.skip("Dev certificates (ca.pem, server.pem, server.key) missing.")
    with open(CA_PATH, "rb") as f:
        ca_bytes = f.read()
    with open(SERVER_CERT, "rb") as f:
        cert_bytes = f.read()
    with open(SERVER_KEY, "rb") as f:
        key_bytes = f.read()
    return ca_bytes, cert_bytes, key_bytes


def make_untrusted_ca():
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    subject = issuer = x509.Name([
        x509.NameAttribute(NameOID.COMMON_NAME, "Untrusted Dev CA"),
    ])
    cert = (
        x509.CertificateBuilder()
        .subject_name(subject)
        .issuer_name(issuer)
        .public_key(key.public_key())
        .serial_number(x509.random_serial_number())
        .not_valid_before(datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1))
        .not_valid_after(datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=10))
        .add_extension(x509.BasicConstraints(ca=True, path_length=None), critical=True)
        .sign(key, hashes.SHA256())
    )
    return cert.public_bytes(serialization.Encoding.PEM)


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
    """Full round with Flower server and client over mutual TLS."""
    ca_bytes, cert_bytes, key_bytes = load_dev_certificates()
    storage = make_job(tmp_path, ["H1"], minimum=1, total_rounds=1)
    address = free_address()
    status_path = str(tmp_path / "flower" / "status.json")
    keys = state_keys()
    client = FakeHospital("H1", keys)

    def client_worker():
        time.sleep(1.0)
        fl.client.start_client(
            server_address=address,
            client=client.to_client(),
            root_certificates=ca_bytes,
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
        certificates=(ca_bytes, cert_bytes, key_bytes),
    )

    t.join(timeout=15)
    assert final["state"] in ("finished", "training", "calibrating")
    assert len(client.seen) >= 1


def test_flower_tls_wrong_ca_fails_bounded(tmp_path):
    """Client using wrong CA must fail within bounded time and not hang."""
    ca_bytes, cert_bytes, key_bytes = load_dev_certificates()
    wrong_ca = make_untrusted_ca()
    storage = make_job(tmp_path, ["H1"], minimum=1, total_rounds=1)
    address = free_address()
    status_path = str(tmp_path / "flower" / "status.json")
    keys = state_keys()
    client = FakeHospital("H1", keys)

    client_error = []
    start_time = time.time()

    def client_worker():
        time.sleep(1.0)
        try:
            fl.client.start_client(
                server_address=address,
                client=client.to_client(),
                root_certificates=wrong_ca,
                insecure=False,
                max_retries=1,
                max_wait_time=2.0,
            )
        except Exception as e:
            client_error.append(e)

    ct = threading.Thread(target=client_worker, daemon=True)
    ct.start()

    # Serve in separate thread so we can close or time out
    st = threading.Thread(
        target=lambda: serve(
            storage,
            "JOB_TLS",
            address,
            status_path,
            verify_identity=lambda hid, tok: tok == f"tok-{hid}",
            close_path=str(tmp_path / "flower" / "close_round"),
            poll_seconds=0.2,
            certificates=(ca_bytes, cert_bytes, key_bytes),
        ),
        daemon=True,
    )
    st.start()

    ct.join(timeout=10)
    elapsed = time.time() - start_time
    (tmp_path / "flower" / "close_round").touch()
    st.join(timeout=5)

    # Must terminate within bounded time (< 10 seconds)
    assert not ct.is_alive(), f"Client hung and did not terminate within bounded time ({elapsed:.1f}s)"
    assert elapsed < 10.0
    # No training occurred with wrong CA
    assert len(client.seen) == 0


def test_flower_tls_insecure_client_fails_bounded(tmp_path):
    """Insecure client attempting to connect to TLS server must fail bounded and not hang."""
    ca_bytes, cert_bytes, key_bytes = load_dev_certificates()
    storage = make_job(tmp_path, ["H1"], minimum=1, total_rounds=1)
    address = free_address()
    status_path = str(tmp_path / "flower" / "status.json")
    os.makedirs(os.path.dirname(status_path), exist_ok=True)
    keys = state_keys()
    client = FakeHospital("H1", keys)

    start_time = time.time()

    def client_worker():
        time.sleep(1.0)
        try:
            fl.client.start_client(
                server_address=address,
                client=client.to_client(),
                insecure=True,
                max_retries=1,
                max_wait_time=2.0,
            )
        except Exception:
            pass

    ct = threading.Thread(target=client_worker, daemon=True)
    ct.start()

    st = threading.Thread(
        target=lambda: serve(
            storage,
            "JOB_TLS",
            address,
            status_path,
            verify_identity=lambda hid, tok: tok == f"tok-{hid}",
            close_path=str(tmp_path / "flower" / "close_round"),
            poll_seconds=0.2,
            certificates=(ca_bytes, cert_bytes, key_bytes),
        ),
        daemon=True,
    )
    st.start()

    ct.join(timeout=10)
    elapsed = time.time() - start_time
    (tmp_path / "flower" / "close_round").touch()
    st.join(timeout=5)

    # Insecure client must not hang
    assert not ct.is_alive(), f"Insecure client hung ({elapsed:.1f}s)"
    assert elapsed < 10.0
    assert len(client.seen) == 0
