/* =========================================================
   SMART GOLD - FULL MYSQL DATABASE SCRIPT (3NF)
   Database: Smart_Gold
   Engine: InnoDB | Charset: utf8mb4
   ========================================================= */

-- (Optional) If you want a clean re-create each time:
DROP DATABASE IF EXISTS Smart_Gold;

CREATE DATABASE Smart_Gold
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE Smart_Gold;

SET NAMES utf8mb4;
SET time_zone = '+05:30';

-- =========================================================
-- A) IDENTITY & ACCESS CONTROL
-- =========================================================

CREATE TABLE roles (
  role_id INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(30) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE users (
  user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nic VARCHAR(20) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE user_roles (
  user_role_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  role_id INT NOT NULL,
  assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_userroles_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_userroles_role
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  UNIQUE KEY uq_user_role (user_id, role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- B) BRANCH & STAFF ORGANIZATION
-- =========================================================

CREATE TABLE branches (
  branch_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  branch_code VARCHAR(20) NOT NULL UNIQUE,
  branch_name VARCHAR(120) NOT NULL,
  address_line1 VARCHAR(150) NOT NULL,
  city VARCHAR(60) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  is_head_office TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE branch_opening_hours (
  hours_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  branch_id BIGINT NOT NULL,
  day_of_week ENUM('MON','TUE','WED','THU','FRI','SAT','SUN') NOT NULL,
  open_time TIME NULL,
  close_time TIME NULL,
  is_closed TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_hours_branch
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  UNIQUE KEY uq_branch_day (branch_id, day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE staff_profiles (
  staff_id BIGINT PRIMARY KEY,                  -- also users.user_id
  branch_id BIGINT NOT NULL,
  staff_username VARCHAR(60) NOT NULL UNIQUE,   -- staff second-login username
  staff_password_hash VARCHAR(255) NOT NULL,    -- staff second-login password
  staff_type ENUM('PAWNING_ASSISTANT','MANAGER','ADMIN') NOT NULL,
  phone VARCHAR(20) NULL,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  joined_date DATE NOT NULL,
  CONSTRAINT fk_staff_user
    FOREIGN KEY (staff_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_staff_branch
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- C) CUSTOMER PROFILE & VERIFICATION
-- =========================================================

CREATE TABLE customer_profiles (
  customer_id BIGINT PRIMARY KEY,                 -- also users.user_id
  registered_branch_id BIGINT NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(191) NULL,
  address_line1 VARCHAR(150) NOT NULL,            -- locked
  address_line2 VARCHAR(150) NULL,                -- locked
  city VARCHAR(60) NOT NULL,                      -- locked
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  registered_date DATE NOT NULL DEFAULT (CURRENT_DATE),
  CONSTRAINT fk_customer_user
    FOREIGN KEY (customer_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_customer_branch
    FOREIGN KEY (registered_branch_id) REFERENCES branches(branch_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE otp_verifications (
  otp_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  otp_code VARCHAR(10) NOT NULL,
  purpose ENUM('PHONE_CHANGE','EMAIL_CHANGE') NOT NULL,
  sent_to VARCHAR(191) NOT NULL,
  expires_at DATETIME NOT NULL,
  is_used TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_otp_customer
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(customer_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE contact_change_requests (
  request_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  change_type ENUM('PHONE','EMAIL') NOT NULL,
  old_value VARCHAR(191) NOT NULL,
  new_value VARCHAR(191) NOT NULL,
  otp_id BIGINT NOT NULL,
  status ENUM('PENDING','VERIFIED','REJECTED') NOT NULL DEFAULT 'PENDING',
  requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  verified_at DATETIME NULL,
  CONSTRAINT fk_change_customer
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(customer_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_change_otp
    FOREIGN KEY (otp_id) REFERENCES otp_verifications(otp_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- D) PAWNING CORE (TICKETS & ARTICLES)
-- =========================================================

CREATE TABLE pawn_tickets (
  ticket_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  receipt_no VARCHAR(30) NOT NULL UNIQUE,
  branch_id BIGINT NOT NULL,
  customer_id BIGINT NOT NULL,
  created_by_staff_id BIGINT NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  loan_amount DECIMAL(12,2) NOT NULL,
  annual_interest_rate DECIMAL(5,2) NOT NULL,
  interest_type ENUM('MONTHLY','DAILY') NOT NULL DEFAULT 'MONTHLY',
  status ENUM('ACTIVE','RENEWED','OVERDUE','CLOSED','AUCTION') NOT NULL DEFAULT 'ACTIVE',
  closed_date DATE NULL,
  CONSTRAINT fk_ticket_branch
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_ticket_customer
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(customer_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_ticket_creator
    FOREIGN KEY (created_by_staff_id) REFERENCES staff_profiles(staff_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_ticket_status_due (status, due_date),
  INDEX idx_ticket_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE gold_articles (
  article_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  ticket_id BIGINT NOT NULL,
  item_type VARCHAR(60) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  gross_weight_grams DECIMAL(10,3) NOT NULL,
  net_weight_grams DECIMAL(10,3) NOT NULL,
  purity_karat INT NOT NULL,
  assessed_value DECIMAL(12,2) NOT NULL,
  notes VARCHAR(255) NULL,
  CONSTRAINT fk_article_ticket
    FOREIGN KEY (ticket_id) REFERENCES pawn_tickets(ticket_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_article_ticket (ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ticket_status_history (
  history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  ticket_id BIGINT NOT NULL,
  old_status ENUM('ACTIVE','RENEWED','OVERDUE','CLOSED','AUCTION') NOT NULL,
  new_status ENUM('ACTIVE','RENEWED','OVERDUE','CLOSED','AUCTION') NOT NULL,
  changed_by_staff_id BIGINT NULL,
  changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  remark VARCHAR(255) NULL,
  CONSTRAINT fk_history_ticket
    FOREIGN KEY (ticket_id) REFERENCES pawn_tickets(ticket_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_history_staff
    FOREIGN KEY (changed_by_staff_id) REFERENCES staff_profiles(staff_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_history_ticket (ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- E) PAYMENTS / RENEWALS / REDEEMS
-- =========================================================

CREATE TABLE payments (
  payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  ticket_id BIGINT NOT NULL,
  branch_id BIGINT NOT NULL,
  paid_by_type ENUM('CUSTOMER','STAFF') NOT NULL,
  paid_by_customer_id BIGINT NULL,
  paid_by_staff_id BIGINT NULL,
  received_by_staff_id BIGINT NULL,
  payment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  amount DECIMAL(12,2) NOT NULL,
  payment_method ENUM('CASH','CARD','ONLINE') NOT NULL DEFAULT 'CASH',
  payment_type ENUM('PART','INTEREST','FULL') NOT NULL,
  note VARCHAR(255) NULL,
  CONSTRAINT fk_payment_ticket
    FOREIGN KEY (ticket_id) REFERENCES pawn_tickets(ticket_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_payment_branch
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_payment_customer
    FOREIGN KEY (paid_by_customer_id) REFERENCES customer_profiles(customer_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_payment_staff_paid
    FOREIGN KEY (paid_by_staff_id) REFERENCES staff_profiles(staff_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_payment_staff_recv
    FOREIGN KEY (received_by_staff_id) REFERENCES staff_profiles(staff_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_payment_ticket (ticket_id),
  INDEX idx_payment_date (payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE renewals (
  renewal_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  ticket_id BIGINT NOT NULL,
  renewed_by_type ENUM('CUSTOMER','STAFF') NOT NULL,
  renewed_by_customer_id BIGINT NULL,
  renewed_by_staff_id BIGINT NULL,
  renewal_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  old_due_date DATE NOT NULL,
  new_due_date DATE NOT NULL,
  interest_payment_id BIGINT NULL,
  CONSTRAINT fk_renewal_ticket
    FOREIGN KEY (ticket_id) REFERENCES pawn_tickets(ticket_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_renewal_customer
    FOREIGN KEY (renewed_by_customer_id) REFERENCES customer_profiles(customer_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_renewal_staff
    FOREIGN KEY (renewed_by_staff_id) REFERENCES staff_profiles(staff_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_renewal_payment
    FOREIGN KEY (interest_payment_id) REFERENCES payments(payment_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_renewal_ticket (ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE redeems (
  redeem_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  ticket_id BIGINT NOT NULL UNIQUE,
  redeemed_by_type ENUM('CUSTOMER','STAFF') NOT NULL,
  redeemed_by_customer_id BIGINT NULL,
  redeemed_by_staff_id BIGINT NULL,
  redeemed_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  final_payment_id BIGINT NOT NULL,
  CONSTRAINT fk_redeem_ticket
    FOREIGN KEY (ticket_id) REFERENCES pawn_tickets(ticket_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_redeem_customer
    FOREIGN KEY (redeemed_by_customer_id) REFERENCES customer_profiles(customer_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_redeem_staff
    FOREIGN KEY (redeemed_by_staff_id) REFERENCES staff_profiles(staff_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_redeem_payment
    FOREIGN KEY (final_payment_id) REFERENCES payments(payment_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- F) APPOINTMENTS
-- =========================================================

CREATE TABLE appointments (
  appointment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  branch_id BIGINT NOT NULL,
  customer_id BIGINT NOT NULL,
  ticket_id BIGINT NOT NULL,
  purpose ENUM('RENEW','REDEEM') NOT NULL,
  appointment_date DATE NOT NULL,
  time_slot_start TIME NOT NULL,
  time_slot_end TIME NOT NULL,
  status ENUM('PENDING','APPROVED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_appt_branch
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_appt_customer
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(customer_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_appt_ticket
    FOREIGN KEY (ticket_id) REFERENCES pawn_tickets(ticket_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_appt_date (appointment_date),
  INDEX idx_appt_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE appointment_actions (
  action_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  appointment_id BIGINT NOT NULL,
  action_by_staff_id BIGINT NOT NULL,
  action_type ENUM('APPROVE','COMPLETE','CANCEL') NOT NULL,
  action_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  note VARCHAR(255) NULL,
  CONSTRAINT fk_action_appt
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_action_staff
    FOREIGN KEY (action_by_staff_id) REFERENCES staff_profiles(staff_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_action_appt (appointment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- G) REMINDERS / SMS LOGS
-- =========================================================

CREATE TABLE reminder_rules (
  rule_id INT AUTO_INCREMENT PRIMARY KEY,
  reminder_level TINYINT NOT NULL,
  days_after_due INT NOT NULL,
  message_template VARCHAR(255) NOT NULL,
  UNIQUE KEY uq_rule_level (reminder_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE sms_reminder_logs (
  sms_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  ticket_id BIGINT NOT NULL,
  branch_id BIGINT NOT NULL,
  customer_id BIGINT NOT NULL,
  reminder_level TINYINT NOT NULL,
  rule_id INT NULL,
  scheduled_at DATETIME NOT NULL,
  sent_at DATETIME NULL,
  status ENUM('SCHEDULED','SENT','FAILED') NOT NULL DEFAULT 'SCHEDULED',
  provider_response VARCHAR(255) NULL,
  CONSTRAINT fk_sms_ticket
    FOREIGN KEY (ticket_id) REFERENCES pawn_tickets(ticket_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_sms_branch
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_sms_customer
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(customer_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_sms_rule
    FOREIGN KEY (rule_id) REFERENCES reminder_rules(rule_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_sms_ticket (ticket_id),
  INDEX idx_sms_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- H) AUCTION & REVERSE PAWNING
-- =========================================================

CREATE TABLE auction_cases (
  auction_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  ticket_id BIGINT NOT NULL UNIQUE,
  branch_id BIGINT NOT NULL,
  created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  auction_status ENUM('PENDING','SCHEDULED','SOLD','CANCELLED') NOT NULL DEFAULT 'PENDING',
  auction_date DATE NULL,
  note VARCHAR(255) NULL,
  CONSTRAINT fk_auction_ticket
    FOREIGN KEY (ticket_id) REFERENCES pawn_tickets(ticket_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_auction_branch
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE reverse_pawning_requests (
  reverse_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  ticket_id BIGINT NOT NULL,
  branch_id BIGINT NOT NULL,
  requested_by_staff_id BIGINT NOT NULL,
  request_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reason VARCHAR(255) NOT NULL,
  status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  approved_by_staff_id BIGINT NULL,
  approved_date DATETIME NULL,
  CONSTRAINT fk_reverse_ticket
    FOREIGN KEY (ticket_id) REFERENCES pawn_tickets(ticket_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_reverse_branch
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_reverse_requested_staff
    FOREIGN KEY (requested_by_staff_id) REFERENCES staff_profiles(staff_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_reverse_approved_staff
    FOREIGN KEY (approved_by_staff_id) REFERENCES staff_profiles(staff_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_reverse_ticket (ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- I) AUDITING (RECOMMENDED)
-- =========================================================

CREATE TABLE staff_second_login_sessions (
  session_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  staff_id BIGINT NOT NULL,
  branch_id BIGINT NOT NULL,
  login_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  logout_time DATETIME NULL,
  status ENUM('ACTIVE','CLOSED') NOT NULL DEFAULT 'ACTIVE',
  CONSTRAINT fk_session_staff
    FOREIGN KEY (staff_id) REFERENCES staff_profiles(staff_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_session_branch
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_session_staff (staff_id),
  INDEX idx_session_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE activity_logs (
  log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  branch_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  role_name VARCHAR(30) NOT NULL,
  action VARCHAR(60) NOT NULL,
  entity_type VARCHAR(40) NOT NULL,
  entity_id BIGINT NULL,
  description VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_log_branch
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_log_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_log_branch_time (branch_id, created_at),
  INDEX idx_log_user_time (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- DONE
-- Tip: Insert seed data for roles/branches next.
-- =========================================================


USE Smart_Gold;

CREATE TABLE occupations (
  occupation_id INT AUTO_INCREMENT PRIMARY KEY,
  occupation_name VARCHAR(100) NOT NULL UNIQUE,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE customer_profiles
ADD COLUMN occupation_id INT NULL AFTER registered_branch_id;

ALTER TABLE customer_profiles
ADD CONSTRAINT fk_customer_occupation
FOREIGN KEY (occupation_id) REFERENCES occupations(occupation_id)
ON UPDATE CASCADE
ON DELETE SET NULL;

INSERT INTO occupations (occupation_name) VALUES
('Student'),
('Government Employee'),
('Private Sector Employee'),
('Self Employed'),
('Business Owner'),
('Teacher'),
('Farmer'),
('Driver'),
('Housewife'),
('Retired');

INSERT INTO roles (role_name) VALUES
('CUSTOMER'),
('STAFF'),
('MANAGER'),
('ADMIN');

INSERT INTO branches
(branch_code, branch_name, address_line1, city, phone, is_head_office, status)
VALUES
('0001', 'Smart Gold Head Office', 'No 100, Galle Road', 'Colombo', '0112345678', 1, 'ACTIVE'),

('0756', 'Smart Gold – Kandy Branch', 'No 45, Peradeniya Road', 'Kandy', '0812233445', 0, 'ACTIVE'),

('0266', 'Smart Gold – Gampaha Branch', 'No 12, Colombo Road', 'Gampaha', '0332223344', 0, 'ACTIVE'),

('0852', 'Smart Gold – Kurunegala Branch', 'No 78, Negombo Road', 'Kurunegala', '0372225566', 0, 'ACTIVE'),

('0931', 'Smart Gold – Matara Branch', 'No 25, Main Street', 'Matara', '0412234567', 0, 'ACTIVE');

INSERT INTO branch_opening_hours (branch_id, day_of_week, open_time, close_time, is_closed)
SELECT branch_id, 'MON', '08:00:00', '18:00:00', 0 FROM branches
UNION ALL
SELECT branch_id, 'TUE', '08:00:00', '18:00:00', 0 FROM branches
UNION ALL
SELECT branch_id, 'WED', '08:00:00', '18:00:00', 0 FROM branches
UNION ALL
SELECT branch_id, 'THU', '08:00:00', '18:00:00', 0 FROM branches
UNION ALL
SELECT branch_id, 'FRI', '08:00:00', '18:00:00', 0 FROM branches
UNION ALL
SELECT branch_id, 'SAT', '08:00:00', '14:00:00', 0 FROM branches
UNION ALL
SELECT branch_id, 'SUN', NULL, NULL, 1 FROM branches;

INSERT INTO reminder_rules (reminder_level, days_after_due, message_template)
VALUES
(
  1,
  0,
  'Reminder: Your pawn receipt {RECEIPT_NO} is due today ({DUE_DATE}). Outstanding interest: Rs.{INTEREST_AMOUNT}. Please visit Smart Gold {BRANCH_NAME}.'
),
(
  2,
  7,
  'Second Reminder: Pawn receipt {RECEIPT_NO} was due on {DUE_DATE}. Current outstanding interest is Rs.{INTEREST_AMOUNT}. Kindly renew or redeem at Smart Gold {BRANCH_NAME}.'
),
(
  3,
  14,
  'Final Reminder: Pawn receipt {RECEIPT_NO} is overdue since {DUE_DATE}. Total outstanding amount is Rs.{TOTAL_OUTSTANDING}. Failure to act may result in auction.'
);

USE Smart_Gold;

INSERT INTO users (nic, password_hash, full_name, status)
VALUES
('901234567V', 'hash_admin', 'Ama Rathnayake', 'ACTIVE'),
('880112233V', 'hash_manager', 'Nimal Perera', 'ACTIVE'),
('920445566V', 'hash_staff', 'Saman Kumara', 'ACTIVE'),
('950778899V', 'hash_customer1', 'Kamal Silva', 'ACTIVE'),
('970889900V', 'hash_customer2', 'Nadeesha Fernando', 'ACTIVE');

USE Smart_Gold;

INSERT INTO users (nic, password_hash, full_name, status)
VALUES
('200263000105', 'hash_admin', 'Admin User', 'ACTIVE'),
('199978901234', 'hash_staff', 'Staff User', 'ACTIVE'),
('200123456789', 'hash_customer', 'Customer User', 'ACTIVE'),
('199911223344', 'hash_manager', 'Manager User', 'ACTIVE');

-- ADMIN
INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u, roles r
WHERE u.nic = '200263000105' AND r.role_name = 'ADMIN';

-- STAFF
INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u, roles r
WHERE u.nic = '199978901234' AND r.role_name = 'STAFF';

-- CUSTOMER
INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u, roles r
WHERE u.nic = '200123456789' AND r.role_name = 'CUSTOMER';

-- MANAGER
INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u, roles r
WHERE u.nic = '199911223344' AND r.role_name = 'MANAGER';

USE Smart_Gold;

-- ADMIN
INSERT INTO staff_profiles
(staff_id, branch_id, staff_username, staff_password_hash, staff_type, phone, status, joined_date)
SELECT 
  u.user_id,
  b.branch_id,
  'admin001',
  'admin_pass_hash',
  'ADMIN',
  '0771234567',
  'ACTIVE',
  CURDATE()
FROM users u
JOIN branches b ON b.branch_code = '0001'
WHERE u.nic = '200263000105';

-- MANAGER
INSERT INTO staff_profiles
(staff_id, branch_id, staff_username, staff_password_hash, staff_type, phone, status, joined_date)
SELECT 
  u.user_id,
  b.branch_id,
  'manager001',
  'manager_pass_hash',
  'MANAGER',
  '0772345678',
  'ACTIVE',
  CURDATE()
FROM users u
JOIN branches b ON b.branch_code = '0001'
WHERE u.nic = '199911223344';

-- STAFF (Pawning Assistant)
INSERT INTO staff_profiles
(staff_id, branch_id, staff_username, staff_password_hash, staff_type, phone, status, joined_date)
SELECT 
  u.user_id,
  b.branch_id,
  'staff001',
  'staff_pass_hash',
  'PAWNING_ASSISTANT',
  '0773456789',
  'ACTIVE',
  CURDATE()
FROM users u
JOIN branches b ON b.branch_code = '0001'
WHERE u.nic = '199978901234';

SELECT occupation_id, occupation_name FROM occupations ORDER BY occupation_id;

USE Smart_Gold;

INSERT INTO customer_profiles
(customer_id, registered_branch_id, occupation_id, phone, email, address_line1, address_line2, city, status, registered_date)
SELECT
  u.user_id,
  b.branch_id,
  1,
  '0712345678',
  'customer@gmail.com',
  'No 12, Temple Road',
  'Near Town',
  'Kelaniya',
  'ACTIVE',
  CURDATE()
FROM users u
JOIN branches b ON b.branch_code = '0001'
WHERE u.nic = '200123456789';

USE Smart_Gold;

INSERT INTO pawn_tickets
(receipt_no, branch_id, customer_id, created_by_staff_id, issue_date, due_date,
 loan_amount, annual_interest_rate, interest_type, status)
SELECT
  '0001-25000001',
  b.branch_id,
  c.customer_id,
  s.staff_id,
  '2025-01-10',
  '2026-01-10',
  150000.00,
  18.00,
  'MONTHLY',
  'ACTIVE'
FROM customer_profiles c
JOIN users u ON c.customer_id = u.user_id
JOIN branches b ON b.branch_code = '0001'
JOIN staff_profiles s ON s.staff_id = (SELECT user_id FROM users WHERE nic='199978901234')
WHERE u.nic = '200123456789';

INSERT INTO pawn_tickets
(receipt_no, branch_id, customer_id, created_by_staff_id, issue_date, due_date,
 loan_amount, annual_interest_rate, interest_type, status)
SELECT
  '0001-25000002',
  b.branch_id,
  c.customer_id,
  s.staff_id,
  '2024-12-01',
  '2025-12-01',
  250000.00,
  18.00,
  'MONTHLY',
  'ACTIVE'
FROM customer_profiles c
JOIN users u ON c.customer_id = u.user_id
JOIN branches b ON b.branch_code = '0001'
JOIN staff_profiles s ON s.staff_id = (SELECT user_id FROM users WHERE nic='199978901234')
WHERE u.nic = '200123456789';

INSERT INTO pawn_tickets
(receipt_no, branch_id, customer_id, created_by_staff_id, issue_date, due_date,
 loan_amount, annual_interest_rate, interest_type, status)
SELECT
  '0001-25000003',
  b.branch_id,
  c.customer_id,
  s.staff_id,
  '2024-08-15',
  '2025-08-15',
  180000.00,
  18.00,
  'MONTHLY',
  'OVERDUE'
FROM customer_profiles c
JOIN users u ON c.customer_id = u.user_id
JOIN branches b ON b.branch_code = '0001'
JOIN staff_profiles s ON s.staff_id = (SELECT user_id FROM users WHERE nic='199978901234')
WHERE u.nic = '200123456789';

INSERT INTO pawn_tickets
(receipt_no, branch_id, customer_id, created_by_staff_id, issue_date, due_date,
 loan_amount, annual_interest_rate, interest_type, status)
SELECT
  '0001-25000004',
  b.branch_id,
  c.customer_id,
  s.staff_id,
  '2024-06-05',
  '2025-06-05',
  320000.00,
  18.00,
  'MONTHLY',
  'OVERDUE'
FROM customer_profiles c
JOIN users u ON c.customer_id = u.user_id
JOIN branches b ON b.branch_code = '0001'
JOIN staff_profiles s ON s.staff_id = (SELECT user_id FROM users WHERE nic='199978901234')
WHERE u.nic = '200123456789';

INSERT INTO pawn_tickets
(receipt_no, branch_id, customer_id, created_by_staff_id, issue_date, due_date,
 loan_amount, annual_interest_rate, interest_type, status)
SELECT
  '0001-25000005',
  b.branch_id,
  c.customer_id,
  s.staff_id,
  '2023-11-20',
  '2024-11-20',
  90000.00,
  18.00,
  'MONTHLY',
  'CLOSED'
FROM customer_profiles c
JOIN users u ON c.customer_id = u.user_id
JOIN branches b ON b.branch_code = '0001'
JOIN staff_profiles s ON s.staff_id = (SELECT user_id FROM users WHERE nic='199978901234')
WHERE u.nic = '200123456789';

USE Smart_Gold;

INSERT INTO gold_articles
(ticket_id, item_type, quantity, gross_weight_grams, net_weight_grams, purity_karat, assessed_value, notes)
SELECT t.ticket_id, 'Gold Chain', 1, 12.500, 12.200, 22, 180000.00, 'Yellow gold chain'
FROM pawn_tickets t
WHERE t.receipt_no = '0001-25000001';

INSERT INTO gold_articles
(ticket_id, item_type, quantity, gross_weight_grams, net_weight_grams, purity_karat, assessed_value, notes)
SELECT t.ticket_id, 'Gold Ring', 2, 6.800, 6.600, 18, 85000.00, '2 rings'
FROM pawn_tickets t
WHERE t.receipt_no = '0001-25000002';

INSERT INTO gold_articles
(ticket_id, item_type, quantity, gross_weight_grams, net_weight_grams, purity_karat, assessed_value, notes)
SELECT t.ticket_id, 'Gold Bangle', 1, 15.200, 14.900, 22, 210000.00, 'One bangle'
FROM pawn_tickets t
WHERE t.receipt_no = '0001-25000003';

INSERT INTO gold_articles
(ticket_id, item_type, quantity, gross_weight_grams, net_weight_grams, purity_karat, assessed_value, notes)
SELECT t.ticket_id, 'Gold Necklace', 1, 20.100, 19.700, 20, 260000.00, 'Necklace'
FROM pawn_tickets t
WHERE t.receipt_no = '0001-25000004';

INSERT INTO gold_articles
(ticket_id, item_type, quantity, gross_weight_grams, net_weight_grams, purity_karat, assessed_value, notes)
SELECT t.ticket_id, 'Gold Pendant', 1, 4.500, 4.300, 18, 60000.00, 'Small pendant'
FROM pawn_tickets t
WHERE t.receipt_no = '0001-25000005';

USE Smart_Gold;

-- PART PAYMENT for receipt 0001-25000001
INSERT INTO payments
(ticket_id, branch_id, paid_by_type, paid_by_customer_id, received_by_staff_id,
 amount, payment_method, payment_type, note)
SELECT
  t.ticket_id,
  b.branch_id,
  'CUSTOMER',
  c.customer_id,
  s.staff_id,
  20000.00,
  'CASH',
  'PART',
  'Part payment'
FROM pawn_tickets t
JOIN branches b ON b.branch_code = '0001'
JOIN customer_profiles c ON c.customer_id = t.customer_id
JOIN staff_profiles s ON s.staff_id = (SELECT user_id FROM users WHERE nic='199978901234')
WHERE t.receipt_no = '0001-25000001';

-- INTEREST PAYMENT for receipt 0001-25000002 (renew)
INSERT INTO payments
(ticket_id, branch_id, paid_by_type, paid_by_customer_id, received_by_staff_id,
 amount, payment_method, payment_type, note)
SELECT
  t.ticket_id,
  b.branch_id,
  'CUSTOMER',
  c.customer_id,
  s.staff_id,
  18000.00,
  'CASH',
  'INTEREST',
  'Interest payment for renewal'
FROM pawn_tickets t
JOIN branches b ON b.branch_code = '0001'
JOIN customer_profiles c ON c.customer_id = t.customer_id
JOIN staff_profiles s ON s.staff_id = (SELECT user_id FROM users WHERE nic='199978901234')
WHERE t.receipt_no = '0001-25000002';

-- PART PAYMENT for receipt 0001-25000003
INSERT INTO payments
(ticket_id, branch_id, paid_by_type, paid_by_customer_id, received_by_staff_id,
 amount, payment_method, payment_type, note)
SELECT
  t.ticket_id,
  b.branch_id,
  'CUSTOMER',
  c.customer_id,
  s.staff_id,
  15000.00,
  'CARD',
  'PART',
  'Card payment'
FROM pawn_tickets t
JOIN branches b ON b.branch_code = '0001'
JOIN customer_profiles c ON c.customer_id = t.customer_id
JOIN staff_profiles s ON s.staff_id = (SELECT user_id FROM users WHERE nic='199978901234')
WHERE t.receipt_no = '0001-25000003';

-- FULL PAYMENT for receipt 0001-25000005 (redeem)
INSERT INTO payments
(ticket_id, branch_id, paid_by_type, paid_by_customer_id, received_by_staff_id,
 amount, payment_method, payment_type, note)
SELECT
  t.ticket_id,
  b.branch_id,
  'CUSTOMER',
  c.customer_id,
  s.staff_id,
  90000.00,
  'CASH',
  'FULL',
  'Full settlement'
FROM pawn_tickets t
JOIN branches b ON b.branch_code = '0001'
JOIN customer_profiles c ON c.customer_id = t.customer_id
JOIN staff_profiles s ON s.staff_id = (SELECT user_id FROM users WHERE nic='199978901234')
WHERE t.receipt_no = '0001-25000005';

-- INTEREST PAYMENT for receipt 0001-25000004
INSERT INTO payments
(ticket_id, branch_id, paid_by_type, paid_by_customer_id, received_by_staff_id,
 amount, payment_method, payment_type, note)
SELECT
  t.ticket_id,
  b.branch_id,
  'CUSTOMER',
  c.customer_id,
  s.staff_id,
  22000.00,
  'CASH',
  'INTEREST',
  'Late interest payment'
FROM pawn_tickets t
JOIN branches b ON b.branch_code = '0001'
JOIN customer_profiles c ON c.customer_id = t.customer_id
JOIN staff_profiles s ON s.staff_id = (SELECT user_id FROM users WHERE nic='199978901234')
WHERE t.receipt_no = '0001-25000004';

USE Smart_Gold;

INSERT INTO renewals
(ticket_id, renewed_by_type, renewed_by_customer_id, renewal_date, old_due_date, new_due_date, interest_payment_id)
SELECT
  t.ticket_id,
  'CUSTOMER',
  t.customer_id,
  NOW(),
  t.due_date,
  DATE_ADD(t.due_date, INTERVAL 30 DAY),
  p.payment_id
FROM pawn_tickets t
JOIN payments p ON p.ticket_id = t.ticket_id
WHERE t.receipt_no = '0001-25000002'
  AND p.payment_type = 'INTEREST'
ORDER BY p.payment_date DESC
LIMIT 1;

INSERT INTO renewals
(ticket_id, renewed_by_type, renewed_by_customer_id, renewal_date, old_due_date, new_due_date, interest_payment_id)
SELECT
  t.ticket_id,
  'CUSTOMER',
  t.customer_id,
  NOW(),
  t.due_date,
  DATE_ADD(t.due_date, INTERVAL 30 DAY),
  p.payment_id
FROM pawn_tickets t
JOIN payments p ON p.ticket_id = t.ticket_id
WHERE t.receipt_no = '0001-25000004'
  AND p.payment_type = 'INTEREST'
ORDER BY p.payment_date DESC
LIMIT 1;

USE Smart_Gold;

INSERT INTO redeems
(ticket_id, redeemed_by_type, redeemed_by_customer_id, redeemed_date, final_payment_id)
SELECT
  t.ticket_id,
  'CUSTOMER',
  t.customer_id,
  NOW(),
  p.payment_id
FROM pawn_tickets t
JOIN payments p ON p.ticket_id = t.ticket_id
WHERE t.receipt_no = '0001-25000005'
  AND p.payment_type = 'FULL'
LIMIT 1;

UPDATE pawn_tickets
SET status = 'CLOSED',
    closed_date = CURDATE()
WHERE receipt_no = '0001-25000005';

USE Smart_Gold;

-- 1) RENEW appointment (tomorrow) for receipt 0001-25000001
INSERT INTO appointments
(branch_id, customer_id, ticket_id, purpose, appointment_date, time_slot_start, time_slot_end, status)
SELECT
  t.branch_id,
  t.customer_id,
  t.ticket_id,
  'RENEW',
  DATE_ADD(CURDATE(), INTERVAL 1 DAY),
  '10:00:00',
  '10:30:00',
  'PENDING'
FROM pawn_tickets t
WHERE t.receipt_no = '0001-25000001';

-- 2) RENEW appointment (next week) for receipt 0001-25000002
INSERT INTO appointments
(branch_id, customer_id, ticket_id, purpose, appointment_date, time_slot_start, time_slot_end, status)
SELECT
  t.branch_id,
  t.customer_id,
  t.ticket_id,
  'RENEW',
  DATE_ADD(CURDATE(), INTERVAL 7 DAY),
  '11:00:00',
  '11:30:00',
  'APPROVED'
FROM pawn_tickets t
WHERE t.receipt_no = '0001-25000002';

-- 3) RENEW appointment (today) for receipt 0001-25000003
INSERT INTO appointments
(branch_id, customer_id, ticket_id, purpose, appointment_date, time_slot_start, time_slot_end, status)
SELECT
  t.branch_id,
  t.customer_id,
  t.ticket_id,
  'RENEW',
  CURDATE(),
  '14:00:00',
  '14:30:00',
  'COMPLETED'
FROM pawn_tickets t
WHERE t.receipt_no = '0001-25000003';

-- 4) REDEEM appointment (tomorrow) for receipt 0001-25000004
INSERT INTO appointments
(branch_id, customer_id, ticket_id, purpose, appointment_date, time_slot_start, time_slot_end, status)
SELECT
  t.branch_id,
  t.customer_id,
  t.ticket_id,
  'REDEEM',
  DATE_ADD(CURDATE(), INTERVAL 1 DAY),
  '15:00:00',
  '15:30:00',
  'PENDING'
FROM pawn_tickets t
WHERE t.receipt_no = '0001-25000004';

-- 5) REDEEM appointment (past date) for receipt 0001-25000005 (already closed, just for sample history)
INSERT INTO appointments
(branch_id, customer_id, ticket_id, purpose, appointment_date, time_slot_start, time_slot_end, status)
SELECT
  t.branch_id,
  t.customer_id,
  t.ticket_id,
  'REDEEM',
  DATE_SUB(CURDATE(), INTERVAL 10 DAY),
  '09:00:00',
  '09:30:00',
  'COMPLETED'
FROM pawn_tickets t
WHERE t.receipt_no = '0001-25000005';

USE Smart_Gold;

-- 1st reminder for ACTIVE ticket (due today simulation)
INSERT INTO sms_reminder_logs
(ticket_id, branch_id, customer_id, reminder_level, rule_id, scheduled_at, sent_at, status)
SELECT
  t.ticket_id,
  t.branch_id,
  t.customer_id,
  1,
  r.rule_id,
  CURDATE(),
  NOW(),
  'SENT'
FROM pawn_tickets t
JOIN reminder_rules r ON r.reminder_level = 1
WHERE t.receipt_no = '0001-25000001';

-- 2nd reminder for overdue ticket
INSERT INTO sms_reminder_logs
(ticket_id, branch_id, customer_id, reminder_level, rule_id, scheduled_at, sent_at, status)
SELECT
  t.ticket_id,
  t.branch_id,
  t.customer_id,
  2,
  r.rule_id,
  DATE_ADD(t.due_date, INTERVAL 7 DAY),
  NOW(),
  'SENT'
FROM pawn_tickets t
JOIN reminder_rules r ON r.reminder_level = 2
WHERE t.receipt_no = '0001-25000003';

-- 3rd reminder (final warning)
INSERT INTO sms_reminder_logs
(ticket_id, branch_id, customer_id, reminder_level, rule_id, scheduled_at, status)
SELECT
  t.ticket_id,
  t.branch_id,
  t.customer_id,
  3,
  r.rule_id,
  DATE_ADD(t.due_date, INTERVAL 14 DAY),
  'SCHEDULED'
FROM pawn_tickets t
JOIN reminder_rules r ON r.reminder_level = 3
WHERE t.receipt_no = '0001-25000004';

-- Reminder for another ACTIVE ticket
INSERT INTO sms_reminder_logs
(ticket_id, branch_id, customer_id, reminder_level, rule_id, scheduled_at, sent_at, status)
SELECT
  t.ticket_id,
  t.branch_id,
  t.customer_id,
  1,
  r.rule_id,
  t.due_date,
  NOW(),
  'SENT'
FROM pawn_tickets t
JOIN reminder_rules r ON r.reminder_level = 1
WHERE t.receipt_no = '0001-25000002';

-- Reminder for CLOSED ticket (history)
INSERT INTO sms_reminder_logs
(ticket_id, branch_id, customer_id, reminder_level, rule_id, scheduled_at, sent_at, status)
SELECT
  t.ticket_id,
  t.branch_id,
  t.customer_id,
  1,
  r.rule_id,
  t.due_date,
  DATE_SUB(NOW(), INTERVAL 20 DAY),
  'SENT'
FROM pawn_tickets t
JOIN reminder_rules r ON r.reminder_level = 1
WHERE t.receipt_no = '0001-25000005';

USE Smart_Gold;

-- 1) PENDING auction case
INSERT INTO auction_cases (ticket_id, branch_id, auction_status, auction_date, note)
SELECT t.ticket_id, t.branch_id, 'PENDING', NULL, 'Overdue ticket - pending review'
FROM pawn_tickets t
WHERE t.receipt_no = '0001-25000003';

-- 2) SCHEDULED auction case
INSERT INTO auction_cases (ticket_id, branch_id, auction_status, auction_date, note)
SELECT t.ticket_id, t.branch_id, 'SCHEDULED', DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'Auction scheduled'
FROM pawn_tickets t
WHERE t.receipt_no = '0001-25000004';

-- 3) SOLD auction case (sample history)
INSERT INTO auction_cases (ticket_id, branch_id, auction_status, auction_date, note)
SELECT t.ticket_id, t.branch_id, 'SOLD', DATE_SUB(CURDATE(), INTERVAL 30 DAY), 'Sold in auction - sample record'
FROM pawn_tickets t
WHERE t.receipt_no = '0001-25000002';

-- 4) CANCELLED auction case (sample history)
INSERT INTO auction_cases (ticket_id, branch_id, auction_status, auction_date, note)
SELECT t.ticket_id, t.branch_id, 'CANCELLED', DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'Cancelled due to settlement'
FROM pawn_tickets t
WHERE t.receipt_no = '0001-25000005';

-- 5) PENDING auction case (another sample)
INSERT INTO auction_cases (ticket_id, branch_id, auction_status, auction_date, note)
SELECT t.ticket_id, t.branch_id, 'PENDING', NULL, 'Pending - customer not responded'
FROM pawn_tickets t
WHERE t.receipt_no = '0001-25000001';

USE Smart_Gold;

-- 1) PENDING request
INSERT INTO reverse_pawning_requests
(ticket_id, branch_id, requested_by_staff_id, reason, status)
SELECT
  t.ticket_id,
  t.branch_id,
  m.staff_id,
  'Incorrect gold valuation identified',
  'PENDING'
FROM pawn_tickets t
JOIN staff_profiles m ON m.staff_id = (SELECT user_id FROM users WHERE nic='199911223344')
WHERE t.receipt_no = '0001-25000001';

-- 2) APPROVED request
INSERT INTO reverse_pawning_requests
(ticket_id, branch_id, requested_by_staff_id, reason, status, approved_by_staff_id, approved_date)
SELECT
  t.ticket_id,
  t.branch_id,
  m.staff_id,
  'Customer dispute on loan amount',
  'APPROVED',
  a.staff_id,
  NOW()
FROM pawn_tickets t
JOIN staff_profiles m ON m.staff_id = (SELECT user_id FROM users WHERE nic='199911223344')
JOIN staff_profiles a ON a.staff_id = (SELECT user_id FROM users WHERE nic='200263000105')
WHERE t.receipt_no = '0001-25000002';

-- 3) REJECTED request
INSERT INTO reverse_pawning_requests
(ticket_id, branch_id, requested_by_staff_id, reason, status, approved_by_staff_id, approved_date)
SELECT
  t.ticket_id,
  t.branch_id,
  m.staff_id,
  'System entry mistake claimed',
  'REJECTED',
  a.staff_id,
  NOW()
FROM pawn_tickets t
JOIN staff_profiles m ON m.staff_id = (SELECT user_id FROM users WHERE nic='199911223344')
JOIN staff_profiles a ON a.staff_id = (SELECT user_id FROM users WHERE nic='200263000105')
WHERE t.receipt_no = '0001-25000003';

-- 4) APPROVED request (overdue case)
INSERT INTO reverse_pawning_requests
(ticket_id, branch_id, requested_by_staff_id, reason, status, approved_by_staff_id, approved_date)
SELECT
  t.ticket_id,
  t.branch_id,
  m.staff_id,
  'Special approval due to customer medical emergency',
  'APPROVED',
  a.staff_id,
  NOW()
FROM pawn_tickets t
JOIN staff_profiles m ON m.staff_id = (SELECT user_id FROM users WHERE nic='199911223344')
JOIN staff_profiles a ON a.staff_id = (SELECT user_id FROM users WHERE nic='200263000105')
WHERE t.receipt_no = '0001-25000004';

-- 5) PENDING request (auction-related)
INSERT INTO reverse_pawning_requests
(ticket_id, branch_id, requested_by_staff_id, reason, status)
SELECT
  t.ticket_id,
  t.branch_id,
  m.staff_id,
  'Auction hold requested for negotiation',
  'PENDING'
FROM pawn_tickets t
JOIN staff_profiles m ON m.staff_id = (SELECT user_id FROM users WHERE nic='199911223344')
WHERE t.receipt_no = '0001-25000005';

USE Smart_Gold;

-- =========================================================
-- 1) SYSTEM SETTINGS (admin can change interest, min loan, etc.)
-- =========================================================
CREATE TABLE system_settings (
  setting_key VARCHAR(60) PRIMARY KEY,
  setting_value VARCHAR(200) NOT NULL,
  description VARCHAR(255) NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by_staff_id BIGINT NULL,
  CONSTRAINT fk_settings_staff
    FOREIGN KEY (updated_by_staff_id) REFERENCES staff_profiles(staff_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- seed default settings
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES
('ANNUAL_INTEREST_RATE', '18.00', 'Default annual interest rate (%)'),
('MIN_LOAN_AMOUNT', '5000', 'Minimum loan amount (Rs.)'),
('MAX_ARTICLES_PER_TICKET', '5', 'Maximum gold articles per receipt'),
('APPOINTMENT_SLOT_CAPACITY', '5', 'Max appointments per slot'),
('APPOINTMENT_SLOT_START', '09:00', 'Appointments start time'),
('APPOINTMENT_SLOT_END', '14:00', 'Appointments end time'),
('APPOINTMENT_SLOT_MINUTES', '30', 'Slot duration in minutes');

-- =========================================================
-- 2) TIME SLOTS (09:00 to 14:00, 30 mins, capacity 5)
-- =========================================================
CREATE TABLE time_slots (
  slot_id INT AUTO_INCREMENT PRIMARY KEY,
  slot_start TIME NOT NULL,
  slot_end TIME NOT NULL,
  capacity INT NOT NULL DEFAULT 5,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_slot_time (slot_start, slot_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- insert slots (09:00 to 14:00, 30 minutes each)
INSERT INTO time_slots (slot_start, slot_end, capacity) VALUES
('09:00:00','09:30:00',5),
('09:30:00','10:00:00',5),
('10:00:00','10:30:00',5),
('10:30:00','11:00:00',5),
('11:00:00','11:30:00',5),
('11:30:00','12:00:00',5),
('12:00:00','12:30:00',5),
('12:30:00','13:00:00',5),
('13:00:00','13:30:00',5),
('13:30:00','14:00:00',5);

-- =========================================================
-- 3) PAWNING PERIODS (3 / 6 / 12 months selectable)
-- =========================================================
CREATE TABLE pawning_periods (
  period_id INT AUTO_INCREMENT PRIMARY KEY,
  period_name VARCHAR(30) NOT NULL UNIQUE,
  duration_months INT NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO pawning_periods (period_name, duration_months) VALUES
('3 Months', 3),
('6 Months', 6),
('12 Months', 12);

-- =========================================================
-- 4) KARAT ADVANCE RATES (admin can change advance values)
-- =========================================================
CREATE TABLE karat_advance_rates (
  rate_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  karat INT NOT NULL,
  advance_value_per_gram DECIMAL(12,2) NOT NULL,
  effective_from DATE NOT NULL DEFAULT (CURRENT_DATE),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  updated_by_staff_id BIGINT NULL,
  CONSTRAINT fk_karat_rate_staff
    FOREIGN KEY (updated_by_staff_id) REFERENCES staff_profiles(staff_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  UNIQUE KEY uq_karat_active (karat, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- sample advance values (change as you like)
INSERT INTO karat_advance_rates (karat, advance_value_per_gram, is_active)
VALUES
(18, 9000.00, 1),
(20, 10500.00, 1),
(22, 12000.00, 1);

-- =========================================================
-- 5) ALTER EXISTING TABLES
--    a) appointments -> add slot_id FK
--    b) pawn_tickets -> add period_id FK
-- =========================================================

-- a) appointments: add slot_id
ALTER TABLE appointments
ADD COLUMN slot_id INT NULL AFTER appointment_date;

ALTER TABLE appointments
ADD CONSTRAINT fk_appointments_slot
FOREIGN KEY (slot_id) REFERENCES time_slots(slot_id)
ON UPDATE CASCADE ON DELETE RESTRICT;

-- (Optional) If you want to stop using time_slot_start/end later:
-- ALTER TABLE appointments DROP COLUMN time_slot_start;
-- ALTER TABLE appointments DROP COLUMN time_slot_end;

-- b) pawn_tickets: add period_id
ALTER TABLE pawn_tickets
ADD COLUMN period_id INT NULL AFTER issue_date;

ALTER TABLE pawn_tickets
ADD CONSTRAINT fk_ticket_period
FOREIGN KEY (period_id) REFERENCES pawning_periods(period_id)
ON UPDATE CASCADE ON DELETE RESTRICT;

USE Smart_Gold;

CREATE TABLE districts (
  district_id INT AUTO_INCREMENT PRIMARY KEY,
  district_name VARCHAR(80) NOT NULL UNIQUE,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE cities (
  city_id INT AUTO_INCREMENT PRIMARY KEY,
  district_id INT NOT NULL,
  city_name VARCHAR(100) NOT NULL,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  CONSTRAINT fk_city_district
    FOREIGN KEY (district_id) REFERENCES districts(district_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  UNIQUE KEY uq_city (district_id, city_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO districts (district_name) VALUES
('Colombo'),
('Gampaha'),
('Kandy'),
('Kurunegala'),
('Galle');

INSERT INTO cities (district_id, city_name) VALUES
((SELECT district_id FROM districts WHERE district_name='Colombo'), 'Colombo'),
((SELECT district_id FROM districts WHERE district_name='Colombo'), 'Dehiwala'),
((SELECT district_id FROM districts WHERE district_name='Colombo'), 'Maharagama'),

((SELECT district_id FROM districts WHERE district_name='Gampaha'), 'Gampaha'),
((SELECT district_id FROM districts WHERE district_name='Gampaha'), 'Negombo'),

((SELECT district_id FROM districts WHERE district_name='Kandy'), 'Kandy'),
((SELECT district_id FROM districts WHERE district_name='Kandy'), 'Peradeniya'),

((SELECT district_id FROM districts WHERE district_name='Kurunegala'), 'Kurunegala'),

((SELECT district_id FROM districts WHERE district_name='Galle'), 'Galle'),
((SELECT district_id FROM districts WHERE district_name='Galle'), 'Hikkaduwa');

ALTER TABLE customer_profiles
ADD COLUMN city_id INT NULL AFTER address_line2;

ALTER TABLE customer_profiles
ADD CONSTRAINT fk_customer_city
FOREIGN KEY (city_id) REFERENCES cities(city_id)
ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE customer_profiles
DROP COLUMN city;

SELECT 
  u.nic,
  u.full_name,
  c.phone,
  c.address_line1,
  ci.city_name,
  d.district_name
FROM customer_profiles c
JOIN users u ON c.customer_id = u.user_id
JOIN cities ci ON c.city_id = ci.city_id
JOIN districts d ON ci.district_id = d.district_id;
















