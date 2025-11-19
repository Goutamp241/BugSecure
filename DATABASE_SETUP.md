# Database Setup Guide

## MySQL Database Configuration

### Step 1: Create Database

Open MySQL command line or MySQL Workbench and run:

```sql
CREATE DATABASE bugsecure_db;
```

### Step 2: Verify Database Creation

```sql
SHOW DATABASES;
```

You should see `bugsecure_db` in the list.

### Step 3: Configure Application Properties

The database configuration is already set in `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/bugsecure_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=Goutam@123
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
```

### Step 4: Automatic Table Creation

The application uses `spring.jpa.hibernate.ddl-auto=update`, which means:
- Tables will be automatically created on first run
- Tables will be updated if entity models change
- Existing data will be preserved

### Step 5: Verify Tables

After running the application, you can verify tables were created:

```sql
USE bugsecure_db;
SHOW TABLES;
```

You should see the following tables:
- `users` - User accounts (USER, COMPANY, ADMIN)
- `code_submissions` - Code submissions by companies
- `bug_reports` - Bug reports by researchers

### Step 6: Check Table Structure

```sql
DESCRIBE users;
DESCRIBE code_submissions;
DESCRIBE bug_reports;
```

## Manual Table Creation (Optional)

If you prefer to create tables manually, here are the SQL scripts:

### Users Table

```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    company_name VARCHAR(255),
    INDEX idx_email (email)
);
```

### Code Submissions Table

```sql
CREATE TABLE code_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    code_content TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    reward_amount DOUBLE NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    company_id BIGINT NOT NULL,
    FOREIGN KEY (company_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_company (company_id),
    INDEX idx_status (status)
);
```

### Bug Reports Table

```sql
CREATE TABLE bug_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    steps_to_reproduce TEXT,
    expected_behavior TEXT,
    actual_behavior TEXT,
    severity VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    reward_amount DOUBLE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    submission_id BIGINT NOT NULL,
    reporter_id BIGINT NOT NULL,
    FOREIGN KEY (submission_id) REFERENCES code_submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_submission (submission_id),
    INDEX idx_reporter (reporter_id),
    INDEX idx_status (status)
);
```

## Database Connection Issues

### Issue: Connection Refused

**Solution**: 
1. Ensure MySQL server is running
2. Check if MySQL is running on port 3306
3. Verify username and password in application.properties

### Issue: Access Denied

**Solution**:
1. Verify MySQL username and password
2. Check if user has privileges to create databases
3. Grant privileges if needed:
   ```sql
   GRANT ALL PRIVILEGES ON bugsecure_db.* TO 'root'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Issue: Table Creation Failed

**Solution**:
1. Check MySQL version (requires MySQL 8.0+)
2. Verify database exists
3. Check application logs for specific error messages
4. Ensure user has CREATE TABLE privileges

## Backup and Restore

### Backup Database

```bash
mysqldump -u root -p bugsecure_db > bugsecure_backup.sql
```

### Restore Database

```bash
mysql -u root -p bugsecure_db < bugsecure_backup.sql
```

## Reset Database

To reset the database completely:

```sql
DROP DATABASE bugsecure_db;
CREATE DATABASE bugsecure_db;
```

Then restart the Spring Boot application to recreate tables.

## Production Considerations

For production deployment:

1. Change `spring.jpa.hibernate.ddl-auto` from `update` to `validate` or `none`
2. Use a dedicated database user with limited privileges
3. Enable SSL connections
4. Use connection pooling
5. Set up database backups
6. Monitor database performance

## Troubleshooting

### Check MySQL Status

```bash
# Linux/Mac
sudo systemctl status mysql

# Windows
# Check Services panel for MySQL service
```

### View Application Logs

Check the Spring Boot console output for database connection messages and any errors.

### Test Database Connection

You can test the database connection using MySQL command line:

```bash
mysql -u root -p
```

Then:
```sql
USE bugsecure_db;
SELECT * FROM users;
```

If you can access the database and see tables, the connection is working.













