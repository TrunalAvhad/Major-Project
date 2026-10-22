const fs = require('fs');
const os = require('os');
const path = require('path');
const https = require('https');
const http = require('http');
const { execFileSync } = require('child_process');
const express = require('express');
const { createHttpServer } = require('../../server');
const flowerService = require('../../src/services/flowerService');

const REPO_ROOT = path.resolve(__dirname, '../../../');

describe('Backend TLS Configuration & Server Creation (Module 11)', () => {
  const origEnv = { ...process.env };
  const mockApp = express();
  mockApp.get('/test-ping', (req, res) => res.json({ ok: true, secure: req.secure }));

  let tempDir;
  let testCertPath;
  let testKeyPath;
  let testCaPath;

  beforeAll(() => {
    // Dynamically generate test certificates using scripts/make_dev_certs.py into a temp directory
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'medfl-tls-test-'));
    execFileSync(
      'python',
      [path.resolve(REPO_ROOT, 'scripts/make_dev_certs.py'), '--out-dir', tempDir, '--force'],
      { cwd: REPO_ROOT, stdio: 'pipe' }
    );
    testCertPath = path.join(tempDir, 'server.pem');
    testKeyPath = path.join(tempDir, 'server.key');
    testCaPath = path.join(tempDir, 'ca.pem');
  });

  afterAll(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // ignore cleanup error
      }
    }
  });

  afterEach(() => {
    process.env = { ...origEnv };
  });

  it('creates standard HTTP server by default when TLS is disabled', () => {
    process.env.TLS_ENABLED = 'false';
    const { server, isTls } = createHttpServer(mockApp);
    expect(isTls).toBe(false);
    expect(server).toBeInstanceOf(http.Server);
  });

  it('refuses to start when TLS is enabled but cert or key path is missing', () => {
    process.env.TLS_ENABLED = 'true';
    delete process.env.TLS_CERT_PATH;
    delete process.env.TLS_KEY_PATH;

    expect(() => createHttpServer(mockApp)).toThrow(/\[TLS ERROR\].*missing/i);
  });

  it('refuses to start when TLS certificate file does not exist', () => {
    process.env.TLS_ENABLED = 'true';
    process.env.TLS_CERT_PATH = path.join(__dirname, 'nonexistent_cert.pem');
    process.env.TLS_KEY_PATH = path.join(__dirname, 'nonexistent_key.pem');

    expect(() => createHttpServer(mockApp)).toThrow(/\[TLS ERROR\].*certificate file not found/i);
  });

  it('creates HTTPS server with explicit TLSv1.2 when valid cert and key are provided (never skips)', async () => {
    process.env.TLS_ENABLED = 'true';
    process.env.TLS_CERT_PATH = testCertPath;
    process.env.TLS_KEY_PATH = testKeyPath;

    const { server, isTls } = createHttpServer(mockApp);
    expect(isTls).toBe(true);
    expect(server).toBeInstanceOf(https.Server);

    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;

    try {
      const ca = fs.readFileSync(testCaPath);
      const res = await new Promise((resolve, reject) => {
        const req = https.request(
          {
            hostname: '127.0.0.1',
            port,
            path: '/test-ping',
            method: 'GET',
            ca,
            rejectUnauthorized: true,
          },
          (r) => {
            let data = '';
            r.on('data', (c) => (data += c));
            r.on('end', () => resolve({ status: r.statusCode, body: JSON.parse(data) }));
          }
        );
        req.on('error', reject);
        req.end();
      });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.secure).toBe(true);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('refuses to start Flower server in TLS mode when Flower TLS certs are missing or incomplete', async () => {
    process.env.TLS_ENABLED = 'true';
    delete process.env.FLOWER_CA;
    delete process.env.TLS_CERT_PATH;
    delete process.env.TLS_KEY_PATH;

    const dummyJob = {
      federation_job_id: 'JOB_TEST_TLS',
      plan: { protocol: 'flower' }
    };

    await expect(flowerService.start(dummyJob)).rejects.toThrow(/\[TLS ERROR\].*Flower TLS configuration is incomplete/i);
  });
});
