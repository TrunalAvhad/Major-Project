/**
 * Federation Service — M9 Secure Federation Layer API
 * Communicates with backend /api/v1/federation endpoints.
 * Never accesses SQLite, MongoDB, or raw artifacts directly.
 */

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:5000/api/v1';

function getToken() {
  try {
    return localStorage.getItem('medfl_researcher_token') || sessionStorage.getItem('medfl_researcher_token');
  } catch {
    return null;
  }
}

function getHeaders() {
  const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function request(method, path, body) {
  const opts = { method, headers: getHeaders() };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE_URL}/federation${path}`, opts);
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data?.error?.message || (typeof data?.error === 'string' ? data.error : null) || `Request failed (${res.status})`;
    throw new Error(errorMsg);
  }
  return data;
}

// ── Admin: Federation Jobs ──────────────────────────────────
export const getArchitectures = () => request('GET', '/architectures');
export const getJobs = () => request('GET', '/jobs');
export const getJobDetails = (jobId) => request('GET', `/jobs/${encodeURIComponent(jobId)}`);
export const createJob = (jobData) => request('POST', '/jobs', jobData);
export const deleteJob = (jobId) => request('DELETE', `/jobs/${encodeURIComponent(jobId)}`);

// ── Admin: Rounds ───────────────────────────────────────────
export const createRound = (roundData) => request('POST', '/rounds', roundData);
export const aggregateRound = (jobId, roundId) => request('POST', '/rounds/aggregate', { job_id: jobId, round_id: roundId });
export const deleteRound = (roundId) => request('DELETE', `/rounds/${encodeURIComponent(roundId)}`);

// ── Admin: Global Models, Evaluation, Promotion ─────────────
export const getGlobalModels = () => request('GET', '/models');
export const evaluateModel = (globalModelId) => request('POST', '/models/evaluate', { global_model_id: globalModelId });
export const promoteModel = (globalModelId, evalRecordId) => request('POST', '/models/promote', { global_model_id: globalModelId, eval_record_id: evalRecordId });

// ── Hospital: Own federation status ─────────────────────────
export const getHospitalFederationStatus = () => request('GET', '/hospital-status');
export const registerParticipant = (jobId, roundId) => request('POST', `/jobs/${encodeURIComponent(jobId)}/rounds/${encodeURIComponent(roundId)}/participate`);
export const submitHandoff = (jobId, roundId, handoffDir) => request('POST', `/jobs/${encodeURIComponent(jobId)}/rounds/${encodeURIComponent(roundId)}/submit`, { handoff_dir: handoffDir });
