# Customer Dashboard API Endpoints

## Base URL
`http://localhost:5000/api/v1/customer`

## Authentication
All endpoints require:
- `Authorization: Bearer {JWT_TOKEN}`
- User must have `CUSTOMER` role

## Endpoints

### 1. Get Dashboard Summary
**Route:** `GET /dashboard`
**Description:** Get customer dashboard with summary stats

**Response:**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "customer": {
      "user_id": 1,
      "nic": "199512345678",
      "full_name": "Sarah Customer",
      "email": "sarah@example.com",
      "phone": "0771234567",
      "city": "Colombo",
      "status": "ACTIVE",
      "registered_date": "2026-02-01"
    },
    "stats": {
      "active_pawns": 3,
      "total_amount_pledged": 150000,
      "member_since": "2026-02-01"
    },
    "recent_transactions": [
      {
        "pawn_ticket_id": 101,
        "ticket_no": "TKT-001",
        "created_date": "2026-02-10",
        "loan_amount": 50000,
        "item_description": "Gold Necklace",
        "ticket_status": "ACTIVE"
      }
    ]
  }
}
```

---

### 2. Get All Receipts
**Route:** `GET /receipts?page=1&limit=10`
**Description:** Get paginated list of customer's receipts (pawn tickets)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Receipts retrieved successfully",
  "data": [
    {
      "id": 101,
      "receipt_no": "TKT-001",
      "created_date": "2026-02-10",
      "item_description": "Gold Necklace",
      "item_weight": "25g",
      "loan_amount": 50000,
      "interest_rate": 2.5,
      "maturity_date": "2026-05-10",
      "status": "ACTIVE"
    },
    {
      "id": 102,
      "receipt_no": "TKT-002",
      "created_date": "2026-02-05",
      "item_description": "Gold Ring",
      "item_weight": "10g",
      "loan_amount": 20000,
      "interest_rate": 2.5,
      "maturity_date": "2026-05-05",
      "status": "REDEEMED"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

---

### 3. Get Receipt Details
**Route:** `GET /receipts/:receiptNo`
**Description:** Get detailed information about a specific receipt including transaction history

**Parameters:**
- `receiptNo` (required): The receipt/ticket number (e.g., "TKT-001")

**Response:**
```json
{
  "success": true,
  "message": "Receipt retrieved successfully",
  "data": {
    "receipt": {
      "pawn_ticket_id": 101,
      "ticket_no": "TKT-001",
      "customer_id": 1,
      "customer_name": "Sarah Customer",
      "branch_id": 1,
      "branch_name": "Colombo Central",
      "created_date": "2026-02-10",
      "item_description": "Gold Necklace",
      "item_weight": "25g",
      "item_purity": "22K",
      "loan_amount": 50000,
      "interest_rate": 2.5,
      "maturity_date": "2026-05-10",
      "ticket_status": "ACTIVE",
      "pawn_agent_id": 5
    },
    "history": [
      {
        "history_id": 201,
        "pawn_ticket_id": 101,
        "old_status": "NEW",
        "new_status": "ACTIVE",
        "status_change_date": "2026-02-10",
        "changed_by_user_id": 5
      }
    ]
  }
}
```

---

## Error Responses

### 401 Unauthorized (Invalid/Expired Token)
```json
{
  "success": false,
  "message": "Invalid token"
}
```

### 403 Forbidden (Wrong Role)
```json
{
  "success": false,
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Receipt not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Error retrieving receipt",
  "error": "Table 'smart_gold.pawn_tickets' doesn't exist"
}
```

---

## Usage Examples

### Get Dashboard (Bash)
```bash
curl -X GET http://localhost:5000/api/v1/customer/dashboard \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Receipts (Bash)
```bash
curl -X GET "http://localhost:5000/api/v1/customer/receipts?page=1&limit=5" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Receipt Details (Bash)
```bash
curl -X GET "http://localhost:5000/api/v1/customer/receipts/TKT-001" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Notes

- All routes are **protected** - require valid JWT token
- Only **CUSTOMER** role can access these endpoints
- Customer can only see their own data (enforced by using `req.user.userId`)
- Receipts are sorted by creation date (newest first)
- Receipt data requires `pawn_tickets` table from Schema.sql

---

## Database Tables Required
- `users`
- `customer_profiles`
- `pawn_tickets`
- `ticket_status_history`
- `branches`
