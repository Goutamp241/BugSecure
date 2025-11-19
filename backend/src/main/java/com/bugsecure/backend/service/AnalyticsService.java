package com.bugsecure.backend.service;

import com.bugsecure.backend.dto.AnalyticsDTO;
import com.bugsecure.backend.model.*;
import com.bugsecure.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private CodeSubmissionRepository codeSubmissionRepository;

    @Autowired
    private BugReportRepository bugReportRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    public AnalyticsDTO getAdminAnalytics() {
        AnalyticsDTO analytics = new AnalyticsDTO();

        // Basic counts
        analytics.setTotalSubmissions(codeSubmissionRepository.count());
        analytics.setTotalBugReports(bugReportRepository.count());
        analytics.setTotalPayments(paymentRepository.count());

        // Submission status counts
        analytics.setOpenSubmissions((long) codeSubmissionRepository.findByStatus("OPEN").size());
        analytics.setClosedSubmissions((long) codeSubmissionRepository.findByStatus("CLOSED").size());

        // Bug report status counts
        analytics.setPendingBugReports((long) bugReportRepository.findByStatus("PENDING").size());
        analytics.setApprovedBugReports((long) bugReportRepository.findByStatus("APPROVED").size());
        analytics.setRejectedBugReports((long) bugReportRepository.findByStatus("REJECTED").size());

        // Total rewards paid
        Double totalRewards = paymentRepository.findByStatus("COMPLETED").stream()
                .mapToDouble(p -> p.getAmountUSD() != null ? p.getAmountUSD() : 0.0)
                .sum();
        analytics.setTotalRewardsPaid(totalRewards);

        // Submissions by month (last 6 months)
        analytics.setSubmissionsByMonth(getSubmissionsByMonth());

        // Bug reports by severity
        analytics.setBugReportsBySeverity(getBugReportsBySeverity());

        // Payments by status
        analytics.setPaymentsByStatus(getPaymentsByStatus());

        // Top researchers
        analytics.setTopResearchers(getTopResearchers());

        // Top companies
        analytics.setTopCompanies(getTopCompanies());

        return analytics;
    }

    public AnalyticsDTO getCompanyAnalytics(String email) {
        User company = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        AnalyticsDTO analytics = new AnalyticsDTO();

        List<CodeSubmission> submissions = codeSubmissionRepository.findByCompany(company);
        analytics.setTotalSubmissions((long) submissions.size());
        analytics.setOpenSubmissions(Long.valueOf(submissions.stream()
                .filter(s -> "OPEN".equals(s.getStatus())).count()));
        analytics.setClosedSubmissions(Long.valueOf(submissions.stream()
                .filter(s -> "CLOSED".equals(s.getStatus())).count()));

        List<BugReport> bugReports = new ArrayList<>();
        for (CodeSubmission submission : submissions) {
            bugReports.addAll(bugReportRepository.findByCodeSubmission(submission));
        }
        analytics.setTotalBugReports((long) bugReports.size());
        analytics.setPendingBugReports(Long.valueOf(bugReports.stream()
                .filter(br -> "PENDING".equals(br.getStatus())).count()));
        analytics.setApprovedBugReports(Long.valueOf(bugReports.stream()
                .filter(br -> "APPROVED".equals(br.getStatus())).count()));
        analytics.setRejectedBugReports(Long.valueOf(bugReports.stream()
                .filter(br -> "REJECTED".equals(br.getStatus())).count()));

        List<Payment> payments = paymentRepository.findByCompany(company);
        analytics.setTotalPayments((long) payments.size());
        Double totalRewards = payments.stream()
                .filter(p -> "COMPLETED".equals(p.getStatus()))
                .mapToDouble(p -> p.getAmountUSD() != null ? p.getAmountUSD() : 0.0)
                .sum();
        analytics.setTotalRewardsPaid(totalRewards);

        analytics.setBugReportsBySeverity(getBugReportsBySeverityForCompany(company));
        analytics.setSubmissionsByMonth(getSubmissionsByMonthForCompany(company));

        return analytics;
    }

    public AnalyticsDTO getResearcherAnalytics(String email) {
        User researcher = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        AnalyticsDTO analytics = new AnalyticsDTO();

        List<BugReport> bugReports = bugReportRepository.findByReporter(researcher);
        analytics.setTotalBugReports((long) bugReports.size());
        analytics.setPendingBugReports((long) bugReports.stream()
                .filter(br -> "PENDING".equals(br.getStatus())).count());
        analytics.setApprovedBugReports((long) bugReports.stream()
                .filter(br -> "APPROVED".equals(br.getStatus())).count());
        analytics.setRejectedBugReports((long) bugReports.stream()
                .filter(br -> "REJECTED".equals(br.getStatus())).count());

        List<Payment> payments = paymentRepository.findByResearcher(researcher);
        analytics.setTotalPayments((long) payments.size());
        Double totalRewards = payments.stream()
                .filter(p -> "COMPLETED".equals(p.getStatus()))
                .mapToDouble(p -> p.getAmountUSD() != null ? p.getAmountUSD() : 0.0)
                .sum();
        analytics.setTotalRewardsPaid(totalRewards);

        analytics.setBugReportsBySeverity(getBugReportsBySeverityForResearcher(researcher));

        return analytics;
    }

    private List<Map<String, Object>> getSubmissionsByMonth() {
        List<Map<String, Object>> result = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime monthEnd = monthStart.plusMonths(1);
            
            long count = codeSubmissionRepository.findAll().stream()
                    .filter(s -> s.getCreatedAt().isAfter(monthStart) && s.getCreatedAt().isBefore(monthEnd))
                    .count();
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", monthStart.format(DateTimeFormatter.ofPattern("MMM yyyy")));
            monthData.put("count", count);
            result.add(monthData);
        }
        
        return result;
    }

    private List<Map<String, Object>> getSubmissionsByMonthForCompany(User company) {
        List<Map<String, Object>> result = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        List<CodeSubmission> submissions = codeSubmissionRepository.findByCompany(company);
        
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime monthEnd = monthStart.plusMonths(1);
            
            long count = submissions.stream()
                    .filter(s -> s.getCreatedAt().isAfter(monthStart) && s.getCreatedAt().isBefore(monthEnd))
                    .count();
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", monthStart.format(DateTimeFormatter.ofPattern("MMM yyyy")));
            monthData.put("count", count);
            result.add(monthData);
        }
        
        return result;
    }

    private List<Map<String, Object>> getBugReportsBySeverity() {
        List<Map<String, Object>> result = new ArrayList<>();
        List<BugReport> allReports = bugReportRepository.findAll();
        
        Map<String, Long> severityCounts = allReports.stream()
                .collect(Collectors.groupingBy(BugReport::getSeverity, Collectors.counting()));
        
        for (String severity : Arrays.asList("CRITICAL", "HIGH", "MEDIUM", "LOW")) {
            Map<String, Object> severityData = new HashMap<>();
            severityData.put("severity", severity);
            severityData.put("count", severityCounts.getOrDefault(severity, 0L));
            result.add(severityData);
        }
        
        return result;
    }

    private List<Map<String, Object>> getBugReportsBySeverityForCompany(User company) {
        List<CodeSubmission> submissions = codeSubmissionRepository.findByCompany(company);
        List<BugReport> bugReports = new ArrayList<>();
        for (CodeSubmission submission : submissions) {
            bugReports.addAll(bugReportRepository.findByCodeSubmission(submission));
        }
        
        Map<String, Long> severityCounts = bugReports.stream()
                .collect(Collectors.groupingBy(BugReport::getSeverity, Collectors.counting()));
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (String severity : Arrays.asList("CRITICAL", "HIGH", "MEDIUM", "LOW")) {
            Map<String, Object> severityData = new HashMap<>();
            severityData.put("severity", severity);
            severityData.put("count", severityCounts.getOrDefault(severity, 0L));
            result.add(severityData);
        }
        
        return result;
    }

    private List<Map<String, Object>> getBugReportsBySeverityForResearcher(User researcher) {
        List<BugReport> bugReports = bugReportRepository.findByReporter(researcher);
        
        Map<String, Long> severityCounts = bugReports.stream()
                .collect(Collectors.groupingBy(BugReport::getSeverity, Collectors.counting()));
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (String severity : Arrays.asList("CRITICAL", "HIGH", "MEDIUM", "LOW")) {
            Map<String, Object> severityData = new HashMap<>();
            severityData.put("severity", severity);
            severityData.put("count", severityCounts.getOrDefault(severity, 0L));
            result.add(severityData);
        }
        
        return result;
    }

    private List<Map<String, Object>> getPaymentsByStatus() {
        List<Map<String, Object>> result = new ArrayList<>();
        List<Payment> allPayments = paymentRepository.findAll();
        
        Map<String, Long> statusCounts = allPayments.stream()
                .collect(Collectors.groupingBy(Payment::getStatus, Collectors.counting()));
        
        for (String status : Arrays.asList("PENDING", "PROCESSING", "COMPLETED", "FAILED")) {
            Map<String, Object> statusData = new HashMap<>();
            statusData.put("status", status);
            statusData.put("count", statusCounts.getOrDefault(status, 0L));
            result.add(statusData);
        }
        
        return result;
    }

    private List<Map<String, Object>> getTopResearchers() {
        List<Payment> completedPayments = paymentRepository.findByStatus("COMPLETED");
        Map<User, Double> researcherEarnings = completedPayments.stream()
                .collect(Collectors.groupingBy(
                    Payment::getResearcher,
                    Collectors.summingDouble(p -> p.getAmountUSD() != null ? p.getAmountUSD() : 0.0)
                ));
        
        return researcherEarnings.entrySet().stream()
                .sorted(Map.Entry.<User, Double>comparingByValue().reversed())
                .limit(5)
                .map(entry -> {
                    Map<String, Object> researcherData = new HashMap<>();
                    researcherData.put("name", entry.getKey().getUsername());
                    researcherData.put("earnings", entry.getValue());
                    researcherData.put("count", completedPayments.stream()
                            .filter(p -> p.getResearcher().getId().equals(entry.getKey().getId()))
                            .count());
                    return researcherData;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> getTopCompanies() {
        List<CodeSubmission> allSubmissions = codeSubmissionRepository.findAll();
        Map<User, Long> companySubmissions = allSubmissions.stream()
                .collect(Collectors.groupingBy(
                    CodeSubmission::getCompany,
                    Collectors.counting()
                ));
        
        return companySubmissions.entrySet().stream()
                .sorted(Map.Entry.<User, Long>comparingByValue().reversed())
                .limit(5)
                .map(entry -> {
                    Map<String, Object> companyData = new HashMap<>();
                    companyData.put("name", entry.getKey().getCompanyName() != null ? 
                                  entry.getKey().getCompanyName() : entry.getKey().getUsername());
                    companyData.put("submissions", entry.getValue());
                    return companyData;
                })
                .collect(Collectors.toList());
    }
}

