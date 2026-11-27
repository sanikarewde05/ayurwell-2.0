package com.ayurwell.dto;

import com.ayurwell.enums.WomensHealthStage;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

public class WomensHealthDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WomensHealthProfileRequest {
        private WomensHealthStage stage;
        private Integer pregnancyTrimester;
        private String cyclePhase;
        private List<String> symptoms;

        // Menstrual Cycle fields
        private LocalDate lastPeriodDate;
        private Integer cycleLengthDays;
        private Integer periodDurationDays;
        private String flowLevel;
        private String crampsSeverity;
        private String mood;
        private String energyLevel;

        // Menopause fields
        private List<String> menopauseSymptoms;
        private Integer hotFlashFrequency;
        private Integer sleepQualityRating;

        // Anemia / Iron fields
        private Double dailyIronTargetMg;
        private Double dailyIronIntakeMg;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WomensHealthProfileResponse {
        private Long id;
        private WomensHealthStage stage;
        private Integer pregnancyTrimester;
        private String cyclePhase;
        private List<String> symptoms;

        // Menstrual Cycle settings & calculated status
        private LocalDate lastPeriodDate;
        private Integer cycleLengthDays;
        private Integer periodDurationDays;
        private String flowLevel;
        private String crampsSeverity;
        private String mood;
        private String energyLevel;
        private Integer currentCycleDay;
        private LocalDate estimatedNextPeriod;
        private String estimatedCyclePhase;
        private Boolean isPeriodActive;

        // Menopause settings
        private List<String> menopauseSymptoms;
        private Integer hotFlashFrequency;
        private Integer sleepQualityRating;

        // Anemia / Iron tracking
        private Double dailyIronTargetMg;
        private Double dailyIronIntakeMg;

        // Associated Plan
        private WomensHealthPlanResponse plan;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WomensHealthPlanResponse {
        private WomensHealthStage stage;
        private String title;
        private String overview;
        private List<String> recommendedFoods;
        private List<String> foodsToAvoid;
        private List<String> lifestyleGuidelines;
        private List<String> recommendedHerbs;
        private List<DietPlanDTOs.MealItemDTO> suggestedMeals;
        private List<String> doshaTailoredInsights;
        private String trimesterNotice;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WomensHealthLogRequest {
        private LocalDate logDate;
        private String logType; // MENSTRUAL, SYMPTOMS, ANEMIA_IRON, MENOPAUSE, WELLNESS
        private String flowLevel;
        private String crampsSeverity;
        private String mood;
        private String energy;
        private List<String> symptoms;
        private Double ironIntakeMg;
        private Double waterIntakeL;
        private Integer sleepHours;
        private Integer wellnessScore;
        private String notes;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WomensHealthLogResponse {
        private Long id;
        private LocalDate logDate;
        private String logType;
        private String flowLevel;
        private String crampsSeverity;
        private String mood;
        private String energy;
        private List<String> symptoms;
        private Double ironIntakeMg;
        private Double waterIntakeL;
        private Integer sleepHours;
        private Integer wellnessScore;
        private String notes;
    }
}
