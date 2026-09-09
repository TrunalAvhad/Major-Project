const express = require('express');
const { approveUser, rejectUser, suspendUser } = require('../controllers/adminController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { ROLES } = require('../permissions/roles');

const router = express.Router();

// All admin routes require authentication and ADMIN role
router.use(requireAuth, requireRole(ROLES.ADMIN));

router.post('/users/:user_id/approve', approveUser);
router.post('/users/:user_id/reject', rejectUser);
router.post('/users/:user_id/suspend', suspendUser);

module.exports = router;
