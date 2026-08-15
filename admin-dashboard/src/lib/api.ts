const API_BASE = (import.meta.env.VITE_API_URL || 'https://kabossimage-api.onrender.com').replace(/\/+$/, '').replace(/\/api$/, '');
const API_URL = `${API_BASE}/api`;

export function getToken(): string | null {
  return localStorage.getItem('admin_token');
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('admin_token', token);
  else localStorage.removeItem('admin_token');
}

export function getStoredUser() {
  const raw = localStorage.getItem('admin_user');
  return raw ? JSON.parse(raw) : null;
}

export function setStoredUser(user: any) {
  if (user) localStorage.setItem('admin_user', JSON.stringify(user));
  else localStorage.removeItem('admin_user');
}

/**
 * Resolve a relative /uploads/... URL to a fully-qualified URL that works in
 * both dev (Vite proxy) and production. In production, images are served by
 * the backend on its own port/host, so we prefix the API origin.
 */
export function resolveImageUrl(url: string): string {
  if (!url) return url;
  // Already absolute (http/https/data/blob) - use as-is
  if (/^(https?:|data:|blob:|\/\/)/i.test(url)) return url;
// Relative uploads path - resolve against the backend origin directly.
  // This works in dev (backend on :3001) in addition to the Vite proxy, and in
  // production when VITE_API_URL points to the backend.
  if (url.startsWith('/uploads/')) {
    const base = import.meta.env.VITE_API_URL || 'https://kabossimage-api.onrender.com';
    // Strip any trailing /api path and trailing slash so we get the bare origin.
    const apiOrigin = base.replace(/\/+$/, '').replace(/\/api$/, '');
    return `${apiOrigin}${url}`;
  }
  return url;
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (!isFormData && !options.body) headers['Content-Type'] = 'application/json';
  if (!isFormData && options.body && typeof options.body === 'string') headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Build a protected media URL that works inside <img src="..."> tags.
 * Browsers cannot set Authorization headers on media requests, so the JWT is
 * passed as a `?token=` query param which the backend auth middleware accepts.
 */
export function attachmentUrl(id: string | number): string {
  const token = getToken();
  const url = `/api/admin/chat/attachments/${id}/download`;
  return token ? `${url}?token=${encodeURIComponent(token)}` : url;
}

// --- Chat / messaging API helpers ---
export const adminChatApi = {
  getConversations: () => apiRequest<any[]>('/admin/chat/conversations'),
  getCustomers: () => apiRequest<any[]>('/admin/chat/customers'),
  createConversation: (customerId: string) =>
    apiRequest<any>(`/admin/chat/customers/${customerId}/conversation`, { method: 'POST' }),
  getMessages: (conversationId: string, opts?: { before?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (opts?.before) params.set('before', String(opts.before));
    if (opts?.limit) params.set('limit', String(opts.limit));
    const qs = params.toString();
    return apiRequest<any[]>(`/admin/chat/conversations/${conversationId}/messages${qs ? `?${qs}` : ''}`);
  },
  sendMessage: (conversationId: string, content: string) =>
    apiRequest<any>(`/admin/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  uploadAttachments: (conversationId: string, files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    return apiRequest<any>(`/admin/chat/conversations/${conversationId}/attachments`, {
      method: 'POST',
      body: form,
    });
  },
  downloadAttachment: (id: string) => apiRequest<any>(`/admin/chat/attachments/${id}/download`),
setStatus: (id: string, status: string) =>
    apiRequest<any>(`/admin/chat/conversations/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteMessage: (id: string) =>
    apiRequest<any>(`/admin/chat/messages/${id}`, { method: 'DELETE' }),
};

// --- Payments (admin) ---
export const adminPaymentsApi = {
  getAll: () => apiRequest<any[]>('/payments/admin/all'),
};
