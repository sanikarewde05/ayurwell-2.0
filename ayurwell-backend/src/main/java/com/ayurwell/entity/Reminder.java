package com.ayurwell.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;

@Entity
@Table(name = "reminders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String title;
    private LocalTime reminderTime;
    private String category; // MEAL, HYDRATION, HERBAL_TEA, MEDITATION, RITUCHARYA
    private String description;

    @Builder.Default
    private boolean enabled = true;
}
