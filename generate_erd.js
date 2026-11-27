const fs = require('fs');
const path = require('path');

const WIDTH = 3600;
const HEIGHT = 2420;

// Color Palette for ERD (Database Engineering Theme)
const colors = {
  canvasBg: '#080C15',
  gridLine: 'rgba(255, 255, 255, 0.035)',
  
  // Domains
  auth: {
    bg: '#0F172A',
    border: '#0284C7',
    headerBg: 'url(#grad-auth)',
    headerText: '#FFFFFF',
    packageBg: 'rgba(2, 132, 199, 0.03)',
    packageBorder: 'rgba(2, 132, 199, 0.3)',
    typeColor: '#38BDF8'
  },
  dosha: {
    bg: '#0F172A',
    border: '#059669',
    headerBg: 'url(#grad-dosha)',
    headerText: '#FFFFFF',
    packageBg: 'rgba(5, 150, 105, 0.03)',
    packageBorder: 'rgba(5, 150, 105, 0.3)',
    typeColor: '#34D399'
  },
  diet: {
    bg: '#0F172A',
    border: '#D97706',
    headerBg: 'url(#grad-diet)',
    headerText: '#FFFFFF',
    packageBg: 'rgba(217, 119, 6, 0.03)',
    packageBorder: 'rgba(217, 119, 6, 0.3)',
    typeColor: '#FBBF24'
  },
  foodScience: {
    bg: '#0F172A',
    border: '#0D9488',
    headerBg: 'url(#grad-food)',
    headerText: '#FFFFFF',
    packageBg: 'rgba(13, 148, 136, 0.03)',
    packageBorder: 'rgba(13, 148, 136, 0.3)',
    typeColor: '#2DD4BF'
  },
  womens: {
    bg: '#0F172A',
    border: '#DB2777',
    headerBg: 'url(#grad-womens)',
    headerText: '#FFFFFF',
    packageBg: 'rgba(219, 39, 119, 0.03)',
    packageBorder: 'rgba(219, 39, 119, 0.3)',
    typeColor: '#F472B6'
  },
  tracking: {
    bg: '#0F172A',
    border: '#4F46E5',
    headerBg: 'url(#grad-tracking)',
    headerText: '#FFFFFF',
    packageBg: 'rgba(79, 70, 229, 0.03)',
    packageBorder: 'rgba(79, 70, 229, 0.3)',
    typeColor: '#818CF8'
  },
  arch: {
    packageBg: 'rgba(148, 163, 184, 0.03)',
    packageBorder: 'rgba(148, 163, 184, 0.25)',
  }
};

// Database Tables Definition (Exact PostgreSQL / H2 Schema)
const tables = [
  // --- AUTH DOMAIN ---
  {
    name: 'users',
    title: 'users',
    domain: 'auth',
    comment: 'Core Identity & Security Credentials',
    x: 440, y: 170, w: 380,
    columns: [
      { name: 'id', type: 'BIGINT', pk: true, notNull: true },
      { name: 'email', type: 'VARCHAR(255)', uk: true, notNull: true },
      { name: 'password', type: 'VARCHAR(255)', notNull: true },
      { name: 'full_name', type: 'VARCHAR(255)', notNull: true },
      { name: 'role', type: 'VARCHAR(50)', def: "'ROLE_USER'" },
      { name: 'active', type: 'BOOLEAN', def: 'TRUE' },
      { name: 'email_verified', type: 'BOOLEAN', def: 'FALSE' },
      { name: 'created_at', type: 'TIMESTAMP', def: 'NOW()' }
    ]
  },
  {
    name: 'user_profiles',
    title: 'user_profiles',
    domain: 'auth',
    comment: 'Physical & Economic Ayurvedic Profile',
    x: 70, y: 410, w: 340,
    columns: [
      { name: 'id', type: 'BIGINT', pk: true, notNull: true },
      { name: 'user_id', type: 'BIGINT', fk: true, uk: true, notNull: true },
      { name: 'age', type: 'INT' },
      { name: 'gender', type: 'VARCHAR(50)' },
      { name: 'weight_kg', type: 'DOUBLE PRECISION' },
      { name: 'height_cm', type: 'DOUBLE PRECISION' },
      { name: 'activity_level', type: 'VARCHAR(50)' },
      { name: 'budget_per_day_inr', type: 'DOUBLE PRECISION' },
      { name: 'primary_health_goal', type: 'VARCHAR(100)' },
      { name: 'primary_dosha', type: 'VARCHAR(50)' },
      { name: 'digestive_fire_agni', type: 'VARCHAR(50)' },
      { name: 'target_disease_condition', type: 'VARCHAR(100)' },
      { name: 'profile_completed', type: 'BOOLEAN', def: 'FALSE' }
    ]
  },
  {
    name: 'email_otps',
    title: 'email_otps',
    domain: 'auth',
    comment: 'Two-Factor Registration & Reset OTPs',
    x: 70, y: 170, w: 340,
    columns: [
      { name: 'id', type: 'BIGINT', pk: true, notNull: true },
      { name: 'email', type: 'VARCHAR(255)', idx: true, notNull: true },
      { name: 'otp_hash', type: 'VARCHAR(255)', notNull: true },
      { name: 'expires_at', type: 'TIMESTAMP', notNull: true },
      { name: 'verified', type: 'BOOLEAN', def: 'FALSE' },
      { name: 'attempts', type: 'INT', def: '0' },
      { name: 'created_at', type: 'TIMESTAMP', def: 'NOW()' }
    ]
  },

  // --- DOSHA DOMAIN ---
  {
    name: 'dosha_assessments',
    title: 'dosha_assessments',
    domain: 'dosha',
    comment: 'Vedic Prakriti Diagnostic Scoring',
    x: 440, y: 880, w: 380,
    columns: [
      { name: 'id', type: 'BIGINT', pk: true, notNull: true },
      { name: 'user_id', type: 'BIGINT', fk: true, notNull: true },
      { name: 'vata_score', type: 'INT', notNull: true },
      { name: 'pitta_score', type: 'INT', notNull: true },
      { name: 'kapha_score', type: 'INT', notNull: true },
      { name: 'primary_prakriti', type: 'VARCHAR(50)', notNull: true },
      { name: 'secondary_prakriti', type: 'VARCHAR(50)' },
      { name: 'assessed_at', type: 'TIMESTAMP', def: 'NOW()' }
    ]
  },

  // --- TRACKING DOMAIN ---
  {
    name: 'daily_health_logs',
    title: 'daily_health_logs',
    domain: 'tracking',
    comment: 'Daily Agni, Energy & Intake Tracker',
    x: 70, y: 1470, w: 360,
    columns: [
      { name: 'id', type: 'BIGINT', pk: true, notNull: true },
      { name: 'user_id', type: 'BIGINT', fk: true, notNull: true },
      { name: 'log_date', type: 'DATE', notNull: true },
      { name: 'calories_consumed', type: 'DOUBLE PRECISION' },
      { name: 'water_intake_liters', type: 'DOUBLE PRECISION' },
      { name: 'energy_level_rating', type: 'INT' },
      { name: 'digestion_quality_rating', type: 'INT' },
      { name: 'ayur_score_today', type: 'INT' },
      { name: 'iron_intake_mg', type: 'DOUBLE PRECISION' },
      { name: 'calcium_intake_mg', type: 'DOUBLE PRECISION' },
      { name: 'protein_intake_grams', type: 'DOUBLE PRECISION' }
    ]
  },
  {
    name: 'reminders',
    title: 'reminders',
    domain: 'tracking',
    comment: 'Dinacharya Lifestyle & Meal Notifications',
    x: 460, y: 1470, w: 360,
    columns: [
      { name: 'id', type: 'BIGINT', pk: true, notNull: true },
      { name: 'user_id', type: 'BIGINT', fk: true, notNull: true },
      { name: 'title', type: 'VARCHAR(255)', notNull: true },
      { name: 'reminder_time', type: 'TIME', notNull: true },
      { name: 'category', type: 'VARCHAR(50)', notNull: true },
      { name: 'description', type: 'VARCHAR(500)' },
      { name: 'enabled', type: 'BOOLEAN', def: 'TRUE' }
    ]
  },

  // --- DIET PLANNING DOMAIN ---
  {
    name: 'meal_plans',
    title: 'meal_plans',
    domain: 'diet',
    comment: '7-Day Personalized Ayurvedic Regimen',
    x: 900, y: 170, w: 390,
    columns: [
      { name: 'id', type: 'BIGINT', pk: true, notNull: true },
      { name: 'user_id', type: 'BIGINT', fk: true, notNull: true },
      { name: 'plan_name', type: 'VARCHAR(255)', notNull: true },
      { name: 'target_disease', type: 'VARCHAR(100)' },
      { name: 'season', type: 'VARCHAR(50)' },
      { name: 'womens_health_stage', type: 'VARCHAR(50)' },
      { name: 'total_daily_budget_inr', type: 'DOUBLE PRECISION' },
      { name: 'total_daily_calories', type: 'DOUBLE PRECISION' },
      { name: 'ayurvedic_nutrition_score', type: 'INT' },
      { name: 'created_at', type: 'TIMESTAMP', def: 'NOW()' }
    ]
  },
  {
    name: 'meal_plan_items',
    title: 'meal_plan_items',
    domain: 'diet',
    comment: 'Individual Dish & Ingredient Instances',
    x: 1360, y: 170, w: 380,
    columns: [
      { name: 'id', type: 'BIGINT', pk: true, notNull: true },
      { name: 'meal_plan_id', type: 'BIGINT', fk: true, notNull: true },
      { name: 'meal_type', type: 'VARCHAR(50)', notNull: true },
      { name: 'recipe_id', type: 'BIGINT', fk: true },
      { name: 'food_item_id', type: 'BIGINT', fk: true },
      { name: 'day_of_week', type: 'VARCHAR(20)', notNull: true },
      { name: 'portion_grams', type: 'DOUBLE PRECISION' },
      { name: 'item_cost_inr', type: 'DOUBLE PRECISION' },
      { name: 'item_calories', type: 'DOUBLE PRECISION' }
    ]
  },
  {
    name: 'recipes',
    title: 'recipes',
    domain: 'diet',
    comment: 'Standard Ayurvedic Formulations & Methods',
    x: 1360, y: 550, w: 380,
    columns: [
      { name: 'id', type: 'BIGINT', pk: true, notNull: true },
      { name: 'title', type: 'VARCHAR(255)', notNull: true },
      { name: 'description', type: 'VARCHAR(1000)' },
      { name: 'meal_type', type: 'VARCHAR(50)' },
      { name: 'suitable_dosha', type: 'VARCHAR(50)' },
      { name: 'suitable_season', type: 'VARCHAR(50)' },
      { name: 'prep_time_mins', type: 'INT' },
      { name: 'cost_per_serving_inr', type: 'DOUBLE PRECISION' },
      { name: 'calories', type: 'DOUBLE PRECISION' },
      { name: 'protein_grams', type: 'DOUBLE PRECISION' },
      { name: 'carbs_grams', type: 'DOUBLE PRECISION' },
      { name: 'fat_grams', type: 'DOUBLE PRECISION' },
      { name: 'iron_mg', type: 'DOUBLE PRECISION' },
      { name: 'instructions', type: 'TEXT' },
      { name: 'suitable_disease_conditions', type: 'VARCHAR(255)' },
      { name: 'suitable_womens_health_stage', type: 'VARCHAR(255)' }
    ]
  },
  {
    name: 'food_items',
    title: 'food_items',
    domain: 'diet',
    comment: 'Raw Culinary Food Ingredients',
    x: 1810, y: 170, w: 380,
    columns: [
      { name: 'id', type: 'BIGINT', pk: true, notNull: true },
      { name: 'name', type: 'VARCHAR(255)', uk: true, notNull: true },
      { name: 'category', type: 'VARCHAR(100)' },
      { name: 'rasa', type: 'VARCHAR(100)' },
      { name: 'virya', type: 'VARCHAR(50)' },
      { name: 'vipaka', type: 'VARCHAR(50)' },
      { name: 'dosha_effect', type: 'VARCHAR(50)' },
      { name: 'calories', type: 'DOUBLE PRECISION' },
      { name: 'protein_grams', type: 'DOUBLE PRECISION' },
      { name: 'carbs_grams', type: 'DOUBLE PRECISION' },
      { name: 'fat_grams', type: 'DOUBLE PRECISION' },
      { name: 'iron_mg', type: 'DOUBLE PRECISION' },
      { name: 'calcium_mg', type: 'DOUBLE PRECISION' },
      { name: 'fiber_grams', type: 'DOUBLE PRECISION' },
      { name: 'estimated_cost_inr', type: 'DOUBLE PRECISION' }
    ]
  },
  {
    name: 'viruddha_combinations',
    title: 'viruddha_combinations',
    domain: 'diet',
    comment: 'Classical Incompatible Food Pairing Rules',
    x: 1810, y: 650, w: 380,
    columns: [
      { name: 'id', type: 'BIGINT', pk: true, notNull: true },
      { name: 'food_a_id', type: 'BIGINT', fk: true, notNull: true },
      { name: 'food_b_id', type: 'BIGINT', fk: true, notNull: true },
      { name: 'incompatibility_type', type: 'VARCHAR(100)', notNull: true },
      { name: 'health_hazard_reason', type: 'VARCHAR(500)' },
      { name: 'antidote_recommendation', type: 'VARCHAR(500)' }
    ]
  },

  // --- FOOD SCIENCE DOMAIN ---
  {
    name: 'raw_food_composition',
    title: 'raw_food_composition',
    domain: 'foodScience',
    comment: 'ICMR-NIN IFCT 2017 Biochemical Database',
    x: 2260, y: 170, w: 410,
    columns: [
      { name: 'id', type: 'BIGINT', pk: true, notNull: true },
      { name: 'food_code', type: 'VARCHAR(50)', uk: true, notNull: true },
      { name: 'food_name', type: 'VARCHAR(255)', notNull: true },
      { name: 'category', type: 'VARCHAR(100)' },
      { name: 'dataset_source', type: 'VARCHAR(255)' },
      { name: 'serving_size', type: 'VARCHAR(50)', def: "'100g'" },
      { name: 'energy_kcal', type: 'DOUBLE PRECISION' },
      { name: 'protein_grams', type: 'DOUBLE PRECISION' },
      { name: 'carbs_grams', type: 'DOUBLE PRECISION' },
      { name: 'fat_grams', type: 'DOUBLE PRECISION' },
      { name: 'fiber_grams', type: 'DOUBLE PRECISION' },
      { name: 'iron_mg', type: 'DOUBLE PRECISION' },
      { name: 'calcium_mg', type: 'DOUBLE PRECISION' },
      { name: 'vitamin_b12_mcg', type: 'DOUBLE PRECISION' },
      { name: 'vitamin_d_iu', type: 'DOUBLE PRECISION' },
      { name: 'folate_mcg', type: 'DOUBLE PRECISION' },
      { name: 'vitamin_c_mg', type: 'DOUBLE PRECISION' }
    ]
  },
  {
    name: 'ayurvedic_food_profiles',
    title: 'ayurvedic_food_profiles',
    domain: 'foodScience',
    comment: 'Classical Dravyaguna Energetics',
    x: 2740, y: 170, w: 410,
    columns: [
      { name: 'id', type: 'BIGINT', pk: true, notNull: true },
      { name: 'raw_food_id', type: 'BIGINT', fk: true, uk: true, notNull: true },
      { name: 'sanskrit_name', type: 'VARCHAR(255)' },
      { name: 'rasa', type: 'VARCHAR(100)' },
      { name: 'virya', type: 'VARCHAR(50)' },
      { name: 'vipaka', type: 'VARCHAR(50)' },
      { name: 'dosha_effect', type: 'VARCHAR(50)' },
      { name: 'suitable_ritu_seasons', type: 'VARCHAR(255)' },
      { name: 'classical_text_reference', type: 'VARCHAR(255)' }
    ]
  },

  // --- WOMEN'S HEALTH DOMAIN ---
  {
    name: 'womens_health_profiles',
    title: 'womens_health_profiles',
    domain: 'womens',
    comment: 'Stree Swasthya Life Stages & Cycle Setup',
    x: 900, y: 1470, w: 440,
    columns: [
      { name: 'id', type: 'BIGINT', pk: true, notNull: true },
      { name: 'user_id', type: 'BIGINT', fk: true, uk: true, notNull: true },
      { name: 'health_stage', type: 'VARCHAR(50)' },
      { name: 'pregnancy_trimester', type: 'INT' },
      { name: 'cycle_phase', type: 'VARCHAR(50)' },
      { name: 'reported_symptoms', type: 'VARCHAR(500)' },
      { name: 'last_period_date', type: 'DATE' },
      { name: 'cycle_length_days', type: 'INT', def: '28' },
      { name: 'period_duration_days', type: 'INT', def: '5' },
      { name: 'flow_level', type: 'VARCHAR(50)' },
      { name: 'cramps_severity', type: 'VARCHAR(50)' },
      { name: 'mood', type: 'VARCHAR(50)' },
      { name: 'energy_level', type: 'VARCHAR(50)' },
      { name: 'menopause_symptoms', type: 'VARCHAR(500)' },
      { name: 'hot_flash_frequency', type: 'INT' },
      { name: 'sleep_quality_rating', type: 'INT' },
      { name: 'daily_iron_target_mg', type: 'DOUBLE PRECISION', def: '18.0' },
      { name: 'daily_iron_intake_mg', type: 'DOUBLE PRECISION' }
    ]
  },
  {
    name: 'womens_health_logs',
    title: 'womens_health_logs',
    domain: 'womens',
    comment: 'Daily Menstrual & Symptom Observational Log',
    x: 1390, y: 1470, w: 410,
    columns: [
      { name: 'id', type: 'BIGINT', pk: true, notNull: true },
      { name: 'user_id', type: 'BIGINT', fk: true, notNull: true },
      { name: 'log_date', type: 'DATE', notNull: true },
      { name: 'log_type', type: 'VARCHAR(50)', notNull: true },
      { name: 'flow_level', type: 'VARCHAR(50)' },
      { name: 'cramps_severity', type: 'VARCHAR(50)' },
      { name: 'mood', type: 'VARCHAR(50)' },
      { name: 'energy', type: 'VARCHAR(50)' },
      { name: 'symptoms', type: 'VARCHAR(500)' },
      { name: 'iron_intake_mg', type: 'DOUBLE PRECISION' },
      { name: 'water_intake_l', type: 'DOUBLE PRECISION' },
      { name: 'sleep_hours', type: 'INT' },
      { name: 'wellness_score', type: 'INT' },
      { name: 'notes', type: 'VARCHAR(1000)' }
    ]
  }
];

// Relationships Definition with Crow's Foot Endpoints
const relationships = [
  // users 1 <---> 1 user_profiles
  {
    from: 'users', to: 'user_profiles',
    fromCard: '1', toCard: '1',
    label: 'user_profiles.user_id = users.id (UNIQUE)',
    color: '#0284C7',
    startSymbol: 'one', endSymbol: 'one',
    points: [
      { x: 440, y: 440 },
      { x: 410, y: 440 }
    ]
  },
  // users 1 ---> 0..* dosha_assessments
  {
    from: 'users', to: 'dosha_assessments',
    fromCard: '1', toCard: '0..*',
    label: 'dosha_assessments.user_id = users.id',
    color: '#059669',
    startSymbol: 'one', endSymbol: 'crows-foot',
    points: [
      { x: 630, y: 460 },
      { x: 630, y: 880 }
    ]
  },
  // users 1 ---> 0..* meal_plans
  {
    from: 'users', to: 'meal_plans',
    fromCard: '1', toCard: '0..*',
    label: 'meal_plans.user_id = users.id',
    color: '#D97706',
    startSymbol: 'one', endSymbol: 'crows-foot',
    points: [
      { x: 820, y: 280 },
      { x: 900, y: 280 }
    ]
  },
  // meal_plans 1 ---> 1..* meal_plan_items
  {
    from: 'meal_plans', to: 'meal_plan_items',
    fromCard: '1', toCard: '1..*',
    label: 'meal_plan_items.meal_plan_id = meal_plans.id (CASCADE)',
    color: '#D97706',
    startSymbol: 'one', endSymbol: 'crows-foot',
    points: [
      { x: 1290, y: 280 },
      { x: 1360, y: 280 }
    ]
  },
  // meal_plan_items 0..* ---> 0..1 recipes
  {
    from: 'meal_plan_items', to: 'recipes',
    fromCard: '0..*', toCard: '0..1',
    label: 'meal_plan_items.recipe_id = recipes.id',
    color: '#D97706',
    startSymbol: 'crows-foot', endSymbol: 'one-optional',
    points: [
      { x: 1550, y: 460 },
      { x: 1550, y: 550 }
    ]
  },
  // meal_plan_items 0..* ---> 0..1 food_items
  {
    from: 'meal_plan_items', to: 'food_items',
    fromCard: '0..*', toCard: '0..1',
    label: 'meal_plan_items.food_item_id = food_items.id',
    color: '#D97706',
    startSymbol: 'crows-foot', endSymbol: 'one-optional',
    points: [
      { x: 1740, y: 280 },
      { x: 1810, y: 280 }
    ]
  },
  // food_items 1 <--- 0..* viruddha_combinations
  {
    from: 'viruddha_combinations', to: 'food_items',
    fromCard: '0..*', toCard: '1',
    label: 'food_a_id, food_b_id -> food_items.id',
    color: '#EF4444',
    startSymbol: 'crows-foot', endSymbol: 'one',
    points: [
      { x: 2000, y: 650 },
      { x: 2000, y: 590 }
    ]
  },
  // raw_food_composition 1 <---> 1 ayurvedic_food_profiles
  {
    from: 'raw_food_composition', to: 'ayurvedic_food_profiles',
    fromCard: '1', toCard: '1',
    label: 'ayurvedic_food_profiles.raw_food_id = raw_food_composition.id (UNIQUE)',
    color: '#0D9488',
    startSymbol: 'one', endSymbol: 'one',
    points: [
      { x: 2670, y: 280 },
      { x: 2740, y: 280 }
    ]
  },
  // users 1 ---> 0..* daily_health_logs
  {
    from: 'users', to: 'daily_health_logs',
    fromCard: '1', toCard: '0..*',
    label: 'daily_health_logs.user_id = users.id',
    color: '#4F46E5',
    startSymbol: 'one', endSymbol: 'crows-foot',
    points: [
      { x: 440, y: 460 },
      { x: 425, y: 460 },
      { x: 425, y: 860 },
      { x: 425, y: 1410 },
      { x: 250, y: 1410 },
      { x: 250, y: 1470 }
    ]
  },
  // users 1 ---> 0..* reminders
  {
    from: 'users', to: 'reminders',
    fromCard: '1', toCard: '0..*',
    label: 'reminders.user_id = users.id',
    color: '#4F46E5',
    startSymbol: 'one', endSymbol: 'crows-foot',
    points: [
      { x: 740, y: 460 },
      { x: 740, y: 860 },
      { x: 740, y: 1440 },
      { x: 640, y: 1440 },
      { x: 640, y: 1470 }
    ]
  },
  // users 1 <---> 0..1 womens_health_profiles
  {
    from: 'users', to: 'womens_health_profiles',
    fromCard: '1', toCard: '0..1',
    label: 'womens_health_profiles.user_id = users.id (UNIQUE)',
    color: '#DB2777',
    startSymbol: 'one', endSymbol: 'one-optional',
    points: [
      { x: 820, y: 440 },
      { x: 855, y: 440 },
      { x: 855, y: 1540 },
      { x: 900, y: 1540 }
    ]
  },
  // users 1 ---> 0..* womens_health_logs
  {
    from: 'users', to: 'womens_health_logs',
    fromCard: '1', toCard: '0..*',
    label: 'womens_health_logs.user_id = users.id',
    color: '#DB2777',
    startSymbol: 'one', endSymbol: 'crows-foot',
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
    title: 'AUTH & IDENTITY RELATIONAL DOMAIN',
    subtitle: 'RBAC Users, Profile Demographics & OTP Verification Logs',
    x: 50, y: 105, w: 790, h: 745,
    color: colors.auth
  },
  {
    title: 'AYURVEDIC ASSESSMENT SCHEMA',
    subtitle: 'Diagnostic Prakriti Scores & Dosha Constitution Logs',
    x: 50, y: 865, w: 790, h: 500,
    color: colors.dosha
  },
  {
    title: 'DINACHARYA & LIFESTYLE LOGS',
    subtitle: 'Daily Energy, Digestion Fire Logs & Timed Reminders',
    x: 50, y: 1380, w: 790, h: 980,
    color: colors.tracking
  },
  {
    title: 'DIET PLANNING & AYURVEDIC NUTRITION ENGINE',
    subtitle: 'Meal Plans, Recipes, Food Items & Viruddha Incompatibility Matrix',
    x: 870, y: 105, w: 1340, h: 1260,
    color: colors.diet
  },
  {
    title: 'BIOCHEMICAL FOOD SCIENCE & DRAVYAGUNA DATABASE',
    subtitle: 'ICMR-NIN IFCT 2017 Dataset & Classical Ayurvedic Energetics (1:1 Join)',
    x: 2230, y: 105, w: 1320, h: 720,
    color: colors.foodScience
  },
  {
    title: 'WOMEN’S HEALTH & STREE SWASTHYA TABLES',
    subtitle: 'Menstrual Cycle, Pregnancy Trimester, Menopause & Symptom Tracking',
    x: 870, y: 1380, w: 1340, h: 980,
    color: colors.womens
  },
  {
    title: 'DATABASE SPECIFICATIONS & REFERENTIAL INTEGRITY',
    subtitle: 'PostgreSQL Relational Schema Matrix, Foreign Keys & Crow’s Foot Notation',
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

    <!-- Gradients for Table Headers -->
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

    <linearGradient id="grad-header-bar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="35%" stop-color="#0284C7" />
      <stop offset="70%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#DB2777" />
    </linearGradient>

    <!-- Crow's Foot Markers -->
    <!-- Crow's Foot Many Marker -->
    <marker id="marker-crows-foot" viewBox="0 0 20 20" refX="18" refY="10" markerWidth="14" markerHeight="14" orient="auto-start-reverse">
      <path d="M 0 3 L 18 10 L 0 17 M 18 2 L 18 18" fill="none" stroke="#FBBF24" stroke-width="2.2" stroke-linecap="round"/>
    </marker>

    <!-- One Mandatory Marker (||) -->
    <marker id="marker-one" viewBox="0 0 16 16" refX="14" refY="8" markerWidth="12" markerHeight="12" orient="auto-start-reverse">
      <path d="M 6 2 L 6 14 M 12 2 L 12 14" fill="none" stroke="#38BDF8" stroke-width="2.2" stroke-linecap="round"/>
    </marker>

    <!-- One Optional Marker (o|) -->
    <marker id="marker-one-optional" viewBox="0 0 20 20" refX="18" refY="10" markerWidth="14" markerHeight="14" orient="auto-start-reverse">
      <circle cx="6" cy="10" r="4.5" fill="#0B1120" stroke="#F472B6" stroke-width="2" />
      <path d="M 16 3 L 16 17" fill="none" stroke="#F472B6" stroke-width="2.2" stroke-linecap="round"/>
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
    <text x="580" y="40" fill="#38BDF8" font-size="18" font-weight="700">ENTITY-RELATIONSHIP DIAGRAM (ERD) — RELATIONAL DATABASE SCHEMA</text>
    
    <!-- Badges on right side -->
    <rect x="${WIDTH - 760}" y="17" width="160" height="30" rx="6" fill="#064E3B" stroke="#059669" stroke-width="1.2"/>
    <text x="${WIDTH - 680}" y="37" fill="#34D399" font-size="13" font-weight="800" text-anchor="middle">POSTGRESQL / H2</text>
    
    <rect x="${WIDTH - 585}" y="17" width="155" height="30" rx="6" fill="#1E3A8A" stroke="#2563EB" stroke-width="1.2"/>
    <text x="${WIDTH - 507}" y="37" fill="#60A5FA" font-size="13" font-weight="800" text-anchor="middle">CROW’S FOOT NOTATION</text>

    <rect x="${WIDTH - 415}" y="17" width="165" height="30" rx="6" fill="#701A75" stroke="#C026D3" stroke-width="1.2"/>
    <text x="${WIDTH - 332}" y="37" fill="#F472B6" font-size="13" font-weight="800" text-anchor="middle">15 RELATIONAL TABLES</text>

    <rect x="${WIDTH - 235}" y="17" width="115" height="30" rx="6" fill="#312E81" stroke="#4F46E5" stroke-width="1.2"/>
    <text x="${WIDTH - 177}" y="37" fill="#A5B4FC" font-size="13" font-weight="800" text-anchor="middle">ACID COMPLIANT</text>
  </g>
`;

  // Render Packages / Domain Boundaries
  packages.forEach(pkg => {
    svg += `
  <!-- Domain: ${escapeXml(pkg.title)} -->
  <g>
    <rect x="${pkg.x}" y="${pkg.y}" width="${pkg.w}" height="${pkg.h}" rx="16" fill="${pkg.color.packageBg}" stroke="${pkg.color.packageBorder}" stroke-width="2" stroke-dasharray="8,5" />
    <rect x="${pkg.x + 20}" y="${pkg.y - 15}" width="${pkg.title.length * 10 + 36}" height="30" rx="7" fill="#1E293B" stroke="${pkg.color.packageBorder}" stroke-width="1.6" />
    <text x="${pkg.x + 36}" y="${pkg.y + 6}" fill="#F1F5F9" font-size="13" font-weight="800" letter-spacing="1">${escapeXml(pkg.title)}</text>
    <text x="${pkg.x + 28}" y="${pkg.y + 40}" fill="#64748B" font-size="12.5" font-weight="500">${escapeXml(pkg.subtitle)}</text>
  </g>
`;
  });

  // Render ERD Relationship Connectors
  relationships.forEach(rel => {
    let pathD = `M ${rel.points[0].x} ${rel.points[0].y}`;
    for (let i = 1; i < rel.points.length; i++) {
      pathD += ` L ${rel.points[i].x} ${rel.points[i].y}`;
    }

    const startPt = rel.points[0];
    const endPt = rel.points[rel.points.length - 1];
    const midIdx = Math.floor(rel.points.length / 2);
    const midPt = rel.points[midIdx];

    const markerStart = rel.startSymbol === 'one' ? 'url(#marker-one)' : (rel.startSymbol === 'crows-foot' ? 'url(#marker-crows-foot)' : '');
    const markerEnd = rel.endSymbol === 'crows-foot' ? 'url(#marker-crows-foot)' : (rel.endSymbol === 'one' ? 'url(#marker-one)' : 'url(#marker-one-optional)');

    svg += `
  <!-- Rel: ${escapeXml(rel.from)} -> ${escapeXml(rel.to)} -->
  <g>
    <path d="${pathD}" fill="none" stroke="${rel.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" marker-start="${markerStart}" marker-end="${markerEnd}" opacity="0.88"/>
    
    <!-- Cardinality Badges -->
    <rect x="${startPt.x + 8}" y="${startPt.y - 20}" width="32" height="20" rx="4" fill="#0B1120" stroke="#334155" stroke-width="1.2" opacity="0.95"/>
    <text x="${startPt.x + 24}" y="${startPt.y - 6}" fill="#F8FAFC" font-size="11.5" font-weight="800" text-anchor="middle">${escapeXml(rel.fromCard)}</text>

    <rect x="${endPt.x - 38}" y="${endPt.y - 20}" width="32" height="20" rx="4" fill="#0B1120" stroke="#334155" stroke-width="1.2" opacity="0.95"/>
    <text x="${endPt.x - 22}" y="${endPt.y - 6}" fill="#F8FAFC" font-size="11.5" font-weight="800" text-anchor="middle">${escapeXml(rel.toCard)}</text>

    <!-- Relationship Foreign Key Annotation Label -->
    <rect x="${midPt.x - (rel.label.length * 4.3 + 12)}" y="${midPt.y - 22}" width="${rel.label.length * 8.6 + 24}" height="22" rx="5" fill="#0F172A" stroke="${rel.color}" stroke-width="1.2" opacity="0.95"/>
    <text x="${midPt.x}" y="${midPt.y - 7}" fill="#E2E8F0" font-size="11" font-weight="700" text-anchor="middle">${escapeXml(rel.label)}</text>
  </g>
`;
  });

  // Render ERD Tables
  tables.forEach(tbl => {
    const col = colors[tbl.domain] || colors.auth;
    const headerHeight = 58;
    const itemHeight = 24;
    const actualHeight = headerHeight + (tbl.columns.length * itemHeight) + 16;

    svg += `
  <!-- Table: ${escapeXml(tbl.name)} -->
  <g id="table-${escapeXml(tbl.name)}" transform="translate(${tbl.x}, ${tbl.y})" filter="url(#card-shadow)">
    <!-- Base Table Container -->
    <rect x="0" y="0" width="${tbl.w}" height="${actualHeight}" rx="12" fill="${col.bg}" stroke="${col.border}" stroke-width="2" />

    <!-- Table Header -->
    <path d="M 0 12 Q 0 0 12 0 L ${tbl.w - 12} 0 Q ${tbl.w} 0 ${tbl.w} 12 L ${tbl.w} ${headerHeight} L 0 ${headerHeight} Z" fill="${col.headerBg}" />
    
    <!-- Table Icon, Name & Comment -->
    <text x="18" y="27" fill="#FFFFFF" font-size="16">🗄️</text>
    <text x="44" y="28" fill="#FFFFFF" font-size="17" font-weight="900" letter-spacing="0.6">${escapeXml(tbl.name)}</text>
    <text x="18" y="48" fill="rgba(255,255,255,0.8)" font-size="10.5" font-family="'JetBrains Mono', 'Fira Code', monospace">${escapeXml(tbl.comment)}</text>

    <!-- Header Divider Line -->
    <line x1="0" y1="${headerHeight}" x2="${tbl.w}" y2="${headerHeight}" stroke="${col.border}" stroke-width="1.8" />

    <!-- Columns Compartment -->
    <g transform="translate(16, ${headerHeight + 20})">
`;

    tbl.columns.forEach((c, idx) => {
      const y = idx * itemHeight;
      let badge = '';
      if (c.pk) {
        badge = `<rect x="${tbl.w - 80}" y="${y - 14}" width="48" height="18" rx="4" fill="#DC2626" opacity="0.95"/><text x="${tbl.w - 56}" y="${y - 1}" fill="#FFFFFF" font-size="10" font-weight="900" text-anchor="middle">PK</text>`;
      } else if (c.fk && c.uk) {
        badge = `<rect x="${tbl.w - 100}" y="${y - 14}" width="68" height="18" rx="4" fill="#2563EB" opacity="0.95"/><text x="${tbl.w - 66}" y="${y - 1}" fill="#FFFFFF" font-size="9.5" font-weight="900" text-anchor="middle">FK, UK</text>`;
      } else if (c.fk) {
        badge = `<rect x="${tbl.w - 80}" y="${y - 14}" width="48" height="18" rx="4" fill="#2563EB" opacity="0.95"/><text x="${tbl.w - 56}" y="${y - 1}" fill="#FFFFFF" font-size="10" font-weight="900" text-anchor="middle">FK</text>`;
      } else if (c.uk) {
        badge = `<rect x="${tbl.w - 80}" y="${y - 14}" width="48" height="18" rx="4" fill="#7C3AED" opacity="0.95"/><text x="${tbl.w - 56}" y="${y - 1}" fill="#FFFFFF" font-size="10" font-weight="900" text-anchor="middle">UK</text>`;
      } else if (c.idx) {
        badge = `<rect x="${tbl.w - 80}" y="${y - 14}" width="48" height="18" rx="4" fill="#0D9488" opacity="0.95"/><text x="${tbl.w - 56}" y="${y - 1}" fill="#FFFFFF" font-size="9.5" font-weight="900" text-anchor="middle">INDEX</text>`;
      }

      const notNullText = c.notNull ? `<tspan fill="#EF4444" font-weight="bold"> *</tspan>` : '';
      const defText = c.def ? `<tspan fill="#64748B" font-size="10"> DEFAULT ${escapeXml(c.def)}</tspan>` : '';

      svg += `      <text x="0" y="${y}" fill="#94A3B8" font-size="12.5" font-family="'JetBrains Mono', 'Fira Code', monospace">
        <tspan fill="#F8FAFC" font-weight="700">${escapeXml(c.name)}</tspan>${notNullText} : <tspan fill="${col.typeColor}" font-weight="600">${escapeXml(c.type)}</tspan>${defText}
      </text>
      ${badge}
`;
    });

    svg += `    </g>
  </g>
`;
  });

  // ================= DATABASE ARCHITECTURE & INTEGRITY PANEL =================
  svg += `
  <!-- DATABASE SPECIFICATIONS PANEL (Right Side) -->
  <g transform="translate(2260, 900)">
    <!-- Section 1: Relational Schema Architectural Matrix -->
    <rect x="0" y="0" width="1260" height="360" rx="12" fill="#131D31" stroke="#334155" stroke-width="1.8" />
    <text x="28" y="36" fill="#38BDF8" font-size="17" font-weight="800" letter-spacing="1">POSTGRESQL / H2 RELATIONAL DATABASE ARCHITECTURE</text>
    <text x="28" y="58" fill="#94A3B8" font-size="13">ACID Compliant Enterprise Schema with B-Tree Indexes, Foreign Key Cascades &amp; Domain Isolation</text>

    <!-- Layers Visualization -->
    <!-- Tier 1: Tables Count -->
    <rect x="30" y="80" width="270" height="250" rx="10" fill="#0B1120" stroke="#0284C7" stroke-width="1.6"/>
    <rect x="30" y="80" width="270" height="38" rx="10" fill="#0284C7"/>
    <text x="165" y="105" fill="#FFFFFF" font-size="14" font-weight="800" text-anchor="middle">RELATIONAL TABLES (15)</text>
    <text x="46" y="142" fill="#E2E8F0" font-size="12" font-family="monospace">• users (Identity Core)</text>
    <text x="46" y="164" fill="#E2E8F0" font-size="12" font-family="monospace">• user_profiles (Bio/Goals)</text>
    <text x="46" y="186" fill="#E2E8F0" font-size="12" font-family="monospace">• dosha_assessments (Prakriti)</text>
    <text x="46" y="208" fill="#E2E8F0" font-size="12" font-family="monospace">• meal_plans &amp; items</text>
    <text x="46" y="230" fill="#E2E8F0" font-size="12" font-family="monospace">• recipes &amp; food_items</text>
    <text x="46" y="252" fill="#E2E8F0" font-size="12" font-family="monospace">• viruddha_combinations</text>
    <text x="46" y="274" fill="#E2E8F0" font-size="12" font-family="monospace">• raw_food_composition</text>
    <text x="46" y="296" fill="#E2E8F0" font-size="12" font-family="monospace">• ayurvedic_food_profiles</text>
    <text x="46" y="318" fill="#E2E8F0" font-size="12" font-family="monospace">• womens_health &amp; logs</text>

    <!-- Arrow 1 -> 2 -->
    <path d="M 315 205 L 350 205" fill="none" stroke="#38BDF8" stroke-width="3" marker-end="url(#marker-one)"/>

    <!-- Tier 2: Primary & Foreign Keys -->
    <rect x="360" y="80" width="270" height="250" rx="10" fill="#0B1120" stroke="#059669" stroke-width="1.6"/>
    <rect x="360" y="80" width="270" height="38" rx="10" fill="#059669"/>
    <text x="495" y="105" fill="#FFFFFF" font-size="14" font-weight="800" text-anchor="middle">KEYS &amp; CONSTRAINTS</text>
    <text x="376" y="142" fill="#E2E8F0" font-size="12" font-family="monospace">• 15 Primary Keys (BIGINT)</text>
    <text x="376" y="164" fill="#E2E8F0" font-size="12" font-family="monospace">• 12 Foreign Key Joins</text>
    <text x="376" y="186" fill="#E2E8F0" font-size="12" font-family="monospace">• 4 Unique Constraints</text>
    <text x="376" y="208" fill="#E2E8F0" font-size="12" font-family="monospace">• Cascade Delete on items</text>
    <text x="376" y="230" fill="#E2E8F0" font-size="12" font-family="monospace">• Dual FK on Viruddha</text>
    <text x="376" y="252" fill="#E2E8F0" font-size="12" font-family="monospace">• 1:1 Strict Joins on Profile</text>
    <text x="376" y="274" fill="#E2E8F0" font-size="12" font-family="monospace">• NOT NULL Security fields</text>
    <text x="376" y="306" fill="#34D399" font-size="12" font-weight="700">✓ Referential Integrity</text>

    <!-- Arrow 2 -> 3 -->
    <path d="M 645 205 L 680 205" fill="none" stroke="#34D399" stroke-width="3" marker-end="url(#marker-one)"/>

    <!-- Tier 3: Indexing & Performance -->
    <rect x="690" y="80" width="260" height="250" rx="10" fill="#0B1120" stroke="#7C3AED" stroke-width="1.6"/>
    <rect x="690" y="80" width="260" height="38" rx="10" fill="#7C3AED"/>
    <text x="820" y="105" fill="#FFFFFF" font-size="14" font-weight="800" text-anchor="middle">INDEXING &amp; PERFORMANCE</text>
    <text x="706" y="142" fill="#E2E8F0" font-size="12" font-family="monospace">• idx_otp_email (B-Tree)</text>
    <text x="706" y="164" fill="#E2E8F0" font-size="12" font-family="monospace">• users(email) Unique Index</text>
    <text x="706" y="186" fill="#E2E8F0" font-size="12" font-family="monospace">• raw_food(food_code) Index</text>
    <text x="706" y="208" fill="#E2E8F0" font-size="12" font-family="monospace">• food_items(name) Index</text>
    <text x="706" y="230" fill="#E2E8F0" font-size="12" font-family="monospace">• FK indexes on user_id</text>
    <text x="706" y="252" fill="#E2E8F0" font-size="12" font-family="monospace">• Hibernate L2 Caching</text>
    <text x="706" y="274" fill="#E2E8F0" font-size="12" font-family="monospace">• Sub-millisecond queries</text>
    <text x="706" y="306" fill="#A78BFA" font-size="12" font-weight="700">✓ O(log N) Lookup Times</text>

    <!-- Arrow 3 -> 4 -->
    <path d="M 965 205 L 1000 205" fill="none" stroke="#A78BFA" stroke-width="3" marker-end="url(#marker-one)"/>

    <!-- Tier 4: Storage & Engines -->
    <rect x="1010" y="80" width="220" height="250" rx="10" fill="#0B1120" stroke="#F59E0B" stroke-width="1.6"/>
    <rect x="1010" y="80" width="220" height="38" rx="10" fill="#D97706"/>
    <text x="1120" y="105" fill="#FFFFFF" font-size="14" font-weight="800" text-anchor="middle">STORAGE &amp; ENGINES</text>
    <text x="1025" y="146" fill="#FDE68A" font-size="13" font-weight="800">RDBMS Target Platforms</text>
    <text x="1025" y="172" fill="#E2E8F0" font-size="12">• PostgreSQL 15+ (Prod)</text>
    <text x="1025" y="198" fill="#E2E8F0" font-size="12">• H2 In-Memory (Dev/Test)</text>
    <text x="1025" y="224" fill="#E2E8F0" font-size="12">• UTF-8 Sanskrit encoding</text>
    <text x="1025" y="250" fill="#E2E8F0" font-size="12">• Flyway / Liquibase Ready</text>
    <text x="1025" y="286" fill="#34D399" font-size="13" font-weight="700">✓ 100% Relational Norm</text>

    <!-- Section 2: Crow's Foot Notation & ERD Legend -->
    <rect x="0" y="380" width="1260" height="470" rx="12" fill="#131D31" stroke="#334155" stroke-width="1.8" />
    <text x="28" y="416" fill="#FBBF24" font-size="17" font-weight="800" letter-spacing="1">CROW’S FOOT NOTATION &amp; RELATIONSHIP KEY</text>

    <!-- Legend Items Grid -->
    <!-- Col 1: Connectors -->
    <g transform="translate(30, 445)">
      <rect x="0" y="0" width="580" height="385" rx="10" fill="#0B1120" stroke="#334155" stroke-width="1.4"/>
      <text x="22" y="32" fill="#E2E8F0" font-size="15" font-weight="700">Crow's Foot Cardinality Symbols:</text>

      <!-- One and Only One -->
      <path d="M 22 72 L 130 72" stroke="#38BDF8" stroke-width="2.8" marker-start="url(#marker-one)" marker-end="url(#marker-one)"/>
      <text x="150" y="77" fill="#F1F5F9" font-size="13" font-weight="700">One and Only One (||-------||)</text>
      <text x="150" y="96" fill="#94A3B8" font-size="12">Strict 1:1 relationship (users.id ↔ user_profiles.user_id).</text>

      <!-- One to Zero or One -->
      <path d="M 22 135 L 130 135" stroke="#F472B6" stroke-width="2.8" marker-start="url(#marker-one)" marker-end="url(#marker-one-optional)"/>
      <text x="150" y="140" fill="#F1F5F9" font-size="13" font-weight="700">Zero or One Optional (||-------o|)</text>
      <text x="150" y="159" fill="#94A3B8" font-size="12">Optional 1:1 join (users.id ↔ womens_health_profiles.user_id).</text>

      <!-- One to Many (Zero or More) -->
      <path d="M 22 198 L 130 198" stroke="#FBBF24" stroke-width="2.8" marker-start="url(#marker-one)" marker-end="url(#marker-crows-foot)"/>
      <text x="150" y="203" fill="#F1F5F9" font-size="13" font-weight="700">One to Many (||-------o{)</text>
      <text x="150" y="222" fill="#94A3B8" font-size="12">1:N relationship (users.id ↔ meal_plans.user_id, logs.user_id).</text>

      <!-- Many to One / Zero -->
      <path d="M 22 260 L 130 260" stroke="#D97706" stroke-width="2.8" marker-start="url(#marker-crows-foot)" marker-end="url(#marker-one-optional)"/>
      <text x="150" y="265" fill="#F1F5F9" font-size="13" font-weight="700">Many to Optional One (}o-------o|)</text>
      <text x="150" y="284" fill="#94A3B8" font-size="12">N:1 foreign reference (meal_plan_items ↔ recipes, food_items).</text>

      <!-- Explanation -->
      <text x="22" y="332" fill="#F8FAFC" font-size="13" font-weight="700">Referential Integrity Rule:</text>
      <text x="22" y="358" fill="#94A3B8" font-size="12">Child rows store parent primary key as Foreign Key (<tspan fill="#60A5FA" font-weight="bold">FK</tspan>).</text>
    </g>

    <!-- Col 2: Column Badges & Data Types -->
    <g transform="translate(630, 445)">
      <rect x="0" y="0" width="600" height="385" rx="10" fill="#0B1120" stroke="#334155" stroke-width="1.4"/>
      <text x="22" y="32" fill="#E2E8F0" font-size="15" font-weight="700">Field Constraints &amp; Schema Notation:</text>

      <!-- PK Badge -->
      <rect x="22" y="62" width="48" height="20" rx="4" fill="#DC2626"/>
      <text x="46" y="76" fill="#FFFFFF" font-size="11" font-weight="900" text-anchor="middle">PK</text>
      <text x="82" y="77" fill="#E2E8F0" font-size="13">Primary Key (Unique row identifier, generated by DB sequence)</text>

      <!-- FK Badge -->
      <rect x="22" y="100" width="48" height="20" rx="4" fill="#2563EB"/>
      <text x="46" y="114" fill="#FFFFFF" font-size="11" font-weight="900" text-anchor="middle">FK</text>
      <text x="82" y="115" fill="#E2E8F0" font-size="13">Foreign Key (References target table PK with Referential Integrity)</text>

      <!-- UK Badge -->
      <rect x="22" y="138" width="48" height="20" rx="4" fill="#7C3AED"/>
      <text x="46" y="152" fill="#FFFFFF" font-size="11" font-weight="900" text-anchor="middle">UK</text>
      <text x="82" y="153" fill="#E2E8F0" font-size="13">Unique Key Constraint (Enforces uniqueness, prevents duplicates)</text>

      <!-- INDEX Badge -->
      <rect x="22" y="176" width="48" height="20" rx="4" fill="#0D9488"/>
      <text x="46" y="190" fill="#FFFFFF" font-size="10" font-weight="900" text-anchor="middle">INDEX</text>
      <text x="82" y="191" fill="#E2E8F0" font-size="13">Secondary B-Tree Index (Accelerates high-frequency lookups)</text>

      <!-- NOT NULL -->
      <text x="22" y="235" fill="#EF4444" font-size="17" font-weight="bold">*</text>
      <text x="38" y="234" fill="#F1F5F9" font-size="13" font-weight="600">NOT NULL Constraint (Mandatory field required at INSERT time)</text>

      <!-- Domain Color Key -->
      <text x="22" y="278" fill="#F8FAFC" font-size="13" font-weight="700">Relational Module Color Palette:</text>
      <g transform="translate(22, 298)">
        <circle cx="7" cy="10" r="7" fill="#38BDF8"/>
        <text x="22" y="15" fill="#E2E8F0" font-size="12">Auth &amp; Users</text>

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
        <text x="285" y="15" fill="#E2E8F0" font-size="12">System Specs</text>
      </g>
    </g>

    <!-- Section 3: Specialized Database Subsystems -->
    <rect x="0" y="870" width="1260" height="260" rx="12" fill="#131D31" stroke="#334155" stroke-width="1.8" />
    <text x="28" y="906" fill="#2DD4BF" font-size="17" font-weight="800" letter-spacing="1">BIOCHEMICAL &amp; AI INTEGRATED RELATIONS</text>
    
    <g transform="translate(30, 930)">
      <rect x="0" y="0" width="380" height="175" rx="10" fill="#0B1120" stroke="#0D9488" stroke-width="1.4"/>
      <text x="18" y="32" fill="#2DD4BF" font-size="14" font-weight="700">ICMR-NIN IFCT Food Code Join</text>
      <text x="18" y="58" fill="#94A3B8" font-size="12">Biochemical to Ayurvedic Mapping:</text>
      <text x="18" y="82" fill="#E2E8F0" font-size="12">• raw_food_composition.food_code (UK)</text>
      <text x="18" y="104" fill="#E2E8F0" font-size="12">• 1:1 join with ayurvedic_food_profiles</text>
      <text x="18" y="126" fill="#E2E8F0" font-size="12">• Eager-loaded during meal plan creation</text>
      <text x="18" y="154" fill="#34D399" font-size="12" font-weight="700">✓ NutritionDatasetService</text>
    </g>

    <g transform="translate(440, 930)">
      <rect x="0" y="0" width="380" height="175" rx="10" fill="#0B1120" stroke="#F59E0B" stroke-width="1.4"/>
      <text x="18" y="32" fill="#FBBF24" font-size="14" font-weight="700">Viruddha Self-Referential Graph</text>
      <text x="18" y="58" fill="#94A3B8" font-size="12">Binary Conflict Matrix:</text>
      <text x="18" y="82" fill="#E2E8F0" font-size="12">• food_a_id -> food_items.id</text>
      <text x="18" y="104" fill="#E2E8F0" font-size="12">• food_b_id -> food_items.id</text>
      <text x="18" y="126" fill="#E2E8F0" font-size="12">• Prevents toxic food pairing (Virya/Matra)</text>
      <text x="18" y="154" fill="#34D399" font-size="12" font-weight="700">✓ ViruddhaCheckerService</text>
    </g>

    <g transform="translate(850, 930)">
      <rect x="0" y="0" width="380" height="175" rx="10" fill="#0B1120" stroke="#4F46E5" stroke-width="1.4"/>
      <text x="18" y="32" fill="#818CF8" font-size="14" font-weight="700">ML Nutrient Intake Feedback</text>
      <text x="18" y="58" fill="#94A3B8" font-size="12">Predictive Health Analytics:</text>
      <text x="18" y="82" fill="#E2E8F0" font-size="12">• daily_health_logs consumed calories/iron</text>
      <text x="18" y="104" fill="#E2E8F0" font-size="12">• womens_health_logs wellness &amp; symptoms</text>
      <text x="18" y="126" fill="#E2E8F0" font-size="12">• ML Random Forest predicts deficiencies</text>
      <text x="18" y="154" fill="#34D399" font-size="12" font-weight="700">✓ MlDeficiencyPredictorService</text>
    </g>

    <!-- Section 4: Referential Integrity Code Snippet -->
    <rect x="0" y="1150" width="1260" height="310" rx="12" fill="#131D31" stroke="#334155" stroke-width="1.8" />
    <text x="28" y="1186" fill="#A78BFA" font-size="17" font-weight="800" letter-spacing="1">PRIMARY SQL FOREIGN KEY DEFINITIONS (DDL)</text>
    
    <g transform="translate(30, 1205)">
      <rect x="0" y="0" width="1200" height="230" rx="10" fill="#0B1120" stroke="#334155" stroke-width="1.4"/>
      
      <text x="24" y="32" fill="#38BDF8" font-size="12.5" font-family="monospace">ALTER TABLE user_profiles ADD CONSTRAINT fk_user_profile FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;</text>
      <text x="24" y="58" fill="#38BDF8" font-size="12.5" font-family="monospace">ALTER TABLE meal_plans ADD CONSTRAINT fk_meal_plan_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;</text>
      <text x="24" y="84" fill="#38BDF8" font-size="12.5" font-family="monospace">ALTER TABLE meal_plan_items ADD CONSTRAINT fk_item_plan FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE;</text>
      <text x="24" y="110" fill="#38BDF8" font-size="12.5" font-family="monospace">ALTER TABLE meal_plan_items ADD CONSTRAINT fk_item_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id);</text>
      <text x="24" y="136" fill="#38BDF8" font-size="12.5" font-family="monospace">ALTER TABLE meal_plan_items ADD CONSTRAINT fk_item_food FOREIGN KEY (food_item_id) REFERENCES food_items(id);</text>
      <text x="24" y="162" fill="#38BDF8" font-size="12.5" font-family="monospace">ALTER TABLE viruddha_combinations ADD CONSTRAINT fk_food_a FOREIGN KEY (food_a_id) REFERENCES food_items(id);</text>
      <text x="24" y="188" fill="#38BDF8" font-size="12.5" font-family="monospace">ALTER TABLE viruddha_combinations ADD CONSTRAINT fk_food_b FOREIGN KEY (food_b_id) REFERENCES food_items(id);</text>
      <text x="24" y="214" fill="#34D399" font-size="12.5" font-family="monospace">ALTER TABLE ayurvedic_food_profiles ADD CONSTRAINT fk_raw_food FOREIGN KEY (raw_food_id) REFERENCES raw_food_composition(id);</text>
    </g>
  </g>
`;

  svg += `
</svg>`;
  return svg;
}

// Generate the SVG file
const svgContent = generateSVG();
const outSvgPath = path.join(__dirname, 'ayurwell_er_diagram.svg');
fs.writeFileSync(outSvgPath, svgContent, 'utf8');
console.log(`Saved ERD SVG to ${outSvgPath}`);

// Generate the HTML preview file
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AyurWell - Comprehensive Database Entity-Relationship Diagram (ERD)</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #080c15;
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
      background-color: #080c15;
    }
    #viewport:active {
      cursor: grabbing;
    }
    #diagram-container {
      transform-origin: top left;
      transition: transform 0.1s ease-out;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.85);
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
        🗄️ AyurWell Entity-Relationship Diagram (ERD)
        <span class="badge">PostgreSQL / H2 DDL</span>
        <span class="badge" style="background:#1e3a8a; color:#60a5fa;">15 Tables • Crow’s Foot Notation</span>
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
      a.download = 'ayurwell_er_diagram.svg';
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
        ctx.fillStyle = '#080c15';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const pngURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngURL;
        a.download = 'ayurwell_er_diagram.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
      img.src = blobURL;
    }
  </script>
</body>
</html>`;

const outHtmlPath = path.join(__dirname, 'ayurwell_er_diagram.html');
fs.writeFileSync(outHtmlPath, htmlContent, 'utf8');
console.log(`Saved ERD HTML preview to ${outHtmlPath}`);

// Render PNG using Resvg
const { Resvg } = require('@resvg/resvg-js');
const resvg = new Resvg(svgContent, { fitTo: { mode: 'width', value: 3600 } });
const pngData = resvg.render();
const pngBuffer = pngData.asPng();
const outPngPath = path.join(__dirname, 'ayurwell_er_diagram.png');
fs.writeFileSync(outPngPath, pngBuffer);
console.log(`Saved ERD PNG (${pngBuffer.length} bytes) to ${outPngPath}`);

// Also copy both files to artifact directory
const artifactDir = 'C:\\Users\\dubey\\.gemini\\antigravity-ide\\brain\\4355294f-e04a-4d18-be9d-696a72e71e5d';
if (fs.existsSync(artifactDir)) {
  fs.writeFileSync(path.join(artifactDir, 'ayurwell_er_diagram.svg'), svgContent, 'utf8');
  fs.writeFileSync(path.join(artifactDir, 'ayurwell_er_diagram.png'), pngBuffer);
  console.log(`Copied ERD PNG and SVG to artifact directory ${artifactDir}`);
}
