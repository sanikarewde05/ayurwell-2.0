package com.ayurwell.dto;

import lombok.*;
import java.time.LocalTime;

public class ReminderDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReminderRequest {
        private String title;
        private String reminderTime; // e.g. "08:00"
        private String category; // MEAL, HYDRATION, HERBAL_TEA, MEDITATION
        private String description;
        private boolean enabled;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReminderResponse {
        private Long id;
        private String title;
        private LocalTime reminderTime;
        private String category;
        private String description;
        private boolean enabled;
    }
}
