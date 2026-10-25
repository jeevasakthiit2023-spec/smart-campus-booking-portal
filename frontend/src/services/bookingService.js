import { request } from './api';

function getStoredUserId() {
  try {
    const raw = localStorage.getItem('campus_portal_user');
    if (raw) {
      const u = JSON.parse(raw);
      return u?.id;
    }
  } catch {
    // Ignore JSON parse errors
  }
  return undefined;
}

export const bookingService = {
  async getBookings(params = {}) {
    const query = new URLSearchParams();
    if (params.user_id) query.append('user_id', params.user_id);
    if (params.my) query.append('my', 'true');
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.equipment_id) query.append('equipment_id', params.equipment_id);

    const queryString = query.toString();
    const endpoint = `/bookings/${queryString ? `?${queryString}` : ''}`;
    return await request(endpoint);
  },

  async getBookingById(id) {
    return await request(`/bookings/${id}/`);
  },

  async createBooking(bookingData) {
    const userId = bookingData.user_id || getStoredUserId();
    return await request('/bookings/', {
      method: 'POST',
      body: JSON.stringify({ ...bookingData, user_id: userId }),
    });
  },

  async cancelBooking(bookingId, reason = '') {
    const userId = getStoredUserId();
    return await request(`/bookings/${bookingId}/cancel/`, {
      method: 'POST',
      body: JSON.stringify({ reason, user_id: userId }),
    });
  },

  async updateBookingStatus(bookingId, status, adminRemarks = '') {
    const userId = getStoredUserId();
    return await request(`/bookings/${bookingId}/status/`, {
      method: 'POST',
      body: JSON.stringify({
        status,
        admin_remarks: adminRemarks,
        user_id: userId,
      }),
    });
  }
};
