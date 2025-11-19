package com.bugsecure.backend.service;

import com.bugsecure.backend.dto.WalletDTO;
import com.bugsecure.backend.model.Payment;
import com.bugsecure.backend.model.User;
import com.bugsecure.backend.model.WalletTransaction;
import com.bugsecure.backend.repository.PaymentRepository;
import com.bugsecure.backend.repository.UserRepository;
import com.bugsecure.backend.repository.WalletTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WalletService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletTransactionRepository walletTransactionRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    // Create or get wallet for user
    public WalletDTO getWallet(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create wallet if doesn't exist
        if (user.getWalletAddress() == null || user.getWalletAddress().isEmpty()) {
            user.setWalletAddress(generateWalletAddress());
            user.setBalance(0.0);
            user = userRepository.save(user);
        }

        return convertToWalletDTO(user);
    }

    // Get wallet balance
    public Double getBalance(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getWalletAddress() == null) {
            return 0.0;
        }

        return user.getBalance() != null ? user.getBalance() : 0.0;
    }

    // Deposit funds (Only for Companies)
    @Transactional
    public WalletDTO deposit(String email, Double amount, String description) {
        if (amount <= 0) {
            throw new RuntimeException("Deposit amount must be greater than 0");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Only companies can deposit
        if (!"COMPANY".equals(user.getRole())) {
            throw new RuntimeException("Only companies can deposit funds. Researchers can only withdraw.");
        }

        // Check if company has accepted the agreement
        if (user.getCompanyAgreementAccepted() == null || !user.getCompanyAgreementAccepted()) {
            throw new RuntimeException("Company agreement must be accepted before depositing funds. Please accept the company agreement first.");
        }

        // Create wallet if doesn't exist
        if (user.getWalletAddress() == null || user.getWalletAddress().isEmpty()) {
            user.setWalletAddress(generateWalletAddress());
            user.setBalance(0.0);
        }

        // Update balance
        Double currentBalance = user.getBalance() != null ? user.getBalance() : 0.0;
        user.setBalance(currentBalance + amount);
        user = userRepository.save(user);

        // Create transaction record
        WalletTransaction transaction = new WalletTransaction();
        transaction.setTransactionType("DEPOSIT");
        transaction.setAmount(amount);
        transaction.setUser(user);
        transaction.setStatus("COMPLETED");
        transaction.setDescription(description != null ? description : "Wallet deposit");
        transaction.setTransactionHash(generateTransactionHash());
        transaction.setCreatedAtIfNew();
        walletTransactionRepository.save(transaction);

        return convertToWalletDTO(user);
    }

    // Withdraw funds (Only for Researchers/Users)
    @Transactional
    public WalletDTO withdraw(String email, Double amount, String description, 
                             String withdrawalMethod, String withdrawalReference,
                             String accountHolderName, String ifscCode) {
        if (amount <= 0) {
            throw new RuntimeException("Withdrawal amount must be greater than 0");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Only researchers/users can withdraw
        if (!"USER".equals(user.getRole())) {
            throw new RuntimeException("Only researchers can withdraw funds. Companies can only deposit.");
        }

        if (user.getWalletAddress() == null) {
            throw new RuntimeException("Wallet not found. Please create a wallet first.");
        }

        Double currentBalance = user.getBalance() != null ? user.getBalance() : 0.0;
        if (currentBalance < amount) {
            throw new RuntimeException("Insufficient balance");
        }

        // Validate withdrawal method and reference
        if (withdrawalMethod == null || withdrawalMethod.trim().isEmpty()) {
            throw new RuntimeException("Withdrawal method is required");
        }

        if (withdrawalReference == null || withdrawalReference.trim().isEmpty()) {
            throw new RuntimeException("Withdrawal reference (Account No/UPI ID) is required");
        }

        // Validate bank details for bank transfers
        if ("BANK_TRANSFER".equals(withdrawalMethod)) {
            if (accountHolderName == null || accountHolderName.trim().isEmpty()) {
                throw new RuntimeException("Account holder name is required for bank transfers");
            }
            if (ifscCode == null || ifscCode.trim().isEmpty()) {
                throw new RuntimeException("IFSC code is required for bank transfers");
            }
            // Validate IFSC format: 4 letters + 0 + 6 alphanumeric
            String ifscUpper = ifscCode.trim().toUpperCase();
            if (!ifscUpper.matches("^[A-Z]{4}0[A-Z0-9]{6}$")) {
                throw new RuntimeException("Invalid IFSC code format. Format: 4 letters + 0 + 6 alphanumeric (e.g., SBIN0000456)");
            }
            if (withdrawalReference == null || withdrawalReference.trim().isEmpty()) {
                throw new RuntimeException("Bank account number is required for bank transfers");
            }
        }

        // Validate UPI format
        if ("UPI".equals(withdrawalMethod)) {
            if (withdrawalReference == null || withdrawalReference.trim().isEmpty()) {
                throw new RuntimeException("UPI ID is required");
            }
            // Validate UPI format: name@provider
            String upiId = withdrawalReference.trim();
            if (!upiId.matches("^[\\w.-]+@[a-zA-Z]+$")) {
                throw new RuntimeException("Invalid UPI ID format. Format: name@provider (e.g., yourname@okaxis)");
            }
        }

        // Validate PayPal email format
        if ("PAYPAL".equals(withdrawalMethod)) {
            if (withdrawalReference == null || withdrawalReference.trim().isEmpty()) {
                throw new RuntimeException("PayPal email is required");
            }
            // Basic email validation
            String paypalEmail = withdrawalReference.trim();
            if (!paypalEmail.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
                throw new RuntimeException("Invalid email format for PayPal");
            }
        }

        // Update balance
        user.setBalance(currentBalance - amount);
        user = userRepository.save(user);

        // Create transaction record with withdrawal details
        WalletTransaction transaction = new WalletTransaction();
        transaction.setTransactionType("WITHDRAWAL");
        transaction.setAmount(amount);
        transaction.setUser(user);
        transaction.setStatus("PENDING"); // Withdrawals are pending until processed
        transaction.setDescription(description != null ? description : 
            String.format("Wallet withdrawal via %s", withdrawalMethod));
        transaction.setWithdrawalMethod(withdrawalMethod);
        transaction.setWithdrawalReference(withdrawalReference);
        transaction.setAccountHolderName(accountHolderName);
        transaction.setIfscCode(ifscCode);
        transaction.setTransactionHash(generateTransactionHash());
        transaction.setCreatedAtIfNew();
        walletTransactionRepository.save(transaction);

        return convertToWalletDTO(user);
    }

    // Transfer funds from company to researcher (wallet-based only)
    @Transactional
    public Map<String, Object> transferFromCompanyToResearcher(String fromCompanyId, String toResearcherId, Double amount, String description) {
        if (amount <= 0) {
            throw new RuntimeException("Transfer amount must be greater than 0");
        }

        User fromCompany = userRepository.findById(fromCompanyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        User toResearcher = userRepository.findById(toResearcherId)
                .orElseThrow(() -> new RuntimeException("Researcher not found"));

        // Validate roles
        if (!"COMPANY".equals(fromCompany.getRole())) {
            throw new RuntimeException("Only companies can initiate transfers");
        }

        if (!"USER".equals(toResearcher.getRole())) {
            throw new RuntimeException("Transfers can only be made to researchers");
        }

        // Ensure wallets exist
        if (fromCompany.getWalletAddress() == null || fromCompany.getWalletAddress().isEmpty()) {
            fromCompany.setWalletAddress(generateWalletAddress());
            fromCompany.setBalance(0.0);
        }

        if (toResearcher.getWalletAddress() == null || toResearcher.getWalletAddress().isEmpty()) {
            toResearcher.setWalletAddress(generateWalletAddress());
            toResearcher.setBalance(0.0);
        }

        // Validate company balance
        Double companyBalance = fromCompany.getBalance() != null ? fromCompany.getBalance() : 0.0;
        if (companyBalance < amount) {
            throw new RuntimeException("Insufficient balance in company wallet");
        }

        // Update balances
        fromCompany.setBalance(companyBalance - amount);
        Double researcherBalance = toResearcher.getBalance() != null ? toResearcher.getBalance() : 0.0;
        toResearcher.setBalance(researcherBalance + amount);

        userRepository.save(fromCompany);
        userRepository.save(toResearcher);

        // Create transaction records with mirrored entries
        String transactionHash = generateTransactionHash();

        // Outgoing transaction for company (debit)
        WalletTransaction companyTransaction = new WalletTransaction();
        companyTransaction.setTransactionType("TRANSFER");
        companyTransaction.setAmount(amount);
        companyTransaction.setUser(fromCompany);
        companyTransaction.setToUser(toResearcher);
        companyTransaction.setStatus("COMPLETED");
        companyTransaction.setDescription(description != null ? description : 
            String.format("Payment to researcher: %s", toResearcher.getEmail()));
        companyTransaction.setTransactionHash(transactionHash);
        companyTransaction.setCreatedAtIfNew();
        walletTransactionRepository.save(companyTransaction);

        // Incoming transaction for researcher (credit)
        WalletTransaction researcherTransaction = new WalletTransaction();
        researcherTransaction.setTransactionType("REWARD");
        researcherTransaction.setAmount(amount);
        researcherTransaction.setUser(toResearcher);
        researcherTransaction.setFromUser(fromCompany);
        researcherTransaction.setStatus("COMPLETED");
        researcherTransaction.setDescription(description != null ? description : 
            String.format("Bug bounty reward from: %s", fromCompany.getCompanyName() != null ? 
                fromCompany.getCompanyName() : fromCompany.getEmail()));
        researcherTransaction.setTransactionHash(transactionHash);
        researcherTransaction.setCreatedAtIfNew();
        walletTransactionRepository.save(researcherTransaction);

        // Return response with updated balances
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Transfer completed successfully");
        response.put("transactionHash", transactionHash);
        response.put("companyBalance", fromCompany.getBalance());
        response.put("researcherBalance", toResearcher.getBalance());
        response.put("amount", amount);
        return response;
    }

    // Legacy transfer method (kept for backward compatibility)
    @Transactional
    public WalletDTO transfer(String fromEmail, String toEmail, Double amount, String description) {
        if (amount <= 0) {
            throw new RuntimeException("Transfer amount must be greater than 0");
        }

        User fromUser = userRepository.findByEmail(fromEmail)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        User toUser = userRepository.findByEmail(toEmail)
                .orElseThrow(() -> new RuntimeException("Recipient not found"));

        if (fromUser.getWalletAddress() == null) {
            throw new RuntimeException("Sender wallet not found");
        }

        if (toUser.getWalletAddress() == null) {
            // Create wallet for recipient if doesn't exist
            toUser.setWalletAddress(generateWalletAddress());
            toUser.setBalance(0.0);
        }

        Double fromBalance = fromUser.getBalance() != null ? fromUser.getBalance() : 0.0;
        if (fromBalance < amount) {
            throw new RuntimeException("Insufficient balance");
        }

        // Update balances
        fromUser.setBalance(fromBalance - amount);
        Double toBalance = toUser.getBalance() != null ? toUser.getBalance() : 0.0;
        toUser.setBalance(toBalance + amount);

        userRepository.save(fromUser);
        userRepository.save(toUser);

        // Create transaction records
        String transactionHash = generateTransactionHash();

        // Outgoing transaction for sender
        WalletTransaction fromTransaction = new WalletTransaction();
        fromTransaction.setTransactionType("TRANSFER");
        fromTransaction.setAmount(amount);
        fromTransaction.setUser(fromUser);
        fromTransaction.setToUser(toUser);
        fromTransaction.setStatus("COMPLETED");
        fromTransaction.setDescription(description != null ? description : "Transfer to " + toUser.getEmail());
        fromTransaction.setTransactionHash(transactionHash);
        fromTransaction.setCreatedAtIfNew();
        walletTransactionRepository.save(fromTransaction);

        // Incoming transaction for recipient
        WalletTransaction toTransaction = new WalletTransaction();
        toTransaction.setTransactionType("TRANSFER");
        toTransaction.setAmount(amount);
        toTransaction.setUser(toUser);
        toTransaction.setFromUser(fromUser);
        toTransaction.setStatus("COMPLETED");
        toTransaction.setDescription(description != null ? description : "Transfer from " + fromUser.getEmail());
        toTransaction.setTransactionHash(transactionHash);
        toTransaction.setCreatedAtIfNew();
        walletTransactionRepository.save(toTransaction);

        return convertToWalletDTO(fromUser);
    }

    // Add reward to wallet (when payment is completed)
    @Transactional
    public WalletDTO addReward(String email, Double amount, String paymentId, String description) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getWalletAddress() == null || user.getWalletAddress().isEmpty()) {
            user.setWalletAddress(generateWalletAddress());
            user.setBalance(0.0);
        }

        Double currentBalance = user.getBalance() != null ? user.getBalance() : 0.0;
        user.setBalance(currentBalance + amount);
        user = userRepository.save(user);

        // Link to payment if provided
        Payment payment = null;
        if (paymentId != null && !paymentId.isEmpty()) {
            payment = paymentRepository.findById(paymentId).orElse(null);
        }

        // Create transaction record
        WalletTransaction transaction = new WalletTransaction();
        transaction.setTransactionType("REWARD");
        transaction.setAmount(amount);
        transaction.setUser(user);
        transaction.setPayment(payment);
        transaction.setStatus("COMPLETED");
        transaction.setDescription(description != null ? description : "Bug bounty reward");
        transaction.setTransactionHash(generateTransactionHash());
        transaction.setCreatedAtIfNew();
        walletTransactionRepository.save(transaction);

        return convertToWalletDTO(user);
    }

    // Get transaction history
    public List<WalletDTO.TransactionDTO> getTransactionHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<WalletTransaction> transactions = walletTransactionRepository
                .findByUserOrderByCreatedAtDesc(user);

        return transactions.stream()
                .map(this::convertToTransactionDTO)
                .collect(Collectors.toList());
    }

    // Helper methods
    private String generateWalletAddress() {
        return "WALLET_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
    }

    private String generateTransactionHash() {
        return "TX_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
    }

    private WalletDTO convertToWalletDTO(User user) {
        WalletDTO dto = new WalletDTO();
        dto.setWalletAddress(user.getWalletAddress());
        dto.setBalance(user.getBalance() != null ? user.getBalance() : 0.0);
        dto.setCurrency("USD");

        // Load transaction history
        List<WalletTransaction> transactions = walletTransactionRepository
                .findByUserOrderByCreatedAtDesc(user);
        dto.setTransactionHistory(transactions.stream()
                .map(this::convertToTransactionDTO)
                .limit(50) // Limit to last 50 transactions
                .collect(Collectors.toList()));

        return dto;
    }

    private WalletDTO.TransactionDTO convertToTransactionDTO(WalletTransaction transaction) {
        WalletDTO.TransactionDTO dto = new WalletDTO.TransactionDTO();
        dto.setId(transaction.getId());
        dto.setTransactionType(transaction.getTransactionType());
        dto.setAmount(transaction.getAmount());
        dto.setCurrency(transaction.getCurrency());
        dto.setStatus(transaction.getStatus());
        dto.setDescription(transaction.getDescription());
        dto.setCreatedAt(transaction.getCreatedAt() != null ? 
                transaction.getCreatedAt().format(formatter) : null);
        
        if (transaction.getFromUser() != null) {
            dto.setFromUser(transaction.getFromUser().getEmail());
        }
        if (transaction.getToUser() != null) {
            dto.setToUser(transaction.getToUser().getEmail());
        }
        
        // Include withdrawal details
        dto.setWithdrawalMethod(transaction.getWithdrawalMethod());
        dto.setWithdrawalReference(transaction.getWithdrawalReference());
        dto.setAccountHolderName(transaction.getAccountHolderName());
        dto.setIfscCode(transaction.getIfscCode());

        return dto;
    }
}


