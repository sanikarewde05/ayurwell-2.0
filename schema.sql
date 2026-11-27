-- ============================================================================
-- AYURWELL HEALTHCARE PLATFORM — PRODUCTION RELATIONAL DATABASE SCHEMA (DDL)
-- Dialect: PostgreSQL 15+ / Compatible with MySQL 8.0 & H2 2.2+
-- Schema Normalization: BCNF (Boyce-Codd Normal Form) / 3NF Compliant
-- Generated: 2026-09-25
-- ============================================================================

-- Enable UUID extension if needed in PostgreSQL
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. AUTHENTICATION & ACCESS CONTROL DOMAIN
-- ============================================================================

-- Table 1: users (Core Account & Identity)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_USER',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_users_role CHECK (role IN ('ROLE_USER', 'ROLE_ADMIN', 'ROLE_PRACTITIONER'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(active);

-- Table 2: user_profiles (Demographics, Baseline Prakriti & Metabolic Health)
CREATE TABLE IF NOT EXISTS user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    age INT,
    gender VARCHAR(20),
    weight_kg DOUBLE PRECISION,
    height_cm DOUBLE PRECISION,
    activity_level VARCHAR(50),
    budget_per_day_inr DOUBLE PRECISION DEFAULT 150.0,
    primary_health_goal VARCHAR(100),
    primary_dosha VARCHAR(50),
    digestive_fire_agni VARCHAR(50),
    target_disease_condition VARCHAR(100) DEFAULT 'None',
    profile_completed BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_user_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_profiles_gender CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
    CONSTRAINT chk_profiles_activity CHECK (activity_level IN ('Sedentary', 'Light', 'Moderate', 'Active', 'Very Active')),
    CONSTRAINT chk_profiles_dosha CHECK (primary_dosha IN ('VATA', 'PITTA', 'KAPHA', 'VATA_PITTA', 'PITTA_KAPHA', 'VATA_KAPHA', 'TRIDOSHA', NULL)),
    CONSTRAINT chk_profiles_agni CHECK (digestive_fire_agni IN ('SAMA', 'VISHAMA', 'TIKSHNA', 'MANDA', NULL))
);

CREATE INDEX idx_user_profiles_user ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_dosha ON user_profiles(primary_dosha);
CREATE INDEX idx_user_profiles_disease ON user_profiles(target_disease_condition);

-- Table 3: email_otps (Cryptographic One-Time Passwords for Verification)
CREATE TABLE IF NOT EXISTS email_otps (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    attempts INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_otps_lookup ON email_otps(email, verified, expires_at);

-- ============================================================================
-- 2. CLINICAL ASSESSMENT & LIFESTYLE TRACKING DOMAIN
-- ============================================================================

-- Table 4: dosha_assessments (Tridosha Quiz Submissions & Prakriti Diagnostics)
CREATE TABLE IF NOT EXISTS dosha_assessments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    vata_score INT NOT NULL,
    pitta_score INT NOT NULL,
    kapha_score INT NOT NULL,
    primary_prakriti VARCHAR(50) NOT NULL,
    secondary_prakriti VARCHAR(50),
    assessed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dosha_assessments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_dosha_assessments_user ON dosha_assessments(user_id, assessed_at DESC);

-- Table 5: daily_health_logs (Daily Intake, Digestion, Water, and AyurScore)
CREATE TABLE IF NOT EXISTS daily_health_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    log_date DATE NOT NULL,
    calories_consumed DOUBLE PRECISION,
    water_intake_liters DOUBLE PRECISION,
    energy_level_rating INT,
    digestion_quality_rating INT,
    ayur_score_today INT,
    iron_intake_mg DOUBLE PRECISION,
    calcium_intake_mg DOUBLE PRECISION,
    protein_intake_grams DOUBLE PRECISION,
    CONSTRAINT fk_daily_health_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_daily_log_user_date UNIQUE (user_id, log_date),
    CONSTRAINT chk_health_logs_energy CHECK (energy_level_rating BETWEEN 1 AND 10),
    CONSTRAINT chk_health_logs_digestion CHECK (digestion_quality_rating BETWEEN 1 AND 10),
    CONSTRAINT chk_health_logs_ayurscore CHECK (ayur_score_today BETWEEN 0 AND 100)
);

CREATE INDEX idx_daily_health_logs_user_date ON daily_health_logs(user_id, log_date DESC);

-- Table 6: reminders (Circadian Dinacharya Clock & Habit Alarms)
CREATE TABLE IF NOT EXISTS reminders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    reminder_time TIME NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_reminders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_reminders_category CHECK (category IN ('DINACHARYA', 'MEAL', 'WATER', 'MEDITATION', 'HERB', 'SLEEP'))
);

CREATE INDEX idx_reminders_user ON reminders(user_id, enabled);

-- ============================================================================
-- 3. NUTRITIONAL SCIENCE & AYURVEDIC KNOWLEDGE BASE DOMAIN
-- ============================================================================

-- Table 7: raw_food_composition (ICMR-NIN IFCT 2017 Biochemical Composition)
CREATE TABLE IF NOT EXISTS raw_food_composition (
    id BIGSERIAL PRIMARY KEY,
    food_code VARCHAR(50) NOT NULL UNIQUE,
    food_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    dataset_source VARCHAR(255) DEFAULT 'ICMR-NIN Indian Food Composition Tables (IFCT 2017)',
    serving_size VARCHAR(50) DEFAULT '100g',
    energy_kcal DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    protein_grams DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    carbs_grams DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    fat_grams DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    fiber_grams DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    iron_mg DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    calcium_mg DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    vitamin_b12_mcg DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    vitamin_d_iu DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    folate_mcg DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    vitamin_c_mg DOUBLE PRECISION NOT NULL DEFAULT 0.0
);

CREATE INDEX idx_raw_food_category ON raw_food_composition(category);
CREATE INDEX idx_raw_food_name ON raw_food_composition(food_name);

-- Table 8: ayurvedic_food_profiles (Dravyaguna: Rasa, Virya, Vipaka, Guna)
CREATE TABLE IF NOT EXISTS ayurvedic_food_profiles (
    id BIGSERIAL PRIMARY KEY,
    raw_food_id BIGINT NOT NULL UNIQUE,
    sanskrit_name VARCHAR(255),
    rasa VARCHAR(100) NOT NULL,
    virya VARCHAR(50) NOT NULL,
    vipaka VARCHAR(50) NOT NULL,
    dosha_effect VARCHAR(100) NOT NULL,
    suitable_ritu_seasons VARCHAR(255),
    classical_text_reference VARCHAR(255),
    CONSTRAINT fk_ayurvedic_profile_raw_food FOREIGN KEY (raw_food_id) REFERENCES raw_food_composition(id) ON DELETE CASCADE,
    CONSTRAINT chk_ayurvedic_virya CHECK (virya IN ('Sheeta', 'Ushna', 'Shita', 'Moderate')),
    CONSTRAINT chk_ayurvedic_vipaka CHECK (vipaka IN ('Madhura', 'Amla', 'Katu'))
);

CREATE INDEX idx_ayurvedic_profile_raw ON ayurvedic_food_profiles(raw_food_id);
CREATE INDEX idx_ayurvedic_profile_virya ON ayurvedic_food_profiles(virya);
CREATE INDEX idx_ayurvedic_profile_dosha ON ayurvedic_food_profiles(dosha_effect);

-- Table 9: viruddha_combinations (Ahara Toxicology: Incompatible Food Pairings)
CREATE TABLE IF NOT EXISTS viruddha_combinations (
    id BIGSERIAL PRIMARY KEY,
    food_a_id BIGINT NOT NULL,
    food_b_id BIGINT NOT NULL,
    incompatibility_type VARCHAR(100),
    health_hazard_reason VARCHAR(500),
    antidote_recommendation VARCHAR(500),
    CONSTRAINT fk_viruddha_food_a FOREIGN KEY (food_a_id) REFERENCES raw_food_composition(id) ON DELETE CASCADE,
    CONSTRAINT fk_viruddha_food_b FOREIGN KEY (food_b_id) REFERENCES raw_food_composition(id) ON DELETE CASCADE,
    CONSTRAINT uq_viruddha_pair UNIQUE (food_a_id, food_b_id)
);

CREATE INDEX idx_viruddha_food_a ON viruddha_combinations(food_a_id);
CREATE INDEX idx_viruddha_food_b ON viruddha_combinations(food_b_id);

-- ============================================================================
-- 4. DIET PLANNING & CULINARY ENGINE DOMAIN
-- ============================================================================

-- Table 10: recipes (Ayurvedic & Therapeutic Recipes)
CREATE TABLE IF NOT EXISTS recipes (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    meal_type VARCHAR(50),
    suitable_dosha VARCHAR(50),
    suitable_season VARCHAR(50),
    prep_time_mins INT,
    cost_per_serving_inr DOUBLE PRECISION,
    calories DOUBLE PRECISION,
    protein_grams DOUBLE PRECISION,
    carbs_grams DOUBLE PRECISION,
    fat_grams DOUBLE PRECISION,
    iron_mg DOUBLE PRECISION,
    instructions TEXT,
    suitable_disease_conditions VARCHAR(255),
    suitable_womens_health_stage VARCHAR(255)
);

CREATE INDEX idx_recipes_dosha ON recipes(suitable_dosha);
CREATE INDEX idx_recipes_meal_type ON recipes(meal_type);
CREATE INDEX idx_recipes_disease ON recipes(suitable_disease_conditions);

-- Table 11: food_items (Granular Recipe Ingredients & Standalone Foods)
CREATE TABLE IF NOT EXISTS food_items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100),
    rasa VARCHAR(100),
    virya VARCHAR(50),
    vipaka VARCHAR(50),
    dosha_effect VARCHAR(100),
    calories DOUBLE PRECISION,
    protein_grams DOUBLE PRECISION,
    carbs_grams DOUBLE PRECISION,
    fat_grams DOUBLE PRECISION,
    iron_mg DOUBLE PRECISION,
    calcium_mg DOUBLE PRECISION,
    fiber_grams DOUBLE PRECISION,
    estimated_cost_inr DOUBLE PRECISION
);

CREATE INDEX idx_food_items_name ON food_items(name);
CREATE INDEX idx_food_items_category ON food_items(category);

-- Table 12: meal_plans (Weekly / Daily Personalized Clinical Meal Plans)
CREATE TABLE IF NOT EXISTS meal_plans (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    plan_name VARCHAR(255),
    target_disease VARCHAR(100),
    season VARCHAR(50),
    womens_health_stage VARCHAR(50),
    total_daily_budget_inr DOUBLE PRECISION,
    total_daily_calories DOUBLE PRECISION,
    ayurvedic_nutrition_score INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_meal_plans_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_meal_plans_user ON meal_plans(user_id, created_at DESC);

-- Table 13: meal_plan_items (Specific Meal Portions, Day of Week & Recipe Links)
CREATE TABLE IF NOT EXISTS meal_plan_items (
    id BIGSERIAL PRIMARY KEY,
    meal_plan_id BIGINT NOT NULL,
    meal_type VARCHAR(50) NOT NULL,
    day_of_week VARCHAR(50) NOT NULL,
    recipe_id BIGINT,
    food_item_id BIGINT,
    portion_grams DOUBLE PRECISION,
    item_cost_inr DOUBLE PRECISION,
    item_calories DOUBLE PRECISION,
    CONSTRAINT fk_meal_plan_items_plan FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE,
    CONSTRAINT fk_meal_plan_items_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE SET NULL,
    CONSTRAINT fk_meal_plan_items_food FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE SET NULL,
    CONSTRAINT chk_plan_items_meal_type CHECK (meal_type IN ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'HERBAL_TEA')),
    CONSTRAINT chk_plan_items_day CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Daily'))
);

CREATE INDEX idx_meal_plan_items_plan ON meal_plan_items(meal_plan_id, day_of_week);

-- ============================================================================
-- 5. WOMEN'S HEALTH & STREE SWASTHYA DOMAIN
-- ============================================================================

-- Table 14: womens_health_profiles (Lifecycle Stage, Cycle Tracker & Anemia Baseline)
CREATE TABLE IF NOT EXISTS womens_health_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    health_stage VARCHAR(50),
    pregnancy_trimester INT,
    cycle_phase VARCHAR(50),
    reported_symptoms VARCHAR(500),
    last_period_date DATE,
    cycle_length_days INT NOT NULL DEFAULT 28,
    period_duration_days INT NOT NULL DEFAULT 5,
    flow_level VARCHAR(50),
    cramps_severity VARCHAR(50),
    mood VARCHAR(50),
    energy_level VARCHAR(50),
    menopause_symptoms VARCHAR(500),
    hot_flash_frequency INT DEFAULT 0,
    sleep_quality_rating INT,
    daily_iron_target_mg DOUBLE PRECISION NOT NULL DEFAULT 18.0,
    daily_iron_intake_mg DOUBLE PRECISION DEFAULT 0.0,
    CONSTRAINT fk_womens_health_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_womens_stage CHECK (health_stage IN ('GENERAL', 'MENSTRUAL', 'PREGNANCY', 'POSTPARTUM', 'MENOPAUSE', NULL)),
    CONSTRAINT chk_womens_trimester CHECK (pregnancy_trimester IN (1, 2, 3, NULL)),
    CONSTRAINT chk_womens_flow CHECK (flow_level IN ('Light', 'Medium', 'Heavy', 'Spotting', NULL)),
    CONSTRAINT chk_womens_cramps CHECK (cramps_severity IN ('None', 'Mild', 'Moderate', 'Severe', NULL)),
    CONSTRAINT chk_womens_sleep CHECK (sleep_quality_rating BETWEEN 1 AND 10 OR sleep_quality_rating IS NULL)
);

CREATE INDEX idx_womens_health_user ON womens_health_profiles(user_id);
CREATE INDEX idx_womens_health_stage ON womens_health_profiles(health_stage);

-- Table 15: womens_health_logs (Daily Symptom Diary & Hormonal Log)
CREATE TABLE IF NOT EXISTS womens_health_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    log_date DATE NOT NULL,
    log_type VARCHAR(50),
    flow_level VARCHAR(50),
    cramps_severity VARCHAR(50),
    mood VARCHAR(50),
    energy VARCHAR(50),
    symptoms VARCHAR(500),
    iron_intake_mg DOUBLE PRECISION,
    water_intake_l DOUBLE PRECISION,
    sleep_hours DOUBLE PRECISION,
    wellness_score INT,
    notes TEXT,
    CONSTRAINT fk_womens_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_womens_logs_wellness CHECK (wellness_score BETWEEN 0 AND 100 OR wellness_score IS NULL)
);

CREATE INDEX idx_womens_health_logs_user_date ON womens_health_logs(user_id, log_date DESC);

-- ============================================================================
-- END OF SCHEMA DEFINITION
-- ============================================================================
