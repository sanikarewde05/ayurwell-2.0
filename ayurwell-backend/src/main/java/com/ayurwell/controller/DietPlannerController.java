package com.ayurwell.controller;

import com.ayurwell.dto.DietPlanDTOs.*;
import com.ayurwell.entity.User;
import com.ayurwell.enums.DoshaType;
import com.ayurwell.enums.MealType;
import com.ayurwell.repository.UserRepository;
import com.ayurwell.service.DietPlannerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/diet")
public class DietPlannerController {

    @Autowired
    private DietPlannerService dietPlannerService;

    @Autowired
    private UserRepository userRepository;

    private Long resolveUserId(User user) {
        if (user != null) return user.getId();
        User demo = userRepository.findByEmail("demo@ayurwell.com").orElse(null);
        return demo != null ? demo.getId() : null;
    }

    @PostMapping("/generate")
    public ResponseEntity<DietPlanResponse> generatePlan(@AuthenticationPrincipal User user,
                                                         @RequestBody DietPlanGenerateRequest request) {
        Long userId = resolveUserId(user);
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(dietPlannerService.generatePersonalizedPlan(userId, request));
    }

    @PostMapping("/save")
    public ResponseEntity<DietPlanResponse> savePlan(@AuthenticationPrincipal User user,
                                                     @RequestBody SaveDietPlanRequest request) {
        Long userId = resolveUserId(user);
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(dietPlannerService.saveCustomPlan(userId, request));
    }

    @GetMapping("/saved")
    public ResponseEntity<List<SavedPlanSummaryDTO>> getSavedPlans(@AuthenticationPrincipal User user) {
        Long userId = resolveUserId(user);
        if (userId == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(dietPlannerService.getUserSavedPlans(userId));
    }

    @GetMapping("/plans/{id}")
    public ResponseEntity<DietPlanResponse> getPlanById(@AuthenticationPrincipal User user,
                                                        @PathVariable Long id) {
        Long userId = resolveUserId(user);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(dietPlannerService.getSavedPlanById(userId, id));
    }

    @DeleteMapping("/plans/{id}")
    public ResponseEntity<Void> deletePlan(@AuthenticationPrincipal User user,
                                           @PathVariable Long id) {
        Long userId = resolveUserId(user);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        boolean deleted = dietPlannerService.deleteUserPlan(userId, id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @GetMapping("/swap-options")
    public ResponseEntity<List<SwapOptionDTO>> getSwapOptions(
            @RequestParam MealType mealType,
            @RequestParam(required = false, defaultValue = "General Digestive Health") String disease,
            @RequestParam(required = false, defaultValue = "TRIDOSHA") DoshaType dosha,
            @RequestParam(required = false, defaultValue = "Vegetarian") String dietaryPref) {
        return ResponseEntity.ok(dietPlannerService.getSwapOptions(mealType, disease, dosha, dietaryPref));
    }

    @GetMapping("/latest")
    public ResponseEntity<DietPlanResponse> getLatestPlan(@AuthenticationPrincipal User user) {
        Long userId = resolveUserId(user);
        if (userId == null) {
            return ResponseEntity.noContent().build();
        }
        DietPlanResponse plan = dietPlannerService.getLatestPlan(userId);
        if (plan == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(plan);
    }
}

