package com.ayurwell.repository;

import com.ayurwell.entity.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {
    Optional<FoodItem> findByNameIgnoreCase(String name);
    List<FoodItem> findByCategory(String category);
    List<FoodItem> findByEstimatedCostInrLessThanEqual(Double maxCost);
}
