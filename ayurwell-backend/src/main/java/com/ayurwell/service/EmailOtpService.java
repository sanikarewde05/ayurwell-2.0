package com.ayurwell.service;

import com.ayurwell.dto.AuthDTOs.OtpResponse;
import com.ayurwell.entity.EmailOtp;
import com.ayurwell.entity.User;
import com.ayurwell.repository.EmailOtpRepository;
import com.ayurwell.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class EmailOtpService {

    @Autowired
    private EmailOtpRepository emailOtpRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    private final SecureRandom random = new SecureRandom();

    @Transactional
    public OtpResponse sendOtp(String email) {
        if (email == null || !email.contains("@")) {
            throw new RuntimeException("Please enter a valid email address.");
        }

        String normalizedEmail = email.trim().toLowerCase();

        // Check 30-second rate limiting for resends
        Optional<EmailOtp> existingOtp = emailOtpRepository.findTopByEmailOrderByCreatedAtDesc(normalizedEmail);
        if (existingOtp.isPresent()) {
            EmailOtp lastOtp = existingOtp.get();
            if (lastOtp.getCreatedAt() != null && lastOtp.getCreatedAt().plusSeconds(30).isAfter(LocalDateTime.now())) {
                long waitSecs = java.time.Duration.between(LocalDateTime.now(), lastOtp.getCreatedAt().plusSeconds(30)).getSeconds();
                throw new RuntimeException("Resend available in " + Math.max(1, waitSecs) + "s.");
            }
        }

        // Generate 6-digit OTP
        int otpNumber = 100000 + random.nextInt(900000);
        String rawOtp = String.valueOf(otpNumber);

        String hashedOtp = passwordEncoder.encode(rawOtp);

        EmailOtp newOtp = EmailOtp.builder()
                .email(normalizedEmail)
                .otpHash(hashedOtp)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .verified(false)
                .attempts(0)
                .build();

        emailOtpRepository.save(newOtp);

        Optional<User> userOpt = userRepository.findByEmail(normalizedEmail);
        String userName = userOpt.isPresent() ? userOpt.get().getFullName() : "Valued Member";

        // Dispatch Real Email
        emailService.sendOtpEmail(normalizedEmail, rawOtp, userName);

        return OtpResponse.builder()
                .success(true)
                .message("Verification code sent to " + maskEmail(normalizedEmail))
                .maskedEmail(maskEmail(normalizedEmail))
                .resendWaitSeconds(30)
                .build();
    }

    @Transactional
    public OtpResponse verifyOtp(String email, String rawOtp) {
        if (email == null || rawOtp == null || rawOtp.trim().length() != 6) {
            throw new RuntimeException("Please enter a complete 6-digit verification code.");
        }

        String normalizedEmail = email.trim().toLowerCase();
        String cleanOtp = rawOtp.trim();

        EmailOtp otpRecord = emailOtpRepository.findTopByEmailOrderByCreatedAtDesc(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("No verification code found for this email. Please request a new code."));

        if (otpRecord.isVerified()) {
            return OtpResponse.builder()
                    .success(true)
                    .message("Email is already verified.")
                    .maskedEmail(maskEmail(normalizedEmail))
                    .build();
        }

        if (otpRecord.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired. Please request a new code.");
        }

        if (otpRecord.getAttempts() >= 5) {
            throw new RuntimeException("Too many incorrect attempts. Please resend a new OTP.");
        }

        if (!passwordEncoder.matches(cleanOtp, otpRecord.getOtpHash())) {
            otpRecord.setAttempts(otpRecord.getAttempts() + 1);
            emailOtpRepository.save(otpRecord);
            throw new RuntimeException("Incorrect OTP. Please check the code and try again.");
        }

        // Verification Success
        otpRecord.setVerified(true);
        emailOtpRepository.save(otpRecord);

        // Update User emailVerified flag
        userRepository.findByEmail(normalizedEmail).ifPresent(user -> {
            user.setEmailVerified(true);
            userRepository.save(user);
        });

        return OtpResponse.builder()
                .success(true)
                .message("Email verified successfully!")
                .maskedEmail(maskEmail(normalizedEmail))
                .build();
    }

    public String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        String[] parts = email.split("@");
        String name = parts[0];
        String domain = parts[1];

        if (name.length() <= 2) {
            return name.charAt(0) + "***@" + domain;
        }
        return name.substring(0, 2) + "***@" + domain;
    }
}
