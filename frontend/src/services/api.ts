import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
      window.location.href = '/login';
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
