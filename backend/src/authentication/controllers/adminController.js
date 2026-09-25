const User = require('../models/User');
const TrainingRequest = require('../../models/TrainingRequest');
const StoredModel = require('../../models/StoredModel');
const Hospital = require('../models/Hospital');
const AuditService = require('../services/auditService');
const { ROLES } = require('../permissions/roles');

const updateUserStatus = async (req, res, targetStatus) => {
  const { user_id } = req.params;

  try {
    const user = await User.findOne({ user_id });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      });
    }

    user.status = targetStatus;
    await user.save();

    let actionName = 'USER_APPROVED';
    if (targetStatus === 'rejected') actionName = 'USER_REJECTED';
    if (targetStatus === 'suspended') actionName = 'USER_SUSPENDED';

    await AuditService.logEvent({
      user_id: req.user.user_id,
      action: actionName,
      resource_type: 'User',
      resource_id: user.user_id,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      success: true,
      metadata: { target_status: targetStatus }
    });

    res.status(200).json({
      success: true,
      data: {
        message: `User status updated to ${targetStatus}`,
        user: {
          user_id: user.user_id,
          account_id: user.account_id || null,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
};

const approveUser = (req, res) => updateUserStatus(req, res, 'active');
const rejectUser = (req, res) => updateUserStatus(req, res, 'rejected');
const suspendUser = (req, res) => updateUserStatus(req, res, 'suspended');

/**
 * Returns list of researchers with status === 'pending'
 */
const getPendingResearchers = async (req, res) => {
  try {
    const pendingResearchers = await User.find({
      role: ROLES.RESEARCHER,
      status: 'pending'
    }).select('user_id account_id name email status created_at');

    res.status(200).json({
      success: true,
      data: {
        researchers: pendingResearchers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
};

/**
 * Returns all registered researchers
 */
const getAllResearchers = async (req, res) => {
  try {
    const researchers = await User.find({
      role: ROLES.RESEARCHER
    }).select('user_id account_id name email status created_at last_login_at');

    res.status(200).json({
      success: true,
      data: {
        researchers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
};

/**
 * Returns distinct diseases from stored requests and models
 * Dynamic list so any disease added appears automatically
 */
const getDiseases = async (req, res) => {
  try {
    const requestDiseases = await TrainingRequest.distinct('disease');
    const modelDiseases = await StoredModel.distinct('disease');
    const combined = Array.from(new Set([...requestDiseases, ...modelDiseases])).filter(Boolean);

    res.status(200).json({
      success: true,
      data: {
        diseases: combined.length > 0 ? combined : ['Malaria', 'Pneumonia', 'COVID-19', 'Diabetic Retinopathy']
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
};

/**
 * Model report filtered by disease or request_id
 * Respects Cardinal Rule: Do not invent data. If no data exists, output "Not available"
 */
const getModelReport = async (req, res) => {
  const { disease } = req.query;

  try {
    const query = {};
    if (disease) {
      query.disease = new RegExp(`^${disease}$`, 'i');
    }

    const requests = await TrainingRequest.find(query).sort({ created_at: -1 });
    const storedModels = await StoredModel.find(query).sort({ created_at: -1 });

    const reports = requests.map(reqDoc => {
      return {
        request_id: reqDoc.request_id,
        disease: reqDoc.disease,
        task: reqDoc.task,
        status: reqDoc.status,
        model_architecture: reqDoc.model_architecture,
        model_version: reqDoc.model_version || 'v1',
        researcher: {
          id: reqDoc.researcher_id,
          name: reqDoc.researcher_name
        },
        participating_hospitals: reqDoc.participating_hospitals.map(h => ({
          hospital_id: h.hospital_id,
          hospital_name: h.hospital_name || h.hospital_id,
          status: h.status,
          joined_at: h.joined_at,
          withdrawn_at: h.withdrawn_at,
          withdrawal_reason: h.withdrawal_reason,
          training_metrics: h.training_metrics && h.training_metrics.loss !== null
            ? h.training_metrics
            : {
                current_epoch: 'Not available',
                total_epochs: 'Not available',
                loss: 'Not available',
                accuracy: 'Not available',
                status: h.status === 'WITHDRAWN' ? 'Stopped' : 'No training data available'
              }
        })),
        training_session: {
          session_id: `SES_${reqDoc.request_id.slice(-6)}`,
          status: reqDoc.status,
          created_at: reqDoc.created_at,
          resource_usage: 'Not available (waiting for runtime telemetry)'
        },
        global_model_status: reqDoc.status === 'COMPLETED' ? 'Aggregated & Certified' : 'Not available'
      };
    });

    res.status(200).json({
      success: true,
      data: {
        disease: disease || 'All Diseases',
        reports,
        stored_models: storedModels
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
};

/**
 * Returns stored models with explicit versions (v1, v2, v3)
 */
const getStoredModels = async (req, res) => {
  const { disease } = req.query;

  try {
    const filter = {};
    if (disease) {
      filter.disease = new RegExp(`^${disease}$`, 'i');
    }

    const models = await StoredModel.find(filter).sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      data: {
        models
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
};

/**
 * Telemetry endpoint: Real-time and near-real-time training node status
 * Distinguishes LIVE, STALE, COMPLETED, FAILED, NOT AVAILABLE
 */
const getTelemetry = async (req, res) => {
  try {
    const activeRequests = await TrainingRequest.find({
      status: { $in: ['OPEN', 'ACTIVE'] }
    });

    const activeHospitals = await Hospital.find({ status: 'active' });

    // Clean integration point: Only actual data is returned.
    const nodesTelemetry = activeHospitals.map(h => ({
      hospital_id: h.hospital_id,
      hospital_name: h.name,
      telemetry_state: 'NOT AVAILABLE', // Waiting for actual training node connection
      current_epoch: null,
      total_epochs: null,
      loss: null,
      accuracy: null,
      gpu_status: 'Not connected',
      vram_usage: 'Not available',
      cpu_usage: 'Not available',
      ram_usage: 'Not available',
      last_heartbeat: null
    }));

    res.status(200).json({
      success: true,
      data: {
        status: activeRequests.length > 0 ? 'ACTIVE_MONITORING' : 'IDLE',
        active_requests_count: activeRequests.length,
        hospital_nodes: nodesTelemetry,
        message: 'Waiting for training telemetry from connected hospital nodes'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
};

module.exports = {
  approveUser,
  rejectUser,
  suspendUser,
  getPendingResearchers,
  getAllResearchers,
  getDiseases,
  getModelReport,
  getStoredModels,
  getTelemetry
};
