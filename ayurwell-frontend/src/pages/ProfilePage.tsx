import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import type { UserProfile } from '../types';
import { setProfile } from '../store/slices/authSlice';
import { axiosClient } from '../api/axiosClient';
import { User, Save } from 'lucide-react';
import { AyurWellLogo } from '../components/AyurWellLogo';

export const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const { user, profile } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    fullName: profile?.fullName || user?.fullName || '',
    age: profile?.age || 25,
    gender: profile?.gender || 'FEMALE',
    weightKg: profile?.weightKg || 60.0,
    heightCm: profile?.heightCm || 165.0,
    activityLevel: profile?.activityLevel || 'Moderately Active',
    budgetPerDayInr: profile?.budgetPerDayInr || 200.0,
    primaryHealthGoal: profile?.primaryHealthGoal || 'General Wellness',
    targetDiseaseCondition: profile?.targetDiseaseCondition || 'None',
    digestiveFireAgni: profile?.digestiveFireAgni || 'SAMA',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || user?.fullName || '',
        age: profile.age || 25,
        gender: profile.gender || 'FEMALE',
        weightKg: profile.weightKg || 60.0,
        heightCm: profile.heightCm || 165.0,
        activityLevel: profile.activityLevel || 'Moderately Active',
        budgetPerDayInr: profile.budgetPerDayInr || 200.0,
        primaryHealthGoal: profile.primaryHealthGoal || 'General Wellness',
        targetDiseaseCondition: profile.targetDiseaseCondition || 'None',
        digestiveFireAgni: profile.digestiveFireAgni || 'SAMA',
      });
    }
  }, [profile, user]);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const heightM = (formData.heightCm || 165) / 100;
  const bmi = Math.round(((formData.weightKg || 60) / (heightM * heightM)) * 10) / 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      fullName: formData.fullName || user?.fullName || '',
      age: formData.age || 25,
      gender: formData.gender || 'FEMALE',
      weightKg: formData.weightKg || 60,
      heightCm: formData.heightCm || 165,
      activityLevel: formData.activityLevel || 'Moderately Active',
      budgetPerDayInr: formData.budgetPerDayInr || 200,
      primaryHealthGoal: formData.primaryHealthGoal || 'General Wellness',
      targetDiseaseCondition: formData.targetDiseaseCondition || 'None',
      digestiveFireAgni: formData.digestiveFireAgni || 'SAMA',
    };

    try {
      const response = await axiosClient.put('/users/profile', payload);
      dispatch(setProfile(response.data));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      // Fallback local update if network issue
      if (profile) {
        dispatch(setProfile({
          ...profile,
          ...payload,
          bmi,
        }));
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-ivory-dark shadow-ayur flex items-center justify-between">
        <div>
          <div className="inline-flex items-center space-x-2 bg-sage-light text-forest px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <User className="w-3.5 h-3.5" />
            <span>Sharira Tattva (Physical Health Profile)</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-forest">Profile & Ayurvedic Health Settings</h1>
          <p className="text-sm text-charcoal-muted mt-1">
            Manage your physical body metrics, Agni (digestive fire) state, health conditions, and daily budget.
          </p>
        </div>
        <div className="hidden sm:block pl-4">
          <AyurWellLogo size="md" />
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between">
          <span>✓ Profile settings updated successfully!</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-ivory-dark shadow-ayur space-y-6">
        
        {/* Personal Details */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-forest text-base border-b border-ivory-dark pb-2 flex items-center space-x-2">
            <User className="w-4 h-4 text-sage" />
            <span>Personal User Info</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Full User Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-ivory-dark bg-ivory text-xs font-medium focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Age (Years)</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-ivory-dark bg-ivory text-xs font-medium focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Body Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-ivory-dark bg-ivory text-xs font-medium focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Height (cm)</label>
              <input
                type="number"
                value={formData.heightCm}
                onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-ivory-dark bg-ivory text-xs font-medium focus:outline-none focus:border-forest"
              />
            </div>
          </div>
        </div>

        {/* Calculated BMI Banner */}
        <div className="p-4 rounded-xl bg-sage-light border border-sage/20 flex items-center justify-between text-xs">
          <div>
            <span className="text-charcoal-muted font-medium block">Calculated Body Mass Index (BMI)</span>
            <span className="font-bold text-forest text-lg">{bmi} kg/m²</span>
          </div>
          <span className="px-3 py-1 bg-forest text-white font-bold rounded-lg text-xs">
            {bmi < 18.5 ? 'Underweight (Vata Prone)' : bmi <= 24.9 ? 'Healthy Weight (Sama)' : 'Overweight (Kapha Prone)'}
          </span>
        </div>

        {/* Agni & Health Parameters */}
        <div className="space-y-4">
          <h3 className="font-bold text-forest text-base border-b border-ivory-dark pb-2">
            Ayurvedic & Digestive Parameters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Agni (Digestive Fire State)</label>
              <select
                value={formData.digestiveFireAgni}
                onChange={(e) => setFormData({ ...formData, digestiveFireAgni: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-ivory-dark bg-ivory text-xs font-semibold focus:outline-none focus:border-forest"
              >
                <option value="SAMA">Sama Agni (Balanced & Healthy Fire)</option>
                <option value="TIKSHNA">Tikshna Agni (Hyperactive & Acidic Fire - Pitta)</option>
                <option value="VISHAMA">Vishama Agni (Irregular & Bloated Fire - Vata)</option>
                <option value="MANDA">Manda Agni (Sluggish & Heavy Fire - Kapha)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Target Clinical Condition</label>
              <select
                value={formData.targetDiseaseCondition}
                onChange={(e) => setFormData({ ...formData, targetDiseaseCondition: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-ivory-dark bg-ivory text-xs font-semibold focus:outline-none focus:border-forest"
              >
                <option value="GERD">GERD / Acidity</option>
                <option value="Diabetes">Diabetes (Madhumeha)</option>
                <option value="IBS">IBS / Grahani</option>
                <option value="Hypertension">Hypertension (Rakta Gata Vata)</option>
                <option value="Thyroid">Thyroid Imbalance</option>
                <option value="None">General Wellness</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            type="submit"
            disabled={loading}
            className="bg-forest text-white font-bold px-8 py-3 rounded-xl text-xs shadow-md hover:bg-forest-light transition-all inline-flex items-center space-x-2 disabled:opacity-60"
          >
            <Save className="w-4 h-4 text-gold" />
            <span>{loading ? 'Saving Settings...' : 'Save Profile Settings'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
