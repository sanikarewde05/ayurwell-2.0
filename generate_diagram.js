const fs = require('fs');
const path = require('path');

const WIDTH = 3600;
const HEIGHT = 2420;

// Color Palette - Ayurvedic Medical / Modern Tech
const colors = {
  canvasBg: '#090D16',
  gridLine: 'rgba(255, 255, 255, 0.035)',
  
  // Domains
  auth: {
    bg: '#0F172A',
    border: '#38BDF8',
    headerBg: 'url(#grad-auth)',
    headerText: '#FFFFFF',
    packageBg: 'rgba(56, 189, 248, 0.03)',
    packageBorder: 'rgba(56, 189, 248, 0.3)',
    tag: '#38BDF8'
  },
  dosha: {
    bg: '#0F172A',
    border: '#34D399',
    headerBg: 'url(#grad-dosha)',
    headerText: '#FFFFFF',
    packageBg: 'rgba(52, 211, 153, 0.03)',
    packageBorder: 'rgba(52, 211, 153, 0.3)',
    tag: '#34D399'
  },
  diet: {
    bg: '#0F172A',
    border: '#FBBF24',
    headerBg: 'url(#grad-diet)',
    headerText: '#FFFFFF',
    packageBg: 'rgba(251, 191, 36, 0.03)',
    packageBorder: 'rgba(251, 191, 36, 0.3)',
    tag: '#FBBF24'
  },
  foodScience: {
    bg: '#0F172A',
    border: '#2DD4BF',
    headerBg: 'url(#grad-food)',
    headerText: '#FFFFFF',
    packageBg: 'rgba(45, 212, 191, 0.03)',
    packageBorder: 'rgba(45, 212, 191, 0.3)',
    tag: '#2DD4BF'
  },
  womens: {
    bg: '#0F172A',
    border: '#F472B6',
    headerBg: 'url(#grad-womens)',
    headerText: '#FFFFFF',
    packageBg: 'rgba(244, 114, 182, 0.03)',
    packageBorder: 'rgba(244, 114, 182, 0.3)',
    tag: '#F472B6'
  },
  tracking: {
    bg: '#0F172A',
    border: '#818CF8',
    headerBg: 'url(#grad-tracking)',
    headerText: '#FFFFFF',
    packageBg: 'rgba(129, 140, 248, 0.03)',
    packageBorder: 'rgba(129, 140, 248, 0.3)',
    tag: '#818CF8'
  },
  enums: {
    bg: '#111827',
    border: '#A78BFA',
    headerBg: 'url(#grad-enums)',
    headerText: '#FFFFFF',
    packageBg: 'rgba(167, 139, 250, 0.03)',
    packageBorder: 'rgba(167, 139, 250, 0.3)',
    tag: '#A78BFA'
  },
  arch: {
    packageBg: 'rgba(148, 163, 184, 0.03)',
    packageBorder: 'rgba(148, 163, 184, 0.25)',
  }
};

// Classes Definition
const classes = [
  // --- AUTH DOMAIN ---
  {
    id: 'User',
    title: 'User',
    stereotype: '«Entity»',
    table: '@Table(name = "users")',
    domain: 'auth',
    x: 440, y: 170, w: 380,
    attributes: [
      { vis: '+', name: 'id', type: 'Long', pk: true },
      { vis: '+', name: 'email', type: 'String', note: 'unique, not null' },
      { vis: '+', name: 'password', type: 'String', note: 'BCrypt hashed' },
      { vis: '+', name: 'fullName', type: 'String', note: 'not null' },
      { vis: '+', name: 'role', type: 'String', def: '"ROLE_USER"' },
      { vis: '+', name: 'active', type: 'boolean', def: 'true' },
      { vis: '+', name: 'emailVerified', type: 'boolean', def: 'false' },
      { vis: '+', name: 'createdAt', type: 'LocalDateTime' }
    ],
    methods: [
      { vis: '#', name: 'onCreate()', ret: 'void' }
    ]
  },
  {
    id: 'UserProfile',
    title: 'UserProfile',
    stereotype: '«Entity»',
    table: '@Table(name = "user_profiles")',
    domain: 'auth',
    x: 70, y: 415, w: 340,
    attributes: [
      { vis: '+', name: 'id', type: 'Long', pk: true },
      { vis: '+', name: 'user', type: 'User', fk: true, note: '1:1 unique' },
      { vis: '+', name: 'age', type: 'Integer' },
      { vis: '+', name: 'gender', type: 'String' },
      { vis: '+', name: 'weightKg', type: 'Double' },
      { vis: '+', name: 'heightCm', type: 'Double' },
      { vis: '+', name: 'activityLevel', type: 'String' },
      { vis: '+', name: 'budgetPerDayInr', type: 'Double' },
      { vis: '+', name: 'primaryHealthGoal', type: 'String' },
      { vis: '+', name: 'primaryDosha', type: 'DoshaType', enum: true },
      { vis: '+', name: 'digestiveFireAgni', type: 'AgniType', enum: true },
      { vis: '+', name: 'targetDiseaseCondition', type: 'String' },
      { vis: '+', name: 'profileCompleted', type: 'Boolean', def: 'false' }
    ],
    methods: []
  },
  {
    id: 'EmailOtp',
    title: 'EmailOtp',
    stereotype: '«Entity»',
    table: '@Table(name = "email_otps")',
    domain: 'auth',
    x: 70, y: 170, w: 340,
    attributes: [
      { vis: '+', name: 'id', type: 'Long', pk: true },
      { vis: '+', name: 'email', type: 'String', note: 'Indexed' },
      { vis: '+', name: 'otpHash', type: 'String' },
      { vis: '+', name: 'expiresAt', type: 'LocalDateTime' },
      { vis: '+', name: 'verified', type: 'boolean', def: 'false' },
      { vis: '+', name: 'attempts', type: 'int', def: '0' }
    ],
    methods: []
  },

  // --- DOSHA DOMAIN ---
  {
    id: 'DoshaAssessment',
    title: 'DoshaAssessment',
    stereotype: '«Entity»',
    table: '@Table(name = "dosha_assessments")',
    domain: 'dosha',
    x: 440, y: 880, w: 380,
    attributes: [
      { vis: '+', name: 'id', type: 'Long', pk: true },
      { vis: '+', name: 'user', type: 'User', fk: true, note: 'N:1' },
      { vis: '+', name: 'vataScore', type: 'Integer' },
      { vis: '+', name: 'pittaScore', type: 'Integer' },
      { vis: '+', name: 'kaphaScore', type: 'Integer' },
      { vis: '+', name: 'primaryPrakriti', type: 'DoshaType', enum: true },
      { vis: '+', name: 'secondaryPrakriti', type: 'DoshaType', enum: true },
      { vis: '+', name: 'assessedAt', type: 'LocalDateTime' }
    ],
    methods: [
      { vis: '#', name: 'onCreate()', ret: 'void' }
    ]
  },
  {
    id: 'DoshaType',
    title: 'DoshaType',
    stereotype: '«Enumeration»',
    table: 'Prakriti Constitution Types',
    domain: 'enums',
    x: 70, y: 880, w: 340,
    attributes: [
      { vis: '+', name: 'VATA', type: 'Ether + Air' },
      { vis: '+', name: 'PITTA', type: 'Fire + Water' },
      { vis: '+', name: 'KAPHA', type: 'Water + Earth' },
      { vis: '+', name: 'VATA_PITTA', type: 'Dual Constitution' },
      { vis: '+', name: 'PITTA_KAPHA', type: 'Dual Constitution' },
      { vis: '+', name: 'VATA_KAPHA', type: 'Dual Constitution' },
      { vis: '+', name: 'TRIDOSHA', type: 'Equally Balanced' }
    ],
    methods: []
  },
  {
    id: 'AgniType',
    title: 'AgniType',
    stereotype: '«Enumeration»',
    table: 'Digestive Metabolic Fire',
    domain: 'enums',
    x: 70, y: 1145, w: 340,
    attributes: [
      { vis: '+', name: 'MANDA', type: 'Sluggish (Kapha dominant)' },
      { vis: '+', name: 'TIKSHNA', type: 'Hyper-intense (Pitta dominant)' },
      { vis: '+', name: 'VISHAMA', type: 'Irregular / Fluctuating (Vata)' },
      { vis: '+', name: 'SAMA', type: 'Balanced Optimal Digestion' }
    ],
    methods: []
  },

  // --- TRACKING DOMAIN ---
  {
    id: 'DailyHealthLog',
    title: 'DailyHealthLog',
    stereotype: '«Entity»',
    table: '@Table(name = "daily_health_logs")',
    domain: 'tracking',
    x: 70, y: 1470, w: 360,
    attributes: [
      { vis: '+', name: 'id', type: 'Long', pk: true },
      { vis: '+', name: 'user', type: 'User', fk: true, note: 'N:1' },
      { vis: '+', name: 'logDate', type: 'LocalDate' },
      { vis: '+', name: 'caloriesConsumed', type: 'Double' },
      { vis: '+', name: 'waterIntakeLiters', type: 'Double' },
      { vis: '+', name: 'energyLevelRating', type: 'Integer', note: '1 - 10' },
      { vis: '+', name: 'digestionQualityRating', type: 'Integer', note: '1 - 10' },
      { vis: '+', name: 'ayurScoreToday', type: 'Integer', note: '0 - 100' },
      { vis: '+', name: 'ironIntakeMg', type: 'Double' },
      { vis: '+', name: 'calciumIntakeMg', type: 'Double' },
      { vis: '+', name: 'proteinIntakeGrams', type: 'Double' }
    ],
    methods: []
  },
  {
    id: 'Reminder',
    title: 'Reminder',
    stereotype: '«Entity»',
    table: '@Table(name = "reminders")',
    domain: 'tracking',
    x: 460, y: 1470, w: 360,
    attributes: [
      { vis: '+', name: 'id', type: 'Long', pk: true },
      { vis: '+', name: 'user', type: 'User', fk: true, note: 'N:1' },
      { vis: '+', name: 'title', type: 'String' },
      { vis: '+', name: 'reminderTime', type: 'LocalTime' },
      { vis: '+', name: 'category', type: 'String', note: 'MEAL, TEA, RITU' },
      { vis: '+', name: 'description', type: 'String' },
      { vis: '+', name: 'enabled', type: 'boolean', def: 'true' }
    ],
    methods: []
  },

  // --- DIET PLANNING DOMAIN ---
  {
    id: 'MealPlan',
    title: 'MealPlan',
    stereotype: '«Entity»',
    table: '@Table(name = "meal_plans")',
    domain: 'diet',
    x: 900, y: 170, w: 390,
    attributes: [
      { vis: '+', name: 'id', type: 'Long', pk: true },
      { vis: '+', name: 'user', type: 'User', fk: true, note: 'N:1' },
      { vis: '+', name: 'planName', type: 'String' },
      { vis: '+', name: 'targetDisease', type: 'String' },
      { vis: '+', name: 'season', type: 'String' },
      { vis: '+', name: 'womensHealthStage', type: 'String' },
      { vis: '+', name: 'totalDailyBudgetInr', type: 'Double' },
      { vis: '+', name: 'totalDailyCalories', type: 'Double' },
      { vis: '+', name: 'ayurvedicNutritionScore', type: 'Integer', note: '0-100' },
      { vis: '+', name: 'createdAt', type: 'LocalDateTime' },
      { vis: '+', name: 'items', type: 'List<MealPlanItem>', note: 'Cascade ALL' }
    ],
    methods: [
      { vis: '#', name: 'onCreate()', ret: 'void' }
    ]
  },
  {
    id: 'MealPlanItem',
    title: 'MealPlanItem',
    stereotype: '«Entity»',
    table: '@Table(name = "meal_plan_items")',
    domain: 'diet',
    x: 1360, y: 170, w: 380,
    attributes: [
      { vis: '+', name: 'id', type: 'Long', pk: true },
      { vis: '+', name: 'mealPlan', type: 'MealPlan', fk: true, note: 'N:1' },
      { vis: '+', name: 'mealType', type: 'MealType', enum: true },
      { vis: '+', name: 'recipe', type: 'Recipe', fk: true, note: 'N:1 (opt)' },
      { vis: '+', name: 'foodItem', type: 'FoodItem', fk: true, note: 'N:1 (opt)' },
      { vis: '+', name: 'dayOfWeek', type: 'String', note: 'Mon - Sun' },
      { vis: '+', name: 'portionGrams', type: 'Double' },
      { vis: '+', name: 'itemCostInr', type: 'Double' },
      { vis: '+', name: 'itemCalories', type: 'Double' }
    ],
    methods: []
  },
  {
    id: 'Recipe',
    title: 'Recipe',
    stereotype: '«Entity»',
    table: '@Table(name = "recipes")',
    domain: 'diet',
    x: 1360, y: 550, w: 380,
    attributes: [
      { vis: '+', name: 'id', type: 'Long', pk: true },
      { vis: '+', name: 'title', type: 'String', note: 'not null' },
      { vis: '+', name: 'description', type: 'String', note: '1000 chars' },
      { vis: '+', name: 'mealType', type: 'MealType', enum: true },
      { vis: '+', name: 'suitableDosha', type: 'DoshaType', enum: true },
      { vis: '+', name: 'suitableSeason', type: 'RituSeason', enum: true },
      { vis: '+', name: 'prepTimeMins', type: 'Integer' },
      { vis: '+', name: 'costPerServingInr', type: 'Double' },
      { vis: '+', name: 'calories', type: 'Double' },
      { vis: '+', name: 'proteinGrams', type: 'Double' },
      { vis: '+', name: 'carbsGrams', type: 'Double' },
      { vis: '+', name: 'fatGrams', type: 'Double' },
      { vis: '+', name: 'ironMg', type: 'Double' },
      { vis: '+', name: 'instructions', type: 'String', note: 'TEXT' },
      { vis: '+', name: 'suitableDiseaseConditions', type: 'String' },
      { vis: '+', name: 'suitableWomensHealthStage', type: 'String' }
    ],
    methods: []
  },
  {
    id: 'FoodItem',
    title: 'FoodItem',
    stereotype: '«Entity»',
    table: '@Table(name = "food_items")',
    domain: 'diet',
    x: 1810, y: 170, w: 380,
    attributes: [
      { vis: '+', name: 'id', type: 'Long', pk: true },
      { vis: '+', name: 'name', type: 'String', note: 'unique' },
      { vis: '+', name: 'category', type: 'String', note: 'Grain, Pulse, Veg' },
      { vis: '+', name: 'rasa', type: 'String', note: 'Taste (6 Rasa)' },
      { vis: '+', name: 'virya', type: 'String', note: 'Heating/Cooling' },
      { vis: '+', name: 'vipaka', type: 'String', note: 'Post-digestive' },
      { vis: '+', name: 'doshaEffect', type: 'String', note: 'e.g. V- P= K+' },
      { vis: '+', name: 'calories', type: 'Double' },
      { vis: '+', name: 'proteinGrams', type: 'Double' },
      { vis: '+', name: 'carbsGrams', type: 'Double' },
      { vis: '+', name: 'fatGrams', type: 'Double' },
      { vis: '+', name: 'ironMg', type: 'Double' },
      { vis: '+', name: 'calciumMg', type: 'Double' },
      { vis: '+', name: 'fiberGrams', type: 'Double' },
      { vis: '+', name: 'estimatedCostInr', type: 'Double' }
    ],
    methods: []
  },
  {
    id: 'MealType',
    title: 'MealType',
    stereotype: '«Enumeration»',
    table: 'Meal Schedule Windows',
    domain: 'enums',
    x: 900, y: 590, w: 280,
    attributes: [
      { vis: '+', name: 'BREAKFAST', type: 'Morning (Pratah)' },
      { vis: '+', name: 'LUNCH', type: 'Midday Main (Madhyahna)' },
      { vis: '+', name: 'DINNER', type: 'Evening Light (Sayam)' },
      { vis: '+', name: 'SNACK', type: 'Herbal Tea / Nourishment' }
    ],
    methods: []
  },
  {
    id: 'RituSeason',
    title: 'RituSeason',
    stereotype: '«Enumeration»',
    table: 'Six Ayurvedic Ritucharya Seasons',
    domain: 'enums',
    x: 900, y: 760, w: 280,
    attributes: [
      { vis: '+', name: 'SHISHIRA', type: 'Late Winter (Jan - Feb)' },
      { vis: '+', name: 'VASANTA', type: 'Spring (Mar - Apr)' },
      { vis: '+', name: 'GRISHMA', type: 'Summer (May - Jun)' },
      { vis: '+', name: 'VARSHA', type: 'Monsoon (Jul - Aug)' },
      { vis: '+', name: 'SHARAD', type: 'Autumn (Sep - Oct)' },
      { vis: '+', name: 'HEMANT', type: 'Early Winter (Nov - Dec)' }
    ],
    methods: []
  },
  {
    id: 'ViruddhaCombination',
    title: 'ViruddhaCombination',
    stereotype: '«Entity»',
    table: '@Table(name = "viruddha_combinations")',
    domain: 'diet',
    x: 1810, y: 650, w: 380,
    attributes: [
      { vis: '+', name: 'id', type: 'Long', pk: true },
      { vis: '+', name: 'foodA', type: 'FoodItem', fk: true, note: 'N:1' },
      { vis: '+', name: 'foodB', type: 'FoodItem', fk: true, note: 'N:1' },
      { vis: '+', name: 'incompatibilityType', type: 'String', note: 'Rasa/Virya Viruddha' },
      { vis: '+', name: 'healthHazardReason', type: 'String' },
      { vis: '+', name: 'antidoteRecommendation', type: 'String' }
    ],
    methods: []
  },

  // --- FOOD SCIENCE DOMAIN ---
  {
    id: 'RawFoodComposition',
    title: 'RawFoodComposition',
    stereotype: '«Entity»',
    table: '@Table(name = "raw_food_composition")',
    domain: 'foodScience',
    x: 2260, y: 170, w: 410,
    attributes: [
      { vis: '+', name: 'id', type: 'Long', pk: true },
      { vis: '+', name: 'foodCode', type: 'String', note: 'IFCT Code, unique' },
      { vis: '+', name: 'foodName', type: 'String', note: 'not null' },
      { vis: '+', name: 'category', type: 'String', note: 'Cereal, Pulse, Veg' },
      { vis: '+', name: 'datasetSource', type: 'String', note: 'IFCT 2017' },
      { vis: '+', name: 'servingSize', type: 'String', def: '"100g"' },
      { vis: '+', name: 'energyKcal', type: 'Double' },
      { vis: '+', name: 'proteinGrams', type: 'Double' },
      { vis: '+', name: 'carbsGrams', type: 'Double' },
      { vis: '+', name: 'fatGrams', type: 'Double' },
      { vis: '+', name: 'fiberGrams', type: 'Double' },
      { vis: '+', name: 'ironMg', type: 'Double' },
      { vis: '+', name: 'calciumMg', type: 'Double' },
      { vis: '+', name: 'vitaminB12Mcg', type: 'Double' },
      { vis: '+', name: 'vitaminDIu', type: 'Double' },
      { vis: '+', name: 'folateMcg', type: 'Double' },
      { vis: '+', name: 'vitaminCMg', type: 'Double' },
      { vis: '+', name: 'ayurvedicProfile', type: 'AyurvedicFoodProfile', note: '1:1 Eager' }
    ],
    methods: []
  },
  {
    id: 'AyurvedicFoodProfile',
    title: 'AyurvedicFoodProfile',
    stereotype: '«Entity»',
    table: '@Table(name = "ayurvedic_food_profiles")',
    domain: 'foodScience',
    x: 2740, y: 170, w: 410,
    attributes: [
      { vis: '+', name: 'id', type: 'Long', pk: true },
      { vis: '+', name: 'rawFood', type: 'RawFoodComposition', fk: true, note: '1:1 Join' },
      { vis: '+', name: 'sanskritName', type: 'String' },
      { vis: '+', name: 'rasa', type: 'String', note: 'Madhura, Tikta...' },
      { vis: '+', name: 'virya', type: 'String', note: 'Shita / Ushna' },
      { vis: '+', name: 'vipaka', type: 'String', note: 'Madhura, Katu, Amla' },
      { vis: '+', name: 'doshaEffect', type: 'String', note: 'V- P- K+' },
      { vis: '+', name: 'suitableRituSeasons', type: 'String' },
      { vis: '+', name: 'classicalTextReference', type: 'String', note: 'Charaka Samhita' }
    ],
    methods: []
  },

  // --- WOMEN'S HEALTH DOMAIN ---
  {
    id: 'WomensHealthProfile',
    title: 'WomensHealthProfile',
    stereotype: '«Entity»',
    table: '@Table(name = "womens_health_profiles")',
    domain: 'womens',
    x: 900, y: 1470, w: 440,
    attributes: [
      { vis: '+', name: 'id', type: 'Long', pk: true },
      { vis: '+', name: 'user', type: 'User', fk: true, note: '1:1 unique' },
      { vis: '+', name: 'healthStage', type: 'WomensHealthStage', enum: true },
      { vis: '+', name: 'pregnancyTrimester', type: 'Integer', note: '1, 2, 3' },
      { vis: '+', name: 'cyclePhase', type: 'String', note: 'Follicular, Luteal...' },
      { vis: '+', name: 'reportedSymptoms', type: 'String', note: 'cramps, fatigue...' },
      { vis: '+', name: 'lastPeriodDate', type: 'LocalDate' },
      { vis: '+', name: 'cycleLengthDays', type: 'Integer', def: '28' },
      { vis: '+', name: 'periodDurationDays', type: 'Integer', def: '5' },
      { vis: '+', name: 'flowLevel', type: 'String', note: 'Light, Med, Heavy' },
      { vis: '+', name: 'crampsSeverity', type: 'String' },
      { vis: '+', name: 'mood', type: 'String' },
      { vis: '+', name: 'energyLevel', type: 'String' },
      { vis: '+', name: 'menopauseSymptoms', type: 'String' },
      { vis: '+', name: 'hotFlashFrequency', type: 'Integer', note: 'per day' },
      { vis: '+', name: 'sleepQualityRating', type: 'Integer', note: '1 - 10' },
      { vis: '+', name: 'dailyIronTargetMg', type: 'Double', def: '18.0' },
      { vis: '+', name: 'dailyIronIntakeMg', type: 'Double' }
    ],
    methods: []
  },
  {
    id: 'WomensHealthLog',
    title: 'WomensHealthLog',
    stereotype: '«Entity»',
    table: '@Table(name = "womens_health_logs")',
    domain: 'womens',
    x: 1390, y: 1470, w: 410,
    attributes: [
      { vis: '+', name: 'id', type: 'Long', pk: true },
      { vis: '+', name: 'user', type: 'User', fk: true, note: 'N:1' },
      { vis: '+', name: 'logDate', type: 'LocalDate', note: 'not null' },
      { vis: '+', name: 'logType', type: 'String', note: 'MENSTRUAL, WELLNESS' },
      { vis: '+', name: 'flowLevel', type: 'String' },
      { vis: '+', name: 'crampsSeverity', type: 'String' },
      { vis: '+', name: 'mood', type: 'String' },
      { vis: '+', name: 'energy', type: 'String' },
      { vis: '+', name: 'symptoms', type: 'String' },
      { vis: '+', name: 'ironIntakeMg', type: 'Double' },
      { vis: '+', name: 'waterIntakeL', type: 'Double' },
      { vis: '+', name: 'sleepHours', type: 'Integer' },
      { vis: '+', name: 'wellnessScore', type: 'Integer', note: '0 - 100' },
      { vis: '+', name: 'notes', type: 'String', note: '1000 chars' }
    ],
    methods: []
  },
  {
    id: 'WomensHealthStage',
    title: 'WomensHealthStage',
    stereotype: '«Enumeration»',
    table: 'Life Stages & Conditions',
    domain: 'enums',
    x: 1840, y: 1470, w: 330,
    attributes: [
      { vis: '+', name: 'GENERAL_WELLNESS', type: 'Balanced Lifestyle' },
      { vis: '+', name: 'MENSTRUAL_REGULATION', type: 'PCOS / Dysmenorrhea' },
      { vis: '+', name: 'PRECONCEPTION', type: 'Garbhadhana preparation' },
      { vis: '+', name: 'PREGNANCY', type: 'Garbhini Paricharya' },
      { vis: '+', name: 'POSTPARTUM', type: 'Sutika Paricharya' },
      { vis: '+', name: 'MENOPAUSE', type: 'Rajonivritti transition' }
    ],
    methods: []
  }
];

// Relationships Definition
const relationships = [
  // User 1 <---> 1 UserProfile (Direct horizontal link)
  {
    from: 'User', to: 'UserProfile',
    fromCard: '1', toCard: '1',
    type: 'association',
    label: 'has profile',
    color: '#38BDF8',
    points: [
      { x: 440, y: 440 },
      { x: 410, y: 440 }
    ]
  },
  // User 1 ---> 0..* DoshaAssessment (Direct vertical line)
  {
    from: 'User', to: 'DoshaAssessment',
    fromCard: '1', toCard: '0..*',
    type: 'association',
    label: 'undertakes assessment',
    color: '#34D399',
    points: [
      { x: 630, y: 490 },
      { x: 630, y: 880 }
    ]
  },
  // User 1 ---> 0..* MealPlan (Horizontal)
  {
    from: 'User', to: 'MealPlan',
    fromCard: '1', toCard: '0..*',
    type: 'association',
    label: 'owns diet plans',
    color: '#FBBF24',
    points: [
      { x: 820, y: 310 },
      { x: 900, y: 310 }
    ]
  },
  // MealPlan 1 *---> 1..* MealPlanItem (Composition)
  {
    from: 'MealPlan', to: 'MealPlanItem',
    fromCard: '1', toCard: '1..*',
    type: 'composition',
    label: 'contains items',
    color: '#F59E0B',
    points: [
      { x: 1290, y: 310 },
      { x: 1360, y: 310 }
    ]
  },
  // MealPlanItem 0..* ---> 0..1 Recipe (Vertical)
  {
    from: 'MealPlanItem', to: 'Recipe',
    fromCard: '0..*', toCard: '0..1',
    type: 'association',
    label: 'references',
    color: '#FBBF24',
    points: [
      { x: 1550, y: 490 },
      { x: 1550, y: 550 }
    ]
  },
  // MealPlanItem 0..* ---> 0..1 FoodItem (Horizontal)
  {
    from: 'MealPlanItem', to: 'FoodItem',
    fromCard: '0..*', toCard: '0..1',
    type: 'association',
    label: 'references',
    color: '#FBBF24',
    points: [
      { x: 1740, y: 310 },
      { x: 1810, y: 310 }
    ]
  },
  // FoodItem 1 <--- 0..* ViruddhaCombination (foodA & foodB)
  {
    from: 'ViruddhaCombination', to: 'FoodItem',
    fromCard: '0..*', toCard: '1',
    type: 'association',
    label: 'foodA / foodB',
    color: '#F87171',
    points: [
      { x: 2000, y: 650 },
      { x: 2000, y: 590 }
    ]
  },
  // RawFoodComposition 1 <---> 1 AyurvedicFoodProfile
  {
    from: 'RawFoodComposition', to: 'AyurvedicFoodProfile',
    fromCard: '1', toCard: '1',
    type: 'association',
    label: 'ayurvedicProfile (1:1)',
    color: '#2DD4BF',
    points: [
      { x: 2670, y: 310 },
      { x: 2740, y: 310 }
    ]
  },
  // User 1 ---> 0..* DailyHealthLog (Down left dedicated channel y: 1410)
  {
    from: 'User', to: 'DailyHealthLog',
    fromCard: '1', toCard: '0..*',
    type: 'association',
    label: 'records health logs',
    color: '#818CF8',
    points: [
      { x: 440, y: 460 },
      { x: 425, y: 460 },
      { x: 425, y: 860 },
      { x: 425, y: 1410 },
      { x: 250, y: 1410 },
      { x: 250, y: 1470 }
    ]
  },
  // User 1 ---> 0..* Reminder (Down right dedicated channel y: 1440)
  {
    from: 'User', to: 'Reminder',
    fromCard: '1', toCard: '0..*',
    type: 'association',
    label: 'configures reminders',
    color: '#818CF8',
    points: [
      { x: 740, y: 490 },
      { x: 740, y: 860 },
      { x: 740, y: 1440 },
      { x: 640, y: 1440 },
      { x: 640, y: 1470 }
    ]
  },
  // User 1 <---> 1 WomensHealthProfile (Direct through central canal into left side)
  {
    from: 'User', to: 'WomensHealthProfile',
    fromCard: '1', toCard: '0..1',
    type: 'association',
    label: 'has stree profile',
    color: '#F472B6',
    points: [
      { x: 820, y: 440 },
      { x: 855, y: 440 },
      { x: 855, y: 1540 },
      { x: 900, y: 1540 }
    ]
  },
  // User 1 ---> 0..* WomensHealthLog (Through clear inter-package canal at y: 1345)
  {
    from: 'User', to: 'WomensHealthLog',
    fromCard: '1', toCard: '0..*',
    type: 'association',
    label: 'tracks cycle logs',
    color: '#F472B6',
    points: [
      { x: 820, y: 460 },
      { x: 875, y: 460 },
      { x: 875, y: 1345 },
      { x: 1550, y: 1345 },
      { x: 1550, y: 1470 }
    ]
  }
];

// Package Boxes Definitions
const packages = [
  {
    title: 'AUTH & IDENTITY DOMAIN',
    subtitle: 'User Entity, JWT Security, RBAC & OTP Verifications',
    x: 50, y: 105, w: 790, h: 745,
    color: colors.auth
  },
  {
    title: 'AYURVEDIC ASSESSMENT & PRAKRITI ENGINE',
    subtitle: 'Tridosha Algorithm, Vikriti Scoring & Agni Diagnostics',
    x: 50, y: 865, w: 790, h: 500,
    color: colors.dosha
  },
  {
    title: 'DINACHARYA & LIFESTYLE TRACKING',
    subtitle: 'Daily Energy, Digestion Logs & Ritucharya Reminders',
    x: 50, y: 1380, w: 790, h: 980,
    color: colors.tracking
  },
  {
    title: 'DIET PLANNING & AYURVEDIC CULINARY ENGINE',
    subtitle: 'Target Disease, Season, Budget Optimization & Viruddha Ahara Filter',
    x: 870, y: 105, w: 1340, h: 1260,
    color: colors.diet
  },
  {
    title: 'FOOD COMPOSITION & DRAVYAGUNA DATABASE',
    subtitle: 'ICMR-NIN IFCT 2017 Dataset & Classical Ayurvedic Herb/Food Properties',
    x: 2230, y: 105, w: 1320, h: 720,
    color: colors.foodScience
  },
  {
    title: 'WOMEN’S HEALTH & STREE SWASTHYA MODULE',
    subtitle: 'Menstrual Cycle, Garbhini Pregnancy, Menopause & Nutritional Anemia Engine',
    x: 870, y: 1380, w: 1340, h: 980,
    color: colors.womens
  },
  {
    title: 'SYSTEM ARCHITECTURE & UML SPECIFICATIONS',
    subtitle: 'Layered Spring Boot 3 + AI/ML Microservice Integration Matrix',
    x: 2230, y: 845, w: 1320, h: 1515,
    color: colors.arch
  }
];

function escapeXml(str) {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateSVG() {
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" style="background-color: ${colors.canvasBg}; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;">
  <defs>
    <!-- Background Grid Pattern -->
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${colors.gridLine}" stroke-width="1"/>
    </pattern>

    <!-- Card Shadow -->
    <filter id="card-shadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.6"/>
    </filter>

    <!-- Gradients for Headers -->
    <linearGradient id="grad-auth" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284C7" />
      <stop offset="100%" stop-color="#0369A1" />
    </linearGradient>

    <linearGradient id="grad-dosha" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>

    <linearGradient id="grad-diet" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>

    <linearGradient id="grad-food" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0D9488" />
      <stop offset="100%" stop-color="#0F766E" />
    </linearGradient>

    <linearGradient id="grad-womens" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#DB2777" />
      <stop offset="100%" stop-color="#BE185D" />
    </linearGradient>

    <linearGradient id="grad-tracking" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4F46E5" />
      <stop offset="100%" stop-color="#4338CA" />
    </linearGradient>

    <linearGradient id="grad-enums" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7C3AED" />
      <stop offset="100%" stop-color="#6D28D9" />
    </linearGradient>

    <linearGradient id="grad-header-bar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="35%" stop-color="#0284C7" />
      <stop offset="70%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#DB2777" />
    </linearGradient>

    <!-- Markers -->
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 9 5 L 0 9 z" fill="#94A3B8" />
    </marker>
    
    <marker id="composition-diamond" viewBox="0 0 16 16" refX="8" refY="8" markerWidth="10" markerHeight="10" orient="auto">
      <path d="M 8 0 L 16 8 L 8 16 L 0 8 z" fill="#F59E0B" stroke="#B45309" stroke-width="1.5" />
    </marker>
  </defs>

  <!-- Grid Layer -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grid)" />

  <!-- ================= TOP MAIN HEADER ================= -->
  <g transform="translate(50, 20)">
    <rect x="0" y="0" width="${WIDTH - 100}" height="64" rx="12" fill="#131D31" stroke="#2A3853" stroke-width="1.8"/>
    <rect x="0" y="60" width="${WIDTH - 100}" height="4" fill="url(#grad-header-bar)" rx="2"/>
    
    <text x="28" y="40" fill="#F8FAFC" font-size="26" font-weight="900" letter-spacing="1.2">🌿 AYURWELL HEALTHCARE PLATFORM</text>
    <text x="560" y="40" fill="#64748B" font-size="18" font-weight="400">|</text>
    <text x="580" y="40" fill="#38BDF8" font-size="18" font-weight="700">COMPREHENSIVE UML DOMAIN &amp; ENTITY CLASS DIAGRAM</text>
    
    <!-- Badges on right side -->
    <rect x="${WIDTH - 720}" y="17" width="140" height="30" rx="6" fill="#064E3B" stroke="#059669" stroke-width="1.2"/>
    <text x="${WIDTH - 650}" y="37" fill="#34D399" font-size="13" font-weight="800" text-anchor="middle">SPRING BOOT 3.x</text>
    
    <rect x="${WIDTH - 565}" y="17" width="135" height="30" rx="6" fill="#1E3A8A" stroke="#2563EB" stroke-width="1.2"/>
    <text x="${WIDTH - 497}" y="37" fill="#60A5FA" font-size="13" font-weight="800" text-anchor="middle">JPA / HIBERNATE</text>

    <rect x="${WIDTH - 415}" y="17" width="165" height="30" rx="6" fill="#701A75" stroke="#C026D3" stroke-width="1.2"/>
    <text x="${WIDTH - 332}" y="37" fill="#F472B6" font-size="13" font-weight="800" text-anchor="middle">ICMR-NIN IFCT 2017</text>

    <rect x="${WIDTH - 235}" y="17" width="115" height="30" rx="6" fill="#312E81" stroke="#4F46E5" stroke-width="1.2"/>
    <text x="${WIDTH - 177}" y="37" fill="#A5B4FC" font-size="13" font-weight="800" text-anchor="middle">AI / ML CORE</text>
  </g>
`;

  // Render Packages
  packages.forEach(pkg => {
    svg += `
  <!-- Package: ${escapeXml(pkg.title)} -->
  <g>
    <rect x="${pkg.x}" y="${pkg.y}" width="${pkg.w}" height="${pkg.h}" rx="16" fill="${pkg.color.packageBg}" stroke="${pkg.color.packageBorder}" stroke-width="2" stroke-dasharray="8,5" />
    <rect x="${pkg.x + 20}" y="${pkg.y - 15}" width="${pkg.title.length * 10 + 36}" height="30" rx="7" fill="#1E293B" stroke="${pkg.color.packageBorder}" stroke-width="1.6" />
    <text x="${pkg.x + 36}" y="${pkg.y + 6}" fill="#F1F5F9" font-size="13" font-weight="800" letter-spacing="1">${escapeXml(pkg.title)}</text>
    <text x="${pkg.x + 28}" y="${pkg.y + 40}" fill="#64748B" font-size="12.5" font-weight="500">${escapeXml(pkg.subtitle)}</text>
  </g>
`;
  });

  // Render Relationships Lines (Background of cards)
  relationships.forEach(rel => {
    let pathD = `M ${rel.points[0].x} ${rel.points[0].y}`;
    for (let i = 1; i < rel.points.length; i++) {
      pathD += ` L ${rel.points[i].x} ${rel.points[i].y}`;
    }

    const startPt = rel.points[0];
    const endPt = rel.points[rel.points.length - 1];
    const midIdx = Math.floor(rel.points.length / 2);
    const midPt = rel.points[midIdx];

    const markerStart = rel.type === 'composition' ? 'url(#composition-diamond)' : '';
    const markerEnd = rel.type === 'composition' ? '' : 'url(#arrow)';

    svg += `
  <!-- Rel: ${escapeXml(rel.from)} -> ${escapeXml(rel.to)} -->
  <g>
    <path d="${pathD}" fill="none" stroke="${rel.color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" marker-start="${markerStart}" marker-end="${markerEnd}" opacity="0.85"/>
    
    <!-- Cardinality Labels -->
    <rect x="${startPt.x + 8}" y="${startPt.y - 20}" width="32" height="20" rx="4" fill="#0B1120" stroke="#334155" stroke-width="1.2" opacity="0.95"/>
    <text x="${startPt.x + 24}" y="${startPt.y - 6}" fill="#F8FAFC" font-size="11.5" font-weight="800" text-anchor="middle">${escapeXml(rel.fromCard)}</text>

    <rect x="${endPt.x - 38}" y="${endPt.y - 20}" width="32" height="20" rx="4" fill="#0B1120" stroke="#334155" stroke-width="1.2" opacity="0.95"/>
    <text x="${endPt.x - 22}" y="${endPt.y - 6}" fill="#F8FAFC" font-size="11.5" font-weight="800" text-anchor="middle">${escapeXml(rel.toCard)}</text>

    <!-- Role Label -->
    <rect x="${midPt.x - (rel.label.length * 4.2 + 10)}" y="${midPt.y - 22}" width="${rel.label.length * 8.4 + 20}" height="22" rx="5" fill="#0F172A" stroke="${rel.color}" stroke-width="1.2" opacity="0.95"/>
    <text x="${midPt.x}" y="${midPt.y - 7}" fill="#E2E8F0" font-size="11" font-weight="700" text-anchor="middle">${escapeXml(rel.label)}</text>
  </g>
`;
  });

  // Render Classes
  classes.forEach(cls => {
    const col = colors[cls.domain] || colors.auth;
    const headerHeight = 58;
    const itemHeight = 23;
    const attrHeight = cls.attributes.length * itemHeight + 10;
    const methHeight = cls.methods.length > 0 ? (cls.methods.length * itemHeight + 16) : 0;
    const actualHeight = headerHeight + attrHeight + methHeight + 14;

    svg += `
  <!-- Class: ${escapeXml(cls.id)} -->
  <g id="class-${escapeXml(cls.id)}" transform="translate(${cls.x}, ${cls.y})" filter="url(#card-shadow)">
    <!-- Base Card Container -->
    <rect x="0" y="0" width="${cls.w}" height="${actualHeight}" rx="12" fill="${col.bg}" stroke="${col.border}" stroke-width="2" />

    <!-- Card Header -->
    <path d="M 0 12 Q 0 0 12 0 L ${cls.w - 12} 0 Q ${cls.w} 0 ${cls.w} 12 L ${cls.w} ${headerHeight} L 0 ${headerHeight} Z" fill="${col.headerBg}" />
    
    <!-- Stereotype & Title -->
    <text x="${cls.w / 2}" y="19" fill="rgba(255,255,255,0.8)" font-size="11.5" font-weight="600" text-anchor="middle">${escapeXml(cls.stereotype)}</text>
    <text x="${cls.w / 2}" y="39" fill="#FFFFFF" font-size="19" font-weight="800" text-anchor="middle" letter-spacing="0.5">${escapeXml(cls.title)}</text>
    <text x="${cls.w / 2}" y="52" fill="rgba(255,255,255,0.85)" font-size="10" font-family="'JetBrains Mono', 'Fira Code', monospace" text-anchor="middle">${escapeXml(cls.table)}</text>

    <!-- Header Divider Line -->
    <line x1="0" y1="${headerHeight}" x2="${cls.w}" y2="${headerHeight}" stroke="${col.border}" stroke-width="1.8" />

    <!-- Attributes Compartment -->
    <g transform="translate(16, ${headerHeight + 18})">
`;

    cls.attributes.forEach((attr, idx) => {
      const y = idx * itemHeight;
      let badge = '';
      if (attr.pk) {
        badge = `<rect x="${cls.w - 76}" y="${y - 13}" width="44" height="17" rx="4" fill="#DC2626" opacity="0.9"/><text x="${cls.w - 54}" y="${y}" fill="#FFFFFF" font-size="10" font-weight="900" text-anchor="middle">PK</text>`;
      } else if (attr.fk) {
        badge = `<rect x="${cls.w - 76}" y="${y - 13}" width="44" height="17" rx="4" fill="#2563EB" opacity="0.9"/><text x="${cls.w - 54}" y="${y}" fill="#FFFFFF" font-size="10" font-weight="900" text-anchor="middle">FK</text>`;
      } else if (attr.enum) {
        badge = `<rect x="${cls.w - 86}" y="${y - 13}" width="54" height="17" rx="4" fill="#7C3AED" opacity="0.9"/><text x="${cls.w - 59}" y="${y}" fill="#FFFFFF" font-size="10" font-weight="800" text-anchor="middle">ENUM</text>`;
      }

      const noteText = attr.note ? `<tspan fill="#64748B" font-size="10.5"> /* ${escapeXml(attr.note)} */</tspan>` : (attr.def ? `<tspan fill="#10B981" font-size="10.5"> = ${escapeXml(attr.def)}</tspan>` : '');

      svg += `      <text x="0" y="${y}" fill="#94A3B8" font-size="13" font-family="'JetBrains Mono', 'Fira Code', monospace">
        <tspan fill="#38BDF8" font-weight="bold">${escapeXml(attr.vis)}</tspan> <tspan fill="#F8FAFC" font-weight="600">${escapeXml(attr.name)}</tspan> : <tspan fill="${col.tag}">${escapeXml(attr.type)}</tspan>${noteText}
      </text>
      ${badge}
`;
    });

    svg += `    </g>
`;

    // Methods Compartment
    if (cls.methods.length > 0) {
      const methStartY = headerHeight + attrHeight + 12;
      svg += `
    <!-- Methods Divider -->
    <line x1="0" y1="${methStartY}" x2="${cls.w}" y2="${methStartY}" stroke="#334155" stroke-width="1.5" stroke-dasharray="5,3"/>
    <g transform="translate(16, ${methStartY + 22})">
`;
      cls.methods.forEach((m, idx) => {
        const y = idx * itemHeight;
        svg += `      <text x="0" y="${y}" fill="#CBD5E1" font-size="13" font-family="'JetBrains Mono', 'Fira Code', monospace">
        <tspan fill="#F59E0B" font-weight="bold">${escapeXml(m.vis)}</tspan> <tspan fill="#F8FAFC" font-weight="600">${escapeXml(m.name)}</tspan> : <tspan fill="#94A3B8">${escapeXml(m.ret)}</tspan>
      </text>
`;
      });
      svg += `    </g>
`;
    }

    svg += `  </g>
`;
  });

  // ================= SYSTEM ARCHITECTURE & INTEGRATION MATRIX PANEL =================
  svg += `
  <!-- SYSTEM ARCHITECTURE PANEL (Right Side) -->
  <g transform="translate(2260, 900)">
    <!-- Section 1: Spring Boot Multi-Tier Architecture Diagram -->
    <rect x="0" y="0" width="1260" height="360" rx="12" fill="#131D31" stroke="#334155" stroke-width="1.8" />
    <text x="28" y="36" fill="#38BDF8" font-size="17" font-weight="800" letter-spacing="1">SPRING BOOT 3 REST APPLICATION ARCHITECTURE</text>
    <text x="28" y="58" fill="#94A3B8" font-size="13">Flow of Control: Client HTTP Request → Controller → Business Service → Spring Data JPA Repository → PostgreSQL / H2 DB</text>

    <!-- Layers Visualization -->
    <!-- Tier 1: Controllers -->
    <rect x="30" y="80" width="260" height="250" rx="10" fill="#0B1120" stroke="#0284C7" stroke-width="1.6"/>
    <rect x="30" y="80" width="260" height="38" rx="10" fill="#0284C7"/>
    <text x="160" y="105" fill="#FFFFFF" font-size="14" font-weight="800" text-anchor="middle">REST CONTROLLERS (13)</text>
    <text x="46" y="142" fill="#E2E8F0" font-size="12" font-family="monospace">• AuthController</text>
    <text x="46" y="164" fill="#E2E8F0" font-size="12" font-family="monospace">• UserController</text>
    <text x="46" y="186" fill="#E2E8F0" font-size="12" font-family="monospace">• DietPlannerController</text>
    <text x="46" y="208" fill="#E2E8F0" font-size="12" font-family="monospace">• DoshaAssessmentCtrl</text>
    <text x="46" y="230" fill="#E2E8F0" font-size="12" font-family="monospace">• WomensHealthController</text>
    <text x="46" y="252" fill="#E2E8F0" font-size="12" font-family="monospace">• RecipeController</text>
    <text x="46" y="274" fill="#E2E8F0" font-size="12" font-family="monospace">• AnalyticsController</text>
    <text x="46" y="296" fill="#E2E8F0" font-size="12" font-family="monospace">• MlPredictionController</text>
    <text x="46" y="318" fill="#E2E8F0" font-size="12" font-family="monospace">• LlmChatController</text>

    <!-- Arrow 1 -> 2 -->
    <path d="M 305 205 L 340 205" fill="none" stroke="#38BDF8" stroke-width="3" marker-end="url(#arrow)"/>

    <!-- Tier 2: Services -->
    <rect x="350" y="80" width="270" height="250" rx="10" fill="#0B1120" stroke="#059669" stroke-width="1.6"/>
    <rect x="350" y="80" width="270" height="38" rx="10" fill="#059669"/>
    <text x="485" y="105" fill="#FFFFFF" font-size="14" font-weight="800" text-anchor="middle">SERVICE LAYER (14)</text>
    <text x="366" y="142" fill="#E2E8F0" font-size="12" font-family="monospace">• AuthService (JWT, OTP)</text>
    <text x="366" y="164" fill="#E2E8F0" font-size="12" font-family="monospace">• DietPlannerService</text>
    <text x="366" y="186" fill="#E2E8F0" font-size="12" font-family="monospace">• DoshaAssessmentService</text>
    <text x="366" y="208" fill="#E2E8F0" font-size="12" font-family="monospace">• WomensHealthService</text>
    <text x="366" y="230" fill="#E2E8F0" font-size="12" font-family="monospace">• ViruddhaCheckerService</text>
    <text x="366" y="252" fill="#E2E8F0" font-size="12" font-family="monospace">• MlDeficiencyPredictor</text>
    <text x="366" y="274" fill="#E2E8F0" font-size="12" font-family="monospace">• LlmAiAssistantService</text>
    <text x="366" y="296" fill="#E2E8F0" font-size="12" font-family="monospace">• NutritionDatasetService</text>
    <text x="366" y="318" fill="#E2E8F0" font-size="12" font-family="monospace">• Reminder / Analytics</text>

    <!-- Arrow 2 -> 3 -->
    <path d="M 635 205 L 670 205" fill="none" stroke="#34D399" stroke-width="3" marker-end="url(#arrow)"/>

    <!-- Tier 3: Repositories -->
    <rect x="680" y="80" width="270" height="250" rx="10" fill="#0B1120" stroke="#7C3AED" stroke-width="1.6"/>
    <rect x="680" y="80" width="270" height="38" rx="10" fill="#7C3AED"/>
    <text x="815" y="105" fill="#FFFFFF" font-size="14" font-weight="800" text-anchor="middle">JPA REPOSITORIES (14)</text>
    <text x="696" y="142" fill="#E2E8F0" font-size="12" font-family="monospace">• UserRepository</text>
    <text x="696" y="164" fill="#E2E8F0" font-size="12" font-family="monospace">• UserProfileRepository</text>
    <text x="696" y="186" fill="#E2E8F0" font-size="12" font-family="monospace">• MealPlanRepository</text>
    <text x="696" y="208" fill="#E2E8F0" font-size="12" font-family="monospace">• FoodItemRepository</text>
    <text x="696" y="230" fill="#E2E8F0" font-size="12" font-family="monospace">• RawFoodCompositionRepo</text>
    <text x="696" y="252" fill="#E2E8F0" font-size="12" font-family="monospace">• AyurvedicFoodProfileRepo</text>
    <text x="696" y="274" fill="#E2E8F0" font-size="12" font-family="monospace">• WomensHealthProfileRepo</text>
    <text x="696" y="296" fill="#E2E8F0" font-size="12" font-family="monospace">• ViruddhaCombinationRepo</text>
    <text x="696" y="318" fill="#E2E8F0" font-size="12" font-family="monospace">• DailyHealthLogRepository</text>

    <!-- Arrow 3 -> 4 -->
    <path d="M 965 205 L 1000 205" fill="none" stroke="#A78BFA" stroke-width="3" marker-end="url(#arrow)"/>

    <!-- Tier 4: Entities & DB -->
    <rect x="1010" y="80" width="220" height="250" rx="10" fill="#0B1120" stroke="#F59E0B" stroke-width="1.6"/>
    <rect x="1010" y="80" width="220" height="38" rx="10" fill="#D97706"/>
    <text x="1120" y="105" fill="#FFFFFF" font-size="14" font-weight="800" text-anchor="middle">DATABASE ENTITIES</text>
    <text x="1025" y="146" fill="#FDE68A" font-size="13" font-weight="800">15 Relational Entities</text>
    <text x="1025" y="172" fill="#E2E8F0" font-size="12">• 5 Enums (Agni, Dosha)</text>
    <text x="1025" y="198" fill="#E2E8F0" font-size="12">• Hibernate ORM Mapping</text>
    <text x="1025" y="224" fill="#E2E8F0" font-size="12">• PostgreSQL / H2 DDL</text>
    <text x="1025" y="250" fill="#E2E8F0" font-size="12">• Foreign Keys &amp; Indexes</text>
    <text x="1025" y="286" fill="#34D399" font-size="13" font-weight="700">✓ ACID Compliant</text>

    <!-- Section 2: UML Notation & Diagram Key Legend -->
    <rect x="0" y="380" width="1260" height="470" rx="12" fill="#131D31" stroke="#334155" stroke-width="1.8" />
    <text x="28" y="416" fill="#FBBF24" font-size="17" font-weight="800" letter-spacing="1">UML NOTATION, MULTIPLICITY &amp; RELATIONSHIP LEGEND</text>

    <!-- Legend Items Grid -->
    <!-- Col 1: Connectors -->
    <g transform="translate(30, 445)">
      <rect x="0" y="0" width="580" height="385" rx="10" fill="#0B1120" stroke="#334155" stroke-width="1.4"/>
      <text x="22" y="32" fill="#E2E8F0" font-size="15" font-weight="700">Relationship Types in this Diagram:</text>

      <!-- Composition -->
      <path d="M 22 72 L 130 72" stroke="#F59E0B" stroke-width="2.8" marker-start="url(#composition-diamond)"/>
      <text x="150" y="77" fill="#F1F5F9" font-size="13" font-weight="700">Composition (◆───)</text>
      <text x="150" y="96" fill="#94A3B8" font-size="12">Strong lifecycle ownership. (MealPlan owns MealPlanItem cascade ALL).</text>

      <!-- 1:1 Association -->
      <path d="M 22 135 L 130 135" stroke="#38BDF8" stroke-width="2.8" marker-end="url(#arrow)"/>
      <text x="150" y="140" fill="#F1F5F9" font-size="13" font-weight="700">One-to-One Association (1 ──── 1)</text>
      <text x="150" y="159" fill="#94A3B8" font-size="12">User ↔ UserProfile, RawFoodComposition ↔ AyurvedicFoodProfile.</text>

      <!-- 1:N Association -->
      <path d="M 22 198 L 130 198" stroke="#34D399" stroke-width="2.8" marker-end="url(#arrow)"/>
      <text x="150" y="203" fill="#F1F5F9" font-size="13" font-weight="700">One-to-Many Association (1 ──── 0..*)</text>
      <text x="150" y="222" fill="#94A3B8" font-size="12">User ↔ DoshaAssessment, MealPlans, DailyHealthLogs, Reminders.</text>

      <!-- N:1 Reference -->
      <path d="M 22 260 L 130 260" stroke="#FBBF24" stroke-width="2.8" marker-end="url(#arrow)"/>
      <text x="150" y="265" fill="#F1F5F9" font-size="13" font-weight="700">Many-to-One Foreign Reference (0..* ──── 1)</text>
      <text x="150" y="284" fill="#94A3B8" font-size="12">MealPlanItem references Recipe, FoodItem; Viruddha references 2 Foods.</text>

      <!-- Multiplicity -->
      <text x="22" y="332" fill="#F8FAFC" font-size="13" font-weight="700">Multiplicity Cardinality Rules:</text>
      <text x="22" y="358" fill="#94A3B8" font-size="12"><tspan fill="#38BDF8" font-weight="bold">1</tspan> Exactly One  |  <tspan fill="#38BDF8" font-weight="bold">0..1</tspan> Optional  |  <tspan fill="#38BDF8" font-weight="bold">1..*</tspan> One or Many  |  <tspan fill="#38BDF8" font-weight="bold">0..*</tspan> Zero or Many</text>
    </g>

    <!-- Col 2: Visibility & Badges -->
    <g transform="translate(630, 445)">
      <rect x="0" y="0" width="600" height="385" rx="10" fill="#0B1120" stroke="#334155" stroke-width="1.4"/>
      <text x="22" y="32" fill="#E2E8F0" font-size="15" font-weight="700">UML Visibility &amp; Field Annotations:</text>

      <text x="22" y="70" fill="#38BDF8" font-size="15" font-weight="bold">+</text>
      <text x="44" y="70" fill="#F1F5F9" font-size="13" font-weight="600">Public Visibility (Getters, Setters, Entity Fields)</text>

      <text x="22" y="104" fill="#F59E0B" font-size="15" font-weight="bold">#</text>
      <text x="44" y="104" fill="#F1F5F9" font-size="13" font-weight="600">Protected Callback (e.g. @PrePersist onCreate)</text>

      <!-- Badges -->
      <rect x="22" y="132" width="44" height="20" rx="4" fill="#DC2626"/>
      <text x="44" y="146" fill="#FFFFFF" font-size="11" font-weight="900" text-anchor="middle">PK</text>
      <text x="80" y="147" fill="#E2E8F0" font-size="13">Primary Key (@Id with @GeneratedValue IDENTITY)</text>

      <rect x="22" y="172" width="44" height="20" rx="4" fill="#2563EB"/>
      <text x="44" y="186" fill="#FFFFFF" font-size="11" font-weight="900" text-anchor="middle">FK</text>
      <text x="80" y="187" fill="#E2E8F0" font-size="13">Foreign Key (@JoinColumn mapping with Lazy Fetch)</text>

      <rect x="22" y="212" width="54" height="20" rx="4" fill="#7C3AED"/>
      <text x="49" y="226" fill="#FFFFFF" font-size="11" font-weight="800" text-anchor="middle">ENUM</text>
      <text x="90" y="227" fill="#E2E8F0" font-size="13">@Enumerated(EnumType.STRING) persisted as varchar</text>

      <!-- Domain Color Key -->
      <text x="22" y="278" fill="#F8FAFC" font-size="13" font-weight="700">Domain Module Color Palette:</text>
      <g transform="translate(22, 298)">
        <circle cx="7" cy="10" r="7" fill="#38BDF8"/>
        <text x="22" y="15" fill="#E2E8F0" font-size="12">Auth &amp; User</text>

        <circle cx="130" cy="10" r="7" fill="#34D399"/>
        <text x="145" y="15" fill="#E2E8F0" font-size="12">Dosha &amp; Prakriti</text>

        <circle cx="270" cy="10" r="7" fill="#FBBF24"/>
        <text x="285" y="15" fill="#E2E8F0" font-size="12">Diet &amp; Nutrition</text>

        <circle cx="410" cy="10" r="7" fill="#2DD4BF"/>
        <text x="425" y="15" fill="#E2E8F0" font-size="12">Food Science</text>
      </g>
      <g transform="translate(22, 332)">
        <circle cx="7" cy="10" r="7" fill="#F472B6"/>
        <text x="22" y="15" fill="#E2E8F0" font-size="12">Women's Health</text>

        <circle cx="130" cy="10" r="7" fill="#818CF8"/>
        <text x="145" y="15" fill="#E2E8F0" font-size="12">Daily Tracking</text>

        <circle cx="270" cy="10" r="7" fill="#A78BFA"/>
        <text x="285" y="15" fill="#E2E8F0" font-size="12">Enums / Constants</text>
      </g>
    </g>

    <!-- Section 3: AI/ML & Microservice Specification Matrix -->
    <rect x="0" y="870" width="1260" height="260" rx="12" fill="#131D31" stroke="#334155" stroke-width="1.8" />
    <text x="28" y="906" fill="#2DD4BF" font-size="17" font-weight="800" letter-spacing="1">INTEGRATED SERVICES &amp; ML SUBSYSTEMS</text>
    
    <g transform="translate(30, 930)">
      <rect x="0" y="0" width="380" height="175" rx="10" fill="#0B1120" stroke="#0D9488" stroke-width="1.4"/>
      <text x="18" y="32" fill="#2DD4BF" font-size="14" font-weight="700">ICMR-NIN IFCT Dataset</text>
      <text x="18" y="58" fill="#94A3B8" font-size="12">528+ Raw Indian Foods mapped with:</text>
      <text x="18" y="82" fill="#E2E8F0" font-size="12">• Energy, Protein, Carbs, Fats, Fiber</text>
      <text x="18" y="104" fill="#E2E8F0" font-size="12">• Micronutrients (Fe, Ca, B12, D, Folate)</text>
      <text x="18" y="126" fill="#E2E8F0" font-size="12">• Ayurvedic Rasa, Virya, Vipaka, Guna</text>
      <text x="18" y="154" fill="#34D399" font-size="12" font-weight="700">✓ NutritionDatasetService</text>
    </g>

    <g transform="translate(440, 930)">
      <rect x="0" y="0" width="380" height="175" rx="10" fill="#0B1120" stroke="#F59E0B" stroke-width="1.4"/>
      <text x="18" y="32" fill="#FBBF24" font-size="14" font-weight="700">Viruddha Ahara Engine</text>
      <text x="18" y="58" fill="#94A3B8" font-size="12">Ayurvedic Incompatible Food Rules:</text>
      <text x="18" y="82" fill="#E2E8F0" font-size="12">• Milk + Fish / Sour Fruits (Virya-Viruddha)</text>
      <text x="18" y="104" fill="#E2E8F0" font-size="12">• Honey + Ghee equal ratio (Matra-Viruddha)</text>
      <text x="18" y="126" fill="#E2E8F0" font-size="12">• Heated Honey / Radish (Sanskar-Viruddha)</text>
      <text x="18" y="154" fill="#34D399" font-size="12" font-weight="700">✓ ViruddhaCheckerService</text>
    </g>

    <g transform="translate(850, 930)">
      <rect x="0" y="0" width="380" height="175" rx="10" fill="#0B1120" stroke="#4F46E5" stroke-width="1.4"/>
      <text x="18" y="32" fill="#818CF8" font-size="14" font-weight="700">ML &amp; LLM AI Services</text>
      <text x="18" y="58" fill="#94A3B8" font-size="12">Predictive &amp; Generative Intelligence:</text>
      <text x="18" y="82" fill="#E2E8F0" font-size="12">• FastApi ML microservice (Port 8000)</text>
      <text x="18" y="104" fill="#E2E8F0" font-size="12">• Random Forest Deficiency Predictor</text>
      <text x="18" y="126" fill="#E2E8F0" font-size="12">• Gemini / OpenAI Ayurvedic Vaidya LLM</text>
      <text x="18" y="154" fill="#34D399" font-size="12" font-weight="700">✓ MlDeficiencyPredictorService</text>
    </g>

    <!-- Section 4: Database Foreign Key & Integrity Specifications -->
    <rect x="0" y="1150" width="1260" height="310" rx="12" fill="#131D31" stroke="#334155" stroke-width="1.8" />
    <text x="28" y="1186" fill="#A78BFA" font-size="17" font-weight="800" letter-spacing="1">DATABASE CONSTRAINTS &amp; REFERENTIAL INTEGRITY</text>
    
    <g transform="translate(30, 1205)">
      <rect x="0" y="0" width="1200" height="230" rx="10" fill="#0B1120" stroke="#334155" stroke-width="1.4"/>
      
      <text x="24" y="34" fill="#F8FAFC" font-size="13" font-weight="700">Key Database Mapping Rules &amp; Cascade Configurations:</text>
      <text x="24" y="64" fill="#E2E8F0" font-size="12" font-family="monospace">1. UserProfile [user_id]: UNIQUE foreign key to users.id. Establishes strict 1-to-1 profile ownership.</text>
      <text x="24" y="90" fill="#E2E8F0" font-size="12" font-family="monospace">2. MealPlan [items]: OneToMany mappedBy="mealPlan", cascade=CascadeType.ALL, orphanRemoval=true (Composition).</text>
      <text x="24" y="116" fill="#E2E8F0" font-size="12" font-family="monospace">3. RawFoodComposition [ayurvedicProfile]: OneToOne with AyurvedicFoodProfile (Eager fetch on nutritional lookup).</text>
      <text x="24" y="142" fill="#E2E8F0" font-size="12" font-family="monospace">4. ViruddhaCombination [food_a_id, food_b_id]: Dual Foreign Keys referencing food_items.id for fast conflict checks.</text>
      <text x="24" y="168" fill="#E2E8F0" font-size="12" font-family="monospace">5. EmailOtp [idx_otp_email]: Database B-Tree index on email column for ultra-fast OTP verification lookup.</text>
      <text x="24" y="196" fill="#38BDF8" font-size="12" font-weight="600">✓ Full Spring Data JPA auditing with @PrePersist callbacks populating timestamps automatically.</text>
    </g>
  </g>
`;

  svg += `
</svg>`;
  return svg;
}

// Generate the SVG file
const svgContent = generateSVG();
const outSvgPath = path.join(__dirname, 'ayurwell_class_diagram.svg');
fs.writeFileSync(outSvgPath, svgContent, 'utf8');
console.log(`Saved updated SVG to ${outSvgPath}`);

// Generate the HTML preview file
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AyurWell - Comprehensive UML Class Diagram</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #090d16;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: hidden;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      background: #111a2e;
      border-bottom: 1px solid #1e293b;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 10;
    }
    .title-group h1 {
      font-size: 1.15rem;
      font-weight: 700;
      color: #f8fafc;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .badge {
      font-size: 0.75rem;
      background: #065f46;
      color: #34d399;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 600;
    }
    .controls {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    button {
      background: #1e293b;
      border: 1px solid #334155;
      color: #e2e8f0;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }
    button:hover {
      background: #334155;
      color: #fff;
    }
    button.primary {
      background: #0284c7;
      border-color: #0369a1;
      color: #fff;
    }
    button.primary:hover {
      background: #0369a1;
    }
    #viewport {
      flex: 1;
      overflow: auto;
      display: flex;
      align-items: flex-start;
      justify-content: flex-start;
      padding: 40px;
      cursor: grab;
      background-color: #090d16;
    }
    #viewport:active {
      cursor: grabbing;
    }
    #diagram-container {
      transform-origin: top left;
      transition: transform 0.1s ease-out;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
      border-radius: 14px;
      overflow: hidden;
    }
    svg {
      display: block;
    }
  </style>
</head>
<body>
  <header>
    <div class="title-group">
      <h1>
        🌿 AyurWell Software Engineering UML Class Diagram
        <span class="badge">Spring Boot 3 + JPA</span>
        <span class="badge" style="background:#1e3a8a; color:#60a5fa;">15 Entities • 5 Enums</span>
      </h1>
    </div>
    <div class="controls">
      <button onclick="zoomOut()">🔍 - Zoom Out</button>
      <button onclick="resetZoom()">100% Reset</button>
      <button onclick="zoomIn()">🔍 + Zoom In</button>
      <button onclick="fitScreen()">Fit Screen</button>
      <button class="primary" onclick="downloadSVG()">💾 Download SVG</button>
      <button class="primary" style="background:#059669; border-color:#047857;" onclick="downloadPNG()">🖼️ Save as PNG</button>
    </div>
  </header>

  <div id="viewport">
    <div id="diagram-container">
      ${svgContent}
    </div>
  </div>

  <canvas id="exportCanvas" style="display:none;"></canvas>

  <script>
    let scale = 0.5;
    const container = document.getElementById('diagram-container');
    const viewport = document.getElementById('viewport');

    function updateTransform() {
      container.style.transform = \`scale(\${scale})\`;
    }

    function zoomIn() {
      scale = Math.min(scale + 0.1, 2.5);
      updateTransform();
    }

    function zoomOut() {
      scale = Math.max(scale - 0.1, 0.2);
      updateTransform();
    }

    function resetZoom() {
      scale = 1.0;
      updateTransform();
    }

    function fitScreen() {
      const availWidth = viewport.clientWidth - 80;
      scale = availWidth / 3600;
      updateTransform();
    }

    window.addEventListener('load', () => {
      fitScreen();
    });

    function downloadSVG() {
      const svgData = document.querySelector('svg').outerHTML;
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ayurwell_uml_class_diagram.svg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    function downloadPNG() {
      const svgElement = document.querySelector('svg');
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.getElementById('exportCanvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      canvas.width = 3600;
      canvas.height = 2420;

      img.onload = function() {
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const pngURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngURL;
        a.download = 'ayurwell_uml_class_diagram.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
      img.src = blobURL;
    }
  </script>
</body>
</html>`;

const outHtmlPath = path.join(__dirname, 'ayurwell_class_diagram.html');
fs.writeFileSync(outHtmlPath, htmlContent, 'utf8');
console.log(`Saved updated HTML preview to ${outHtmlPath}`);

// Render PNG using Resvg
const { Resvg } = require('@resvg/resvg-js');
const resvg = new Resvg(svgContent, { fitTo: { mode: 'width', value: 3600 } });
const pngData = resvg.render();
const pngBuffer = pngData.asPng();
const outPngPath = path.join(__dirname, 'ayurwell_class_diagram.png');
fs.writeFileSync(outPngPath, pngBuffer);
console.log(`Saved PNG (${pngBuffer.length} bytes) to ${outPngPath}`);

// Also copy both files to artifact directory
const artifactDir = 'C:\\Users\\dubey\\.gemini\\antigravity-ide\\brain\\4355294f-e04a-4d18-be9d-696a72e71e5d';
if (fs.existsSync(artifactDir)) {
  fs.writeFileSync(path.join(artifactDir, 'ayurwell_class_diagram.svg'), svgContent, 'utf8');
  fs.writeFileSync(path.join(artifactDir, 'ayurwell_class_diagram.png'), pngBuffer);
  console.log(`Copied PNG and SVG to artifact directory ${artifactDir}`);
}
