package com.bugsecure.backend.service;

import com.bugsecure.backend.model.CodeSubmission;
import com.bugsecure.backend.model.TestExecution;
import com.bugsecure.backend.model.User;
import com.bugsecure.backend.repository.CodeSubmissionRepository;
import com.bugsecure.backend.repository.TestExecutionRepository;
import com.bugsecure.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class TestExecutionService {

    @Autowired
    private TestExecutionRepository testExecutionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CodeSubmissionRepository codeSubmissionRepository;

    // Run test in sandboxed environment (simulated)
    public Map<String, Object> runTest(String email, Map<String, Object> testRequest) {
        User researcher = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Only researchers can run tests
        if (!"USER".equals(researcher.getRole())) {
            throw new RuntimeException("Only researchers can run tests");
        }

        String testType = (String) testRequest.getOrDefault("testType", "COMMAND");
        String scriptContent = (String) testRequest.get("scriptContent");
        String fileName = (String) testRequest.get("fileName");
        String fileType = (String) testRequest.get("fileType");
        String submissionId = (String) testRequest.get("submissionId");
        String programId = (String) testRequest.get("programId"); // Support programId as well

        // Auto-fetch targetUrl from program/submission if programId or submissionId provided
        String targetUrl = null;
        CodeSubmission programSubmission = null;
        
        if (programId != null && !programId.isEmpty()) {
            programSubmission = codeSubmissionRepository.findById(programId).orElse(null);
        } else if (submissionId != null && !submissionId.isEmpty()) {
            programSubmission = codeSubmissionRepository.findById(submissionId).orElse(null);
        }
        
        if (programSubmission != null) {
            targetUrl = programSubmission.getWebsite();
            if (submissionId == null || submissionId.isEmpty()) {
                submissionId = programSubmission.getId();
            }
        }

        if (scriptContent == null || scriptContent.trim().isEmpty()) {
            throw new RuntimeException("Script content is required");
        }

        // Create test execution record
        TestExecution testExecution = new TestExecution();
        testExecution.setResearcher(researcher);
        testExecution.setTestType(testType);
        testExecution.setScriptContent(scriptContent);
        testExecution.setFileName(fileName);
        testExecution.setFileType(fileType);
        testExecution.setStatus("PENDING");
        testExecution.setCreatedAtIfNew();

        // Link to submission if provided
        if (programSubmission != null) {
            testExecution.setSubmission(programSubmission);
        }

        final TestExecution savedExecution = testExecutionRepository.save(testExecution);

        // Simulate test execution in isolated environment
        // In production, this would use Docker or a proper sandbox
        final String executionId = savedExecution.getId();
        CompletableFuture.supplyAsync(() -> {
            return executeTestSafely(savedExecution);
        }).thenAccept(result -> {
            TestExecution completed = testExecutionRepository.findById(executionId).orElse(null);
            if (completed != null) {
                completed.setOutput(result.get("output").toString());
                if (result.containsKey("error")) {
                    completed.setErrorLog(result.get("error").toString());
                    completed.markFailed();
                } else {
                    completed.markCompleted();
                }
                if (result.containsKey("executionTime")) {
                    completed.setExecutionTimeMs(Long.parseLong(result.get("executionTime").toString()));
                }
                testExecutionRepository.save(completed);
            }
        });

        // Return initial response with targetUrl if available
        Map<String, Object> response = new HashMap<>();
        response.put("executionId", executionId);
        response.put("status", "RUNNING");
        response.put("message", "Test execution started. Results will be available shortly.");
        if (targetUrl != null) {
            response.put("targetUrl", targetUrl);
        }

        return response;
    }

    // Simulated safe test execution (DO NOT execute real code in production without proper sandboxing)
    private Map<String, Object> executeTestSafely(TestExecution testExecution) {
        Map<String, Object> result = new HashMap<>();
        long startTime = System.currentTimeMillis();

        try {
            // Simulate execution delay
            Thread.sleep(1000 + (long)(Math.random() * 2000));

            String scriptContent = testExecution.getScriptContent();
            String testType = testExecution.getTestType();

            // Simulate test execution output (in production, use proper sandbox)
            StringBuilder output = new StringBuilder();
            output.append("=== Test Execution Started ===\n");
            output.append("Test Type: ").append(testType).append("\n");
            output.append("Timestamp: ").append(LocalDateTime.now()).append("\n\n");

            // Simulate different outputs based on test type
            if ("SCRIPT".equals(testType) || "FILE_UPLOAD".equals(testType)) {
                output.append("Executing script...\n");
                output.append("Script length: ").append(scriptContent.length()).append(" characters\n");
                
                // Simulate vulnerability detection
                if (scriptContent.toLowerCase().contains("sql") || scriptContent.toLowerCase().contains("select")) {
                    output.append("[WARNING] Potential SQL injection pattern detected\n");
                }
                if (scriptContent.toLowerCase().contains("xss") || scriptContent.toLowerCase().contains("<script>")) {
                    output.append("[WARNING] Potential XSS pattern detected\n");
                }
                if (scriptContent.toLowerCase().contains("eval") || scriptContent.toLowerCase().contains("exec")) {
                    output.append("[WARNING] Dangerous code execution pattern detected\n");
                }
                
                output.append("\n=== Execution Summary ===\n");
                output.append("Status: Completed\n");
                output.append("Lines processed: ").append(scriptContent.split("\n").length).append("\n");
                output.append("Vulnerabilities found: ").append((int)(Math.random() * 3)).append("\n");
            } else {
                // Command execution simulation
                output.append("Executing command: ").append(scriptContent).append("\n");
                output.append("Command executed successfully\n");
                output.append("Output: Simulated test result\n");
            }

            output.append("\n=== Test Execution Completed ===\n");
            result.put("output", output.toString());
            result.put("executionTime", System.currentTimeMillis() - startTime);

        } catch (InterruptedException e) {
            result.put("error", "Test execution was interrupted");
            result.put("output", "Execution failed due to interruption");
        } catch (Exception e) {
            result.put("error", "Test execution failed: " + e.getMessage());
            result.put("output", "Error during execution");
        }

        return result;
    }

    // Get test execution result
    public Map<String, Object> getTestResult(String email, String executionId) {
        User researcher = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TestExecution testExecution = testExecutionRepository.findById(executionId)
                .orElseThrow(() -> new RuntimeException("Test execution not found"));

        // Verify ownership
        if (!testExecution.getResearcher().getId().equals(researcher.getId())) {
            throw new RuntimeException("Unauthorized access to test execution");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", testExecution.getId());
        response.put("status", testExecution.getStatus());
        response.put("output", testExecution.getOutput());
        response.put("errorLog", testExecution.getErrorLog());
        response.put("testType", testExecution.getTestType());
        response.put("fileName", testExecution.getFileName());
        response.put("fileType", testExecution.getFileType());
        response.put("createdAt", testExecution.getCreatedAt());
        response.put("completedAt", testExecution.getCompletedAt());
        response.put("executionTimeMs", testExecution.getExecutionTimeMs());

        return response;
    }

    // Get test execution history
    public List<TestExecution> getTestHistory(String email) {
        User researcher = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return testExecutionRepository.findByResearcherOrderByCreatedAtDesc(researcher);
    }
}

