const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

// Canvas Dimensions - 2 Wide High-Legibility Columns
const W = 3200;
const H = 4380;
const cardW = 1440;
const rowH = 38;

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Balanced 2-Column Distribution (8 tables in Col 1, 7 tables in Col 2)
const columnsData = [
  // COLUMN 1 (Left)
  {
    x: 80,
    tables: [
      {
        name: 'users',
        domain: 'AUTHENTICATION & SECURITY',
        columns: [
          { name: 'id', type: 'BIGINT', constraint: 'PK', def: 'IDENTITY', desc: 'Unique internal user ID' },
          { name: 'email', type: 'VARCHAR(255)', constraint: 'UK, NN', def: '—', desc: 'Login email address (Unique)' },
          { name: 'password', type: 'VARCHAR(255)', constraint: 'NN', def: '—', desc: 'BCrypt hashed password string' },
          { name: 'full_name', type: 'VARCHAR(255)', constraint: 'NN', def: '—', desc: 'Legal / full display name' },
          { name: 'role', type: 'VARCHAR(50)', constraint: 'NN', def: "'ROLE_USER'", desc: 'ROLE_USER / ROLE_ADMIN' },
          { name: 'active', type: 'BOOLEAN', constraint: 'NN', def: 'TRUE', desc: 'Account active toggle flag' },
          { name: 'email_verified', type: 'BOOLEAN', constraint: 'NN', def: 'FALSE', desc: 'OTP verification confirmed' },
          { name: 'created_at', type: 'TIMESTAMP', constraint: 'NN', def: 'CURRENT_TS', desc: 'Account registration time' }
        ]
      },
      {
        name: 'user_profiles',
        domain: 'PROFILE & PRAKRITI BASELINE',
        columns: [
          { name: 'id', type: 'BIGINT', constraint: 'PK', def: 'IDENTITY', desc: 'Profile unique record ID' },
          { name: 'user_id', type: 'BIGINT', constraint: 'FK, UK, NN', def: '—', desc: 'users(id) [1:1, CASCADE]' },
          { name: 'age', type: 'INTEGER', constraint: 'NULL', def: '—', desc: 'User completed age in years' },
          { name: 'gender', type: 'VARCHAR(20)', constraint: 'NULL', def: '—', desc: 'Male, Female, Other' },
          { name: 'weight_kg', type: 'DOUBLE PRECISION', constraint: 'NULL', def: '—', desc: 'Body weight in kilograms' },
          { name: 'height_cm', type: 'DOUBLE PRECISION', constraint: 'NULL', def: '—', desc: 'Height in centimeters' },
          { name: 'activity_level', type: 'VARCHAR(50)', constraint: 'NULL', def: '—', desc: 'Sedentary, Light, Moderate, Active' },
          { name: 'budget_per_day_inr', type: 'DOUBLE PRECISION', constraint: 'NULL', def: '150.00', desc: 'Max daily food spend (INR)' },
          { name: 'primary_health_goal', type: 'VARCHAR(100)', constraint: 'NULL', def: '—', desc: 'Weight Loss, Immunity, Digestion' },
          { name: 'primary_dosha', type: 'VARCHAR(50)', constraint: 'NULL', def: '—', desc: 'VATA, PITTA, KAPHA, TRIDOSHA' },
          { name: 'digestive_fire_agni', type: 'VARCHAR(50)', constraint: 'NULL', def: '—', desc: 'SAMA, VISHAMA, TIKSHNA, MANDA' },
          { name: 'target_disease_condition', type: 'VARCHAR(100)', constraint: 'NULL', def: "'None'", desc: 'Diabetes, Hypertension, GERD, IBS' },
          { name: 'profile_completed', type: 'BOOLEAN', constraint: 'NN', def: 'FALSE', desc: 'Onboarding completion flag' }
        ]
      },
      {
        name: 'email_otps',
        domain: 'SECURITY & VERIFICATION',
        columns: [
          { name: 'id', type: 'BIGINT', constraint: 'PK', def: 'IDENTITY', desc: 'OTP transaction identifier' },
          { name: 'email', type: 'VARCHAR(255)', constraint: 'NN', def: '—', desc: 'Target recipient email address' },
          { name: 'otp_hash', type: 'VARCHAR(255)', constraint: 'NN', def: '—', desc: 'SHA-256 hashed 6-digit OTP' },
          { name: 'expires_at', type: 'TIMESTAMP', constraint: 'NN', def: '—', desc: '10-minute expiration timestamp' },
          { name: 'verified', type: 'BOOLEAN', constraint: 'NN', def: 'FALSE', desc: 'Token consumed / verified flag' },
          { name: 'attempts', type: 'INTEGER', constraint: 'NN', def: '0', desc: 'Failed attempt counter (brute force)' },
          { name: 'created_at', type: 'TIMESTAMP', constraint: 'NN', def: 'CURRENT_TS', desc: 'OTP dispatch timestamp' }
        ]
      },
      {
        name: 'dosha_assessments',
        domain: 'PRAKRITI DIAGNOSTICS',
        columns: [
          { name: 'id', type: 'BIGINT', constraint: 'PK', def: 'IDENTITY', desc: 'Assessment log identifier' },
          { name: 'user_id', type: 'BIGINT', constraint: 'FK, NN', def: '—', desc: 'users(id) [1:N, CASCADE]' },
          { name: 'vata_score', type: 'INTEGER', constraint: 'NN', def: '0', desc: 'Calculated Vata score / percentage' },
          { name: 'pitta_score', type: 'INTEGER', constraint: 'NN', def: '0', desc: 'Calculated Pitta score / percentage' },
          { name: 'kapha_score', type: 'INTEGER', constraint: 'NN', def: '0', desc: 'Calculated Kapha score / percentage' },
          { name: 'primary_prakriti', type: 'VARCHAR(50)', constraint: 'NN', def: '—', desc: 'Dominant constitution outcome' },
          { name: 'secondary_prakriti', type: 'VARCHAR(50)', constraint: 'NULL', def: '—', desc: 'Secondary dosha (Dwandwaja)' },
          { name: 'assessed_at', type: 'TIMESTAMP', constraint: 'NN', def: 'CURRENT_TS', desc: 'Assessment completion timestamp' }
        ]
      },
      {
        name: 'meal_plans',
        domain: 'DIET PLANNING ENGINE',
        columns: [
          { name: 'id', type: 'BIGINT', constraint: 'PK', def: 'IDENTITY', desc: 'Meal plan master identifier' },
          { name: 'user_id', type: 'BIGINT', constraint: 'FK, NN', def: '—', desc: 'users(id) [1:N, CASCADE]' },
          { name: 'plan_name', type: 'VARCHAR(255)', constraint: 'NN', def: '—', desc: 'Title of customized diet plan' },
          { name: 'target_disease', type: 'VARCHAR(100)', constraint: 'NULL', def: '—', desc: 'Managed disease condition' },
          { name: 'season', type: 'VARCHAR(50)', constraint: 'NULL', def: '—', desc: 'Ayurvedic Ritu (Grishma, Sharad, etc.)' },
          { name: 'womens_health_stage', type: 'VARCHAR(50)', constraint: 'NULL', def: '—', desc: 'Maternal or menstrual stage' },
          { name: 'total_daily_budget_inr', type: 'DOUBLE PRECISION', constraint: 'NULL', def: '—', desc: 'Calculated total cost per day (INR)' },
          { name: 'total_daily_calories', type: 'DOUBLE PRECISION', constraint: 'NULL', def: '—', desc: 'Sum of daily calories (kcal)' },
          { name: 'ayurvedic_nutrition_score', type: 'INTEGER', constraint: 'NULL', def: '—', desc: 'Compliance rating (0 to 100)' },
          { name: 'created_at', type: 'TIMESTAMP', constraint: 'NN', def: 'CURRENT_TS', desc: 'Plan generation timestamp' }
        ]
      },
      {
        name: 'meal_plan_items',
        domain: 'DIET PLANNING ENGINE',
        columns: [
          { name: 'id', type: 'BIGINT', constraint: 'PK', def: 'IDENTITY', desc: 'Meal schedule slot identifier' },
          { name: 'meal_plan_id', type: 'BIGINT', constraint: 'FK, NN', def: '—', desc: 'meal_plans(id) [CASCADE]' },
          { name: 'meal_type', type: 'VARCHAR(50)', constraint: 'NN', def: '—', desc: 'BREAKFAST, LUNCH, DINNER, SNACK' },
          { name: 'day_of_week', type: 'VARCHAR(50)', constraint: 'NN', def: '—', desc: 'Monday, Tuesday, Wednesday, etc.' },
          { name: 'recipe_id', type: 'BIGINT', constraint: 'FK', def: 'NULL', desc: 'recipes(id) [SET NULL]' },
          { name: 'food_item_id', type: 'BIGINT', constraint: 'FK', def: 'NULL', desc: 'food_items(id) [SET NULL]' },
          { name: 'portion_grams', type: 'DOUBLE PRECISION', constraint: 'NULL', def: '—', desc: 'Recommended serving weight in grams' },
          { name: 'item_cost_inr', type: 'DOUBLE PRECISION', constraint: 'NULL', def: '—', desc: 'Portion cost in INR' },
          { name: 'item_calories', type: 'DOUBLE PRECISION', constraint: 'NULL', def: '—', desc: 'Portion caloric energy (kcal)' }
        ]
      },
      {
        name: 'viruddha_combinations',
        domain: 'VIRUDDHA AHARA (TOXIC PAIRING)',
        columns: [
          { name: 'id', type: 'BIGINT', constraint: 'PK', def: 'IDENTITY', desc: 'Rule matrix record ID' },
          { name: 'food_a_id', type: 'BIGINT', constraint: 'FK, NN', def: '—', desc: 'food_items(id) [CASCADE]' },
          { name: 'food_b_id', type: 'BIGINT', constraint: 'FK, NN', def: '—', desc: 'food_items(id) [CASCADE]' },
          { name: 'incompatibility_type', type: 'VARCHAR(100)', constraint: 'NN', def: '—', desc: 'Virya, Rasa, Samskara Viruddha' },
          { name: 'health_hazard_reason', type: 'VARCHAR(500)', constraint: 'NN', def: '—', desc: 'Physiological pathology / toxin cause' },
          { name: 'antidote_recommendation', type: 'VARCHAR(500)', constraint: 'NULL', def: '—', desc: 'Corrective Ayurvedic antidote herb' }
        ]
      },
      {
        name: 'daily_health_logs',
        domain: 'DINACHARYA & LIFESTYLE TRACKING',
        columns: [
          { name: 'id', type: 'BIGINT', constraint: 'PK', def: 'IDENTITY', desc: 'Daily log entry ID' },
          { name: 'user_id', type: 'BIGINT', constraint: 'FK, NN', def: '—', desc: 'users(id) [1:N, CASCADE]' },
          { name: 'log_date', type: 'DATE', constraint: 'NN', def: '—', desc: 'Calendar date of observation' },
          { name: 'calories_consumed', type: 'DOUBLE PRECISION', constraint: 'NULL', def: '—', desc: 'Total caloric intake consumed' },
          { name: 'water_intake_liters', type: 'DOUBLE PRECISION', constraint: 'NULL', def: '—', desc: 'Hydration volume in liters' },
          { name: 'energy_level_rating', type: 'INTEGER', constraint: 'NULL', def: '—', desc: 'Vitality self-rating (1 to 10)' },
          { name: 'digestion_quality_rating', type: 'INTEGER', constraint: 'NULL', def: '—', desc: 'Agni status rating (1 to 10)' },
          { name: 'ayur_score_today', type: 'INTEGER', constraint: 'NULL', def: '—', desc: 'Calculated holistic score (0-100)' },
          { name: 'iron_intake_mg', type: 'DOUBLE PRECISION', constraint: 'NULL', def: '—', desc: 'Total iron consumed (mg)' },
          { name: 'calcium_intake_mg', type: 'DOUBLE PRECISION', constraint: 'NULL', def: '—', desc: 'Total calcium consumed (mg)' },
          { name: 'protein_intake_grams', type: 'DOUBLE PRECISION', constraint: 'NULL', def: '—', desc: 'Total protein consumed (g)' }
        ]
      },
      {
        name: 'reminders',
        domain: 'DINACHARYA & HABIT TIMERS',
        columns: [
          { name: 'id', type: 'BIGINT', constraint: 'PK', def: 'IDENTITY', desc: 'Reminder schedule identifier' },
          { name: 'user_id', type: 'BIGINT', constraint: 'FK, NN', def: '—', desc: 'users(id) [1:N, CASCADE]' },
          { name: 'title', type: 'VARCHAR(255)', constraint: 'NN', def: '—', desc: 'Headline (e.g. Brahma Muhurta)' },
          { name: 'reminder_time', type: 'TIME', constraint: 'NN', def: '—', desc: 'Clock trigger time (e.g. 06:00:00)' },
          { name: 'category', type: 'VARCHAR(50)', constraint: 'NN', def: '—', desc: 'HERB, WATER, MEAL, ROUTINE' },
          { name: 'description', type: 'VARCHAR(500)', constraint: 'NULL', def: '—', desc: 'Herbal advice / lifestyle notes' },
          { name: 'enabled', type: 'BOOLEAN', constraint: 'NN', def: 'TRUE', desc: 'Active notification toggle' }
        ]
      }
    ]
  },

  // COLUMN 2 (Right)
  {
    x: 1680,
    tables: [
      {
        name: 'recipes',
        domain: 'AYURVEDIC CULINARY CATALOG',
        columns: [
          { name: 'id', type: 'BIGINT', constraint: 'PK', def: 'IDENTITY', desc: 'Recipe catalog identifier' },
          { name: 'title', type: 'VARCHAR(255)', constraint: 'NN', def: '—', desc: 'Culinary preparation title' },
          { name: 'description', type: 'VARCHAR(1000)', constraint: 'NULL', def: '—', desc: 'Therapeutic and taste summary' },
          { name: 'meal_type', type: 'VARCHAR(50)', constraint: 'NULL', def: '—', desc: 'Meal category (Breakfast, Lunch)' },
          { name: 'suitable_dosha', type: 'VARCHAR(50)', constraint: 'NULL', def: '—', desc: 'Vata, Pitta, Kapha, Tridoshic' },
          { name: 'suitable_season', type: 'VARCHAR(50)', constraint: 'NULL', def: '—', desc: 'Ayurvedic seasonal suitability' },
          { name: 'prep_time_mins', type: 'INTEGER', constraint: 'NULL', def: '—', desc: 'Preparation time in minutes' },
          { name: 'cost_per_serving_inr', type: 'DOUBLE PRECISION', constraint: 'NULL', def: '—', desc: 'Cost per portion in INR' },
          { name: 'calories', type: 'DOUBLE PRECISION', constraint: 'NULL', def: '—', desc: 'Energy per serving (kcal)' },
          { name: 'protein_grams', type: 'DOUBLE PRECISION', constraint: 'NULL', def: '—', desc: 'Protein content in grams' },
          { name: 'carbs_grams', type: 'DOUBLE PRECISION', constraint: 'NULL', def: '—', desc: 'Carbohydrates in grams' },
          { name: 'fat_grams', type: 'DOUBLE PRECISION', constraint: 'NULL', def: '—', desc: 'Total lipids in grams' },
          { name: 'iron_mg', type: 'DOUBLE PRECISION', constraint: 'NULL', def: '—', desc: 'Iron content in milligrams' },
          { name: 'instructions', type: 'TEXT', constraint: 'NULL', def: '—', desc: 'Step-by-step preparation steps' },
          { name: 'suitable_disease_conditions', type: 'VARCHAR(255)', constraint: 'NULL', def: '—', desc: 'Therapeutic disease indications' },
          { name: 'suitable_womens_health_stage', type: 'VARCHAR(255)', constraint: 'NULL', def: '—', desc: 'Maternal stage appropriateness' }
        ]
      },
      {
        name: 'food_items',
        domain: 'INGREDIENTS & ENERGETICS',
        columns: [
          { name: 'id', type: 'BIGINT', constraint: 'PK', def: 'IDENTITY', desc: 'Food ingredient identifier' },
          { name: 'name', type: 'VARCHAR(255)', constraint: 'UK, NN', def: '—', desc: 'Unique ingredient / food name' },
          { name: 'category', type: 'VARCHAR(100)', constraint: 'NULL', def: '—', desc: 'Dairy, Grains, Fruits, Spices' },
          { name: 'rasa', type: 'VARCHAR(100)', constraint: 'NULL', def: '—', desc: '6 Tastes (Madhura, Amla, etc.)' },
          { name: 'virya', type: 'VARCHAR(50)', constraint: 'NULL', def: '—', desc: 'Sheetala (Cold) / Ushna (Hot)' },
          { name: 'vipaka', type: 'VARCHAR(50)', constraint: 'NULL', def: '—', desc: 'Post-digestive effect' },
          { name: 'dosha_effect', type: 'VARCHAR(100)', constraint: 'NULL', def: '—', desc: 'Action on Tridoshas (V-/P+/K=)' },
          { name: 'calories', type: 'DOUBLE PRECISION', constraint: 'NULL', def: '—', desc: 'Energy per 100g (kcal)' },
          { name: 'protein_grams', type: 'DOUBLE PRECISION', constraint: 'NULL', def: '—', desc: 'Protein per 100g (g)' },
          { name: 'carbs_grams', type: 'DOUBLE PRECISION', constraint: 'NULL', def: '—', desc: 'Carbohydrates per 100g (g)' },
          { name: 'fat_grams', type: 'DOUBLE PRECISION', constraint: 'NULL', def: '—', desc: 'Lipids per 100g (g)' },
          { name: 'iron_mg', type: 'DOUBLE PRECISION', constraint: 'NULL', def: '—', desc: 'Iron content per 100g (mg)' },
          { name: 'calcium_mg', type: 'DOUBLE PRECISION', constraint: 'NULL', def: '—', desc: 'Calcium per 100g (mg)' },
          { name: 'fiber_grams', type: 'DOUBLE PRECISION', constraint: 'NULL', def: '—', desc: 'Dietary fiber per 100g (g)' },
          { name: 'estimated_cost_inr', type: 'DOUBLE PRECISION', constraint: 'NULL', def: '—', desc: 'Retail market price per 100g' }
        ]
      },
      {
        name: 'raw_food_composition',
        domain: 'ICMR-NIN IFCT 2017 DATASET',
        columns: [
          { name: 'id', type: 'BIGINT', constraint: 'PK', def: 'IDENTITY', desc: 'Scientific entry identifier' },
          { name: 'food_code', type: 'VARCHAR(50)', constraint: 'UK, NN', def: '—', desc: 'Official ICMR-NIN IFCT code' },
          { name: 'food_name', type: 'VARCHAR(255)', constraint: 'NN', def: '—', desc: 'Scientific and common designation' },
          { name: 'category', type: 'VARCHAR(100)', constraint: 'NN', def: '—', desc: 'Food classification category' },
          { name: 'dataset_source', type: 'VARCHAR(255)', constraint: 'NN', def: "'IFCT 2017'", desc: 'Citation of dataset publication' },
          { name: 'serving_size', type: 'VARCHAR(50)', constraint: 'NN', def: "'100g'", desc: 'Standard measurement portion' },
          { name: 'energy_kcal', type: 'DOUBLE PRECISION', constraint: 'NN', def: '0.0', desc: 'Energy value in kcal' },
          { name: 'protein_grams', type: 'DOUBLE PRECISION', constraint: 'NN', def: '0.0', desc: 'Protein content in grams' },
          { name: 'carbs_grams', type: 'DOUBLE PRECISION', constraint: 'NN', def: '0.0', desc: 'Available carbohydrates (g)' },
          { name: 'fat_grams', type: 'DOUBLE PRECISION', constraint: 'NN', def: '0.0', desc: 'Total lipids in grams' },
          { name: 'fiber_grams', type: 'DOUBLE PRECISION', constraint: 'NN', def: '0.0', desc: 'Total dietary fiber in grams' },
          { name: 'iron_mg', type: 'DOUBLE PRECISION', constraint: 'NN', def: '0.0', desc: 'Total iron in milligrams' },
          { name: 'calcium_mg', type: 'DOUBLE PRECISION', constraint: 'NN', def: '0.0', desc: 'Total calcium in milligrams' },
          { name: 'vitamin_b12_mcg', type: 'DOUBLE PRECISION', constraint: 'NN', def: '0.0', desc: 'Vitamin B12 in micrograms' },
          { name: 'vitamin_d_iu', type: 'DOUBLE PRECISION', constraint: 'NN', def: '0.0', desc: 'Vitamin D in IU' },
          { name: 'folate_mcg', type: 'DOUBLE PRECISION', constraint: 'NN', def: '0.0', desc: 'Folate (Vitamin B9) in mcg' },
          { name: 'vitamin_c_mg', type: 'DOUBLE PRECISION', constraint: 'NN', def: '0.0', desc: 'Vitamin C in milligrams' }
        ]
      },
      {
        name: 'ayurvedic_food_profiles',
        domain: 'DRAVYAGUNA BIOCHEMICAL BRIDGE',
        columns: [
          { name: 'id', type: 'BIGINT', constraint: 'PK', def: 'IDENTITY', desc: 'Ayurvedic profile identifier' },
          { name: 'raw_food_id', type: 'BIGINT', constraint: 'FK, UK, NN', def: '—', desc: 'raw_food_comp(id) [1:1, CASCADE]' },
          { name: 'sanskrit_name', type: 'VARCHAR(255)', constraint: 'NULL', def: '—', desc: 'Classical Sanskrit botanical name' },
          { name: 'rasa', type: 'VARCHAR(100)', constraint: 'NN', def: '—', desc: '6 Tastes (Madhura, Tikta, etc.)' },
          { name: 'virya', type: 'VARCHAR(50)', constraint: 'NN', def: '—', desc: 'Thermal potency (Sheetala / Ushna)' },
          { name: 'vipaka', type: 'VARCHAR(50)', constraint: 'NN', def: '—', desc: 'Post-digestive outcome' },
          { name: 'dosha_effect', type: 'VARCHAR(100)', constraint: 'NN', def: '—', desc: 'Tridosha dynamic actions' },
          { name: 'suitable_ritu_seasons', type: 'VARCHAR(255)', constraint: 'NULL', def: '—', desc: 'Seasonal compatibility (Ritus)' },
          { name: 'classical_text_reference', type: 'VARCHAR(255)', constraint: 'NULL', def: '—', desc: 'Charaka / Sushruta Samhita reference' }
        ]
      },
      {
        name: 'womens_health_profiles',
        domain: 'STREE SWASTHYA (WOMEN HEALTH)',
        columns: [
          { name: 'id', type: 'BIGINT', constraint: 'PK', def: 'IDENTITY', desc: 'Specialized profile identifier' },
          { name: 'user_id', type: 'BIGINT', constraint: 'FK, UK, NN', def: '—', desc: 'users(id) [1:1, CASCADE]' },
          { name: 'health_stage', type: 'VARCHAR(50)', constraint: 'NN', def: "'GENERAL'", desc: 'MENSTRUAL, PREGNANCY, MENOPAUSE' },
          { name: 'pregnancy_trimester', type: 'INTEGER', constraint: 'NULL', def: '—', desc: 'Active trimester (1, 2, or 3)' },
          { name: 'cycle_phase', type: 'VARCHAR(50)', constraint: 'NULL', def: '—', desc: 'Follicular, Luteal, Menstrual' },
          { name: 'reported_symptoms', type: 'VARCHAR(500)', constraint: 'NULL', def: '—', desc: 'Comma-separated symptom tags' },
          { name: 'last_period_date', type: 'DATE', constraint: 'NULL', def: '—', desc: 'Most recent cycle start date' },
          { name: 'cycle_length_days', type: 'INTEGER', constraint: 'NN', def: '28', desc: 'Average cycle duration in days' },
          { name: 'period_duration_days', type: 'INTEGER', constraint: 'NN', def: '5', desc: 'Average bleeding duration in days' },
          { name: 'flow_level', type: 'VARCHAR(50)', constraint: 'NULL', def: '—', desc: 'Light, Medium, Heavy, Spotting' },
          { name: 'cramps_severity', type: 'VARCHAR(50)', constraint: 'NULL', def: '—', desc: 'None, Mild, Moderate, Severe' },
          { name: 'mood', type: 'VARCHAR(50)', constraint: 'NULL', def: '—', desc: 'Balanced, Irritable, Anxious' },
          { name: 'energy_level', type: 'VARCHAR(50)', constraint: 'NULL', def: '—', desc: 'Daily vitality rating' },
          { name: 'menopause_symptoms', type: 'VARCHAR(500)', constraint: 'NULL', def: '—', desc: 'Hot Flashes, Night Sweats' },
          { name: 'hot_flash_frequency', type: 'INTEGER', constraint: 'NULL', def: '0', desc: 'Recorded hot flashes per day' },
          { name: 'sleep_quality_rating', type: 'INTEGER', constraint: 'NULL', def: '—', desc: 'Sleep score (1 to 10 scale)' },
          { name: 'daily_iron_target_mg', type: 'DOUBLE PRECISION', constraint: 'NN', def: '18.0', desc: 'RDA iron requirement target' },
          { name: 'daily_iron_intake_mg', type: 'DOUBLE PRECISION', constraint: 'NULL', def: '0.0', desc: 'Actual consumed iron for the day' }
        ]
      },
      {
        name: 'womens_health_logs',
        domain: 'STREE SWASTHYA (WOMEN HEALTH)',
        columns: [
          { name: 'id', type: 'BIGINT', constraint: 'PK', def: 'IDENTITY', desc: 'Symptom log record identifier' },
          { name: 'user_id', type: 'BIGINT', constraint: 'FK, NN', def: '—', desc: 'users(id) [1:N, CASCADE]' },
          { name: 'log_date', type: 'DATE', constraint: 'NN', def: '—', desc: 'Calendar date of logged entry' },
          { name: 'log_type', type: 'VARCHAR(50)', constraint: 'NULL', def: '—', desc: 'CYCLE, PREGNANCY, SYMPTOM' },
          { name: 'flow_level', type: 'VARCHAR(50)', constraint: 'NULL', def: '—', desc: 'Observed menstrual flow' },
          { name: 'cramps_severity', type: 'VARCHAR(50)', constraint: 'NULL', def: '—', desc: 'Pain intensity on this date' },
          { name: 'mood', type: 'VARCHAR(50)', constraint: 'NULL', def: '—', desc: 'Emotional state on this date' },
          { name: 'energy', type: 'VARCHAR(50)', constraint: 'NULL', def: '—', desc: 'Energy level rating on this date' },
          { name: 'symptoms', type: 'VARCHAR(500)', constraint: 'NULL', def: '—', desc: 'Observed clinical symptoms' },
          { name: 'iron_intake_mg', type: 'DOUBLE PRECISION', constraint: 'NULL', def: '—', desc: 'Total iron consumed (mg)' },
          { name: 'water_intake_l', type: 'DOUBLE PRECISION', constraint: 'NULL', def: '—', desc: 'Water consumed in liters' },
          { name: 'sleep_hours', type: 'INTEGER', constraint: 'NULL', def: '—', desc: 'Total hours slept' },
          { name: 'wellness_score', type: 'INTEGER', constraint: 'NULL', def: '—', desc: 'Daily aggregate score (0 to 100)' },
          { name: 'notes', type: 'TEXT', constraint: 'NULL', def: '—', desc: 'Subjective user observations' }
        ]
      }
    ]
  }
];

// Helper to render high-contrast constraint badges
function renderConstraintBadges(constraintStr, x, y) {
  const parts = constraintStr.split(',').map(s => s.trim());
  let output = '';
  let curX = x;
  for (const p of parts) {
    let bg = '#e2e8f0';
    let text = '#475569';
    let label = p;

    if (p === 'PK') {
      bg = '#fee2e2'; text = '#b91c1c';
    } else if (p === 'FK') {
      bg = '#dbeafe'; text = '#1d4ed8';
    } else if (p === 'UK') {
      bg = '#d1fae5'; text = '#047857';
    } else if (p === 'NN') {
      bg = '#fef3c7'; text = '#b45309'; label = 'NOT NULL';
    } else if (p === 'NULL') {
      bg = '#f1f5f9'; text = '#64748b'; label = 'NULL';
    }

    const badgeW = label.length * 8.5 + 14;
    output += `
      <rect x="${curX}" y="${y - 15}" width="${badgeW}" height="24" rx="4" fill="${bg}" />
      <text x="${curX + badgeW / 2}" y="${y + 2}" font-family="'Consolas', 'Menlo', monospace" font-size="12" font-weight="bold" fill="${text}" text-anchor="middle">${label}</text>
    `;
    curX += badgeW + 6;
  }
  return output;
}

let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<style>
  text { user-select: none; }
  .title-text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
  .mono { font-family: 'Consolas', 'SFMono-Regular', 'Menlo', monospace; }
</style>

<!-- Solid Clean Background -->
<rect width="${W}" height="${H}" fill="#F1F5F9" />

<!-- Top Header Hero -->
<rect x="0" y="0" width="${W}" height="140" fill="#0F172A" />
<text x="80" y="65" class="title-text" font-size="36" font-weight="bold" fill="#FFFFFF">AYURWELL HEALTHCARE PLATFORM — DATABASE TABLE DESIGN SPECIFICATION</text>
<text x="80" y="105" class="title-text" font-size="19" fill="#94A3B8">Relational Schema &amp; Data Dictionary • 15 Production Tables • Complete Column Types, Constraints, Defaults &amp; Foreign Keys</text>

<!-- Header Key Legend -->
<g id="header_legend">
  <rect x="${W - 860}" y="35" width="780" height="70" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1.5" />
  <text x="${W - 835}" y="77" class="title-text" font-size="15" font-weight="bold" fill="#CBD5E1">KEY:</text>
  
  <rect x="${W - 775}" y="53" width="38" height="26" rx="4" fill="#FEE2E2" />
  <text x="${W - 756}" y="71" class="mono" font-size="13" font-weight="bold" fill="#B91C1C" text-anchor="middle">PK</text>
  <text x="${W - 725}" y="72" class="title-text" font-size="14" fill="#E2E8F0">Primary Key</text>

  <rect x="${W - 615}" y="53" width="38" height="26" rx="4" fill="#DBEAFE" />
  <text x="${W - 596}" y="71" class="mono" font-size="13" font-weight="bold" fill="#1D4ED8" text-anchor="middle">FK</text>
  <text x="${W - 565}" y="72" class="title-text" font-size="14" fill="#E2E8F0">Foreign Key</text>

  <rect x="${W - 455}" y="53" width="38" height="26" rx="4" fill="#D1FAE5" />
  <text x="${W - 436}" y="71" class="mono" font-size="13" font-weight="bold" fill="#047857" text-anchor="middle">UK</text>
  <text x="${W - 405}" y="72" class="title-text" font-size="14" fill="#E2E8F0">Unique Key</text>

  <rect x="${W - 305}" y="53" width="76" height="26" rx="4" fill="#FEF3C7" />
  <text x="${W - 267}" y="71" class="mono" font-size="12" font-weight="bold" fill="#B45309" text-anchor="middle">NOT NULL</text>
  <text x="${W - 215}" y="72" class="title-text" font-size="14" fill="#E2E8F0">Required</text>
</g>
`;

// Render Tables in 2 Wide Columns
for (const col of columnsData) {
  let curY = 175;

  for (const t of col.tables) {
    const tableH = 88 + t.columns.length * rowH;

    svg += `
    <!-- TABLE: ${t.name} -->
    <g id="table_${t.name}">
      <!-- Outer Card Container with clean shadow border -->
      <rect x="${col.x}" y="${curY}" width="${cardW}" height="${tableH}" rx="10" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2" />

      <!-- Table Header Bar -->
      <path d="M ${col.x},${curY + 10} A 10 10 0 0 1 ${col.x + 10},${curY} L ${col.x + cardW - 10},${curY} A 10 10 0 0 1 ${col.x + cardW},${curY + 10} L ${col.x + cardW},${curY + 50} L ${col.x},${curY + 50} Z" fill="#0F172A" />
      <text x="${col.x + 22}" y="${curY + 33}" class="mono" font-size="21" font-weight="bold" fill="#FFFFFF">${t.name}</text>
      
      <!-- Domain Pill on Header Right -->
      <rect x="${col.x + cardW - 320}" y="${curY + 12}" width="300" height="26" rx="13" fill="#1E293B" stroke="#334155" />
      <text x="${col.x + cardW - 170}" y="${curY + 30}" class="title-text" font-size="12" font-weight="bold" fill="#60A5FA" text-anchor="middle">${escapeXml(t.domain)}</text>

      <!-- Table Column Headers Bar -->
      <rect x="${col.x}" y="${curY + 50}" width="${cardW}" height="38" fill="#E2E8F0" />
      <line x1="${col.x}" y1="${curY + 88}" x2="${col.x + cardW}" y2="${curY + 88}" stroke="#CBD5E1" stroke-width="1.5" />

      <text x="${col.x + 22}" y="${curY + 74}" class="title-text" font-size="14" font-weight="bold" fill="#334155">COLUMN NAME</text>
      <text x="${col.x + 360}" y="${curY + 74}" class="title-text" font-size="14" font-weight="bold" fill="#334155">DATA TYPE</text>
      <text x="${col.x + 640}" y="${curY + 74}" class="title-text" font-size="14" font-weight="bold" fill="#334155">CONSTRAINTS</text>
      <text x="${col.x + 890}" y="${curY + 74}" class="title-text" font-size="14" font-weight="bold" fill="#334155">DEFAULT</text>
      <text x="${col.x + 1080}" y="${curY + 74}" class="title-text" font-size="14" font-weight="bold" fill="#334155">REFERENCES / PURPOSE</text>
    `;

    // Render Data Rows
    let rY = curY + 88;
    for (let i = 0; i < t.columns.length; i++) {
      const c = t.columns[i];
      const bg = (i % 2 === 1) ? '#F8FAFC' : '#FFFFFF';

      svg += `
      <rect x="${col.x}" y="${rY}" width="${cardW}" height="${rowH}" fill="${bg}" />
      <line x1="${col.x}" y1="${rY + rowH}" x2="${col.x + cardW}" y2="${rY + rowH}" stroke="#F1F5F9" stroke-width="1.2" />

      <!-- Column Name -->
      <text x="${col.x + 22}" y="${rY + 24}" class="mono" font-size="16" font-weight="bold" fill="#0F172A">${escapeXml(c.name)}</text>

      <!-- Data Type -->
      <text x="${col.x + 360}" y="${rY + 24}" class="mono" font-size="15" font-weight="600" fill="#0284C7">${escapeXml(c.type)}</text>

      <!-- Constraints -->
      ${renderConstraintBadges(c.constraint, col.x + 640, rY + 20)}

      <!-- Default Value -->
      <text x="${col.x + 890}" y="${rY + 24}" class="mono" font-size="14" fill="#475569">${escapeXml(c.def)}</text>

      <!-- References / Description -->
      <text x="${col.x + 1080}" y="${rY + 24}" class="title-text" font-size="14" font-weight="500" fill="#1E293B">${escapeXml(c.desc)}</text>
      `;

      rY += rowH;
    }

    svg += `    </g>\n`;
    curY += tableH + 30; // 30px gap between tables
  }
}

// Bottom Footer Banner
svg += `
<rect x="0" y="${H - 65}" width="${W}" height="65" fill="#0F172A" />
<text x="80" y="${H - 26}" class="title-text" font-size="16" fill="#94A3B8">AyurWell Healthcare Platform • Relational Data Model (BCNF / 3NF) • PostgreSQL 15+ &amp; H2 Database Compatible</text>
<text x="${W - 80}" y="${H - 26}" class="title-text" font-size="16" font-weight="bold" fill="#38BDF8" text-anchor="end">15 Relational Tables • ACID Compliant • Full Foreign Key Integrity</text>
</svg>
`;

// Save SVG and render high-res PNG
const outSvg = path.join(__dirname, 'ayurwell_table_design.svg');
const outPng = path.join(__dirname, 'ayurwell_table_design.png');

fs.writeFileSync(outSvg, svg, 'utf8');
console.log(`Saved Table Design SVG to ${outSvg}`);

try {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 3600 }
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  fs.writeFileSync(outPng, pngBuffer);
  console.log(`Rendered High-Resolution PNG (${pngBuffer.length} bytes) to ${outPng}`);

  // Copy to Downloads & Desktop
  const downloadsPath = path.join('C:', 'Users', 'dubey', 'Downloads', 'AyurWell_Table_Design.png');
  const desktopPath = path.join('C:', 'Users', 'dubey', 'Desktop', 'AyurWell_Table_Design.png');
  const downloadsSvg = path.join('C:', 'Users', 'dubey', 'Downloads', 'AyurWell_Table_Design.svg');
  
  fs.writeFileSync(downloadsPath, pngBuffer);
  fs.writeFileSync(desktopPath, pngBuffer);
  fs.writeFileSync(downloadsSvg, svg, 'utf8');
  console.log(`Copied PNG and SVG to Downloads and Desktop`);

  // Copy to Artifact directory
  const artifactDir = path.join('C:', 'Users', 'dubey', '.gemini', 'antigravity-ide', 'brain', '4355294f-e04a-4d18-be9d-696a72e71e5d');
  if (fs.existsSync(artifactDir)) {
    fs.writeFileSync(path.join(artifactDir, 'ayurwell_table_design.png'), pngBuffer);
    fs.writeFileSync(path.join(artifactDir, 'ayurwell_table_design.svg'), svg, 'utf8');
    console.log(`Copied images to artifact directory`);
  }
} catch (err) {
  console.error('Failed to render PNG:', err);
}
