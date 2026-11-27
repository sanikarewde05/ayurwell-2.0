import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import {
  setStage,
  setWomensProfileData,
  setWomensLogs,
  addWomensLog,
  removeWomensLog,
} from '../store/slices/womensHealthSlice';
import { setProfile } from '../store/slices/authSlice';
import { axiosClient } from '../api/axiosClient';
import type {
  WomensHealthStage,
  WomensHealthLogItem,
} from '../types';
import {
  Heart,
  Calendar as CalendarIcon,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Info,
  Droplets,
  Moon,
  Leaf,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Save,
  X,
  Apple,
  TrendingUp,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface JourneyCardConfig {
  id: WomensHealthStage;
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
  colorScheme: {
    bg: string;
    border: string;
    hoverBorder: string;
    text: string;
    accent: string;
    btn: string;
  };
  description: string;
  features: string[];
}

const JOURNEY_OPTIONS: JourneyCardConfig[] = [
  {
    id: 'MENSTRUATION',
    title: 'Menstrual Cycle',
    subtitle: 'Rajaswala Paricharya',
    icon: '🩸',
    badge: 'Monthly Rhythm',
    colorScheme: {
      bg: 'bg-rose-50/70',
      border: 'border-rose-200',
      hoverBorder: 'hover:border-rose-400',
      text: 'text-rose-950',
      accent: 'text-rose-700',
      btn: 'bg-rose-700 hover:bg-rose-800 text-white',
    },
    description: 'Track your natural monthly rhythm, period symptoms, cycle phases, and phase-specific Ayurvedic nutrition.',
    features: [
      'Cycle duration & next period calculation',
      'Period symptom, flow & cramp tracking',
      'Rajaswala care & iron-rich superfoods',
      'Apana Vayu downward balance & rest',
    ],
  },
  {
    id: 'PCOS',
    title: 'PCOS Support',
    subtitle: 'Artava Kshaya Harmony',
    icon: '🌸',
    badge: 'Hormonal Balance',
    colorScheme: {
      bg: 'bg-purple-50/70',
      border: 'border-purple-200',
      hoverBorder: 'hover:border-purple-400',
      text: 'text-purple-950',
      accent: 'text-purple-700',
      btn: 'bg-purple-700 hover:bg-purple-800 text-white',
    },
    description: 'Support hormonal harmony, insulin sensitivity, seed cycling, and ovarian health with tailored Ayurvedic protocols.',
    features: [
      'Low-glycemic ancient grain meal guidance',
      'Seed cycling protocol (Phase 1 & Phase 2)',
      'Circadian fasting & Kapha-Vata balance',
      'Anti-androgen herbs & symptom tracking',
    ],
  },
  {
    id: 'PREGNANCY',
    title: 'Pregnancy Care',
    subtitle: 'Garbhini Paricharya',
    icon: '🤰',
    badge: 'Prenatal Vitality',
    colorScheme: {
      bg: 'bg-amber-50/70',
      border: 'border-amber-200',
      hoverBorder: 'hover:border-amber-400',
      text: 'text-amber-950',
      accent: 'text-amber-800',
      btn: 'bg-amber-700 hover:bg-amber-800 text-white',
    },
    description: 'Nourish maternal Ojas, fetal tissue development, and trimester-by-trimester Garbhini Paricharya.',
    features: [
      'Trimester 1, 2 & 3 dynamic protocols',
      'Folate, calcium, and cellular hydration',
      'Maternal calming & Pada Abhyanga care',
      'Wholesome, safe Ayurvedic Ojas foods',
    ],
  },
  {
    id: 'POSTPARTUM',
    title: 'Postpartum Recovery',
    subtitle: 'Sutika Paricharya',
    icon: '🤱',
    badge: 'Sacred 40-Day Healing',
    colorScheme: {
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-200',
      hoverBorder: 'hover:border-emerald-400',
      text: 'text-emerald-950',
      accent: 'text-emerald-700',
      btn: 'bg-emerald-700 hover:bg-emerald-800 text-white',
    },
    description: 'Rebuild maternal vitality, calm aggravated Vata, support lactation (Stanya), and rejuvenate depleted Dhatus.',
    features: [
      'Sacred 40-day recovery & Udaraveshtana wrapping',
      'Stanyajanana (healthy lactation) superfoods',
      'Warm A2 ghee, gond & methi nourishment',
      'Restorative sleep & deep nervous system calm',
    ],
  },
  {
    id: 'MENOPAUSE',
    title: 'Menopause Wellness',
    subtitle: 'Vata Longevity Transition',
    icon: '🌿',
    badge: 'Graceful Transition',
    colorScheme: {
      bg: 'bg-teal-50/70',
      border: 'border-teal-200',
      hoverBorder: 'hover:border-teal-400',
      text: 'text-teal-950',
      accent: 'text-teal-800',
      btn: 'bg-teal-700 hover:bg-teal-800 text-white',
    },
    description: 'Pacify Vata, sustain bone mineral density, soothe hot flashes, and cultivate vitality during this natural transition.',
    features: [
      'Hot flashes & night sweats tracking',
      'Asthi Dhatu (bone density) plant calcium',
      'Natural phytoestrogen & sesame guidance',
      'Sheetali cooling pranayama & restful sleep',
    ],
  },
];

export const WomensHealthPage: React.FC = () => {
  const dispatch = useDispatch();
  const { user, profile } = useSelector((state: RootState) => state.auth);
  const { result: doshaResult } = useSelector((state: RootState) => state.dosha);
  const { profileData, logs } = useSelector((state: RootState) => state.womensHealth);

  // Journey Selection State
  const [isChangingJourney, setIsChangingJourney] = useState<boolean>(false);
  const [showChangeConfirm, setShowChangeConfirm] = useState<boolean>(false);

  // Loading & Error States
  const [loading, setLoading] = useState<boolean>(true);
  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Profile Edit / Setup Modal
  const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
  const [formStage, setFormStage] = useState<WomensHealthStage>('MENSTRUATION');
  const [formLastPeriod, setFormLastPeriod] = useState<string>('');
  const [formCycleLen, setFormCycleLen] = useState<number>(28);
  const [formPeriodDuration, setFormPeriodDuration] = useState<number>(5);
  const [formFlow, setFormFlow] = useState<string>('Medium');
  const [formCramps, setFormCramps] = useState<string>('Mild');
  const [formMood, setFormMood] = useState<string>('Balanced');
  const [formEnergy, setFormEnergy] = useState<string>('Moderate');
  const [formSymptoms, setFormSymptoms] = useState<string[]>([]);
  const [formTrimester, setFormTrimester] = useState<number>(1);
  const [formMenopauseSymptoms, setFormMenopauseSymptoms] = useState<string[]>([]);
  const [formHotFlashFreq, setFormHotFlashFreq] = useState<number>(0);
  const [formSleepQuality, setFormSleepQuality] = useState<number>(8);
  const [formIronTarget, setFormIronTarget] = useState<number>(18.0);

  // Daily Check-in / Log Modal
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [logType, setLogType] = useState<string>('WELLNESS');
  const [logFlow, setLogFlow] = useState<string>('Medium');
  const [logCramps, setLogCramps] = useState<string>('Mild');
  const [logMood, setLogMood] = useState<string>('Balanced');
  const [logEnergy, setLogEnergy] = useState<string>('Moderate');
  const [logSymptoms, setLogSymptoms] = useState<string[]>([]);
  const [logIronMg, setLogIronMg] = useState<number>(18.0);
  const [logWaterL, setLogWaterL] = useState<number>(2.5);
  const [logSleepHours, setLogSleepHours] = useState<number>(8);
  const [logNotes, setLogNotes] = useState<string>('');
  const [savingLog, setSavingLog] = useState<boolean>(false);

  // Calendar View State
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // 1. Fetch Profile & Logs on Mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!profile) {
        try {
          const profRes = await axiosClient.get('/users/profile');
          if (profRes.data) {
            dispatch(setProfile(profRes.data));
          }
        } catch {
          // Gracefully continue with demo session
        }
      }

      // Fetch Women's Health Profile
      try {
        const whRes = await axiosClient.get('/womens-health/profile');
        if (whRes.status === 200 && whRes.data) {
          dispatch(setWomensProfileData(whRes.data));
          if (whRes.data.stage && whRes.data.stage !== 'NONE') {
            dispatch(setStage(whRes.data.stage));
            setFormStage(whRes.data.stage);
            setIsChangingJourney(false);
          } else {
            setIsChangingJourney(true);
          }
          if (whRes.data.lastPeriodDate) setFormLastPeriod(whRes.data.lastPeriodDate);
          if (whRes.data.cycleLengthDays) setFormCycleLen(whRes.data.cycleLengthDays);
          if (whRes.data.periodDurationDays) setFormPeriodDuration(whRes.data.periodDurationDays);
          if (whRes.data.flowLevel) setFormFlow(whRes.data.flowLevel);
          if (whRes.data.crampsSeverity) setFormCramps(whRes.data.crampsSeverity);
          if (whRes.data.mood) setFormMood(whRes.data.mood);
          if (whRes.data.energyLevel) setFormEnergy(whRes.data.energyLevel);
          if (whRes.data.symptoms) setFormSymptoms(whRes.data.symptoms);
          if (whRes.data.pregnancyTrimester) setFormTrimester(whRes.data.pregnancyTrimester);
          if (whRes.data.menopauseSymptoms) setFormMenopauseSymptoms(whRes.data.menopauseSymptoms);
          if (whRes.data.hotFlashFrequency != null) setFormHotFlashFreq(whRes.data.hotFlashFrequency);
          if (whRes.data.sleepQualityRating != null) setFormSleepQuality(whRes.data.sleepQualityRating);
          if (whRes.data.dailyIronTargetMg) setFormIronTarget(whRes.data.dailyIronTargetMg);
        } else {
          // No profile yet, show journey selection screen
          dispatch(setWomensProfileData(null));
          setIsChangingJourney(true);
        }
      } catch {
        // First-time visitor or no profile: show journey selection screen cleanly
        dispatch(setWomensProfileData(null));
        setIsChangingJourney(true);
      }

      // Fetch Logs
      try {
        const logsRes = await axiosClient.get('/womens-health/logs');
        if (Array.isArray(logsRes.data)) {
          dispatch(setWomensLogs(logsRes.data));
        }
      } catch {
        // Logs empty is normal
      }
    } catch {
      // General safeguard
    } finally {
      setLoading(false);
    }
  };

  // Select Journey Handler
  const handleSelectJourney = async (journeyStage: WomensHealthStage) => {
    setSavingProfile(true);
    setError(null);
    try {
      const payload = {
        stage: journeyStage,
        cycleLengthDays: profileData?.cycleLengthDays || 28,
        periodDurationDays: profileData?.periodDurationDays || 5,
        flowLevel: profileData?.flowLevel || 'Medium',
        crampsSeverity: profileData?.crampsSeverity || 'Mild',
        mood: profileData?.mood || 'Balanced',
        energyLevel: profileData?.energyLevel || 'Moderate',
        symptoms: profileData?.symptoms || [],
        pregnancyTrimester: journeyStage === 'PREGNANCY' ? (profileData?.pregnancyTrimester || 1) : null,
        menopauseSymptoms: journeyStage === 'MENOPAUSE' ? (profileData?.menopauseSymptoms || []) : [],
        hotFlashFrequency: journeyStage === 'MENOPAUSE' ? (profileData?.hotFlashFrequency || 0) : null,
        sleepQualityRating: journeyStage === 'MENOPAUSE' ? (profileData?.sleepQualityRating || 8) : null,
        dailyIronTargetMg: profileData?.dailyIronTargetMg || 18.0,
      };

      const res = await axiosClient.post('/womens-health/profile', payload);
      dispatch(setWomensProfileData(res.data));
      dispatch(setStage(res.data.stage));
      setFormStage(res.data.stage);
      setIsChangingJourney(false);

      const journeyConfig = JOURNEY_OPTIONS.find((j) => j.id === journeyStage);
      setSuccessMsg(`Welcome to your personalized ${journeyConfig?.title || 'Women\'s Health'} dashboard!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch {
      setError('Failed to save selected journey. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Save / Update Women's Health Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setError(null);
    try {
      const payload = {
        stage: formStage,
        lastPeriodDate: formLastPeriod || null,
        cycleLengthDays: formCycleLen,
        periodDurationDays: formPeriodDuration,
        flowLevel: formFlow,
        crampsSeverity: formCramps,
        mood: formMood,
        energyLevel: formEnergy,
        symptoms: formSymptoms,
        pregnancyTrimester: formStage === 'PREGNANCY' ? formTrimester : null,
        menopauseSymptoms: formStage === 'MENOPAUSE' ? formMenopauseSymptoms : [],
        hotFlashFrequency: formStage === 'MENOPAUSE' ? formHotFlashFreq : null,
        sleepQualityRating: formStage === 'MENOPAUSE' ? formSleepQuality : null,
        dailyIronTargetMg: formIronTarget,
      };

      const res = await axiosClient.post('/womens-health/profile', payload);
      dispatch(setWomensProfileData(res.data));
      dispatch(setStage(res.data.stage));
      setShowSetupModal(false);
      setSuccessMsg('Profile and Ayurvedic wellness plan updated successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Save Tracking Log
  const handleSaveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLog(true);
    try {
      const payload = {
        logDate,
        logType,
        flowLevel: currentActiveJourney === 'MENSTRUATION' ? logFlow : null,
        crampsSeverity: currentActiveJourney === 'MENSTRUATION' ? logCramps : null,
        mood: logMood,
        energy: logEnergy,
        symptoms: logSymptoms,
        ironIntakeMg: logIronMg,
        waterIntakeL: logWaterL,
        sleepHours: logSleepHours,
        notes: logNotes,
      };

      const res = await axiosClient.post('/womens-health/logs', payload);
      dispatch(addWomensLog(res.data));
      setShowLogModal(false);
      setSuccessMsg('Wellness log saved!');
      setTimeout(() => setSuccessMsg(null), 3000);

      // Refresh profile to reflect updated metrics
      const whRes = await axiosClient.get('/womens-health/profile');
      if (whRes.data) {
        dispatch(setWomensProfileData(whRes.data));
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to save log entry.');
    } finally {
      setSavingLog(false);
    }
  };

  // Delete Tracking Log
  const handleDeleteLog = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this log entry?')) return;
    try {
      await axiosClient.delete(`/womens-health/logs/${id}`);
      dispatch(removeWomensLog(id));
    } catch {
      alert('Unable to delete log entry.');
    }
  };

  // User Prakriti computation
  const userPrakriti =
    profile?.primaryDosha || doshaResult?.primaryPrakriti || 'TRIDOSHA';

  // Women's Wellness Score (0-100)
  const latestWellnessScore = useMemo(() => {
    if (!logs || logs.length === 0) {
      return profileData ? 75 : null;
    }
    const recent = logs.slice(0, 5);
    const sum = recent.reduce((acc, l) => acc + (l.wellnessScore || 70), 0);
    return Math.round(sum / recent.length);
  }, [logs, profileData]);

  // Symptoms options
  const commonSymptoms = [
    'Cramps',
    'Bloating',
    'Tender Breasts',
    'Fatigue',
    'Acne',
    'Headache',
    'Lower Back Ache',
    'Mood Swings',
    'Food Cravings',
    'Hot Flashes',
    'Joint Pain',
  ];

  // Calendar Days Calculation
  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: Array<{ dayNum: number; dateStr: string; isCurrentMonth: boolean }> = [];

    // Leading empty slots
    for (let i = 0; i < firstDay; i++) {
      days.push({ dayNum: 0, dateStr: '', isCurrentMonth: false });
    }

    // Days of current month
    for (let d = 1; d <= totalDays; d++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      days.push({
        dayNum: d,
        dateStr: `${year}-${monthStr}-${dayStr}`,
        isCurrentMonth: true,
      });
    }

    return days;
  }, [calendarDate]);

  // Logs mapped by date
  const logsByDate = useMemo(() => {
    const map: Record<string, WomensHealthLogItem[]> = {};
    logs.forEach((log) => {
      if (!map[log.logDate]) map[log.logDate] = [];
      map[log.logDate].push(log);
    });
    return map;
  }, [logs]);

  // Selected calendar day's logs
  const selectedDayLogs = useMemo(() => {
    return logsByDate[selectedCalendarDay] || [];
  }, [logsByDate, selectedCalendarDay]);

  // Chart Data for Progress & Analytics
  const chartData = useMemo(() => {
    if (logs.length === 0) return null;
    const sorted = [...logs].reverse().slice(-7);
    const labels = sorted.map((l) => l.logDate.slice(5));
    const scores = sorted.map((l) => l.wellnessScore || 65);
    const ironVals = sorted.map((l) => l.ironIntakeMg || 0);

    return {
      labels,
      datasets: [
        {
          label: "Women's Wellness Score (0-100)",
          data: scores,
          borderColor: '#d97706',
          backgroundColor: 'rgba(217, 119, 6, 0.1)',
          fill: true,
          tension: 0.3,
          yAxisID: 'y',
        },
        {
          label: 'Dietary Iron Intake (mg)',
          data: ironVals,
          borderColor: '#e11d48',
          backgroundColor: 'rgba(225, 29, 72, 0.1)',
          fill: false,
          tension: 0.3,
          yAxisID: 'y1',
        },
      ],
    };
  }, [logs]);

  // Active Journey Resolution
  const currentActiveJourney: WomensHealthStage =
    (profileData?.stage && profileData.stage !== 'NONE') ? profileData.stage : 'MENSTRUATION';
  const activeJourneyConfig = JOURNEY_OPTIONS.find((j) => j.id === currentActiveJourney) || JOURNEY_OPTIONS[0];

  // Determine whether to display the selection screen
  const shouldShowSelectionScreen =
    loading ? false : (isChangingJourney || !profileData?.stage || profileData.stage === 'NONE');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center space-x-2 animate-in fade-in duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center justify-between animate-in fade-in duration-300">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={fetchInitialData} className="font-bold underline text-xs">
            Retry
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FIRST SCREEN: SELECT YOUR HEALTH JOURNEY */}
      {/* ========================================================================= */}
      {shouldShowSelectionScreen && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Hero Header */}
          <div className="bg-white p-8 md:p-12 rounded-3xl border border-ivory-dark shadow-ayur text-center space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-rose-50/60 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-50/60 rounded-full blur-3xl -z-10" />

            <div className="inline-flex items-center space-x-2 bg-rose-50 text-rose-800 px-3.5 py-1 rounded-full text-xs font-semibold border border-rose-200 shadow-sm">
              <Heart className="w-3.5 h-3.5 text-rose-600" />
              <span>Stri Swasthya • Personalized Women's Health</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-serif font-bold text-forest tracking-tight">
              Your Women's Wellness Journey
            </h1>

            <p className="text-sm md:text-base text-charcoal-muted max-w-2xl mx-auto leading-relaxed">
              Select the option that best describes your current health journey so we can personalize your experience.
            </p>

            {profileData?.stage && profileData.stage !== 'NONE' && (
              <div className="pt-2">
                <button
                  onClick={() => setIsChangingJourney(false)}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-forest hover:text-sage transition-colors underline"
                >
                  <span>Return to current ({activeJourneyConfig.title}) dashboard</span>
                </button>
              </div>
            )}
          </div>

          {/* 5 Journey Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {JOURNEY_OPTIONS.map((journey) => {
              const isSelected = profileData?.stage === journey.id && !isChangingJourney;
              return (
                <div
                  key={journey.id}
                  className={`bg-white rounded-3xl border ${journey.colorScheme.border} shadow-ayur p-7 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-xl ${journey.colorScheme.hoverBorder} group relative overflow-hidden`}
                >
                  <div className="space-y-4">
                    {/* Top Badge & Icon */}
                    <div className="flex items-center justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-ivory-dark flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                        {journey.icon}
                      </div>
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${journey.colorScheme.bg} ${journey.colorScheme.accent} ${journey.colorScheme.border}`}>
                        {journey.badge}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-xl font-serif font-bold text-forest group-hover:text-forest-light transition-colors">
                        {journey.title}
                      </h3>
                      <span className="text-[11px] font-semibold text-charcoal-muted block mt-0.5">
                        {journey.subtitle}
                      </span>
                      <p className="text-xs text-charcoal-muted mt-2.5 leading-relaxed">
                        {journey.description}
                      </p>
                    </div>

                    {/* Highlighted Features */}
                    <div className="pt-2 space-y-1.5 border-t border-ivory-dark">
                      {journey.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-[11px] text-charcoal">
                          <span className={`${journey.colorScheme.accent} font-bold mt-0.5`}>✓</span>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Select Button */}
                  <div className="pt-6">
                    <button
                      type="button"
                      disabled={savingProfile}
                      onClick={() => handleSelectJourney(journey.id)}
                      className={`w-full py-3 px-4 rounded-2xl text-xs font-bold transition-all duration-200 shadow-md flex items-center justify-center space-x-2 ${journey.colorScheme.btn}`}
                    >
                      {savingProfile ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Personalizing Dashboard...</span>
                        </>
                      ) : isSelected ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Currently Active Journey</span>
                        </>
                      ) : (
                        <>
                          <span>Select {journey.title}</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PERSONALIZED WELLNESS DASHBOARD (Shown when a journey is active) */}
      {/* ========================================================================= */}
      {!shouldShowSelectionScreen && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* 1. PERSONALIZED DASHBOARD HEADER */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-ivory-dark shadow-ayur flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${activeJourneyConfig.colorScheme.bg} ${activeJourneyConfig.colorScheme.accent} ${activeJourneyConfig.colorScheme.border}`}>
                  <span>{activeJourneyConfig.icon}</span>
                  <span>Active Journey: {activeJourneyConfig.title}</span>
                </span>
                <span className="text-[11px] bg-ivory text-charcoal-muted px-2.5 py-0.5 rounded-full border border-ivory-dark">
                  {activeJourneyConfig.subtitle}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-serif font-bold text-forest tracking-tight">
                {activeJourneyConfig.title} Dashboard
              </h1>

              <p className="text-xs md:text-sm text-charcoal-muted leading-relaxed">
                {activeJourneyConfig.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowChangeConfirm(true)}
                className="px-4 py-2.5 rounded-xl border border-rose-300 bg-rose-50/70 text-rose-900 text-xs font-bold hover:bg-rose-100 transition-all flex items-center space-x-1.5 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-700" />
                <span>Change Health Journey</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLogType(currentActiveJourney === 'MENSTRUATION' ? 'MENSTRUAL' : 'WELLNESS');
                  setShowLogModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-light transition-all flex items-center space-x-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4 text-gold" />
                <span>+ Daily Check-in</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSetupModal(true)}
                className="px-4 py-2.5 rounded-xl border border-ivory-dark bg-ivory text-charcoal text-xs font-bold hover:bg-white transition-all flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-forest" />
                <span>Update Details</span>
              </button>

              <button
                type="button"
                onClick={fetchInitialData}
                title="Refresh Data"
                className="p-2.5 rounded-xl border border-ivory-dark bg-white hover:bg-ivory text-charcoal-muted transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* 2. USER PROFILE & BIOMETRIC CONTEXT BAR WITH WELLNESS SCORE */}
          <div className="bg-white p-5 rounded-3xl border border-ivory-dark shadow-ayur space-y-3">
            <div className="flex items-center justify-between border-b border-ivory-dark pb-2.5">
              <div className="flex items-center space-x-2">
                <Heart className="w-3.5 h-3.5 text-rose-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-forest">
                  User Profile & Biometric Context
                </h2>
              </div>
              <span className="text-[11px] text-charcoal-muted">
                Authenticated as: <strong className="text-forest">{user?.fullName || user?.email || 'Logged In User'}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5 text-center">
              <div className="p-2.5 rounded-2xl bg-ivory border border-ivory-dark">
                <span className="block text-[10px] text-charcoal-muted uppercase font-bold">Age</span>
                <span className="text-xs font-bold text-forest mt-0.5 block">
                  {profile?.age ? `${profile.age} yrs` : 'Not provided'}
                </span>
              </div>

              <div className="p-2.5 rounded-2xl bg-ivory border border-ivory-dark">
                <span className="block text-[10px] text-charcoal-muted uppercase font-bold">Gender</span>
                <span className="text-xs font-bold text-forest mt-0.5 block">
                  {profile?.gender || 'Not provided'}
                </span>
              </div>

              <div className="p-2.5 rounded-2xl bg-ivory border border-ivory-dark">
                <span className="block text-[10px] text-charcoal-muted uppercase font-bold">Height</span>
                <span className="text-xs font-bold text-forest mt-0.5 block">
                  {profile?.heightCm ? `${profile.heightCm} cm` : 'Not provided'}
                </span>
              </div>

              <div className="p-2.5 rounded-2xl bg-ivory border border-ivory-dark">
                <span className="block text-[10px] text-charcoal-muted uppercase font-bold">Weight</span>
                <span className="text-xs font-bold text-forest mt-0.5 block">
                  {profile?.weightKg ? `${profile.weightKg} kg` : 'Not provided'}
                </span>
              </div>

              <div className="p-2.5 rounded-2xl bg-sage-light border border-sage/20">
                <span className="block text-[10px] text-sage uppercase font-bold">Prakriti</span>
                <span className="text-xs font-bold text-forest mt-0.5 block">
                  {userPrakriti}
                </span>
              </div>

              <div className="p-2.5 rounded-2xl bg-ivory border border-ivory-dark">
                <span className="block text-[10px] text-charcoal-muted uppercase font-bold">Diet</span>
                <span className="text-xs font-bold text-forest mt-0.5 block truncate" title={profile?.dietaryPreference}>
                  {profile?.dietaryPreference || 'Not provided'}
                </span>
              </div>

              <div className="p-2.5 rounded-2xl bg-ivory border border-ivory-dark">
                <span className="block text-[10px] text-charcoal-muted uppercase font-bold">Activity</span>
                <span className="text-xs font-bold text-forest mt-0.5 block truncate" title={profile?.activityLevel}>
                  {profile?.activityLevel || 'Not provided'}
                </span>
              </div>

              <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm">
                <span className="block text-[10px] text-amber-800 uppercase font-bold">Wellness Score</span>
                <span className="text-xs font-bold text-amber-950 mt-0.5 block">
                  {latestWellnessScore ? `${latestWellnessScore} / 100` : 'Not tracked'}
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. STRICT SELECTION CONTENT: ONLY THE SELECTED JOURNEY IS DISPLAYED */}
          {/* ========================================================================= */}

          {/* ------------------------------------------------------------------------- */}
          {/* JOURNEY A: MENSTRUAL CYCLE */}
          {/* ------------------------------------------------------------------------- */}
          {currentActiveJourney === 'MENSTRUATION' && (
            <div className="space-y-6">
              {/* Cycle Dial & Indicators */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-ivory-dark shadow-ayur space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-ivory-dark pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Rajaswala Care</span>
                    <h2 className="text-xl font-serif font-bold text-forest">Menstrual Cycle Tracking</h2>
                    <p className="text-xs text-charcoal-muted mt-0.5">
                      Understand your cycle phase, hormone transitions, and Apana Vayu downward balance.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setLogType('MENSTRUAL');
                      setShowLogModal(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold hover:bg-rose-100 flex items-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-rose-700" />
                    <span>Log Menstrual Details</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-center space-y-1">
                    <span className="block text-[10px] uppercase font-bold text-rose-800">Current Cycle Day</span>
                    <span className="text-2xl font-serif font-bold text-rose-900 block">
                      {profileData?.currentCycleDay ? `Day ${profileData.currentCycleDay}` : 'Not recorded'}
                    </span>
                    <span className="text-[10px] text-rose-700 block">
                      {profileData?.cycleLengthDays ? `of ${profileData.cycleLengthDays}-day cycle` : 'Standard 28-day'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-ivory border border-ivory-dark text-center space-y-1">
                    <span className="block text-[10px] uppercase font-bold text-charcoal-muted">Estimated Next Period</span>
                    <span className="text-lg font-bold text-forest block mt-1">
                      {profileData?.estimatedNextPeriod || 'Add period date'}
                    </span>
                    <span className="text-[10px] text-charcoal-muted italic block">Calculated projection</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-sage-light border border-sage/20 text-center space-y-1">
                    <span className="block text-[10px] uppercase font-bold text-sage">Active Phase</span>
                    <span className="text-xs font-bold text-forest block mt-1 truncate" title={profileData?.estimatedCyclePhase || ''}>
                      {profileData?.estimatedCyclePhase || 'Follicular Phase'}
                    </span>
                    <span className="text-[10px] text-charcoal-muted block">Ayurvedic Biological Rhythm</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-ivory border border-ivory-dark text-center space-y-1">
                    <span className="block text-[10px] uppercase font-bold text-charcoal-muted">Last Recorded Period</span>
                    <span className="text-sm font-bold text-charcoal block mt-1">
                      {profileData?.lastPeriodDate || 'None logged'}
                    </span>
                    <span className="text-[10px] text-charcoal-muted block">
                      Duration: {profileData?.periodDurationDays || 5} days
                    </span>
                  </div>
                </div>

                {/* Ayurvedic Phase Insights */}
                <div className="p-4 rounded-2xl bg-sage-light/60 border border-sage/30 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Leaf className="w-4 h-4 text-forest" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-forest">
                      Rajaswala Paricharya • Cycle Phase Recommendations
                    </h3>
                  </div>
                  <p className="text-xs text-charcoal leading-relaxed">
                    During the menstrual phase, Apana Vayu directs energy downwards. Favor warm, moist, unctuous foods like Yellow Moong Khichdi with A2 cow ghee, ginger-jaggery water, and soaked black raisins to restore blood tissue (Rakta Dhatu). Avoid strenuous workouts, cold beverages, and dry raw salads.
                  </p>
                </div>

                {/* Symptom Tracking Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-ivory border border-ivory-dark">
                    <span className="block text-[10px] uppercase font-bold text-charcoal-muted">Flow Level</span>
                    <span className="text-sm font-bold text-forest mt-0.5 block">{profileData?.flowLevel || 'Medium'}</span>
                    <span className="text-[10px] text-charcoal-muted">Regulates uterine clearance</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-ivory border border-ivory-dark">
                    <span className="block text-[10px] uppercase font-bold text-charcoal-muted">Cramps Severity</span>
                    <span className="text-sm font-bold text-forest mt-0.5 block">{profileData?.crampsSeverity || 'Mild'}</span>
                    <span className="text-[10px] text-charcoal-muted">Apana Vayu indicator</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-ivory border border-ivory-dark">
                    <span className="block text-[10px] uppercase font-bold text-charcoal-muted">Mood & Energy</span>
                    <span className="text-sm font-bold text-forest mt-0.5 block">{profileData?.mood || 'Balanced'} • {profileData?.energyLevel || 'Moderate'}</span>
                    <span className="text-[10px] text-charcoal-muted">Manovaha Srotas calm</span>
                  </div>
                </div>
              </div>

              {/* Menstrual Nutrition & Iron Superfoods */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-ivory-dark shadow-ayur space-y-4">
                  <div className="flex items-center space-x-2 border-b border-ivory-dark pb-3">
                    <Apple className="w-4 h-4 text-rose-700" />
                    <h3 className="font-serif font-bold text-forest text-base">Menstrual Nutrition & Iron Superfoods</h3>
                  </div>
                  <p className="text-xs text-charcoal-muted leading-relaxed">
                    Replenish lost red blood cells (Rakta Dhatu) with bioavailable plant iron paired with natural Vitamin C catalysts:
                  </p>
                  <ul className="text-xs text-charcoal space-y-2 list-disc list-inside leading-relaxed">
                    <li><strong>Soaked Black Raisins (Munakka):</strong> 10-12 soaked overnight, replenishes bioavailable iron without constipation.</li>
                    <li><strong>Spinach in Cast Iron Skillet:</strong> Palak cooked with cumin and A2 cow ghee enhances hemoglobin synthesis.</li>
                    <li><strong>Pomegranate & Beetroot Juice:</strong> Fresh pomegranate arils with a pinch of roasted cumin cool Pitta-induced heavy bleeding.</li>
                    <li><strong>Pure Sugarcane Jaggery (Gur):</strong> Traditional iron source that gently warms and settles menstrual spasms.</li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-ivory-dark shadow-ayur space-y-4">
                  <div className="flex items-center space-x-2 border-b border-ivory-dark pb-3">
                    <Sparkles className="w-4 h-4 text-sage" />
                    <h3 className="font-serif font-bold text-forest text-base">Ayurvedic Menstrual Wellness Tips</h3>
                  </div>
                  <ul className="text-xs text-charcoal space-y-2.5 list-disc list-inside leading-relaxed">
                    <li><strong>Warm Ginger-Ajwain Infusion:</strong> Boil 1/2 tsp ajwain (carom seeds) and crushed ginger in 2 cups water to naturally ease abdominal cramping.</li>
                    <li><strong>Restorative Downtime:</strong> Avoid intense cardio or inversions during active flow to allow Apana Vayu to move downwards unimpeded.</li>
                    <li><strong>Warm Foot Oil Massage (Pada Abhyanga):</strong> Massage feet with warm sesame oil before sleep to soothe the nervous system.</li>
                    <li><strong>Classical Herbal Allies:</strong> Ashoka (uterine tonic), Lodhra (soothes excess flow), and Dashamula (eases spasms).</li>
                  </ul>
                </div>
              </div>

              {/* Monthly Cycle History Calendar & Timeline */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-ivory-dark shadow-ayur space-y-5">
                <div className="flex items-center justify-between border-b border-ivory-dark pb-3">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-4 h-4 text-rose-600" />
                    <h3 className="font-serif font-bold text-forest text-base">Monthly Cycle Calendar & Recorded Entries</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
                      className="p-1.5 rounded-lg border border-ivory-dark hover:bg-ivory"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-forest min-w-24 text-center">
                      {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                      className="p-1.5 rounded-lg border border-ivory-dark hover:bg-ivory"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <span key={d} className="font-bold text-charcoal-muted py-1 text-[11px]">{d}</span>
                  ))}
                  {calendarDays.map((cd, idx) => {
                    if (!cd.isCurrentMonth) return <div key={idx} className="h-10" />;
                    const hasLog = logsByDate[cd.dateStr] && logsByDate[cd.dateStr].length > 0;
                    const isSelected = selectedCalendarDay === cd.dateStr;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedCalendarDay(cd.dateStr)}
                        className={`h-10 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-rose-700 text-white shadow-sm'
                            : hasLog
                            ? 'bg-rose-50 text-rose-900 border border-rose-200'
                            : 'hover:bg-ivory text-charcoal'
                        }`}
                      >
                        <span>{cd.dayNum}</span>
                        {hasLog && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>

                {/* Day's logged details */}
                <div className="pt-2">
                  <span className="text-xs font-bold text-charcoal block mb-2">
                    Entries for {selectedCalendarDay}:
                  </span>
                  {selectedDayLogs.length === 0 ? (
                    <p className="text-xs text-charcoal-muted italic">No logs recorded for this day.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedDayLogs.map((item) => (
                        <div key={item.id} className="p-3 rounded-xl bg-ivory border border-ivory-dark flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-forest">Flow: {item.flowLevel || 'Not noted'}</span>
                            <span className="text-charcoal-muted ml-2">Cramps: {item.crampsSeverity || 'None'}</span>
                            <span className="text-charcoal-muted ml-2">Mood: {item.mood || 'Balanced'}</span>
                          </div>
                          <button onClick={() => item.id && handleDeleteLog(item.id)} className="text-rose-600 hover:text-rose-800">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------------- */}
          {/* JOURNEY B: PCOS SUPPORT */}
          {/* ------------------------------------------------------------------------- */}
          {currentActiveJourney === 'PCOS' && (
            <div className="space-y-6">
              {/* PCOS Nutrition & Insulin Harmony */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-ivory-dark shadow-ayur space-y-6">
                <div className="border-b border-ivory-dark pb-4 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                    Artava Kshaya & Metabolic Harmony
                  </span>
                  <h2 className="text-xl font-serif font-bold text-forest">PCOS Nutrition & Insulin Sensitivity Guidance</h2>
                  <p className="text-xs text-charcoal-muted leading-relaxed">
                    PCOS is understood in Ayurveda as Kapha-Vata channel blockage (Srotorodha) combined with sluggish Agni. The protocol focuses on low-glycemic, anti-inflammatory, and fat-metabolizing (Medho-hara) foods.
                  </p>
                </div>

                {/* Seed Cycling Protocol */}
                <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-purple-700" />
                    <h3 className="font-serif font-bold text-purple-950 text-base">Ayurvedic Seed Cycling Protocol</h3>
                  </div>
                  <p className="text-xs text-purple-900 leading-relaxed">
                    Seed cycling gently balances estrogen and progesterone across the monthly biological cycle:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="p-4 rounded-xl bg-white border border-purple-200 space-y-1.5">
                      <span className="text-[11px] font-bold uppercase text-purple-800 block">Phase 1: Days 1 to 14 (Follicular Phase)</span>
                      <p className="text-xs text-charcoal leading-relaxed">
                        <strong>1 tbsp fresh ground Flaxseeds + 1 tbsp Pumpkin seeds:</strong> Supplies lignans and zinc to support healthy estrogen production, ovarian follicle maturation, and smooth ovulation.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-purple-200 space-y-1.5">
                      <span className="text-[11px] font-bold uppercase text-purple-800 block">Phase 2: Days 15 to 28 (Luteal Phase)</span>
                      <p className="text-xs text-charcoal leading-relaxed">
                        <strong>1 tbsp fresh ground White Sesame seeds + 1 tbsp Sunflower seeds:</strong> Supplies selenium and vitamin E to sustain corpus luteum progesterone production and clear excess circulating androgens.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recommended vs Foods to Limit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Recommended Foods (Pathya)</span>
                    </h4>
                    <ul className="text-xs text-emerald-950 space-y-1.5 list-disc list-inside leading-relaxed">
                      <li>Ancient grains with low glycemic index: Steamed Barley (Jav), Foxtail Millet, Ragi.</li>
                      <li>Bitter & astringent spices: Methi (Fenugreek) seeds soaked in warm water, Ceylon Cinnamon.</li>
                      <li>Sprouted legumes: Yellow Moong, Horsegram (Kulthi - scrapes excess Kapha medas).</li>
                      <li>Herbal tea: Fresh spearmint tea (shown to support androgen balance and clear acne).</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-rose-900 flex items-center space-x-1.5">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>Foods to Limit (Apathya)</span>
                    </h4>
                    <ul className="text-xs text-rose-950 space-y-1.5 list-disc list-inside leading-relaxed">
                      <li>Refined flours (Maida), white bread, and sugary bakery biscuits.</li>
                      <li>Excess refined white sugar, sweetened carbonated sodas, and synthetic syrups.</li>
                      <li>Thick cold dairy, ice cream, and processed cheese (aggravates Srotorodha channels).</li>
                      <li>Deep-fried reheated snacks and trans-fat baked goods.</li>
                    </ul>
                  </div>
                </div>

                {/* Ayurvedic Lifestyle & Herbs */}
                <div className="p-5 rounded-2xl bg-ivory border border-ivory-dark space-y-3">
                  <h4 className="font-serif font-bold text-forest text-sm">Ayurvedic Lifestyle & Classical Herbs for PCOS</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-white border border-ivory-dark space-y-1">
                      <strong className="text-purple-900 block">Kanchanar Guggulu</strong>
                      <p className="text-charcoal-muted leading-relaxed">Classical botanical compound traditionally used to clear micro-channel stagnation and support ovarian follicle health.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white border border-ivory-dark space-y-1">
                      <strong className="text-purple-900 block">Circadian Fasting</strong>
                      <p className="text-charcoal-muted leading-relaxed">Observe a 12–14 hour overnight digestive rest window (finish dinner by 7:30 PM) to re-sensitize insulin receptors.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white border border-ivory-dark space-y-1">
                      <strong className="text-purple-900 block">Pranayama Movement</strong>
                      <p className="text-charcoal-muted leading-relaxed">Daily Surya Namaskar at dawn followed by Kapalabhati and Nadi Shodhana to stimulate endocrine glands.</p>
                    </div>
                  </div>
                </div>

                {/* Disclaimer */}
                <p className="text-[11px] text-charcoal-muted italic border-t border-ivory-dark pt-3 flex items-center space-x-1.5">
                  <Info className="w-3.5 h-3.5 text-sage flex-shrink-0" />
                  <span>This module provides supportive nutritional and lifestyle guidance and does not claim to cure PCOS.</span>
                </p>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------------- */}
          {/* JOURNEY C: PREGNANCY CARE */}
          {/* ------------------------------------------------------------------------- */}
          {currentActiveJourney === 'PREGNANCY' && (
            <div className="space-y-6">
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-ivory-dark shadow-ayur space-y-6">
                <div className="border-b border-ivory-dark pb-4 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pink-700">
                    Garbhini Paricharya • Prenatal Care
                  </span>
                  <h2 className="text-xl font-serif font-bold text-forest">Pregnancy Nutrition & Trimester Support</h2>
                  <p className="text-xs text-charcoal-muted leading-relaxed">
                    Ayurvedic prenatal care emphasizes Ojas building (vital immunity), maternal tissue transformation (Dhatuposhana), and safe, unctuous nourishment.
                  </p>
                </div>

                {/* Prominent Medical Notice */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start space-x-2.5">
                  <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold">Important Healthcare Notice:</span>
                    <p className="leading-relaxed">
                      This module provides general Ayurvedic nutrition and wellness guidelines and does not replace medical advice, diagnosis, or prenatal monitoring from your obstetrician or healthcare professional.
                    </p>
                  </div>
                </div>

                {/* Trimester Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-charcoal-muted">Select Active Trimester</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormTrimester(t)}
                        className={`p-3.5 rounded-2xl border text-center transition-all ${
                          formTrimester === t
                            ? 'border-pink-500 bg-pink-50 text-pink-900 font-bold ring-2 ring-pink-500/20 shadow-sm'
                            : 'border-ivory-dark bg-ivory text-charcoal hover:bg-white'
                        }`}
                      >
                        <span className="block text-sm">Trimester {t}</span>
                        <span className="text-[10px] text-charcoal-muted">
                          {t === 1 ? 'Weeks 1 - 12' : t === 2 ? 'Weeks 13 - 26' : 'Weeks 27 - 40'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trimester Detailed Protocol */}
                <div className="p-5 rounded-2xl bg-ivory/60 border border-ivory-dark space-y-3 text-xs">
                  <h3 className="font-serif font-bold text-forest text-sm">
                    Trimester {formTrimester} Clinical & Ayurvedic Protocol
                  </h3>
                  {formTrimester === 1 && (
                    <div className="space-y-2 leading-relaxed">
                      <p><strong>Nutritional Priorities:</strong> Bioavailable Folate (B9), Vitamin B6 for morning nausea, gentle plant iron, and cellular hydration.</p>
                      <p><strong>Ayurvedic Strategy:</strong> Soothe morning sickness with warm cardamom water or dry roasted puffed rice. Keep Apana Vayu pacified with small, easily assimilable meals.</p>
                      <div className="p-3 rounded-xl bg-white border border-ivory-dark">
                        <strong>Recommended Ojas Foods:</strong> Warm boiled A2 milk with crushed cardamom, peeled soaked almonds, tender coconut water, sweet fresh pomegranates.
                      </div>
                    </div>
                  )}
                  {formTrimester === 2 && (
                    <div className="space-y-2 leading-relaxed">
                      <p><strong>Nutritional Priorities:</strong> Fetal skeletal calcium, maternal red blood cell expansion (Iron & B12), and quality protein.</p>
                      <p><strong>Ayurvedic Strategy:</strong> Support fetal bone and muscle development (Asthi & Mamsa Dhatu). Consume calcium-rich Ragi and Bajra porridges, fresh paneer, and beetroot soup.</p>
                      <div className="p-3 rounded-xl bg-white border border-ivory-dark">
                        <strong>Recommended Ojas Foods:</strong> A2 Desi Cow Ghee in warm milk, soaked walnuts, steamed pumpkin with cumin, organic black raisins.
                      </div>
                    </div>
                  )}
                  {formTrimester === 3 && (
                    <div className="space-y-2 leading-relaxed">
                      <p><strong>Nutritional Priorities:</strong> Sustained energy, gentle fiber to ease constipation, natural electrolytes, and pelvic tissue elasticity.</p>
                      <p><strong>Ayurvedic Strategy:</strong> Gentle Vata pacification in the pelvic floor. Soft, warm, easily moving foods to encourage smooth downward Apana Vayu.</p>
                      <div className="p-3 rounded-xl bg-white border border-ivory-dark">
                        <strong>Recommended Ojas Foods:</strong> Warm Desi Ghee in rice/khichdi, stewed apples with cloves, warm herbal broths, dates soaked in warm milk.
                      </div>
                    </div>
                  )}
                </div>

                {/* Hydration & Sleep Tracking */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1.5 text-xs text-blue-950">
                    <span className="font-bold flex items-center space-x-1.5 text-blue-900">
                      <Droplets className="w-4 h-4 text-blue-600" />
                      <span>Hydration Target: 2.5 - 3.0 Liters/day</span>
                    </span>
                    <p className="leading-relaxed">Maintains healthy amniotic fluid volume and prevents urinary tract stagnation. Sip warm boiled water infused with coriander seeds.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-1.5 text-xs text-indigo-950">
                    <span className="font-bold flex items-center space-x-1.5 text-indigo-900">
                      <Moon className="w-4 h-4 text-indigo-600" />
                      <span>Left-Side Rest Posture (Vamkukshi)</span>
                    </span>
                    <p className="leading-relaxed">Ayurveda and modern obstetrics recommend left lateral rest to maximize placental perfusion and reduce pressure on the inferior vena cava.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------------- */}
          {/* JOURNEY D: POSTPARTUM RECOVERY */}
          {/* ------------------------------------------------------------------------- */}
          {currentActiveJourney === 'POSTPARTUM' && (
            <div className="space-y-6">
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-ivory-dark shadow-ayur space-y-6">
                <div className="border-b border-ivory-dark pb-4 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Sutika Paricharya • Sacred 40-Day Restoration
                  </span>
                  <h2 className="text-xl font-serif font-bold text-forest">Postpartum Recovery & Lactation Support</h2>
                  <p className="text-xs text-charcoal-muted leading-relaxed">
                    Following childbirth, maternal Vata is severely elevated and bodily tissues (Dhatus) are depleted. Sutika Paricharya focuses on gentle digestive rekindling (Agni Deepana), tissue replenishment, and healthy lactation (Stanyajanana).
                  </p>
                </div>

                {/* 40-Day Protocol Guidance */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                    <span className="font-bold text-emerald-900 block text-sm">1. Udaraveshtana (Abdominal Wrap)</span>
                    <p className="text-emerald-950 leading-relaxed">
                      Gentle wrapping of the abdomen with soft cotton cloth supports the pelvic floor, facilitates natural uterine involution, and prevents empty Vata space.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
                    <span className="font-bold text-amber-900 block text-sm">2. Stanyajanana (Lactation Foods)</span>
                    <p className="text-amber-950 leading-relaxed">
                      Traditional galactagogues: Gond & Methi laddoos in A2 cow ghee, warm garlic moong dal, roasted cumin and fennel water, and shatavari milk.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-sage-light border border-sage/20 space-y-1.5">
                    <span className="font-bold text-forest block text-sm">3. Sacred Rest Window</span>
                    <p className="text-charcoal leading-relaxed">
                      Observing the traditional 40-day resting sanctuary protects lifelong maternal joint health, prevents postpartum blues, and grounds mental Prana.
                    </p>
                  </div>
                </div>

                {/* Suitable Diet & Superfoods */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2 text-xs">
                    <h4 className="font-bold uppercase tracking-wider text-emerald-900 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Postpartum Nourishment (Pathya)</span>
                    </h4>
                    <ul className="text-emerald-950 space-y-1.5 list-disc list-inside leading-relaxed">
                      <li>Gond (Edible Gum) & Methi laddoos with dry fruits cooked in pure A2 cow ghee.</li>
                      <li>Warm soft Moong Dal Khichdi seasoned with cumin, black pepper, and garlic.</li>
                      <li>Roasted Jeera & Saunf water sipped warm throughout the day.</li>
                      <li>Warm A2 milk with green cardamom, a pinch of nutmeg, and organic shatavari.</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 text-xs">
                    <h4 className="font-bold uppercase tracking-wider text-rose-900 flex items-center space-x-1.5">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>Foods to Strictly Avoid (Apathya)</span>
                    </h4>
                    <ul className="text-rose-950 space-y-1.5 list-disc list-inside leading-relaxed">
                      <li>Cold refrigerated drinking water and iced drinks (severely aggravate Vata and colic).</li>
                      <li>Dry, raw salads, unfermented cabbage, and heavy beans (provoke gas).</li>
                      <li>Deep-fried reheated snacks that extinguish the delicate postpartum Agni.</li>
                      <li>Excessive caffeine and artificial stimulants that interfere with maternal sleep.</li>
                    </ul>
                  </div>
                </div>

                {/* Classical Herbs */}
                <div className="p-4 rounded-2xl bg-ivory border border-ivory-dark space-y-2 text-xs">
                  <h4 className="font-serif font-bold text-forest text-sm">Classical Ayurvedic Restoratives</h4>
                  <p className="text-charcoal-muted leading-relaxed">
                    <strong>Shatavari:</strong> Classical herbal galactagogue to promote abundant, wholesome breast milk. <br />
                    <strong>Dashamularishta:</strong> Celebrated ten-root formulation to relieve postpartum aches, soothe inflammation, and tone the uterus. <br />
                    <strong>Jeerakarishta:</strong> Promotes digestive assimilation, dispels Ama, and relieves abdominal gas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------------- */}
          {/* JOURNEY E: MENOPAUSE WELLNESS */}
          {/* ------------------------------------------------------------------------- */}
          {currentActiveJourney === 'MENOPAUSE' && (
            <div className="space-y-6">
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-ivory-dark shadow-ayur space-y-6">
                <div className="border-b border-ivory-dark pb-4 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                    Vata Transition & Bone Vitality
                  </span>
                  <h2 className="text-xl font-serif font-bold text-forest">Menopause Wellness & Longevity</h2>
                  <p className="text-xs text-charcoal-muted leading-relaxed">
                    In Ayurveda, menopause represents entering the Vata phase of life. Gentle hydration, bone-building plant calcium, and phytoestrogen-rich nutrition help maintain vitality.
                  </p>
                </div>

                {/* Symptom Tracking Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-ivory border border-ivory-dark space-y-2">
                    <span className="text-xs font-bold text-charcoal block">Hot Flashes Frequency</span>
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={formHotFlashFreq}
                        onChange={(e) => setFormHotFlashFreq(parseInt(e.target.value) || 0)}
                        className="w-20 px-3 py-1.5 rounded-xl border border-ivory-dark bg-white text-xs font-bold"
                      />
                      <span className="text-xs text-charcoal-muted">episodes / day</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-ivory border border-ivory-dark space-y-2">
                    <span className="text-xs font-bold text-charcoal block">Sleep Quality Rating</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={formSleepQuality}
                        onChange={(e) => setFormSleepQuality(parseInt(e.target.value))}
                        className="flex-1 accent-forest"
                      />
                      <span className="text-xs font-bold text-forest">{formSleepQuality} / 10</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-ivory border border-ivory-dark space-y-2">
                    <span className="text-xs font-bold text-charcoal block">Calcium Target</span>
                    <span className="text-sm font-bold text-forest block">1,200 mg / day</span>
                    <span className="text-[10px] text-charcoal-muted">Protects Asthi Dhatu (Bone Density)</span>
                  </div>
                </div>

                {/* Menopause Nutrition Strategy */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-sage-light border border-sage/20 space-y-1.5 text-xs">
                    <h4 className="font-bold text-forest">Natural Phytoestrogens</h4>
                    <p className="text-charcoal-muted leading-relaxed">
                      White sesame seeds (Til) and freshly ground golden flaxseeds deliver natural lignans that gently balance fluctuating estrogen levels.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-ivory border border-ivory-dark space-y-1.5 text-xs">
                    <h4 className="font-bold text-forest">Bone & Joint Nourishment</h4>
                    <p className="text-charcoal-muted leading-relaxed">
                      Asthi Dhatu strengthening foods include warm almond milk steeped with nutmeg, A2 cow ghee for joint lubrication, and dark leafy greens.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-1.5 text-xs">
                    <h4 className="font-bold text-rose-900">Cooling Potency (Shita Virya)</h4>
                    <p className="text-rose-950 leading-relaxed">
                      To calm sudden heat sensations, drink coriander-fennel infused room-temperature water and practice Sheetali pranayama at sunset.
                    </p>
                  </div>
                </div>

                {/* Action button */}
                <div className="text-right pt-2 border-t border-ivory-dark">
                  <button
                    onClick={handleSaveProfile}
                    className="px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-light transition-all flex items-center space-x-1.5 ml-auto"
                  >
                    <Save className="w-3.5 h-3.5 text-gold" />
                    <span>Update Menopause Preferences</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. RELEVANT PROGRESS & ANALYTICS (Charts & Trend Tracking for All Journeys) */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-ivory-dark shadow-ayur space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-ivory-dark pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Longitudinal Insights
                </span>
                <h3 className="text-lg font-serif font-bold text-forest">
                  {activeJourneyConfig.title} Progress & Analytics
                </h3>
                <p className="text-xs text-charcoal-muted">
                  Daily tracking trends for your Wellness Score, sleep, hydration, and nutrition.
                </p>
              </div>

              {latestWellnessScore && (
                <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-right">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">7-Day Rolling Score</span>
                  <span className="text-base font-bold text-amber-950">{latestWellnessScore} / 100</span>
                </div>
              )}
            </div>

            {chartData ? (
              <div className="h-64 w-full">
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        position: 'left',
                        min: 0,
                        max: 100,
                        title: { display: true, text: 'Wellness Score', font: { size: 10 } },
                      },
                      y1: {
                        type: 'linear',
                        position: 'right',
                        min: 0,
                        max: 30,
                        grid: { drawOnChartArea: false },
                        title: { display: true, text: 'Iron (mg)', font: { size: 10 } },
                      },
                    },
                    plugins: {
                      legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
                    },
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-charcoal-muted space-y-2">
                <TrendingUp className="w-8 h-8 text-sage mx-auto opacity-50" />
                <p>No log data available yet to render trend charts.</p>
                <button
                  onClick={() => setShowLogModal(true)}
                  className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold"
                >
                  Log Your First Check-in
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRMATION MODAL: CHANGE HEALTH JOURNEY */}
      {/* ========================================================================= */}
      {showChangeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-ivory-dark space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-serif font-bold text-forest">Change Your Health Journey?</h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Your previous health records, cycle history, and check-in logs will be safely preserved in your account. You can switch back anytime without losing your data.
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowChangeConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-ivory-dark bg-ivory text-xs font-bold text-charcoal hover:bg-white transition-all"
              >
                Keep Current Journey
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowChangeConfirm(false);
                  setIsChangingJourney(true);
                }}
                className="flex-1 py-2.5 rounded-xl bg-forest text-xs font-bold text-white hover:bg-forest-light transition-all shadow-md"
              >
                Switch Health Journey
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DAILY CHECK-IN */}
      {/* ========================================================================= */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-ivory-dark overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-ivory-dark flex items-center justify-between bg-ivory">
              <div>
                <h3 className="font-serif font-bold text-forest text-base">
                  Daily Women's Health Check-in
                </h3>
                <span className="text-[11px] text-charcoal-muted">
                  Log your daily vitality, sleep, hydration, and symptoms
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="p-1 rounded-full text-charcoal-muted hover:text-charcoal hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLog} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-charcoal mb-1">Date</label>
                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-ivory-dark bg-ivory text-xs"
                />
              </div>

              {currentActiveJourney === 'MENSTRUATION' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-charcoal mb-1">Period Flow</label>
                    <select
                      value={logFlow}
                      onChange={(e) => setLogFlow(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-ivory-dark bg-ivory text-xs"
                    >
                      <option>None</option>
                      <option>Spotting</option>
                      <option>Light</option>
                      <option>Medium</option>
                      <option>Heavy</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-charcoal mb-1">Cramps Severity</label>
                    <select
                      value={logCramps}
                      onChange={(e) => setLogCramps(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-ivory-dark bg-ivory text-xs"
                    >
                      <option>None</option>
                      <option>Mild</option>
                      <option>Moderate</option>
                      <option>Severe</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal mb-1">Energy Level</label>
                  <select
                    value={logEnergy}
                    onChange={(e) => setLogEnergy(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-dark bg-ivory text-xs"
                  >
                    <option>High</option>
                    <option>Moderate</option>
                    <option>Low</option>
                    <option>Sluggish</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-charcoal mb-1">Mood</label>
                  <select
                    value={logMood}
                    onChange={(e) => setLogMood(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-dark bg-ivory text-xs"
                  >
                    <option>Balanced</option>
                    <option>Sensitive</option>
                    <option>Irritable</option>
                    <option>Anxious</option>
                    <option>Low Energy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-charcoal mb-1">Water (Liters)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={logWaterL}
                    onChange={(e) => setLogWaterL(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-dark bg-ivory text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-charcoal mb-1">Sleep (Hours)</label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={logSleepHours}
                    onChange={(e) => setLogSleepHours(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-dark bg-ivory text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-charcoal mb-1">Iron (mg)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="60"
                    value={logIronMg}
                    onChange={(e) => setLogIronMg(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-dark bg-ivory text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">Active Symptoms</label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 border border-ivory-dark rounded-xl bg-ivory">
                  {commonSymptoms.map((sym) => {
                    const isSelected = logSymptoms.includes(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setLogSymptoms(logSymptoms.filter((s) => s !== sym));
                          } else {
                            setLogSymptoms([...logSymptoms, sym]);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                          isSelected
                            ? 'bg-forest text-white'
                            : 'bg-white text-charcoal hover:bg-sage-light'
                        }`}
                      >
                        {sym}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">Journal Notes</label>
                <textarea
                  rows={2}
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  placeholder="Notes on digestion, herbs taken, or mood..."
                  className="w-full px-3 py-2 rounded-xl border border-ivory-dark bg-ivory text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-xl border border-ivory-dark text-charcoal font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLog}
                  className="px-5 py-2 rounded-xl bg-forest text-white font-bold hover:bg-forest-light flex items-center space-x-1.5 shadow-md"
                >
                  {savingLog ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-gold" />}
                  <span>Save Daily Check-in</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: UPDATE PROFILE / DETAILS */}
      {/* ========================================================================= */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-ivory-dark overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-ivory-dark flex items-center justify-between bg-ivory">
              <div>
                <h3 className="font-serif font-bold text-forest text-base">
                  Update Health Journey Parameters
                </h3>
                <span className="text-[11px] text-charcoal-muted">
                  Fine-tune cycle lengths, iron targets, or symptom preferences
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className="p-1 rounded-full text-charcoal-muted hover:text-charcoal hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-charcoal mb-1">Current Health Journey</label>
                <select
                  value={formStage}
                  onChange={(e) => setFormStage(e.target.value as WomensHealthStage)}
                  className="w-full px-3 py-2 rounded-xl border border-ivory-dark bg-ivory text-xs font-bold text-forest"
                >
                  <option value="MENSTRUATION">Menstrual Cycle (Rajaswala Care)</option>
                  <option value="PCOS">PCOS Support (Artava Kshaya)</option>
                  <option value="PREGNANCY">Pregnancy Care (Garbhini Paricharya)</option>
                  <option value="POSTPARTUM">Postpartum Recovery (Sutika Paricharya)</option>
                  <option value="MENOPAUSE">Menopause Wellness (Vata Transition)</option>
                </select>
              </div>

              {formStage === 'MENSTRUATION' && (
                <>
                  <div>
                    <label className="block font-bold text-charcoal mb-1">Last Period Start Date</label>
                    <input
                      type="date"
                      value={formLastPeriod}
                      onChange={(e) => setFormLastPeriod(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-ivory-dark bg-ivory text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-charcoal mb-1">Cycle Length (Days)</label>
                      <input
                        type="number"
                        min="20"
                        max="60"
                        value={formCycleLen}
                        onChange={(e) => setFormCycleLen(parseInt(e.target.value) || 28)}
                        className="w-full px-3 py-2 rounded-xl border border-ivory-dark bg-ivory text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-charcoal mb-1">Period Duration (Days)</label>
                      <input
                        type="number"
                        min="1"
                        max="14"
                        value={formPeriodDuration}
                        onChange={(e) => setFormPeriodDuration(parseInt(e.target.value) || 5)}
                        className="w-full px-3 py-2 rounded-xl border border-ivory-dark bg-ivory text-xs"
                      />
                    </div>
                  </div>
                </>
              )}

              {formStage === 'PREGNANCY' && (
                <div>
                  <label className="block font-bold text-charcoal mb-1">Active Trimester</label>
                  <select
                    value={formTrimester}
                    onChange={(e) => setFormTrimester(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-dark bg-ivory text-xs"
                  >
                    <option value={1}>Trimester 1 (Weeks 1 to 12)</option>
                    <option value={2}>Trimester 2 (Weeks 13 to 26)</option>
                    <option value={3}>Trimester 3 (Weeks 27 to 40)</option>
                  </select>
                </div>
              )}

              {formStage === 'MENOPAUSE' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-charcoal mb-1">Hot Flashes / Day</label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={formHotFlashFreq}
                      onChange={(e) => setFormHotFlashFreq(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-ivory-dark bg-ivory text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-charcoal mb-1">Sleep Quality (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formSleepQuality}
                      onChange={(e) => setFormSleepQuality(parseInt(e.target.value) || 8)}
                      className="w-full px-3 py-2 rounded-xl border border-ivory-dark bg-ivory text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-charcoal mb-1">Daily Dietary Iron Target (mg)</label>
                <input
                  type="number"
                  step="0.5"
                  min="5"
                  max="45"
                  value={formIronTarget}
                  onChange={(e) => setFormIronTarget(parseFloat(e.target.value) || 18.0)}
                  className="w-full px-3 py-2 rounded-xl border border-ivory-dark bg-ivory text-xs font-bold"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-ivory-dark">
                <button
                  type="button"
                  onClick={() => setShowSetupModal(false)}
                  className="px-4 py-2 rounded-xl border border-ivory-dark text-charcoal font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2 rounded-xl bg-forest text-white font-bold hover:bg-forest-light flex items-center space-x-1.5 shadow-md"
                >
                  {savingProfile ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-gold" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
