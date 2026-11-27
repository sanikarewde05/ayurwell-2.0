package com.ayurwell.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

public class AnalyticsDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyLogItem {
        private LocalDate date;
        private Double calories;
        private Double waterLiters;
        private Integer energyLevel;
        private Integer digestionQuality;
        private Integer ayurScore;
        private Double ironMg;
        private Double calciumMg;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DeficiencyRiskItem {
        private String nutrientName; // e.g., Iron, Calcium, Fiber, Protein
        private String riskLevel; // Low, Moderate, High
        private String symptomsToWatch;
        private List<String> recommendedAyurvedicFoods;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AnalyticsSummaryResponse {
        private Integer currentAyurScore;
        private Double averageCalories;
        private Double averageWaterLiters;
        private List<DailyLogItem> historicalLogs;
        private List<DeficiencyRiskItem> deficiencyRisks;
        private String monthlyDigestiveHealthInsight;
    }
}
