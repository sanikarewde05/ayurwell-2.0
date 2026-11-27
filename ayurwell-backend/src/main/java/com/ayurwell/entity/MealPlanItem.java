package com.ayurwell.entity;

import com.ayurwell.enums.MealType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "meal_plan_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealPlanItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meal_plan_id", nullable = false)
    private MealPlan mealPlan;

    @Enumerated(EnumType.STRING)
    private MealType mealType;

    @ManyToOne
    @JoinColumn(name = "recipe_id")
    private Recipe recipe;

    @ManyToOne
    @JoinColumn(name = "food_item_id")
    private FoodItem foodItem;

    private String dayOfWeek; // Monday, Tuesday, etc.
    private Double portionGrams;
    private Double itemCostInr;
    private Double itemCalories;
}
