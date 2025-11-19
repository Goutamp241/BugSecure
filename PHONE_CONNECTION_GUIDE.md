# 📱 How to Connect Your Phone to the Application

## Your IP Address: **192.168.1.174**

## ✅ Prerequisites Checklist

Before connecting your phone, ensure:

- [ ] MongoDB is running (check MongoDB Compass or Services)
- [ ] Backend is running on `http://192.168.1.174:8080`
- [ ] Frontend is running on `http://192.168.1.174:3000`
- [ ] Your phone and computer are on the **SAME WiFi network**
- [ ] Windows Firewall allows Node.js and Java

## 🔧 Step-by-Step Connection Guide

### Step 1: Verify Your IP Address

**On your computer (Windows):**
1. Press `Win + R`
2. Type `cmd` and press Enter
3. Type: `ipconfig`
4. Look for "IPv4 Address" under your WiFi adapter
5. Should show: `192.168.1.174`

**If IP is different:**
- Update `frontend/.env` file with the correct IP
- Restart frontend after updating

### Step 2: Start Backend Server

**Open Terminal/PowerShell:**
```bash
cd C:\Users\HP\Desktop\BugSecure\backend
mvnw spring-boot:run
```

**Wait for this message:**
```
Started BugSecureBackendApplication in X.XXX seconds
```

**Verify backend is accessible:**
- Open browser on your computer
- Go to: `http://192.168.1.174:8080/api/auth/login`
- You should see a response (even if it's an error, it means server is running)

### Step 3: Start Frontend Server

**Open a NEW Terminal/PowerShell:**
```bash
cd C:\Users\HP\Desktop\BugSecure\frontend
npm start
```

**Wait for:**
```
Compiled successfully!
```

**Verify frontend `.env` file exists:**
- Location: `C:\Users\HP\Desktop\BugSecure\frontend\.env`
- Should contain: `REACT_APP_API_URL=http://192.168.1.174:8080`

### Step 4: Configure Windows Firewall

**Allow Node.js and Java through Firewall:**

1. Press `Win + R`, type `wf.msc`, press Enter
2. Click "Inbound Rules" → "New Rule"
3. Select "Program" → Next
4. Browse to Node.js: `C:\Program Files\nodejs\node.exe` (or where Node.js is installed)
5. Allow connection → Next → Next → Name it "Node.js" → Finish
6. Repeat for Java: Find `java.exe` in your Java installation folder

**OR use Windows Security:**
1. Open "Windows Security"
2. Go to "Firewall & network protection"
3. Click "Allow an app through firewall"
4. Check "Node.js" and "Java" (or add them if not listed)

### Step 5: Connect Your Phone

**On your phone:**

1. **Ensure phone is on the same WiFi network**
   - Go to WiFi settings
   - Connect to the same network as your computer

2. **Open browser on phone** (Chrome, Safari, Firefox, etc.)

3. **Type in address bar:**
   ```
   http://192.168.1.174:3000
   ```

4. **The application should load!**

## 🧪 Testing the Connection

### Test 1: Backend Connection
**On your phone browser:**
```
http://192.168.1.174:8080/api/auth/login
```
- Should see a JSON response (even if error, means connection works)

### Test 2: Frontend Connection
**On your phone browser:**
```
http://192.168.1.174:3000
```
- Should see the BugSecure login page

### Test 3: Full Application
1. Login with admin account:
   - Email: `goutamp0242@gmail.com`
   - Password: `Goutam@123`
2. Navigate through the app
3. Test features

## ❌ Troubleshooting

### Problem: Phone can't connect to `192.168.1.174:3000`

**Solutions:**
1. **Check WiFi network:**
   - Phone and computer must be on same WiFi
   - Disconnect and reconnect phone to WiFi

2. **Verify IP address:**
   - Run `ipconfig` on computer
   - Confirm IP is `192.168.1.174`
   - If different, update `.env` file and restart frontend

3. **Check firewall:**
   - Windows Firewall might be blocking
   - Allow Node.js and Java through firewall
   - Temporarily disable firewall to test (then re-enable)

4. **Check if servers are running:**
   - Backend: `http://localhost:8080` should work on computer
   - Frontend: `http://localhost:3000` should work on computer

5. **Try different browser on phone:**
   - Chrome, Safari, Firefox, etc.

### Problem: Connection timeout

**Solutions:**
1. **Check backend is listening on all interfaces:**
   - Verify `application.properties` has: `server.address=0.0.0.0`
   - Restart backend

2. **Check router settings:**
   - Some routers block device-to-device communication
   - Enable "AP Isolation" or "Client Isolation" (disable it)

3. **Try ping from phone:**
   - Install network tool app
   - Ping `192.168.1.174`
   - If ping fails, network issue

### Problem: CORS errors in browser console

**Solutions:**
1. **Already fixed!** All controllers have `@CrossOrigin(origins = "*")`
2. **Check backend is running:**
   - Backend must be running for API calls to work
3. **Verify `.env` file:**
   - Frontend `.env` should have correct backend URL

### Problem: "This site can't be reached"

**Solutions:**
1. **Backend not running:**
   - Start backend first
   - Wait for "Started" message

2. **Frontend not running:**
   - Start frontend
   - Wait for "Compiled successfully"

3. **Wrong IP address:**
   - Check `ipconfig` for current IP
   - Update `.env` if changed

### Problem: Page loads but API calls fail

**Solutions:**
1. **Check backend URL in `.env`:**
   - Should be: `REACT_APP_API_URL=http://192.168.1.174:8080`
   - No trailing slash

2. **Restart frontend after changing `.env`:**
   - Stop frontend (Ctrl+C)
   - Start again: `npm start`

3. **Check backend logs:**
   - Look for error messages
   - Verify MongoDB is running

## 📋 Quick Connection Checklist

- [ ] Computer IP is `192.168.1.174` (check with `ipconfig`)
- [ ] MongoDB is running
- [ ] Backend started successfully
- [ ] Frontend started successfully
- [ ] `.env` file has correct IP: `REACT_APP_API_URL=http://192.168.1.174:8080`
- [ ] Phone connected to same WiFi network
- [ ] Windows Firewall allows Node.js and Java
- [ ] Can access `http://192.168.1.174:3000` on phone

## 🎯 Quick Start Commands

**Terminal 1 - Backend:**
```bash
cd C:\Users\HP\Desktop\BugSecure\backend
mvnw spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd C:\Users\HP\Desktop\BugSecure\frontend
npm start
```

**On Phone Browser:**
```
http://192.168.1.174:3000
```

## 💡 Pro Tips

1. **Bookmark the URL on your phone** for easy access
2. **Keep backend and frontend terminals open** while testing
3. **Check backend logs** if something doesn't work
4. **Use phone's browser developer tools** (if available) to see errors
5. **Test on computer first** (`localhost:3000`) before testing on phone

## ✅ Success Indicators

You'll know it's working when:
- ✅ Phone browser loads the login page
- ✅ You can login with admin credentials
- ✅ You can navigate through the app
- ✅ API calls work (no CORS errors)
- ✅ Data loads correctly

**If all above work, you're successfully connected! 🎉**







