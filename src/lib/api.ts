import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ;

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach access token to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// On 401 — try refresh, then redirect to login
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers['Authorization'] = `Bearer ${token}`;
            return api(original);
          })
          .catch((e) => Promise.reject(e));
      }

      original._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const newToken: string = data.accessToken;
        setTokens(newToken, refreshToken);
        processQueue(null, newToken);
        original.headers['Authorization'] = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ─── Typed helpers ────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
};

export const adminApi = {
  // Users
  getUsers: (page = 1, limit = 10, role?: string, search?: string) =>
    api.get('/admin/users', { params: { page, limit, role: role || undefined, search: search || undefined } }),
  getUserById: (id: string) => api.get(`/admin/users/${id}`),
  toggleUserStatus: (id: string) => api.patch(`/admin/users/${id}/toggle-status`),

  // Profiles
  getImporters: (page = 1, limit = 10) =>
    api.get('/admin/importers', { params: { page, limit } }),
  getDistributors: (page = 1, limit = 10) =>
    api.get('/admin/distributors', { params: { page, limit } }),
  getManufacturers: (page = 1, limit = 10) =>
    api.get('/admin/manufacturers', { params: { page, limit } }),
  getInstitutions: (page = 1, limit = 10) =>
    api.get('/admin/institutions', { params: { page, limit } }),
  getOrganics: (page = 1, limit = 10) =>
    api.get('/admin/organics', { params: { page, limit } }),

  // Community — all users with COMMUNITY role (professional + non-professional)
  getCommunityUsers: (page = 1, limit = 100) =>
    api.get('/admin/users', { params: { page, limit, role: 'COMMUNITY' } }),

  // Community — professional verification
  getPendingProfessionals: () => api.get('/admin/community/pending'),
  verifyProfessional: (id: string, action: 'APPROVED' | 'REJECTED', reason?: string) =>
    api.patch(`/admin/community/${id}/verify`, { action, reason }),
  toggleFeeStatus: (id: string) => api.patch(`/admin/community/${id}/toggle-fee`),

  // Business User Verification (Importers, Distributors, Manufacturers, Institutions)
  verifyBusinessUser: (id: string, status: 'APPROVED' | 'REJECTED') =>
    api.patch(`/admin/users/${id}/verify-business`, { status }),

  // Unified requests
  getPendingRequests: () => api.get('/admin/requests/pending'),

  // Posts / Advertisements
  getPosts: (page = 1, limit = 20, role?: string, sortBy?: string) =>
    api.get(`/admin/posts?page=${page}&limit=${limit}${role && role !== 'ALL' ? `&role=${role}` : ''}${sortBy ? `&sortBy=${sortBy}` : ''}`),
  deletePost: (id: string) => api.delete(`/admin/posts/${id}`),
  bulkDeletePosts: (ids: string[]) => Promise.all(ids.map(id => api.delete(`/admin/posts/${id}`))),
};

export const healthApi = {
  check: () => api.get('/health'),
};

export default api;
