package com.ayurwell.controller;

import com.ayurwell.dto.ReminderDTOs.*;
import com.ayurwell.entity.User;
import com.ayurwell.service.ReminderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reminders")
public class ReminderController {

    @Autowired
    private ReminderService reminderService;

    @GetMapping
    public ResponseEntity<List<ReminderResponse>> getReminders(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(reminderService.getUserReminders(user.getId()));
    }

    @PostMapping
    public ResponseEntity<ReminderResponse> createReminder(@AuthenticationPrincipal User user,
                                                           @RequestBody ReminderRequest request) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(reminderService.createReminder(user.getId(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReminder(@PathVariable Long id) {
        reminderService.deleteReminder(id);
        return ResponseEntity.noContent().build();
    }
}
