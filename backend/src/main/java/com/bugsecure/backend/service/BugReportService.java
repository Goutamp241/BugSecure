package com.bugsecure.backend.service;

import com.bugsecure.backend.dto.BugReportDTO;
import com.bugsecure.backend.model.BugReport;
import com.bugsecure.backend.model.CodeSubmission;
import com.bugsecure.backend.model.User;
import com.bugsecure.backend.repository.BugReportRepository;
import com.bugsecure.backend.repository.CodeSubmissionRepository;
import com.bugsecure.backend.repository.UserRepository;
import com.bugsecure.backend.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BugReportService {

    @Autowired
    private BugReportRepository bugReportRepository;

    @Autowired
    private CodeSubmissionRepository codeSubmissionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletService walletService;

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public BugReportDTO createBugReport(BugReportDTO dto, String email) {
        User reporter = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if ("COMPANY".equals(reporter.getRole())) {
            throw new RuntimeException("Companies cannot submit bug reports");
        }

        CodeSubmission submission = codeSubmissionRepository.findById(dto.getSubmissionId())
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        BugReport bugReport = new BugReport();
        bugReport.setTitle(dto.getTitle());
        bugReport.setDescription(dto.getDescription());
        bugReport.setStepsToReproduce(dto.getStepsToReproduce());
        bugReport.setExpectedBehavior(dto.getExpectedBehavior());
        bugReport.setActualBehavior(dto.getActualBehavior());
        bugReport.setSeverity(dto.getSeverity());
        bugReport.setCodeSubmission(submission);
        bugReport.setReporter(reporter);
        bugReport.setStatus("PENDING");
        bugReport.setCreatedAtIfNew(); // Set timestamps for MongoDB

        BugReport saved = bugReportRepository.save(bugReport);
        return convertToDTO(saved);
    }

    public List<BugReportDTO> getAllBugReports() {
        return bugReportRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BugReportDTO> getBugReportsByReporter(String email) {
        User reporter = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return bugReportRepository.findByReporter(reporter).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BugReportDTO> getBugReportsBySubmission(String submissionId) {
        CodeSubmission submission = codeSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        return bugReportRepository.findByCodeSubmission(submission).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public BugReportDTO getBugReportById(String id) {
        BugReport bugReport = bugReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bug report not found"));
        return convertToDTO(bugReport);
    }

    public BugReportDTO updateBugReportStatus(String id, String status, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BugReport bugReport = bugReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bug report not found"));

        // Only company owner or admin can update status
        if (!"ADMIN".equals(user.getRole()) && 
            !bugReport.getCodeSubmission().getCompany().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized to update bug report status");
        }

        String oldStatus = bugReport.getStatus();
        bugReport.setStatus(status);
        
        // If approved, set reward amount based on severity
        if ("APPROVED".equals(status) && bugReport.getRewardAmount() == null) {
            Double baseReward = bugReport.getCodeSubmission().getRewardAmount();
            double multiplier = getSeverityMultiplier(bugReport.getSeverity());
            bugReport.setRewardAmount(baseReward * multiplier);
        }
        
        bugReport.updateTimestamp(); // Update timestamp for MongoDB

        BugReport updated = bugReportRepository.save(bugReport);
        
        // If status changed to APPROVED, automatically transfer reward from company wallet to researcher
        if ("APPROVED".equals(status) && !"APPROVED".equals(oldStatus)) {
            try {
                User company = bugReport.getCodeSubmission().getCompany();
                User researcher = bugReport.getReporter();
                Double rewardAmount = updated.getRewardAmount() != null ? 
                    updated.getRewardAmount() : 
                    bugReport.getCodeSubmission().getRewardAmount();

                if (rewardAmount != null && rewardAmount > 0) {
                    String description = String.format("Bug bounty reward for: %s", updated.getTitle());
                    walletService.transferFromCompanyToResearcher(
                        company.getId(),
                        researcher.getId(),
                        rewardAmount,
                        description
                    );
                }
            } catch (Exception e) {
                // Log error but don't fail the status update
                System.err.println("Failed to transfer reward to researcher wallet: " + e.getMessage());
                // Optionally, you could set a flag or log this for manual processing
            }
        }
        
        return convertToDTO(updated);
    }

    private double getSeverityMultiplier(String severity) {
        switch (severity.toUpperCase()) {
            case "CRITICAL": return 1.0;
            case "HIGH": return 0.75;
            case "MEDIUM": return 0.5;
            case "LOW": return 0.25;
            default: return 0.5;
        }
    }

    private BugReportDTO convertToDTO(BugReport bugReport) {
        BugReportDTO dto = new BugReportDTO();
        dto.setId(bugReport.getId());
        dto.setTitle(bugReport.getTitle());
        dto.setDescription(bugReport.getDescription());
        dto.setStepsToReproduce(bugReport.getStepsToReproduce());
        dto.setExpectedBehavior(bugReport.getExpectedBehavior());
        dto.setActualBehavior(bugReport.getActualBehavior());
        dto.setSeverity(bugReport.getSeverity());
        dto.setStatus(bugReport.getStatus());
        dto.setCreatedAt(bugReport.getCreatedAt().format(formatter));
        dto.setSubmissionId(bugReport.getCodeSubmission().getId());
        dto.setSubmissionTitle(bugReport.getCodeSubmission().getTitle());
        dto.setReporterId(bugReport.getReporter().getId());
        dto.setReporterName(bugReport.getReporter().getUsername());
        dto.setRewardAmount(bugReport.getRewardAmount());
        return dto;
    }
}

