package com.ayurwell.service;

import com.ayurwell.dto.ReminderDTOs.*;
import com.ayurwell.entity.Reminder;
import com.ayurwell.entity.User;
import com.ayurwell.repository.ReminderRepository;
import com.ayurwell.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReminderService {

    @Autowired
    private ReminderRepository reminderRepository;

    @Autowired
    private UserRepository userRepository;

    public List<ReminderResponse> getUserReminders(Long userId) {
        return reminderRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ReminderResponse createReminder(Long userId, ReminderRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        LocalTime time = LocalTime.parse(request.getReminderTime() != null ? request.getReminderTime() : "08:00");

        Reminder reminder = Reminder.builder()
                .user(user)
                .title(request.getTitle())
                .reminderTime(time)
                .category(request.getCategory())
                .description(request.getDescription())
                .enabled(request.isEnabled())
                .build();

        Reminder saved = reminderRepository.save(reminder);
        return toResponse(saved);
    }

    public void deleteReminder(Long id) {
        reminderRepository.deleteById(id);
    }

    private ReminderResponse toResponse(Reminder r) {
        return ReminderResponse.builder()
                .id(r.getId())
                .title(r.getTitle())
                .reminderTime(r.getReminderTime())
                .category(r.getCategory())
                .description(r.getDescription())
                .enabled(r.isEnabled())
                .build();
    }
}
