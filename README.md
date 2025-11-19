# BugSecure Platform

A comprehensive bug bounty and code testing platform where companies can upload their code for security testing, and researchers can test code, report bugs, and earn rewards.

## Features

### For Companies
- Upload code files for security testing
- Set reward amounts for bug discoveries
- View and manage bug reports
- Approve/reject bug reports
- Close submissions when testing is complete

### For Researchers/Users
- Browse open code submissions
- Submit detailed bug reports
- Track reward status
- View submission history

### For Administrators
- Manage all users, submissions, and bug reports
- View platform statistics
- Monitor system activity

## Technology Stack

### Backend
- **Spring Boot 3.5.7** - Java backend framework
- **Spring Security** - Authentication and authorization
- **JWT** - Token-based authentication
- **MySQL** - Database
- **JPA/Hibernate** - ORM

### Frontend
- **React 19** - UI framework
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

## Prerequisites

- Java 17 or higher
- Node.js 14 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher

## Database Setup

1. Create MySQL database:
```sql
CREATE DATABASE bugsecure_db;
```

2. Update database credentials in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/bugsecure_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=Goutam@123
```

3. The application will automatically create tables on first run (using `spring.jpa.hibernate.ddl-auto=update`)

## Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Build the project:
```bash
mvn clean install
```

3. Run the application:
```bash
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

## Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will start on `http://localhost:3000`

## User Roles

### USER (Researcher)
- Can browse open submissions
- Can submit bug reports
- Can view their own bug reports and rewards

### COMPANY
- Can create code submissions
- Can view bug reports for their submissions
- Can approve/reject bug reports
- Can close submissions

### ADMIN
- Full access to all features
- Can manage users
- Can view all submissions and bug reports
- Can view platform statistics

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/users/register` - User registration

### Submissions
- `GET /api/submissions` - Get all submissions
- `GET /api/submissions/my-submissions` - Get company's submissions
- `GET /api/submissions/{id}` - Get submission by ID
- `POST /api/submissions` - Create new submission (COMPANY only)
- `PUT /api/submissions/{id}` - Update submission (COMPANY only)
- `DELETE /api/submissions/{id}` - Delete submission (COMPANY only)

### Bug Reports
- `GET /api/bug-reports` - Get all bug reports
- `GET /api/bug-reports/my-reports` - Get user's bug reports
- `GET /api/bug-reports/submission/{submissionId}` - Get bug reports for submission
- `GET /api/bug-reports/{id}` - Get bug report by ID
- `POST /api/bug-reports` - Create new bug report (USER only)
- `PUT /api/bug-reports/{id}/status` - Update bug report status (COMPANY/ADMIN)

### Admin
- `GET /api/admin/users` - Get all users (ADMIN only)
- `GET /api/admin/submissions` - Get all submissions (ADMIN only)
- `GET /api/admin/bug-reports` - Get all bug reports (ADMIN only)
- `GET /api/admin/stats` - Get platform statistics (ADMIN only)

## Default Configuration

- Backend Port: 8080
- Frontend Port: 3000
- Database: bugsecure_db
- JWT Secret: mysupersecretkey-must-be-very-long-and-random-12345

## Security Features

- JWT-based authentication
- Password encryption using BCrypt
- Role-based access control (RBAC)
- CORS configuration
- Secure API endpoints

## Project Structure

```
BugSecure/
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/bugsecure/backend/
│   │       │       ├── config/          # Security and JWT configuration
│   │       │       ├── controller/      # REST controllers
│   │       │       ├── dto/             # Data Transfer Objects
│   │       │       ├── model/           # Entity models
│   │       │       ├── repository/      # Data access layer
│   │       │       └── service/         # Business logic
│   │       └── resources/
│   │           └── application.properties
│   └── pom.xml
└── frontend/
    ├── src/
    │   ├── components/     # React components
    │   ├── pages/          # Page components
    │   ├── services/       # API services
    │   └── App.js
    └── package.json
```

## Usage

1. **Register a new account** - Choose your role (USER, COMPANY, or ADMIN)
2. **Login** - Use your credentials to access the platform
3. **For Companies**: Create code submissions and manage bug reports
4. **For Researchers**: Browse submissions and submit bug reports
5. **For Admins**: Monitor and manage the entire platform

## Reward System

- Rewards are set by companies when creating submissions
- Bug report rewards are calculated based on severity:
  - CRITICAL: 100% of base reward
  - HIGH: 75% of base reward
  - MEDIUM: 50% of base reward
  - LOW: 25% of base reward
- Rewards are awarded when bug reports are approved by the company

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on the GitHub repository.

## Author

BugSecure Development Team













