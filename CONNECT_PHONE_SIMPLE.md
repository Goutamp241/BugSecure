# 📱 Simple Phone Connection Guide

## Your Setup
- **IP Address:** `192.168.1.174`
- **Backend URL:** `http://192.168.1.174:8080`
- **Frontend URL:** `http://192.168.1.174:3000`

## 🚀 3 Simple Steps

### 1️⃣ Start Backend
```bash
cd backend
mvnw spring-boot:run
```
Wait for: `Started BugSecureBackendApplication`

### 2️⃣ Start Frontend
```bash
cd frontend
npm start
```
Wait for: `Compiled successfully!`

### 3️⃣ Open on Phone
**On your phone browser, type:**
```
http://192.168.1.174:3000
```

## ✅ That's It!

If it doesn't work, check:
1. Phone and computer on same WiFi? ✅
2. Backend running? ✅
3. Frontend running? ✅
4. Windows Firewall allows Node.js? ✅

## 🔧 Quick Fixes

**Can't connect?**
- Check IP: Run `ipconfig` on computer
- Update `frontend/.env` if IP changed
- Restart frontend after updating `.env`

**Firewall blocking?**
- Windows Security → Firewall → Allow Node.js and Java

**Still not working?**
- See `PHONE_CONNECTION_GUIDE.md` for detailed troubleshooting







