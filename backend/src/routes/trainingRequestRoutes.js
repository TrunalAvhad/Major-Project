const express = require('express');
const {
  createTrainingRequest,
  getAllTrainingRequests,
  getMyTrainingRequests,
  getTrainingRequestById,
  participateInTrainingRequest,
  withdrawFromTrainingRequest
} = require('../controllers/trainingRequestController');

const { requireAuth } = require('../authentication/middleware/authMiddleware');
const { requireRole } = require('../authentication/middleware/roleMiddleware');
const { ROLES } = require('../authentication/permissions/roles');

const router = express.Router();

// All training request routes require valid authentication
router.use(requireAuth);

// Researcher: create training request
router.post('/', requireRole(ROLES.RESEARCHER), createTrainingRequest);

// All roles: get all training requests
router.get('/', getAllTrainingRequests);

// Researcher: get own requests
router.get('/my', requireRole(ROLES.RESEARCHER), getMyTrainingRequests);

// Get specific request details
router.get('/:request_id', getTrainingRequestById);

// Hospital Operator: Participate
router.post('/:request_id/participate', requireRole(ROLES.HOSPITAL_OPERATOR), participateInTrainingRequest);

// Hospital Operator: Withdraw
router.post('/:request_id/withdraw', requireRole(ROLES.HOSPITAL_OPERATOR), withdrawFromTrainingRequest);

module.exports = router;
