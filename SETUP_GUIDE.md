# 🚀 Smart Gold Backend Setup Guide

## Step-by-Step Installation

### 1️⃣ Install MySQL (if not already installed)
- Download from: https://dev.mysql.com/downloads/mysql/
- Install and remember your root password
- Start MySQL service

### 2️⃣ Create the Database Schema
Open your terminal in the project root directory:

```bash
# Option A: Using MySQL command line
mysql -u root -p < Schema.sql

# Option B: Using MySQL Workbench
# - Open MySQL Workbench
# - Connect to your MySQL server
# - File > Open SQL Script > Select Schema.sql
# - Click Execute (lightning bolt icon)
```

### 3️⃣ Install Backend Dependencies
```bash
cd backend
npm install
```

### 4️⃣ Configure Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env file with your settings (use any text editor)
# IMPORTANT: Update DB_PASSWORD with your MySQL root password
```

Example `.env` configuration:
```env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YourMySQLPassword    # ⚠️ CHANGE THIS!
DB_NAME=Smart_Gold

JWT_SECRET=my_super_secret_key_123
JWT_EXPIRE=7d

CORS_ORIGIN=http://localhost:5173
API_PREFIX=/api/v1
```

### 5️⃣ Initialize Database with Demo Data
```bash
npm run init-db
```

You should see:
```
✅ Connected to MySQL server
✅ Database 'Smart_Gold' ready
📝 Inserting default roles...
✅ Roles inserted
👥 Creating demo users...
✅ Demo users created
🔑 Assigning roles...
✅ Roles assigned
🏢 Creating demo branch...
✅ Demo branch created
👔 Creating staff profiles...
✅ Staff profiles created

✨ Database initialization completed successfully!

📋 Demo Credentials:
   Staff    - NIC: 199978901234, Password: Staff@123
   Manager  - NIC: 199911223344, Password: Manager@123
   Admin    - NIC: 200263000105, Password: Dewama.952
```

### 6️⃣ Start the Server
```bash
# Development mode (auto-restart on changes)
npm run dev

# OR Production mode
npm start
```

You should see:
```
✅ MySQL Database connected successfully

🚀 Server is running on port 5000
📍 Environment: development
🔗 API Base URL: http://localhost:5000/api/v1
🏥 Health Check: http://localhost:5000/api/v1/health
```

### 7️⃣ Test the API
Open your browser or Postman and test:

**Health Check:**
```
GET http://localhost:5000/api/v1/health
```

**Login Test:**
```
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "nic": "199978901234",
  "password": "Staff@123"
}
```

## ✅ Verification Checklist

- [ ] MySQL is installed and running
- [ ] Schema.sql executed successfully
- [ ] `npm install` completed without errors
- [ ] `.env` file created and DB_PASSWORD updated
- [ ] `npm run init-db` completed successfully
- [ ] Server starts without errors on `npm run dev`
- [ ] Health check endpoint returns success
- [ ] Login endpoint returns JWT token

## 🐛 Common Issues

### Issue: "Database connection failed"
**Solution:** 
- Check MySQL is running: `mysql -u root -p`
- Verify DB_PASSWORD in `.env` matches your MySQL password
- Ensure database exists: `SHOW DATABASES;` in MySQL

### Issue: "Port 5000 already in use"
**Solution:**
- Change PORT in `.env` to 5001 or another available port
- Or kill the process: `npx kill-port 5000`

### Issue: "Cannot find module"
**Solution:**
- Run `npm install` again
- Delete `node_modules` folder and run `npm install`

### Issue: "JWT_SECRET is not defined"
**Solution:**
- Ensure `.env` file exists in backend folder
- Verify JWT_SECRET line is uncommented in `.env`

## 🔄 Restart from Scratch

If you need to reset everything:

```bash
# 1. Drop and recreate database
mysql -u root -p -e "DROP DATABASE IF EXISTS Smart_Gold;"
mysql -u root -p < ../Schema.sql

# 2. Reinitialize data
npm run init-db

# 3. Restart server
npm run dev
```

## 📚 Next Steps

1. Test all auth endpoints with Postman
2. Integrate frontend with backend API
3. Add more API endpoints (customers, tickets, etc.)
4. Implement frontend API service layer

## 📞 Need Help?

Check the main README.md for API documentation and examples!
