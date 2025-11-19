package com.bugsecure.backend.controller;

import com.bugsecure.backend.model.TestExecution;
import com.bugsecure.backend.service.TestExecutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/testing")
@CrossOrigin(origins = "*")
public class TestExecutionController {

    @Autowired
    private TestExecutionService testExecutionService;

    @PostMapping("/run")
    public ResponseEntity<Map<String, Object>> runTest(
            @RequestBody Map<String, Object> testRequest,
            Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            Map<String, Object> result = testExecutionService.runTest(userDetails.getUsername(), testRequest);
            response.put("success", true);
            response.put("data", result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/result/{executionId}")
    public ResponseEntity<Map<String, Object>> getTestResult(
            @PathVariable String executionId,
            Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            Map<String, Object> result = testExecutionService.getTestResult(userDetails.getUsername(), executionId);
            response.put("success", true);
            response.put("data", result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/history")
    public ResponseEntity<Map<String, Object>> getTestHistory(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            List<TestExecution> history = testExecutionService.getTestHistory(userDetails.getUsername());
            response.put("success", true);
            response.put("data", history);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}






