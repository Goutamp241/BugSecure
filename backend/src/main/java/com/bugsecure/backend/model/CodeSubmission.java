package com.bugsecure.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.time.LocalDateTime;

@Document(collection = "code_submissions")
public class CodeSubmission {

    @Id
    private String id;
    private String title;
    private String description;
    private String fileName; // Optional - can be empty if code is pasted directly
    // Legacy: persisted code content for older records.
    private String codeContent;

    // Secure storage for code bytes. New submissions should prefer these.
    private String codeStorageKey;
    private String codeMimeType; // e.g., text/plain
    private Long codeSizeBytes;
    private String status = "OPEN"; // OPEN, IN_PROGRESS, CLOSED
    private Double rewardAmount;
    private String website; // Website URL for testing
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @DBRef
    private User company;

    // Constructors
    public CodeSubmission() {
    }

    public CodeSubmission(String title, String description, String fileName, 
                         String codeContent, Double rewardAmount, User company) {
        this.title = title;
        this.description = description;
        this.fileName = fileName;
        this.codeContent = codeContent;
        this.rewardAmount = rewardAmount;
        this.company = company;
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getCodeContent() {
        return codeContent;
    }

    public void setCodeContent(String codeContent) {
        this.codeContent = codeContent;
    }

    public String getCodeStorageKey() {
        return codeStorageKey;
    }

    public void setCodeStorageKey(String codeStorageKey) {
        this.codeStorageKey = codeStorageKey;
    }

    public String getCodeMimeType() {
        return codeMimeType;
    }

    public void setCodeMimeType(String codeMimeType) {
        this.codeMimeType = codeMimeType;
    }

    public Long getCodeSizeBytes() {
        return codeSizeBytes;
    }

    public void setCodeSizeBytes(Long codeSizeBytes) {
        this.codeSizeBytes = codeSizeBytes;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getRewardAmount() {
        return rewardAmount;
    }

    public void setRewardAmount(Double rewardAmount) {
        this.rewardAmount = rewardAmount;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
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

    public User getCompany() {
        return company;
    }

    public void setCompany(User company) {
        this.company = company;
    }
}

