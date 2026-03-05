import { create } from 'zustand';
import { authApi, profileApi } from '@/services/api';
import { wsService } from '@/services/websocket';
import { storage } from '@/services/storage';
import type { User, Profile } from '@/types';

interface AuthState {
  token: string | null;
  userId: string | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  loadProfile: () => Promise<void>;
  setProfile: (profile: Profile) => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  token: null,
  userId: null,
  user: null,
  profile: null,
  isLoading: false,
  isAuthenticated: false,
  isHydrated: false,

  hydrate: async () => {
    const token = await storage.getToken();
    const userId = await storage.getUserId();
    if (token) {
      set({ token, userId, isAuthenticated: true });
      await get().loadUser();
      await get().loadProfile();
      wsService.connect();
    }
    set({ isHydrated: true });
  },

  login: async (email, password) => {
    const { data } = await authApi.login({ email, password });
    const token = data.access_token;
    const userId = String(data.user_id);
    await storage.setToken(token);
    await storage.setUserId(userId);
    set({ token, userId, isLoading: true });
    wsService.connect();
    await get().loadUser();
    await get().loadProfile();
    // Set isAuthenticated last so route protection fires after profile is loaded
    set({ isAuthenticated: true, isLoading: false });
  },

  register: async (email, password, displayName) => {
    const { data } = await authApi.register({ email, password, display_name: displayName });
    const token = data.access_token;
    const userId = String(data.user_id);
    await storage.setToken(token);
    await storage.setUserId(userId);
    set({ token, userId, isLoading: true });
    wsService.connect();
    await get().loadUser();
    // No loadProfile — new users won't have one yet
    set({ isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await storage.clear();
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
