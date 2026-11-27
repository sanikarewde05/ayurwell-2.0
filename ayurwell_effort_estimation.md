# AyurWell Healthcare Platform — Software Effort Estimation & Project Metrics Report

> **Project Name**: AyurWell Intelligent Ayurvedic Diet Planning & Healthcare System  
> **Architecture**: Polyglot Multi-Tier Microservice (Spring Boot + React/TypeScript + Python FastAPI + PostgreSQL)  
> **Source Code Scale**: 16,269 Lines of Code (LOC) across 115+ Source Files  
> **Estimation Models**: COCOMO II, Function Point Analysis (FPA / IFPUG), and Bottom-Up Work Breakdown Structure (WBS)

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

---

## 2. COCOMO II (Constructive Cost Model) Estimation

The **COCOMO II** model is applied using the **Semi-Detached** project profile (representing a system with a mix of established frameworks and domain-specific clinical/Ayurvedic constraints).

1. **Effort Formula**:
   $$\text{Effort (Person-Months, PM)} = A \times (\text{Size in KLOC})^E \times \prod \text{EAF}$$
   * $A = 2.94$
   * $\text{Size} = 16.27 \text{ KLOC}$
   * $E = 1.05$
   * $\text{EAF} = 0.76$ (Reflecting high analyst capability and modern component reuse)
   * **Calculated Effort**: $$\mathbf{41.74 \text{ Person-Months}}$$

2. **Development Time Schedule (TDEV)**:
   $$\text{TDEV} = 3.67 \times (41.74)^{0.31} \approx \mathbf{11.6 \text{ Months (Single Developer Equivalent)}}$$

3. **Optimal Staffing**:
   $$\text{Team Size} = \frac{41.74}{11.6} \approx \mathbf{4 \text{ Engineers (3.2 calendar months)}}$$

---

## 3. Function Point Analysis (FPA - IFPUG Standard)

| Component Type | Description in AyurWell | Count | Complexity Weight | Total FPs |
| :--- | :--- | :---: | :---: | :---: |
| **Internal Logical Files (ILFs)** | 15 Relational Entities (`users`, `user_profiles`, `meal_plans`, `raw_food_composition`, etc.) | 15 | Average (10 FPs/table) | **150** |
| **External Interface Files (EIFs)** | ICMR-NIN IFCT Dataset, SMTP Mail Server, External LLM API | 3 | Average (7 FPs/EIF) | **21** |
| **External Inputs (EIs)** | Registration, Login, OTP, Quiz, Diet Plan Generator, Daily Log, Reminders, etc. | 18 | Average (4 FPs/EI) | **72** |
| **External Outputs (EOs)** | AyurScore Gauge, Tridosha Radar Chart, Weekly Meal Schedule, Deficiency Alert, etc. | 12 | High (5 FPs/EO) | **60** |
| **External Inquiries (EQs)** | Recipe Catalog, Food Composition, Viruddha Conflict Lookup, Profiles, etc. | 11 | Average (3 FPs/EQ) | **33** |
| **Total Unadjusted Function Points (UFP)** | | | | **336 UFP** |

* **Value Adjustment Factor (VAF)**: $0.65 + (0.01 \times 42) = \mathbf{1.07}$
* **Adjusted Function Points (AFP)**: $336 \times 1.07 = \mathbf{359.5 \text{ AFPs}}$
* **Estimated Implementation Hours**: $359.5 \times 10 = \mathbf{3,595 \text{ Hours}}$ (~22.5 Person-Months).

---

## 4. Work Breakdown Structure (WBS) — Bottom-Up Engineering Hours

1. **Domain Research & Data Modeling**: 260 Hours
2. **Database Architecture & DDL Implementation**: 220 Hours
3. **Backend REST Core Application (Spring Boot)**: 780 Hours
4. **Machine Learning & Python Microservice (FastAPI)**: 320 Hours
5. **Frontend Single Page Application (React 19 + TS)**: 990 Hours
6. **Quality Assurance, Testing & Validation**: 380 Hours
7. **Deployment, DevOps & Documentation**: 250 Hours
* **Total Bottom-Up Engineering Effort**: $$\mathbf{3,200 \text{ Hours}}$$

---

## 5. Agile Scrum Story Points & Sprint Velocity

* **Total User Stories Across 6 Epics**: 64 User Stories
* **Total Story Points (Fibonacci Scale)**: **312 Story Points**
* **Sprint Cadence**: 2-Week Sprints
* **Estimated Team Velocity**: 30 Story Points per Sprint
* **Projected Sprints**: $$\mathbf{11 \text{ Sprints (approx. 22 Weeks / 5.5 Months)}}$$
