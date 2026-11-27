package com.ayurwell.dto;

import lombok.*;

public class AuthDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RegisterRequest {
        private String email;
        private String password;
        private String fullName;
        private Integer age;
        private String gender;
        private Double weightKg;
        private Double heightCm;
        private String activityLevel;
        private Double budgetPerDayInr;
        private String primaryHealthGoal;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuthResponse {
        private String token;
        private Long userId;
        private String email;
        private String fullName;
        private String primaryDosha;
        private Integer ayurScore;
        private Boolean profileCompleted;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SendOtpRequest {
        private String email;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerifyOtpRequest {
        private String email;
        private String otp;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OtpResponse {
        private boolean success;
        private String message;
        private String maskedEmail;
        private Integer resendWaitSeconds;
    }
}
