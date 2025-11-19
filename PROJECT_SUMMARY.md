# BugSecure Platform - Project Summary

## Overview

BugSecure is a comprehensive bug bounty and code testing platform that connects companies with security researchers. Companies can upload their code for security testing, and researchers can test the code, report bugs, and earn rewards.

## What Has Been Built

### Backend (Spring Boot)

#### Models
- **User**: Supports three roles (USER, COMPANY, ADMIN) with company name field for companies
- **CodeSubmission**: Stores code files, descriptions, reward amounts, and status
- **BugReport**: Stores bug reports with severity levels, steps to reproduce, and reward information

#### Repositories
- UserRepository: User data access
- CodeSubmissionRepository: Submission data access with company and status filtering
- BugReportRepository: Bug report data access with submission and reporter filtering

#### Services
- **CodeSubmissionService**: Business logic for submission management
- **BugReportService**: Business logic for bug report management with reward calculation
- **UserDetailsServiceImpl**: Spring Security user details service
- **UserService**: User management service

#### Controllers
- **LoginController**: Authentication endpoint returning JWT token and user info
- **UserController**: User registration endpoint
- **DashboardController**: User dashboard data endpoint
- **CodeSubmissionController**: CRUD operations for code submissions
- **BugReportController**: CRUD operations for bug reports
- **AdminController**: Admin-only endpoints for platform management

#### Security
- JWT-based authentication
- Role-based access control (RBAC)
- CORS configuration for frontend integration
- Password encryption with BCrypt

### Frontend (React)

#### Pages
- **Home**: Landing page with platform information
- **CompanyDashboard**: Company-specific dashboard for managing submissions and bug reports
- **ResearcherDashboard**: Researcher dashboard for viewing submissions and submitting bug reports
- **AdminDashboard**: Admin dashboard for platform management and statistics

#### Components
- **LoginForm**: User authentication form
- **RegisterForm**: User registration with role selection
- **Dashboard**: Main dashboard router that redirects based on user role
- **CodeSubmissionForm**: Form for companies to create code submissions
- **BugReportForm**: Form for researchers to submit bug reports
- **SubmissionList**: List component for displaying submissions with actions
- **Navbar**: Navigation bar with role-based menu items

#### Services
- **api.js**: Axios instance with JWT token interceptor
- **AuthService**: Authentication service for login, register, and logout

## Key Features

### For Companies
1. **Create Code Submissions**
   - Upload code files or paste code content
   - Set reward amounts
   - Add descriptions and titles
   - Manage submission status (OPEN, CLOSED)

2. **Manage Bug Reports**
   - View all bug reports for their submissions
   - Approve or reject bug reports
   - View reward amounts
   - Track bug report status

### For Researchers
1. **Browse Submissions**
   - View all open code submissions
   - See reward amounts
   - View code content
   - Filter by status

2. **Submit Bug Reports**
   - Detailed bug reporting form
   - Severity levels (LOW, MEDIUM, HIGH, CRITICAL)
   - Steps to reproduce
   - Expected vs actual behavior
   - Track reward status

### For Administrators
1. **Platform Management**
   - View all users
   - View all submissions
   - View all bug reports
   - Platform statistics
   - Manage bug report statuses

## Reward System

- Companies set base reward amounts when creating submissions
- Bug report rewards are calculated based on severity:
  - CRITICAL: 100% of base reward
  - HIGH: 75% of base reward
  - MEDIUM: 50% of base reward
  - LOW: 25% of base reward
- Rewards are awarded when bug reports are approved by companies

## Database Schema

### Tables
1. **users**: User accounts with roles and company information
2. **code_submissions**: Code submissions with company relationship
3. **bug_reports**: Bug reports with submission and reporter relationships

### Relationships
- CodeSubmission → User (Many-to-One) - Company owns submissions
- BugReport → CodeSubmission (Many-to-One) - Reports belong to submissions
- BugReport → User (Many-to-One) - Researcher submits reports

## API Endpoints

### Public Endpoints
- `POST /api/auth/login` - User login
- `POST /api/users/register` - User registration

### Authenticated Endpoints
- `GET /api/dashboard/me` - Get current user info
- `GET /api/submissions` - Get all submissions
- `GET /api/submissions/my-submissions` - Get company's submissions
- `POST /api/submissions` - Create submission (COMPANY only)
- `GET /api/bug-reports/my-reports` - Get user's bug reports
- `POST /api/bug-reports` - Submit bug report (USER only)
- `PUT /api/bug-reports/{id}/status` - Update bug report status (COMPANY/ADMIN)

### Admin Endpoints
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/submissions` - Get all submissions
- `GET /api/admin/bug-reports` - Get all bug reports

## Security Features

1. **JWT Authentication**: Token-based authentication for all API requests
2. **Password Encryption**: BCrypt password hashing
3. **Role-Based Access Control**: Different permissions for USER, COMPANY, and ADMIN
4. **CORS Configuration**: Secure cross-origin requests
5. **Input Validation**: Server-side validation for all inputs

## Technology Stack

### Backend
- Spring Boot 3.5.7
- Spring Security
- JWT (Java JWT)
- MySQL 8.0
- JPA/Hibernate
- Maven

### Frontend
- React 19
- React Router
- Tailwind CSS
- Axios
- Framer Motion

## File Structure

```
BugSecure/
├── backend/
│   ├── src/main/java/com/bugsecure/backend/
│   │   ├── config/          # Security, JWT, CORS configuration
│   │   ├── controller/      # REST API controllers
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── model/           # Entity models
│   │   ├── repository/      # Data access layer
│   │   └── service/         # Business logic
│   └── src/main/resources/
│       └── application.properties
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── App.js           # Main app component
│   └── package.json
├── README.md
├── DATABASE_SETUP.md
├── QUICK_START.md
└── PROJECT_SUMMARY.md
```

## How to Run

1. **Setup Database**: Create MySQL database `bugsecure_db`
2. **Start Backend**: `cd backend && mvn spring-boot:run`
3. **Start Frontend**: `cd frontend && npm start`
4. **Access Application**: Open `http://localhost:3000` in browser

## Testing the Platform

1. Register a company account
2. Register a researcher account
3. Login as company and create a submission
4. Login as researcher and submit a bug report
5. Login as company and approve the bug report
6. Verify reward is calculated correctly

## Future Enhancements

Potential improvements:
- Email notifications
- Payment integration for rewards
- Code analysis tools
- Bug report comments and discussions
- File attachment support for bug reports
- Advanced search and filtering
- Dashboard analytics and charts
- Two-factor authentication
- API rate limiting
- Docker containerization
- CI/CD pipeline

## Conclusion

The BugSecure platform is a fully functional bug bounty platform with:
- ✅ Complete user authentication and authorization
- ✅ Role-based access control
- ✅ Code submission management
- ✅ Bug report system
- ✅ Reward calculation and tracking
- ✅ Admin dashboard
- ✅ Responsive UI
- ✅ Secure API endpoints
- ✅ Database integration
- ✅ File upload support

The platform is ready for testing and can be extended with additional features as needed.













