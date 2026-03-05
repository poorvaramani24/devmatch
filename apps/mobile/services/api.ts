import axios from 'axios';
import { API_URL } from '@/constants/api';
import { storage } from './storage';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Only clear storage on 401 for non-auth endpoints (avoid clearing during login/register)
    const url = error.config?.url || '';
    if (error.response?.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register')) {
      await storage.clear();
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authApi = {
  register: (data: { email: string; password: string; display_name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  oauthLogin: (provider: string, code: string) =>
    api.post(`/auth/oauth/${provider}`, { code, provider }),
  getMe: () => api.get('/auth/me'),
};

// Profile
export const profileApi = {
  getMyProfile: () => api.get('/profile/me'),
  updateProfile: (data: Record<string, unknown>) => api.put('/profile/me', data),
  setupProfile: (data: Record<string, unknown>) => api.post('/profile/me/setup', data),
  getProfile: (userId: string) => api.get(`/profile/${userId}`),
  syncGithub: () => api.post('/profile/me/sync-github'),
};

// Discovery
export const discoverApi = {
  getProfiles: (page: number = 1, limit: number = 20) =>
    api.get('/discover', { params: { page, limit } }),
};

// Matches
export const matchApi = {
  likeUser: (userId: string, isSuperLike: boolean = false) =>
    api.post(`/like/${userId}`, { is_super_like: isSuperLike }),
  passUser: (userId: string) => api.post(`/pass/${userId}`),
  getMatches: () => api.get('/matches'),
  unmatch: (matchId: string) => api.delete(`/matches/${matchId}`),
  getMessages: (matchId: string, page: number = 1) =>
    api.get(`/matches/${matchId}/messages`, { params: { page } }),
  sendMessage: (matchId: string, content: string, contentType: string = 'text') =>
    api.post(`/matches/${matchId}/messages`, { content, content_type: contentType }),
};

// Badges
export const badgeApi = {
  getMyBadges: () => api.get('/badges'),
  getAllBadgeInfo: () => api.get('/badges/info'),
};

// Icebreakers
export const getIcebreakers = () => api.get('/icebreakers');
