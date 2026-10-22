const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const app = require('./src/app');
const connectDB = require('./src/database/connection/db');
const { initSocket } = require('./src/socket');

const PORT = process.env.PORT || 5000;

/**
 * Creates the HTTP or HTTPS server based on TLS_ENABLED environment variable.
 * Refuses to start with a clear error if TLS is enabled but certificate/key files
 * are missing or unreadable. No silent fallback to HTTP.
 */
const createHttpServer = (expressApp, options = {}) => {
  const isTls = (process.env.TLS_ENABLED === 'true' || options.tls === true);

  if (isTls) {
    const certPath = options.certPath || process.env.TLS_CERT_PATH;
    const keyPath = options.keyPath || process.env.TLS_KEY_PATH;

    if (!certPath || !keyPath) {
      throw new Error(
        `[TLS ERROR] TLS is enabled (TLS_ENABLED=true), but TLS_CERT_PATH or TLS_KEY_PATH is missing. ` +
        `Received certPath="${certPath}", keyPath="${keyPath}". Refusing to start.`
      );
    }

    const resolvedCert = path.resolve(certPath);
    const resolvedKey = path.resolve(keyPath);

    if (!fs.existsSync(resolvedCert)) {
      throw new Error(
        `[TLS ERROR] TLS certificate file not found or unreadable at "${resolvedCert}". Refusing to start.`
      );
    }
    if (!fs.existsSync(resolvedKey)) {
      throw new Error(
        `[TLS ERROR] TLS private key file not found or unreadable at "${resolvedKey}". Refusing to start.`
      );
    }

    let cert, key;
    try {
      cert = fs.readFileSync(resolvedCert);
      key = fs.readFileSync(resolvedKey);
    } catch (readErr) {
      throw new Error(`[TLS ERROR] Failed to read TLS certificate or private key: ${readErr.message}`);
    }

    const httpsOptions = {
      cert,
      key,
      minVersion: 'TLSv1.2',
    };

    return { server: https.createServer(httpsOptions, expressApp), isTls: true };
  }

  return { server: http.createServer(expressApp), isTls: false };
};

const startServer = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error(`\n⚠️  [DATABASE WARNING]: Could not connect to MongoDB Atlas (${err.message}).\n    Please verify your MongoDB Atlas Database User password and IP Whitelist (0.0.0.0/0).\n`);
  }

  const { server, isTls } = createHttpServer(app);
  initSocket(server);

  server.listen(PORT, () => {
    const protocol = isTls ? 'https' : 'http';
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT} (${protocol.toUpperCase()})`);
    console.log(`📡 API Endpoints available at: ${protocol}://localhost:${PORT}/api/v1`);
  });

  return server;
};

if (require.main === module) {
  startServer();
}

module.exports = { createHttpServer, startServer };

