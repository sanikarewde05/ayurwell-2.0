import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Reminder } from '../../types';

interface ReminderState {
  reminders: Reminder[];
  loading: boolean;
}

const initialState: ReminderState = {
  reminders: [
    {
      id: 1,
      title: 'Ushapan (Morning Warm Water)',
      reminderTime: '07:00',
      category: 'HYDRATION',
      description: 'Sip 2 glasses of warm water stored in a copper vessel to stimulate Agni.',
      enabled: true,
    },
    {
      id: 2,
      title: 'Mid-Day Pitta-Pacifying Lunch',
      reminderTime: '12:30',
      category: 'MEAL',
      description: 'Eat your primary meal when the sun and digestive fire (Agni) are strongest.',
      enabled: true,
    },
    {
      id: 3,
      title: 'Evening Herbal CCF Tea',
      reminderTime: '17:30',
      category: 'HERBAL_TEA',
      description: 'Sip warm cumin-coriander-fennel tea to clear evening metabolic toxins.',
      enabled: true,
    },
  ],
  loading: false,
};

const reminderSlice = createSlice({
  name: 'reminders',
  initialState,
  reducers: {
    setReminders: (state, action: PayloadAction<Reminder[]>) => {
      state.reminders = action.payload;
    },
    addReminder: (state, action: PayloadAction<Reminder>) => {
      state.reminders.push(action.payload);
    },
    toggleReminder: (state, action: PayloadAction<number>) => {
      const item = state.reminders.find(r => r.id === action.payload);
      if (item) item.enabled = !item.enabled;
    },
    deleteReminder: (state, action: PayloadAction<number>) => {
      state.reminders = state.reminders.filter(r => r.id !== action.payload);
    },
  },
});

export const { setReminders, addReminder, toggleReminder, deleteReminder } = reminderSlice.actions;
export default reminderSlice.reducer;
