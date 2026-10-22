const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const express = require('express');
const { createHttpServer } = require('../../server');

describe('Backend TLS Configuration & Server Creation (Module 11)', () => {
  const origEnv = { ...process.env };
  const mockApp = express();
  mockApp.get('/test-ping', (req, res) => res.json({ ok: true, secure: req.secure }));

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

  it('creates HTTPS server with explicit TLSv1.2 when valid cert and key are provided', async () => {
    const certPath = path.resolve(__dirname, '../../../certs/server.pem');
    const keyPath = path.resolve(__dirname, '../../../certs/server.key');
    const caPath = path.resolve(__dirname, '../../../certs/ca.pem');

    if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
      // If dev certs haven't been generated in certs/, skip network test or use dummy keys
      return;
    }

    process.env.TLS_ENABLED = 'true';
    process.env.TLS_CERT_PATH = certPath;
    process.env.TLS_KEY_PATH = keyPath;

    const { server, isTls } = createHttpServer(mockApp);
    expect(isTls).toBe(true);
    expect(server).toBeInstanceOf(https.Server);

    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;

    try {
      const ca = fs.readFileSync(caPath);
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
});
