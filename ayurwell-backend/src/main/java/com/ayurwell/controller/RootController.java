package com.ayurwell.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class RootController {

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public String rootHtml() {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>AyurWell Backend API</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                        background-color: #FAF7F2;
                        color: #2C3531;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                        padding: 20px;
                    }
                    .card {
                        background: #FFFFFF;
                        border-radius: 20px;
                        border: 1px solid #EFECE6;
                        box-shadow: 0 10px 30px rgba(27, 77, 62, 0.08);
                        max-width: 520px;
                        width: 100%;
                        padding: 40px;
                        text-align: center;
                        box-sizing: border-box;
                    }
                    .badge {
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        background-color: #F2F6F0;
                        color: #1B4D3E;
                        font-size: 12px;
                        font-weight: 700;
                        padding: 6px 14px;
                        border-radius: 999px;
                        border: 1px solid rgba(135, 169, 107, 0.3);
                        margin-bottom: 20px;
                    }
                    .dot {
                        width: 8px;
                        height: 8px;
                        background-color: #22C55E;
                        border-radius: 50%;
                    }
                    h1 {
                        color: #1B4D3E;
                        font-size: 26px;
                        margin: 0 0 10px 0;
                        font-weight: 800;
                    }
                    p {
                        color: #5C6561;
                        font-size: 14px;
                        line-height: 1.6;
                        margin: 0 0 24px 0;
                    }
                    .info-box {
                        background: #FDFBF8;
                        border: 1px solid #EFECE6;
                        border-radius: 12px;
                        padding: 14px;
                        text-align: left;
                        font-size: 12px;
                        color: #2C3531;
                        margin-bottom: 24px;
                        line-height: 1.8;
                    }
                    .btn {
                        display: inline-block;
                        background: #1B4D3E;
                        color: #FFFFFF;
                        text-decoration: none;
                        font-weight: 600;
                        font-size: 14px;
                        padding: 12px 28px;
                        border-radius: 12px;
                        transition: background-color 0.2s;
                    }
                    .btn:hover {
                        background: #256753;
                    }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="badge">
                        <span class="dot"></span>
                        BACKEND API ONLINE (Port 8080)
                    </div>
                    <h1>AyurWell Backend</h1>
                    <p>Spring Boot REST API service is running successfully and ready to process requests.</p>
                    <div class="info-box">
                        <strong>Environment:</strong> Development<br>
                        <strong>Base API Path:</strong> <code>/api/v1</code><br>
                        <strong>Database:</strong> H2 In-Memory (<code>jdbc:h2:mem:ayurwelldb</code>)<br>
                        <strong>Frontend App:</strong> <a href="http://localhost:5173" style="color:#1B4D3E;font-weight:bold;">http://localhost:5173</a>
                    </div>
                    <a href="http://localhost:5173" class="btn">Open AyurWell Application &rarr;</a>
                </div>
            </body>
            </html>
            """;
    }

    @GetMapping(value = "/", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> rootJson() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("status", "UP");
        status.put("application", "AyurWell Backend API");
        status.put("version", "1.0.0");
        status.put("timestamp", LocalDateTime.now().toString());
        status.put("message", "AyurWell REST API is running successfully.");
        status.put("frontendUrl", "http://localhost:5173");
        return ResponseEntity.ok(status);
    }
}
