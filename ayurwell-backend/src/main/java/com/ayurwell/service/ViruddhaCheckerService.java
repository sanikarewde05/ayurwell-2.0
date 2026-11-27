package com.ayurwell.service;

import com.ayurwell.dto.ViruddhaDTOs.*;
import com.ayurwell.entity.FoodItem;
import com.ayurwell.entity.ViruddhaCombination;
import com.ayurwell.repository.FoodItemRepository;
import com.ayurwell.repository.ViruddhaCombinationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ViruddhaCheckerService {

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private ViruddhaCombinationRepository viruddhaRepository;

    public ViruddhaCheckResponse checkCompatibility(ViruddhaCheckRequest request) {
        List<String> names = request.getFoodNames();
        if (names == null || names.size() < 2) {
            return ViruddhaCheckResponse.builder()
                    .compatible(true)
                    .compatibilityScore(100)
                    .conflicts(new ArrayList<>())
                    .generalAdvice(List.of("Please select at least 2 food items to evaluate Viruddha Ahara (incompatibility)."))
                    .build();
        }

        List<FoodItem> items = new ArrayList<>();
        for (String name : names) {
            Optional<FoodItem> food = foodItemRepository.findByNameIgnoreCase(name);
            food.ifPresent(items::add);
        }

        List<ViruddhaIncompatibilityItem> conflicts = new ArrayList<>();

        for (int i = 0; i < items.size(); i++) {
            for (int j = i + 1; j < items.size(); j++) {
                FoodItem itemA = items.get(i);
                FoodItem itemB = items.get(j);

                Optional<ViruddhaCombination> rule = viruddhaRepository.findIncompatibilityPair(itemA.getId(), itemB.getId());
                if (rule.isPresent()) {
                    ViruddhaCombination v = rule.get();
                    conflicts.add(ViruddhaIncompatibilityItem.builder()
                            .foodA(itemA.getName())
                            .foodB(itemB.getName())
                            .incompatibilityType(v.getIncompatibilityType())
                            .hazardReason(v.getHealthHazardReason())
                            .antidote(v.getAntidoteRecommendation())
                            .build());
                } else if (isRasaViruddha(itemA, itemB)) {
                    conflicts.add(ViruddhaIncompatibilityItem.builder()
                            .foodA(itemA.getName())
                            .foodB(itemB.getName())
                            .incompatibilityType("Virya-Viruddha (Heating vs Cooling Conflict)")
                            .hazardReason("Opposing thermal potencies create metabolic friction and slow down digestion (Agni Mandya).")
                            .antidote("Add digestive spices like cumin, ginger, or pinch of rock salt.")
                            .build());
                }
            }
        }

        boolean compatible = conflicts.isEmpty();
        int score = Math.max(100 - (conflicts.size() * 35), 15);

        List<String> advice = new ArrayList<>();
        if (compatible) {
            advice.add("These food items have harmonious Rasas (tastes) and Viryas (potencies). Safe for consumption!");
        } else {
            advice.add("Avoid consuming incompatible food pairs in the same meal.");
            advice.add("Allow at least a 2 to 3-hour interval between consuming opposing potencies.");
        }

        return ViruddhaCheckResponse.builder()
                .compatible(compatible)
                .compatibilityScore(score)
                .conflicts(conflicts)
                .generalAdvice(advice)
                .build();
    }

    private boolean isRasaViruddha(FoodItem a, FoodItem b) {
        if (a.getVirya() != null && b.getVirya() != null) {
            return (a.getVirya().contains("Cooling") && b.getVirya().contains("Heating")) ||
                   (a.getVirya().contains("Heating") && b.getVirya().contains("Cooling"));
        }
        return false;
    }
}
