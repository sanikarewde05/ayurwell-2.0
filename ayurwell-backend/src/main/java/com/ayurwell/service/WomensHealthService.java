package com.ayurwell.service;

import com.ayurwell.dto.DietPlanDTOs.MealItemDTO;
import com.ayurwell.dto.WomensHealthDTOs.*;
import com.ayurwell.entity.Recipe;
import com.ayurwell.entity.User;
import com.ayurwell.entity.UserProfile;
import com.ayurwell.entity.WomensHealthLog;
import com.ayurwell.entity.WomensHealthProfile;
import com.ayurwell.enums.MealType;
import com.ayurwell.enums.WomensHealthStage;
import com.ayurwell.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WomensHealthService {

    @Autowired
    private WomensHealthProfileRepository womensHealthRepository;

    @Autowired
    private WomensHealthLogRepository logRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    public WomensHealthProfileResponse getProfileResponse(Long userId) {
        WomensHealthProfile profile = womensHealthRepository.findByUserId(userId).orElse(null);
        if (profile == null) {
            return null;
        }

        // If no healthStage and no lastPeriodDate, user hasn't initialized profile yet
        if (profile.getHealthStage() == null && profile.getLastPeriodDate() == null && profile.getReportedSymptoms() == null) {
            return null;
        }

        return mapToProfileResponse(profile, userId);
    }

    @Transactional
    public WomensHealthProfileResponse updateProfile(Long userId, WomensHealthProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        WomensHealthProfile profile = womensHealthRepository.findByUserId(userId)
                .orElse(WomensHealthProfile.builder().user(user).build());

        if (request.getStage() != null) {
            profile.setHealthStage(request.getStage());
        }
        if (request.getPregnancyTrimester() != null) {
            profile.setPregnancyTrimester(request.getPregnancyTrimester());
        }
        if (request.getCyclePhase() != null) {
            profile.setCyclePhase(request.getCyclePhase());
        }
        if (request.getSymptoms() != null) {
            profile.setReportedSymptoms(String.join(", ", request.getSymptoms()));
        }

        // Cycle Tracking Fields
        if (request.getLastPeriodDate() != null) {
            profile.setLastPeriodDate(request.getLastPeriodDate());
        }
        if (request.getCycleLengthDays() != null && request.getCycleLengthDays() > 0) {
            profile.setCycleLengthDays(request.getCycleLengthDays());
        }
        if (request.getPeriodDurationDays() != null && request.getPeriodDurationDays() > 0) {
            profile.setPeriodDurationDays(request.getPeriodDurationDays());
        }
        if (request.getFlowLevel() != null) {
            profile.setFlowLevel(request.getFlowLevel());
        }
        if (request.getCrampsSeverity() != null) {
            profile.setCrampsSeverity(request.getCrampsSeverity());
        }
        if (request.getMood() != null) {
            profile.setMood(request.getMood());
        }
        if (request.getEnergyLevel() != null) {
            profile.setEnergyLevel(request.getEnergyLevel());
        }

        // Menopause Fields
        if (request.getMenopauseSymptoms() != null) {
            profile.setMenopauseSymptoms(String.join(", ", request.getMenopauseSymptoms()));
        }
        if (request.getHotFlashFrequency() != null) {
            profile.setHotFlashFrequency(request.getHotFlashFrequency());
        }
        if (request.getSleepQualityRating() != null) {
            profile.setSleepQualityRating(request.getSleepQualityRating());
        }

        // Anemia / Iron Fields
        if (request.getDailyIronTargetMg() != null) {
            profile.setDailyIronTargetMg(request.getDailyIronTargetMg());
        }
        if (request.getDailyIronIntakeMg() != null) {
            profile.setDailyIronIntakeMg(request.getDailyIronIntakeMg());
        }

        WomensHealthProfile saved = womensHealthRepository.save(profile);
        return mapToProfileResponse(saved, userId);
    }

    public List<WomensHealthLogResponse> getLogs(Long userId) {
        List<WomensHealthLog> logs = logRepository.findByUserIdOrderByLogDateDesc(userId);
        return logs.stream().map(this::mapToLogResponse).collect(Collectors.toList());
    }

    @Transactional
    public WomensHealthLogResponse saveLog(Long userId, WomensHealthLogRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        LocalDate date = request.getLogDate() != null ? request.getLogDate() : LocalDate.now();
        String type = request.getLogType() != null ? request.getLogType() : "WELLNESS";

        WomensHealthLog log = logRepository.findByUserIdAndLogDateAndLogType(userId, date, type)
                .orElse(WomensHealthLog.builder().user(user).logDate(date).logType(type).build());

        log.setFlowLevel(request.getFlowLevel());
        log.setCrampsSeverity(request.getCrampsSeverity());
        log.setMood(request.getMood());
        log.setEnergy(request.getEnergy());
        log.setSymptoms(request.getSymptoms() != null ? String.join(", ", request.getSymptoms()) : null);
        log.setIronIntakeMg(request.getIronIntakeMg());
        log.setWaterIntakeL(request.getWaterIntakeL());
        log.setSleepHours(request.getSleepHours());
        log.setNotes(request.getNotes());

        // Calculate transparent non-medical Women's Wellness Score (0-100)
        int score = calculateWellnessScore(request);
        log.setWellnessScore(score);

        WomensHealthLog savedLog = logRepository.save(log);

        // Update latest profile iron / period date if applicable
        WomensHealthProfile profile = womensHealthRepository.findByUserId(userId).orElse(null);
        if (profile != null) {
            boolean profileUpdated = false;
            if (request.getIronIntakeMg() != null) {
                profile.setDailyIronIntakeMg(request.getIronIntakeMg());
                profileUpdated = true;
            }
            if ("MENSTRUAL".equalsIgnoreCase(type) && request.getFlowLevel() != null && !request.getFlowLevel().isBlank()) {
                if (profile.getLastPeriodDate() == null || !profile.getLastPeriodDate().isAfter(date)) {
                    profile.setLastPeriodDate(date);
                    profileUpdated = true;
                }
            }
            if (profileUpdated) {
                womensHealthRepository.save(profile);
            }
        }

        return mapToLogResponse(savedLog);
    }

    @Transactional
    public void deleteLog(Long userId, Long logId) {
        WomensHealthLog log = logRepository.findById(logId)
                .orElseThrow(() -> new RuntimeException("Log not found: " + logId));
        if (!log.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete log");
        }
        logRepository.delete(log);
    }

    // Backwards-compatible methods
    @Transactional
    public WomensHealthPlanResponse updateAndGetNutritionPlan(Long userId, WomensHealthProfileRequest request) {
        WomensHealthProfileResponse resp = updateProfile(userId, request);
        return resp != null ? resp.getPlan() : null;
    }

    public WomensHealthPlanResponse getNutritionPlan(Long userId) {
        return getNutritionPlan(userId, null, null);
    }

    public WomensHealthPlanResponse getNutritionPlan(Long userId, WomensHealthStage overrideStage, Integer overrideTrimester) {
        WomensHealthProfile profile = womensHealthRepository.findByUserId(userId).orElse(null);
        WomensHealthStage effectiveStage = overrideStage != null ? overrideStage
                : (profile != null && profile.getHealthStage() != null ? profile.getHealthStage() : WomensHealthStage.MENSTRUATION);
        Integer effectiveTrimester = overrideTrimester != null ? overrideTrimester
                : (profile != null && profile.getPregnancyTrimester() != null ? profile.getPregnancyTrimester() : 1);
        return buildNutritionPlan(effectiveStage, effectiveTrimester, userId);
    }

    // =========================================================================
    // INTERNAL HELPERS & AYURVEDIC PROTOCOL BUILDERS
    // =========================================================================

    private WomensHealthProfileResponse mapToProfileResponse(WomensHealthProfile profile, Long userId) {
        LocalDate today = LocalDate.now();
        Integer currentCycleDay = null;
        LocalDate estimatedNextPeriod = null;
        String estimatedCyclePhase = "Follicular Phase (Kapha Building)";
        Boolean isPeriodActive = false;

        if (profile.getLastPeriodDate() != null) {
            long daysDiff = ChronoUnit.DAYS.between(profile.getLastPeriodDate(), today);
            int cycleLen = (profile.getCycleLengthDays() != null && profile.getCycleLengthDays() > 0)
                    ? profile.getCycleLengthDays() : 28;
            int duration = (profile.getPeriodDurationDays() != null && profile.getPeriodDurationDays() > 0)
                    ? profile.getPeriodDurationDays() : 5;

            if (daysDiff >= 0) {
                currentCycleDay = (int) (daysDiff % cycleLen) + 1;
                long cyclesPassed = daysDiff / cycleLen;
                estimatedNextPeriod = profile.getLastPeriodDate().plusDays((cyclesPassed + 1) * cycleLen);

                if (currentCycleDay <= duration) {
                    estimatedCyclePhase = "Menstrual Phase (Apana Vayu Active)";
                    isPeriodActive = true;
                } else if (currentCycleDay <= (cycleLen / 2 - 2)) {
                    estimatedCyclePhase = "Follicular Phase (Kapha Building)";
                } else if (currentCycleDay <= (cycleLen / 2 + 2)) {
                    estimatedCyclePhase = "Ovulatory Phase (Pitta Peak)";
                } else {
                    estimatedCyclePhase = "Luteal Phase (Vata-Pitta Transition)";
                }
            } else {
                currentCycleDay = 1;
                estimatedNextPeriod = profile.getLastPeriodDate();
            }
        }

        List<String> symptomsList = profile.getReportedSymptoms() != null && !profile.getReportedSymptoms().isBlank()
                ? Arrays.stream(profile.getReportedSymptoms().split(","))
                    .map(String::trim).filter(s -> !s.isEmpty()).collect(Collectors.toList())
                : new ArrayList<>();

        List<String> menopauseSymptomsList = profile.getMenopauseSymptoms() != null && !profile.getMenopauseSymptoms().isBlank()
                ? Arrays.stream(profile.getMenopauseSymptoms().split(","))
                    .map(String::trim).filter(s -> !s.isEmpty()).collect(Collectors.toList())
                : new ArrayList<>();

        WomensHealthStage stage = profile.getHealthStage() != null ? profile.getHealthStage() : WomensHealthStage.MENSTRUATION;
        Integer trimester = profile.getPregnancyTrimester() != null ? profile.getPregnancyTrimester() : 1;

        WomensHealthPlanResponse plan = buildNutritionPlan(stage, trimester, userId);

        return WomensHealthProfileResponse.builder()
                .id(profile.getId())
                .stage(profile.getHealthStage())
                .pregnancyTrimester(profile.getPregnancyTrimester())
                .cyclePhase(profile.getCyclePhase() != null ? profile.getCyclePhase() : estimatedCyclePhase)
                .symptoms(symptomsList)
                .lastPeriodDate(profile.getLastPeriodDate())
                .cycleLengthDays(profile.getCycleLengthDays() != null ? profile.getCycleLengthDays() : 28)
                .periodDurationDays(profile.getPeriodDurationDays() != null ? profile.getPeriodDurationDays() : 5)
                .flowLevel(profile.getFlowLevel())
                .crampsSeverity(profile.getCrampsSeverity())
                .mood(profile.getMood())
                .energyLevel(profile.getEnergyLevel())
                .currentCycleDay(currentCycleDay)
                .estimatedNextPeriod(estimatedNextPeriod)
                .estimatedCyclePhase(estimatedCyclePhase)
                .isPeriodActive(isPeriodActive)
                .menopauseSymptoms(menopauseSymptomsList)
                .hotFlashFrequency(profile.getHotFlashFrequency())
                .sleepQualityRating(profile.getSleepQualityRating())
                .dailyIronTargetMg(profile.getDailyIronTargetMg() != null ? profile.getDailyIronTargetMg() : 18.0)
                .dailyIronIntakeMg(profile.getDailyIronIntakeMg() != null ? profile.getDailyIronIntakeMg() : 0.0)
                .plan(plan)
                .build();
    }

    private WomensHealthPlanResponse buildNutritionPlan(WomensHealthStage stage, Integer trimester, Long userId) {
        List<String> foodsToEat = new ArrayList<>();
        List<String> foodsToAvoid = new ArrayList<>();
        List<String> lifestyle = new ArrayList<>();
        List<String> herbs = new ArrayList<>();
        List<String> doshaInsights = new ArrayList<>();
        String title = "";
        String overview = "";
        String trimesterNotice = null;

        // Fetch user's actual Prakriti
        UserProfile userProfile = userProfileRepository.findByUserId(userId).orElse(null);
        String dosha = userProfile != null && userProfile.getPrimaryDosha() != null
                ? userProfile.getPrimaryDosha().name() : "TRIDOSHA";

        switch (stage) {
            case PCOS:
                title = "Ayurvedic PCOS & Insulin Sensitivity Nutrition Plan";
                overview = "PCOS is viewed in Ayurveda as a Kapha-Vata imbalance leading to clogged Srotas (micro-channels) and sluggish Agni. Diet focuses on low-GI, anti-inflammatory, and Medho-hara (fat metabolizing) foods.";
                foodsToEat.addAll(List.of("Yellow Moong Dal & Sprouted Lentils", "Ancient Barley (Jav) & Millets", "Cinnamon & Fenugreek (Methi) seeds", "Bitter Gourd (Karela)", "A2 Cow Ghee (measured)", "Flaxseeds & Spearmint Tea"));
                foodsToAvoid.addAll(List.of("Refined Sugar, Maida & Sweetened Drinks", "Cold Dairy / Thick Ice Cream", "Deep-fried savories & trans-fats", "Excessive Unfermented Soy"));
                lifestyle.addAll(List.of("Surya Namaskar (12 gentle rounds at dawn)", "Kapalabhati & Nadi Shodhana Pranayama", "12-14 hour overnight circadian fasting", "Consistent sleep prior to 10:30 PM"));
                herbs.addAll(List.of("Kanchanar Guggulu (clears ovarian micro-stagnation)", "Shatavari (balances follicular hormones)", "Spearmint (reduces excess androgens)", "Triphala (gently purges metabolic Ama)"));
                break;

            case PREGNANCY:
                title = "Garbhini Paricharya (Ayurvedic Prenatal Garbha Nutrition)";
                overview = "Ayurvedic prenatal care emphasizes Ojas-building, sattvic, nutrient-dense foods to support maternal vitality, blood building, and healthy fetal tissue development (Dhatu Samya).";
                trimesterNotice = "This module provides general nutrition and wellness information and does not replace advice from your healthcare professional.";

                if (trimester != null && trimester == 1) {
                    overview += " Trimester 1 focuses on soothing morning sickness, calming Vata, and replenishing cellular folate.";
                    foodsToEat.addAll(List.of("Warm Milk with crushed Green Cardamom", "Light Moong Dal Soup with Cumin", "Dry Poha or Puffed Rice for nausea", "Soaked Almonds (peeled)", "Tender Coconut Water"));
                } else if (trimester != null && trimester == 2) {
                    overview += " Trimester 2 focuses on maternal blood building (Rakta Dhatu) and fetal skeletal calcium.";
                    foodsToEat.addAll(List.of("A2 Desi Cow Ghee with warm milk", "Ragi & Bajra Porridge (Calcium & Iron)", "Soaked Walnuts & Black Raisins", "Fresh Pomegranate & Beetroot Soup", "Fresh Paneer in moderation"));
                } else {
                    overview += " Trimester 3 focuses on softening pelvic tissues, balancing Apana Vayu, and optimal hydration.";
                    foodsToEat.addAll(List.of("Warm Desi Ghee in Rice / Khichdi", "Stewed Apples with Cloves", "Flaxseed meal for smooth bowel motility", "Warm Herbal Spiced Soups", "Dates soaked in warm milk"));
                }

                foodsToAvoid.addAll(List.of("Raw unwashed Sprouts & Raw Papaya", "Excessive hot red chillies & mustard seeds", "Unpasteurized soft cheeses & leftover frozen meals", "Heavy fried foods that extinguish Agni"));
                lifestyle.add("This module provides general nutrition and wellness information and does not replace advice from your healthcare professional.");
                lifestyle.addAll(List.of("Gentle prenatal walking & prenatal yoga", "Listening to soothing Vedic chanting / Gandharva Veda", "Gentle warm foot oil massage (Pada Abhyanga)", "Deep restful sleep on the left side"));
                herbs.addAll(List.of("Shatavari (supreme reproductive tonic)", "Yashtimadhu (Licorice - in mild culinary amounts)", "Brahmi (calms prenatal anxiety)"));
                break;

            case POSTPARTUM:
                title = "Sutika Paricharya (Ayurvedic Postpartum Restorative Protocol)";
                overview = "The postpartum period (Sutika Kala) involves heightened Vata and depleted Dhatus after delivery. Nutrition emphasizes Agni rekindling, tissue rejuvenation, Stanyajanana (healthy lactation), and nervous system grounding.";
                foodsToEat.addAll(List.of("Gond & Methi Laddoos cooked in pure A2 Desi Cow Ghee", "Warm A2 Milk with Green Cardamom, Nutmeg & Shatavari", "Roasted Cumin & Fennel Water (Deepana & Stanyajanana)", "Soft Moong Dal & Garlic Khichdi with Ghee", "Warm Broken Wheat (Dalia) Porridge with Soaked Almonds"));
                foodsToAvoid.addAll(List.of("Cold, refrigerated water & carbonated drinks (severely aggravate Vata)", "Raw dry salads, gas-producing unfermented beans & cabbage", "Heavy deep-fried oily foods that extinguish Agni", "Excessive caffeine & stimulants that disrupt rest"));
                lifestyle.addAll(List.of("Gentle Daily Sesame Oil Abhyanga (full-body oil massage) followed by warm bath", "Abdominal binding (Udaraveshtana) for gentle uterine involution & support", "Strict restorative rest during the sacred 40-day recovery window", "Calming Pranayama (Nadi Shodhana) & evening herbal foot massage"));
                herbs.addAll(List.of("Shatavari (classical galactagogue for nourishing lactation)", "Dashamularishta (traditional uterine recovery tonic)", "Jeerakarishta (stimulates postpartum Agni & clears Ama)", "Ashwagandha (rebuilds maternal vitality & soothes fatigue)"));
                break;

            case MENOPAUSE:
                title = "Vata-Pacifying Menopause Transition Protocol";
                overview = "Menopause marks the natural transition into the Vata phase of life. Protocol emphasizes phytoestrogen-rich, anti-dryness, and Asthi Dhatu (bone density) nourishing Ayurvedic nutrition.";
                foodsToEat.addAll(List.of("Soaked White Sesame Seeds (Til - rich in plant calcium)", "Warm Almond Milk with Ashwagandha & Nutmeg", "Golden Flaxseed powder (lignans & healthy fats)", "Stewed Apples with Ceylon Cinnamon", "Steamed Dark Leafy Greens"));
                foodsToAvoid.addAll(List.of("Alcohol, excess Caffeine & Smoking", "Extremely pungent hot chili peppers (triggers hot flashes)", "Heavily salted processed chips & crackers", "Late-night heavy dining"));
                lifestyle.addAll(List.of("Daily Warm Sesame Oil Massage (Abhyanga)", "Moonlight walking & evening Sheetali Pranayama", "Weight-bearing gentle walking for bone mineralization", "Fixed sleep routine before 10:00 PM"));
                herbs.addAll(List.of("Shatavari (natural phytoestrogen support)", "Ashwagandha (vitality & nervous calm)", "Praval Pishti (pure Coral Calcium for bone density)", "Shankhpushpi (promotes sound deep sleep)"));
                break;

            case ANEMIA:
                title = "Pandu Roga (Anemia & Bioavailable Iron Reinvigoration)";
                overview = "Anemia (Pandu Roga) is characterized by impaired Rakta Dhatu (blood tissue) and sluggish liver function. Nutrition focuses on bioavailable plant iron paired with natural Vitamin C catalysts for maximum absorption.";
                foodsToEat.addAll(List.of("Black Raisins (Munakka) soaked overnight in water", "Moringa / Drumstick Leaf Soup cooked with Cumin", "Organic Beetroot & Pomegranate juice with lemon", "Palak cooked in a cast iron skillet with A2 Ghee", "Sprouted Ragi & Jaggery Ladoo"));
                foodsToAvoid.addAll(List.of("Tea or Coffee within 1 hour before or after meals (tannins block iron absorption)", "Sour curd consumed at night", "Excessive refined vinegar & preservative pickles"));
                lifestyle.addAll(List.of("Gentle morning sunbathing (15 mins) for systemic vitality", "Anulom Vilom Pranayama (enhances oxygenation)", "Adequate rest; avoid sleeping immediately after lunch"));
                herbs.addAll(List.of("Dhatri Lauh / Loha Bhasma (traditional Ayurvedic iron)", "Punarnava (clears fluid retention & supports liver)", "Amalaki (Vitamin C catalyst for iron uptake)"));
                break;

            case MENSTRUATION:
            default:
                title = "Rajaswala Paricharya (Menstrual Harmony Protocol)";
                overview = "During menstruation, Apana Vayu actively directs downward energy. Nutrition must be warm, soothing, easily digestible, and rich in bioavailable iron to prevent systemic exhaustion.";
                foodsToEat.addAll(List.of("Warm Ginger, Ajwain & Jaggery Water", "Easily assimilable Moong Dal Khichdi with Ghee", "Warm Beetroot, Carrot & Coriander Soup", "Black Sesame Seeds & Dates", "Soaked Raisins"));
                foodsToAvoid.addAll(List.of("Ice-cold refrigerated water & sodas (stagnates Apana Vayu)", "Excessive Caffeine & energy drinks", "Heavy non-vegetarian or oily fast foods", "Raw cold leafy salads"));
                lifestyle.addAll(List.of("Restorative downtime & avoiding strenuous workouts", "Warm castor oil pack or hot water bag on lower abdomen", "Early bedtime with herbal foot massage"));
                herbs.addAll(List.of("Ashoka (Saraca asoca - supreme uterine tonic)", "Lodhra (soothes heavy flow & cramping)", "Kumaryasava (Aloe vera liver & reproductive elixir)", "Dashamula (relieves spasms)"));
                break;
        }

        // Add Dosha-Specific Considerations
        if (dosha.contains("PITTA")) {
            doshaInsights.add("Pitta Constitution: Prioritize cooling virya foods (Amalaki, Coconut water, Fennel) to prevent excessive inflammatory bleeding, acne, and hot sensations.");
        } else if (dosha.contains("VATA")) {
            doshaInsights.add("Vata Constitution: Emphasize warm, moist, unctuous foods (A2 Ghee, warm soups, soaked nuts) to soothe lower abdominal cramps, anxiety, and bloating.");
        } else if (dosha.contains("KAPHA")) {
            doshaInsights.add("Kapha Constitution: Favor light, warming, digestive spices (Ginger, Cinnamon, Fenugreek) to counteract water retention, heaviness, and sluggish metabolism.");
        } else {
            doshaInsights.add("Tridoshic Balance: Enjoy balanced meals cooked fresh with mild cumin, coriander, and turmeric tadka.");
        }

        // Fetch dynamic matching recipes from Database
        List<Recipe> matchingRecipes = recipeRepository.findBySuitableWomensHealthStageContaining(stage.name());
        List<MealItemDTO> meals = new ArrayList<>();

        if (matchingRecipes != null && !matchingRecipes.isEmpty()) {
            for (Recipe r : matchingRecipes) {
                meals.add(MealItemDTO.builder()
                        .id(r.getId())
                        .mealType(r.getMealType())
                        .recipeTitle(r.getTitle())
                        .recipeDescription(r.getDescription())
                        .calories(r.getCalories())
                        .protein(r.getProteinGrams())
                        .costInr(r.getCostPerServingInr())
                        .build());
            }
        }

        // Fallback default authentic meals if database has fewer than 2
        if (meals.size() < 2) {
            meals.add(MealItemDTO.builder()
                    .id(201L)
                    .mealType(MealType.BREAKFAST)
                    .recipeTitle("Warm Ragi & Jaggery Porridge with Soaked Almonds")
                    .recipeDescription("Rich in natural bioavailable calcium and iron for cellular vitality.")
                    .calories(240.0)
                    .protein(6.5)
                    .costInr(30.0)
                    .build());
            meals.add(MealItemDTO.builder()
                    .id(202L)
                    .mealType(MealType.LUNCH)
                    .recipeTitle("Iron-Skillet Palak Moong Dal with Cumin Ghee Tadka")
                    .recipeDescription("Enhances hemoglobin synthesis and balances Apana Vayu.")
                    .calories(360.0)
                    .protein(15.0)
                    .costInr(45.0)
                    .build());
        }

        return WomensHealthPlanResponse.builder()
                .stage(stage)
                .title(title)
                .overview(overview)
                .recommendedFoods(foodsToEat)
                .foodsToAvoid(foodsToAvoid)
                .lifestyleGuidelines(lifestyle)
                .recommendedHerbs(herbs)
                .suggestedMeals(meals)
                .doshaTailoredInsights(doshaInsights)
                .trimesterNotice(trimesterNotice)
                .build();
    }

    private int calculateWellnessScore(WomensHealthLogRequest req) {
        int score = 45; // base

        // Hydration contribution (up to 15)
        if (req.getWaterIntakeL() != null) {
            if (req.getWaterIntakeL() >= 2.5) score += 15;
            else if (req.getWaterIntakeL() >= 1.5) score += 10;
            else if (req.getWaterIntakeL() >= 1.0) score += 5;
        }

        // Sleep contribution (up to 15)
        if (req.getSleepHours() != null) {
            if (req.getSleepHours() >= 7 && req.getSleepHours() <= 9) score += 15;
            else if (req.getSleepHours() >= 6) score += 10;
            else score += 5;
        }

        // Iron intake contribution (up to 15)
        if (req.getIronIntakeMg() != null) {
            if (req.getIronIntakeMg() >= 18.0) score += 15;
            else if (req.getIronIntakeMg() >= 12.0) score += 10;
            else score += 5;
        }

        // Energy & Mood (up to 10)
        if ("High".equalsIgnoreCase(req.getEnergy())) score += 5;
        else if ("Moderate".equalsIgnoreCase(req.getEnergy())) score += 3;

        if ("Balanced".equalsIgnoreCase(req.getMood())) score += 5;
        else if ("Sensitive".equalsIgnoreCase(req.getMood())) score += 3;

        return Math.min(100, Math.max(20, score));
    }

    private WomensHealthLogResponse mapToLogResponse(WomensHealthLog log) {
        List<String> symptomsList = log.getSymptoms() != null && !log.getSymptoms().isBlank()
                ? Arrays.stream(log.getSymptoms().split(","))
                    .map(String::trim).filter(s -> !s.isEmpty()).collect(Collectors.toList())
                : new ArrayList<>();

        return WomensHealthLogResponse.builder()
                .id(log.getId())
                .logDate(log.getLogDate())
                .logType(log.getLogType())
                .flowLevel(log.getFlowLevel())
                .crampsSeverity(log.getCrampsSeverity())
                .mood(log.getMood())
                .energy(log.getEnergy())
                .symptoms(symptomsList)
                .ironIntakeMg(log.getIronIntakeMg())
                .waterIntakeL(log.getWaterIntakeL())
                .sleepHours(log.getSleepHours())
                .wellnessScore(log.getWellnessScore())
                .notes(log.getNotes())
                .build();
    }
}
