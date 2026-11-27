package com.ayurwell.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ayurvedic_food_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AyurvedicFoodProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "raw_food_id", nullable = false)
    @JsonIgnore
    private RawFoodComposition rawFood;

    private String sanskritName;
    private String rasa; // Sweet (Madhura), Sour (Amla), Salty (Lavana), Pungent (Katu), Bitter (Tikta), Astringent (Kashaya)
    private String virya; // Cooling (Shita), Heating (Ushna)
    private String vipaka; // Madhura, Katu, Amla
    private String doshaEffect; // e.g. V- P- K+
    private String suitableRituSeasons; // e.g. Vasanta, Sharad
    private String classicalTextReference; // "Bhavaprakasha Nighantu / Charaka Samhita"
}
