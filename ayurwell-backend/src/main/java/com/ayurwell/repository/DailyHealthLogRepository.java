package com.ayurwell.repository;

import com.ayurwell.entity.DailyHealthLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyHealthLogRepository extends JpaRepository<DailyHealthLog, Long> {
    List<DailyHealthLog> findByUserIdAndLogDateBetweenOrderByLogDateAsc(Long userId, LocalDate startDate, LocalDate endDate);
    Optional<DailyHealthLog> findByUserIdAndLogDate(Long userId, LocalDate logDate);
}
