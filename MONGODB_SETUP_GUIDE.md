# MongoDB Setup and Usage Guide

## Your Configuration
- **IP Address:** 192.168.1.174
- **MongoDB Location:** C:\Users\HP\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\MongoDB Inc

## Step 1: Start MongoDB Service

### Option A: Using Windows Services (Recommended)
1. Press `Win + R` to open Run dialog
2. Type `services.msc` and press Enter
3. Look for "MongoDB Server" or "MongoDB" service
4. Right-click and select "Start" (if not already running)
5. Set it to "Automatic" startup (right-click → Properties → Startup type: Automatic)

### Option B: Using Command Line
1. Open Command Prompt as Administrator
2. Navigate to MongoDB bin directory (usually `C:\Program Files\MongoDB\Server\<version>\bin`)
3. Run: `mongod --dbpath "C:\data\db"` (create the folder if it doesn't exist)

### Option C: Using MongoDB Compass
1. Open MongoDB Compass (from Start Menu)
2. Click "Connect" - it will automatically connect to `mongodb://localhost:27017`

## Step 2: Verify MongoDB is Running

### Method 1: Using MongoDB Compass
1. Open MongoDB Compass
2. Click "Connect" (or use connection string: `mongodb://localhost:27017`)
3. You should see the connection successful

### Method 2: Using Command Line
1. Open Command Prompt
2. Navigate to MongoDB bin directory
3. Run: `mongosh` or `mongo` (depending on version)
4. You should see: `> ` prompt

## Step 3: Configure Frontend for Your IP

1. **Create `.env` file in `frontend` folder:**
   - Navigate to: `C:\Users\HP\Desktop\BugSecure\frontend`
   - Create a new file named `.env` (no extension)
   - Add this line:
   ```
   REACT_APP_API_URL=http://192.168.1.174:8080
   ```

2. **If `.env` file is blocked, create `.env.local` instead:**
   - Same location, name it `.env.local`
   - Add the same content

## Step 4: Start the Application

### Terminal 1: Start Backend
```bash
cd C:\Users\HP\Desktop\BugSecure\backend
mvnw spring-boot:run
```
Or if you have Maven installed:
```bash
mvn spring-boot:run
```

Wait for: `Started BugSecureBackendApplication`

### Terminal 2: Start Frontend
```bash
cd C:\Users\HP\Desktop\BugSecure\frontend
npm start
```

Wait for: `Compiled successfully!` and browser opens to `http://localhost:3000`

## Step 5: Access from Mobile Devices

1. **Ensure mobile device is on the same WiFi network**

2. **On your mobile device/tablet:**
   - Open browser (Chrome, Safari, etc.)
   - Navigate to: `http://192.168.1.174:3000`
   - The app should load!

3. **If connection fails:**
   - Check Windows Firewall:
     - Windows Security → Firewall & network protection
     - Allow Node.js and Java through firewall
   - Verify backend is running: `http://192.168.1.174:8080/api/profile` (should return error if not authenticated, but should connect)

## MongoDB Usage Guide

### Using MongoDB Compass (GUI - Recommended)

1. **Open MongoDB Compass**
   - From Start Menu: MongoDB Inc → MongoDB Compass

2. **Connect to Database**
   - Connection String: `mongodb://localhost:27017`
   - Click "Connect"

3. **View Your Database**
   - You'll see `bugsecure_db` database
   - Click on it to see collections:
     - `users` - User accounts
     - `code_submissions` - Code submissions
     - `bug_reports` - Bug reports
     - `payments` - Payment records
     - `submission_files` - File attachments

4. **Browse Collections**
   - Click on any collection to view documents
   - Each document is a JSON object
   - You can filter, sort, and search

5. **Common Operations:**
   - **View Documents:** Click collection → See all documents
   - **Filter:** Use filter bar at top (e.g., `{role: "ADMIN"}`)
   - **Edit:** Click on document → Edit → Update
   - **Delete:** Click on document → Delete
   - **Add Document:** Click "INSERT DOCUMENT"

### Using MongoDB Shell (mongosh)

1. **Open Command Prompt**
2. **Navigate to MongoDB bin directory** (or add to PATH)
3. **Run:** `mongosh`
4. **Common Commands:**

```javascript
// Show all databases
show dbs

// Use your database
use bugsecure_db

// Show all collections
show collections

// Find all users
db.users.find()

// Find admin users
db.users.find({role: "ADMIN"})

// Find user by email
db.users.find({email: "goutamp0242@gmail.com"})

// Count documents
db.users.countDocuments()

// Find one document
db.users.findOne()

// Update a document
db.users.updateOne(
  {email: "goutamp0242@gmail.com"},
  {$set: {username: "NewName"}}
)

// Delete a document
db.users.deleteOne({email: "test@example.com"})

// Create index
db.users.createIndex({email: 1})

// Get collection stats
db.users.stats()
```

### Useful MongoDB Queries

```javascript
// Find all code submissions
db.code_submissions.find()

// Find open submissions
db.code_submissions.find({status: "OPEN"})

// Find bug reports by status
db.bug_reports.find({status: "PENDING"})

// Find payments by status
db.payments.find({status: "COMPLETED"})

// Find users with profile images
db.users.find({profileImage: {$exists: true, $ne: null}})

// Count documents in collection
db.users.countDocuments()
db.code_submissions.countDocuments()
db.bug_reports.countDocuments()
```

## Database Structure

### Users Collection
```json
{
  "_id": "ObjectId",
  "username": "string",
  "email": "string",
  "password": "hashed",
  "role": "USER|COMPANY|ADMIN",
  "companyName": "string (optional)",
  "bio": "string (optional)",
  "profileImage": "base64 string (optional)",
  "phoneNumber": "string (optional)",
  "address": "string (optional)",
  "website": "string (optional)"
}
```

### Code Submissions Collection
```json
{
  "_id": "ObjectId",
  "title": "string",
  "description": "string",
  "fileName": "string",
  "codeContent": "string",
  "status": "OPEN|IN_PROGRESS|CLOSED",
  "rewardAmount": "number",
  "website": "string",
  "createdAt": "ISODate",
  "updatedAt": "ISODate",
  "company": "DBRef to users"
}
```

## Troubleshooting

### MongoDB Won't Start
1. Check if service is running: `services.msc`
2. Check MongoDB logs: Usually in `C:\Program Files\MongoDB\Server\<version>\log\`
3. Check if port 27017 is in use: `netstat -ano | findstr :27017`
4. Try starting manually: `mongod --dbpath "C:\data\db"`

### Connection Refused
1. Verify MongoDB is running
2. Check connection string: `mongodb://localhost:27017`
3. Check firewall settings
4. Verify MongoDB is listening: `netstat -ano | findstr :27017`

### Database Not Created
- MongoDB creates databases automatically when first document is inserted
- Run your Spring Boot application - it will create `bugsecure_db` automatically

### Mobile Device Can't Connect
1. Verify IP address: `ipconfig` (should be 192.168.1.174)
2. Check firewall: Allow Node.js and Java
3. Verify devices on same network
4. Test backend directly: `http://192.168.1.174:8080`
5. Check `.env` file has correct IP

### Application Errors
1. Check MongoDB is running
2. Check backend logs for errors
3. Verify `application.properties` has correct MongoDB URI
4. Check MongoDB Compass to see if database exists

## Quick Reference

### Start Everything
1. Start MongoDB (Service or Compass)
2. Start Backend: `cd backend && mvnw spring-boot:run`
3. Start Frontend: `cd frontend && npm start`
4. Access: `http://localhost:3000` (PC) or `http://192.168.1.174:3000` (Mobile)

### Stop Everything
1. Stop Frontend: `Ctrl+C` in frontend terminal
2. Stop Backend: `Ctrl+C` in backend terminal
3. MongoDB: Usually runs as service (leave running)

### Default Admin Accounts
After first run, these admin accounts are created:
- Email: `goutamp0242@gmail.com` | Password: `Goutam@123`
- Email: `namanbabbar37@gmail.com` | Password: `Naman@123`
- Email: `bugsecure12admin@gmail.com` | Password: `BugSecure12Admin`

## Next Steps

1. ✅ MongoDB installed and running
2. ✅ Frontend `.env` file created with IP address
3. ✅ Start backend and frontend
4. ✅ Test on mobile device
5. ✅ Use MongoDB Compass to view data

Your project is now ready to use with MongoDB!







