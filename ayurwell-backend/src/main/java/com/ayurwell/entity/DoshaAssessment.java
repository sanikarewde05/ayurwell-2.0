package com.ayurwell.entity;

import com.ayurwell.enums.DoshaType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "dosha_assessments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoshaAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private Integer vataScore;
    private Integer pittaScore;
    private Integer kaphaScore;

    @Enumerated(EnumType.STRING)
    private DoshaType primaryPrakriti;

    @Enumerated(EnumType.STRING)
    private DoshaType secondaryPrakriti;

    private LocalDateTime assessedAt;

    @PrePersist
    protected void onCreate() {
        this.assessedAt = LocalDateTime.now();
    }
}
