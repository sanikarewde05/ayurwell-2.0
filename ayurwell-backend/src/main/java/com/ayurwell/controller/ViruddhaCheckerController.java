package com.ayurwell.controller;

import com.ayurwell.dto.ViruddhaDTOs.*;
import com.ayurwell.service.ViruddhaCheckerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/viruddha")
public class ViruddhaCheckerController {

    @Autowired
    private ViruddhaCheckerService viruddhaService;

    @PostMapping("/check")
    public ResponseEntity<ViruddhaCheckResponse> checkCompatibility(@RequestBody ViruddhaCheckRequest request) {
        return ResponseEntity.ok(viruddhaService.checkCompatibility(request));
    }
}
