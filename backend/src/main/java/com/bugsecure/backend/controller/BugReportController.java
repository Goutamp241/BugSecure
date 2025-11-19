package com.bugsecure.backend.controller;

import com.bugsecure.backend.dto.BugReportDTO;
import com.bugsecure.backend.service.BugReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bug-reports")
@CrossOrigin(origins = "*")
public class BugReportController {

    @Autowired
    private BugReportService bugReportService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createBugReport(
            @RequestBody BugReportDTO dto,
            Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            BugReportDTO created = bugReportService.createBugReport(dto, userDetails.getUsername());
            response.put("success", true);
            response.put("data", created);
            response.put("message", "Bug report submitted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllBugReports() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<BugReportDTO> bugReports = bugReportService.getAllBugReports();
            response.put("success", true);
            response.put("data", bugReports);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/my-reports")
    public ResponseEntity<Map<String, Object>> getMyBugReports(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            List<BugReportDTO> bugReports = bugReportService.getBugReportsByReporter(userDetails.getUsername());
            response.put("success", true);
            response.put("data", bugReports);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/submission/{submissionId}")
    public ResponseEntity<Map<String, Object>> getBugReportsBySubmission(@PathVariable String submissionId) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<BugReportDTO> bugReports = bugReportService.getBugReportsBySubmission(submissionId);
            response.put("success", true);
            response.put("data", bugReports);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getBugReportById(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            BugReportDTO bugReport = bugReportService.getBugReportById(id);
            response.put("success", true);
            response.put("data", bugReport);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateBugReportStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String status = body.get("status");
            BugReportDTO updated = bugReportService.updateBugReportStatus(id, status, userDetails.getUsername());
            response.put("success", true);
            response.put("data", updated);
            response.put("message", "Bug report status updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}







