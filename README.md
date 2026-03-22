# 🚀 BugSecure - Bug Bounty & Code Testing Platform

BugSecure is a **full-stack bug bounty platform** that connects **companies** with **security researchers**.
Companies can upload their code for testing, and researchers can find bugs and earn rewards based on severity.

---

## 🌟 Features

### 🏢 For Companies

* Upload code for security testing
* Set reward amounts
* Manage bug reports
* Approve / reject vulnerabilities
* Close submissions

### 👨‍💻 For Researchers

* Browse available projects
* Submit detailed bug reports
* Track rewards
* View submission history

### 🛡️ For Admins

* Manage users, submissions, reports
* Monitor platform activity
* View analytics and stats

---

## 🧠 Key Highlights

* 🔐 JWT Authentication & Authorization
* 👥 Role-Based Access (USER / COMPANY / ADMIN)
* 💰 Reward Calculation System
* 📂 Code Submission & Bug Tracking
* ⚡ REST APIs with secure endpoints
* 📱 Mobile-accessible frontend

---

## 🏗️ Tech Stack

### 🔧 Backend

* Spring Boot 3
* Spring Security
* JWT Authentication
* MongoDB
* JPA / Hibernate
* Maven

### 🎨 Frontend

* React 19
* React Router
* Tailwind CSS
* Axios
* Framer Motion

---

## 📁 Project Structure

```
BugSecure/
│
├── backend/
│   ├── src/main/java/com/bugsecure/backend/
│   │   ├── config/        # Security & JWT config
│   │   ├── controller/    # REST APIs
│   │   ├── dto/           # Data Transfer Objects
│   │   ├── model/         # Entities
│   │   ├── repository/    # DB Layer
│   │   └── service/       # Business Logic
│   └── application.properties
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.js
│   └── package.json
│
├── README.md
├── PROJECT_SUMMARY.md
├── QUICK_START_MONGODB.md
└── CONNECT_PHONE_SIMPLE.md
```

---

## ⚙️ Installation & Setup

### 📌 Prerequisites

* Java 17+
* Node.js
* MongoDB
* Maven

---

## 🚀 Run the Project

### 🔹 1. Start MongoDB

Make sure MongoDB is running

---

### 🔹 2. Run Backend

```bash
cd backend
mvn clean install
./mvnw spring-boot:run
```

Backend runs on:
👉 http://localhost:8080

---

### 🔹 3. Run Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on:
👉 http://localhost:3000

---

## 📱 Access from Mobile

Use your local IP:

```
http://YOUR-IP:3000
```

Example:
`http://192.168.1.174:3000`

---

## 🔐 Authentication Flow

1. User registers
2. Login → JWT Token generated
3. Token used in API requests
4. Access based on role

---

## 🧾 API Overview

### 🔑 Auth

* POST `/api/auth/login`
* POST `/api/users/register`

### 📦 Submissions

* GET `/api/submissions`
* POST `/api/submissions`
* PUT `/api/submissions/{id}`

### 🐞 Bug Reports

* POST `/api/bug-reports`
* GET `/api/bug-reports/my-reports`
* PUT `/api/bug-reports/{id}/status`

### 🛡️ Admin

* GET `/api/admin/users`
* GET `/api/admin/stats`

---

## 💰 Reward System

| Severity | Reward |
| -------- | ------ |
| CRITICAL | 100%   |
| HIGH     | 75%    |
| MEDIUM   | 50%    |
| LOW      | 25%    |

---

## 🗄️ Database Collections

* users
* code_submissions
* bug_reports
* payments
* submission_files

---

## 🧪 How to Test

1. Register as COMPANY
2. Create submission
3. Register as USER
4. Submit bug report
5. Approve from company dashboard
6. Check reward calculation

---

## ⚠️ Troubleshooting

* MongoDB not running → start service
* Port issue → check 8080 / 3000
* API not connecting → check `.env`
* Mobile not loading → check IP & firewall

---

## 📌 Useful Commands

```bash
git status
git add .
git commit -m "update project"
git push origin main
```

---

## 🚀 Future Enhancements

* Payment integration 💳
* Email notifications 📧
* 2FA Authentication 🔐
* Docker support 🐳
* CI/CD pipeline ⚙️
* Advanced analytics 📊

---

## 🤝 Contributing

1. Fork repo
2. Create branch
3. Commit changes
4. Push & create PR

---

## 📜 License

MIT License

---

## 👨‍💻 Author

**Goutam Patel**

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!

---
