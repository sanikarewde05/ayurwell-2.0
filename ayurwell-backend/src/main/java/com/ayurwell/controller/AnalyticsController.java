package com.ayurwell.controller;

import com.ayurwell.dto.AnalyticsDTOs.AnalyticsSummaryResponse;
import com.ayurwell.entity.User;
import com.ayurwell.repository.UserRepository;
import com.ayurwell.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

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

    @GetMapping("/monthly")
    public ResponseEntity<AnalyticsSummaryResponse> getMonthlySummary(@AuthenticationPrincipal User user) {
        Long userId = resolveUserId(user);
        return ResponseEntity.ok(analyticsService.getMonthlyAnalytics(userId));
    }
}
