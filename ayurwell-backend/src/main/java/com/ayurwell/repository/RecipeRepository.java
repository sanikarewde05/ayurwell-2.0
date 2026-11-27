package com.ayurwell.repository;

import com.ayurwell.entity.Recipe;
import com.ayurwell.enums.DoshaType;
import com.ayurwell.enums.MealType;
import com.ayurwell.enums.RituSeason;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    List<Recipe> findByMealType(MealType mealType);
    List<Recipe> findBySuitableDosha(DoshaType dosha);
    List<Recipe> findBySuitableSeason(RituSeason season);
    List<Recipe> findByMealTypeAndSuitableDosha(MealType mealType, DoshaType dosha);
    List<Recipe> findBySuitableDiseaseConditionsContaining(String disease);
    List<Recipe> findBySuitableWomensHealthStageContaining(String womensHealthStage);
}
