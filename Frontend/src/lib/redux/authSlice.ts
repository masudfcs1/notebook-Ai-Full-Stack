import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: number;
  uuid?: string;
  name?: string | null;
  username?: string | null;
  email: string;
  avatar?: string | null;
  role?: string;
  status?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    initializeAuth: (state) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken");
        const saved = localStorage.getItem("user");
        if (token) {
          state.token = token;
          state.isAuthenticated = true;
          if (saved) {
            try {
              state.user = JSON.parse(saved);
            } catch {
              state.user = null;
            }
          }
        }
      }
    },
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", token);
        localStorage.setItem("user", JSON.stringify(user));
      }
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(action.payload));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      }
    },
  },
});

export const { initializeAuth, setCredentials, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
