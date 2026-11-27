package com.ayurwell.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "daily_health_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyHealthLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private LocalDate logDate;
    private Double caloriesConsumed;
    private Double waterIntakeLiters;
    private Integer energyLevelRating; // 1-10
    private Integer digestionQualityRating; // 1-10
    private Integer ayurScoreToday; // 0-100
    private Double ironIntakeMg;
    private Double calciumIntakeMg;
    private Double proteinIntakeGrams;
}
