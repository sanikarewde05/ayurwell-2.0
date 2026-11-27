package com.ayurwell.service;

import com.ayurwell.dto.UserProfileDTO;
import com.ayurwell.entity.User;
import com.ayurwell.entity.UserProfile;
import com.ayurwell.repository.UserProfileRepository;
import com.ayurwell.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    public UserProfileDTO getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseGet(() -> UserProfile.builder().user(user).build());

        double heightInMeters = (profile.getHeightCm() != null && profile.getHeightCm() > 0) ? profile.getHeightCm() / 100.0 : 1.65;
        double weight = (profile.getWeightKg() != null) ? profile.getWeightKg() : 60.0;
        double bmi = Math.round((weight / (heightInMeters * heightInMeters)) * 10.0) / 10.0;

        return UserProfileDTO.builder()
                .id(profile.getId())
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .age(profile.getAge())
                .gender(profile.getGender())
                .weightKg(profile.getWeightKg())
                .heightCm(profile.getHeightCm())
                .bmi(bmi)
                .activityLevel(profile.getActivityLevel())
                .budgetPerDayInr(profile.getBudgetPerDayInr())
                .primaryHealthGoal(profile.getPrimaryHealthGoal())
                .primaryDosha(profile.getPrimaryDosha())
                .digestiveFireAgni(profile.getDigestiveFireAgni())
                .targetDiseaseCondition(profile.getTargetDiseaseCondition())
                .profileCompleted(profile.getProfileCompleted() != null && profile.getProfileCompleted())
                .build();
    }

    @Transactional
    public UserProfileDTO updateProfile(Long userId, UserProfileDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (dto.getFullName() != null) {
            user.setFullName(dto.getFullName());
            userRepository.save(user);
        }

        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElse(UserProfile.builder().user(user).build());

        if (dto.getAge() != null) profile.setAge(dto.getAge());
        if (dto.getGender() != null) profile.setGender(dto.getGender());
        if (dto.getWeightKg() != null) profile.setWeightKg(dto.getWeightKg());
        if (dto.getHeightCm() != null) profile.setHeightCm(dto.getHeightCm());
        if (dto.getActivityLevel() != null) profile.setActivityLevel(dto.getActivityLevel());
        if (dto.getBudgetPerDayInr() != null) profile.setBudgetPerDayInr(dto.getBudgetPerDayInr());
        if (dto.getPrimaryHealthGoal() != null) profile.setPrimaryHealthGoal(dto.getPrimaryHealthGoal());
        if (dto.getPrimaryDosha() != null) profile.setPrimaryDosha(dto.getPrimaryDosha());
        if (dto.getDigestiveFireAgni() != null) profile.setDigestiveFireAgni(dto.getDigestiveFireAgni());
        if (dto.getTargetDiseaseCondition() != null) profile.setTargetDiseaseCondition(dto.getTargetDiseaseCondition());
        if (dto.getProfileCompleted() != null) profile.setProfileCompleted(dto.getProfileCompleted());

        userProfileRepository.save(profile);

        return getProfile(userId);
    }
}
