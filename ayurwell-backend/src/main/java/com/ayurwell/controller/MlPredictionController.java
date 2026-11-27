package com.ayurwell.controller;

import com.ayurwell.service.MlDeficiencyPredictorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/ml")
public class MlPredictionController {

    @Autowired
    private MlDeficiencyPredictorService mlService;

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        return ResponseEntity.ok(mlService.getModelMetrics());
    }

    @PostMapping("/predict-deficiency")
    public ResponseEntity<Map<String, Object>> predictDeficiency(@RequestBody Map<String, Double> payload) {
        Double iron = payload.get("iron_mg");
        Double calcium = payload.get("calcium_mg");
        Double b12 = payload.get("vitamin_b12_mcg");
        Double vitD = payload.get("vitamin_d_iu");
        Double folate = payload.get("folate_mcg");
        Double fiber = payload.get("fiber_g");

        return ResponseEntity.ok(mlService.predictDeficiencyRisk(iron, calcium, b12, vitD, folate, fiber));
    }
}
