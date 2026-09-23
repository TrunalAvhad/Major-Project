require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/database/connection/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error(`\n⚠️  [DATABASE WARNING]: Could not connect to MongoDB Atlas (${err.message}).\n    Please verify your MongoDB Atlas Database User password and IP Whitelist (0.0.0.0/0).\n`);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`📡 API Endpoints available at: http://localhost:${PORT}/api/v1`);
  });
};

startServer();

