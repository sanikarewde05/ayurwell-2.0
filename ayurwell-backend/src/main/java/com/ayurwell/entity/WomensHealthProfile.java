
package com.ayurwell.entity;

import com.ayurwell.enums.WomensHealthStage;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "womens_health_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WomensHealthProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    private WomensHealthStage healthStage;

    private Integer pregnancyTrimester; // 1, 2, 3
    private String cyclePhase; // Follicular, Luteal, Menstrual, Ovulatory
    private String reportedSymptoms; // CSV or JSON list of symptoms like fatigue, cramps, acne, hot flashes

    // Menstrual Cycle Tracking Settings
    private LocalDate lastPeriodDate;
    @Builder.Default
    private Integer cycleLengthDays = 28;
    @Builder.Default
    private Integer periodDurationDays = 5;
    private String flowLevel; // Light, Medium, Heavy, Spotting
    private String crampsSeverity; // None, Mild, Moderate, Severe
    private String mood; // Balanced, Sensitive, Irritable, Anxious, Low Energy
    private String energyLevel; // High, Moderate, Low, Sluggish

    // Menopause Tracking Settings
    private String menopauseSymptoms; // Hot Flashes, Night Sweats, Sleep Difficulty, Joint Discomfort, Mood Changes
    private Integer hotFlashFrequency; // per day
    private Integer sleepQualityRating; // 1-10

    // Anemia / Iron Tracking Settings
    @Builder.Default
    private Double dailyIronTargetMg = 18.0;
    private Double dailyIronIntakeMg;
}
