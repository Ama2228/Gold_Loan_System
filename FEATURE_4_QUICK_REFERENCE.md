# ⚡ Feature 4 - Quick Reference Guide

## 🚀 Quick Start

### 1. Create Pawn Ticket
```bash
curl -X POST http://localhost:5000/api/v1/staff/pawn-tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "customer_id": 5,
    "branch_id": 1,
    "pawning_period_months": 3,
    "articles": [
      {
        "item_type": "Gold Ring",
        "quantity": 1,
        "gross_weight_grams": 5.5,
        "net_weight_grams": 5.0,
        "purity_karat": 18
      }
    ]
  }'
```

### 2. Get Ticket Details
```bash
curl http://localhost:5000/api/v1/staff/pawn-tickets/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. List All Tickets
```bash
curl "http://localhost:5000/api/v1/staff/pawn-tickets?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Search Tickets
```bash
curl "http://localhost:5000/api/v1/staff/pawn-tickets/search/Silva" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📋 Request/Response Examples

### Create Pawn Ticket (Success)

**Request**:
```json
POST /api/v1/staff/pawn-tickets
{
  "customer_id": 5,
  "branch_id": 1,
  "pawning_period_months": 6,
  "interest_percentage": 100,
  "articles": [
    {
      "item_type": "Gold Necklace",
      "quantity": 1,
      "gross_weight_grams": 15.5,
      "net_weight_grams": 14.8,
      "purity_karat": 22,
      "notes": "Chain design fine"
    },
    {
      "item_type": "Gold Ring",
      "quantity": 2,
      "gross_weight_grams": 8.0,
      "net_weight_grams": 7.5,
      "purity_karat": 18,
      "notes": "Set of 2"
    }
  ]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "ticket_id": 15,
    "receipt_no": "BRN01-20260215-0017",
    "customer_name": "John Silva",
    "branch_name": "Main Branch",
    "issue_date": "2026-02-15",
    "due_date": "2026-08-15",
    "loan_amount": 118750.00,
    "pawning_period_months": 6,
    "articles_count": 2,
    "status": "ACTIVE"
  },
  "message": "Pawn ticket created successfully"
}
```

---

## ❌ Error Examples

### Too Few Weights (Below Minimum)
```bash
Request:
{
  "customer_id": 5,
  "branch_id": 1,
  "pawning_period_months": 3,
  "articles": [
    {
      "item_type": "Small Item",
      "gross_weight_grams": 0.3,
      "net_weight_grams": 0.2,
      "purity_karat": 24
    }
  ]
}

Response (400):
{
  "success": false,
  "message": "Advance amount (1200.00) is below minimum loan amount (5000)"
}
```

### Too Many Articles
```bash
Response (400):
{
  "success": false,
  "message": "Maximum 5 gold articles allowed per ticket"
}
```

### Invalid Karat
```bash
Response (400):
{
  "success": false,
  "message": "Article 1: Invalid purity_karat"
}
```

### Customer Not Found
```bash
Response (400):
{
  "success": false,
  "message": "Customer not found"
}
```

### Ticket Not Found (Get)
```bash
Response (404):
{
  "success": false,
  "message": "Ticket not found"
}
```

---

## 📊 Valid Values Reference

### Karat Options (Valid: 8, 10, 12, 14, 16, 18, 20, 22, 24)
```javascript
✅ 8 karat   - Low purity
✅ 10 karat  - 41.7% gold
✅ 12 karat  - 50% gold
✅ 14 karat  - 58.3% gold
✅ 16 karat  - 66.7% gold
✅ 18 karat  - 75% gold (Yellow & White)
✅ 20 karat  - 83.3% gold
✅ 22 karat  - 91.7% gold (Indian standard)
✅ 24 karat  - 99.9% pure gold
```

### Pawning Periods (Valid: 3, 6, 12)
```javascript
✅ 3 months   - Short term
✅ 6 months   - Standard
✅ 12 months  - Long term
```

### Ticket Status Values
```javascript
ACTIVE    - Current ticket, in pawn
RENEWED   - Has been renewed
OVERDUE   - Past due date
CLOSED    - Redeemed/completed
AUCTION   - Sent for auction
```

---

## 🔍 Database Calculated Fields

### Advance Amount Calculation
```
Formula: SUM(net_weight_grams × rate_per_gram) × interest_percentage / 100

Example:
Article 1: 14.8g @ 22 karat = 14.8 × 4,200 = 62,160 Rs.
Article 2: 7.5g @ 18 karat = 7.5 × 3,500 = 26,250 Rs.
Total: 62,160 + 26,250 = 88,410 Rs.

With interest_percentage=100:
Final Loan: 88,410 Rs.
```

### Due Date Calculation
```
Issue Date: 2026-02-15
Period: 6 months
Due Date: 2026-02-15 + 6 months = 2026-08-15
```

### Annual Interest Rate (from pawning_periods table)
```
3 months:  18% annual
6 months:  18% annual
12 months: 18% annual
(Configurable in database)
```

---

## 🔐 Required Headers

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Token Valid For**:
- STAFF role - Create, view, search all tickets
- MANAGER role - Create, view, search all tickets
- CUSTOMER role - ❌ Not allowed

---

## 📍 API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/staff/pawn-tickets` | Create new ticket |
| GET | `/api/v1/staff/pawn-tickets` | List tickets (paginated) |
| GET | `/api/v1/staff/pawn-tickets/:id` | Get ticket details |
| GET | `/api/v1/staff/pawn-tickets/search/:term` | Search by receipt/customer/NIC |
| GET | `/api/v1/staff/pawn-tickets/customer/:id` | Get customer's tickets |
| GET | `/api/v1/staff/pawn-tickets/status/:status` | Filter by status |

---

## 🧪 Testing Commands

### Run Full Test Suite
```bash
cd backend
node scripts/testFeature4PawnTickets.js
```

### Login as Staff (to get token)
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "nic": "199978901234",
    "password": "Staff@123"
  }'
```

### Check Server Health
```bash
curl http://localhost:5000/api/v1/health
```

---

## 💾 Database Tables Involved

### pawn_tickets
```sql
Columns: ticket_id, receipt_no, branch_id, customer_id,
         created_by_staff_id, issue_date, due_date,
         loan_amount, annual_interest_rate, status, closed_date
```

### gold_articles
```sql
Columns: article_id, ticket_id, item_type, quantity,
         gross_weight_grams, net_weight_grams,
         purity_karat, assessed_value, notes
```

### ticket_status_history
```sql
Columns: history_id, ticket_id, old_status, new_status,
         changed_by_staff_id, changed_at, remark
```

### activity_logs
```sql
Columns: log_id, branch_id, user_id, role_name,
         action, entity_type, entity_id,
         description, created_at
```

---

## 🔔 Common Issues & Solutions

### Issue: "Cannot connect to server"
**Solution**: Ensure backend is running
```bash
cd backend
npm run dev
```

### Issue: "Invalid token"
**Solution**: Get new token by logging in
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nic": "199978901234", "password": "Staff@123"}'
```

### Issue: "Customer not found"
**Solution**: Verify customer_id exists in database
```bash
# Get list of all customers
curl "http://localhost:5000/api/v1/staff/customers?limit=100" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Issue: "Advance amount below minimum"
**Solution**: Add more gold or higher karat items
```javascript
// Increase weight or use higher karat
"net_weight_grams": 20,    // was 5
"purity_karat": 22         // was 18
```

---

## 📝 Useful Queries

### Get All Active Tickets for a Customer
```
GET /api/v1/staff/pawn-tickets/customer/5?status=ACTIVE
```

### Get Overdue Tickets
```
GET /api/v1/staff/pawn-tickets/status/OVERDUE?page=1&limit=20
```

### Search by Receipt Number
```
GET /api/v1/staff/pawn-tickets/search/BRN01-20260215
```

### Search by Customer Name
```
GET /api/v1/staff/pawn-tickets/search/Silva
```

### Get Latest Tickets
```
GET /api/v1/staff/pawn-tickets?page=1&limit=10
(Default ordering: latest first)
```

---

## ✅ Validation Checklist Before Creating Ticket

- [ ] Customer ID valid and ACTIVE
- [ ] Branch ID valid and ACTIVE
- [ ] Staff/Creator ID valid and ACTIVE
- [ ] At least 1 article (max 5)
- [ ] Pawning period is 3, 6, or 12 months
- [ ] For each article:
  - [ ] item_type provided
  - [ ] gross_weight_grams > 0
  - [ ] net_weight_grams > 0 and ≤ gross_weight
  - [ ] purity_karat is valid (8, 10, 12, 14, 16, 18, 20, 22, 24)
  - [ ] quantity ≥ 1
- [ ] Total advance amount ≥ 5,000 Rs.

---

## 🎯 Feature 4 Completion Status

✅ All endpoints implemented  
✅ All validations enforced  
✅ Transaction management complete  
✅ Activity logging enabled  
✅ Error handling comprehensive  
✅ Test suite created  
✅ Documentation finished  

**Status**: READY FOR PRODUCTION

---

**Last Updated**: 2026-02-15  
**Version**: 1.0.0  
**Next Feature**: Feature 5 - Payments
