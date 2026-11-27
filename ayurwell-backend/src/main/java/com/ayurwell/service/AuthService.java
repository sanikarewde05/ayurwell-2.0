package com.ayurwell.service;

import com.ayurwell.config.JwtTokenProvider;
import com.ayurwell.dto.AuthDTOs.*;
import com.ayurwell.entity.User;
import com.ayurwell.entity.UserProfile;
import com.ayurwell.enums.DoshaType;
import com.ayurwell.repository.UserProfileRepository;
import com.ayurwell.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private EmailOtpService emailOtpService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email address is already registered.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role("ROLE_USER")
                .active(true)
                .emailVerified(true)
                .build();

        User savedUser = userRepository.save(user);

        UserProfile profile = UserProfile.builder()
                .user(savedUser)
                .age(request.getAge() != null ? request.getAge() : 25)
                .gender(request.getGender() != null ? request.getGender() : "FEMALE")
                .weightKg(request.getWeightKg() != null ? request.getWeightKg() : 60.0)
                .heightCm(request.getHeightCm() != null ? request.getHeightCm() : 165.0)
                .activityLevel(request.getActivityLevel() != null ? request.getActivityLevel() : "Moderately Active")
                .budgetPerDayInr(request.getBudgetPerDayInr() != null ? request.getBudgetPerDayInr() : 200.0)
                .primaryHealthGoal(request.getPrimaryHealthGoal() != null ? request.getPrimaryHealthGoal() : "General Wellness")
                .primaryDosha(null)
                .targetDiseaseCondition(null)
                .profileCompleted(false)
                .build();

        userProfileRepository.save(profile);

        String token = jwtTokenProvider.generateToken(savedUser.getEmail(), savedUser.getId());

        return AuthResponse.builder()
                .token(token)
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .primaryDosha(null)
                .ayurScore(null)
                .profileCompleted(false)
                .build();
    }

    public OtpResponse sendOtp(SendOtpRequest request) {
        return emailOtpService.sendOtp(request.getEmail());
    }

    public OtpResponse verifyOtp(VerifyOtpRequest request) {
        return emailOtpService.verifyOtp(request.getEmail(), request.getOtp());
    }

    public OtpResponse resendOtp(SendOtpRequest request) {
        return emailOtpService.sendOtp(request.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password.");
        }

        UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElse(null);
        boolean isCompleted = profile != null && Boolean.TRUE.equals(profile.getProfileCompleted());
        String dosha = (isCompleted && profile.getPrimaryDosha() != null) ? profile.getPrimaryDosha().name() : null;

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getId());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .primaryDosha(dosha)
                .ayurScore(isCompleted ? 86 : null)
                .profileCompleted(isCompleted)
                .build();
    }
}
