# 🔐 Smart Gold - User Credentials

## All User Roles & Login Details

### 👨‍💼 Staff
- **NIC:** 199978901234
- **Password:** Staff@123
- **Full Name:** Hasindu Nimantha
- **Role:** STAFF
- **Access:** Staff dashboard, customer registration, transactions

---

### 👔 Manager
- **NIC:** 199911223344
- **Password:** Manager@123
- **Full Name:** Manager User
- **Role:** MANAGER
- **Access:** Manager dashboard + all staff features + reverse pawning

---

### 🔧 Admin
- **NIC:** 200263000105
- **Password:** Dewama.952
- **Full Name:** Dewama Admin
- **Role:** ADMIN
- **Access:** Admin dashboard, staff management, branch management, system settings

---

### 👤 Customer
- **NIC:** 199512345678
- **Password:** Customer@123
- **Full Name:** Sarah Customer
- **Role:** CUSTOMER
- **Access:** Customer portal, view tickets, transaction history, notifications

---

## Login Flow

1. **Go to:** http://localhost:5173/login
2. **Enter NIC and Password** from above
3. **Auto-redirect based on role:**
   - **Admin** → `/admin/dashboard`
   - **Manager** → `/manager/dashboard`
   - **Staff** → `/login-as` (choose staff or customer portal)
   - **Customer** → `/customer/dashboard`

## Testing Guide

### Test Staff Login
```bash
NIC: 199978901234
Password: Staff@123
Expected: Redirect to role selection (Staff/Customer portal)
```

### Test Manager Login
```bash
NIC: 199911223344
Password: Manager@123
Expected: Redirect to Manager Dashboard
```

### Test Admin Login
```bash
NIC: 200263000105
Password: Dewama.952
Expected: Redirect to Admin Dashboard
```

### Test Customer Login
```bash
NIC: 199512345678
Password: Customer@123
Expected: Redirect to Customer Dashboard
```

## API Endpoints

All credentials work with the backend API:

**Login:**
```bash
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "nic": "199978901234",
  "password": "Staff@123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": 1,
      "nic": "199978901234",
      "fullName": "Hasindu Nimantha",
      "status": "ACTIVE",
      "primaryRole": "STAFF",
      "roles": ["STAFF"]
    }
  }
}
```

## Database Info

- **Database Name:** Smart_Gold
- **Port:** 3307
- **Users Table:** `users`
- **Roles Table:** `roles`
- **User-Role Mapping:** `user_roles`

## Need More Users?

To add more users, use the same pattern in MySQL:

```sql
-- Insert new user
INSERT INTO users (nic, password_hash, full_name, status) 
VALUES ('NEW_NIC_HERE', 'BCRYPT_HASH', 'Full Name', 'ACTIVE');

-- Get role_id
SELECT role_id FROM roles WHERE role_name = 'STAFF';

-- Assign role
INSERT INTO user_roles (user_id, role_id) 
VALUES (new_user_id, role_id);
```

Or hash passwords in Node.js:
```javascript
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('YourPassword', 10);
console.log(hash);
```
