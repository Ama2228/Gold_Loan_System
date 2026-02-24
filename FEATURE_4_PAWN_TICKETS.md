# Feature 4 - Pawn Ticket Creation (Core Engine)

## 🎯 Overview

Feature 4 implements the **heart of the pawning system** - creating pawn tickets with automatic:
- Receipt number generation
- Advance amount calculation based on karat rates
- Business rule validation
- Activity logging
- Transaction management with rollback

## ✨ Implemented Endpoints

### 1. **CREATE Pawn Ticket** ✅
- **Route**: `POST /api/v1/staff/pawn-tickets`
- **Permission**: STAFF, MANAGER
- **Body**:
  ```json
  {
    "customer_id": 5,
    "branch_id": 1,
    "pawning_period_months": 3,
    "interest_percentage": 100,
    "articles": [
      {
        "item_type": "Gold Ring",
        "quantity": 1,
        "gross_weight_grams": 5.5,
        "net_weight_grams": 5.0,
        "purity_karat": 18,
        "notes": "Yellow gold with stone"
      }
    ]
  }
  ```
- **Response** (201):
  ```json
  {
    "success": true,
    "data": {
      "ticket_id": 1,
      "receipt_no": "BRN01-20260215-0001",
      "customer_name": "John Silva",
      "loan_amount": 45000.00,
      "due_date": "2026-05-15",
      "pawning_period_months": 3,
      "articles_count": 2,
      "status": "ACTIVE"
    }
  }
  ```

### 2. **GET Ticket Details** ✅
- **Route**: `GET /api/v1/staff/pawn-tickets/:ticketId`
- **Permission**: STAFF, MANAGER
- **Response**:
  ```json
  {
    "ticket_id": 1,
    "receipt_no": "BRN01-20260215-0001",
    "customer": { "id": 5, "name": "John Silva", "nic": "198801234567" },
    "branch": { "id": 1, "name": "Main Branch", "code": "BRN01" },
    "issue_date": "2026-02-15",
    "due_date": "2026-05-15",
    "loan_amount": 45000.00,
    "annual_interest_rate": 18.00,
    "status": "ACTIVE",
    "articles": [
      {
        "article_id": 1,
        "item_type": "Gold Ring",
        "gross_weight_grams": 5.5,
        "net_weight_grams": 5.0,
        "purity_karat": 18,
        "assessed_value": 3500.00
      }
    ]
  }
  ```

### 3. **LIST Pawn Tickets** ✅
- **Route**: `GET /api/v1/staff/pawn-tickets?page=1&limit=10&status=ACTIVE&customerId=5`
- **Permission**: STAFF, MANAGER
- **Query Params**:
  - `page`: Page number (default: 1)
  - `limit`: Results per page (default: 10, max: 100)
  - `status`: Filter by status (ACTIVE, RENEWED, OVERDUE, CLOSED, AUCTION)
  - `customerId`: Filter by customer

### 4. **GET Tickets by Status** ✅
- **Route**: `GET /api/v1/staff/pawn-tickets/status/:status?page=1&limit=20`
- **Status Options**: ACTIVE, RENEWED, OVERDUE, CLOSED, AUCTION

### 5. **SEARCH Pawn Tickets** ✅
- **Route**: `GET /api/v1/staff/pawn-tickets/search/:searchTerm`
- **Min Length**: 2 characters
- **Searches**: Receipt number, customer name, customer NIC
- **Returns**: Up to 10 results, latest first

### 6. **GET Customer Tickets** ✅
- **Route**: `GET /api/v1/staff/pawn-tickets/customer/:customerId`
- **Returns**: All tickets for a specific customer

## 🔧 Technical Details

### Service Layer (pawnTickets.service.js)

#### Key Methods:

1. **generateReceiptNo(branchCode, branchId)**
   - Format: `BRANCH_CODE-YYYYMMDD-SEQNO`
   - Example: `BRN01-20260215-0001`

2. **getKaratRate(karat)**
   - Fetches rate from karat_advance_rates table
   - Supports: 8, 10, 12, 14, 16, 18, 20, 22, 24 karat

3. **validateGoldArticles(articles)**
   - Max 5 articles per ticket
   - Weight validation (gross >= net)
   - Karat validation (predefined values only)
   - Required fields: item_type, weights, karat

4. **calculateAdvanceAmount(articles, interestPercentage)**
   - Formula: `SUM(net_weight * rate_for_karat) * interest_percentage / 100`
   - Returns advance amount rounded to 2 decimals

5. **calculateDueDate(issueDate, periodMonths)**
   - Adds months to issue date
   - Returns YYYY-MM-DD format

6. **createPawnTicket(ticketData, userInfo)**
   - Main creation method
   - Complete validation phase
   - Automatic calculation phase
   - Transaction-based with rollback

### Database Operations

**Tables Updated**:
1. `pawn_tickets` - Main ticket record
2. `gold_articles` - Individual articles (max 5 per ticket)
3. `ticket_status_history` - Status change tracking
4. `activity_logs` - Audit trail

**Transaction Flow**:
```
BEGIN TRANSACTION
├── Insert pawn_tickets
├── Insert gold_articles (loop)
├── Insert ticket_status_history
├── Insert activity_logs
└── COMMIT (or ROLLBACK on error)
```

## 📋 Validation Rules

### Business Rules:
- ✅ Minimum loan amount: **5,000 Rs.**
- ✅ Maximum articles per ticket: **5**
- ✅ Valid karats: 8, 10, 12, 14, 16, 18, 20, 22, 24
- ✅ Net weight ≤ Gross weight
- ✅ Pawning periods: 3, 6, or 12 months

### Customer Constraints:
- ✅ Customer must exist
- ✅ Customer must be ACTIVE
- ✅ Staff creator must be ACTIVE

## 🔐 Security Features

1. **Authentication**: JWT tokens required on all routes
2. **Authorization**: STAFF/MANAGER only
3. **SQL Injection**: Parameterized queries throughout
4. **Transaction Safety**: Automatic rollback on any error
5. **Activity Logging**: All operations logged for audit trail

## 📊 Data Integrity

- **Foreign Key Constraints**: All relationships enforced
- **Transaction Management**: ACID compliance
- **Soft Deletes**: No data loss
- **Audit Trail**: Complete history of all operations

## 🧪 Testing

Run comprehensive tests:
```bash
cd backend
node scripts/testFeature4PawnTickets.js
```

### Test Coverage:
- ✅ Create pawn ticket with validation
- ✅ Get ticket details
- ✅ List tickets with pagination
- ✅ Filter by status
- ✅ Search functionality
- ✅ Get customer tickets
- ✅ Minimum loan validation
- ✅ Max articles validation
- ✅ Invalid karat validation

## 📈 Performance Optimizations

- **Indexes**: Branch ID, customer ID, status, due date
- **Pagination**: Efficient large dataset handling
- **Connection Pooling**: Database connection reuse
- **Prepared Statements**: Compiled query cache

## 🚀 What's Next

Feature 4 enables all downstream features:

- **Feature 5**: Payments (need tickets to pay)
- **Feature 6**: Customer Dashboard (display tickets)
- **Feature 7**: Appointments (book based on tickets)
- **Feature 8**: SMS Reminders (remind for due dates)
- **Feature 9**: Reverse Pawning (change ticket status)
- **Feature 10**: Reports (summarize tickets)

## 📝 Implementation Files

```
backend/
├── src/
│   ├── services/
│   │   └── pawnTickets.service.js (380+ lines)
│   ├── controllers/
│   │   └── pawnTickets.controller.js (280+ lines)
│   └── routes/
│       └── pawnTickets.routes.js (60 lines)
├── scripts/
│   └── testFeature4PawnTickets.js (400+ lines)
└── server.js (updated with route registration)
```

## ✅ Checklist

- [x] Service layer implemented
- [x] Controller layer implemented  
- [x] Route definitions
- [x] Server registration
- [x] Transaction management
- [x] Validation logic
- [x] Error handling
- [x] Activity logging
- [x] Test suite created
- [x] Documentation

---

**Status**: ✅ **FEATURE 4 COMPLETE & TESTED**

Ready for Feature 5 - Payments!
