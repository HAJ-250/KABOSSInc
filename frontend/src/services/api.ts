import { apiRequest, getApiUrl, getAuthToken } from '@/lib/firebase';

/**
 * Build a protected media URL that works inside <img src="..."> tags.
 * Browsers cannot set Authorization headers on media requests, so the JWT is
 * passed as a `?token=` query param which the backend auth middleware accepts.
 */
export function attachmentUrl(id: string | number): string {
  const token = getAuthToken();
  const url = `${getApiUrl()}/messages/attachments/${id}/download`;
  return token ? `${url}?token=${encodeURIComponent(token)}` : url;
}

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

  getQuotes: () => apiRequest<any[]>('/quotes'),
  createQuote: (data: any) =>
    apiRequest<any>('/quotes', { method: 'POST', body: JSON.stringify(data) }),
  updateQuoteStatus: (id: string, status: string) =>
    apiRequest<any>(`/quotes/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getConversations: () => apiRequest<any[]>('/messages/conversations'),
  createConversation: () => apiRequest<any>('/messages/conversations', { method: 'POST' }),
  getMessages: (conversationId: string, opts?: { before?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (opts?.before) params.set('before', String(opts.before));
    if (opts?.limit) params.set('limit', String(opts.limit));
    const qs = params.toString();
    return apiRequest<any[]>(`/messages/${conversationId}${qs ? `?${qs}` : ''}`);
  },
  sendMessage: (data: any) =>
    apiRequest<any>('/messages', { method: 'POST', body: JSON.stringify(data) }),
  uploadAttachments: (conversationId: string, files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    return apiRequest<any>(`/messages/${conversationId}/attachments`, {
      method: 'POST',
      body: form,
      headers: {}, // let fetch set multipart boundary
    });
  },
  downloadAttachment: (id: string) => apiRequest<any>(`/messages/attachments/${id}/download`),
  markConversationRead: (conversationId: string) =>
    apiRequest<any>(`/messages/${conversationId}/read`, { method: 'PATCH' }),
  deleteMessage: (id: string) =>
    apiRequest<any>(`/messages/${id}`, { method: 'DELETE' }),

getNotifications: () => apiRequest<any[]>('/notifications'),
  markNotificationRead: (id: string) =>
    apiRequest<any>(`/notifications/${id}/read`, {
      method: 'PATCH',
      body: JSON.stringify({ isRead: true }),
    }),
  downloadNotification: (id: string) => {
    const token = getAuthToken();
    const url = `${getApiUrl()}/notifications/${id}/download`;
    return token ? `${url}?token=${encodeURIComponent(token)}` : url;
  },

getDownloads: () => apiRequest<any[]>('/downloads'),
  downloadFile: (id: string) => apiRequest<any>(`/downloads/${id}/file`),

  getPayments: () => apiRequest<any[]>('/payments'),
  initiatePayment: (data: any) =>
    apiRequest<any>('/payments/initiate', { method: 'POST', body: JSON.stringify(data) }),
  confirmPayment: (paymentId: string | number) =>
    apiRequest<any>('/payments/confirm', { method: 'POST', body: JSON.stringify({ paymentId }) }),

  getAdminStats: () => apiRequest<any>('/admin/stats'),
  getAdminBookings: () => apiRequest<any[]>('/admin/bookings'),
  getAdminUsers: () => apiRequest<any[]>('/admin/users'),
  getAdminContacts: () => apiRequest<any[]>('/admin/contacts'),
  updateSettings: (data: any) =>
    apiRequest<any>('/admin/settings', { method: 'PATCH', body: JSON.stringify(data) }),
  getSettings: () => apiRequest<any>('/admin/settings'),
};
