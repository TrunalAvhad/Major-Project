const express = require('express');
const { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getMe, 
  getRolesByEmail,
  changePassword 
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/roles', getRolesByEmail);
router.post('/logout', requireAuth, logoutUser);
router.get('/me', requireAuth, getMe);
router.post('/change-password', requireAuth, changePassword);

module.exports = router;
