const express = require('express');
const { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getMe, 
  changePassword 
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', requireAuth, logoutUser);
router.get('/me', requireAuth, getMe);
router.post('/change-password', requireAuth, changePassword);

module.exports = router;
