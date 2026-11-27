import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { WomensHealthPlan, WomensHealthStage, WomensHealthProfileData, WomensHealthLogItem } from '../../types';

interface WomensHealthState {
  stage: WomensHealthStage | null;
  plan: WomensHealthPlan | null;
  profileData: WomensHealthProfileData | null;
  logs: WomensHealthLogItem[];
  loading: boolean;
}

const initialState: WomensHealthState = {
  stage: null,
  plan: null,
  profileData: null,
  logs: [],
  loading: false,
};

const womensHealthSlice = createSlice({
  name: 'womensHealth',
  initialState,
  reducers: {
    setStage: (state, action: PayloadAction<WomensHealthStage | null>) => {
      state.stage = action.payload;
    },
    setWomensPlan: (state, action: PayloadAction<WomensHealthPlan | null>) => {
      state.plan = action.payload;
    },
    setWomensProfileData: (state, action: PayloadAction<WomensHealthProfileData | null>) => {
      state.profileData = action.payload;
      if (action.payload?.stage) {
        state.stage = action.payload.stage;
      }
      if (action.payload?.plan) {
        state.plan = action.payload.plan;
      }
    },
    setWomensLogs: (state, action: PayloadAction<WomensHealthLogItem[]>) => {
      state.logs = action.payload;
    },
    addWomensLog: (state, action: PayloadAction<WomensHealthLogItem>) => {
      state.logs = [action.payload, ...state.logs.filter((l) => l.id !== action.payload.id)];
    },
    removeWomensLog: (state, action: PayloadAction<number>) => {
      state.logs = state.logs.filter((l) => l.id !== action.payload);
    },
    clearWomensHealthState: (state) => {
      state.stage = null;
      state.plan = null;
      state.profileData = null;
      state.logs = [];
      state.loading = false;
    },
  },
});

export const {
  setStage,
  setWomensPlan,
  setWomensProfileData,
  setWomensLogs,
  addWomensLog,
  removeWomensLog,
  clearWomensHealthState,
} = womensHealthSlice.actions;

export default womensHealthSlice.reducer;
