package com.bugsecure.backend.controller;

import com.bugsecure.backend.dto.CodeSubmissionDTO;
import com.bugsecure.backend.service.CodeSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/submissions")
@CrossOrigin(origins = "*")
public class CodeSubmissionController {

    @Autowired
    private CodeSubmissionService codeSubmissionService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createSubmission(
            @RequestBody CodeSubmissionDTO dto,
            Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            CodeSubmissionDTO created = codeSubmissionService.createSubmission(dto, userDetails.getUsername());
            response.put("success", true);
            response.put("data", created);
            response.put("message", "Submission created successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllSubmissions(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String sort) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<CodeSubmissionDTO> submissions;
            
            if (status != null && status.equals("open")) {
                if (sort != null) {
                    submissions = codeSubmissionService.getOpenSubmissionsSorted(sort);
                } else {
                    submissions = codeSubmissionService.getOpenSubmissions();
                }
            } else {
                if (sort != null) {
                    submissions = codeSubmissionService.getAllSubmissionsSorted(sort);
                } else {
                    submissions = codeSubmissionService.getAllSubmissions();
                }
            }
            
            response.put("success", true);
            response.put("data", submissions);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/my-submissions")
    public ResponseEntity<Map<String, Object>> getMySubmissions(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            List<CodeSubmissionDTO> submissions = codeSubmissionService.getSubmissionsByCompany(userDetails.getUsername());
            response.put("success", true);
            response.put("data", submissions);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getSubmissionById(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            CodeSubmissionDTO submission = codeSubmissionService.getSubmissionById(id);
            response.put("success", true);
            response.put("data", submission);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateSubmission(
            @PathVariable String id,
            @RequestBody CodeSubmissionDTO dto,
            Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            CodeSubmissionDTO updated = codeSubmissionService.updateSubmission(id, dto, userDetails.getUsername());
            response.put("success", true);
            response.put("data", updated);
            response.put("message", "Submission updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateSubmissionStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String status = body.get("status");
            CodeSubmissionDTO updated = codeSubmissionService.updateSubmissionStatusOnly(id, status, userDetails.getUsername());
            response.put("success", true);
            response.put("data", updated);
            response.put("message", "Submission status updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteSubmission(
            @PathVariable String id,
            Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            codeSubmissionService.deleteSubmission(id, userDetails.getUsername());
            response.put("success", true);
            response.put("message", "Submission deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}

