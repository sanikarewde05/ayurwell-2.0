package com.ayurwell.controller;

import com.ayurwell.service.LlmAiAssistantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai-assistant")
public class LlmChatController {

    @Autowired
    private LlmAiAssistantService llmService;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, Object> payload) {
        String query = (String) payload.get("query");
        String prakriti = (String) payload.get("prakriti");
        String targetDisease = (String) payload.get("target_disease");
        List<String> gaps = (List<String>) payload.get("predicted_gaps");
        String recipe = (String) payload.get("recommended_recipe");

        return ResponseEntity.ok(llmService.generateExplanation(query, prakriti, targetDisease, gaps, recipe));
    }
}
