/**
 * Authentication & Identity Service Adapter for Researcher Desktop
 * Connects to Backend Module 1 (Auth & Role Management)
 */

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:5000/api/v1';

class AuthService {
  constructor() {
    this.tokenKey = 'medfl_researcher_token';
    this.userKey = 'medfl_researcher_user';
  }

  getToken() {
    try {
      return localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
    } catch {
      return null;
    }
  }

  setSession(token, user, remember = true) {
    const storage = remember ? localStorage : sessionStorage;
    try {
      storage.setItem(this.tokenKey, token);
      storage.setItem(this.userKey, JSON.stringify(user));
    } catch (e) {
      console.warn('Storage unavailable:', e);
    }
  }

  clearSession() {
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      sessionStorage.removeItem(this.tokenKey);
      sessionStorage.removeItem(this.userKey);
    } catch (e) {
      console.warn('Storage unavailable:', e);
    }
  }

  getCurrentUser() {
    try {
      const raw = localStorage.getItem(this.userKey) || sessionStorage.getItem(this.userKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  isAuthenticated() {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  async login(email, password, role = null, remember = true) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    try {
      const payload = { email, password };
      if (role) payload.role = role;

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data?.error?.code === 'ROLE_SELECTION_REQUIRED') {
          const err = new Error(data.error.message);
          err.code = 'ROLE_SELECTION_REQUIRED';
          err.available_roles = data.error.available_roles;
          throw err;
        }
        const errorMsg = data?.error?.message || 'Login failed. Please check credentials.';
        throw new Error(errorMsg);
      }

      const { user, access_token } = data.data;
      this.setSession(access_token, user, remember);
      return { user, access_token };
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Cannot connect to backend server at ' + API_BASE_URL + '. Is backend running on port 5000?');
      }
      throw err;
    }
  }

  async register({ name, email, password, role = 'researcher', hospital_id = null }) {
    if (!name || !email || !password) {
      throw new Error('Name, institutional email, and passphrase are required');
    }

    try {
      const payload = {
        name,
        email,
        password,
        role
      };
      if (hospital_id) {
        payload.hospital_id = hospital_id;
      }

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg = data?.error?.message || 'Registration failed.';
        throw new Error(errorMsg);
      }

      return data.data.user;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Cannot connect to backend server at ' + API_BASE_URL + '. Is backend running on port 5000?');
      }
      throw err;
    }
  }

  async logout() {
    const token = this.getToken();
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (err) {
      console.warn('Backend logout call failed, clearing local session:', err);
    } finally {
      this.clearSession();
    }
  }

  async getMe() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.user) {
          return data.data.user;
        }
      }
    } catch (err) {
      console.warn('getMe check failed:', err);
    }
    return null;
  }
}

export const authService = new AuthService();
export default authService;
