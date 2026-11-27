package com.ayurwell.entity;

import com.ayurwell.enums.AgniType;
import com.ayurwell.enums.DoshaType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private Integer age;
    private String gender;
    private Double weightKg;
    private Double heightCm;
    private String activityLevel; // Sedentary, Lightly Active, Moderately Active, Very Active

    private Double budgetPerDayInr;
    private String primaryHealthGoal; // Weight Loss, Immunity, Digestion, Disease Mgmt, Energy

    @Enumerated(EnumType.STRING)
    private DoshaType primaryDosha;

    @Enumerated(EnumType.STRING)
    private AgniType digestiveFireAgni;

    private String targetDiseaseCondition; // Diabetes, Hypertension, GERD, IBS, Thyroid, None

    @Builder.Default
    private Boolean profileCompleted = false;
}
