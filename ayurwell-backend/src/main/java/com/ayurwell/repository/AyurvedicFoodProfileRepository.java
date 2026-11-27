package com.ayurwell.repository;

import com.ayurwell.entity.AyurvedicFoodProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AyurvedicFoodProfileRepository extends JpaRepository<AyurvedicFoodProfile, Long> {
}
