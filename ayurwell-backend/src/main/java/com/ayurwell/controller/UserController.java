package com.ayurwell.controller;

import com.ayurwell.dto.UserProfileDTO;
import com.ayurwell.entity.User;
import com.ayurwell.repository.UserRepository;
import com.ayurwell.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserService userService;

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

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getProfile(@AuthenticationPrincipal User user) {
        Long userId = resolveUserId(user);
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDTO> updateProfile(@AuthenticationPrincipal User user,
                                                         @RequestBody UserProfileDTO dto) {
        Long userId = resolveUserId(user);
        return ResponseEntity.ok(userService.updateProfile(userId, dto));
    }
}
