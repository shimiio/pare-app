import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
  initializeAuth: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  token: null,
  isLoading: true,

  initializeAuth: (token) => {
    set({ isAuthenticated: !!token, token, isLoading: false });
  },
}));
