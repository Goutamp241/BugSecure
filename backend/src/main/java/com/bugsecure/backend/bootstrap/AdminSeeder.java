package com.bugsecure.backend.bootstrap;

import com.bugsecure.backend.model.User;
import com.bugsecure.backend.repository.BugReportRepository;
import com.bugsecure.backend.repository.CodeSubmissionRepository;
import com.bugsecure.backend.repository.PaymentRepository;
import com.bugsecure.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.boot.CommandLineRunner;

@Component
@Order(1)
public class AdminSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CodeSubmissionRepository codeSubmissionRepository;

    @Autowired
    private BugReportRepository bugReportRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Wipe existing data (fresh start as requested)
        paymentRepository.deleteAll();
        bugReportRepository.deleteAll();
        codeSubmissionRepository.deleteAll();
        userRepository.deleteAll();

        // Seed three admin users
        createAdminIfMissing("goutamp0242@gmail.com", "Goutam@123", "Goutam");
        createAdminIfMissing("namanbabbar37@gmail.com", "Naman@123", "Naman");
        createAdminIfMissing("bugsecure12admin@gmail.com", "BugSecure12Admin", "BugSecureAdmin");
    }

    private void createAdminIfMissing(String email, String rawPassword, String username) {
        if (userRepository.findByEmail(email).isPresent()) {
            return;
        }
        User admin = new User();
        admin.setEmail(email);
        admin.setUsername(username);
        admin.setPassword(passwordEncoder.encode(rawPassword));
        admin.setRole("ADMIN");
        userRepository.save(admin);
    }
}








