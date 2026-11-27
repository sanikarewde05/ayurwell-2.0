import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { addReminder, toggleReminder, deleteReminder } from '../store/slices/reminderSlice';
import { Bell, Plus, Trash2 } from 'lucide-react';

export const RemindersPage: React.FC = () => {
  const dispatch = useDispatch();
  const { reminders } = useSelector((state: RootState) => state.reminders);

  const [title, setTitle] = useState('');
  const [time, setTime] = useState('08:00');
  const [category, setCategory] = useState<'MEAL' | 'HYDRATION' | 'HERBAL_TEA' | 'MEDITATION'>('HYDRATION');
  const [description, setDescription] = useState('');

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    dispatch(
      addReminder({
        id: Date.now(),
        title,
        reminderTime: time,
        category,
        description: description || 'Daily Ayurvedic routine alert',
        enabled: true,
      })
    );

    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-ivory-dark shadow-ayur flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-sage-light text-forest px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>Dinacharya Smriti (Routine Alerts)</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-forest">Meal Timetable & Diet Reminders</h1>
          <p className="text-sm text-charcoal-muted mt-1">
            Configure hydration, meal timing, and herbal tea alerts synchronized with your Prakriti rhythm.
          </p>
        </div>
      </div>

      {/* Grid: Create Reminder & List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Form Box */}
        <div className="bg-white p-5 rounded-2xl border border-ivory-dark shadow-ayur space-y-4">
          <h3 className="font-bold text-forest text-sm flex items-center space-x-2">
            <Plus className="w-4 h-4 text-sage" />
            <span>Create New Reminder</span>
          </h3>

          <form onSubmit={handleAddReminder} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Title</label>
              <input
                type="text"
                placeholder="e.g. Sip Warm CCF Tea"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-ivory-dark bg-ivory text-xs font-medium focus:outline-none focus:border-forest"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-ivory-dark bg-ivory text-xs font-semibold focus:outline-none focus:border-forest"
              >
                <option value="HYDRATION">HYDRATION (Ushapan)</option>
                <option value="MEAL">MEAL (Ahara)</option>
                <option value="HERBAL_TEA">HERBAL TEA (Kwatha)</option>
                <option value="MEDITATION">MEDITATION (Dhyana)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-ivory-dark bg-ivory text-xs font-mono font-bold focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Instruction Note</label>
              <input
                type="text"
                placeholder="e.g. 2 glasses warm copper water"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-ivory-dark bg-ivory text-xs font-medium focus:outline-none focus:border-forest"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-forest text-white font-bold py-2.5 rounded-xl text-xs shadow-md hover:bg-forest-light transition-all flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4 text-gold" />
              <span>Save Alert</span>
            </button>
          </form>
        </div>

        {/* Active Reminders List */}
        <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-ivory-dark shadow-ayur space-y-4">
          <h3 className="font-bold text-forest text-sm">Active Schedule & Alerts</h3>

          <div className="space-y-3">
            {reminders.map((r) => (
              <div
                key={r.id}
                className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                  r.enabled
                    ? 'bg-ivory border-ivory-dark'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => dispatch(toggleReminder(r.id))}
                    className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold ${
                      r.enabled ? 'bg-forest border-forest text-white' : 'border-gray-300 bg-white'
                    }`}
                  >
                    {r.enabled && '✓'}
                  </button>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-forest text-sm">{r.title}</h4>
                      <span className="px-2 py-0.5 rounded bg-sage-light text-forest text-[10px] font-bold">
                        {r.category}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-muted mt-0.5">{r.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="font-mono text-sm font-bold text-forest bg-white px-3 py-1 rounded-lg border border-sage/30">
                    {r.reminderTime}
                  </span>
                  <button
                    onClick={() => dispatch(deleteReminder(r.id))}
                    className="text-terracotta hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
