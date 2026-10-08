const { spawn } = require('child_process');
const path = require('path');

const callPythonAdapter = (payload) => {
  return new Promise((resolve, reject) => {
    const pythonPath = 'python'; // Ensure python is in PATH
    const adapterPath = path.resolve(__dirname, '../../../federation/api_adapter.py');
    const child = spawn(pythonPath, [adapterPath], {
      cwd: path.resolve(__dirname, '../../../'),
      env: { ...process.env, PYTHONPATH: '.' }
    });
    
    let stdoutData = '';
    let stderrData = '';
    
    child.stdout.on('data', (data) => { stdoutData += data.toString(); });
    child.stderr.on('data', (data) => { stderrData += data.toString(); });
    
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}. Error: ${stderrData}`));
        return;
      }
      try {
        const result = JSON.parse(stdoutData);
        if (!result.success) {
          reject(new Error(result.error));
        } else {
          resolve(result);
        }
      } catch (err) {
        reject(new Error(`Failed to parse python output: ${stdoutData}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
    
    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });
};

exports.getArchitectures = async (req, res) => {
  try {
    const result = await callPythonAdapter({ action: 'get_architectures' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.listJobs = async (req, res) => {
  try {
    const result = await callPythonAdapter({ action: 'list_jobs' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getJobDetails = async (req, res) => {
  try {
    const result = await callPythonAdapter({ action: 'get_job_details', job_id: req.params.job_id });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const result = await callPythonAdapter({ action: 'delete_job', job_id: req.params.job_id, admin_id: req.user.user_id });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createJob = async (req, res) => {
  try {
    const result = await callPythonAdapter({ action: 'create_job', ...req.body });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createRound = async (req, res) => {
  try {
    const result = await callPythonAdapter({ action: 'create_round', ...req.body });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteRound = async (req, res) => {
  try {
    const result = await callPythonAdapter({ action: 'delete_round', round_id: req.params.round_id, admin_id: req.user.user_id });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.registerParticipant = async (req, res) => {
  try {
    const result = await callPythonAdapter({ 
      action: 'register_participant', 
      job_id: req.params.job_id,
      round_id: req.params.round_id,
      participant_id: req.user.hospital_id // Use authenticated hospital ID
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.submitUpdate = async (req, res) => {
  try {
    const result = await callPythonAdapter({ 
      action: 'submit_update', 
      job_id: req.params.job_id,
      round_id: req.params.round_id,
      participant_id: req.user.hospital_id,
      handoff_dir: req.body.handoff_dir
    });
    if (!result.success) {
        return res.status(400).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


exports.aggregateRound = async (req, res) => {
  try {
    const result = await callPythonAdapter({ action: 'aggregate', ...req.body });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.listGlobalModels = async (req, res) => {
  try {
    const result = await callPythonAdapter({ action: 'list_global_models' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.evaluateModel = async (req, res) => {
  try {
    const result = await callPythonAdapter({ action: 'evaluate', ...req.body });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.promoteModel = async (req, res) => {
  try {
    const result = await callPythonAdapter({ action: 'promote', ...req.body });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getHospitalStatus = async (req, res) => {
  try {
    // M1-M3 authoritative identity chain:
    //   JWT → User document (via authMiddleware: User.findOne({ user_id: decoded.user_id }))
    //   User.hospital_id  — set at registration from req.body.hospital_id
    //                     — verified against Hospital collection at registration time
    //   user_id (USR_xxxx) is a separate random identifier; it is NEVER the hospital_id.
    const hospital_id = req.user.hospital_id;

    if (!hospital_id) {
      return res.status(400).json({
        success: false,
        error: 'No hospital_id associated with this account. Ensure you are registered as a hospital operator.'
      });
    }

    const result = await callPythonAdapter({ action: 'get_hospital_status', hospital_id });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
