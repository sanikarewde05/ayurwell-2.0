package com.ayurwell.service;

import com.ayurwell.entity.Recipe;
import com.ayurwell.enums.DoshaType;
import com.ayurwell.enums.MealType;
import com.ayurwell.enums.RituSeason;
import com.ayurwell.repository.RecipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecipeService {

    @Autowired
    private RecipeRepository recipeRepository;

    public List<Recipe> getAllRecipes() {
        return recipeRepository.findAll();
    }

    public Recipe getRecipeById(Long id) {
        return recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found with id: " + id));
    }

    public List<Recipe> filterRecipes(MealType mealType, DoshaType dosha, RituSeason season, String disease) {
        if (mealType != null && dosha != null) {
            return recipeRepository.findByMealTypeAndSuitableDosha(mealType, dosha);
        } else if (mealType != null) {
            return recipeRepository.findByMealType(mealType);
        } else if (dosha != null) {
            return recipeRepository.findBySuitableDosha(dosha);
        } else if (season != null) {
            return recipeRepository.findBySuitableSeason(season);
        } else if (disease != null && !disease.isEmpty()) {
            return recipeRepository.findBySuitableDiseaseConditionsContaining(disease);
        }
        return recipeRepository.findAll();
    }
}
