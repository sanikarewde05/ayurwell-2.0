package com.ayurwell.entity;

import com.ayurwell.enums.DoshaType;
import com.ayurwell.enums.MealType;
import com.ayurwell.enums.RituSeason;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "recipes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    private MealType mealType;

    @Enumerated(EnumType.STRING)
    private DoshaType suitableDosha;

    @Enumerated(EnumType.STRING)
    private RituSeason suitableSeason;

    private Integer prepTimeMins;
    private Double costPerServingInr;
    private Double calories;
    private Double proteinGrams;
    private Double carbsGrams;
    private Double fatGrams;
    private Double ironMg;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    private String suitableDiseaseConditions; // e.g. "Diabetes, GERD"
    private String suitableWomensHealthStage; // e.g. "PCOS, Pregnancy"
}
