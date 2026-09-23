const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  // Ensure Node.js can resolve MongoDB Atlas SRV records on Windows networks
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (dnsErr) {
    // Keep default if setting DNS servers fails
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/federated_dl_auth';

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error]: ${error.message}`);
    if (error.message.includes('Authentication failed') || error.message.includes('bad auth')) {
      console.error(`\n======================================================`);
      console.error(`[Atlas Auth Error] Please verify:`);
      console.error(`1. MongoDB Atlas -> "Database Access" -> verify user "bhagwatrohit2608_db_user"`);
      console.error(`2. "Edit" password to confirm it matches exactly`);
      console.error(`3. MongoDB Atlas -> "Network Access" -> add "0.0.0.0/0" (Allow Access from Anywhere)`);
      console.error(`======================================================\n`);
    }
    throw error;
  }
};

module.exports = connectDB;

