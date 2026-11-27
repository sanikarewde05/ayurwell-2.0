package com.ayurwell.controller;

import com.ayurwell.dto.DoshaDTOs.*;
import com.ayurwell.entity.User;
import com.ayurwell.repository.UserRepository;
import com.ayurwell.service.DoshaAssessmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dosha")
public class DoshaAssessmentController {

    @Autowired
    private DoshaAssessmentService doshaService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/assess")
    public ResponseEntity<DoshaResultDTO> submitQuiz(@AuthenticationPrincipal User user,
                                                     @RequestBody QuizSubmitRequest request) {
        Long userId = user != null ? user.getId() : null;
        if (userId == null) {
            User demo = userRepository.findByEmail("demo@ayurwell.com").orElse(null);
            if (demo != null) userId = demo.getId();
        }
        return ResponseEntity.ok(doshaService.calculateAndSavePrakriti(userId, request));
    }

    @GetMapping("/latest")
    public ResponseEntity<DoshaResultDTO> getLatestResult(@AuthenticationPrincipal User user) {
        Long userId = user != null ? user.getId() : null;
        if (userId == null) {
            User demo = userRepository.findByEmail("demo@ayurwell.com").orElse(null);
            if (demo != null) userId = demo.getId();
        }
        if (userId == null) {
            return ResponseEntity.noContent().build();
        }
        DoshaResultDTO result = doshaService.getLatestAssessment(userId);
        if (result == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(result);
    }
}
