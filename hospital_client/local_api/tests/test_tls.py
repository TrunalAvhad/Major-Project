import io
import json
import os
import ssl
import sys
import tempfile
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
import pytest

from hospital_client.local_api import server
from hospital_client.local_api.server import (
    ApiError,
    check_backend_security_warning,
    get_backend_ssl_context,
    backend_urlopen,
)

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
CERTS_DIR = os.path.join(REPO_ROOT, "certs")
CA_PATH = os.path.join(CERTS_DIR, "ca.pem")
SERVER_CERT = os.path.join(CERTS_DIR, "server.pem")
SERVER_KEY = os.path.join(CERTS_DIR, "server.key")


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


@pytest.fixture
def mock_https_backend():
    """Runs a real local HTTPS server using generated dev certs."""
    if not (os.path.isfile(SERVER_CERT) and os.path.isfile(SERVER_KEY)):
        pytest.skip("Dev certificates (certs/server.pem, certs/server.key) not found.")

    server_address = ("127.0.0.1", 0)
    httpd = HTTPServer(server_address, DummyHTTPSHandler)
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ctx.load_cert_chain(certfile=SERVER_CERT, keyfile=SERVER_KEY)
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


def test_ssl_context_enforces_ca(monkeypatch):
    assert get_backend_ssl_context("http://localhost:5000/api/v1") is None

    monkeypatch.setenv("ML_BACKEND_CA", "/nonexistent/ca.pem")
    with pytest.raises(ApiError) as exc:
        get_backend_ssl_context("https://localhost:5000/api/v1")
    assert "ML_BACKEND_CA file not found" in str(exc.value)

    if os.path.isfile(CA_PATH):
        monkeypatch.setenv("ML_BACKEND_CA", CA_PATH)
        ctx = get_backend_ssl_context("https://localhost:5000/api/v1")
        assert ctx is not None
        assert ctx.verify_mode == ssl.CERT_REQUIRED
        assert ctx.check_hostname is True


def test_backend_urlopen_with_trusted_ca(mock_https_backend, monkeypatch):
    import urllib.request
    monkeypatch.setenv("ML_BACKEND_CA", CA_PATH)

    req = urllib.request.Request(f"{mock_https_backend}/auth/me")
    with backend_urlopen(req, timeout=5) as r:
        data = json.load(r)
        assert data["data"]["user"]["hospital_id"] == "HOSP_TEST"


def test_backend_urlopen_with_wrong_ca_fails(mock_https_backend, monkeypatch, tmp_path):
    import urllib.request
    from cryptography import x509
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.asymmetric import rsa
    from cryptography.x509.oid import NameOID
    import datetime

    # Create a valid CA certificate that did NOT sign the server certificate
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    subject = issuer = x509.Name([
        x509.NameAttribute(NameOID.COMMON_NAME, "Untrusted Other CA"),
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
    from cryptography.hazmat.primitives import serialization
    wrong_ca = tmp_path / "wrong_ca.pem"
    wrong_ca.write_bytes(cert.public_bytes(serialization.Encoding.PEM))
    monkeypatch.setenv("ML_BACKEND_CA", str(wrong_ca))

    req = urllib.request.Request(f"{mock_https_backend}/auth/me")
    with pytest.raises(ApiError) as exc:
        backend_urlopen(req, timeout=5)
    assert exc.value.status == 502
    assert "SANs" in str(exc.value) or "certificate verification failed" in str(exc.value).lower()


def test_rule_1_flower_no_silent_downgrade(monkeypatch):
    """Rule 1: If BACKEND_URL is https (TLS mode), Flower client MUST use TLS:
    a missing or unreadable CA is an error with a clear message, never insecure=True."""
    monkeypatch.setattr(server, "BACKEND_URL", "https://localhost:5000/api/v1")
    monkeypatch.delenv("FLOWER_CA", raising=False)
    monkeypatch.delenv("ML_BACKEND_CA", raising=False)

    class DummyReq:
        headers = {"Authorization": "Bearer test-tok"}
        ws = type("WS", (), {"hospital_id": "HOSP_1"})()

        def json_body(self):
            return {
                "job": {"federation_job_id": "JOB_001", "architecture": "resnet18"},
                "dataset_id": "123456abcdef",
                "address": "127.0.0.1:8090",
                "ca_path": "/nonexistent/flower_ca.pem"
            }

    # Should raise ApiError with status 400 and informative error message
    with pytest.raises(ApiError) as exc:
        server.r_flower_connect(DummyReq(), None, None)

    assert exc.value.status == 400
    msg = str(exc.value)
    assert "TLS mode is active" in msg
    assert "missing or unreadable" in msg
    assert "Insecure connections are prohibited in TLS mode" in msg
