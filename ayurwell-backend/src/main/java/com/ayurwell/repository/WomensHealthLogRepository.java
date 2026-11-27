package com.ayurwell.repository;

import com.ayurwell.entity.WomensHealthLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WomensHealthLogRepository extends JpaRepository<WomensHealthLog, Long> {

    List<WomensHealthLog> findByUserIdOrderByLogDateDesc(Long userId);

    List<WomensHealthLog> findByUserIdAndLogDateBetweenOrderByLogDateAsc(Long userId, LocalDate startDate, LocalDate endDate);

    Optional<WomensHealthLog> findByUserIdAndLogDateAndLogType(Long userId, LocalDate logDate, String logType);
}
