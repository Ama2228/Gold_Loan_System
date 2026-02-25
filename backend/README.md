# Smart Gold Backend API

Backend API for Smart Gold Pawning Management System built with Node.js, Express, and MySQL.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Install dependencies**
```bash
cd backend
npm install
```

2. **Configure environment**
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your database credentials
# Update DB_PASSWORD with your MySQL root password
```

3. **Initialize database**
```bash
# First, run the Schema.sql file in MySQL to create tables
mysql -u root -p < ../Schema.sql

# Then run the initialization script to seed demo data
npm run init-db
```

4. **Start the server**
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

## 📋 Demo Credentials

After running `npm run init-db`, you can login with:

- **Staff**: NIC: `199978901234`, Password: `Staff@123`
- **Manager**: NIC: `199911223344`, Password: `Manager@123`
- **Admin**: NIC: `200263000105`, Password: `Dewama.952`

## 🔌 API Endpoints

### Authentication

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "nic": "199978901234",
  "password": "Staff@123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "user_id": 1,
      "nic": "199978901234",
      "full_name": "Hasindu Nimantha",
      "roles": ["STAFF"],
      "staff_type": "PAWNING_ASSISTANT",
      "branch_id": 1
    }
  }
}
```

#### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "user_id": 1,
    "nic": "199978901234",
    "full_name": "Hasindu Nimantha",
    "roles": ["STAFF"],
    "staff_type": "PAWNING_ASSISTANT",
    "branch_id": 1,
    "branch_name": "Colombo Central"
  }
}
```

#### Change Password
```http
PUT /api/v1/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "Staff@123",
  "newPassword": "NewPassword123"
}

Response:
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### Health Check
```http
GET /api/v1/health

Response:
{
  "success": true,
  "message": "Smart Gold API is running",
  "timestamp": "2026-02-11T10:30:00.000Z"
}
```

## 🔐 Authentication Flow

1. **Login**: Send NIC and password to `/api/v1/auth/login`
2. **Receive JWT**: Get JWT token in response
3. **Use Token**: Include token in Authorization header for protected routes
   ```
   Authorization: Bearer {your_jwt_token}
   ```
4. **Token Expiry**: Tokens expire in 7 days (configurable in `.env`)

## 🛡️ Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Helmet.js for HTTP headers security
- CORS configuration
- SQL injection protection (parameterized queries)
- Role-based access control

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MySQL connection pool
├── controllers/
│   └── authController.js    # Authentication logic
├── middleware/
│   ├── auth.js              # JWT verification
│   └── validate.js          # Request validation
├── routes/
│   └── authRoutes.js        # Auth endpoints
├── scripts/
│   └── initDatabase.js      # Database seeding script
├── .env.example             # Environment template
├── package.json             # Dependencies
├── server.js                # Express app entry point
└── README.md                # This file
```

## 🔧 Environment Variables

```env
NODE_ENV=development          # Environment (development/production)
PORT=5000                     # Server port
DB_HOST=localhost             # MySQL host
DB_PORT=3306                  # MySQL port
DB_USER=root                  # MySQL username
DB_PASSWORD=your_password     # MySQL password
DB_NAME=Smart_Gold            # Database name
JWT_SECRET=your_secret        # JWT signing secret
JWT_EXPIRE=7d                 # Token expiration
CORS_ORIGIN=http://localhost:5173  # Frontend URL
API_PREFIX=/api/v1            # API route prefix
```

## 🧪 Testing the API

You can test the API using:
- Postman
- Thunder Client (VS Code extension)
- cURL
- Browser (for GET requests)

Example cURL:
```bash
# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nic":"199978901234","password":"Staff@123"}'

# Get current user
curl http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📝 Next Steps

To integrate with frontend:
1. Update frontend API base URL to `http://localhost:5000/api/v1`
2. Store JWT token in localStorage/sessionStorage after login
3. Include token in Authorization header for all API requests
4. Handle token expiration and refresh

## 🐛 Troubleshooting

**Database connection failed**
- Check MySQL is running
- Verify credentials in `.env`
- Ensure database exists (run Schema.sql)

**Port already in use**
- Change PORT in `.env` to different number
- Kill existing process using the port

**JWT errors**
- Ensure JWT_SECRET is set in `.env`
- Check token is properly formatted in Authorization header
