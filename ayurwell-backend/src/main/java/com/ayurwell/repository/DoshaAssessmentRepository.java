package com.ayurwell.repository;

import com.ayurwell.entity.DoshaAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DoshaAssessmentRepository extends JpaRepository<DoshaAssessment, Long> {
    List<DoshaAssessment> findByUserIdOrderByAssessedAtDesc(Long userId);
    Optional<DoshaAssessment> findFirstByUserIdOrderByAssessedAtDesc(Long userId);
}
