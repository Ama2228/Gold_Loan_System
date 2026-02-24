# 🚀 Feature 5 - Payments (Coming Next)

## 📋 Feature 5 Overview

**Purpose**: Process payments on pawn tickets - the financial core logic

**Three Payment Types**:
1. **Part Payment** - Pay partial loan amount
2. **Interest Payment** - Pay accumulated interest only  
3. **Full Payment (Redeem)** - Complete payment + release gold

---

## 🎯 Endpoints to Build

### 1. Record Payment
```
POST /api/v1/staff/payments
{
  "ticket_id": 1,
  "amount": 10000,
  "payment_method": "CASH",
  "payment_type": "PART",
  "note": "Customer paid partial amount"
}

Response:
{
  "payment_id": 1,
  "ticket_id": 1,
  "amount_paid": 10000,
  "remaining_balance": 35000,
  "payment_date": "2026-02-15"
}
```

### 2. Get Payment History
```
GET /api/v1/staff/payments/:ticketId

Returns all payments for a ticket with dates, amounts, types
```

### 3. Renew Ticket
```
POST /api/v1/staff/renewals
{
  "ticket_id": 1,
  "new_period_months": 6,
  "interest_payment_amount": 7500
}

Updates:
- due_date (add new period)
- status to "RENEWED"
- Insert into renewals table
- Update ticket_status_history
```

### 4. Redeem Ticket
```
POST /api/v1/staff/redeems
{
  "ticket_id": 1,
  "payment_id": 10,
  "final_amount": 47500
}

Updates:
- status to "CLOSED"
- closed_date = now
- Insert into redeems table
- Release gold for customer
```

### 5. Calculate Amount Due
```
GET /api/v1/staff/tickets/:ticketId/amount-due

Returns:
{
  "principal": 45000,
  "interest_accumulated": 2500,
  "total_due": 47500,
  "days_overdue": 0,
  "status": "ACTIVE"
}
```

### 6. Get Overdue Tickets
```
GET /api/v1/staff/tickets/overdue?days=30

Returns all tickets overdue by more than X days
```

---

## 🧮 Calculations to Implement

### Monthly Interest Calculation
```javascript
// For monthly interest type
MonthlyInterest = (Principal × AnnualRate / 100) / 12

Example:
Principal: 45,000 Rs.
Annual Rate: 18%
Monthly Interest: (45000 × 18 / 100) / 12 = 675 Rs.

// For 3-month ticket (3 months of interest):
Total Interest: 675 × 3 = 2,025 Rs.
```

### Daily Interest Calculation
```javascript
// For daily interest type
DailyInterest = (Principal × AnnualRate / 100) / 365

Example:
Principal: 45,000 Rs.
Annual Rate: 18%
Days passed: 45
Daily Interest: (45000 × 18 / 100) / 365 = 22.19 Rs./day
Total Interest: 22.19 × 45 = 998.55 Rs.
```

### Amount Due Calculation
```javascript
Function calculateAmountDue(ticket, payments) {
  // Get total paid so far
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  
  // Calculate interest from issue_date to now
  const interestAccumulated = calculateInterest(
    ticket.loan_amount,
    ticket.annual_interest_rate,
    ticket.issue_date,
    today,
    ticket.interest_type
  )
  
  // Total due = Principal + Interest - Payments Made
  const amountDue = ticket.loan_amount + interestAccumulated - totalPaid
  
  return amountDue
}
```

### Check Overdue Status
```javascript
// Ticket is overdue if due_date < today
if (ticket.due_date < today) {
  ticket.status = 'OVERDUE'
}

// Days overdue
const daysOverdue = Math.floor(
  (today - ticket.due_date) / (1000 * 60 * 60 * 24)
)
```

---

## 📊 Database Tables to Use

### payments (Main table)
```sql
Table: payments
Columns:
  payment_id (AUTO INCREMENT)
  ticket_id (FK to pawn_tickets)
  branch_id (FK to branches)
  paid_by_type (ENUM: CUSTOMER, STAFF)
  paid_by_customer_id (FK, nullable)
  paid_by_staff_id (FK, nullable)
  received_by_staff_id (FK, nullable)
  payment_date (DATETIME, DEFAULT CURRENT_TIMESTAMP)
  amount (DECIMAL 12,2)
  payment_method (ENUM: CASH, CARD, ONLINE)
  payment_type (ENUM: PART, INTEREST, FULL)
  note (VARCHAR 255)
```

### renewals (Renewal tracking)
```sql
Table: renewals
Columns:
  renewal_id (AUTO INCREMENT)
  ticket_id (FK to pawn_tickets, NOT NULL)
  renewed_by_type (ENUM: CUSTOMER, STAFF)
  renewed_by_customer_id (FK, nullable)
  renewed_by_staff_id (FK, nullable)
  renewal_date (DATETIME, AUTO)
  old_due_date (DATE)
  new_due_date (DATE)
  interest_payment_id (FK to payments, nullable)
```

### redeems (Redemption tracking)
```sql
Table: redeems
Columns:
  redeem_id (AUTO INCREMENT)
  ticket_id (FK, UNIQUE NOT NULL)
  redeemed_by_type (ENUM: CUSTOMER, STAFF)
  redeemed_by_customer_id (FK, nullable)
  redeemed_by_staff_id (FK, nullable)
  redeemed_date (DATETIME, AUTO)
  final_payment_id (FK to payments)
```

---

## 🔄 Status Transitions

```
ACTIVE
  ├─ (part payment) → stays ACTIVE
  ├─ (interest + renewal) → RENEWED
  ├─ (full payment) → CLOSED
  └─ (due date passed) → OVERDUE

RENEWED
  ├─ (part payment) → stays RENEWED
  ├─ (full payment) → CLOSED
  └─ (due date passed) → OVERDUE

OVERDUE
  ├─ (full payment) → CLOSED
  └─ (120 days, no payment) → AUCTION
```

---

## ✅ Validation Rules

### Payment Validation
- [ ] Ticket must exist and be ACTIVE or RENEWED
- [ ] Ticket must not be CLOSED already
- [ ] Payment amount > 0
- [ ] Payment method is valid (CASH, CARD, ONLINE)
- [ ] Payment type is valid (PART, INTEREST, FULL)

### Renewal Validation
- [ ] Ticket must be ACTIVE or OVERDUE
- [ ] New period must be valid (3, 6, 12 months)
- [ ] Interest payment must cover accumulated interest or be 0

### Redemption Validation
- [ ] Ticket must exist
- [ ] Payment amount must be >= total amount due
- [ ] Payment already recorded (payment_id valid)
- [ ] Ticket not already CLOSED

---

## 🔐 Security & Audit

### Audit Trail
- [ ] Log all payments to activity_logs
- [ ] Track who received payment (staff)
- [ ] Track who made payment (customer/staff)
- [ ] Timestamp all transactions
- [ ] Cannot modify past payments (soft delete only)

### Authorization
- [ ] STAFF/MANAGER can record payments
- [ ] CUSTOMER can only pay their own tickets
- [ ] Branch isolation (see own branch only)

---

## 📝 Error Handling

### Specific Errors to Handle
```javascript
"Ticket not found"               // 404
"Ticket is already closed"       // 400
"Ticket is overdue"              // 400 (warning only)
"Invalid payment method"          // 400
"Invalid payment type"            // 400
"Amount exceeds ticket balance"  // 400 (optional warning)
"Minimum payment not met"         // 400
"Calculation error"               // 500
```

---

## 🧪 Test Cases Needed

### Create 13+ Test Cases
```
1. ✅ Record partial payment
2. ✅ Record interest-only payment
3. ✅ Record full payment (redeem)
4. ✅ Get payment history
5. ✅ Renew ticket after interest payment
6. ✅ Calculate amount due
7. ✅ Check overdue tickets
8. ✅ Validate minimum payment
9. ✅ Prevent overpayment
10. ✅ Check status transitions
11. ✅ Activity logging for payments
12. ✅ Handle invalid ticket
13. ✅ Handle already closed ticket
```

---

## 🔧 Service Methods to Implement

```javascript
// In paymentService or pawnTicketsService extension

recordPayment(ticketId, amount, paymentType, method, paidBy, receivedBy)
  → Validate ticket state
  → Calculate remaining balance
  → Insert into payments table
  → Update ticket status if needed
  → Insert into activity_logs
  → Return payment confirmation

getRenewals(ticketId)
  → Get all renewals for a ticket
  → Include dates and amounts

createRenewal(ticketId, newPeriodMonths, interestPaymentId)
  → Validate ticket is renewable
  → Calculate new due_date
  → Insert into renewals table
  → Update pawn_tickets status to RENEWED
  → Return renewal details

createRedeem(ticketId, paymentId, finalAmount)
  → Validate amount covers total due
  → Update pawn_tickets status to CLOSED
  → Set closed_date
  → Insert into redeems table
  → Return confirmation

calculateAmountDue(ticketId)
  → Get ticket details
  → Get all prior payments
  → Calculate interest based on type (monthly/daily)
  → Return { principal, interest, total, daysOverdue }

getOverdueTickets(branchId, daysOverdue = 0)
  → Find all tickets with due_date < today + daysOverdue
  → Return list with days overdue
```

---

## 🎯 Integration Points

### Feature 4 → Feature 5
- Pawn tickets created in Feature 4 can now be paid
- Status updates flow through ticket_status_history

### Feature 5 → Feature 6 (Coming)
- Customer dashboard shows payment history
- Shows amount due for each ticket
- Shows renewal opportunities

### Feature 5 → Feature 8 (Coming)
- SMS reminders triggered by payment amount
- "Payment received for ticket #XXX"

---

## 📚 Documentation Needed

- [ ] Endpoint documentation
- [ ] Calculation formulas
- [ ] Database relationship diagrams
- [ ] Status transition diagrams
- [ ] Error handling guide
- [ ] Test suite documentation
- [ ] Quick reference guide

---

## 🚀 Ready to Start?

When Feature 4 testing is complete:
1. Start Feature 5 implementation
2. Create paymentService layer
3. Create paymentController layer  
4. Register payment routes
5. Create comprehensive tests
6. Document all features

**Estimated Time**: 3-4 hours for complete implementation & testing

---

**Next Steps**: After Feature 4 validation → Start Feature 5!
