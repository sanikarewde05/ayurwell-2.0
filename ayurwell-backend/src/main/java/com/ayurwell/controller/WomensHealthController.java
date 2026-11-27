package com.ayurwell.controller;

import com.ayurwell.dto.WomensHealthDTOs.*;
import com.ayurwell.entity.User;
import com.ayurwell.enums.WomensHealthStage;
import com.ayurwell.service.WomensHealthService;
import com.ayurwell.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/womens-health")
public class WomensHealthController {

    @Autowired
    private WomensHealthService womensHealthService;

    @Autowired
    private UserRepository userRepository;

    private Long resolveUserId(User user) {
        if (user != null && user.getId() != null) {
            return user.getId();
        }
        return userRepository.findByEmail("demo@ayurwell.com")
                .map(User::getId)
                .orElse(1L);
    }

    // 1. Profile & Computed Status
    @GetMapping("/profile")
    public ResponseEntity<WomensHealthProfileResponse> getProfile(@AuthenticationPrincipal User user) {
        Long userId = resolveUserId(user);
        WomensHealthProfileResponse response = womensHealthService.getProfileResponse(userId);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/profile")
    public ResponseEntity<WomensHealthProfileResponse> updateProfile(@AuthenticationPrincipal User user,
                                                                    @RequestBody WomensHealthProfileRequest request) {
        Long userId = resolveUserId(user);
        return ResponseEntity.ok(womensHealthService.updateProfile(userId, request));
    }

    // 2. Tracking Logs (Calendar, Cycle History, Progress)
    @GetMapping("/logs")
    public ResponseEntity<List<WomensHealthLogResponse>> getLogs(@AuthenticationPrincipal User user) {
        Long userId = resolveUserId(user);
        return ResponseEntity.ok(womensHealthService.getLogs(userId));
    }

    @PostMapping("/logs")
    public ResponseEntity<WomensHealthLogResponse> saveLog(@AuthenticationPrincipal User user,
                                                           @RequestBody WomensHealthLogRequest request) {
        Long userId = resolveUserId(user);
        return ResponseEntity.ok(womensHealthService.saveLog(userId, request));
    }

    @DeleteMapping("/logs/{id}")
    public ResponseEntity<Void> deleteLog(@AuthenticationPrincipal User user,
                                          @PathVariable Long id) {
        Long userId = resolveUserId(user);
        womensHealthService.deleteLog(userId, id);
        return ResponseEntity.noContent().build();
    }

    // 3. Backwards-compatible plan endpoints
    @GetMapping("/plan")
    public ResponseEntity<WomensHealthPlanResponse> getPlan(@AuthenticationPrincipal User user,
                                                            @RequestParam(required = false) WomensHealthStage stage,
                                                            @RequestParam(required = false) Integer trimester) {
        Long userId = resolveUserId(user);
        WomensHealthPlanResponse plan = womensHealthService.getNutritionPlan(userId, stage, trimester);
        if (plan == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(plan);
    }

    @PostMapping("/plan")
    public ResponseEntity<WomensHealthPlanResponse> updatePlan(@AuthenticationPrincipal User user,
                                                                @RequestBody WomensHealthProfileRequest request) {
        Long userId = resolveUserId(user);
        return ResponseEntity.ok(womensHealthService.updateAndGetNutritionPlan(userId, request));
    }
}
