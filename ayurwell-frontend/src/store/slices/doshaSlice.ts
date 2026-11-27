import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { DoshaAssessmentResult } from '../../types';

interface DoshaState {
  result: DoshaAssessmentResult | null;
  quizAnswers: Record<string, string>;
  loading: boolean;
}

const initialState: DoshaState = {
  result: null,
  quizAnswers: {},
  loading: false,
};

const doshaSlice = createSlice({
  name: 'dosha',
  initialState,
  reducers: {
    setAnswer: (state, action: PayloadAction<{ questionId: string; dosha: string }>) => {
      state.quizAnswers[action.payload.questionId] = action.payload.dosha;
    },
    setResult: (state, action: PayloadAction<DoshaAssessmentResult>) => {
      state.result = action.payload;
    },
    resetQuiz: (state) => {
      state.quizAnswers = {};
    },
    clearDoshaState: (state) => {
      state.result = null;
      state.quizAnswers = {};
      state.loading = false;
    },
  },
});

export const { setAnswer, setResult, resetQuiz, clearDoshaState } = doshaSlice.actions;
export default doshaSlice.reducer;
