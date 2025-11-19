# Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Java 17+ installed
- ✅ Node.js 14+ installed
- ✅ MySQL 8.0+ installed and running
- ✅ Maven 3.6+ installed

## Step-by-Step Setup

### 1. Database Setup (5 minutes)

1. Open MySQL command line or MySQL Workbench
2. Create the database:
   ```sql
   CREATE DATABASE bugsecure_db;
   ```
3. Verify the database was created:
   ```sql
   SHOW DATABASES;
   ```

### 2. Backend Setup (5 minutes)

1. Open terminal/command prompt
2. Navigate to backend directory:
   ```bash
   cd backend
   ```
3. Build the project:
   ```bash
   mvn clean install
   ```
4. Start the backend server:
   ```bash
   mvn spring-boot:run
   ```
5. Wait for the message: `Started BugSecureBackendApplication`
6. Backend is now running on `http://localhost:8080`

### 3. Frontend Setup (5 minutes)

1. Open a NEW terminal/command prompt
2. Navigate to frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the frontend server:
   ```bash
   npm start
   ```
5. Wait for the browser to open automatically
6. Frontend is now running on `http://localhost:3000`

### 4. First Use (2 minutes)

1. **Register a Company Account:**
   - Click "Register"
   - Fill in username, email, password
   - Select "Company" as role
   - Enter company name
   - Click "Register"

2. **Register a Researcher Account:**
   - Click "Register" (or logout if logged in)
   - Fill in username, email, password
   - Select "Researcher/User" as role
   - Click "Register"

3. **Test the Platform:**
   - Login as Company
   - Create a code submission
   - Logout and login as Researcher
   - View the submission and submit a bug report
   - Logout and login as Company
   - View and approve the bug report

## Troubleshooting

### Backend won't start
- **Issue**: Port 8080 already in use
- **Solution**: Change port in `application.properties` or stop the service using port 8080

### Frontend won't start
- **Issue**: Port 3000 already in use
- **Solution**: The app will prompt to use a different port, or change it manually

### Database connection error
- **Issue**: Cannot connect to MySQL
- **Solution**: 
  1. Verify MySQL is running
  2. Check username/password in `application.properties`
  3. Verify database `bugsecure_db` exists

### CORS errors
- **Issue**: Frontend can't connect to backend
- **Solution**: 
  1. Verify backend is running on port 8080
  2. Verify frontend is running on port 3000
  3. Check browser console for specific errors

## Default Test Accounts

You can create test accounts with these roles:

### Admin Account
- Role: ADMIN
- Can manage all users and content

### Company Account
- Role: COMPANY
- Can create submissions and manage bug reports

### Researcher Account
- Role: USER
- Can view submissions and submit bug reports

## API Testing

You can test the API using:
- Postman
- curl commands
- Browser DevTools

Example curl command for login:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Next Steps

1. Read the full [README.md](README.md) for detailed documentation
2. Check [DATABASE_SETUP.md](DATABASE_SETUP.md) for database configuration
3. Explore the codebase to understand the architecture
4. Customize the platform for your needs

## Support

If you encounter any issues:
1. Check the console logs for error messages
2. Verify all prerequisites are installed
3. Ensure MySQL is running
4. Check that ports 8080 and 3000 are available

## Development Tips

- Backend logs are shown in the terminal where you ran `mvn spring-boot:run`
- Frontend logs are shown in the browser console and terminal
- Database tables are created automatically on first run
- Use browser DevTools to debug frontend issues
- Use Spring Boot Actuator for backend monitoring (if configured)

Happy coding! 🚀













