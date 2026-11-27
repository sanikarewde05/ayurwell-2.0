import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { setCurrentPlan } from '../store/slices/dietSlice';
import { setProfile } from '../store/slices/authSlice';
import { axiosClient } from '../api/axiosClient';
import type { DietPlan, MealItem } from '../types';
import {
  Utensils,
  CheckCircle2,
  AlertCircle,
  HeartPulse,
  Sparkles,
  RefreshCw,
  ArrowRightLeft,
  Save,
  Printer,
  Info,
  Calendar,
  ShieldAlert,
  Trash2,
  Bookmark,
  Check,
  Leaf,
  Activity,
  X,
  HelpCircle,
} from 'lucide-react';

interface SavedPlanSummary {
  id: number;
  planName: string;
  targetDisease: string;
  durationDays: number;
  totalDailyCalories: number;
  ayurvedicNutritionScore: number;
  createdAt: string;
}

interface SwapOption {
  id: number;
  title: string;
  description: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  ironMg: number;
  calciumMg: number;
  vitaminB12Mcg: number;
  costInr: number;
  suitableDosha: string;
  keyIngredients: string[];
  whyRecommended: string;
  ayurvedicProperties: string;
}

interface DeficiencyRiskItem {
  nutrient: string;
  risk_level: string;
  confidence_probability: number;
  recommended_ayurvedic_foods: string[];
}

interface MlDeficiencyResponse {
  overall_status: string;
  risk_score_percentage: number;
  deficiencies: DeficiencyRiskItem[];
  disclaimer: string;
}

export const DiseaseDietPlannerPage: React.FC = () => {
  const dispatch = useDispatch();
  const [activePlan, setActivePlan] = useState<DietPlan | null>(null);
  const { user, profile } = useSelector((state: RootState) => state.auth);
  const { result: doshaResult } = useSelector((state: RootState) => state.dosha);

  // Health Conditions
  const supportedConditions = [
    'Diabetes',
    'Hypertension',
    'PCOS',
    'GERD / Acid Reflux',
    'Anemia / Iron Deficiency',
    'Obesity / Weight Management',
    'High Cholesterol',
    'Thyroid-related nutrition support',
    'General Digestive Health',
  ];

  // Plan Settings State - Starts unselected so user chooses their condition
  const [selectedDisease, setSelectedDisease] = useState<string>('');
  const [durationDays, setDurationDays] = useState<number>(7);
  const [dietaryPreference, setDietaryPreference] = useState<string>('Vegetarian');
  const [cuisinePreference, setCuisinePreference] = useState<string>('Indian');
  const [includedMeals, setIncludedMeals] = useState<string[]>([
    'BREAKFAST',
    'MID_MORNING',
    'LUNCH',
    'EVENING_SNACK',
    'DINNER',
  ]);
  const [targetCalories, setTargetCalories] = useState<number>(1850);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = useState<string>('');

  // UI Flow State
  const [activeDayIndex, setActiveDayIndex] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Modals & Panels State
  const [whyModalMeal, setWhyModalMeal] = useState<MealItem | null>(null);
  const [swapModalMeal, setSwapModalMeal] = useState<MealItem | null>(null);
  const [swapOptions, setSwapOptions] = useState<SwapOption[]>([]);
  const [loadingSwap, setLoadingSwap] = useState<boolean>(false);
  const [showSavedPlansModal, setShowSavedPlansModal] = useState<boolean>(false);
  const [savedPlansList, setSavedPlansList] = useState<SavedPlanSummary[]>([]);
  const [loadingSavedPlans, setLoadingSavedPlans] = useState<boolean>(false);

  // ML Nutrient Gap Analysis State
  const [mlAnalysis, setMlAnalysis] = useState<MlDeficiencyResponse | null>(null);
  const [loadingMl, setLoadingMl] = useState<boolean>(false);

  // 1. Sync User Profile without overriding user selection
  useEffect(() => {
    // If profile not loaded in Redux, fetch current authenticated user profile
    if (!profile) {
      axiosClient.get('/users/profile')
        .then((res) => {
          if (res.data) {
            dispatch(setProfile(res.data));
          }
        })
        .catch(() => {});
    }
  }, [profile, dispatch]);

  // Compute Auto Calorie Target from user profile
  useEffect(() => {
    if (profile?.weightKg && profile?.heightCm && profile?.age) {
      const isMale = profile.gender?.toUpperCase() === 'MALE';
      const bmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + (isMale ? 5 : -161);
      let mult = 1.375;
      if (profile.activityLevel?.toLowerCase().includes('sedentary')) mult = 1.2;
      else if (profile.activityLevel?.toLowerCase().includes('moderate')) mult = 1.55;
      else if (profile.activityLevel?.toLowerCase().includes('very') || profile.activityLevel?.toLowerCase().includes('active')) mult = 1.725;

      let calculated = Math.round(bmr * mult);
      if (selectedDisease.includes('Obesity')) calculated -= 300;
      else if (selectedDisease.includes('Diabetes')) calculated = Math.min(calculated, 1800);
      setTargetCalories(Math.max(1300, Math.min(2600, calculated)));
    }
  }, [profile, selectedDisease]);

  // Fetch saved plans count/list and latest plan on mount
  useEffect(() => {
    fetchSavedPlans();
    if (!activePlan) {
      axiosClient.get('/diet/latest')
        .then((res) => {
          if (res.data) {
            dispatch(setCurrentPlan(res.data));
            setActivePlan(res.data);
            runMlDeficiencyRiskAnalysis(res.data);
          }
        })
        .catch(() => {});
    }
  }, []);

  const fetchSavedPlans = async () => {
    setLoadingSavedPlans(true);
    try {
      const res = await axiosClient.get('/diet/saved');
      if (Array.isArray(res.data)) {
        setSavedPlansList(res.data);
      }
    } catch {
      // Ignore silent failure
    } finally {
      setLoadingSavedPlans(false);
    }
  };

  // 2. Generate Plan Handler
  const handleGeneratePlan = async () => {
    if (!selectedDisease) {
      setError('Please select a health condition from the options above before generating your plan.');
      return;
    }

    setLoading(true);
    setError(null);
    setSaveSuccessMsg(null);

    try {
      const payload = {
        targetDisease: selectedDisease,
        durationDays: durationDays,
        dietaryPreference: dietaryPreference,
        cuisinePreference: cuisinePreference,
        includedMeals: includedMeals,
        targetCalories: targetCalories,
        allergies: selectedAllergies,
      };

      const res = await axiosClient.post('/diet/generate', payload);
      const generated: DietPlan = res.data;
      dispatch(setCurrentPlan(generated));
      setActivePlan(generated);
      setActiveDayIndex(1);

      // Run ML Deficiency Analysis on the generated plan averages
      runMlDeficiencyRiskAnalysis(generated);
      fetchSavedPlans();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to generate personalized diet plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Run ML Deficiency Prediction
  const runMlDeficiencyRiskAnalysis = async (plan: DietPlan) => {
    setLoadingMl(true);
    try {
      const iron = plan.dailyAverageIron ?? 14.0;
      const calcium = plan.dailyAverageCalcium ?? 750.0;
      const b12 = plan.dailyAverageB12 ?? 1.5;
      const fiber = plan.dailyAverageFiber ?? 20.0;

      const res = await axiosClient.post('/ml/predict-deficiency', {
        iron_mg: iron,
        calcium_mg: calcium,
        vitamin_b12_mcg: b12,
        fiber_g: fiber,
      });

      if (res.data) {
        setMlAnalysis(res.data);
      }
    } catch {
      // Silent ML fallback
    } finally {
      setLoadingMl(false);
    }
  };

  // 3. Save Plan Handler
  const handleSavePlan = async () => {
    if (!activePlan) return;
    try {
      await axiosClient.post('/diet/save', {
        id: activePlan.id,
        planName: activePlan.planName,
        targetDisease: activePlan.targetDisease,
        season: activePlan.season,
        durationDays: activePlan.durationDays || durationDays,
        dietaryPreference: activePlan.dietaryPreference || dietaryPreference,
        cuisinePreference: activePlan.cuisinePreference || cuisinePreference,
        totalDailyBudgetInr: activePlan.totalDailyBudgetInr,
        totalDailyCalories: activePlan.totalDailyCalories,
        ayurvedicNutritionScore: activePlan.ayurvedicNutritionScore,
        meals: activePlan.meals,
        dietaryTips: activePlan.dietaryTips,
        foodsToLimit: activePlan.foodsToLimit,
      });
      setSaveSuccessMsg('Diet plan saved successfully to your profile!');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
      fetchSavedPlans();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Unable to save plan. Please check your connection.');
    }
  };

  // Load a Saved Plan
  const handleLoadSavedPlan = async (planId: number) => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/diet/plans/${planId}`);
      if (res.data) {
        dispatch(setCurrentPlan(res.data));
        setActivePlan(res.data);
        setShowSavedPlansModal(false);
        setActiveDayIndex(1);
        runMlDeficiencyRiskAnalysis(res.data);
      }
    } catch {
      alert('Unable to load saved plan.');
    } finally {
      setLoading(false);
    }
  };

  // Delete a Saved Plan
  const handleDeleteSavedPlan = async (planId: number) => {
    if (!window.confirm('Are you sure you want to delete this saved plan?')) return;
    try {
      await axiosClient.delete(`/diet/plans/${planId}`);
      setSavedPlansList((prev) => prev.filter((p) => p.id !== planId));
    } catch {
      alert('Failed to delete plan.');
    }
  };

  // 4. Food Swap Logic
  const handleOpenSwapModal = async (meal: MealItem) => {
    setSwapModalMeal(meal);
    setLoadingSwap(true);
    try {
      const res = await axiosClient.get('/diet/swap-options', {
        params: {
          mealType: meal.mealType,
          disease: activePlan?.targetDisease || selectedDisease,
          dietaryPref: dietaryPreference,
        },
      });
      if (Array.isArray(res.data)) {
        // Exclude the current meal title from swap options
        setSwapOptions(res.data.filter((opt: SwapOption) => opt.title !== meal.recipeTitle));
      }
    } catch {
      setSwapOptions([]);
    } finally {
      setLoadingSwap(false);
    }
  };

  const handleApplySwap = (option: SwapOption) => {
    if (!activePlan || !swapModalMeal) return;

    const updatedMeals = activePlan.meals.map((m) => {
      if (m.id === swapModalMeal.id) {
        return {
          ...m,
          recipeTitle: option.title,
          recipeDescription: option.description,
          calories: option.calories,
          protein: option.protein,
          carbs: option.carbs,
          fat: option.fat,
          fiber: option.fiber,
          ironMg: option.ironMg,
          calciumMg: option.calciumMg,
          vitaminB12Mcg: option.vitaminB12Mcg,
          costInr: option.costInr,
          keyIngredients: option.keyIngredients,
          whyRecommended: option.whyRecommended,
          ayurvedicProperties: option.ayurvedicProperties,
        };
      }
      return m;
    });

    // Recalculate daily average calories and nutrients
    const totalDays = activePlan.durationDays || durationDays || 1;
    let sumCal = 0, sumProt = 0, sumCarbs = 0, sumFat = 0, sumFiber = 0, sumIron = 0, sumCalcm = 0, sumB12 = 0;

    updatedMeals.forEach((m) => {
      sumCal += m.calories || 0;
      sumProt += m.protein || 0;
      sumCarbs += m.carbs || 0;
      sumFat += m.fat || 0;
      sumFiber += m.fiber || 0;
      sumIron += m.ironMg || 0;
      sumCalcm += m.calciumMg || 0;
      sumB12 += m.vitaminB12Mcg || 0;
    });

    const updatedPlan: DietPlan = {
      ...activePlan,
      meals: updatedMeals,
      totalDailyCalories: Math.round((sumCal / totalDays) * 10) / 10,
      dailyAverageProtein: Math.round((sumProt / totalDays) * 10) / 10,
      dailyAverageCarbs: Math.round((sumCarbs / totalDays) * 10) / 10,
      dailyAverageFat: Math.round((sumFat / totalDays) * 10) / 10,
      dailyAverageFiber: Math.round((sumFiber / totalDays) * 10) / 10,
      dailyAverageIron: Math.round((sumIron / totalDays) * 10) / 10,
      dailyAverageCalcium: Math.round((sumCalcm / totalDays) * 10) / 10,
      dailyAverageB12: Math.round((sumB12 / totalDays) * 100) / 100,
    };

    dispatch(setCurrentPlan(updatedPlan));
    setActivePlan(updatedPlan);
    setSwapModalMeal(null);
    runMlDeficiencyRiskAnalysis(updatedPlan);
  };

  // Print/Download Handler
  const handlePrint = () => {
    window.print();
  };

  // Toggle meal slot inclusion
  const toggleMealSlot = (slot: string) => {
    setIncludedMeals((prev) =>
      prev.includes(slot) ? (prev.length > 1 ? prev.filter((s) => s !== slot) : prev) : [...prev, slot]
    );
  };

  // Add allergy tag
  const handleAddAllergy = () => {
    if (customAllergy.trim() && !selectedAllergies.includes(customAllergy.trim())) {
      setSelectedAllergies((prev) => [...prev, customAllergy.trim()]);
      setCustomAllergy('');
    }
  };

  // Active Day's meals
  const activeDayMeals = useMemo(() => {
    if (!activePlan || !activePlan.meals) return [];
    return activePlan.meals.filter((m) => m.dayIndex === activeDayIndex || (!m.dayIndex && activeDayIndex === 1));
  }, [activePlan, activeDayIndex]);

  // Active Day's total calories and macros
  const activeDayStats = useMemo(() => {
    let cal = 0, p = 0, c = 0, f = 0, fiber = 0;
    activeDayMeals.forEach((m) => {
      cal += m.calories || 0;
      p += m.protein || 0;
      c += m.carbs || 0;
      f += m.fat || 0;
      fiber += m.fiber || 0;
    });
    return {
      calories: Math.round(cal),
      protein: Math.round(p * 10) / 10,
      carbs: Math.round(c * 10) / 10,
      fat: Math.round(f * 10) / 10,
      fiber: Math.round(fiber * 10) / 10,
    };
  }, [activeDayMeals]);

  // Total days array for tab buttons
  const planDaysArray = useMemo(() => {
    const daysCount = activePlan?.durationDays || durationDays || 7;
    return Array.from({ length: daysCount }, (_, i) => i + 1);
  }, [activePlan?.durationDays, durationDays]);

  const userPrakriti = profile?.primaryDosha || doshaResult?.primaryPrakriti || 'TRIDOSHA';

  return (
    <div className="space-y-8 pb-16 print:p-0 print:space-y-4">
      {/* ========================================================================= */}
      {/* 1. PAGE HEADER */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-ivory-dark shadow-ayur flex flex-col md:flex-row items-start md:items-center justify-between gap-6 print:border-none print:shadow-none print:p-0">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-sage-light text-forest px-3 py-1 rounded-full text-xs font-semibold">
            <Utensils className="w-3.5 h-3.5 text-sage" />
            <span>Pathya Ahara • Therapeutic Diet Planning</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-forest tracking-tight">
            Disease-Based Personalized Diet Planner
          </h1>
          <p className="text-xs md:text-sm text-charcoal-muted leading-relaxed">
            Create a personalized diet plan based on your health condition, Prakriti, nutritional requirements, and food preferences.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <button
            onClick={() => setShowSavedPlansModal(true)}
            className="px-4 py-2.5 rounded-xl border border-sage/40 bg-sage-light/60 text-forest text-xs font-bold hover:bg-sage-light transition-all flex items-center space-x-2"
          >
            <Bookmark className="w-4 h-4 text-forest" />
            <span>Saved Plans</span>
            {savedPlansList.length > 0 && (
              <span className="bg-forest text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {savedPlansList.length}
              </span>
            )}
          </button>

          {activePlan && (
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl border border-ivory-dark bg-white text-charcoal text-xs font-bold hover:bg-ivory transition-all flex items-center space-x-2 shadow-sm"
            >
              <Printer className="w-4 h-4 text-forest" />
              <span>Print / Download</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. USER PROFILE SECTION (Current Authenticated User) */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 rounded-3xl border border-ivory-dark shadow-ayur space-y-4 print:hidden">
        <div className="flex items-center justify-between border-b border-ivory-dark pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-forest/10 flex items-center justify-center text-forest font-bold text-xs">
              {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-sm font-bold text-forest">
                {user?.fullName || user?.email || 'Authenticated User'}
              </h2>
              <span className="text-[11px] text-charcoal-muted">Clinical Profile & Body Constitution</span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-forest bg-sage-light px-2.5 py-1 rounded-lg border border-sage/20">
            Active Session
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-ivory border border-ivory-dark">
            <span className="block text-[10px] uppercase font-bold text-charcoal-muted">Age</span>
            <span className="text-xs font-bold text-forest mt-0.5 block">
              {profile?.age ? `${profile.age} yrs` : <span className="text-charcoal-muted/60">Not provided</span>}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-ivory border border-ivory-dark">
            <span className="block text-[10px] uppercase font-bold text-charcoal-muted">Gender</span>
            <span className="text-xs font-bold text-forest mt-0.5 block">
              {profile?.gender ? profile.gender : <span className="text-charcoal-muted/60">Not provided</span>}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-ivory border border-ivory-dark">
            <span className="block text-[10px] uppercase font-bold text-charcoal-muted">Height</span>
            <span className="text-xs font-bold text-forest mt-0.5 block">
              {profile?.heightCm ? `${profile.heightCm} cm` : <span className="text-charcoal-muted/60">Not provided</span>}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-ivory border border-ivory-dark">
            <span className="block text-[10px] uppercase font-bold text-charcoal-muted">Weight</span>
            <span className="text-xs font-bold text-forest mt-0.5 block">
              {profile?.weightKg ? `${profile.weightKg} kg` : <span className="text-charcoal-muted/60">Not provided</span>}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-sage-light border border-sage/20">
            <span className="block text-[10px] uppercase font-bold text-sage">Prakriti</span>
            <span className="text-xs font-bold text-forest mt-0.5 block">
              {userPrakriti}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-ivory border border-ivory-dark">
            <span className="block text-[10px] uppercase font-bold text-charcoal-muted">Activity</span>
            <span className="text-xs font-bold text-forest mt-0.5 block truncate">
              {profile?.activityLevel ? profile.activityLevel : <span className="text-charcoal-muted/60">Not provided</span>}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-ivory border border-ivory-dark">
            <span className="block text-[10px] uppercase font-bold text-charcoal-muted">Diet Pref</span>
            <span className="text-xs font-bold text-forest mt-0.5 block">
              {dietaryPreference || <span className="text-charcoal-muted/60">Not provided</span>}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-ivory border border-ivory-dark">
            <span className="block text-[10px] uppercase font-bold text-charcoal-muted">Allergies</span>
            <span className="text-xs font-bold text-forest mt-0.5 block truncate">
              {selectedAllergies.length > 0 ? selectedAllergies.join(', ') : <span className="text-charcoal-muted/60">Not provided</span>}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60">
            <span className="block text-[10px] uppercase font-bold text-amber-900">Condition</span>
            <span className="text-xs font-bold text-amber-950 mt-0.5 block truncate" title={profile?.targetDiseaseCondition || selectedDisease}>
              {profile?.targetDiseaseCondition || selectedDisease || 'None stored'}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SELECT HEALTH CONDITION & 4. DIET PLAN SETTINGS */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-ivory-dark shadow-ayur space-y-6 print:hidden">
        {/* Section Title */}
        <div className="flex items-center space-x-2">
          <HeartPulse className="w-5 h-5 text-terracotta" />
          <h2 className="text-lg font-serif font-bold text-forest">Plan Configuration & Health Target</h2>
        </div>

        {/* Condition Grid */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-muted">
            1. Select Health Condition / Wellness Focus
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {supportedConditions.map((cond) => {
              const isSelected = selectedDisease === cond;
              return (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setSelectedDisease(cond)}
                  className={`px-4 py-3 rounded-2xl text-left text-xs font-semibold transition-all border flex items-center justify-between ${
                    isSelected
                      ? 'bg-forest text-white border-forest shadow-md ring-2 ring-forest/20'
                      : 'bg-ivory/60 text-charcoal border-ivory-dark hover:border-forest/40 hover:bg-white'
                  }`}
                >
                  <span>{cond}</span>
                  {isSelected && <Check className="w-4 h-4 text-gold flex-shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-charcoal-muted italic pt-1 flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-sage flex-shrink-0" />
            <span>AyurWell – Ayurvedic Diet Planning and Nutrient Analysis System does not diagnose diseases. The selected condition guides clinical dietary protocols and authentic Ayurvedic Pathya-Apathya rules.</span>
          </p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2 border-t border-ivory-dark">
          {/* Duration */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-charcoal">Duration</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 7, 14, 30].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setDurationDays(days)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    durationDays === days
                      ? 'bg-forest text-white border-forest'
                      : 'bg-ivory text-charcoal border-ivory-dark hover:bg-white'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Preference */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-charcoal">Diet Preference</label>
            <select
              value={dietaryPreference}
              onChange={(e) => setDietaryPreference(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-dark bg-ivory text-xs font-semibold text-charcoal focus:outline-none focus:border-forest"
            >
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Eggetarian">Eggetarian</option>
              <option value="Non-Vegetarian">Non-Vegetarian</option>
            </select>
          </div>

          {/* Cuisine Preference */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-charcoal">Cuisine</label>
            <select
              value={cuisinePreference}
              onChange={(e) => setCuisinePreference(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-dark bg-ivory text-xs font-semibold text-charcoal focus:outline-none focus:border-forest"
            >
              <option value="Indian">Traditional Indian</option>
              <option value="North Indian">North Indian</option>
              <option value="South Indian">South Indian</option>
              <option value="Maharashtrian">Maharashtrian</option>
              <option value="Custom">Custom Ayurvedic Blend</option>
            </select>
          </div>

          {/* Calorie Target */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-charcoal">Daily Calorie Target</label>
              <span className="text-[10px] font-semibold text-sage bg-sage-light px-1.5 py-0.5 rounded">
                BMR Recommended
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={targetCalories}
                onChange={(e) => setTargetCalories(Number(e.target.value))}
                min={1200}
                max={3200}
                className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-dark bg-ivory text-xs font-bold text-charcoal focus:outline-none focus:border-forest"
              />
              <span className="absolute right-3 top-2.5 text-xs text-charcoal-muted font-semibold pointer-events-none">
                kcal
              </span>
            </div>
          </div>
        </div>

        {/* Meal Selection Checkboxes */}
        <div className="space-y-2 pt-2 border-t border-ivory-dark">
          <label className="block text-xs font-bold text-charcoal">Included Meal Slots</label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'BREAKFAST', label: 'Breakfast' },
              { id: 'MID_MORNING', label: 'Mid-Morning' },
              { id: 'LUNCH', label: 'Lunch' },
              { id: 'EVENING_SNACK', label: 'Evening Snack' },
              { id: 'DINNER', label: 'Dinner' },
            ].map((slot) => {
              const isChecked = includedMeals.includes(slot.id);
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => toggleMealSlot(slot.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
                    isChecked
                      ? 'bg-sage-light text-forest border-sage font-bold'
                      : 'bg-ivory text-charcoal-muted border-ivory-dark hover:bg-white'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${isChecked ? 'bg-forest border-forest text-white' : 'border-charcoal-muted/40'}`}>
                    {isChecked && <Check className="w-2.5 h-2.5" />}
                  </div>
                  <span>{slot.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Allergies / Restrictions Tagging */}
        <div className="space-y-2 pt-2 border-t border-ivory-dark">
          <label className="block text-xs font-bold text-charcoal">Allergies / Dietary Restrictions</label>
          <div className="flex flex-wrap items-center gap-2">
            {['Dairy/Lactose', 'Gluten', 'Peanuts', 'Soy', 'Nightshades'].map((allg) => {
              const active = selectedAllergies.includes(allg);
              return (
                <button
                  key={allg}
                  type="button"
                  onClick={() =>
                    setSelectedAllergies((prev) =>
                      active ? prev.filter((a) => a !== allg) : [...prev, allg]
                    )
                  }
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                    active
                      ? 'bg-terracotta text-white border-terracotta font-semibold'
                      : 'bg-ivory text-charcoal border-ivory-dark hover:bg-white'
                  }`}
                >
                  {allg}
                </button>
              );
            })}
            <div className="flex items-center space-x-1.5">
              <input
                type="text"
                value={customAllergy}
                onChange={(e) => setCustomAllergy(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAllergy())}
                placeholder="Add other (e.g. Sesame)"
                className="px-3 py-1 text-xs bg-ivory border border-ivory-dark rounded-lg focus:outline-none focus:border-forest"
              />
              <button
                type="button"
                onClick={handleAddAllergy}
                className="px-2.5 py-1 bg-forest text-white rounded-lg text-xs font-semibold hover:bg-forest-light"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* 5. PRIMARY GENERATE ACTION */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-ivory-dark">
          <div className="text-xs text-charcoal-muted flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-gold" />
            <span>Harmonizes user Prakriti ({userPrakriti}) with ICMR-NIN nutrition data</span>
          </div>

          <button
            onClick={handleGeneratePlan}
            disabled={loading}
            className="w-full sm:w-auto bg-forest text-white font-bold px-8 py-3.5 rounded-2xl text-xs md:text-sm shadow-md hover:bg-forest-light transition-all flex items-center justify-center space-x-2.5 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 text-gold animate-spin" />
                <span>Creating your personalized plan...</span>
              </>
            ) : (
              <>
                <Utensils className="w-4 h-4 text-gold" />
                <span>Generate My Personalized Plan</span>
              </>
            )}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Generation Error: </span>
              <span>{error}</span>
              <button
                onClick={handleGeneratePlan}
                className="ml-2 font-bold underline hover:text-red-900"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Save Success Alert */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 16. EMPTY STATE (When no plan is yet generated) */}
      {/* ========================================================================= */}
      {!activePlan && !loading && (
        <div className="bg-white p-12 rounded-3xl border border-ivory-dark text-center space-y-4 shadow-ayur">
          <div className="w-16 h-16 rounded-full bg-sage-light text-forest flex items-center justify-center mx-auto shadow-sm">
            <Utensils className="w-8 h-8 text-forest" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-serif font-bold text-forest">Create Your Personalized Diet Plan</h2>
            <p className="text-xs text-charcoal-muted max-w-md mx-auto">
              Select your health condition and preferences above to generate a medically aligned, Ayurvedic meal plan tailored specifically to your body constitution.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center justify-center space-x-2 max-w-md mx-auto">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleGeneratePlan}
            className="inline-flex items-center space-x-2 bg-forest text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-forest-light transition-all shadow-md"
          >
            <Sparkles className="w-4 h-4 text-gold" />
            <span>Generate Plan Now</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GENERATED PLAN CONTAINER */}
      {/* ========================================================================= */}
      {activePlan && (
        <div className="space-y-8 print:space-y-6">
          {/* Printable Header */}
          <div className="hidden print:block border-b pb-4 mb-4">
            <h1 className="text-xl font-serif font-bold text-forest">AYURWELL – AYURVEDIC DIET PLANNING AND NUTRIENT ANALYSIS SYSTEM</h1>
            <h2 className="text-lg font-bold text-charcoal">{activePlan.planName}</h2>
            <div className="text-xs text-charcoal-muted mt-1 grid grid-cols-4 gap-2">
              <span><strong>Patient/User:</strong> {user?.fullName || user?.email || 'Registered User'}</span>
              <span><strong>Prakriti:</strong> {userPrakriti}</span>
              <span><strong>Target Focus:</strong> {activePlan.targetDisease}</span>
              <span><strong>Duration:</strong> {activePlan.durationDays || durationDays} Days</span>
            </div>
          </div>

          {/* Active Plan Summary Bar */}
          <div className="bg-white p-6 rounded-3xl border border-sage/30 shadow-ayur flex flex-col md:flex-row items-start md:items-center justify-between gap-6 print:border print:p-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sage">Active Personalized Plan</span>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-forest">{activePlan.planName}</h2>
              <p className="text-xs text-charcoal-muted">
                Condition: <span className="font-bold text-forest">{activePlan.targetDisease}</span> • Constitution: <span className="font-bold text-forest">{userPrakriti}</span> • Duration: <span className="font-bold text-forest">{activePlan.durationDays || durationDays} Days</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="text-center px-3.5 py-2 rounded-2xl bg-sage-light border border-sage/20">
                <span className="block text-[10px] uppercase font-bold text-sage">AyurScore</span>
                <span className="text-lg font-bold text-forest">{activePlan.ayurvedicNutritionScore} / 100</span>
              </div>
              <div className="text-center px-3.5 py-2 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="block text-[10px] uppercase font-bold text-amber-800">Daily Target</span>
                <span className="text-lg font-bold text-amber-950">{activePlan.totalDailyCalories} kcal</span>
              </div>
              <div className="text-center px-3.5 py-2 rounded-2xl bg-ivory border border-ivory-dark">
                <span className="block text-[10px] uppercase font-bold text-charcoal-muted">Avg Budget</span>
                <span className="text-lg font-bold text-forest">₹{activePlan.totalDailyBudgetInr}/day</span>
              </div>
              <div className="print:hidden">
                <button
                  onClick={handleSavePlan}
                  className="px-4 py-3 rounded-2xl bg-forest text-white text-xs font-bold hover:bg-forest-light transition-all flex items-center space-x-1.5 shadow-md"
                >
                  <Save className="w-4 h-4 text-gold" />
                  <span>Save My Plan</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 6. DAY-BY-DAY MEAL TIMETABLE */}
          {/* ========================================================================= */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-forest" />
                <h3 className="font-serif font-bold text-forest text-lg">Daily Meal Schedule</h3>
              </div>

              {/* Day Selector Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full print:hidden">
                {planDaysArray.map((dayNum) => (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => setActiveDayIndex(dayNum)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      activeDayIndex === dayNum
                        ? 'bg-forest text-white shadow-sm ring-2 ring-forest/20'
                        : 'bg-white text-charcoal border border-ivory-dark hover:bg-ivory'
                    }`}
                  >
                    Day {dayNum}
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Macro Bar */}
            <div className="bg-ivory p-3.5 rounded-2xl border border-ivory-dark flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-bold text-forest">Day {activeDayIndex} Breakdown:</span>
              <div className="flex flex-wrap items-center gap-4 text-charcoal font-semibold">
                <span>⚡ {activeDayStats.calories} kcal</span>
                <span>🍗 Protein: {activeDayStats.protein}g</span>
                <span>🌾 Carbs: {activeDayStats.carbs}g</span>
                <span>🥑 Fat: {activeDayStats.fat}g</span>
                <span>🥗 Fiber: {activeDayStats.fiber}g</span>
              </div>
            </div>

            {/* Meals Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeDayMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="bg-white p-5 rounded-3xl border border-ivory-dark shadow-ayur flex flex-col justify-between space-y-4 hover:border-sage/40 transition-all"
                >
                  <div className="space-y-3">
                    {/* Meal Slot Badge & Cost */}
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-forest text-white text-[10px] font-bold uppercase tracking-wider">
                        {meal.mealType?.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        ₹{meal.costInr}
                      </span>
                    </div>

                    {/* Meal Title & Description */}
                    <div>
                      <h4 className="font-serif font-bold text-forest text-base leading-snug">{meal.recipeTitle}</h4>
                      <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">{meal.recipeDescription}</p>
                    </div>

                    {/* Nutritional Chips */}
                    <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-ivory text-[10px] font-semibold text-charcoal">
                      <span>⚡ {meal.calories} kcal</span>
                      <span>🍗 {meal.protein}g Prot</span>
                      <span>🌾 {meal.carbs || 0}g Carb</span>
                      <span>🥑 {meal.fat || 0}g Fat</span>
                      <span>🥗 {meal.fiber || 0}g Fiber</span>
                      <span>🩸 {meal.ironMg || 0}mg Fe</span>
                    </div>

                    {/* Ingredients List */}
                    {meal.keyIngredients && meal.keyIngredients.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {meal.keyIngredients.map((ing, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-sage-light text-forest text-[10px] font-medium border border-sage/15"
                          >
                            🌿 {ing}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Ayurvedic Rasa/Virya */}
                    {meal.ayurvedicProperties && (
                      <div className="text-[10px] text-charcoal-muted bg-ivory/80 px-2.5 py-1 rounded-lg border border-ivory-dark">
                        {meal.ayurvedicProperties}
                      </div>
                    )}
                  </div>

                  {/* Interactive Actions */}
                  <div className="pt-2 border-t border-ivory-dark flex items-center justify-between gap-2 print:hidden">
                    <button
                      onClick={() => setWhyModalMeal(meal)}
                      className="px-3 py-1.5 rounded-xl border border-sage/30 bg-sage-light text-forest text-[11px] font-bold hover:bg-sage-light/80 transition-all flex items-center space-x-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-sage" />
                      <span>Why Recommended?</span>
                    </button>

                    <button
                      onClick={() => handleOpenSwapModal(meal)}
                      className="px-3 py-1.5 rounded-xl border border-ivory-dark bg-white text-charcoal text-[11px] font-bold hover:bg-ivory transition-all flex items-center space-x-1"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-forest" />
                      <span>Replace Meal</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 10. NUTRITION SUMMARY & CHARTS */}
          {/* ========================================================================= */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-ivory-dark shadow-ayur space-y-6">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-forest" />
              <h3 className="font-serif font-bold text-forest text-lg">Nutritional Summary (Plan Daily Average)</h3>
            </div>

            {/* Macro Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
              <div className="p-4 rounded-2xl bg-ivory border border-ivory-dark text-center">
                <span className="block text-[10px] font-bold text-charcoal-muted uppercase">Daily Calories</span>
                <span className="text-xl font-serif font-bold text-forest mt-1 block">
                  {activePlan.totalDailyCalories}
                </span>
                <span className="text-[10px] text-charcoal-muted">kcal / day</span>
              </div>

              <div className="p-4 rounded-2xl bg-ivory border border-ivory-dark text-center">
                <span className="block text-[10px] font-bold text-charcoal-muted uppercase">Protein</span>
                <span className="text-xl font-serif font-bold text-forest mt-1 block">
                  {activePlan.dailyAverageProtein || 65}g
                </span>
                <span className="text-[10px] text-charcoal-muted">RDA ~55-65g</span>
              </div>

              <div className="p-4 rounded-2xl bg-ivory border border-ivory-dark text-center">
                <span className="block text-[10px] font-bold text-charcoal-muted uppercase">Carbohydrates</span>
                <span className="text-xl font-serif font-bold text-forest mt-1 block">
                  {activePlan.dailyAverageCarbs || 230}g
                </span>
                <span className="text-[10px] text-charcoal-muted">Complex & Low GI</span>
              </div>

              <div className="p-4 rounded-2xl bg-ivory border border-ivory-dark text-center">
                <span className="block text-[10px] font-bold text-charcoal-muted uppercase">Healthy Fats</span>
                <span className="text-xl font-serif font-bold text-forest mt-1 block">
                  {activePlan.dailyAverageFat || 42}g
                </span>
                <span className="text-[10px] text-charcoal-muted">A2 Ghee / Nuts</span>
              </div>

              <div className="p-4 rounded-2xl bg-sage-light border border-sage/20 text-center">
                <span className="block text-[10px] font-bold text-sage uppercase">Dietary Fiber</span>
                <span className="text-xl font-serif font-bold text-forest mt-1 block">
                  {activePlan.dailyAverageFiber || 32}g
                </span>
                <span className="text-[10px] text-forest font-semibold">Agni Clearing</span>
              </div>
            </div>

            {/* Micronutrient Progress Bars */}
            <div className="space-y-3 pt-3 border-t border-ivory-dark">
              <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider">
                Key Micronutrient Levels vs. RDA Reference
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Iron */}
                <div className="p-3.5 rounded-2xl bg-ivory border border-ivory-dark space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Iron (Fe)</span>
                    <span className="font-bold text-forest">{activePlan.dailyAverageIron || 16.5} mg</span>
                  </div>
                  <div className="w-full bg-ivory-dark h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, ((activePlan.dailyAverageIron || 16.5) / 18) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-charcoal-muted block text-right">Target ~18 mg</span>
                </div>

                {/* Calcium */}
                <div className="p-3.5 rounded-2xl bg-ivory border border-ivory-dark space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Calcium (Ca)</span>
                    <span className="font-bold text-forest">{activePlan.dailyAverageCalcium || 820} mg</span>
                  </div>
                  <div className="w-full bg-ivory-dark h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, ((activePlan.dailyAverageCalcium || 820) / 1000) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-charcoal-muted block text-right">Target ~1000 mg</span>
                </div>

                {/* Vit B12 */}
                <div className="p-3.5 rounded-2xl bg-ivory border border-ivory-dark space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Vitamin B12</span>
                    <span className="font-bold text-forest">{activePlan.dailyAverageB12 || 1.8} mcg</span>
                  </div>
                  <div className="w-full bg-ivory-dark h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, ((activePlan.dailyAverageB12 || 1.8) / 2.4) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-charcoal-muted block text-right">Target ~2.4 mcg</span>
                </div>

                {/* Folate */}
                <div className="p-3.5 rounded-2xl bg-ivory border border-ivory-dark space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Folate (B9)</span>
                    <span className="font-bold text-forest">{activePlan.dailyAverageFolate || 240} mcg</span>
                  </div>
                  <div className="w-full bg-ivory-dark h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, ((activePlan.dailyAverageFolate || 240) / 300) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-charcoal-muted block text-right">Target ~300 mcg</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 11. NUTRIENT GAP ANALYSIS (Integrated ML Microservice) */}
          {/* ========================================================================= */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-ivory-dark shadow-ayur space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-ivory-dark pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-gold" />
                  <h3 className="font-serif font-bold text-forest text-lg">AI/ML Nutrient Gap Risk Prediction</h3>
                </div>
                <p className="text-xs text-charcoal-muted">
                  Cross-analyzed with Random Forest Classifier & ICMR-NIN RDA benchmark models.
                </p>
              </div>

              {mlAnalysis && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-forest bg-sage-light px-3 py-1.5 rounded-xl border border-sage/20">
                    {mlAnalysis.overall_status}
                  </span>
                  <span className="text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                    Risk Score: {mlAnalysis.risk_score_percentage}%
                  </span>
                </div>
              )}
            </div>

            {loadingMl && (
              <div className="text-center py-6 text-xs text-charcoal-muted flex items-center justify-center space-x-2">
                <RefreshCw className="w-4 h-4 text-forest animate-spin" />
                <span>Evaluating dietary nutrient risk with ML models...</span>
              </div>
            )}

            {mlAnalysis && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {mlAnalysis.deficiencies.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border space-y-2.5 ${
                        item.risk_level === 'High Risk'
                          ? 'bg-red-50/70 border-red-200 text-red-950'
                          : item.risk_level === 'Moderate Risk'
                          ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                          : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{item.nutrient}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.risk_level === 'High Risk'
                              ? 'bg-red-200 text-red-900'
                              : item.risk_level === 'Moderate Risk'
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-emerald-200 text-emerald-900'
                          }`}
                        >
                          {item.risk_level}
                        </span>
                      </div>

                      <div className="text-[11px] space-y-1">
                        <span className="block font-semibold text-charcoal">Recommended Ayurvedic Superfoods:</span>
                        <div className="flex flex-wrap gap-1">
                          {item.recommended_ayurvedic_foods.map((food, fIdx) => (
                            <span key={fIdx} className="bg-white/80 px-1.5 py-0.5 rounded text-[10px] font-medium border border-black/5">
                              ✨ {food}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-2xl bg-ivory border border-ivory-dark flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <p className="text-[11px] text-charcoal-muted leading-relaxed">
                    <strong>Improve My Plan Suggestion:</strong> Incorporating 10g soaked black raisins, ragi porridge, and A2 cow ghee naturally satisfies all micronutrient benchmarks without synthetic multivitamins.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 9. AYURVEDIC CONSIDERATION & 12. FOODS TO LIMIT */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ayurvedic Considerations (Pathya) */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-ivory-dark shadow-ayur space-y-4">
              <div className="flex items-center space-x-2">
                <Leaf className="w-5 h-5 text-forest" />
                <h3 className="font-serif font-bold text-forest text-lg">Ayurvedic Considerations (Pathya)</h3>
              </div>

              <div className="space-y-3 text-xs text-charcoal">
                <div className="p-3 rounded-2xl bg-sage-light border border-sage/20 space-y-1">
                  <span className="font-bold text-forest">Primary Body Constitution (Prakriti):</span>
                  <p className="text-charcoal-muted leading-relaxed">
                    Personalized for <strong>{userPrakriti}</strong> Prakriti with seasonal support for {activePlan.season}. Focuses on balancing Jatharagni with easily assimilable nutrients.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-forest block">Classical Dietary Rules:</span>
                  <ul className="space-y-2 list-disc list-inside text-charcoal-muted leading-relaxed">
                    {activePlan.dietaryTips.map((tip, i) => (
                      <li key={i} className="text-xs">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Foods to Limit (Apathya) */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-ivory-dark shadow-ayur space-y-4">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-terracotta" />
                <h3 className="font-serif font-bold text-forest text-lg">Foods to Limit (Apathya)</h3>
              </div>

              <div className="space-y-3 text-xs text-charcoal">
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 space-y-1">
                  <span className="font-bold">Condition Contraindications ({activePlan.targetDisease}):</span>
                  <p className="text-amber-900 leading-relaxed">
                    Minimizing these items helps avoid endotoxin (Ama) generation and prevents exacerbation of metabolic inflammation.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-forest block">Items & Habits to Restrict:</span>
                  <ul className="space-y-2 list-disc list-inside text-charcoal-muted leading-relaxed">
                    {(activePlan.foodsToLimit && activePlan.foodsToLimit.length > 0
                      ? activePlan.foodsToLimit
                      : [
                          'Deep fried oily savories and reheated fast foods.',
                          'Excessive refined white sugar and chemical sweeteners.',
                          'Sour curd (yogurt) consumed late at night.',
                          'Incompatible pairings (Viruddha Ahara) like milk with sour fruits.',
                        ]
                    ).map((limitItem, i) => (
                      <li key={i} className="text-xs">
                        {limitItem}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. "WHY RECOMMENDED?" MODAL */}
      {/* ========================================================================= */}
      {whyModalMeal && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full border border-ivory-dark shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-ivory-dark pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sage">Clinical Rationale</span>
                <h3 className="font-serif font-bold text-forest text-lg">{whyModalMeal.recipeTitle}</h3>
              </div>
              <button
                onClick={() => setWhyModalMeal(null)}
                className="p-1 rounded-full hover:bg-ivory text-charcoal-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-sage-light border border-sage/20 space-y-1">
                <span className="font-bold text-forest flex items-center space-x-1.5">
                  <Leaf className="w-4 h-4 text-forest" />
                  <span>Why This Food is Recommended:</span>
                </span>
                <p className="text-charcoal leading-relaxed mt-1">
                  {whyModalMeal.whyRecommended ||
                    'Formulated using balanced Rasas and easily digestible carbohydrates that stimulate Jatharagni without aggravating metabolic biomarkers.'}
                </p>
              </div>

              {whyModalMeal.ayurvedicProperties && (
                <div className="p-3.5 rounded-2xl bg-ivory border border-ivory-dark space-y-1">
                  <span className="font-bold text-forest">Ayurvedic Taxonomy:</span>
                  <p className="text-charcoal-muted leading-relaxed font-mono text-[11px]">
                    {whyModalMeal.ayurvedicProperties}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-ivory border border-ivory-dark">
                  <span className="block text-[10px] text-charcoal-muted">Calories</span>
                  <span className="font-bold text-forest text-sm">{whyModalMeal.calories} kcal</span>
                </div>
                <div className="p-2.5 rounded-xl bg-ivory border border-ivory-dark">
                  <span className="block text-[10px] text-charcoal-muted">Protein</span>
                  <span className="font-bold text-forest text-sm">{whyModalMeal.protein}g</span>
                </div>
                <div className="p-2.5 rounded-xl bg-ivory border border-ivory-dark">
                  <span className="block text-[10px] text-charcoal-muted">Cost</span>
                  <span className="font-bold text-forest text-sm">₹{whyModalMeal.costInr}</span>
                </div>
              </div>

              <p className="text-[11px] text-charcoal-muted italic border-t border-ivory-dark pt-2">
                Educational Disclaimer: Recommended foods provide supportive nutritional therapy and do not claim to cure medical conditions.
              </p>
            </div>

            <div className="text-right">
              <button
                onClick={() => setWhyModalMeal(null)}
                className="px-5 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-light transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. FOOD SWAP MODAL */}
      {/* ========================================================================= */}
      {swapModalMeal && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full border border-ivory-dark shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-ivory-dark pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sage">Meal Replacement</span>
                <h3 className="font-serif font-bold text-forest text-lg">
                  Replace: {swapModalMeal.recipeTitle}
                </h3>
                <span className="text-xs text-charcoal-muted">
                  Slot: {swapModalMeal.mealType?.replace('_', ' ')} • Condition: {activePlan?.targetDisease}
                </span>
              </div>
              <button
                onClick={() => setSwapModalMeal(null)}
                className="p-1 rounded-full hover:bg-ivory text-charcoal-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {loadingSwap && (
                <div className="text-center py-8 text-xs text-charcoal-muted flex items-center justify-center space-x-2">
                  <RefreshCw className="w-4 h-4 text-forest animate-spin" />
                  <span>Loading compatible alternative meals...</span>
                </div>
              )}

              {!loadingSwap && swapOptions.length === 0 && (
                <div className="text-center py-8 text-xs text-charcoal-muted">
                  No alternative recipes available for this specific slot and condition combination.
                </div>
              )}

              {!loadingSwap &&
                swapOptions.map((opt) => (
                  <div
                    key={opt.id}
                    className="p-4 rounded-2xl border border-ivory-dark bg-ivory/40 hover:bg-white hover:border-forest/40 transition-all space-y-2.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-serif font-bold text-forest text-sm">{opt.title}</h4>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ₹{opt.costInr}
                        </span>
                      </div>
                      <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">{opt.description}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-ivory-dark text-[11px]">
                      <div className="flex items-center space-x-3 text-charcoal font-semibold">
                        <span>⚡ {opt.calories} kcal</span>
                        <span>🍗 {opt.protein}g Prot</span>
                        <span>🌾 {opt.carbs}g Carb</span>
                      </div>

                      <button
                        onClick={() => handleApplySwap(opt)}
                        className="px-3 py-1.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-light transition-all flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Select This Meal</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            <div className="text-right pt-2 border-t border-ivory-dark">
              <button
                onClick={() => setSwapModalMeal(null)}
                className="px-5 py-2 rounded-xl border border-ivory-dark bg-ivory text-charcoal text-xs font-bold hover:bg-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 14. SAVED PLANS MODAL (Belonging to authenticated user) */}
      {/* ========================================================================= */}
      {showSavedPlansModal && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full border border-ivory-dark shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-ivory-dark pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sage">User Archive</span>
                <h3 className="font-serif font-bold text-forest text-lg">My Saved Diet Plans</h3>
                <span className="text-xs text-charcoal-muted">
                  Strictly isolated to your account ({user?.fullName || user?.email})
                </span>
              </div>
              <button
                onClick={() => setShowSavedPlansModal(false)}
                className="p-1 rounded-full hover:bg-ivory text-charcoal-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {loadingSavedPlans && (
                <div className="text-center py-8 text-xs text-charcoal-muted flex items-center justify-center space-x-2">
                  <RefreshCw className="w-4 h-4 text-forest animate-spin" />
                  <span>Loading your saved plans...</span>
                </div>
              )}

              {!loadingSavedPlans && savedPlansList.length === 0 && (
                <div className="text-center py-10 text-xs text-charcoal-muted space-y-2">
                  <Bookmark className="w-8 h-8 text-sage mx-auto opacity-50" />
                  <p>You haven't saved any diet plans yet.</p>
                  <p className="text-[11px]">Generate a plan and click "Save My Plan" to store it here.</p>
                </div>
              )}

              {!loadingSavedPlans &&
                savedPlansList.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-4 rounded-2xl border border-ivory-dark bg-ivory/40 hover:bg-white hover:border-sage/40 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <h4 className="font-serif font-bold text-forest text-sm">{plan.planName}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-charcoal-muted">
                        <span className="font-semibold text-charcoal">{plan.targetDisease}</span>
                        <span>•</span>
                        <span>{plan.durationDays} Days</span>
                        <span>•</span>
                        <span>Score: {plan.ayurvedicNutritionScore}/100</span>
                        <span>•</span>
                        <span>{plan.createdAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleLoadSavedPlan(plan.id)}
                        className="px-3 py-1.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-light transition-all"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDeleteSavedPlan(plan.id)}
                        className="p-1.5 rounded-xl border border-ivory-dark text-red-600 hover:bg-red-50 transition-all"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            <div className="text-right pt-2 border-t border-ivory-dark">
              <button
                onClick={() => setShowSavedPlansModal(false)}
                className="px-5 py-2 rounded-xl border border-ivory-dark bg-ivory text-charcoal text-xs font-bold hover:bg-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
