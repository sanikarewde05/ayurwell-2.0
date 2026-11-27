import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AnalyticsSummary } from '../../types';

interface AnalyticsState {
  summary: AnalyticsSummary | null;
  loading: boolean;
}

const initialState: AnalyticsState = {
  summary: null,
  loading: false,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setSummary: (state, action: PayloadAction<AnalyticsSummary | null>) => {
      state.summary = action.payload;
    },
    clearAnalyticsState: (state) => {
      state.summary = null;
      state.loading = false;
    },
  },
});

export const { setSummary, clearAnalyticsState } = analyticsSlice.actions;
export default analyticsSlice.reducer;
