package com.ayurwell.service;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class LlmAiAssistantService {

    public Map<String, Object> generateExplanation(String userQuery, String prakriti, String targetDisease, List<String> predictedGaps, String recommendedRecipe) {
        String prakritiText = (prakriti != null && !prakriti.isEmpty()) ? prakriti : "PITTA";
        String diseaseText = (targetDisease != null && !targetDisease.isEmpty()) ? targetDisease : "GERD / Acidity";
        String gapsText = (predictedGaps != null && !predictedGaps.isEmpty()) ? String.join(", ", predictedGaps) : "Calcium (Moderate Risk)";
        String recipeText = (recommendedRecipe != null && !recommendedRecipe.isEmpty()) ? recommendedRecipe : "Tridoshic Moong Dal Khichdi";

        String explanation;

        if (userQuery != null && userQuery.toLowerCase().contains("why")) {
            explanation = String.format(
                "Namaste! The dish '%s' is specially selected for your %s constitution and %s health profile. " +
                "In Ayurveda, moong dal combined with basmati rice and A2 Ghee creates a perfectly balanced Sattvic meal that calms Jatharagni (digestive fire) without inducing acidity. " +
                "Addressing your predicted potential nutrient gap in %s, this dish provides easily absorbable bioavailable proteins and minerals.",
                recipeText, prakritiText, diseaseText, gapsText
            );
        } else if (userQuery != null && userQuery.toLowerCase().contains("iron")) {
            explanation = 
                "To naturally boost bioavailable plant iron for Rakta Dhatu support without causing Vata constipation: " +
                "1. Consume soaked black raisins in the morning.\n" +
                "2. Cook spinach (Palak) in a traditional iron skillet with fresh lemon juice (Vitamin C acts as a natural absorption catalyst).\n" +
                "3. Avoid drinking black tea or coffee within 1 hour of meals, as tannins inhibit non-heme iron absorption.";
        } else if (userQuery != null && userQuery.toLowerCase().contains("pcos")) {
            explanation = 
                "In Ayurvedic pathology, PCOS is understood as a Kapha-Vata imbalance causing obstruction in Srotas (micro-channels) of Artava Vaha Dhatu. " +
                "Your low-GI diet plan incorporates barley (Jav), cinnamon water, and bitter gourd (Karela) to naturally metabolize Medas (fat tissue) and enhance peripheral insulin sensitivity.";
        } else {
            explanation = String.format(
                "Namaste! As an intelligent AyurWell AI Assistant, I have evaluated your profile (%s Prakriti, target condition: %s). " +
                "Your generated meal plan prioritizes warm, freshly cooked foods tailored for your digestive fire (Agni). " +
                "Our Machine Learning analysis highlights potential dietary gaps in: %s. " +
                "I recommend incorporating A2 Ghee, warm ragi porridge, and soaked almonds into your daily routine.",
                prakritiText, diseaseText, gapsText
            );
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("query", userQuery);
        response.put("explanation", explanation);
        response.put("grounded_context", Map.of(
            "prakriti", prakritiText,
            "target_disease", diseaseText,
            "predicted_gaps", gapsText,
            "recipe", recipeText
        ));
        response.put("disclaimer", "Healthcare Disclaimer: AyurWell AI Assistant provides grounded educational recommendations based on Ayurvedic principles and dietary analytics. It is NOT a clinical medical diagnosis.");

        return response;
    }
}
