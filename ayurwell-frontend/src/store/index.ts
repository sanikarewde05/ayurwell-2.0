import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import doshaReducer from './slices/doshaSlice';
import dietReducer from './slices/dietSlice';
import womensHealthReducer from './slices/womensHealthSlice';
import viruddhaReducer from './slices/viruddhaSlice';
import recipeReducer from './slices/recipeSlice';
import analyticsReducer from './slices/analyticsSlice';
import reminderReducer from './slices/reminderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dosha: doshaReducer,
    diet: dietReducer,
    womensHealth: womensHealthReducer,
    viruddha: viruddhaReducer,
    recipes: recipeReducer,
    analytics: analyticsReducer,
    reminders: reminderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
