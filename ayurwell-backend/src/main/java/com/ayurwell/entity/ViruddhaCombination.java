package com.ayurwell.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "viruddha_combinations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ViruddhaCombination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "food_a_id", nullable = false)
    private FoodItem foodA;

    @ManyToOne
    @JoinColumn(name = "food_b_id", nullable = false)
    private FoodItem foodB;

    private String incompatibilityType; // Rasa-Viruddha, Virya-Viruddha, Sanskard-Viruddha, Matra-Viruddha
    private String healthHazardReason;
    private String antidoteRecommendation;
}
