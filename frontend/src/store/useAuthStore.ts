import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  initializeAuth: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  token: null,

  initializeAuth: (token) => {
    set({ isAuthenticated: !!token, token });
  },
}));
