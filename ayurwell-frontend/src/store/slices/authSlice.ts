import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User, UserProfile } from '../../types';

interface AuthState {
  token: string | null;
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialToken = localStorage.getItem('ayurwell_jwt');

const initialState: AuthState = {
  token: initialToken,
  user: null,
  profile: null,
  isAuthenticated: Boolean(initialToken),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; userId: number; email: string; fullName: string }>
    ) => {
      state.token = action.payload.token;
      state.user = {
        id: action.payload.userId,
        email: action.payload.email,
        fullName: action.payload.fullName,
        role: 'ROLE_USER',
      };
      state.isAuthenticated = true;
      localStorage.setItem('ayurwell_jwt', action.payload.token);
    },
    setProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.profile = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.profile = null;
      state.isAuthenticated = false;
      localStorage.removeItem('ayurwell_jwt');
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setCredentials, setProfile, logout, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
