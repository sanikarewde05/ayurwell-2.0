package com.ayurwell.controller;

import com.ayurwell.dto.AuthDTOs.*;
import com.ayurwell.entity.User;
import com.ayurwell.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<OtpResponse> sendOtp(@RequestBody SendOtpRequest request) {
        return ResponseEntity.ok(authService.sendOtp(request));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<OtpResponse> verifyOtp(@RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(authService.verifyOtp(request));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<OtpResponse> resendOtp(@RequestBody SendOtpRequest request) {
        return ResponseEntity.ok(authService.resendOtp(request));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        return ResponseEntity.ok(user);
    }
}
