package com.ayurwell.service;

import com.ayurwell.dto.DietPlanDTOs.*;
import com.ayurwell.entity.*;
import com.ayurwell.enums.DoshaType;
import com.ayurwell.enums.MealType;
import com.ayurwell.enums.RituSeason;
import com.ayurwell.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DietPlannerService {

    @Autowired
    private MealPlanRepository mealPlanRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository profileRepository;

    @Autowired
    private RawFoodCompositionRepository rawFoodRepository;

    @Transactional
    public DietPlanResponse generatePersonalizedPlan(Long userId, DietPlanGenerateRequest request) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }
        if (user == null) {
            user = userRepository.findByEmail("demo@ayurwell.com").orElse(null);
        }
        UserProfile profile = (user != null) ? profileRepository.findByUserId(user.getId()).orElse(null) : null;

        DoshaType dosha = (profile != null && profile.getPrimaryDosha() != null) ? profile.getPrimaryDosha() : DoshaType.TRIDOSHA;
        String disease = (request.getTargetDisease() != null && !request.getTargetDisease().isBlank())
                ? request.getTargetDisease()
                : (profile != null && profile.getTargetDiseaseCondition() != null ? profile.getTargetDiseaseCondition() : "General Digestive Health");

        String season = (request.getSeason() != null && !request.getSeason().isBlank()) ? request.getSeason() : "VASANTA";
        String womensHealth = (request.getWomensHealthStage() != null && !request.getWomensHealthStage().isBlank()) ? request.getWomensHealthStage() : "NONE";
        int duration = (request.getDurationDays() != null && request.getDurationDays() > 0) ? request.getDurationDays() : 7;
        String dietaryPref = (request.getDietaryPreference() != null && !request.getDietaryPreference().isBlank()) ? request.getDietaryPreference() : "Vegetarian";
        String cuisine = (request.getCuisinePreference() != null && !request.getCuisinePreference().isBlank()) ? request.getCuisinePreference() : "Indian";

        List<String> includedMeals = (request.getIncludedMeals() != null && !request.getIncludedMeals().isEmpty())
                ? request.getIncludedMeals()
                : List.of("BREAKFAST", "MID_MORNING", "LUNCH", "EVENING_SNACK", "DINNER");

        double targetCal = (request.getTargetCalories() != null && request.getTargetCalories() > 500)
                ? request.getTargetCalories()
                : calculateTargetCalories(profile, disease);

        List<MealItemDTO> allMeals = new ArrayList<>();
        double totalCostSum = 0.0;
        double totalCalSum = 0.0;
        double totalProteinSum = 0.0;
        double totalCarbsSum = 0.0;
        double totalFatSum = 0.0;
        double totalFiberSum = 0.0;
        double totalIronSum = 0.0;
        double totalCalciumSum = 0.0;
        double totalB12Sum = 0.0;
        double totalVitDSum = 0.0;
        double totalFolateSum = 0.0;

        for (int day = 1; day <= duration; day++) {
            String dayLabel = "Day " + day;
            List<MealItemDTO> dayMeals = generateDayMeals(day, dayLabel, disease, dosha, dietaryPref, cuisine, includedMeals, request.getAllergies());
            allMeals.addAll(dayMeals);

            for (MealItemDTO m : dayMeals) {
                totalCostSum += (m.getCostInr() != null ? m.getCostInr() : 30.0);
                totalCalSum += (m.getCalories() != null ? m.getCalories() : 0.0);
                totalProteinSum += (m.getProtein() != null ? m.getProtein() : 0.0);
                totalCarbsSum += (m.getCarbs() != null ? m.getCarbs() : 0.0);
                totalFatSum += (m.getFat() != null ? m.getFat() : 0.0);
                totalFiberSum += (m.getFiber() != null ? m.getFiber() : 0.0);
                totalIronSum += (m.getIronMg() != null ? m.getIronMg() : 0.0);
                totalCalciumSum += (m.getCalciumMg() != null ? m.getCalciumMg() : 0.0);
                totalB12Sum += (m.getVitaminB12Mcg() != null ? m.getVitaminB12Mcg() : 0.0);
                totalVitDSum += (m.getVitaminDIu() != null ? m.getVitaminDIu() : 0.0);
                totalFolateSum += (m.getFolateMcg() != null ? m.getFolateMcg() : 0.0);
            }
        }

        double dailyAvgCost = Math.round((totalCostSum / duration) * 10.0) / 10.0;
        double dailyAvgCal = Math.round((totalCalSum / duration) * 10.0) / 10.0;
        double dailyAvgProtein = Math.round((totalProteinSum / duration) * 10.0) / 10.0;
        double dailyAvgCarbs = Math.round((totalCarbsSum / duration) * 10.0) / 10.0;
        double dailyAvgFat = Math.round((totalFatSum / duration) * 10.0) / 10.0;
        double dailyAvgFiber = Math.round((totalFiberSum / duration) * 10.0) / 10.0;
        double dailyAvgIron = Math.round((totalIronSum / duration) * 10.0) / 10.0;
        double dailyAvgCalcium = Math.round((totalCalciumSum / duration) * 10.0) / 10.0;
        double dailyAvgB12 = Math.round((totalB12Sum / duration) * 100.0) / 100.0;
        double dailyAvgVitD = Math.round((totalVitDSum / duration) * 10.0) / 10.0;
        double dailyAvgFolate = Math.round((totalFolateSum / duration) * 10.0) / 10.0;

        int score = calculateAyurScore(dosha, disease, womensHealth, dailyAvgCost, request.getMaxDailyBudget());

        List<String> tips = getClinicalAndAyurvedicTips(disease, dosha);
        List<String> foodsToLimit = getFoodsToLimit(disease, dosha);
        Map<String, Object> ayurvedicConsiderations = buildAyurvedicConsiderations(dosha, disease);

        String planTitle = disease + " & " + dosha + " " + duration + "-Day Personalized Diet";

        MealPlan plan = MealPlan.builder()
                .user(user)
                .planName(planTitle)
                .targetDisease(disease)
                .season(season)
                .womensHealthStage(womensHealth)
                .totalDailyBudgetInr(dailyAvgCost)
                .totalDailyCalories(dailyAvgCal)
                .ayurvedicNutritionScore(score)
                .build();

        mealPlanRepository.save(plan);

        return DietPlanResponse.builder()
                .id(plan.getId())
                .planName(planTitle)
                .targetDisease(disease)
                .season(season)
                .womensHealthStage(womensHealth)
                .durationDays(duration)
                .dietaryPreference(dietaryPref)
                .cuisinePreference(cuisine)
                .totalDailyBudgetInr(dailyAvgCost)
                .totalDailyCalories(dailyAvgCal)
                .dailyAverageProtein(dailyAvgProtein)
                .dailyAverageCarbs(dailyAvgCarbs)
                .dailyAverageFat(dailyAvgFat)
                .dailyAverageFiber(dailyAvgFiber)
                .dailyAverageIron(dailyAvgIron)
                .dailyAverageCalcium(dailyAvgCalcium)
                .dailyAverageB12(dailyAvgB12)
                .dailyAverageVitD(dailyAvgVitD)
                .dailyAverageFolate(dailyAvgFolate)
                .ayurvedicNutritionScore(score)
                .meals(allMeals)
                .dietaryTips(tips)
                .foodsToLimit(foodsToLimit)
                .ayurvedicConsiderations(ayurvedicConsiderations)
                .createdAt(plan.getCreatedAt() != null ? plan.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE) : "")
                .build();
    }

    @Transactional
    public DietPlanResponse saveCustomPlan(Long userId, SaveDietPlanRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not authenticated"));

        int score = (request.getAyurvedicNutritionScore() != null) ? request.getAyurvedicNutritionScore() : 92;
        String disease = (request.getTargetDisease() != null) ? request.getTargetDisease() : "General Digestive Health";
        String name = (request.getPlanName() != null && !request.getPlanName().isBlank())
                ? request.getPlanName()
                : (disease + " Personalized Diet Plan");

        MealPlan plan;
        if (request.getId() != null) {
            plan = mealPlanRepository.findById(request.getId())
                    .filter(p -> p.getUser().getId().equals(userId))
                    .orElseGet(() -> MealPlan.builder().user(user).build());
        } else {
            plan = MealPlan.builder().user(user).build();
        }

        plan.setPlanName(name);
        plan.setTargetDisease(disease);
        plan.setSeason(request.getSeason() != null ? request.getSeason() : "VASANTA");
        plan.setTotalDailyBudgetInr(request.getTotalDailyBudgetInr() != null ? request.getTotalDailyBudgetInr() : 150.0);
        plan.setTotalDailyCalories(request.getTotalDailyCalories() != null ? request.getTotalDailyCalories() : 1850.0);
        plan.setAyurvedicNutritionScore(score);

        MealPlan saved = mealPlanRepository.save(plan);

        return DietPlanResponse.builder()
                .id(saved.getId())
                .planName(saved.getPlanName())
                .targetDisease(saved.getTargetDisease())
                .season(saved.getSeason())
                .durationDays(request.getDurationDays() != null ? request.getDurationDays() : 7)
                .dietaryPreference(request.getDietaryPreference() != null ? request.getDietaryPreference() : "Vegetarian")
                .cuisinePreference(request.getCuisinePreference() != null ? request.getCuisinePreference() : "Indian")
                .totalDailyBudgetInr(saved.getTotalDailyBudgetInr())
                .totalDailyCalories(saved.getTotalDailyCalories())
                .ayurvedicNutritionScore(saved.getAyurvedicNutritionScore())
                .meals(request.getMeals() != null ? request.getMeals() : List.of())
                .dietaryTips(request.getDietaryTips() != null ? request.getDietaryTips() : List.of())
                .foodsToLimit(request.getFoodsToLimit() != null ? request.getFoodsToLimit() : List.of())
                .createdAt(saved.getCreatedAt() != null ? saved.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE) : "")
                .build();
    }

    public List<SavedPlanSummaryDTO> getUserSavedPlans(Long userId) {
        if (userId == null) return List.of();
        List<MealPlan> plans = mealPlanRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return plans.stream().map(p -> SavedPlanSummaryDTO.builder()
                .id(p.getId())
                .planName(p.getPlanName())
                .targetDisease(p.getTargetDisease())
                .durationDays(7)
                .totalDailyCalories(p.getTotalDailyCalories())
                .ayurvedicNutritionScore(p.getAyurvedicNutritionScore())
                .createdAt(p.getCreatedAt() != null ? p.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")) : "")
                .build()
        ).collect(Collectors.toList());
    }

    public DietPlanResponse getSavedPlanById(Long userId, Long planId) {
        MealPlan plan = mealPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        if (!plan.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied: You can only view your own diet plans");
        }

        UserProfile profile = profileRepository.findByUserId(userId).orElse(null);
        DoshaType dosha = (profile != null && profile.getPrimaryDosha() != null) ? profile.getPrimaryDosha() : DoshaType.TRIDOSHA;

        DietPlanGenerateRequest req = DietPlanGenerateRequest.builder()
                .targetDisease(plan.getTargetDisease())
                .season(plan.getSeason())
                .durationDays(7)
                .build();
        return generatePersonalizedPlan(userId, req);
    }

    @Transactional
    public boolean deleteUserPlan(Long userId, Long planId) {
        MealPlan plan = mealPlanRepository.findById(planId).orElse(null);
        if (plan == null) return false;
        if (!plan.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied: You can only delete your own diet plans");
        }
        mealPlanRepository.delete(plan);
        return true;
    }

    public DietPlanResponse getLatestPlan(Long userId) {
        MealPlan plan = mealPlanRepository.findFirstByUserIdOrderByCreatedAtDesc(userId).orElse(null);
        if (plan == null) return null;
        DietPlanGenerateRequest req = DietPlanGenerateRequest.builder()
                .targetDisease(plan.getTargetDisease())
                .season(plan.getSeason())
                .durationDays(7)
                .build();
        return generatePersonalizedPlan(userId, req);
    }

    public List<SwapOptionDTO> getSwapOptions(MealType mealType, String disease, DoshaType dosha, String dietaryPref) {
        List<SwapOptionDTO> options = new ArrayList<>();
        List<MealItemDTO> pool = getMealPoolForSlot(mealType, disease, dosha, dietaryPref);

        for (int i = 0; i < pool.size(); i++) {
            MealItemDTO m = pool.get(i);
            options.add(SwapOptionDTO.builder()
                    .id((long) (1000 + i))
                    .title(m.getRecipeTitle())
                    .description(m.getRecipeDescription())
                    .mealType(m.getMealType())
                    .calories(m.getCalories())
                    .protein(m.getProtein())
                    .carbs(m.getCarbs())
                    .fat(m.getFat())
                    .fiber(m.getFiber())
                    .ironMg(m.getIronMg())
                    .calciumMg(m.getCalciumMg())
                    .vitaminB12Mcg(m.getVitaminB12Mcg())
                    .costInr(m.getCostInr())
                    .suitableDosha(m.getSuitableDosha())
                    .keyIngredients(m.getKeyIngredients())
                    .whyRecommended(m.getWhyRecommended())
                    .ayurvedicProperties(m.getAyurvedicProperties())
                    .build());
        }
        return options;
    }

    // --- Private Helper Generation Logic ---

    private double calculateTargetCalories(UserProfile profile, String disease) {
        double baseline = 1850.0;
        if (profile != null && profile.getWeightKg() != null && profile.getHeightCm() != null && profile.getAge() != null) {
            double w = profile.getWeightKg();
            double h = profile.getHeightCm();
            int age = profile.getAge();
            boolean isMale = "MALE".equalsIgnoreCase(profile.getGender());

            double bmr = (10.0 * w) + (6.25 * h) - (5.0 * age) + (isMale ? 5.0 : -161.0);
            double activityMult = 1.375;
            if (profile.getActivityLevel() != null) {
                String act = profile.getActivityLevel().toLowerCase();
                if (act.contains("sedentary")) activityMult = 1.2;
                else if (act.contains("moderate")) activityMult = 1.55;
                else if (act.contains("very") || act.contains("active")) activityMult = 1.725;
            }
            baseline = Math.round(bmr * activityMult);
        }

        if ("Obesity / Weight Management".equalsIgnoreCase(disease)) {
            baseline -= 300.0;
        } else if ("Diabetes".equalsIgnoreCase(disease)) {
            baseline = Math.min(baseline, 1800.0);
        }
        return Math.max(1300.0, Math.min(2600.0, baseline));
    }

    private List<MealItemDTO> generateDayMeals(int dayIndex, String dayLabel, String disease, DoshaType dosha,
                                              String dietaryPref, String cuisine, List<String> includedMeals,
                                              List<String> allergies) {
        List<MealItemDTO> dayMeals = new ArrayList<>();

        if (includedMeals.contains("BREAKFAST")) {
            dayMeals.add(pickMeal(MealType.BREAKFAST, dayIndex, dayLabel, disease, dosha, dietaryPref, cuisine));
        }
        if (includedMeals.contains("MID_MORNING")) {
            dayMeals.add(pickMeal(MealType.MID_MORNING, dayIndex, dayLabel, disease, dosha, dietaryPref, cuisine));
        }
        if (includedMeals.contains("LUNCH")) {
            dayMeals.add(pickMeal(MealType.LUNCH, dayIndex, dayLabel, disease, dosha, dietaryPref, cuisine));
        }
        if (includedMeals.contains("EVENING_SNACK")) {
            dayMeals.add(pickMeal(MealType.EVENING_SNACK, dayIndex, dayLabel, disease, dosha, dietaryPref, cuisine));
        }
        if (includedMeals.contains("DINNER")) {
            dayMeals.add(pickMeal(MealType.DINNER, dayIndex, dayLabel, disease, dosha, dietaryPref, cuisine));
        }

        return dayMeals;
    }

    private MealItemDTO pickMeal(MealType slot, int dayIndex, String dayLabel, String disease, DoshaType dosha,
                                 String dietaryPref, String cuisine) {
        List<MealItemDTO> pool = getMealPoolForSlot(slot, disease, dosha, dietaryPref);
        int idx = (dayIndex - 1) % pool.size();
        MealItemDTO template = pool.get(idx);

        return MealItemDTO.builder()
                .id((long) (dayIndex * 100 + slot.ordinal()))
                .dayIndex(dayIndex)
                .dayOfWeek(dayLabel)
                .mealType(slot)
                .recipeTitle(template.getRecipeTitle())
                .recipeDescription(template.getRecipeDescription())
                .calories(template.getCalories())
                .protein(template.getProtein())
                .carbs(template.getCarbs())
                .fat(template.getFat())
                .fiber(template.getFiber())
                .ironMg(template.getIronMg())
                .calciumMg(template.getCalciumMg())
                .vitaminB12Mcg(template.getVitaminB12Mcg())
                .vitaminDIu(template.getVitaminDIu())
                .folateMcg(template.getFolateMcg())
                .costInr(template.getCostInr())
                .suitableDosha(template.getSuitableDosha())
                .keyIngredients(template.getKeyIngredients())
                .whyRecommended(template.getWhyRecommended())
                .ayurvedicProperties(template.getAyurvedicProperties())
                .build();
    }

    private List<MealItemDTO> getMealPoolForSlot(MealType slot, String disease, DoshaType dosha, String dietaryPref) {
        List<MealItemDTO> list = new ArrayList<>();

        if (slot == MealType.BREAKFAST) {
            list.add(MealItemDTO.builder()
                    .mealType(MealType.BREAKFAST)
                    .recipeTitle("Steamed Barley (Jav) Vegetable Upma")
                    .recipeDescription("Roasted pearled barley cooked with diced seasonal gourds, curry leaves, and ginger.")
                    .calories(245.0).protein(8.5).carbs(44.0).fat(3.5).fiber(9.2).ironMg(3.4).calciumMg(45.0).vitaminB12Mcg(0.0).vitaminDIu(0.0).folateMcg(35.0).costInr(28.0)
                    .suitableDosha("TRIDOSHA").keyIngredients(List.of("Barley (Jav)", "Bottle Gourd", "Curry Leaves", "Ginger", "Rock Salt"))
                    .whyRecommended("Low glycemic index and high beta-glucan soluble fiber support steady blood glucose and clear metabolic channels (Srotas).")
                    .ayurvedicProperties("Rasa: Kashaya (Astringent) | Virya: Shita (Cooling) | Vipaka: Katu | Dosha: Pitta-Kapha Pacifying")
                    .build());

            list.add(MealItemDTO.builder()
                    .mealType(MealType.BREAKFAST)
                    .recipeTitle("Calcium-Rich Warm Ragi (Finger Millet) Porridge")
                    .recipeDescription("Freshly ground finger millet cooked in lukewarm water/A2 milk with cardamom and soaked crushed almonds.")
                    .calories(260.0).protein(7.2).carbs(48.0).fat(4.0).fiber(7.5).ironMg(4.8).calciumMg(340.0).vitaminB12Mcg(0.3).vitaminDIu(20.0).folateMcg(22.0).costInr(25.0)
                    .suitableDosha("VATA").keyIngredients(List.of("Ragi Flour", "Soaked Almonds", "Green Cardamom", "Desi Ghee"))
                    .whyRecommended("Supplies bioavailable calcium and iron to replenish Asthi (bone) and Rakta (blood) tissues without sluggishness.")
                    .ayurvedicProperties("Rasa: Madhura (Sweet) | Virya: Shita (Cooling) | Vipaka: Madhura | Dosha: Vata-Pitta Balancing")
                    .build());

            list.add(MealItemDTO.builder()
                    .mealType(MealType.BREAKFAST)
                    .recipeTitle("Yellow Moong Dal & Spinach Cheela with Mint Chutney")
                    .recipeDescription("Savory golden crepe made from soaked yellow moong batter mixed with shredded palak and roasted cumin.")
                    .calories(280.0).protein(14.5).carbs(36.0).fat(5.2).fiber(6.8).ironMg(4.1).calciumMg(85.0).vitaminB12Mcg(0.0).vitaminDIu(0.0).folateMcg(98.0).costInr(32.0)
                    .suitableDosha("TRIDOSHA").keyIngredients(List.of("Yellow Moong Dal", "Fresh Spinach", "Jeera", "Fresh Mint", "A2 Ghee"))
                    .whyRecommended("Easily digestible plant protein stimulates Jatharagni while spinach replenishes cellular iron and folate reserves.")
                    .ayurvedicProperties("Rasa: Tikta/Kashaya | Virya: Shita | Vipaka: Madhura | Dosha: Tridoshic")
                    .build());

            list.add(MealItemDTO.builder()
                    .mealType(MealType.BREAKFAST)
                    .recipeTitle("Steamed Methi & Oats Idli with Vegetable Sambar")
                    .recipeDescription("Fermented-free steamed cakes of roasted oats and fresh fenugreek leaves served with a mild turmeric lentil stew.")
                    .calories(250.0).protein(9.8).carbs(42.0).fat(3.8).fiber(8.4).ironMg(3.8).calciumMg(72.0).vitaminB12Mcg(0.0).vitaminDIu(0.0).folateMcg(48.0).costInr(30.0)
                    .suitableDosha("KAPHA").keyIngredients(List.of("Rolled Oats", "Methi Leaves", "Tur Dal", "Bottle Gourd", "Turmeric"))
                    .whyRecommended("Methika (fenugreek) provides insulin-sensitizing saponins that regulate glucose spikes and reduce blood lipemia.")
                    .ayurvedicProperties("Rasa: Tikta (Bitter) | Virya: Ushna (Warm) | Vipaka: Katu | Dosha: Kapha-Vata Pacifying")
                    .build());
        } else if (slot == MealType.MID_MORNING) {
            list.add(MealItemDTO.builder()
                    .mealType(MealType.MID_MORNING)
                    .recipeTitle("Soaked Black Raisins (Munakka) & 4 Soaked Almonds")
                    .recipeDescription("Overnight soaked seeded black raisins peeled with raw skinless almonds.")
                    .calories(95.0).protein(2.8).carbs(18.0).fat(2.5).fiber(2.4).ironMg(2.1).calciumMg(38.0).vitaminB12Mcg(0.0).vitaminDIu(0.0).folateMcg(8.0).costInr(18.0)
                    .suitableDosha("TRIDOSHA").keyIngredients(List.of("Black Raisins (Draksha)", "Almonds (Vatama)"))
                    .whyRecommended("Classical Draksha rasayana cools hyperacidity, gently softens stool, and enhances red blood cell synthesis.")
                    .ayurvedicProperties("Rasa: Madhura (Sweet) | Virya: Shita (Cooling) | Vipaka: Madhura | Dosha: Pitta-Vata Pacifying")
                    .build());

            list.add(MealItemDTO.builder()
                    .mealType(MealType.MID_MORNING)
                    .recipeTitle("Fresh Amla (Indian Gooseberry) & Mint Detox Infusion")
                    .recipeDescription("Freshly crushed Amla juice diluted with warm water, mint sprigs, and a pinch of black salt.")
                    .calories(35.0).protein(0.6).carbs(7.5).fat(0.2).fiber(3.2).ironMg(1.2).calciumMg(24.0).vitaminB12Mcg(0.0).vitaminDIu(0.0).folateMcg(14.0).costInr(12.0)
                    .suitableDosha("TRIDOSHA").keyIngredients(List.of("Fresh Amalaki", "Pudina", "Rock Salt", "Warm Water"))
                    .whyRecommended("Contains concentrated heat-stable Vitamin C that enhances cellular absorption of dietary non-heme iron.")
                    .ayurvedicProperties("Rasa: Pancharasa (5 Tastes) | Virya: Shita | Vipaka: Madhura | Dosha: Supreme Tridosha Balancer")
                    .build());

            list.add(MealItemDTO.builder()
                    .mealType(MealType.MID_MORNING)
                    .recipeTitle("Tender Coconut Water with Soaked Sabja (Sweet Basil) Seeds")
                    .recipeDescription("Pure natural coconut water stirred with bloomed cooling sweet basil seeds.")
                    .calories(65.0).protein(1.2).carbs(12.0).fat(0.4).fiber(3.0).ironMg(0.8).calciumMg(42.0).vitaminB12Mcg(0.0).vitaminDIu(0.0).folateMcg(6.0).costInr(35.0)
                    .suitableDosha("PITTA").keyIngredients(List.of("Tender Coconut Water", "Sabja Seeds"))
                    .whyRecommended("Instantly quenches Pitta-driven burning sensations in the stomach and replenishes cellular potassium and magnesium.")
                    .ayurvedicProperties("Rasa: Madhura | Virya: Shita (Very Cooling) | Vipaka: Madhura | Dosha: Pitta-Vata Pacifying")
                    .build());

            list.add(MealItemDTO.builder()
                    .mealType(MealType.MID_MORNING)
                    .recipeTitle("Pomegranate (Dadima) Pearls with Roasted Cumin")
                    .recipeDescription("Sweet ruby pomegranate seeds lightly seasoned with freshly toasted cumin powder.")
                    .calories(80.0).protein(1.5).carbs(18.5).fat(0.8).fiber(3.8).ironMg(0.6).calciumMg(15.0).vitaminB12Mcg(0.0).vitaminDIu(0.0).folateMcg(28.0).costInr(25.0)
                    .suitableDosha("TRIDOSHA").keyIngredients(List.of("Pomegranate", "Roasted Jeera"))
                    .whyRecommended("Astringent-sweet taste tones mucosal linings in GERD and protects cardiac microvasculature.")
                    .ayurvedicProperties("Rasa: Kashaya/Madhura | Virya: Shita | Vipaka: Madhura | Dosha: Tridoshic")
                    .build());
        } else if (slot == MealType.LUNCH) {
            list.add(MealItemDTO.builder()
                    .mealType(MealType.LUNCH)
                    .recipeTitle("Tridoshic Moong Dal Khichdi with Steamed Lauki & Cow Ghee")
                    .recipeDescription("Split yellow moong and aged parboiled basmati cooked with cumin, grated bottle gourd, and a teaspoon of desi cow ghee.")
                    .calories(360.0).protein(15.2).carbs(58.0).fat(6.5).fiber(8.6).ironMg(4.4).calciumMg(65.0).vitaminB12Mcg(0.2).vitaminDIu(10.0).folateMcg(140.0).costInr(45.0)
                    .suitableDosha("TRIDOSHA").keyIngredients(List.of("Yellow Moong Dal", "Basmati Rice", "Bottle Gourd", "Cumin", "Turmeric", "A2 Ghee"))
                    .whyRecommended("Regarded in Charaka Samhita as the pinnacle of therapeutic nutrition (Pathya); zero endotoxin (Ama) accumulation.")
                    .ayurvedicProperties("Rasa: Madhura/Kashaya | Virya: Shita | Vipaka: Madhura | Dosha: Tridoshic")
                    .build());

            list.add(MealItemDTO.builder()
                    .mealType(MealType.LUNCH)
                    .recipeTitle("Jowar (Sorghum) Bhakri with Sprouted Moong Usal & Takra")
                    .recipeDescription("Crisp gluten-free sorghum flatbread with sprouted moong seasoned with mustard seeds, curry leaves, and roasted jeera buttermilk.")
                    .calories(410.0).protein(17.8).carbs(68.0).fat(6.0).fiber(14.2).ironMg(5.6).calciumMg(110.0).vitaminB12Mcg(0.4).vitaminDIu(5.0).folateMcg(180.0).costInr(42.0)
                    .suitableDosha("PITTA").keyIngredients(List.of("Jowar Flour", "Sprouted Moong", "Curry Leaves", "Fresh Buttermilk", "Rock Salt"))
                    .whyRecommended("High resistant starch and polyphenols slow carbohydrate breakdown, supporting healthy insulin sensitivity and lipid balance.")
                    .ayurvedicProperties("Rasa: Kashaya/Tikta | Virya: Shita | Vipaka: Katu | Dosha: Pitta-Kapha Pacifying")
                    .build());

            list.add(MealItemDTO.builder()
                    .mealType(MealType.LUNCH)
                    .recipeTitle("Whole Wheat Phulkas with Tur Dal, Karela Poriyal & Steamed Rice")
                    .recipeDescription("Two freshly puffed rotis served with cumin-tempered split pigeon peas and mildly spiced pan-sautéed bitter gourd.")
                    .calories(385.0).protein(14.0).carbs(62.0).fat(5.8).fiber(11.0).ironMg(4.9).calciumMg(78.0).vitaminB12Mcg(0.0).vitaminDIu(0.0).folateMcg(115.0).costInr(38.0)
                    .suitableDosha("KAPHA").keyIngredients(List.of("Whole Wheat Atta", "Tur Dal", "Bitter Gourd (Karavella)", "Mustard Oil", "Hing"))
                    .whyRecommended("Tikta (bitter) rasa stimulates bile secretions, clearing congested Kapha and aiding glucose utilization.")
                    .ayurvedicProperties("Rasa: Tikta/Kashaya | Virya: Ushna | Vipaka: Katu | Dosha: Kapha-Pitta Pacifying")
                    .build());

            list.add(MealItemDTO.builder()
                    .mealType(MealType.LUNCH)
                    .recipeTitle("Bajra Roti with Palak Dal Tadka & Fresh Curd")
                    .recipeDescription("Warm pearl millet flatbread with iron-rich spinach and yellow lentil curry.")
                    .calories(420.0).protein(16.5).carbs(65.0).fat(8.0).fiber(13.5).ironMg(7.2).calciumMg(185.0).vitaminB12Mcg(0.4).vitaminDIu(15.0).folateMcg(165.0).costInr(40.0)
                    .suitableDosha("VATA").keyIngredients(List.of("Bajra Flour", "Spinach (Palak)", "Yellow Moong Dal", "Garlic", "A2 Ghee"))
                    .whyRecommended("High mineral density provides robust hematinic support for anemia and helps stabilize blood pressure via natural magnesium.")
                    .ayurvedicProperties("Rasa: Madhura/Kashaya | Virya: Ushna | Vipaka: Katu | Dosha: Vata Pacifying")
                    .build());
        } else if (slot == MealType.EVENING_SNACK) {
            list.add(MealItemDTO.builder()
                    .mealType(MealType.EVENING_SNACK)
                    .recipeTitle("CCF Digestive Elixir (Cumin, Coriander, Fennel) with Roasted Chana")
                    .recipeDescription("Warm herbal decoction of equal parts cumin, coriander, and fennel with a handful of roasted black chickpeas.")
                    .calories(120.0).protein(5.8).carbs(18.0).fat(2.2).fiber(6.0).ironMg(2.4).calciumMg(48.0).vitaminB12Mcg(0.0).vitaminDIu(0.0).folateMcg(45.0).costInr(15.0)
                    .suitableDosha("TRIDOSHA").keyIngredients(List.of("Cumin", "Coriander", "Fennel Seeds", "Roasted Bengal Gram"))
                    .whyRecommended("Rekindles digestive fire (Deepana-Pachana) before evening without provoking gastric acid or increasing blood pressure.")
                    .ayurvedicProperties("Rasa: Katu/Madhura | Virya: Shita | Vipaka: Madhura | Dosha: Tridoshic Harmonizer")
                    .build());

            list.add(MealItemDTO.builder()
                    .mealType(MealType.EVENING_SNACK)
                    .recipeTitle("Roasted Phool Makhana (Foxnuts) with Turmeric & Pink Salt")
                    .recipeDescription("Puffed lotus seeds dry-roasted with a drop of cow ghee, wild turmeric, and digestive rock salt.")
                    .calories(110.0).protein(3.2).carbs(20.0).fat(1.5).fiber(3.5).ironMg(1.1).calciumMg(60.0).vitaminB12Mcg(0.0).vitaminDIu(0.0).folateMcg(12.0).costInr(22.0)
                    .suitableDosha("VATA").keyIngredients(List.of("Foxnuts (Makhana)", "Turmeric", "Sendha Namak", "A2 Ghee"))
                    .whyRecommended("Low sodium, high potassium, and alkalizing properties make this ideal for hypertension and acid reflux management.")
                    .ayurvedicProperties("Rasa: Madhura/Kashaya | Virya: Shita | Vipaka: Madhura | Dosha: Vata-Pitta Pacifying")
                    .build());

            list.add(MealItemDTO.builder()
                    .mealType(MealType.EVENING_SNACK)
                    .recipeTitle("Sprouted Moong & Pomegranate Salad with Lemon Zest")
                    .recipeDescription("Lightly steamed sprouted moong mixed with fresh pomegranate arils and a dash of lemon juice.")
                    .calories(130.0).protein(6.5).carbs(22.0).fat(1.0).fiber(5.2).ironMg(2.2).calciumMg(35.0).vitaminB12Mcg(0.0).vitaminDIu(0.0).folateMcg(85.0).costInr(20.0)
                    .suitableDosha("TRIDOSHA").keyIngredients(List.of("Sprouted Moong", "Pomegranate", "Fresh Lemon", "Coriander"))
                    .whyRecommended("Delivers active enzymes and polyphenols that prevent vascular inflammation and nourish blood tissues.")
                    .ayurvedicProperties("Rasa: Kashaya/Madhura | Virya: Shita | Vipaka: Madhura | Dosha: Pitta-Kapha Pacifying")
                    .build());

            list.add(MealItemDTO.builder()
                    .mealType(MealType.EVENING_SNACK)
                    .recipeTitle("Ginger-Tulsi Herbal Tea with 2 Soaked Walnuts")
                    .recipeDescription("Fresh holy basil leaves and crushed ginger simmered in water, accompanied by soaked omega-3 rich walnuts.")
                    .calories(105.0).protein(2.6).carbs(6.0).fat(8.2).fiber(2.1).ironMg(1.0).calciumMg(28.0).vitaminB12Mcg(0.0).vitaminDIu(0.0).folateMcg(18.0).costInr(25.0)
                    .suitableDosha("KAPHA").keyIngredients(List.of("Tulsi Leaves", "Fresh Ginger", "Walnuts (Akshota)"))
                    .whyRecommended("Tulsi and walnut omega-3 fatty acids attenuate systemic inflammation and support endocrine/thyroid regulation.")
                    .ayurvedicProperties("Rasa: Katu/Tikta | Virya: Ushna | Vipaka: Katu | Dosha: Kapha-Vata Pacifying")
                    .build());
        } else { // DINNER
            list.add(MealItemDTO.builder()
                    .mealType(MealType.DINNER)
                    .recipeTitle("Light Bottle Gourd (Lauki) & Moong Soup with 1 Phulka")
                    .recipeDescription("Smooth, heartwarming soup of steamed bottle gourd and yellow moong seasoned with cumin and served with one whole wheat roti.")
                    .calories(260.0).protein(9.5).carbs(45.0).fat(3.2).fiber(7.5).ironMg(2.8).calciumMg(55.0).vitaminB12Mcg(0.0).vitaminDIu(0.0).folateMcg(65.0).costInr(28.0)
                    .suitableDosha("TRIDOSHA").keyIngredients(List.of("Lauki (Alabu)", "Yellow Moong", "Whole Wheat Atta", "Cumin", "Rock Salt"))
                    .whyRecommended("Extremely easy to digest in the evening when Agni is naturally low; prevents nocturnal gastroesophageal regurgitation.")
                    .ayurvedicProperties("Rasa: Madhura/Kashaya | Virya: Shita | Vipaka: Madhura | Dosha: Tridosha Harmonizer")
                    .build());

            list.add(MealItemDTO.builder()
                    .mealType(MealType.DINNER)
                    .recipeTitle("Barley (Jav) & Vegetable Dalia with Desi Cow Ghee")
                    .recipeDescription("Broken roasted barley slow-simmered with diced carrots, green peas, and fragrant cumin tadka.")
                    .calories(275.0).protein(8.8).carbs(49.0).fat(3.8).fiber(9.5).ironMg(3.2).calciumMg(48.0).vitaminB12Mcg(0.1).vitaminDIu(5.0).folateMcg(38.0).costInr(30.0)
                    .suitableDosha("KAPHA").keyIngredients(List.of("Broken Barley (Jav)", "Carrots", "Green Peas", "A2 Ghee", "Coriander"))
                    .whyRecommended("Barley gently scrapes metabolic waste (Lekhana karma) while stabilizing morning fasting blood sugar levels.")
                    .ayurvedicProperties("Rasa: Kashaya/Madhura | Virya: Shita | Vipaka: Katu | Dosha: Pitta-Kapha Pacifying")
                    .build());

            list.add(MealItemDTO.builder()
                    .mealType(MealType.DINNER)
                    .recipeTitle("Warm Vegetable Stew with Small Portion Steamed Basmati")
                    .recipeDescription("Zucchini, carrots, and green beans stewed in a mild coconut-cumin broth with fragrant aged basmati rice.")
                    .calories(290.0).protein(6.5).carbs(52.0).fat(5.5).fiber(6.2).ironMg(2.1).calciumMg(62.0).vitaminB12Mcg(0.0).vitaminDIu(0.0).folateMcg(42.0).costInr(35.0)
                    .suitableDosha("PITTA").keyIngredients(List.of("Zucchini", "Carrots", "Coconut Milk", "Basmati Rice", "Ginger"))
                    .whyRecommended("Cooling ingredients pacify burning sensations, promoting restorative circadian sleep without acid backflow.")
                    .ayurvedicProperties("Rasa: Madhura | Virya: Shita | Vipaka: Madhura | Dosha: Pitta Pacifying")
                    .build());

            list.add(MealItemDTO.builder()
                    .mealType(MealType.DINNER)
                    .recipeTitle("Thin Moong Dal Soup with Soft Steamed Rice & Ghee")
                    .recipeDescription("Clear strained yellow moong broth infused with hing and turmeric, served over a small cup of steamed rice.")
                    .calories(240.0).protein(8.0).carbs(43.0).fat(3.5).fiber(4.8).ironMg(2.6).calciumMg(38.0).vitaminB12Mcg(0.1).vitaminDIu(5.0).folateMcg(75.0).costInr(26.0)
                    .suitableDosha("VATA").keyIngredients(List.of("Yellow Moong Dal", "Rice", "Hing", "Turmeric", "A2 Ghee"))
                    .whyRecommended("Hing and rock salt eliminate intestinal gas (Apana Vata) and ensure undisturbed restorative sleep.")
                    .ayurvedicProperties("Rasa: Madhura/Kashaya | Virya: Shita | Vipaka: Madhura | Dosha: Vata-Pitta Balancing")
                    .build());
        }

        return list;
    }

    private List<String> getClinicalAndAyurvedicTips(String disease, DoshaType dosha) {
        List<String> tips = new ArrayList<>();
        tips.add("Consume your primary meal between 12:00 PM and 1:30 PM when Jatharagni (digestive fire) is at its peak.");
        tips.add("Avoid iced or refrigerated drinks immediately before, during, or after meals as cold liquids extinguish Agni.");
        tips.add("Allow a clean 3 to 4-hour window between meals to allow complete digestion of Ahara Rasa before introducing new food.");

        if ("Diabetes".equalsIgnoreCase(disease)) {
            tips.add("Favor foods with Kashaya (Astringent) and Tikta (Bitter) tastes such as Barley, Methi, and Karela to regulate glycemic index.");
            tips.add("Take a brisk 100-step stroll (Shatapadi) after lunch and dinner to stimulate postprandial glucose uptake.");
        } else if ("GERD / Acid Reflux".equalsIgnoreCase(disease) || "GERD".equalsIgnoreCase(disease)) {
            tips.add("Finish dinner at least 3 hours before retiring to bed to prevent nocturnal acid reflux.");
            tips.add("Never consume sour curd (yogurt) or citrus fruits at night as they clog microchannels and trigger Pitta flare-ups.");
        } else if ("Hypertension".equalsIgnoreCase(disease)) {
            tips.add("Replace standard refined sodium salt with natural Sendha Namak (Himalayan Pink Rock Salt) in moderation.");
            tips.add("Incorporate CCF (cumin, coriander, fennel) and fresh pomegranate regularly to support endothelial elasticity.");
        } else if ("PCOS".equalsIgnoreCase(disease)) {
            tips.add("Maintain consistent meal timings daily to regulate circadian cortisol and ovarian hormone synthesis.");
            tips.add("Incorporate Ceylon cinnamon and soaked fenugreek seeds daily to improve cellular insulin sensitivity.");
        } else if ("Anemia / Iron Deficiency".equalsIgnoreCase(disease)) {
            tips.add("Cook green leafy vegetables and lentils in an iron skillet (Loha Patra) to naturally fortify iron content.");
            tips.add("Do not drink tea, coffee, or calcium-rich milk within 90 minutes of consuming iron-rich pulses or greens.");
        } else if ("Obesity / Weight Management".equalsIgnoreCase(disease)) {
            tips.add("Sip warm water seasoned with a drop of lemon and raw honey first thing in the morning for gentle Lekhana (scraping) action.");
            tips.add("Avoid sleeping during the day (Diva Swapna) as it provokes Kapha accumulation and dampens metabolic rate.");
        }
        return tips;
    }

    private List<String> getFoodsToLimit(String disease, DoshaType dosha) {
        List<String> limits = new ArrayList<>();
        if ("Diabetes".equalsIgnoreCase(disease)) {
            limits.add("Refined flours (Maida), white bread, and bakery biscuits with hidden sugars.");
            limits.add("Excessive consumption of deep-fried sweets (Jalebi, Gulab Jamun) and sweetened beverages.");
            limits.add("Over-polished white rice in large single servings without fiber accompaniment.");
            limits.add("Sweetened preserved fruit juices and high-fructose corn syrups.");
        } else if ("GERD / Acid Reflux".equalsIgnoreCase(disease) || "GERD".equalsIgnoreCase(disease)) {
            limits.add("Deep-fried oily snacks (Pakoras, Samosas) that delay gastric emptying.");
            limits.add("Excessive pungent hot green chillies, raw red chilli powder, and black pepper.");
            limits.add("Sour night-time fermented curd (yogurt) and aged vinegary pickles.");
            limits.add("Strong black coffee, carbonated sodas, and eating heavy meals late at night.");
        } else if ("Hypertension".equalsIgnoreCase(disease)) {
            limits.add("Commercial pickles (Achar) and papads with high salt and preservative content.");
            limits.add("Canned, cured, or heavily salted processed foods and savory snack mixes.");
            limits.add("Excessive sodium chloride table salt sprinkled on fresh fruits or salads.");
            limits.add("Excessive caffeine and artificial energy stimulant drinks.");
        } else if ("PCOS".equalsIgnoreCase(disease)) {
            limits.add("Refined white carbohydrates, pastries, and trans-fat containing bakery margarine.");
            limits.add("Dairy products sourced from non-organic herds with synthetic growth hormones.");
            limits.add("Excessive artificial sweeteners and high-sugar confectionery.");
            limits.add("Stale reheated takeaways lacking vital Prana energy.");
        } else if ("Anemia / Iron Deficiency".equalsIgnoreCase(disease)) {
            limits.add("Tea and coffee consumed concurrently with iron-rich pulses or spinach.");
            limits.add("Excessive unprocessed bran that binds dietary minerals in the digestive tract.");
            limits.add("Calcium-fortified drinks taken at the exact same meal as therapeutic iron foods.");
        } else {
            limits.add("Ultra-processed packaged snacks containing artificial trans-fats and chemical flavor enhancers.");
            limits.add("Incompatible food pairings (Viruddha Ahara) such as milk combined with sour fruits or salt.");
            limits.add("Refrigerated leftover foods stored longer than 24 hours that generate Ama toxins.");
            limits.add("Excessive refined white sugar and deep-fried hydrogenated oils.");
        }
        return limits;
    }

    private Map<String, Object> buildAyurvedicConsiderations(DoshaType dosha, String disease) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("primaryPrakriti", dosha.name());
        map.put("dominantElements", dosha == DoshaType.PITTA ? "Fire (Tejas) & Water (Apas)" :
                dosha == DoshaType.VATA ? "Space (Akasha) & Air (Vayu)" :
                dosha == DoshaType.KAPHA ? "Water (Jala) & Earth (Prithvi)" : "Harmonized Tridosha");

        map.put("recommendedRasas", dosha == DoshaType.PITTA ? List.of("Madhura (Sweet)", "Tikta (Bitter)", "Kashaya (Astringent)") :
                dosha == DoshaType.VATA ? List.of("Madhura (Sweet)", "Amla (Sour)", "Lavana (Salty)") :
                List.of("Katu (Pungent)", "Tikta (Bitter)", "Kashaya (Astringent)"));

        map.put("recommendedVirya", dosha == DoshaType.PITTA ? "Shita (Cooling Potency)" : "Ushna (Gentle Heating Potency)");
        map.put("optimalMealTimes", Map.of(
                "Breakfast", "7:30 AM - 8:30 AM",
                "MidMorning", "10:30 AM - 11:00 AM",
                "Lunch", "12:30 PM - 1:30 PM (Peak Agni)",
                "EveningSnack", "4:30 PM - 5:00 PM",
                "Dinner", "7:00 PM - 8:00 PM (Light & Warm)"
        ));
        map.put("cookingStyles", List.of(
                "Sautéing in A2 Cow Ghee with whole digestive spices (Jeera, Saunf, Turmeric)",
                "Light steam cooking to retain cellular nutrients and ease digestion",
                "Fresh preparation consumed within 3 hours of cooking (Prana-rich)"
        ));
        return map;
    }

    private int calculateAyurScore(DoshaType dosha, String disease, String womensHealth, double cost, Double maxBudget) {
        int score = 88;
        if (!"None".equalsIgnoreCase(disease)) score += 4;
        if (!"NONE".equalsIgnoreCase(womensHealth)) score += 3;
        if (maxBudget != null && cost <= maxBudget) score += 3;
        return Math.min(score, 98);
    }
}

