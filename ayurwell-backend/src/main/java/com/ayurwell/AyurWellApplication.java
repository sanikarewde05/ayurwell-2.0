package com.ayurwell;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;
import java.nio.file.Files;
import java.util.List;

@SpringBootApplication
public class AyurWellApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(AyurWellApplication.class, args);
    }

    private static void loadDotEnv() {
        try {
            File envFile = new File(".env");
            if (!envFile.exists()) {
                envFile = new File("ayurwell-backend/.env");
            }
            if (envFile.exists()) {
                List<String> lines = Files.readAllLines(envFile.toPath());
                for (String line : lines) {
                    line = line.trim();
                    if (!line.isEmpty() && !line.startsWith("#") && line.contains("=")) {
                        String[] parts = line.split("=", 2);
                        String key = parts[0].trim();
                        String value = parts[1].trim();
                        if ("SPRING_MAIL_PASSWORD".equals(key)) {
                            value = value.replace(" ", "");
                        }
                        System.setProperty(key, value);
                    }
                }
            }
        } catch (Exception ignored) {
        }
    }
}
