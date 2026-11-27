package com.ayurwell.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "womens_health_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WomensHealthLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate logDate;

    // Log category: MENSTRUAL, SYMPTOMS, ANEMIA_IRON, MENOPAUSE, WELLNESS
    private String logType;

    // Menstrual details
    private String flowLevel; // Light, Medium, Heavy, Spotting
    private String crampsSeverity; // None, Mild, Moderate, Severe
    private String mood; // Balanced, Sensitive, Irritable, Anxious, Low Energy
    private String energy; // High, Moderate, Low, Sluggish

    // Comma-separated list of symptoms
    private String symptoms;

    // Nutrition & metrics
    private Double ironIntakeMg;
    private Double waterIntakeL;
    private Integer sleepHours;
    private Integer wellnessScore; // 0-100 non-medical score

    @Column(length = 1000)
    private String notes;
}
