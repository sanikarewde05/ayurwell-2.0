package com.ayurwell.repository;

import com.ayurwell.entity.ViruddhaCombination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ViruddhaCombinationRepository extends JpaRepository<ViruddhaCombination, Long> {

    @Query("SELECT v FROM ViruddhaCombination v WHERE " +
           "(v.foodA.id = :foodAId AND v.foodB.id = :foodBId) OR " +
           "(v.foodA.id = :foodBId AND v.foodB.id = :foodAId)")
    Optional<ViruddhaCombination> findIncompatibilityPair(@Param("foodAId") Long foodAId, @Param("foodBId") Long foodBId);
}
