const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./database/connection/db');

const authRoutes = require('./authentication/routes/authRoutes');
const adminRoutes = require('./authentication/routes/adminRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);

// Error Handling Middleware (catch all)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: 'An unexpected error occurred'
    }
  });
});

module.exports = app;
