/**
 * Base API client with automatic URL resolution, X-User-Id actor attachment, and unified response handling.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  let userHeaders = {};
  try {
    const rawUser = localStorage.getItem('campus_portal_user');
    if (rawUser) {
      const u = JSON.parse(rawUser);
      if (u && u.id) {
        userHeaders['X-User-Id'] = String(u.id);
      }
    }
  } catch (e) {
    // Ignore JSON parse error if storage is empty
  }

  const headers = {
    'Content-Type': 'application/json',
    ...userHeaders,
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
    credentials: 'omit',
  };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type');
    let data = null;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      let errorMessage = 'An unexpected server error occurred.';
      if (typeof data === 'object' && data !== null) {
        if (data.error) {
          errorMessage = data.error;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.non_field_errors && data.non_field_errors.length) {
          errorMessage = data.non_field_errors[0];
        } else {
          const firstKey = Object.keys(data)[0];
          if (firstKey) {
            const val = data[firstKey];
            errorMessage = `${firstKey}: ${Array.isArray(val) ? val[0] : val}`;
          }
        }
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.status) throw error;
    throw new Error(`Unable to connect to backend server at ${API_BASE_URL}. Ensure Django is running on port 8000.`);
  }
}
