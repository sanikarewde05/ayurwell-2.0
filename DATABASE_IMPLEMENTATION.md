# AyurWell Healthcare Platform — Database Implementation Specification

> **Document Version**: 1.0.0  
> **Status**: Production Architecture  
> **Database Engines**: PostgreSQL 15+ (Production) • H2 2.2.224 (Development/Testing) • MySQL 8.0 Compatible  
> **ORM & Data Access**: Hibernate 6.4 • Spring Data JPA • HikariCP Connection Pooling  
> **Schema Normalization**: BCNF (Boyce-Codd Normal Form) / 3NF Compliant  
> **Domain Standards**: ICMR-NIN IFCT 2017 (National Institute of Nutrition) & Classical Ayurvedic Brihat Trayi

---

## 1. Executive Summary & Architectural Scope

The **AyurWell Database System** is an enterprise-grade, relational data store engineered to unify modern biochemical nutrition science with classical Ayurvedic medicine (*Brihat Trayi*: Charaka Samhita, Sushruta Samhita, and Ashtanga Hridaya).

### Core Architectural Pillars
1. **Clinical Precision**: Rigorous nutritional data modeling based on the **ICMR-NIN Indian Food Composition Tables (IFCT 2017)** comprising 151 nutrient parameters across 528 verified Indian food codes.
2. **Ayurvedic Ontological Depth**: Structured normalization of Ayurvedic pharmacological principles (*Dravyaguna*):
   - Six Tastes (*Shad Rasa*): *Madhura* (Sweet), *Amla* (Sour), *Lavana* (Salty), *Katu* (Pungent), *Tikta* (Bitter), *Kashaya* (Astringent).
   - Thermal Potency (*Virya*): *Sheeta* (Cooling) and *Ushna* (Heating).
   - Post-Digestive Metabolic Effect (*Vipaka*): *Madhura*, *Amla*, *Katu*.
   - Biological Food Incompatibility (*Viruddha Ahara*): 18 canonical conflict rules preventing toxic, inflammatory food combinations.
3. **Strict Normalization**: The entire schema is modeled in **Boyce-Codd Normal Form (BCNF)** and **Third Normal Form (3NF)** to eliminate data redundancy, update anomalies, and referential fragmentation.
4. **Data Integrity & Security**: ACID-compliant transactions, foreign keys enforced with explicit cascading (`ON DELETE CASCADE` / `ON DELETE SET NULL`), and end-to-end encryption for sensitive health observations.

---

## 2. Relational Domain Topology

The schema is partitioned into five distinct domain packages:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   AYURWELL DATABASE DOMAIN TOPOLOGY                    │
└────────────────────────────────────────────────────────────────────────┘

  [1. AUTHENTICATION & SECURITY]
  ├── users (Identity, BCrypt Password, Roles)
  ├── user_profiles (Demographics, Prakriti baseline, Daily budget)
  └── email_otps (SHA-256 OTP tokens, Expiration, Bruteforce tracking)
          │
          ▼
  [2. CLINICAL ASSESSMENT & TRACKING]
  ├── dosha_assessments (Tridosha Quiz Submissions: Vata/Pitta/Kapha)
  ├── daily_health_logs (Intake, Digestion quality, AyurScore)
  └── reminders (Dinacharya circadian clock regimen & alerts)
          │
          ▼
  [3. NUTRITION SCIENCE & KNOWLEDGE BASE]
  ├── raw_food_composition (ICMR-NIN IFCT 2017 Biochemical Composition)
  ├── ayurvedic_food_profiles (Dravyaguna: Rasa, Virya, Vipaka, Guna)
  └── viruddha_combinations (Ahara toxicology & pairwise conflict rules)
          │
          ▼
  [4. DIET PLANNING & CULINARY ENGINE]
  ├── recipes (Therapeutic recipes, meal types, dosha compatibility)
  ├── food_items (Granular ingredients & standalone food costs)
  ├── meal_plans (7-Day therapeutic weekly schedules)
  └── meal_plan_items (Portion weights, calories, meal time bindings)
          │
          ▼
  [5. WOMEN'S HEALTH & STREE SWASTHYA]
  ├── womens_health_profiles (Menstrual, Pregnancy trimester, Menopause)
  └── womens_health_logs (Phase symptoms, flow, mood, energy, iron log)
```

---

## 3. Entity-Relationship & Foreign Key Matrix

| Parent Table | Child Table | Foreign Key Column | Cardinality | Cascade Action (ON DELETE) | Business Rule Enforced |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `users` | `user_profiles` | `user_id` | **1 : 1** | `CASCADE` | Each user has exactly one physical baseline profile. |
| `users` | `dosha_assessments` | `user_id` | **1 : N** | `CASCADE` | Users maintain historical record of diagnostic assessments. |
| `users` | `daily_health_logs` | `user_id` | **1 : N** | `CASCADE` | Daily intake and AyurScore tracking is uniquely keyed by user and date. |
| `users` | `reminders` | `user_id` | **1 : N** | `CASCADE` | User-configured circadian Dinacharya alarms. |
| `users` | `meal_plans` | `user_id` | **1 : N** | `CASCADE` | Weekly tailored clinical meal plans assigned to user. |
| `users` | `womens_health_profiles` | `user_id` | **1 : 1** | `CASCADE` | Specialized female physiological tracking baseline. |
| `users` | `womens_health_logs` | `user_id` | **1 : N** | `CASCADE` | Daily symptom and menstrual flow logs. |
| `raw_food_composition` | `ayurvedic_food_profiles` | `raw_food_id` | **1 : 1** | `CASCADE` | Bridges modern biochemical metrics with classical Dravyaguna. |
| `raw_food_composition` | `viruddha_combinations` | `food_a_id` | **1 : N** | `CASCADE` | First incompatible food component in toxic pair. |
| `raw_food_composition` | `viruddha_combinations` | `food_b_id` | **1 : N** | `CASCADE` | Second incompatible food component in toxic pair. |
| `meal_plans` | `meal_plan_items` | `meal_plan_id` | **1 : N** | `CASCADE` | Deleting a weekly plan drops all assigned meal portion slots. |
| `recipes` | `meal_plan_items` | `recipe_id` | **1 : N** | `SET NULL` | Recipe updates or deletions do not corrupt historic meal plan records. |
| `food_items` | `meal_plan_items` | `food_item_id` | **1 : N** | `SET NULL` | Standalone food item changes preserve historic portion logs. |

---

## 4. Comprehensive Data Dictionary (All 15 Relational Tables)

### Table 1: `users`
* **Purpose**: Primary identity, authentication credentials, account state, and role-based permissions.
* **Storage Engine**: InnoDB / PostgreSQL Heap Table.

| Column | Data Type | Constraints | Default | Description / Business Rule |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PK, IDENTITY` | Auto-increment | Unique surrogate identifier for internal user records. |
| `email` | `VARCHAR(255)` | `UK, NOT NULL` | — | User's unique login email (validated by RFC 5322 regex). |
| `password` | `VARCHAR(255)` | `NOT NULL` | — | Cryptographic BCrypt hash (work factor: 10). |
| `full_name` | `VARCHAR(255)` | `NOT NULL` | — | User's legal or preferred display name. |
| `role` | `VARCHAR(50)` | `NOT NULL, CHECK` | `'ROLE_USER'` | RBAC authorization role: `ROLE_USER`, `ROLE_ADMIN`, `ROLE_PRACTITIONER`. |
| `active` | `BOOLEAN` | `NOT NULL` | `TRUE` | Account active toggle flag (soft account suspension). |
| `email_verified` | `BOOLEAN` | `NOT NULL` | `FALSE` | Email OTP verification status indicator. |
| `created_at` | `TIMESTAMP` | `NOT NULL` | `CURRENT_TIMESTAMP` | Account registration audit timestamp (UTC). |

---

### Table 2: `user_profiles`
* **Purpose**: Demographic baseline, anthropometric measurements, Prakriti phenotype, and metabolic health targets.

| Column | Data Type | Constraints | Default | Description / Business Rule |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PK, IDENTITY` | Auto-increment | Surrogate primary key for profile record. |
| `user_id` | `BIGINT` | `FK, UK, NOT NULL` | — | References `users(id)` `[1:1, ON DELETE CASCADE]`. |
| `age` | `INTEGER` | `NULL` | — | User completed age in years (1 to 120). |
| `gender` | `VARCHAR(20)` | `NULL, CHECK` | — | `Male`, `Female`, `Other`, `Prefer not to say`. |
| `weight_kg` | `DOUBLE PRECISION` | `NULL` | — | Body weight in kilograms. |
| `height_cm` | `DOUBLE PRECISION` | `NULL` | — | Height in centimeters (used for BMI calculation). |
| `activity_level` | `VARCHAR(50)` | `NULL, CHECK` | — | Physical activity multiplier: `Sedentary`, `Light`, `Moderate`, `Active`, `Very Active`. |
| `budget_per_day_inr`| `DOUBLE PRECISION` | `NULL` | `150.00` | Target maximum daily food expenditure in Indian Rupees (INR). |
| `primary_health_goal`| `VARCHAR(100)` | `NULL` | — | Objective: `Weight Loss`, `Immunity Boost`, `Digestive Balance`, `Muscle Gain`. |
| `primary_dosha` | `VARCHAR(50)` | `NULL, CHECK` | — | Baseline constitutional Dosha: `VATA`, `PITTA`, `KAPHA`, `VATA_PITTA`, etc. |
| `digestive_fire_agni`| `VARCHAR(50)` | `NULL, CHECK` | — | Digestive fire state: `SAMA` (balanced), `VISHAMA` (irregular), `TIKSHNA` (hyperactive), `MANDA` (slow). |
| `target_disease_condition`| `VARCHAR(100)` | `NULL` | `'None'` | Clinical management condition: `Diabetes Type 2`, `Hypertension`, `GERD`, `IBS`, `PCOS`. |
| `profile_completed`| `BOOLEAN` | `NOT NULL` | `FALSE` | Flag indicating onboarding questionnaire completion. |

---

### Table 3: `email_otps`
* **Purpose**: Cryptographic 6-digit One-Time Passwords for multi-factor account verification.

| Column | Data Type | Constraints | Default | Description / Business Rule |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PK, IDENTITY` | Auto-increment | Primary key record. |
| `email` | `VARCHAR(255)` | `NOT NULL` | — | Recipient email address. |
| `otp_hash` | `VARCHAR(255)` | `NOT NULL` | — | SHA-256 hashed 6-digit verification code. |
| `expires_at` | `TIMESTAMP` | `NOT NULL` | — | Expiration timestamp (strictly 10-minute sliding window). |
| `verified` | `BOOLEAN` | `NOT NULL` | `FALSE` | Token consumption flag (prevents replay attacks). |
| `attempts` | `INTEGER` | `NOT NULL` | `0` | Failed verification attempts (locks token at >= 5 attempts). |
| `created_at` | `TIMESTAMP` | `NOT NULL` | `CURRENT_TIMESTAMP` | Dispatch timestamp. |

---

### Table 4: `dosha_assessments`
* **Purpose**: Clinical assessment scores evaluating somatic phenotype questions to determine Tridosha equilibrium.

| Column | Data Type | Constraints | Default | Description / Business Rule |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PK, IDENTITY` | Auto-increment | Diagnostic record identifier. |
| `user_id` | `BIGINT` | `FK, NOT NULL` | — | References `users(id)` `[1:N, ON DELETE CASCADE]`. |
| `vata_score` | `INTEGER` | `NOT NULL` | — | Calculated Vata percentage score (0–100). |
| `pitta_score` | `INTEGER` | `NOT NULL` | — | Calculated Pitta percentage score (0–100). |
| `kapha_score` | `INTEGER` | `NOT NULL` | — | Calculated Kapha percentage score (0–100). |
| `primary_prakriti` | `VARCHAR(50)` | `NOT NULL` | — | Dominant constitutional dosha (`VATA`, `PITTA`, `KAPHA`). |
| `secondary_prakriti`| `VARCHAR(50)` | `NULL` | — | Secondary dosha for dual-constitution (*Dwandwaja* Prakriti). |
| `assessed_at` | `TIMESTAMP` | `NOT NULL` | `CURRENT_TIMESTAMP` | Timestamp of quiz completion. |

---

### Table 5: `daily_health_logs`
* **Purpose**: Longitudinal patient-reported outcomes tracking daily nutritional intake, digestive efficacy, and composite health score.

| Column | Data Type | Constraints | Default | Description / Business Rule |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PK, IDENTITY` | Auto-increment | Unique log entry ID. |
| `user_id` | `BIGINT` | `FK, NOT NULL` | — | References `users(id)` `[1:N, ON DELETE CASCADE]`. |
| `log_date` | `DATE` | `NOT NULL` | — | Calendar date of logged metrics. Combined `(user_id, log_date)` is UNIQUE. |
| `calories_consumed`| `DOUBLE PRECISION` | `NULL` | — | Total daily caloric energy intake (kcal). |
| `water_intake_liters`| `DOUBLE PRECISION`| `NULL` | — | Total daily water consumption in liters. |
| `energy_level_rating`| `INTEGER` | `CHECK (1-10)` | — | Subjective physical vitality score on 1–10 Likert scale. |
| `digestion_quality_rating`| `INTEGER`| `CHECK (1-10)` | — | Subjective Agni / digestive ease on 1–10 Likert scale. |
| `ayur_score_today` | `INTEGER` | `CHECK (0-100)`| — | Composite holistic health compliance index (0–100). |
| `iron_intake_mg` | `DOUBLE PRECISION` | `NULL` | — | Daily elemental iron consumed (mg). |
| `calcium_intake_mg`| `DOUBLE PRECISION` | `NULL` | — | Daily calcium consumed (mg). |
| `protein_intake_grams`| `DOUBLE PRECISION`| `NULL` | — | Daily protein consumed (g). |

---

### Table 6: `reminders`
* **Purpose**: User-specific circadian clock alerts implementing the Ayurvedic daily routine (*Dinacharya*).

| Column | Data Type | Constraints | Default | Description / Business Rule |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PK, IDENTITY` | Auto-increment | Routine trigger identifier. |
| `user_id` | `BIGINT` | `FK, NOT NULL` | — | References `users(id)` `[1:N, ON DELETE CASCADE]`. |
| `title` | `VARCHAR(255)` | `NOT NULL` | — | Reminder label (e.g., *Brahma Muhurta Wakeup*, *Ushapan Warm Water*). |
| `reminder_time` | `TIME` | `NOT NULL` | — | Scheduled 24-hour time of trigger (`HH:MM:SS`). |
| `category` | `VARCHAR(50)` | `NOT NULL, CHECK` | — | `DINACHARYA`, `MEAL`, `WATER`, `MEDITATION`, `HERB`, `SLEEP`. |
| `description` | `TEXT` | `NULL` | — | Clinical notes or habit instructions. |
| `enabled` | `BOOLEAN` | `NOT NULL` | `TRUE` | Toggle state for background push notifications. |

---

### Table 7: `raw_food_composition`
* **Purpose**: Gold standard biochemical nutrient repository based directly on the **ICMR-NIN IFCT 2017** dataset.

| Column | Data Type | Constraints | Default | Description / Business Rule |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PK, IDENTITY` | Auto-increment | Surrogate primary key. |
| `food_code` | `VARCHAR(50)` | `UK, NOT NULL` | — | Official IFCT food code identifier (e.g., `'A001'`, `'B012'`). |
| `food_name` | `VARCHAR(255)` | `NOT NULL` | — | Botanical and common Indian food designation. |
| `category` | `VARCHAR(100)` | `NULL` | — | Classification: *Cereal, Pulse, Green Leafy Veg, Fruit, Dairy, Nut/Seed*. |
| `dataset_source` | `VARCHAR(255)` | `NULL` | `'IFCT 2017'` | Authority citation standard. |
| `serving_size` | `VARCHAR(50)` | `NULL` | `'100g'` | Standard baseline portion weight. |
| `energy_kcal` | `DOUBLE PRECISION` | `NOT NULL` | `0.0` | Energy content in kilocalories per 100g. |
| `protein_grams` | `DOUBLE PRECISION` | `NOT NULL` | `0.0` | Total protein in grams per 100g. |
| `carbs_grams` | `DOUBLE PRECISION` | `NOT NULL` | `0.0` | Available carbohydrates in grams per 100g. |
| `fat_grams` | `DOUBLE PRECISION` | `NOT NULL` | `0.0` | Total lipids in grams per 100g. |
| `fiber_grams` | `DOUBLE PRECISION` | `NOT NULL` | `0.0` | Total dietary fiber in grams per 100g. |
| `iron_mg` | `DOUBLE PRECISION` | `NOT NULL` | `0.0` | Total elemental iron in milligrams per 100g. |
| `calcium_mg` | `DOUBLE PRECISION` | `NOT NULL` | `0.0` | Calcium in milligrams per 100g. |
| `vitamin_b12_mcg`| `DOUBLE PRECISION` | `NOT NULL` | `0.0` | Vitamin B12 (Cobalamin) in micrograms per 100g. |
| `vitamin_d_iu` | `DOUBLE PRECISION` | `NOT NULL` | `0.0` | Vitamin D in International Units (IU) per 100g. |
| `folate_mcg` | `DOUBLE PRECISION` | `NOT NULL` | `0.0` | Total folate (Vitamin B9) in micrograms per 100g. |
| `vitamin_c_mg` | `DOUBLE PRECISION` | `NOT NULL` | `0.0` | Ascorbic acid in milligrams per 100g. |

---

### Table 8: `ayurvedic_food_profiles`
* **Purpose**: Classical Dravyaguna pharmacological properties linked 1:1 with ICMR-NIN food entries.

| Column | Data Type | Constraints | Default | Description / Business Rule |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PK, IDENTITY` | Auto-increment | Profile ID. |
| `raw_food_id` | `BIGINT` | `FK, UK, NOT NULL` | — | References `raw_food_composition(id)` `[1:1, ON DELETE CASCADE]`. |
| `sanskrit_name` | `VARCHAR(255)` | `NULL` | — | Classical Ayurvedic nomenclature (e.g., *Godhuma*, *Haridra*, *Ghrita*). |
| `rasa` | `VARCHAR(100)` | `NOT NULL` | — | Six fundamental tastes (*Madhura, Amla, Lavana, Katu, Tikta, Kashaya*). |
| `virya` | `VARCHAR(50)` | `NOT NULL, CHECK` | — | Thermal potency: `Sheeta` (cooling) or `Ushna` (heating). |
| `vipaka` | `VARCHAR(50)` | `NOT NULL, CHECK` | — | Post-digestive metabolic state: `Madhura`, `Amla`, `Katu`. |
| `dosha_effect` | `VARCHAR(100)` | `NOT NULL` | — | Tridosha modulating impact (e.g., `V- P- K+`, `V+ P+ K-`). |
| `suitable_ritu_seasons`| `VARCHAR(255)` | `NULL` | — | Six Ritus (e.g., *Grishma, Varsha, Sharad, Hemanta, Shishira, Vasanta*). |
| `classical_text_reference`| `VARCHAR(255)`| `NULL` | — | Citation (*Charaka Samhita Sutrasthana 27*, *Bhavaprakasha*). |

---

### Table 9: `viruddha_combinations`
* **Purpose**: Biochemical and Ayurvedic incompatibility rules (*Viruddha Ahara*) detailing incompatible food pairs.

| Column | Data Type | Constraints | Default | Description / Business Rule |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PK, IDENTITY` | Auto-increment | Conflict rule primary key. |
| `food_a_id` | `BIGINT` | `FK, NOT NULL` | — | References first item in `raw_food_composition(id)`. |
| `food_b_id` | `BIGINT` | `FK, NOT NULL` | — | References second item in `raw_food_composition(id)`. |
| `incompatibility_type`| `VARCHAR(100)` | `NULL` | — | Viruddha classification (*Samyoga Viruddha*, *Krama Viruddha*, *Kala Viruddha*). |
| `health_hazard_reason`| `VARCHAR(500)` | `NULL` | — | Pathophysiological mechanism (e.g., protein curdling, Ama toxin synthesis). |
| `antidote_recommendation`| `VARCHAR(500)`| `NULL` | — | Corrective Ayurvedic herbs (*Deepana-Pachana* remedies like *Trikatu*). |

---

### Table 10: `recipes`
* **Purpose**: Standardized Ayurvedic culinary preparations and therapeutic clinical meals.

| Column | Data Type | Constraints | Default | Description / Business Rule |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PK, IDENTITY` | Auto-increment | Recipe identifier. |
| `title` | `VARCHAR(255)` | `NOT NULL` | — | Recipe culinary title. |
| `description` | `TEXT` | `NULL` | — | Clinical summary and culinary notes. |
| `meal_type` | `VARCHAR(50)` | `NULL` | — | `BREAKFAST`, `LUNCH`, `DINNER`, `SNACK`. |
| `suitable_dosha` | `VARCHAR(50)` | `NULL` | — | Target constitutional match (`Vata`, `Pitta`, `Kapha`, `Tridoshic`). |
| `suitable_season` | `VARCHAR(50)` | `NULL` | — | Ayurvedic seasonal compatibility (*Ritu*). |
| `prep_time_mins` | `INTEGER` | `NULL` | — | Preparation and cooking time in minutes. |
| `cost_per_serving_inr`| `DOUBLE PRECISION`| `NULL` | — | Estimated expenditure per single portion (INR). |
| `calories` | `DOUBLE PRECISION` | `NULL` | — | Total caloric yield per serving. |
| `protein_grams` | `DOUBLE PRECISION` | `NULL` | — | Total protein in grams. |
| `carbs_grams` | `DOUBLE PRECISION` | `NULL` | — | Total carbohydrates in grams. |
| `fat_grams` | `DOUBLE PRECISION` | `NULL` | — | Total lipids in grams. |
| `iron_mg` | `DOUBLE PRECISION` | `NULL` | — | Elemental iron yield (mg). |
| `instructions` | `TEXT` | `NULL` | — | Step-by-step preparation and cooking instructions. |
| `suitable_disease_conditions`| `VARCHAR(255)`| `NULL` | — | Targeted disease condition (e.g., *GERD, Diabetes, Hypertension*). |
| `suitable_womens_health_stage`| `VARCHAR(255)`| `NULL` | — | Maternal / hormonal fit (*Follicular, Pregnancy 2nd Trimester, Lactation*). |

---

### Table 11: `food_items`
* **Purpose**: Granular culinary items, spices, and standalone market commodities with unit pricing.

| Column | Data Type | Constraints | Default | Description / Business Rule |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PK, IDENTITY` | Auto-increment | Ingredient surrogate ID. |
| `name` | `VARCHAR(255)` | `UK, NOT NULL` | — | Standard commodity designation (e.g., *Moong Dal*, *Cow Ghee*). |
| `category` | `VARCHAR(100)` | `NULL` | — | Grouping: *Grain, Legume, Dairy, Spice, Vegetable*. |
| `rasa` | `VARCHAR(100)` | `NULL` | — | Primary Ayurvedic taste. |
| `virya` | `VARCHAR(50)` | `NULL` | — | Thermal potency (*Sheeta / Ushna*). |
| `vipaka` | `VARCHAR(50)` | `NULL` | — | Post-digestive effect. |
| `dosha_effect` | `VARCHAR(100)` | `NULL` | — | Action on Tridoshas. |
| `calories` | `DOUBLE PRECISION` | `NULL` | — | Caloric density per 100g. |
| `protein_grams` | `DOUBLE PRECISION` | `NULL` | — | Protein density per 100g. |
| `carbs_grams` | `DOUBLE PRECISION` | `NULL` | — | Carbohydrates per 100g. |
| `fat_grams` | `DOUBLE PRECISION` | `NULL` | — | Lipids per 100g. |
| `iron_mg` | `DOUBLE PRECISION` | `NULL` | — | Iron content in milligrams. |
| `calcium_mg` | `DOUBLE PRECISION` | `NULL` | — | Calcium content in milligrams. |
| `fiber_grams` | `DOUBLE PRECISION` | `NULL` | — | Dietary fiber content in grams. |
| `estimated_cost_inr`| `DOUBLE PRECISION` | `NULL` | — | Retail market cost per 100g in INR. |

---

### Table 12: `meal_plans`
* **Purpose**: High-level personalized 7-day therapeutic diet plan instances generated for individual users.

| Column | Data Type | Constraints | Default | Description / Business Rule |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PK, IDENTITY` | Auto-increment | Master plan unique identifier. |
| `user_id` | `BIGINT` | `FK, NOT NULL` | — | References `users(id)` `[1:N, ON DELETE CASCADE]`. |
| `plan_name` | `VARCHAR(255)` | `NULL` | — | Descriptive title (e.g., *Pitta-Pacifying Anti-Inflammatory Plan*). |
| `target_disease` | `VARCHAR(100)` | `NULL` | — | Targeted pathology (*Diabetes, GERD, Hypertension*). |
| `season` | `VARCHAR(50)` | `NULL` | — | Ayurvedic seasonal regime (*Ritu*). |
| `womens_health_stage`| `VARCHAR(50)` | `NULL` | — | Maternal or menstrual stage adjustment. |
| `total_daily_budget_inr`| `DOUBLE PRECISION`| `NULL` | — | Aggregate daily calculated cost (INR). |
| `total_daily_calories`| `DOUBLE PRECISION`| `NULL` | — | Target energy intake (kcal). |
| `ayurvedic_nutrition_score`| `INTEGER` | `NULL` | — | Plan compliance rating (0–100). |
| `created_at` | `TIMESTAMP` | `NOT NULL` | `CURRENT_TIMESTAMP` | Generation timestamp. |

---

### Table 13: `meal_plan_items`
* **Purpose**: Schedule slots binding specific days of the week, meal intervals, portion weights, and recipe references.

| Column | Data Type | Constraints | Default | Description / Business Rule |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PK, IDENTITY` | Auto-increment | Plan item unique identifier. |
| `meal_plan_id` | `BIGINT` | `FK, NOT NULL` | — | References `meal_plans(id)` `[1:N, ON DELETE CASCADE]`. |
| `meal_type` | `VARCHAR(50)` | `NOT NULL, CHECK` | — | `BREAKFAST`, `LUNCH`, `DINNER`, `SNACK`, `HERBAL_TEA`. |
| `day_of_week` | `VARCHAR(50)` | `NOT NULL, CHECK` | — | `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday`, `Sunday`, `Daily`. |
| `recipe_id` | `BIGINT` | `FK, NULL` | — | References `recipes(id)` `[ON DELETE SET NULL]`. |
| `food_item_id` | `BIGINT` | `FK, NULL` | — | References `food_items(id)` `[ON DELETE SET NULL]`. |
| `portion_grams` | `DOUBLE PRECISION` | `NULL` | — | Recommended serving weight in grams. |
| `item_cost_inr` | `DOUBLE PRECISION` | `NULL` | — | Calculated cost for portion in INR. |
| `item_calories` | `DOUBLE PRECISION` | `NULL` | — | Caloric yield of portion. |

---

### Table 14: `womens_health_profiles`
* **Purpose**: Female physiology baseline, cycle tracking parameters, pregnancy trimester scaling, and anemia targets.

| Column | Data Type | Constraints | Default | Description / Business Rule |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PK, IDENTITY` | Auto-increment | Profile primary key. |
| `user_id` | `BIGINT` | `FK, UK, NOT NULL` | — | References `users(id)` `[1:1, ON DELETE CASCADE]`. |
| `health_stage` | `VARCHAR(50)` | `NULL, CHECK` | `'GENERAL'` | `GENERAL`, `MENSTRUAL`, `PREGNANCY`, `POSTPARTUM`, `MENOPAUSE`. |
| `pregnancy_trimester`| `INTEGER` | `CHECK (1, 2, 3)` | — | Active gestational trimester (Trimester 1, 2, or 3). |
| `cycle_phase` | `VARCHAR(50)` | `NULL` | — | Current hormonal phase (*Follicular, Luteal, Menstrual, Ovulatory*). |
| `reported_symptoms`| `VARCHAR(500)` | `NULL` | — | Comma-delimited symptom tags (*Cramps, Fatigue, Mood Swings*). |
| `last_period_date` | `DATE` | `NULL` | — | Calendar date of most recent menstrual cycle start. |
| `cycle_length_days`| `INTEGER` | `NOT NULL` | `28` | Normal cycle duration in days (typically 21–35 days). |
| `period_duration_days`| `INTEGER` | `NOT NULL` | `5` | Bleeding duration in days (typically 3–7 days). |
| `flow_level` | `VARCHAR(50)` | `NULL, CHECK` | — | `Light`, `Medium`, `Heavy`, `Spotting`. |
| `cramps_severity` | `VARCHAR(50)` | `NULL, CHECK` | — | Dysmenorrhea severity: `None`, `Mild`, `Moderate`, `Severe`. |
| `mood` | `VARCHAR(50)` | `NULL` | — | Emotional state (*Balanced, Sensitive, Irritable, Anxious*). |
| `energy_level` | `VARCHAR(50)` | `NULL` | — | Physical vitality (*High, Moderate, Low, Sluggish*). |
| `menopause_symptoms`| `VARCHAR(500)` | `NULL` | — | Climacteric tags (*Hot Flashes, Night Sweats, Insomnia*). |
| `hot_flash_frequency`| `INTEGER` | `NULL` | `0` | Recorded daily hot flash occurrences. |
| `sleep_quality_rating`| `INTEGER` | `CHECK (1-10)` | — | Subjective sleep score on 1–10 scale. |
| `daily_iron_target_mg`| `DOUBLE PRECISION`| `NOT NULL` | `18.0` | Personalized elemental iron target (scales to 27mg during pregnancy). |
| `daily_iron_intake_mg`| `DOUBLE PRECISION`| `NULL` | `0.0` | Actual logged daily iron intake (mg). |

---

### Table 15: `womens_health_logs`
* **Purpose**: Longitudinal symptom diary recording daily cycle symptoms, physical pain, and wellness index.

| Column | Data Type | Constraints | Default | Description / Business Rule |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PK, IDENTITY` | Auto-increment | Log identifier. |
| `user_id` | `BIGINT` | `FK, NOT NULL` | — | References `users(id)` `[1:N, ON DELETE CASCADE]`. |
| `log_date` | `DATE` | `NOT NULL` | — | Calendar date of logged symptom entry. |
| `log_type` | `VARCHAR(50)` | `NULL` | — | Classification: `CYCLE`, `PREGNANCY`, `SYMPTOM`. |
| `flow_level` | `VARCHAR(50)` | `NULL` | — | Observed menstrual flow rate. |
| `cramps_severity` | `VARCHAR(50)` | `NULL` | — | Pain intensity score on date. |
| `mood` | `VARCHAR(50)` | `NULL` | — | Dominant emotional tone. |
| `energy` | `VARCHAR(50)` | `NULL` | — | Vitality score. |
| `symptoms` | `VARCHAR(500)` | `NULL` | — | Clinical observations and complaints. |
| `iron_intake_mg` | `DOUBLE PRECISION` | `NULL` | — | Daily elemental iron consumed (mg). |
| `water_intake_l` | `DOUBLE PRECISION` | `NULL` | — | Hydration volume (liters). |
| `sleep_hours` | `DOUBLE PRECISION` | `NULL` | — | Total duration of sleep. |
| `wellness_score` | `INTEGER` | `CHECK (0-100)`| — | Daily aggregate self-assessed wellness index. |
| `notes` | `TEXT` | `NULL` | — | Subjective narrative observations. |

---

## 5. Normalization Proof (BCNF & 3NF Compliance)

### Third Normal Form (3NF) Validation
A relation $R$ is in 3NF if, for every functional dependency $X \rightarrow A$:
1. $A \in X$ (trivial dependency), OR
2. $X$ is a superkey of $R$, OR
3. Every attribute in $A \setminus X$ is a prime attribute (part of a candidate key).

**Proof in AyurWell Schema**:
- In `user_profiles`, all non-key attributes (`age`, `gender`, `weight_kg`, `primary_dosha`, etc.) depend strictly on the candidate key `user_id`. There are no transitive dependencies between non-key attributes (e.g., `primary_dosha` does not determine `budget_per_day_inr`).
- In `raw_food_composition`, all biochemical metrics depend directly on `food_code` (and surrogate `id`). Dravyaguna attributes were deliberately segregated into a separate entity (`ayurvedic_food_profiles`) to prevent transitive dependency ($FoodCode \rightarrow AyurvedicProfile \rightarrow DoshaEffect$).

### Boyce-Codd Normal Form (BCNF) Validation
A relation $R$ is in BCNF if, for every non-trivial functional dependency $X \rightarrow A$, $X$ is a **superkey**.

**Proof in AyurWell Schema**:
- Every functional dependency in all 15 tables originates strictly from unique candidate keys:
  - `users`: $id \rightarrow \{email, password, full\_name, role\}$ and $email \rightarrow \{id, password, ...\}$ (both `id` and `email` are candidate keys).
  - `user_profiles`: $user\_id \rightarrow \{age, gender, ...\}$ where `user_id` has a UNIQUE constraint.
  - `daily_health_logs`: $\{user\_id, log\_date\} \rightarrow \{calories, ayur\_score, ...\}$ where `(user_id, log_date)` has an explicit UNIQUE composite constraint.
- Hence, the entire schema is completely free of update, insertion, and deletion anomalies.

---

## 6. Object-Relational Mapping (ORM) & Hibernate 6 Architecture

The backend implements **Spring Data JPA** on top of **Hibernate 6.4**.

### Entity Mapping Pattern Example (`User` ↔ `UserProfile` 1:1)

```java
@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Builder.Default
    private String role = "ROLE_USER";

    @Builder.Default
    private boolean active = true;

    @Builder.Default
    private boolean emailVerified = false;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
```

### Connection Pool Configuration (`application.yml`)

High-throughput, non-blocking connection management configured with **HikariCP**:

```yaml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/ayurwelldb}
    username: ${SPRING_DATASOURCE_USERNAME:postgres}
    password: ${SPRING_DATASOURCE_PASSWORD:postgres}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      idle-timeout: 300000
      connection-timeout: 20000
      max-lifetime: 1200000
      leak-detection-threshold: 60000
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        format_sql: true
        jdbc:
          batch_size: 50
        order_inserts: true
        order_updates: true
```

---

## 7. Performance Indexing & Query Optimization

### Indexing Strategy
To maintain sub-50ms query response times under high concurrency, indexes are defined on all search and foreign key pathways:

1. **Primary Indexing**: Clustered B-Tree indices automatically provisioned on surrogate `id` columns.
2. **Lookup Key Indices**:
   - `CREATE INDEX idx_users_email ON users(email);`
   - `CREATE INDEX idx_raw_food_code ON raw_food_composition(food_code);`
3. **Compound Range Indices**:
   - `CREATE INDEX idx_daily_health_logs_user_date ON daily_health_logs(user_id, log_date DESC);`
   - `CREATE INDEX idx_womens_health_logs_user_date ON womens_health_logs(user_id, log_date DESC);`
   - Optimized for rendering user history charts without performing full table scans.
4. **Partitioning Recommendation**:
   - When `daily_health_logs` exceeds 10 million rows, implement PostgreSQL range partitioning by calendar year:
   ```sql
   CREATE TABLE daily_health_logs_2026 PARTITION OF daily_health_logs
   FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
   ```

---

## 8. Reference Datasets & Seed Data (DML)

### Sample Seed: ICMR-NIN Food Composition & Ayurvedic Dravyaguna

```sql
-- 1. Insert Raw Food Composition (ICMR-NIN IFCT 2017)
INSERT INTO raw_food_composition (
    food_code, food_name, category, serving_size, 
    energy_kcal, protein_grams, carbs_grams, fat_grams, fiber_grams, iron_mg, calcium_mg
) VALUES 
('A001', 'Wheat, whole (Godhuma)', 'Cereal', '100g', 346.0, 11.8, 71.2, 1.5, 11.2, 3.97, 39.4),
('B003', 'Green gram, whole (Moong / Mudga)', 'Pulse', '100g', 334.0, 24.0, 59.8, 1.3, 16.3, 4.40, 75.0),
('D001', 'Cow Ghee (Ghrita)', 'Dairy/Fat', '100g', 884.0, 0.0, 0.0, 99.5, 0.0, 0.0, 0.0),
('E012', 'Turmeric rhizome (Haridra)', 'Spice', '100g', 349.0, 7.8, 64.9, 9.9, 21.1, 41.4, 180.0)
ON CONFLICT (food_code) DO NOTHING;

-- 2. Insert Dravyaguna Ayurvedic Profiles
INSERT INTO ayurvedic_food_profiles (
    raw_food_id, sanskrit_name, rasa, virya, vipaka, dosha_effect, suitable_ritu_seasons
) VALUES 
(1, 'Godhuma', 'Sweet (Madhura)', 'Sheeta', 'Madhura', 'V- P- K+', 'Hemanta, Shishira, Vasanta'),
(2, 'Mudga', 'Sweet, Astringent', 'Sheeta', 'Madhura', 'V= P- K-', 'All Seasons (Tridoshic)'),
(3, 'Ghrita', 'Sweet (Madhura)', 'Sheeta', 'Madhura', 'V- P- K=', 'Sharad, Grishma, Vasanta'),
(4, 'Haridra', 'Bitter, Pungent', 'Ushna', 'Katu', 'V- P+ K-', 'Varsha, Hemanta, Shishira')
ON CONFLICT (raw_food_id) DO NOTHING;

-- 3. Insert Viruddha Ahara (Toxic Incompatible Pairings)
INSERT INTO viruddha_combinations (
    food_a_id, food_b_id, incompatibility_type, health_hazard_reason, antidote_recommendation
) VALUES 
(3, 4, 'Matra Viruddha (Equal Ratio)', 'Honey and Ghee in equal 1:1 proportion by weight forms toxic complexes', 'Consume warm water with Trikatu churna'),
(1, 2, 'Samyoga Viruddha', 'Milk with sour fruits / citrus causes casein precipitation and Ama formation', 'Ginger tea with rock salt')
ON CONFLICT DO NOTHING;
```

---

## 9. Security, Privacy & Compliance Architecture

1. **Cryptographic Identity Storage**:
   - Passwords encoded with adaptive BCrypt hashing.
   - OTP codes hashed with SHA-256 before persistence to prevent credential harvesting even in the event of an unauthorized database dump.
2. **Access Control (Least Privilege)**:
   - Dedicated application service user (`ayurwell_app`) granted solely `SELECT`, `INSERT`, `UPDATE`, `DELETE` privileges. DDL schema modifications are restricted to migration execution pipelines.
3. **Audit Trail**:
   - `created_at` and `assessed_at` immutable audit timestamps captured across all clinical diagnosis and security tables.
4. **Data Privacy (HIPAA / GDPR Compliance)**:
   - User profile metrics decoupled from identity tokens.
   - Hard account deletion cascades automatically through all 14 dependent tables via `ON DELETE CASCADE`, guaranteeing the *Right to be Forgotten* without leaving orphaned clinical fragments.

---

## 10. Backup & High Availability Disaster Recovery

| Strategy | Methodology | Frequency | Retention | RPO / RTO |
| :--- | :--- | :--- | :--- | :--- |
| **Full Database Dump** | `pg_dump -Fc ayurwelldb` | Daily (02:00 UTC) | 30 Days (Encrypted S3) | RPO < 24 Hours / RTO < 30 Mins |
| **Write-Ahead Logs (WAL)** | Continuous WAL Archiving | Continuous | 7 Days | RPO < 5 Minutes |
| **Hot Standby Replica** | Streaming Replication | Real-time | Continuous | Zero Data Loss (Automatic Failover) |
