package com.ayurwell.repository;

import com.ayurwell.entity.RawFoodComposition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RawFoodCompositionRepository extends JpaRepository<RawFoodComposition, Long> {
    Optional<RawFoodComposition> findByFoodCode(String foodCode);
}
