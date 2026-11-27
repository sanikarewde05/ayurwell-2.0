# AyurWell Healthcare Platform — Software Effort Estimation & Project Metrics Report

> **Project Name**: AyurWell Intelligent Ayurvedic Diet Planning & Healthcare System  
> **Architecture**: Polyglot Multi-Tier Microservice (Spring Boot + React/TypeScript + Python FastAPI + PostgreSQL)  
> **Source Code Scale**: 16,269 Lines of Code (LOC) across 115+ Source Files  
> **Estimation Models**: COCOMO II, Function Point Analysis (FPA / IFPUG), and Bottom-Up Work Breakdown Structure (WBS)  
> **Target Audience**: Academic Reviewers, Project Evaluators, Engineering Managers, and Investors

---

## 1. Executive Summary & Codebase Scale

An exhaustive audit of the actual AyurWell codebase yields the following quantitative metrics:

| Subsystem | Primary Technology | Files | Active Lines of Code (LOC) | % of Total Code |
| :--- | :--- | :---: | :---: | :---: |
| **Frontend Web Client** | React 19, TypeScript 6, Vite 8, Tailwind CSS | 35 | **10,811** | 66.5% |
| **Backend Core Application** | Java 17/25, Spring Boot 3.2, Spring Security, JPA | 76 | **5,149** | 31.6% |
| **AI / ML Microservice** | Python 3.10+, FastAPI, Scikit-learn, Pydantic | 4 | **309** | 1.9% |
| **Total Active Production Code** | **Polyglot Stack** | **115** | **16,269 LOC** | **100.0%** |
| *Database DDL & Schemas* | SQL (PostgreSQL / H2 / MySQL) | 1 | 337 | — |
| *Nutritional Dataset (IFCT)* | ICMR-NIN Canonical Dataset | 1 | 528 Records | — |

*Note: Metrics strictly exclude `node_modules`, build artifacts (`target/`, `dist/`), and external libraries.*

---

## 2. COCOMO II (Constructive Cost Model) Estimation

The **COCOMO II** model is applied using the **Semi-Detached** project profile (representing a system with a mix of established frameworks and domain-specific clinical/Ayurvedic constraints).

### 2.1 Model Equations
1. **Effort Formula**:
   $$\text{Effort (Person-Months, PM)} = A \times (\text{Size in KLOC})^E \times \prod \text{EAF}$$
   * $A = 2.94$ (COCOMO II baseline calibration constant)
   * $\text{Size} = 16.27 \text{ KLOC}$
   * $E = 1.05$ (Scale factor exponent for semi-detached software)
   * $\text{EAF} = 0.76$ (Effort Adjustment Factor reflecting high analyst capability, modern component reuse in React/Spring Boot, and automated toolchains)

2. **Calculation**:
   $$\text{Unadjusted PM} = 2.94 \times (16.27)^{1.05} \approx 2.94 \times 18.68 = 54.92 \text{ PM}$$
   $$\text{Adjusted Effort} = 54.92 \times 0.76 \approx \mathbf{41.74 \text{ Person-Months}}$$

3. **Development Time Schedule (TDEV)**:
   $$\text{TDEV (Months)} = C \times (\text{Effort in PM})^D$$
   * $C = 3.67$
   * $D = 0.31$
   * $\text{TDEV} = 3.67 \times (41.74)^{0.31} \approx 3.67 \times 3.17 \approx \mathbf{11.6 \text{ Months (Single Developer Equivalent)}}$

### 2.2 Optimal Staffing Recommendation
$$\text{Optimal Team Size} = \frac{\text{Effort (PM)}}{\text{TDEV}} = \frac{41.74}{11.6} \approx \mathbf{3.6 \approx 4 \text{ Engineers}}$$

* With a **4-person team**, the projected development cycle is **~2.9 to 3.2 months (12–14 calendar weeks)**.

---

## 3. Function Point Analysis (FPA - IFPUG Standard)

Function Point Analysis quantifies the business and functional complexity delivered by the software independently of programming languages.

### 3.1 Unadjusted Function Points (UFP) Breakdown

| Component Type | Description in AyurWell | Count | Complexity Weight | Total FPs |
| :--- | :--- | :---: | :---: | :---: |
| **Internal Logical Files (ILFs)** | 15 Relational Entities (`users`, `user_profiles`, `meal_plans`, `raw_food_composition`, `womens_health_profiles`, etc.) | 15 | Average (10 FPs/table) | **150** |
| **External Interface Files (EIFs)** | ICMR-NIN IFCT Dataset, SMTP Mail Server, External LLM API | 3 | Average (7 FPs/EIF) | **21** |
| **External Inputs (EIs)** | Registration, Login, OTP Submit, Assessment Quiz, Diet Plan Generator, Daily Log Entry, Reminder Trigger, Symptom Logging, etc. | 18 | Average (4 FPs/EI) | **72** |
| **External Outputs (EOs)** | AyurScore Gauge, Tridosha Radar Chart, Weekly Meal Schedule, Nutrient Deficiency Risk Alert, Anemia Indicator, etc. | 12 | High (5 FPs/EO) | **60** |
| **External Inquiries (EQs)** | Recipe Catalog Query, Food Composition Search, Viruddha Conflict Lookup, Historical Profile Retrieval, etc. | 11 | Average (3 FPs/EQ) | **33** |
| **Total Unadjusted Function Points (UFP)** | | | | **336 UFP** |

### 3.2 Value Adjustment Factor (VAF)
Based on the 14 General System Characteristics (GSCs) including Data Communications (4), Distributed Processing (4), Performance Demands (4), Complex Processing (5 - Ayurveda and RDA solver), and Multiple Sites (3):
* **Total Degree of Influence (TDI)** = 42
* **Value Adjustment Factor (VAF)**:
  $$\text{VAF} = 0.65 + (0.01 \times 42) = \mathbf{1.07}$$

### 3.3 Adjusted Function Points (AFP)
$$\text{AFP} = \text{UFP} \times \text{VAF} = 336 \times 1.07 = \mathbf{359.5 \text{ Function Points}}$$

* Industry standard productivity for modern web/cloud frameworks: **9 to 11 hours per Function Point**.
* **Estimated Implementation Hours**: $359.5 \times 10 = \mathbf{3,595 \text{ Hours}}$ (~22.5 Person-Months).

---

## 4. Work Breakdown Structure (WBS) — Bottom-Up Engineering Hours

A bottom-up estimation modeling every lifecycle engineering phase:

```
┌────────────────────────────────────────────────────────────────────────┐
│             AYURWELL WORK BREAKDOWN STRUCTURE & EFFORT                 │
└────────────────────────────────────────────────────────────────────────┘

  [1. Domain Research & Data Modeling] ───────────────────────── 260 Hours
  ├── Classical Ayurveda Rules Formalization (Charaka Samhita)   80 hrs
  ├── ICMR-NIN IFCT 2017 Dataset Curation & Normalization       100 hrs
  └── Dravyaguna (Rasa, Virya, Vipaka) Schema Mapping            80 hrs

  [2. Database Architecture & DDL Implementation] ────────────── 220 Hours
  ├── 15 Relational Tables BCNF/3NF Normalization                70 hrs
  ├── Indexing Strategy & Foreign Key Cascade Constraints        50 hrs
  ├── Connection Pool Tuning (HikariCP) & H2/PostgreSQL Profiles 40 hrs
  └── Seed Data Preparation & Migration Scripts                  60 hrs

  [3. Backend REST Core Application (Spring Boot)] ───────────── 780 Hours
  ├── Security Filter, BCrypt, JWT Bearer Token, OTP Mailer     140 hrs
  ├── Prakriti Diagnostic Engine (30 Somatic Factors)           110 hrs
  ├── ICMR-NIN Nutrient & Budget Constraint Diet Planner        210 hrs
  ├── Viruddha Ahara Pairwise Toxic Conflict Engine             100 hrs
  ├── Women's Health Stage-Specific Physiology Logic            130 hrs
  └── Analytics, AyurScore Calculation & Dinacharya Scheduler    90 hrs

  [4. Machine Learning & Python Microservice (FastAPI)] ──────── 320 Hours
  ├── Dataset Preprocessing & Feature Engineering                60 hrs
  ├── Random Forest Model Training (5-Fold Cross Validation)    100 hrs
  ├── Benchmark Model Suite (Gradient Boosting, SVC, Logistic)   70 hrs
  └── Grounded LLM Prompt Augmentation & Safety Guardrails       90 hrs

  [5. Frontend Single Page Application (React 19 + TS)] ──────── 990 Hours
  ├── UI Shell, Navigation, Dark Modern Theme & Layout           90 hrs
  ├── Interactive Prakriti Quiz & Radar Chart Visualizer        140 hrs
  ├── Disease Diet Planner, Weekly Schedule & Calorie Gauges    210 hrs
  ├── Viruddha Ahara Interactive Conflict Scanner                90 hrs
  ├── Women's Health Cycle Tracker, Phase Calendars & Logs      220 hrs
  ├── AI Assistant Chatbot UI & Real-Time Q&A Interface         110 hrs
  └── Analytics Dashboard, Dinacharya Alerts & Dataset Explorer 130 hrs

  [6. Quality Assurance, Testing & Validation] ───────────────── 380 Hours
  ├── Unit Testing (JUnit 5, Mockito, Pytest)                   140 hrs
  ├── Integration Testing (REST Endpoints, JWT Security)        120 hrs
  └── End-to-End User Flow & Cross-Browser Verification         120 hrs

  [7. Deployment, DevOps & Documentation] ────────────────────── 250 Hours
  ├── Embedded Server & Production Configuration                 70 hrs
  ├── UML Class Diagrams, ER Diagrams & Architecture Guides     110 hrs
  └── User Guides & API Reference Documentation                  70 hrs

  ────────────────────────────────────────────────────────────────────────
  TOTAL ENGINEERING EFFORT:                                   3,200 Hours
  ────────────────────────────────────────────────────────────────────────
```

---

## 5. Agile Scrum Story Points & Sprint Velocity

* **Total User Stories Across 6 Epics**: 64 User Stories
* **Total Story Points (Fibonacci Scale)**: **312 Story Points**

| Epic | Description | Stories | Story Points |
| :--- | :--- | :---: | :---: |
| **Epic 1: Identity & Profile** | Auth, OTP Verification, Profile Onboarding, Roles | 9 | 38 SP |
| **Epic 2: Diagnostic Prakriti** | 30-Question Quiz, Tridosha Calculation, Agni Profiling | 7 | 34 SP |
| **Epic 3: AI Diet & Nutrition** | 7-Day Disease Diet Engine, ICMR Constraints, Budget | 14 | 76 SP |
| **Epic 4: Viruddha Ahara** | Toxic Pairing Scanner, Antidote Recommendation | 8 | 36 SP |
| **Epic 5: Women's Health** | Cycle Tracker, Trimester Scaler, Menopause Logs | 14 | 72 SP |
| **Epic 6: ML & Analytics** | Deficiency Prediction, LLM Assistant, Dinacharya | 12 | 56 SP |
| **Total** | | **64** | **312 SP** |

### Sprint Execution Model
* **Sprint Cadence**: 2-Week Sprints
* **Estimated Team Velocity**: 28–32 Story Points per Sprint (for a 3–4 person team)
* **Projected Sprints**:
  $$\text{Sprints Required} = \frac{312 \text{ SP}}{30 \text{ SP/Sprint}} \approx \mathbf{10.4 \approx 11 \text{ Sprints}}$$
* **Total Agile Duration**: $11 \times 2 = \mathbf{22 \text{ Weeks (approx. 5.5 Months)}}$.

---

## 6. Effort & Cost Summary Matrix

| Metric Dimension | Estimated Value | Explanation / Baseline |
| :--- | :--- | :--- |
| **Active Source Code** | **16,269 LOC** | Verified production code across Java, TypeScript, and Python. |
| **COCOMO II Effort** | **41.7 Person-Months** | Full lifecycle effort (Research, Design, Implementation, QA). |
| **Function Points (AFP)** | **359.5 AFPs** | Standardized functional complexity measurement (IFPUG). |
| **Direct Engineering Hours** | **3,200 Hours** | Granular bottom-up Work Breakdown Structure (WBS). |
| **Agile Story Points** | **312 Story Points** | Distributed over 64 prioritized user stories across 6 epics. |
| **Single Developer Schedule** | **~11.6 Months** | Dedicated full-time individual development timeline. |
| **Team of 4 Developers** | **~3.0 Months** | Concurrent agile sprint delivery model. |
| **Commercial Development Value** | **$128,000 – $160,000** | Calculated at average blended engineering rate of $40–$50/hour. |
