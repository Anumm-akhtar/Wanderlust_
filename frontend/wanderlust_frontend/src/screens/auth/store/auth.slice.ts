import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

export interface User {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  ph_num?: string;
  addr?: string;
}

export interface TokenPayload {
  sub: string; // email
  role: "Admin" | "Author" | "User";
  exp: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  user: User | null;
  token: string | null;
  tokenType?: string;
  role?: "Admin" | "Author" | "User";
  id?: string;
  hasInitialized?: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  loading: false,
  error: null,
  user: null,
  token: null,
  tokenType: "Bearer",
  role: undefined,
  id: undefined,
  hasInitialized: false,
};

// Utility function to decode token and extract role
const decodeToken = (token: string): TokenPayload | null => {
  try {
    return jwtDecode<TokenPayload>(token);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Initialize auth from stored token
    initAuthFromToken: (state) => {
      // Only initialize once
      if (state.hasInitialized) {
        state.loading = false;
        return;
      }

      state.loading = true;
      const token = localStorage.getItem("access_token");
      if (token) {
        const decoded = decodeToken(token);
        if (decoded && decoded.role) {
          state.isAuthenticated = true;
          state.token = token;
          state.role = decoded.role;
          state.user = { email: decoded.sub };
        } else {
          localStorage.removeItem("access_token");
          state.isAuthenticated = false;
          state.token = null;
        }
      }
      state.loading = false;
      state.hasInitialized = true;
    },

    // Handle successful login
    setLoginSuccess: (
      state,
      action: PayloadAction<{ token: string; tokenType: string; user?: User }>,
    ) => {
      state.token = action.payload.token;
      state.tokenType = action.payload.tokenType;
      localStorage.setItem("access_token", action.payload.token);

      // Decode token to get role and email
      const decoded = decodeToken(action.payload.token);
      if (decoded && decoded.role) {
        state.isAuthenticated = true;
        state.role = decoded.role;
        state.user = {
          email: decoded.sub,
          ...action.payload.user,
        };
      }
      state.loading = false;
      state.error = null;
    },

    // Handle successful registration
    setRegisterSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Set user data
    setUserData: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      if (action.payload.id) {
        state.id = action.payload.id;
      }
    },

    // Set user role
    setUserRole: (
      state,
      action: PayloadAction<"Admin" | "Author" | "User">,
    ) => {
      state.role = action.payload;
    },

    // Set error
    setError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Handle logout
    logout: (state) => {
      state.isAuthenticated = false;
      state.loading = false;
      state.user = null;
      state.token = null;
      state.role = undefined;
      state.id = undefined;
      state.error = null;
      localStorage.removeItem("access_token");
    },

    // Reset auth state
    resetAuthState: () => initialState,
  },
});

export const {
  setLoading,
  initAuthFromToken,
  setLoginSuccess,
  setRegisterSuccess,
  setUserData,
  setUserRole,
  setError,
  clearError,
  logout,
  resetAuthState,
} = authSlice.actions;

export default authSlice.reducer;
