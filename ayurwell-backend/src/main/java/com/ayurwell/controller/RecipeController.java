package com.ayurwell.controller;

import com.ayurwell.entity.Recipe;
import com.ayurwell.enums.DoshaType;
import com.ayurwell.enums.MealType;
import com.ayurwell.enums.RituSeason;
import com.ayurwell.service.RecipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recipes")
public class RecipeController {

    @Autowired
    private RecipeService recipeService;

    @GetMapping
    public ResponseEntity<List<Recipe>> getAllRecipes(
            @RequestParam(required = false) MealType mealType,
            @RequestParam(required = false) DoshaType dosha,
            @RequestParam(required = false) RituSeason season,
            @RequestParam(required = false) String disease) {
        return ResponseEntity.ok(recipeService.filterRecipes(mealType, dosha, season, disease));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Recipe> getRecipeById(@PathVariable Long id) {
        return ResponseEntity.ok(recipeService.getRecipeById(id));
    }
}
