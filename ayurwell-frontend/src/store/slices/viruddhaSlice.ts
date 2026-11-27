import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ViruddhaCheckResponse } from '../../types';

interface ViruddhaState {
  selectedFoods: string[];
  report: ViruddhaCheckResponse | null;
  loading: boolean;
}

const initialState: ViruddhaState = {
  selectedFoods: ['Warm Cow Milk', 'Freshwater Fish'],
  report: {
    compatible: false,
    compatibilityScore: 30,
    conflicts: [
      {
        foodA: 'Warm Cow Milk',
        foodB: 'Freshwater Fish',
        incompatibilityType: 'Virya-Viruddha (Potency Conflict)',
        hazardReason: 'Milk is Shita (Cooling) while Fish is Ushna (Heating). Combining them obstructs body channels (Srotas) and causes skin toxins (Kustha).',
        antidote: 'Consume warm ginger tea or neem water if accidentally ingested.'
      }
    ],
    generalAdvice: [
      'Avoid consuming incompatible food pairs in the same meal.',
      'Allow at least a 2 to 3-hour interval between consuming opposing potencies.'
    ]
  },
  loading: false,
};

const viruddhaSlice = createSlice({
  name: 'viruddha',
  initialState,
  reducers: {
    addFood: (state, action: PayloadAction<string>) => {
      if (!state.selectedFoods.includes(action.payload)) {
        state.selectedFoods.push(action.payload);
      }
    },
    removeFood: (state, action: PayloadAction<string>) => {
      state.selectedFoods = state.selectedFoods.filter(f => f !== action.payload);
    },
    clearFoods: (state) => {
      state.selectedFoods = [];
      state.report = null;
    },
    setReport: (state, action: PayloadAction<ViruddhaCheckResponse>) => {
      state.report = action.payload;
    },
  },
});

export const { addFood, removeFood, clearFoods, setReport } = viruddhaSlice.actions;
export default viruddhaSlice.reducer;
