package com.ayurwell.dto;

import com.ayurwell.enums.AgniType;
import com.ayurwell.enums.DoshaType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileDTO {
    private Long id;
    private Long userId;
    private String email;
    private String fullName;
    private Integer age;
    private String gender;
    private Double weightKg;
    private Double heightCm;
    private Double bmi;
    private String activityLevel;
    private Double budgetPerDayInr;
    private String primaryHealthGoal;
    private DoshaType primaryDosha;
    private AgniType digestiveFireAgni;
    private String targetDiseaseCondition;
    private Boolean profileCompleted;
}
