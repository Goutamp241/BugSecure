package com.bugsecure.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.time.LocalDateTime;

@Document(collection = "payments")
public class Payment {

    @Id
    private String id;
    private Double amountUSD;
    private Double amountINR;
    private String status = "PENDING"; // PENDING, PROCESSING, COMPLETED, FAILED
    private String paymentMethod; // BANK_TRANSFER, UPI, PAYPAL, etc.
    private String transactionId;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @DBRef
    private BugReport bugReport;
    
    @DBRef
    private User company;
    
    @DBRef
    private User researcher;

    // Constructors
    public Payment() {
    }

    public Payment(Double amountUSD, Double amountINR, String paymentMethod, 
                   BugReport bugReport, User company, User researcher) {
        this.amountUSD = amountUSD;
        this.amountINR = amountINR;
        this.paymentMethod = paymentMethod;
        this.bugReport = bugReport;
        this.company = company;
        this.researcher = researcher;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
    
    public void setCreatedAtIfNew() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
    }
    
    public void updateTimestamp() {
        this.updatedAt = LocalDateTime.now();
    }

    public Double getAmountUSD() {
        return amountUSD;
    }

    public void setAmountUSD(Double amountUSD) {
        this.amountUSD = amountUSD;
    }

    public Double getAmountINR() {
        return amountINR;
    }

    public void setAmountINR(Double amountINR) {
        this.amountINR = amountINR;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public BugReport getBugReport() {
        return bugReport;
    }

    public void setBugReport(BugReport bugReport) {
        this.bugReport = bugReport;
    }

    public User getCompany() {
        return company;
    }

    public void setCompany(User company) {
        this.company = company;
    }

    public User getResearcher() {
        return researcher;
    }

    public void setResearcher(User researcher) {
        this.researcher = researcher;
    }
}

