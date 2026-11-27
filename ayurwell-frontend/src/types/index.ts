export type DoshaType = 'VATA' | 'PITTA' | 'KAPHA' | 'VATA_PITTA' | 'PITTA_KAPHA' | 'VATA_KAPHA' | 'TRIDOSHA';

export type WomensHealthStage = 'PCOS' | 'PREGNANCY' | 'POSTPARTUM' | 'MENSTRUATION' | 'MENOPAUSE' | 'ANEMIA' | 'NONE';

export type RituSeason = 'VASANTA' | 'GRISHMA' | 'VARSHA' | 'SHARAD' | 'HEMANTA' | 'SHISHIRA';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

export interface UserProfile {
  id: number;
  userId: number;
  email: string;
  fullName: string;
  age: number;
  gender: string;
  weightKg: number;
  heightCm: number;
  bmi: number;
  activityLevel: string;
  budgetPerDayInr: number;
  primaryHealthGoal: string;
  primaryDosha?: DoshaType;
  digestiveFireAgni: string;
  targetDiseaseCondition: string;
  dietaryPreference?: string;
  profileCompleted?: boolean;
}

export interface DoshaAssessmentResult {
  vataScore: number;
  pittaScore: number;
  kaphaScore: number;
  primaryPrakriti: DoshaType;
  secondaryPrakriti: DoshaType;
  description: string;
  dietaryRecommendations: string[];
  lifestyleTips: string[];
  herbsRecommended: string[];
}

export interface MealItem {
  id: number;
  dayIndex?: number;
  mealType: 'BREAKFAST' | 'MID_MORNING' | 'LUNCH' | 'EVENING_SNACK' | 'DINNER' | string;
  recipeTitle: string;
  recipeDescription: string;
  dayOfWeek: string;
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  ironMg?: number;
  calciumMg?: number;
  vitaminB12Mcg?: number;
  vitaminDIu?: number;
  folateMcg?: number;
  costInr: number;
  suitableDosha?: string;
  keyIngredients?: string[];
  whyRecommended?: string;
  ayurvedicProperties?: string;
}

export interface DietPlan {
  id: number;
  planName: string;
  targetDisease: string;
  season: string;
  womensHealthStage: string;
  durationDays?: number;
  dietaryPreference?: string;
  cuisinePreference?: string;
  totalDailyBudgetInr: number;
  totalDailyCalories: number;
  dailyAverageProtein?: number;
  dailyAverageCarbs?: number;
  dailyAverageFat?: number;
  dailyAverageFiber?: number;
  dailyAverageIron?: number;
  dailyAverageCalcium?: number;
  dailyAverageB12?: number;
  dailyAverageVitD?: number;
  dailyAverageFolate?: number;
  ayurvedicNutritionScore: number;
  meals: MealItem[];
  dietaryTips: string[];
  foodsToLimit?: string[];
  ayurvedicConsiderations?: Record<string, any>;
  createdAt?: string;
}

export interface ViruddhaConflict {
  foodA: string;
  foodB: string;
  incompatibilityType: string;
  hazardReason: string;
  antidote: string;
}

export interface ViruddhaCheckResponse {
  compatible: boolean;
  compatibilityScore: number;
  conflicts: ViruddhaConflict[];
  generalAdvice: string[];
}

export interface Recipe {
  id: number;
  title: string;
  description: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'EVENING_SNACK' | 'DINNER';
  suitableDosha: DoshaType;
  suitableSeason: RituSeason;
  prepTimeMins: number;
  costPerServingInr: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  ironMg: number;
  instructions: string;
  suitableDiseaseConditions: string;
  suitableWomensHealthStage: string;
}

export interface WomensHealthPlan {
  stage: WomensHealthStage;
  title: string;
  overview: string;
  recommendedFoods: string[];
  foodsToAvoid: string[];
  lifestyleGuidelines: string[];
  recommendedHerbs: string[];
  suggestedMeals: MealItem[];
  doshaTailoredInsights?: string[];
  trimesterNotice?: string | null;
}

export interface WomensHealthProfileData {
  id?: number;
  stage: WomensHealthStage | null;
  pregnancyTrimester?: number | null;
  cyclePhase?: string | null;
  symptoms?: string[];
  lastPeriodDate?: string | null;
  cycleLengthDays?: number;
  periodDurationDays?: number;
  flowLevel?: string | null;
  crampsSeverity?: string | null;
  mood?: string | null;
  energyLevel?: string | null;
  currentCycleDay?: number | null;
  estimatedNextPeriod?: string | null;
  estimatedCyclePhase?: string | null;
  isPeriodActive?: boolean;
  menopauseSymptoms?: string[];
  hotFlashFrequency?: number | null;
  sleepQualityRating?: number | null;
  dailyIronTargetMg?: number;
  dailyIronIntakeMg?: number;
  plan?: WomensHealthPlan | null;
}

export interface WomensHealthLogItem {
  id?: number;
  logDate: string;
  logType: string;
  flowLevel?: string | null;
  crampsSeverity?: string | null;
  mood?: string | null;
  energy?: string | null;
  symptoms?: string[];
  ironIntakeMg?: number | null;
  waterIntakeL?: number | null;
  sleepHours?: number | null;
  wellnessScore?: number | null;
  notes?: string | null;
}

export interface DailyLogItem {
  date: string;
  calories: number;
  waterLiters: number;
  energyLevel: number;
  digestionQuality: number;
  ayurScore: number;
  ironMg: number;
  calciumMg: number;
}

export interface DeficiencyRisk {
  nutrientName: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
  symptomsToWatch: string;
  recommendedAyurvedicFoods: string[];
}

export interface AnalyticsSummary {
  currentAyurScore: number;
  averageCalories: number;
  averageWaterLiters: number;
  historicalLogs: DailyLogItem[];
  deficiencyRisks: DeficiencyRisk[];
  monthlyDigestiveHealthInsight: string;
}

export interface Reminder {
  id: number;
  title: string;
  reminderTime: string;
  category: 'MEAL' | 'HYDRATION' | 'HERBAL_TEA' | 'MEDITATION';
  description: string;
  enabled: boolean;
}
