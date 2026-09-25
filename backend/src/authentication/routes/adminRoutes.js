const express = require('express');
const {
  approveUser,
  rejectUser,
  suspendUser,
  getPendingResearchers,
  getAllResearchers,
  getDiseases,
  getModelReport,
  getStoredModels,
  getTelemetry
} = require('../controllers/adminController');

const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { ROLES } = require('../permissions/roles');

const router = express.Router();

// All admin routes require authentication and ADMIN role
router.use(requireAuth, requireRole(ROLES.ADMIN));

// User & Researcher Approval Management
router.get('/researchers/pending', getPendingResearchers);
router.get('/researchers', getAllResearchers);
router.post('/users/:user_id/approve', approveUser);
router.post('/users/:user_id/reject', rejectUser);
router.post('/users/:user_id/suspend', suspendUser);

// Reporting, Models & Telemetry
router.get('/diseases', getDiseases);
router.get('/reports', getModelReport);
router.get('/stored-models', getStoredModels);
router.get('/telemetry', getTelemetry);

module.exports = router;
