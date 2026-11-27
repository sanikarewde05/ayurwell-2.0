import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { DietPlan } from '../../types';

interface DietState {
  currentPlan: DietPlan | null;
  activeDisease: string;
  activeSeason: string;
  maxBudget: number;
  loading: boolean;
}

const initialState: DietState = {
  currentPlan: null,
  activeDisease: '',
  activeSeason: 'VASANTA',
  maxBudget: 200,
  loading: false,
};

const dietSlice = createSlice({
  name: 'diet',
  initialState,
  reducers: {
    setCurrentPlan: (state, action: PayloadAction<DietPlan | null>) => {
      state.currentPlan = action.payload;
    },
    setFilter: (state, action: PayloadAction<{ disease?: string; season?: string; maxBudget?: number }>) => {
      if (action.payload.disease !== undefined) state.activeDisease = action.payload.disease;
      if (action.payload.season !== undefined) state.activeSeason = action.payload.season;
      if (action.payload.maxBudget !== undefined) state.maxBudget = action.payload.maxBudget;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearDietState: (state) => {
      state.currentPlan = null;
      state.activeDisease = '';
      state.activeSeason = 'VASANTA';
      state.maxBudget = 200;
      state.loading = false;
    },
  },
});

export const { setCurrentPlan, setFilter, setLoading, clearDietState } = dietSlice.actions;
export default dietSlice.reducer;
