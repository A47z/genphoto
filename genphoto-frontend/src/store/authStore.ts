import { create } from 'zustand';
import { useGenerateStore } from './generateStore';
import type { UserProfile } from '../types';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isLoggedIn: boolean;
  setAuth: (token: string, user: Partial<UserProfile>) => void;
  setUser: (user: UserProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: null,
  isLoggedIn: !!localStorage.getItem('token'),

  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user: user as UserProfile, isLoggedIn: true });
  },

  setUser: (user) => set({ user }),

  logout: () => {
    localStorage.removeItem('token');
    useGenerateStore.getState().clearResult();
    set({ token: null, user: null, isLoggedIn: false });
  },
}));
