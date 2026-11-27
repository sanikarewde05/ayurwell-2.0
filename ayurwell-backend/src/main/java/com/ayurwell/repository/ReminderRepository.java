package com.ayurwell.repository;

import com.ayurwell.entity.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByUserId(Long userId);
    List<Reminder> findByUserIdAndEnabledTrue(Long userId);
}
