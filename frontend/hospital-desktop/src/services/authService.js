/**
 * Module 1: Authentication and Role Management Service Adapter
 * 
 * Enforces:
 * - Role-based access: ROLES.HOSPITAL_OPERATOR ('hospital_operator')
 * - Hospital Isolation: Requires valid hospital_id (e.g. HOSP_000001)
 * - JWT storage & stateless session management
 * - Zero exposure of password hashes or sensitive tokens in UI
 */

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) 
  ? import.meta.env.VITE_API_URL 
  : 'http://localhost:5000/api/v1';

// Frozen Module 1 Role definition
export const ROLES = {
  ADMIN: 'admin',
  RESEARCHER: 'researcher',
  HOSPITAL_OPERATOR: 'hospital_operator'
};

// Fallback authorized mock hospital operator for offline workstation usage
const DEFAULT_HOSPITAL_OPERATOR = {
  user_id: 'USR_h7c2d9e4a1b0',
  name: 'Dr. Marcus Vance (Lead Clinical AI Operator)',
  email: 'operator@stjude-clinical.org',
  role: ROLES.HOSPITAL_OPERATOR,
  hospital_id: 'HOSP_000001',
  hospital_name: 'St. Jude Clinical Research & AI Node',
  status: 'active',
  department: 'Medical Imaging & Radiomics Core',
  node_version: 'v2.4.1-clinical'
};

class AuthService {
  constructor() {
    const hasStorage = typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
    this.storage = hasStorage ? window.sessionStorage : {
      store: {},
      getItem(k) { return this.store[k] || null; },
      setItem(k, v) { this.store[k] = String(v); },
      removeItem(k) { delete this.store[k]; }
    };
    this.token = this.storage.getItem('medfl_hospital_token') || null;
    const storedUser = this.storage.getItem('medfl_hospital_user');
    this.currentUser = storedUser ? JSON.parse(storedUser) : null;
  }

  isAuthenticated() {
    return !!this.token && !!this.currentUser && this.currentUser.role === ROLES.HOSPITAL_OPERATOR;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getHospitalId() {
    return this.currentUser ? this.currentUser.hospital_id : null;
  }

  async login(email, password) {
    if (!email || !password) {
      throw new Error('VALIDATION_ERROR: Email and password are required');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: ROLES.HOSPITAL_OPERATOR })
      });

      if (response.ok) {
        const payload = await response.json();
        if (payload.success && payload.data) {
          const user = payload.data.user;
          // Verify hospital operator role and hospital isolation
          if (user.role !== ROLES.HOSPITAL_OPERATOR || !user.hospital_id) {
            throw new Error('HOSPITAL_ACCESS_DENIED: Only active hospital operators with assigned hospital_id may access this application.');
          }
          this.token = payload.data.access_token;
          this.currentUser = user;
          this.storage.setItem('medfl_hospital_token', this.token);
          this.storage.setItem('medfl_hospital_user', JSON.stringify(user));
          return user;
        }
      }

      // Handle non-ok responses
      if (response.status === 401 || response.status === 403) {
        const errPayload = await response.json().catch(() => null);
        const errMsg = errPayload?.error?.message || 'Invalid credentials';
        throw new Error(`AUTH_FAILED: ${errMsg}`);
      }
    } catch (err) {
      // If network/backend not reachable or offline workstation mode, check fallback
      if (err.message && (err.message.startsWith('HOSPITAL_ACCESS_DENIED') || err.message.startsWith('AUTH_FAILED'))) {
        throw err;
      }
    }

    // Offline / Standalone Clinical Node Fallback for demonstration and testing
    if (email === 'operator@stjude-clinical.org' && password === 'hospital123') {
      const user = { ...DEFAULT_HOSPITAL_OPERATOR };
      this.token = 'mock_jwt_hospital_session_token_' + Date.now();
      this.currentUser = user;
      this.storage.setItem('medfl_hospital_token', this.token);
      this.storage.setItem('medfl_hospital_user', JSON.stringify(user));
      return user;
    }

    if (email === 'researcher@consortium.org') {
      throw new Error('HOSPITAL_ACCESS_DENIED: Role "researcher" is not permitted to access local hospital client. Use Module 2.');
    }

    throw new Error('INVALID_CREDENTIALS: Invalid email or password');
  }

  async logout() {
    try {
      if (this.token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (err) {
      // Stateless logout: proceed with local cleanup regardless
    } finally {
      this.token = null;
      this.currentUser = null;
      this.storage.removeItem('medfl_hospital_token');
      this.storage.removeItem('medfl_hospital_user');
    }
  }
}

export const authService = new AuthService();
export default authService;
