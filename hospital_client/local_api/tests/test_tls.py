import datetime
import io
import json
import os
import ssl
import sys
import tempfile
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
import pytest
from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.x509.oid import NameOID

from hospital_client.local_api import server
from hospital_client.local_api.server import (
    ApiError,
    check_backend_security_warning,
    get_backend_ssl_context,
    backend_urlopen,
)
from scripts.make_dev_certs import build_ca_certificate, build_server_certificate


class DummyHTTPSHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/v1/auth/me":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"data": {"user": {"role": "hospital_operator", "hospital_id": "HOSP_TEST"}}}')
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        pass  # Suppress logging in tests


@pytest.fixture(scope="module")
def test_certs(tmp_path_factory):
    """Generates fresh test certificates in a temporary directory for tests. Never skips."""
    tmp = tmp_path_factory.mktemp("tls_test_certs")
    ca_key, ca_cert = build_ca_certificate(common_name="MedFL Local Test CA")
    server_key, server_cert = build_server_certificate(
        ca_key, ca_cert, ["localhost", "127.0.0.1", "::1"], common_name="localhost"
    )

    ca_path = tmp / "ca.pem"
    server_cert_path = tmp / "server.pem"
    server_key_path = tmp / "server.key"

    ca_path.write_bytes(ca_cert.public_bytes(serialization.Encoding.PEM))
    server_cert_path.write_bytes(server_cert.public_bytes(serialization.Encoding.PEM))
    server_key_path.write_bytes(server_key.private_bytes(
        serialization.Encoding.PEM,
        serialization.PrivateFormat.TraditionalOpenSSL,
        serialization.NoEncryption(),
    ))

    return {
        "ca_path": str(ca_path),
        "server_cert": str(server_cert_path),
        "server_key": str(server_key_path),
    }


@pytest.fixture
def mock_https_backend(test_certs):
    """Runs a real local HTTPS server using generated test certs. Never skips."""
    server_address = ("127.0.0.1", 0)
    httpd = HTTPServer(server_address, DummyHTTPSHandler)
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ctx.load_cert_chain(certfile=test_certs["server_cert"], keyfile=test_certs["server_key"])
    httpd.socket = ctx.wrap_socket(httpd.socket, server_side=True)

    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    port = httpd.server_address[1]

    yield f"https://127.0.0.1:{port}/api/v1"

    httpd.shutdown()
    httpd.server_close()


def test_security_warning_on_remote_http(capsys):
    check_backend_security_warning("http://192.168.1.50:5000/api/v1")
    captured = capsys.readouterr()
    assert "SECURITY WARNING" in captured.out
    assert "remote host '192.168.1.50'" in captured.out

    # No warning for loopback HTTP
    check_backend_security_warning("http://127.0.0.1:5000/api/v1")
    captured = capsys.readouterr()
    assert "SECURITY WARNING" not in captured.out

    check_backend_security_warning("http://localhost:5000/api/v1")
    captured = capsys.readouterr()
    assert "SECURITY WARNING" not in captured.out

    # No warning for HTTPS
    check_backend_security_warning("https://remote-host:5000/api/v1")
    captured = capsys.readouterr()
    assert "SECURITY WARNING" not in captured.out


def test_ssl_context_enforces_ca(test_certs, monkeypatch):
    assert get_backend_ssl_context("http://localhost:5000/api/v1") is None

    monkeypatch.setenv("ML_BACKEND_CA", "/nonexistent/ca.pem")
    with pytest.raises(ApiError) as exc:
        get_backend_ssl_context("https://localhost:5000/api/v1")
    assert "ML_BACKEND_CA file not found" in str(exc.value)

    monkeypatch.setenv("ML_BACKEND_CA", test_certs["ca_path"])
    ctx = get_backend_ssl_context("https://localhost:5000/api/v1")
    assert ctx is not None
    assert ctx.verify_mode == ssl.CERT_REQUIRED
    assert ctx.check_hostname is True


def test_backend_urlopen_with_trusted_ca(mock_https_backend, test_certs, monkeypatch):
    import urllib.request
    monkeypatch.setenv("ML_BACKEND_CA", test_certs["ca_path"])

    req = urllib.request.Request(f"{mock_https_backend}/auth/me")
    with backend_urlopen(req, timeout=5) as r:
        data = json.load(r)
        assert data["data"]["user"]["hospital_id"] == "HOSP_TEST"


def test_backend_urlopen_with_wrong_ca_fails(mock_https_backend, monkeypatch, tmp_path):
    import urllib.request

    # Create a valid CA certificate that did NOT sign the server certificate
    w_key, w_cert = build_ca_certificate(common_name="Untrusted Other CA")
    wrong_ca = tmp_path / "wrong_ca.pem"
    wrong_ca.write_bytes(w_cert.public_bytes(serialization.Encoding.PEM))
    monkeypatch.setenv("ML_BACKEND_CA", str(wrong_ca))

    req = urllib.request.Request(f"{mock_https_backend}/auth/me")
    with pytest.raises(ApiError) as exc:
        backend_urlopen(req, timeout=5)
    assert exc.value.status == 502
    assert "SANs" in str(exc.value) or "certificate verification failed" in str(exc.value).lower()


def test_rule_1_flower_no_silent_downgrade(monkeypatch, tmp_path):
    """Rule 1: If BACKEND_URL is https (TLS mode), Flower client MUST use TLS:
    a missing or unreadable CA is an error with a clear message, never insecure=True."""
    monkeypatch.setattr(server, "BACKEND_URL", "https://localhost:5000/api/v1")
    monkeypatch.delenv("FLOWER_CA", raising=False)
    monkeypatch.delenv("ML_BACKEND_CA", raising=False)
    # Ensure default ca.pem is not found in REPO_ROOT for this test
    monkeypatch.setattr(server, "REPO_ROOT", str(tmp_path))

    class DummyReq:
        headers = {"Authorization": "Bearer test-tok"}
        ws = type("WS", (), {"hospital_id": "HOSP_1"})()

        def json_body(self):
            return {
                "job": {"federation_job_id": "JOB_001", "architecture": "resnet18"},
                "dataset_id": "123456abcdef",
                "address": "127.0.0.1:8090",
            }

    # Should raise ApiError with status 400 and informative error message
    with pytest.raises(ApiError) as exc:
        server.r_flower_connect(DummyReq(), None, None)

    assert exc.value.status == 400
    msg = str(exc.value)
    assert "TLS mode is active" in msg
    assert "missing or unreadable" in msg
    assert "Insecure connections are prohibited in TLS mode" in msg


def test_flower_connect_rejects_body_ca_path(test_certs, monkeypatch, tmp_path):
    """The CA must come only from local config (FLOWER_CA / ML_BACKEND_CA / certs/ca.pem),
    never from the browser request. Any ca_path in the request body must be ignored."""
    monkeypatch.setattr(server, "BACKEND_URL", "https://localhost:5000/api/v1")
    monkeypatch.delenv("FLOWER_CA", raising=False)
    monkeypatch.delenv("ML_BACKEND_CA", raising=False)
    monkeypatch.setattr(server, "REPO_ROOT", str(tmp_path))

    class DummyReq:
        headers = {"Authorization": "Bearer test-tok"}
        ws = type("WS", (), {"hospital_id": "HOSP_1"})()

        def json_body(self):
            return {
                "job": {"federation_job_id": "JOB_001", "architecture": "resnet18"},
                "dataset_id": "123456abcdef",
                "address": "127.0.0.1:8090",
                # Even if the caller tries to pass a valid cert path in body, it MUST be ignored
                "ca_path": test_certs["ca_path"],
            }

    with pytest.raises(ApiError) as exc:
        server.r_flower_connect(DummyReq(), None, None)

    assert exc.value.status == 400
    assert "missing or unreadable" in str(exc.value)
