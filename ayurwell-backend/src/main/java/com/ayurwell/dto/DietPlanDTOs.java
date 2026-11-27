package com.ayurwell.dto;

import com.ayurwell.enums.MealType;
import lombok.*;
import java.util.List;
import java.util.Map;

public class DietPlanDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DietPlanGenerateRequest {
        private String targetDisease; // Diabetes, Hypertension, PCOS, GERD, Anemia, Obesity, High Cholesterol, Thyroid, General Digestive Health, None
        private String season; // VASANTA, GRISHMA, VARSHA, SHARAD, HEMANTA, SHISHIRA
        private String womensHealthStage; // PCOS, PREGNANCY, MENSTRUATION, MENOPAUSE, ANEMIA, NONE
        private Double maxDailyBudget;
        private Integer durationDays; // 1, 7, 14, 30
        private String dietaryPreference; // Vegetarian, Vegan, Eggetarian, Non-Vegetarian
        private String cuisinePreference; // Indian, North Indian, South Indian, Maharashtrian, Custom
        private List<String> includedMeals; // BREAKFAST, MID_MORNING, LUNCH, EVENING_SNACK, DINNER
        private Double targetCalories;
        private List<String> allergies;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MealItemDTO {
        private Long id;
        private Integer dayIndex; // 1 to N
        private String dayOfWeek; // e.g. "Day 1", "Day 2"
        private MealType mealType;
        private String recipeTitle;
        private String recipeDescription;
        private Double calories;
        private Double protein;
        private Double carbs;
        private Double fat;
        private Double fiber;
        private Double ironMg;
        private Double calciumMg;
        private Double vitaminB12Mcg;
        private Double vitaminDIu;
        private Double folateMcg;
        private Double costInr;
        private String suitableDosha;
        private List<String> keyIngredients;
        private String whyRecommended;
        private String ayurvedicProperties;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DietPlanResponse {
        private Long id;
        private String planName;
        private String targetDisease;
        private String season;
        private String womensHealthStage;
        private Integer durationDays;
        private String dietaryPreference;
        private String cuisinePreference;
        private Double totalDailyBudgetInr;
        private Double totalDailyCalories;
        private Double dailyAverageProtein;
        private Double dailyAverageCarbs;
        private Double dailyAverageFat;
        private Double dailyAverageFiber;
        private Double dailyAverageIron;
        private Double dailyAverageCalcium;
        private Double dailyAverageB12;
        private Double dailyAverageVitD;
        private Double dailyAverageFolate;
        private Integer ayurvedicNutritionScore;
        private List<MealItemDTO> meals;
        private List<String> dietaryTips;
        private List<String> foodsToLimit;
        private Map<String, Object> ayurvedicConsiderations;
        private String createdAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SavedPlanSummaryDTO {
        private Long id;
        private String planName;
        private String targetDisease;
        private Integer durationDays;
        private Double totalDailyCalories;
        private Integer ayurvedicNutritionScore;
        private String createdAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SaveDietPlanRequest {
        private Long id; // optional if updating
        private String planName;
        private String targetDisease;
        private String season;
        private Integer durationDays;
        private String dietaryPreference;
        private String cuisinePreference;
        private Double totalDailyBudgetInr;
        private Double totalDailyCalories;
        private Integer ayurvedicNutritionScore;
        private List<MealItemDTO> meals;
        private List<String> dietaryTips;
        private List<String> foodsToLimit;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SwapOptionDTO {
        private Long id;
        private String title;
        private String description;
        private MealType mealType;
        private Double calories;
        private Double protein;
        private Double carbs;
        private Double fat;
        private Double fiber;
        private Double ironMg;
        private Double calciumMg;
        private Double vitaminB12Mcg;
        private Double costInr;
        private String suitableDosha;
        private List<String> keyIngredients;
        private String whyRecommended;
        private String ayurvedicProperties;
    }
}
