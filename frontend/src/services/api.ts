import { apiRequest } from '@/lib/firebase';

export const api = {
  health: () => apiRequest<{ status: string }>('/health'),

  sendContact: (data: any) =>
    apiRequest('/contacts', { method: 'POST', body: JSON.stringify(data) }),

  getBookings: () => apiRequest<any[]>('/bookings'),
  createBooking: (data: any) =>
    apiRequest<any>('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  updateBookingStatus: (id: string, status: string) =>
    apiRequest<any>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getConversations: () => apiRequest<any[]>('/messages/conversations'),
  getMessages: (conversationId: string) =>
    apiRequest<any[]>(`/messages/${conversationId}`),
  sendMessage: (data: any) =>
    apiRequest<any>('/messages', { method: 'POST', body: JSON.stringify(data) }),

  getAdminStats: () => apiRequest<any>('/admin/stats'),
  getAdminBookings: () => apiRequest<any[]>('/admin/bookings'),
  getAdminUsers: () => apiRequest<any[]>('/admin/users'),
  getAdminContacts: () => apiRequest<any[]>('/admin/contacts'),
  updateSettings: (data: any) =>
    apiRequest<any>('/admin/settings', { method: 'PATCH', body: JSON.stringify(data) }),
  getSettings: () => apiRequest<any>('/admin/settings'),
};
