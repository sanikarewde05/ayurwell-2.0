package com.ayurwell.repository;

import com.ayurwell.entity.MealPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MealPlanRepository extends JpaRepository<MealPlan, Long> {
    List<MealPlan> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<MealPlan> findFirstByUserIdOrderByCreatedAtDesc(Long userId);
}
