# MongoDB Migration Guide

This guide explains how to migrate from MySQL to MongoDB and how to access the application from mobile devices.

## Table of Contents
1. [MongoDB Setup](#mongodb-setup)
2. [Migration Steps](#migration-steps)
3. [Remaining Code Updates](#remaining-code-updates)
4. [Mobile Device Access](#mobile-device-access)
5. [Profile Image Upload](#profile-image-upload)

## MongoDB Setup

### 1. Install MongoDB

**Windows:**
- Download MongoDB Community Server from https://www.mongodb.com/try/download/community
- Install MongoDB and MongoDB Compass (GUI tool)
- MongoDB will run on `localhost:27017` by default

**macOS:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### 2. Verify MongoDB is Running

Open MongoDB Compass or run:
```bash
mongosh
```

You should see the MongoDB shell.

## Migration Steps

### Step 1: Database Configuration

The `application.properties` has been updated to use MongoDB:
```properties
spring.data.mongodb.uri=mongodb://localhost:27017/bugsecure_db
spring.data.mongodb.database=bugsecure_db
```

### Step 2: Dependencies

The `pom.xml` has been updated to use:
- `spring-boot-starter-data-mongodb` (replaces JPA)
- Removed MySQL, PostgreSQL, and H2 dependencies

### Step 3: Model Changes

All models have been converted from JPA to MongoDB:
- `@Entity` → `@Document(collection = "collection_name")`
- `@Id` with `@GeneratedValue` → `@Id` (MongoDB auto-generates)
- `Long id` → `String id` (MongoDB uses ObjectId as String)
- `@ManyToOne` → `@DBRef` (for references)
- Removed `@Column`, `@Table` annotations
- `@PrePersist` → Manual timestamp methods (`setCreatedAtIfNew()`, `updateTimestamp()`)

### Step 4: Repository Changes

All repositories now extend `MongoRepository<Entity, String>` instead of `JpaRepository<Entity, Long>`.

### Step 5: Remaining Code Updates Needed

You need to update all remaining `Long id` references to `String id` in:

#### Controllers:
- `CodeSubmissionController.java` - Change all `@PathVariable Long id` to `String id`
- `BugReportController.java` - Change all `@PathVariable Long id` to `String id`
- `PaymentController.java` - Change all `@PathVariable Long id` to `String id`

#### Services:
- `CodeSubmissionService.java` - Change method signatures from `Long id` to `String id`
- `BugReportService.java` - Change method signatures from `Long id` to `String id`
- `PaymentService.java` - Change method signatures from `Long id` to `String id`

#### Service Methods to Update:
- `updateSubmissionStatusOnly(Long id, ...)` → `updateSubmissionStatusOnly(String id, ...)`
- `getSubmissionById(Long id)` → `getSubmissionById(String id)`
- `updateSubmission(Long id, ...)` → `updateSubmission(String id, ...)`
- `deleteSubmission(Long id, ...)` → `deleteSubmission(String id, ...)`
- `getBugReportById(Long id)` → `getBugReportById(String id)`
- `updateBugReportStatus(Long id, ...)` → `updateBugReportStatus(String id, ...)`
- `getPaymentById(Long id)` → `getPaymentById(String id)`

#### Timestamp Updates:
In services, when creating/updating entities, call:
- `entity.setCreatedAtIfNew()` before first save
- `entity.updateTimestamp()` before updates

Example:
```java
CodeSubmission submission = new CodeSubmission();
// ... set fields ...
submission.setCreatedAtIfNew(); // Call this before saving
codeSubmissionRepository.save(submission);
```

### Step 6: Data Migration

**Option 1: Fresh Start (Recommended for Development)**
- The `AdminSeeder` will create admin users automatically
- All data will be fresh

**Option 2: Migrate Existing Data**
If you have existing MySQL data:
1. Export MySQL data to JSON
2. Transform the data (convert Long IDs to String, adjust structure)
3. Import into MongoDB using `mongoimport` or MongoDB Compass

## Mobile Device Access

### Backend Configuration

The backend is configured to:
- Listen on `0.0.0.0:8080` (accessible from network)
- CORS allows all origins (`*`)
- Server address: `server.address=0.0.0.0`

### Finding Your IP Address

**Windows:**
```powershell
ipconfig
```
Look for "IPv4 Address" (e.g., `192.168.1.100`)

**macOS/Linux:**
```bash
ifconfig
# or
ip addr show
```

### Frontend Configuration

1. Create a `.env` file in the `frontend` directory:
```env
REACT_APP_API_URL=http://YOUR_IP_ADDRESS:8080
```

Replace `YOUR_IP_ADDRESS` with your computer's IP address (e.g., `192.168.1.100`).

2. Restart the React development server:
```bash
cd frontend
npm start
```

### Accessing from Mobile Devices

1. **Ensure all devices are on the same WiFi network**

2. **On your mobile device/tablet:**
   - Open browser
   - Navigate to: `http://YOUR_IP_ADDRESS:3000`
   - Example: `http://192.168.1.100:3000`

3. **Firewall Configuration:**
   - Windows: Allow Node.js and Java through Windows Firewall
   - macOS: System Preferences → Security & Privacy → Firewall → Allow Node.js and Java

4. **Troubleshooting:**
   - If connection fails, check firewall settings
   - Ensure backend is running on `0.0.0.0:8080`
   - Verify IP address is correct
   - Check that devices are on same network

## Profile Image Upload

### Backend Endpoint

New endpoint: `POST /api/profile/upload-image`
- Accepts `multipart/form-data` with `file` parameter
- Validates file type (images only)
- Validates file size (max 5MB)
- Stores image as base64 in MongoDB
- Returns updated user profile

### Frontend Usage

The `ProfilePage` component has been updated to:
- Use the new upload endpoint
- Validate file type and size
- Show error messages
- Update profile immediately after upload

### How It Works

1. User clicks camera icon on profile image
2. Selects image file
3. Frontend validates file
4. Sends to `/api/profile/upload-image`
5. Backend converts to base64
6. Stores in MongoDB `users` collection
7. Returns updated profile

## Running the Application

### 1. Start MongoDB
```bash
# Windows (if installed as service, it starts automatically)
# Or use MongoDB Compass

# macOS/Linux
mongod
```

### 2. Start Backend
```bash
cd backend
./mvnw spring-boot:run
# or
mvn spring-boot:run
```

Backend will run on `http://localhost:8080`

### 3. Start Frontend
```bash
cd frontend
npm install  # if needed
npm start
```

Frontend will run on `http://localhost:3000`

### 4. Access from Mobile

1. Find your IP address
2. Create `.env` file in `frontend` with `REACT_APP_API_URL=http://YOUR_IP:8080`
3. Restart frontend
4. Access from mobile: `http://YOUR_IP:3000`

## Testing

1. **Test MongoDB Connection:**
   - Open MongoDB Compass
   - Connect to `mongodb://localhost:27017`
   - Verify `bugsecure_db` database is created

2. **Test Backend:**
   - Check `http://localhost:8080` is accessible
   - Test API endpoints

3. **Test Profile Image Upload:**
   - Login to application
   - Go to Profile page
   - Click camera icon
   - Upload image
   - Verify image appears

4. **Test Mobile Access:**
   - Connect mobile device to same WiFi
   - Open browser on mobile
   - Navigate to `http://YOUR_IP:3000`
   - Test login and features

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongosh` or MongoDB Compass
- Check connection string in `application.properties`
- Verify MongoDB port (default: 27017)

### CORS Issues
- Backend CORS is configured to allow all origins
- If issues persist, check `CorsConfig.java`

### Mobile Access Issues
- Verify IP address is correct
- Check firewall settings
- Ensure devices on same network
- Try accessing backend directly: `http://YOUR_IP:8080/api/profile`

### Profile Image Issues
- Check file size (max 5MB)
- Verify file is an image
- Check browser console for errors
- Verify backend endpoint is accessible

## Notes

- MongoDB automatically generates `_id` fields (as ObjectId, converted to String)
- All relationships use `@DBRef` for references
- Timestamps are set manually using helper methods
- Images are stored as base64 strings in MongoDB
- For production, consider using GridFS for large files







