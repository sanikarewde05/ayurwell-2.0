package com.ayurwell.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "raw_food_composition")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RawFoodComposition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String foodCode; // e.g. IFCT Code "A001", "B002"

    @Column(nullable = false)
    private String foodName;

    private String category; // Cereal, Pulse, Green Leafy Veg, Fruit, Milk Product, Oil/Fat, Nut/Seed

    private String datasetSource; // "ICMR-NIN Indian Food Composition Tables (IFCT 2017)"

    private String servingSize; // Standard "100g"

    private Double energyKcal;
    private Double proteinGrams;
    private Double carbsGrams;
    private Double fatGrams;
    private Double fiberGrams;
    private Double ironMg;
    private Double calciumMg;
    private Double vitaminB12Mcg;
    private Double vitaminDIu;
    private Double folateMcg;
    private Double vitaminCMg;

    @OneToOne(mappedBy = "rawFood", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private AyurvedicFoodProfile ayurvedicProfile;
}
