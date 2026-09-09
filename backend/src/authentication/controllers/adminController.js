const User = require('../models/User');
const AuditService = require('../services/auditService');

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

module.exports = {
  approveUser,
  rejectUser,
  suspendUser
};
