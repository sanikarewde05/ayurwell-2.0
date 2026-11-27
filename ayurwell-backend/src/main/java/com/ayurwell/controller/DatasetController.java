package com.ayurwell.controller;

import com.ayurwell.service.NutritionDatasetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/dataset")
public class DatasetController {

    @Autowired
    private NutritionDatasetService datasetService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDataset() {
        return ResponseEntity.ok(datasetService.getNormalizedDatasetResponse());
    }
}
