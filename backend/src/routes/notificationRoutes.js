const express = require('express');
const Notification = require('../models/Notification');
const { requireAuth } = require('../authentication/middleware/authMiddleware');
const { requireRole } = require('../authentication/middleware/roleMiddleware');
const { ROLES } = require('../authentication/permissions/roles');

const router = express.Router();
router.use(requireAuth, requireRole(ROLES.HOSPITAL_OPERATOR));

// A hospital operator only ever sees and marks its own hospital's notifications.
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({ hospital_id: req.user.hospital_id })
      .sort({ created_at: -1 }).limit(200).select('-_id -__v').lean();
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/read', async (req, res) => {
  try {
    await Notification.updateMany({ hospital_id: req.user.hospital_id, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
