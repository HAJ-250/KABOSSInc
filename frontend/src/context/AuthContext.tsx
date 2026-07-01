import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiRequest, setAuthToken, getAuthToken } from '@/lib/firebase';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      apiRequest<any>('/api/auth/me')
        .then((data) => {
          setUser({
            id: data.id,
            email: data.email,
            displayName: data.display_name,
            role: data.role,
            phone: data.phone,
            emailVerified: data.email_verified,
            isActive: data.is_active,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at || data.created_at),
          });
        })
        .catch(() => {
          setAuthToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiRequest<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(data.token);
    setUser({
      id: data.user.id,
      email: data.user.email,
      displayName: data.user.displayName,
      role: data.user.role,
      phone: data.user.phone,
      emailVerified: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  const register = async (email: string, password: string, displayName: string) => {
    const data = await apiRequest<{ token: string; user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
    setAuthToken(data.token);
    setUser({
      id: data.user.id,
      email: data.user.email,
      displayName: data.user.displayName,
      role: data.user.role,
      emailVerified: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  const logout = async () => {
    setAuthToken(null);
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    await apiRequest('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  };

  const updateUserProfile = async (data: Partial<User>) => {
    const updated = await apiRequest<any>('/api/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    setUser((prev) => (prev ? { ...prev, ...updated } : null));
  };

  const deleteAccount = async () => {
    if (!user) throw new Error('Not authenticated');
    await apiRequest('/api/auth/me', { method: 'DELETE' });
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, resetPassword, updateUserProfile, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
