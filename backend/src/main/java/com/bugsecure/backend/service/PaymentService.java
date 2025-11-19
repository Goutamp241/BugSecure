package com.bugsecure.backend.service;

import com.bugsecure.backend.dto.PaymentDTO;
import com.bugsecure.backend.model.BugReport;
import com.bugsecure.backend.model.Payment;
import com.bugsecure.backend.model.User;
import com.bugsecure.backend.repository.BugReportRepository;
import com.bugsecure.backend.repository.PaymentRepository;
import com.bugsecure.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BugReportRepository bugReportRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletService walletService;

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final double USD_TO_INR_RATE = 83.0;

    public PaymentDTO createPayment(String bugReportId, String paymentMethod, String email) {
        BugReport bugReport = bugReportRepository.findById(bugReportId)
                .orElseThrow(() -> new RuntimeException("Bug report not found"));

        if (!"APPROVED".equals(bugReport.getStatus())) {
            throw new RuntimeException("Bug report must be approved before creating payment");
        }

        User company = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!bugReport.getCodeSubmission().getCompany().getEmail().equals(email)) {
            throw new RuntimeException("Only the company that owns the submission can create payments");
        }

        // Check if payment already exists
        paymentRepository.findByBugReportId(bugReport.getId()).ifPresent(payment -> {
            throw new RuntimeException("Payment already exists for this bug report");
        });

        Double amountUSD = bugReport.getRewardAmount();
        if (amountUSD == null || amountUSD <= 0) {
            throw new RuntimeException("Invalid reward amount");
        }

        Double amountINR = amountUSD * USD_TO_INR_RATE;

        Payment payment = new Payment();
        payment.setAmountUSD(amountUSD);
        payment.setAmountINR(amountINR);
        payment.setPaymentMethod(paymentMethod);
        payment.setBugReport(bugReport);
        payment.setCompany(company);
        payment.setResearcher(bugReport.getReporter());
        payment.setStatus("PENDING");
        payment.setCreatedAtIfNew(); // Set timestamps for MongoDB

        Payment saved = paymentRepository.save(payment);
        return convertToDTO(saved);
    }

    public List<PaymentDTO> getPaymentsByCompany(String email) {
        User company = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return paymentRepository.findByCompany(company).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PaymentDTO> getPaymentsByResearcher(String email) {
        User researcher = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return paymentRepository.findByResearcher(researcher).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PaymentDTO updatePaymentStatus(String paymentId, String status, String transactionId, String notes, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        // Only company or admin can update payment status
        if (!"ADMIN".equals(user.getRole()) && 
            !payment.getCompany().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized to update payment status");
        }

        payment.setStatus(status);
        if (transactionId != null) {
            payment.setTransactionId(transactionId);
        }
        if (notes != null) {
            payment.setNotes(notes);
        }
        
        payment.updateTimestamp(); // Update timestamp for MongoDB

        Payment updated = paymentRepository.save(payment);
        
        // If payment is completed, add reward to researcher's wallet
        if ("COMPLETED".equals(status) && updated.getResearcher() != null) {
            try {
                walletService.addReward(
                    updated.getResearcher().getEmail(),
                    updated.getAmountUSD(),
                    updated.getId(),
                    "Bug bounty reward for: " + updated.getBugReport().getTitle()
                );
            } catch (Exception e) {
                // Log error but don't fail the payment update
                System.err.println("Failed to add reward to wallet: " + e.getMessage());
            }
        }
        
        return convertToDTO(updated);
    }

    public PaymentDTO getPaymentById(String id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return convertToDTO(payment);
    }

    public List<PaymentDTO> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private PaymentDTO convertToDTO(Payment payment) {
        PaymentDTO dto = new PaymentDTO();
        dto.setId(payment.getId());
        dto.setAmountUSD(payment.getAmountUSD());
        dto.setAmountINR(payment.getAmountINR());
        dto.setStatus(payment.getStatus());
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setTransactionId(payment.getTransactionId());
        dto.setNotes(payment.getNotes());
        dto.setCreatedAt(payment.getCreatedAt().format(formatter));
        dto.setBugReportId(payment.getBugReport().getId());
        dto.setBugReportTitle(payment.getBugReport().getTitle());
        dto.setCompanyId(payment.getCompany().getId());
        dto.setCompanyName(payment.getCompany().getCompanyName() != null ? 
                          payment.getCompany().getCompanyName() : payment.getCompany().getUsername());
        dto.setResearcherId(payment.getResearcher().getId());
        dto.setResearcherName(payment.getResearcher().getUsername());
        return dto;
    }
}







