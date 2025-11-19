# Quick Start Guide - MongoDB Setup

## ✅ What's Been Done

1. ✅ MongoDB migration completed (all models, repositories, DTOs updated)
2. ✅ Profile image upload fixed with new endpoint
3. ✅ CORS configured for mobile access
4. ✅ Frontend `.env` file created with your IP: `192.168.1.174`
5. ✅ All controllers updated to use String IDs
6. ✅ All services updated with timestamp methods

## 🚀 Start Your Application

### Step 1: Start MongoDB

**Option A - Using MongoDB Compass (Easiest):**
1. Open MongoDB Compass from Start Menu
2. Click "Connect" (uses default: `mongodb://localhost:27017`)
3. Done! MongoDB is running

**Option B - Using Windows Services:**
1. Press `Win + R`, type `services.msc`
2. Find "MongoDB Server" service
3. Right-click → Start (if not running)
4. Set to Automatic startup

### Step 2: Start Backend

Open **Terminal 1** (Command Prompt or PowerShell):
```bash
cd C:\Users\HP\Desktop\BugSecure\backend
mvnw spring-boot:run
```

Wait for: `Started BugSecureBackendApplication in X seconds`

### Step 3: Start Frontend

Open **Terminal 2** (New Command Prompt or PowerShell):
```bash
cd C:\Users\HP\Desktop\BugSecure\frontend
npm start
```

Wait for browser to open at `http://localhost:3000`

## 📱 Access from Mobile Device

1. **Ensure mobile device is on the same WiFi network**

2. **On your mobile device:**
   - Open browser
   - Go to: `http://192.168.1.174:3000`
   - The app should load!

## 🔍 Verify MongoDB Connection

### Using MongoDB Compass:
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. You should see `bugsecure_db` database
4. Click on it to see collections:
   - `users`
   - `code_submissions`
   - `bug_reports`
   - `payments`
   - `submission_files`

### Using Command Line:
```bash
mongosh
use bugsecure_db
show collections
db.users.find()
```

## 🎯 Default Admin Accounts

After first backend start, these accounts are created:
- **Email:** `goutamp0242@gmail.com` | **Password:** `Goutam@123`
- **Email:** `namanbabbar37@gmail.com` | **Password:** `Naman@123`
- **Email:** `bugsecure12admin@gmail.com` | **Password:** `BugSecure12Admin`

## 📝 MongoDB Quick Commands

### View All Users:
```javascript
db.users.find().pretty()
```

### View All Submissions:
```javascript
db.code_submissions.find().pretty()
```

### Find Admin Users:
```javascript
db.users.find({role: "ADMIN"})
```

### Count Documents:
```javascript
db.users.countDocuments()
```

## ⚠️ Troubleshooting

### MongoDB Not Starting?
- Check Windows Services: `services.msc`
- Look for "MongoDB Server" service
- Start it manually if needed

### Backend Won't Start?
- Check MongoDB is running first
- Check `application.properties` has: `spring.data.mongodb.uri=mongodb://localhost:27017/bugsecure_db`
- Check for port conflicts (port 8080)

### Frontend Can't Connect?
- Verify `.env` file exists in `frontend` folder
- Check it contains: `REACT_APP_API_URL=http://192.168.1.174:8080`
- Restart frontend after creating `.env`

### Mobile Device Can't Connect?
- Verify IP address: Run `ipconfig` (should show 192.168.1.174)
- Check Windows Firewall allows Node.js and Java
- Ensure devices on same WiFi network
- Test backend directly: `http://192.168.1.174:8080`

## 📚 More Information

- **Full MongoDB Guide:** See `MONGODB_SETUP_GUIDE.md`
- **Migration Details:** See `MONGODB_MIGRATION_GUIDE.md`

## ✅ Checklist

- [ ] MongoDB is running (Compass or Service)
- [ ] Backend started successfully
- [ ] Frontend started successfully
- [ ] Can access `http://localhost:3000` on PC
- [ ] Can access `http://192.168.1.174:3000` on mobile
- [ ] MongoDB Compass shows `bugsecure_db` database
- [ ] Can login with admin account

**You're all set! 🎉**







