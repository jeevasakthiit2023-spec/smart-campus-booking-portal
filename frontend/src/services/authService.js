import { request } from './api';

const USER_STORAGE_KEY = 'campus_portal_user';

export const authService = {
  getCurrentUser() {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  },

  async login(username, password) {
    const res = await request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (res.user) {
      this.setCurrentUser(res.user);
    }
    return res;
  },

  async register(formData) {
    const res = await request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    if (res.user) {
      this.setCurrentUser(res.user);
    }
    return res;
  },

  async logout() {
    try {
      await request('/auth/logout/', { method: 'POST' });
    } catch {
      // Ignore network failure on logout
    }
    this.setCurrentUser(null);
  },

  async fetchDemoUsers() {
    return await request('/auth/demo-users/');
  },

  async verifyServerAuth() {
    try {
      const res = await request('/auth/user/');
      if (res.authenticated && res.user) {
        this.setCurrentUser(res.user);
        return res.user;
      }
    } catch {
      // Fallback to local stored
    }
    return this.getCurrentUser();
  }
};
