#!/usr/bin/env python3
"""
Module 11: Development Certificate Generation Tool

Generates a local Certificate Authority (CA) and server TLS certificates with
Subject Alternative Names (SANs) for localhost, 127.0.0.1, ::1, and optional LAN IPs.
Outputs to a gitignored directory (default: certs/).

Security Invariants:
- Never prints private key material.
- Refuses to overwrite existing certificates without --force.
- Restricts key file permissions where supported.
- All output files are gitignored.
"""
import argparse
import datetime
import ipaddress
import os
import stat
import sys
from typing import List, Tuple

from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.x509.oid import ExtendedKeyUsageOID, NameOID

DEFAULT_SAN_HOSTS = ["localhost", "127.0.0.1", "::1"]


def build_ca_certificate(
    common_name: str = "MedFL Local Development CA",
    organization: str = "MedFL Project",
    validity_days: int = 825,
) -> Tuple[rsa.RSAPrivateKey, x509.Certificate]:
    """Generates a local root CA key and self-signed certificate."""
    ca_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )

    now = datetime.datetime.now(datetime.timezone.utc)
    subject = issuer = x509.Name([
        x509.NameAttribute(NameOID.COUNTRY_NAME, "US"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, organization),
        x509.NameAttribute(NameOID.COMMON_NAME, common_name),
    ])

    ca_cert = (
        x509.CertificateBuilder()
        .subject_name(subject)
        .issuer_name(issuer)
        .public_key(ca_key.public_key())
        .serial_number(x509.random_serial_number())
        .not_valid_before(now - datetime.timedelta(days=1))
        .not_valid_after(now + datetime.timedelta(days=validity_days))
        .add_extension(
            x509.BasicConstraints(ca=True, path_length=1),
            critical=True,
        )
        .add_extension(
            x509.KeyUsage(
                digital_signature=True,
                content_commitment=False,
                key_encipherment=False,
                data_encipherment=False,
                key_agreement=False,
                key_cert_sign=True,
                crl_sign=True,
                encipher_only=False,
                decipher_only=False,
            ),
            critical=True,
        )
        .add_extension(
            x509.SubjectKeyIdentifier.from_public_key(ca_key.public_key()),
            critical=False,
        )
        .sign(ca_key, hashes.SHA256())
    )

    return ca_key, ca_cert


def build_server_certificate(
    ca_key: rsa.RSAPrivateKey,
    ca_cert: x509.Certificate,
    hosts: List[str],
    common_name: str = "localhost",
    organization: str = "MedFL Project",
    validity_days: int = 365,
) -> Tuple[rsa.RSAPrivateKey, x509.Certificate]:
    """Generates a server key and certificate signed by the local CA with SANs."""
    server_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )

    now = datetime.datetime.now(datetime.timezone.utc)
    subject = x509.Name([
        x509.NameAttribute(NameOID.COUNTRY_NAME, "US"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, organization),
        x509.NameAttribute(NameOID.COMMON_NAME, common_name),
    ])

    san_items = []
    for host in hosts:
        host = host.strip()
        if not host:
            continue
        try:
            ip_obj = ipaddress.ip_address(host)
            san_items.append(x509.IPAddress(ip_obj))
        except ValueError:
            san_items.append(x509.DNSName(host))

    server_cert = (
        x509.CertificateBuilder()
        .subject_name(subject)
        .issuer_name(ca_cert.subject)
        .public_key(server_key.public_key())
        .serial_number(x509.random_serial_number())
        .not_valid_before(now - datetime.timedelta(days=1))
        .not_valid_after(now + datetime.timedelta(days=validity_days))
        .add_extension(
            x509.BasicConstraints(ca=False, path_length=None),
            critical=True,
        )
        .add_extension(
            x509.KeyUsage(
                digital_signature=True,
                content_commitment=False,
                key_encipherment=True,
                data_encipherment=False,
                key_agreement=False,
                key_cert_sign=False,
                crl_sign=False,
                encipher_only=False,
                decipher_only=False,
            ),
            critical=True,
        )
        .add_extension(
            x509.ExtendedKeyUsage([
                ExtendedKeyUsageOID.SERVER_AUTH,
                ExtendedKeyUsageOID.CLIENT_AUTH,
            ]),
            critical=False,
        )
        .add_extension(
            x509.SubjectAlternativeName(san_items),
            critical=False,
        )
        .add_extension(
            x509.AuthorityKeyIdentifier.from_issuer_public_key(ca_key.public_key()),
            critical=False,
        )
        .add_extension(
            x509.SubjectKeyIdentifier.from_public_key(server_key.public_key()),
            critical=False,
        )
        .sign(ca_key, hashes.SHA256())
    )

    return server_key, server_cert


def _write_secure_file(path: str, data: bytes, is_private_key: bool = False) -> None:
    """Writes data to file and sets restrictive permissions on private keys."""
    flags = os.O_WRONLY | os.O_CREAT | os.O_TRUNC
    mode = 0o600 if is_private_key else 0o644
    fd = os.open(path, flags, mode)
    with os.fdopen(fd, "wb") as f:
        f.write(data)

    try:
        if is_private_key:
            os.chmod(path, stat.S_IRUSR | stat.S_IWUSR)
    except OSError:
        pass


def make_dev_certs(
    out_dir: str = "certs",
    extra_hosts: List[str] = None,
    force: bool = False,
    ca_days: int = 825,
    server_days: int = 365,
) -> dict:
    """Creates local CA and server certificates, returning their file paths."""
    os.makedirs(out_dir, exist_ok=True)

    ca_key_path = os.path.join(out_dir, "ca.key")
    ca_pem_path = os.path.join(out_dir, "ca.pem")
    server_key_path = os.path.join(out_dir, "server.key")
    server_pem_path = os.path.join(out_dir, "server.pem")

    existing = [p for p in (ca_key_path, ca_pem_path, server_key_path, server_pem_path) if os.path.exists(p)]
    if existing and not force:
        raise FileExistsError(
            f"Existing certificate files found in '{out_dir}': {existing}. "
            f"Refusing to overwrite without --force."
        )

    all_hosts = list(DEFAULT_SAN_HOSTS)
    if extra_hosts:
        for h in extra_hosts:
            if h and h not in all_hosts:
                all_hosts.append(h)

    # 1. Generate CA
    ca_key, ca_cert = build_ca_certificate(validity_days=ca_days)

    # 2. Generate Server Certificate
    server_key, server_cert = build_server_certificate(
        ca_key, ca_cert, hosts=all_hosts, validity_days=server_days
    )

    # 3. Serialize and write
    ca_key_bytes = ca_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption(),
    )
    ca_cert_bytes = ca_cert.public_bytes(serialization.Encoding.PEM)

    server_key_bytes = server_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption(),
    )
    server_cert_bytes = server_cert.public_bytes(serialization.Encoding.PEM)

    _write_secure_file(ca_key_path, ca_key_bytes, is_private_key=True)
    _write_secure_file(ca_pem_path, ca_cert_bytes, is_private_key=False)
    _write_secure_file(server_key_path, server_key_bytes, is_private_key=True)
    _write_secure_file(server_pem_path, server_cert_bytes, is_private_key=False)

    return {
        "out_dir": os.path.abspath(out_dir),
        "ca_cert": ca_pem_path,
        "ca_key": ca_key_path,
        "server_cert": server_pem_path,
        "server_key": server_key_path,
        "sans": all_hosts,
    }


def main():
    parser = argparse.ArgumentParser(
        description="Generate development CA and TLS server certificates for local/LAN testing."
    )
    parser.add_argument(
        "--out-dir",
        default="certs",
        help="Target directory for generated certificates (default: certs/)",
    )
    parser.add_argument(
        "--lan-ip",
        action="append",
        dest="extra_hosts",
        default=[],
        help="Optional LAN IP address to include in certificate SANs (e.g. 192.168.1.50). Can be repeated.",
    )
    parser.add_argument(
        "--extra-host",
        action="append",
        dest="extra_hosts",
        default=[],
        help="Optional hostname to include in certificate SANs (e.g. server.local). Can be repeated.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing certificate files if present.",
    )
    parser.add_argument(
        "--ca-days",
        type=int,
        default=825,
        help="Validity period for CA in days (default: 825)",
    )
    parser.add_argument(
        "--server-days",
        type=int,
        default=365,
        help="Validity period for server certificate in days (default: 365)",
    )

    args = parser.parse_args()

    try:
        res = make_dev_certs(
            out_dir=args.out_dir,
            extra_hosts=args.extra_hosts,
            force=args.force,
            ca_days=args.ca_days,
            server_days=args.server_days,
        )
    except FileExistsError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    print("==================================================================")
    print("Module 11 Development TLS Certificates Generated Successfully")
    print("==================================================================")
    print(f"Directory:           {res['out_dir']}")
    print(f"CA Certificate:      {res['ca_cert']}")
    print(f"CA Private Key:      {res['ca_key']} (restricted permissions)")
    print(f"Server Certificate:  {res['server_cert']}")
    print(f"Server Private Key:  {res['server_key']} (restricted permissions)")
    print(f"Configured SANs:     {', '.join(res['sans'])}")
    print("------------------------------------------------------------------")
    print("Windows Trust Command (Run in Admin / User PowerShell):")
    print(f"  certutil -user -addstore Root \"{res['ca_cert']}\"")
    print("Windows Untrust / Cleanup Command:")
    print("  certutil -user -delstore Root \"MedFL Local Development CA\"")
    print("==================================================================")


if __name__ == "__main__":
    main()
