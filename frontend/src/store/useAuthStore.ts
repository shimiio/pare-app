import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
  setToken: (token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  token: null,
  isLoading: true,

  setToken: (token) => {
    set({ isAuthenticated: true, token, isLoading: false });
  },

  clearAuth: () => {
    set({ isAuthenticated: false, token: null, isLoading: false });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },
}));
