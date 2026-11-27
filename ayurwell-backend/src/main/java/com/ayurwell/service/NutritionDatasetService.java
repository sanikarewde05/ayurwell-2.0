package com.ayurwell.service;

import com.ayurwell.entity.RawFoodComposition;
import com.ayurwell.repository.RawFoodCompositionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class NutritionDatasetService {

    @Autowired
    private RawFoodCompositionRepository rawFoodRepository;

    public Map<String, Object> getNormalizedDatasetResponse() {
        List<RawFoodComposition> foods = rawFoodRepository.findAll();

        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("primary_dataset_source", "ICMR-NIN Indian Food Composition Tables (IFCT 2017)");
        metadata.put("ayurvedic_reference", "Bhavaprakasha Nighantu & Charaka Samhita");
        metadata.put("dataset_version", "v2.0 Normalized Schema");
        metadata.put("total_records", foods.size());
        metadata.put("nutrient_coverage", List.of(
            "Energy (kcal)", "Protein (g)", "Carbohydrates (g)", "Total Fat (g)", "Fiber (g)",
            "Iron (mg)", "Calcium (mg)", "Vitamin B12 (mcg)", "Vitamin D (IU)", "Folate (mcg)", "Vitamin C (mg)"
        ));
        metadata.put("provenance_disclaimer", "Nutritional values referenced from published ICMR-NIN IFCT 2017 dataset. Ayurvedic taxonomy mapped from classical literature.");

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("provenance_metadata", metadata);
        response.put("foods", foods);

        return response;
    }
}
