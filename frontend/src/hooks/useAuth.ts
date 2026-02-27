import { create } from 'zustand';
import { authApi, profileApi } from '../services/api';
import { wsService } from '../services/websocket';
import type { User, Profile } from '../types';

interface AuthState {
  token: string | null;
  userId: string | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  loadProfile: () => Promise<void>;
  setProfile: (profile: Profile) => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token'),
  userId: localStorage.getItem('user_id'),
  user: null,
  profile: null,
  isLoading: false,
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (email, password) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user_id', data.user_id);
    set({ token: data.access_token, userId: data.user_id, isAuthenticated: true });
    wsService.connect();
    await get().loadUser();
    await get().loadProfile();
  },

  register: async (email, password, displayName) => {
    const { data } = await authApi.register({ email, password, display_name: displayName });
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user_id', data.user_id);
    set({ token: data.access_token, userId: data.user_id, isAuthenticated: true });
    wsService.connect();
    await get().loadUser();
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    wsService.disconnect();
    set({ token: null, userId: null, user: null, profile: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const { data } = await authApi.getMe();
      set({ user: data });
    } catch {
      // Token might be invalid
    }
  },

  loadProfile: async () => {
    try {
      const { data } = await profileApi.getMyProfile();
      set({ profile: data });
    } catch {
      // Profile might not exist yet
    }
  },

  setProfile: (profile) => set({ profile }),
}));
