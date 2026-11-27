package com.ayurwell.repository;

import com.ayurwell.entity.WomensHealthProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WomensHealthProfileRepository extends JpaRepository<WomensHealthProfile, Long> {
    Optional<WomensHealthProfile> findByUserId(Long userId);
}
