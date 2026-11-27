package com.ayurwell.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "food_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String category; // Grain, Pulse, Vegetable, Fruit, Dairy, Spice, Oil
    private String rasa; // Taste: Sweet, Sour, Salty, Bitter, Pungent, Astringent
    private String virya; // Potency: Heating (Ushna), Cooling (Shita)
    private String vipaka; // Post-digestive: Madhura (Sweet), Amla (Sour), Katu (Pungent)
    private String doshaEffect; // e.g. V- P= K+

    private Double calories;
    private Double proteinGrams;
    private Double carbsGrams;
    private Double fatGrams;
    private Double ironMg;
    private Double calciumMg;
    private Double fiberGrams;

    private Double estimatedCostInr;
}
