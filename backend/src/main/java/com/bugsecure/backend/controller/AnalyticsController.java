package com.bugsecure.backend.controller;

import com.bugsecure.backend.dto.AnalyticsDTO;
import com.bugsecure.backend.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/admin")
    public ResponseEntity<Map<String, Object>> getAdminAnalytics(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Role verification is handled by SecurityConfig
            AnalyticsDTO analytics = analyticsService.getAdminAnalytics();
            response.put("success", true);
            response.put("data", analytics);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/company")
    public ResponseEntity<Map<String, Object>> getCompanyAnalytics(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            AnalyticsDTO analytics = analyticsService.getCompanyAnalytics(userDetails.getUsername());
            response.put("success", true);
            response.put("data", analytics);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/researcher")
    public ResponseEntity<Map<String, Object>> getResearcherAnalytics(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            AnalyticsDTO analytics = analyticsService.getResearcherAnalytics(userDetails.getUsername());
            response.put("success", true);
            response.put("data", analytics);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}

