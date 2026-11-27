package com.ayurwell.dto;

import lombok.*;
import java.util.List;

public class ViruddhaDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ViruddhaCheckRequest {
        private List<String> foodNames;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ViruddhaIncompatibilityItem {
        private String foodA;
        private String foodB;
        private String incompatibilityType;
        private String hazardReason;
        private String antidote;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ViruddhaCheckResponse {
        private boolean compatible;
        private int compatibilityScore; // 0 to 100
        private List<ViruddhaIncompatibilityItem> conflicts;
        private List<String> generalAdvice;
    }
}
