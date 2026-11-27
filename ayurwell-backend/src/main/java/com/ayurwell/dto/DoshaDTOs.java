package com.ayurwell.dto;

import com.ayurwell.enums.DoshaType;
import lombok.*;
import java.util.List;
import java.util.Map;

public class DoshaDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuizSubmitRequest {
        // Map of Question Id -> Selected Dosha Answer ("VATA", "PITTA", or "KAPHA")
        private Map<String, String> answers;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DoshaResultDTO {
        private int vataScore;
        private int pittaScore;
        private int kaphaScore;
        private DoshaType primaryPrakriti;
        private DoshaType secondaryPrakriti;
        private String description;
        private List<String> dietaryRecommendations;
        private List<String> lifestyleTips;
        private List<String> herbsRecommended;
    }
}
