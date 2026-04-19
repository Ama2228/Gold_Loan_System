USE Smart_Gold;

-- =========================================================
-- Lookup and master data
-- All timestamps below stay strictly within 2025-01-01 and 2026-04-19.
-- This script is additive only; it does not update existing rows.
-- =========================================================

INSERT IGNORE INTO occupations (occupation_name) VALUES
('Student'),
('Government Employee'),
('Private Sector Employee'),
('Self Employed'),
('Business Owner'),
('Teacher'),
('Farmer'),
('Driver'),
('Housewife'),
('Retired'),
('Fisherman'),
('Overseas Worker');

INSERT IGNORE INTO districts (district_name) VALUES
('Colombo'),
('Gampaha'),
('Kandy'),
('Kurunegala'),
('Galle');

INSERT IGNORE INTO cities (district_id, city_name)
SELECT d.district_id, x.city_name
FROM districts d
JOIN (
  SELECT 'Colombo' AS district_name, 'Colombo' AS city_name UNION ALL
  SELECT 'Colombo', 'Dehiwala' UNION ALL
  SELECT 'Colombo', 'Maharagama' UNION ALL
  SELECT 'Gampaha', 'Gampaha' UNION ALL
  SELECT 'Gampaha', 'Negombo' UNION ALL
  SELECT 'Kandy', 'Kandy' UNION ALL
  SELECT 'Kandy', 'Peradeniya' UNION ALL
  SELECT 'Kurunegala', 'Kurunegala' UNION ALL
  SELECT 'Kurunegala', 'Wariyapola' UNION ALL
  SELECT 'Galle', 'Galle' UNION ALL
  SELECT 'Galle', 'Hikkaduwa'
) x ON x.district_name = d.district_name;

INSERT IGNORE INTO roles (role_name) VALUES
('CUSTOMER'),
('STAFF'),
('MANAGER'),
('ADMIN');

INSERT IGNORE INTO branches
(branch_code, branch_name, address_line1, city, phone, is_head_office, status, created_at)
VALUES
('0001', 'Smart Gold Head Office', 'No. 100, Galle Road', 'Colombo', '0112345678', 1, 'ACTIVE', '2025-01-05 09:00:00'),
('0756', 'Smart Gold Kandy Branch', 'No. 45, Peradeniya Road', 'Kandy', '0812233445', 0, 'ACTIVE', '2025-01-05 09:15:00'),
('0266', 'Smart Gold Gampaha Branch', 'No. 12, Colombo Road', 'Gampaha', '0332223344', 0, 'ACTIVE', '2025-01-05 09:30:00'),
('0852', 'Smart Gold Kurunegala Branch', 'No. 78, Negombo Road', 'Kurunegala', '0372225566', 0, 'ACTIVE', '2025-01-05 09:45:00'),
('0931', 'Smart Gold Matara Branch', 'No. 25, Beach Road', 'Matara', '0412234567', 0, 'ACTIVE', '2025-01-05 10:00:00');

INSERT IGNORE INTO branch_opening_hours (branch_id, day_of_week, open_time, close_time, is_closed)
SELECT b.branch_id, s.day_of_week, s.open_time, s.close_time, s.is_closed
FROM branches b
JOIN (
  SELECT '0001' AS branch_code, 'MON' AS day_of_week, '08:30:00' AS open_time, '17:30:00' AS close_time, 0 AS is_closed UNION ALL
  SELECT '0001', 'TUE', '08:30:00', '17:30:00', 0 UNION ALL
  SELECT '0001', 'WED', '08:30:00', '17:30:00', 0 UNION ALL
  SELECT '0001', 'THU', '08:30:00', '17:30:00', 0 UNION ALL
  SELECT '0001', 'FRI', '08:30:00', '17:30:00', 0 UNION ALL
  SELECT '0001', 'SAT', '08:30:00', '14:30:00', 0 UNION ALL
  SELECT '0001', 'SUN', NULL, NULL, 1 UNION ALL
  SELECT '0756', 'MON', '08:30:00', '17:30:00', 0 UNION ALL
  SELECT '0756', 'TUE', '08:30:00', '17:30:00', 0 UNION ALL
  SELECT '0756', 'WED', '08:30:00', '17:30:00', 0 UNION ALL
  SELECT '0756', 'THU', '08:30:00', '17:30:00', 0 UNION ALL
  SELECT '0756', 'FRI', '08:30:00', '17:30:00', 0 UNION ALL
  SELECT '0756', 'SAT', '08:30:00', '14:30:00', 0 UNION ALL
  SELECT '0756', 'SUN', NULL, NULL, 1 UNION ALL
  SELECT '0266', 'MON', '08:30:00', '17:30:00', 0 UNION ALL
  SELECT '0266', 'TUE', '08:30:00', '17:30:00', 0 UNION ALL
  SELECT '0266', 'WED', '08:30:00', '17:30:00', 0 UNION ALL
  SELECT '0266', 'THU', '08:30:00', '17:30:00', 0 UNION ALL
  SELECT '0266', 'FRI', '08:30:00', '17:30:00', 0 UNION ALL
  SELECT '0266', 'SAT', '08:30:00', '14:30:00', 0 UNION ALL
  SELECT '0266', 'SUN', NULL, NULL, 1 UNION ALL
  SELECT '0852', 'MON', '08:30:00', '17:30:00', 0 UNION ALL
  SELECT '0852', 'TUE', '08:30:00', '17:30:00', 0 UNION ALL
  SELECT '0852', 'WED', '08:30:00', '17:30:00', 0 UNION ALL
  SELECT '0852', 'THU', '08:30:00', '17:30:00', 0 UNION ALL
  SELECT '0852', 'FRI', '08:30:00', '17:30:00', 0 UNION ALL
  SELECT '0852', 'SAT', '08:30:00', '14:30:00', 0 UNION ALL
  SELECT '0852', 'SUN', NULL, NULL, 1 UNION ALL
  SELECT '0931', 'MON', '08:30:00', '17:30:00', 0 UNION ALL
  SELECT '0931', 'TUE', '08:30:00', '17:30:00', 0 UNION ALL
  SELECT '0931', 'WED', '08:30:00', '17:30:00', 0 UNION ALL
  SELECT '0931', 'THU', '08:30:00', '17:30:00', 0 UNION ALL
  SELECT '0931', 'FRI', '08:30:00', '17:30:00', 0 UNION ALL
  SELECT '0931', 'SAT', '08:30:00', '14:30:00', 0 UNION ALL
  SELECT '0931', 'SUN', NULL, NULL, 1
) s ON s.branch_code = b.branch_code;

INSERT IGNORE INTO reminder_rules (reminder_level, days_after_due, message_template) VALUES
(1, 0, 'Reminder: Your pawn receipt {RECEIPT_NO} is due today ({DUE_DATE}). Outstanding interest: Rs.{INTEREST_AMOUNT}. Please visit Smart Gold {BRANCH_NAME}.'),
(2, 7, 'Second Reminder: Pawn receipt {RECEIPT_NO} was due on {DUE_DATE}. Current outstanding interest is Rs.{INTEREST_AMOUNT}. Kindly renew or redeem at Smart Gold {BRANCH_NAME}.'),
(3, 14, 'Final Reminder: Pawn receipt {RECEIPT_NO} is overdue since {DUE_DATE}. Total outstanding amount is Rs.{TOTAL_OUTSTANDING}. Failure to act may result in auction.');

INSERT IGNORE INTO time_slots (slot_start, slot_end, capacity) VALUES
('09:00:00', '09:30:00', 5),
('09:30:00', '10:00:00', 5),
('10:00:00', '10:30:00', 5),
('10:30:00', '11:00:00', 5),
('11:00:00', '11:30:00', 5),
('11:30:00', '12:00:00', 5),
('12:00:00', '12:30:00', 5),
('12:30:00', '13:00:00', 5),
('13:00:00', '13:30:00', 5),
('13:30:00', '14:00:00', 5);

INSERT IGNORE INTO pawning_periods (period_name, duration_months, is_active) VALUES
('3 Months', 3, 1),
('6 Months', 6, 1),
('12 Months', 12, 1);

-- =========================================================
-- Users and roles
-- =========================================================

INSERT IGNORE INTO users (nic, password_hash, full_name, status, created_at) VALUES
('200158623145', 'hash_admin_colombo', 'Nishantha Perera', 'ACTIVE', '2025-01-08 09:10:00'),
('199876512304', 'hash_manager_kandy', 'Sasika Gunawardena', 'ACTIVE', '2025-01-08 09:12:00'),
('199765423501', 'hash_staff_colombo', 'W. D. Chamara', 'ACTIVE', '2025-01-08 09:14:00'),
('200145632789', 'hash_staff_gampaha', 'Thilini Rajapaksa', 'ACTIVE', '2025-01-08 09:16:00'),
('200254369871', 'hash_customer_1', 'Arosha Wijeratne', 'ACTIVE', '2025-01-08 09:18:00'),
('199998877665', 'hash_customer_2', 'H. M. Dilhara Silva', 'ACTIVE', '2025-01-08 09:20:00'),
('200013579246', 'hash_customer_3', 'Nuwan Madushanka', 'ACTIVE', '2025-01-08 09:22:00'),
('200024680135', 'hash_customer_4', 'Isuri Fernando', 'ACTIVE', '2025-01-08 09:24:00'),
('200035791468', 'hash_customer_5', 'Kasun Alwis', 'ACTIVE', '2025-01-08 09:26:00'),
('199712345689', 'hash_customer_6', 'Ruwan Wijesinghe', 'ACTIVE', '2025-01-08 09:28:00'),
('200046802579', 'hash_customer_7', 'Dinesh Rodrigo', 'ACTIVE', '2025-01-08 09:30:00'),
('200057913680', 'hash_customer_8', 'Mihiri Weerasinghe', 'ACTIVE', '2025-01-08 09:32:00');

INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u
JOIN roles r
WHERE (u.nic = '200158623145' AND r.role_name = 'ADMIN')
   OR (u.nic = '199876512304' AND r.role_name = 'MANAGER')
   OR (u.nic = '199765423501' AND r.role_name = 'STAFF')
   OR (u.nic = '200145632789' AND r.role_name = 'STAFF')
   OR (u.nic = '200254369871' AND r.role_name = 'CUSTOMER')
   OR (u.nic = '199998877665' AND r.role_name = 'CUSTOMER')
   OR (u.nic = '200013579246' AND r.role_name = 'CUSTOMER')
   OR (u.nic = '200024680135' AND r.role_name = 'CUSTOMER')
   OR (u.nic = '200035791468' AND r.role_name = 'CUSTOMER')
   OR (u.nic = '199712345689' AND r.role_name = 'CUSTOMER')
   OR (u.nic = '200046802579' AND r.role_name = 'CUSTOMER')
   OR (u.nic = '200057913680' AND r.role_name = 'CUSTOMER');

INSERT INTO staff_profiles
(staff_id, branch_id, staff_username, staff_password_hash, staff_type, phone, status, joined_date)
SELECT u.user_id, b.branch_id, 'admin.colombo', 'staff_hash_admin_colombo', 'ADMIN', '0775001001', 'ACTIVE', '2025-01-12'
FROM users u
JOIN branches b ON b.branch_code = '0001'
WHERE u.nic = '200158623145';

INSERT INTO staff_profiles
(staff_id, branch_id, staff_username, staff_password_hash, staff_type, phone, status, joined_date)
SELECT u.user_id, b.branch_id, 'manager.kandy', 'staff_hash_manager_kandy', 'MANAGER', '0775001002', 'ACTIVE', '2025-01-15'
FROM users u
JOIN branches b ON b.branch_code = '0756'
WHERE u.nic = '199876512304';

INSERT INTO staff_profiles
(staff_id, branch_id, staff_username, staff_password_hash, staff_type, phone, status, joined_date)
SELECT u.user_id, b.branch_id, 'assistant.colombo', 'staff_hash_colombo', 'PAWNING_ASSISTANT', '0775001003', 'ACTIVE', '2025-01-18'
FROM users u
JOIN branches b ON b.branch_code = '0001'
WHERE u.nic = '199765423501';

INSERT INTO staff_profiles
(staff_id, branch_id, staff_username, staff_password_hash, staff_type, phone, status, joined_date)
SELECT u.user_id, b.branch_id, 'assistant.gampaha', 'staff_hash_gampaha', 'PAWNING_ASSISTANT', '0775001004', 'ACTIVE', '2025-01-20'
FROM users u
JOIN branches b ON b.branch_code = '0266'
WHERE u.nic = '200145632789';

INSERT INTO system_settings (setting_key, setting_value, description, updated_at, updated_by_staff_id) VALUES
('ANNUAL_INTEREST_RATE', '18.00', 'Default annual interest rate (%)', '2025-03-05 10:00:00', (SELECT staff_id FROM staff_profiles WHERE staff_username = 'admin.colombo' LIMIT 1)),
('MIN_LOAN_AMOUNT', '5000', 'Minimum loan amount (Rs.)', '2025-03-05 10:00:00', (SELECT staff_id FROM staff_profiles WHERE staff_username = 'admin.colombo' LIMIT 1)),
('MAX_ARTICLES_PER_TICKET', '5', 'Maximum gold articles per receipt', '2025-03-05 10:00:00', (SELECT staff_id FROM staff_profiles WHERE staff_username = 'admin.colombo' LIMIT 1)),
('APPOINTMENT_SLOT_CAPACITY', '5', 'Max appointments per slot', '2025-03-05 10:00:00', (SELECT staff_id FROM staff_profiles WHERE staff_username = 'admin.colombo' LIMIT 1)),
('APPOINTMENT_SLOT_START', '09:00', 'Appointments start time', '2025-03-05 10:00:00', (SELECT staff_id FROM staff_profiles WHERE staff_username = 'admin.colombo' LIMIT 1)),
('APPOINTMENT_SLOT_END', '14:00', 'Appointments end time', '2025-03-05 10:00:00', (SELECT staff_id FROM staff_profiles WHERE staff_username = 'admin.colombo' LIMIT 1)),
('APPOINTMENT_SLOT_MINUTES', '30', 'Slot duration in minutes', '2025-03-05 10:00:00', (SELECT staff_id FROM staff_profiles WHERE staff_username = 'admin.colombo' LIMIT 1)),
('OVERDUE_PENALTY_RATE', '6.50', 'Annual overdue penalty rate (%)', '2025-03-05 10:00:00', (SELECT staff_id FROM staff_profiles WHERE staff_username = 'admin.colombo' LIMIT 1));

INSERT INTO karat_advance_rates
(karat, advance_value_per_gram, effective_from, is_active, updated_by_staff_id)
VALUES
(18, 9200.00, '2025-03-05', 1, (SELECT staff_id FROM staff_profiles WHERE staff_username = 'admin.colombo' LIMIT 1)),
(20, 10550.00, '2025-03-05', 1, (SELECT staff_id FROM staff_profiles WHERE staff_username = 'admin.colombo' LIMIT 1)),
(22, 12250.00, '2025-03-05', 1, (SELECT staff_id FROM staff_profiles WHERE staff_username = 'admin.colombo' LIMIT 1)),
(24, 13800.00, '2025-03-05', 1, (SELECT staff_id FROM staff_profiles WHERE staff_username = 'admin.colombo' LIMIT 1));

-- =========================================================
-- Customers and profile data
-- =========================================================

INSERT INTO customer_profiles
(customer_id, registered_branch_id, occupation_id, phone, email, address_line1, address_line2, city_id, status, registered_date)
SELECT u.user_id, b.branch_id, o.occupation_id, '0712345001', 'arosha.wijeratne@example.lk', 'No. 18, Flower Road', 'Borella', c.city_id, 'ACTIVE', '2025-02-02'
FROM users u
JOIN branches b ON b.branch_code = '0001'
JOIN occupations o ON o.occupation_name = 'Business Owner'
JOIN cities c ON c.city_name = 'Colombo'
JOIN districts d ON d.district_id = c.district_id AND d.district_name = 'Colombo'
WHERE u.nic = '200254369871';

INSERT INTO customer_profiles
(customer_id, registered_branch_id, occupation_id, phone, email, address_line1, address_line2, city_id, status, registered_date)
SELECT u.user_id, b.branch_id, o.occupation_id, '0712345002', 'dilhara.silva@example.lk', 'No. 49, Peradeniya Road', 'Anniwatte', c.city_id, 'ACTIVE', '2025-02-10'
FROM users u
JOIN branches b ON b.branch_code = '0756'
JOIN occupations o ON o.occupation_name = 'Teacher'
JOIN cities c ON c.city_name = 'Kandy'
JOIN districts d ON d.district_id = c.district_id AND d.district_name = 'Kandy'
WHERE u.nic = '199998877665';

INSERT INTO customer_profiles
(customer_id, registered_branch_id, occupation_id, phone, email, address_line1, address_line2, city_id, status, registered_date)
SELECT u.user_id, b.branch_id, o.occupation_id, '0712345003', 'nuwan.madushanka@example.lk', 'No. 112, Negombo Road', 'Kekirihena', c.city_id, 'ACTIVE', '2025-02-18'
FROM users u
JOIN branches b ON b.branch_code = '0266'
JOIN occupations o ON o.occupation_name = 'Driver'
JOIN cities c ON c.city_name = 'Negombo'
JOIN districts d ON d.district_id = c.district_id AND d.district_name = 'Gampaha'
WHERE u.nic = '200013579246';

INSERT INTO customer_profiles
(customer_id, registered_branch_id, occupation_id, phone, email, address_line1, address_line2, city_id, status, registered_date)
SELECT u.user_id, b.branch_id, o.occupation_id, '0712345004', 'isuri.fernando@example.lk', 'No. 21, Lake Road', 'Wariyapola Junction', c.city_id, 'ACTIVE', '2025-03-01'
FROM users u
JOIN branches b ON b.branch_code = '0852'
JOIN occupations o ON o.occupation_name = 'Self Employed'
JOIN cities c ON c.city_name = 'Kurunegala'
JOIN districts d ON d.district_id = c.district_id AND d.district_name = 'Kurunegala'
WHERE u.nic = '200024680135';

INSERT INTO customer_profiles
(customer_id, registered_branch_id, occupation_id, phone, email, address_line1, address_line2, city_id, status, registered_date)
SELECT u.user_id, b.branch_id, o.occupation_id, '0712345005', 'kasun.alwis@example.lk', 'No. 88, Beach Road', 'Weligama', c.city_id, 'ACTIVE', '2025-03-12'
FROM users u
JOIN branches b ON b.branch_code = '0931'
JOIN occupations o ON o.occupation_name = 'Private Sector Employee'
JOIN cities c ON c.city_name = 'Galle'
JOIN districts d ON d.district_id = c.district_id AND d.district_name = 'Galle'
WHERE u.nic = '200035791468';

INSERT INTO customer_profiles
(customer_id, registered_branch_id, occupation_id, phone, email, address_line1, address_line2, city_id, status, registered_date)
SELECT u.user_id, b.branch_id, o.occupation_id, '0712345006', 'ruwan.wijesinghe@example.lk', 'No. 67, High Level Road', 'Maharagama', c.city_id, 'ACTIVE', '2025-03-20'
FROM users u
JOIN branches b ON b.branch_code = '0001'
JOIN occupations o ON o.occupation_name = 'Retired'
JOIN cities c ON c.city_name = 'Maharagama'
JOIN districts d ON d.district_id = c.district_id AND d.district_name = 'Colombo'
WHERE u.nic = '199712345689';

INSERT INTO customer_profiles
(customer_id, registered_branch_id, occupation_id, phone, email, address_line1, address_line2, city_id, status, registered_date)
SELECT u.user_id, b.branch_id, o.occupation_id, '0712345007', 'dinesh.rodrigo@example.lk', 'No. 14, Main Street', 'Dehiwala', c.city_id, 'ACTIVE', '2025-04-02'
FROM users u
JOIN branches b ON b.branch_code = '0756'
JOIN occupations o ON o.occupation_name = 'Fisherman'
JOIN cities c ON c.city_name = 'Dehiwala'
JOIN districts d ON d.district_id = c.district_id AND d.district_name = 'Colombo'
WHERE u.nic = '200046802579';

INSERT INTO customer_profiles
(customer_id, registered_branch_id, occupation_id, phone, email, address_line1, address_line2, city_id, status, registered_date)
SELECT u.user_id, b.branch_id, o.occupation_id, '0712345008', 'mihiri.weerasinghe@example.lk', 'No. 27, Station Road', 'Peradeniya', c.city_id, 'ACTIVE', '2025-04-10'
FROM users u
JOIN branches b ON b.branch_code = '0266'
JOIN occupations o ON o.occupation_name = 'Student'
JOIN cities c ON c.city_name = 'Peradeniya'
JOIN districts d ON d.district_id = c.district_id AND d.district_name = 'Kandy'
WHERE u.nic = '200057913680';

INSERT INTO otp_verifications
(customer_id, otp_code, purpose, sent_to, expires_at, is_used, created_at)
SELECT c.customer_id, '481225', 'PHONE_CHANGE', '0712345999', '2025-04-12 10:30:00', 1, '2025-04-12 09:30:00'
FROM customer_profiles c
JOIN users u ON u.user_id = c.customer_id
WHERE u.nic = '199712345689';

INSERT INTO otp_verifications
(customer_id, otp_code, purpose, sent_to, expires_at, is_used, created_at)
SELECT c.customer_id, '225814', 'EMAIL_CHANGE', 'mihiri.new@example.lk', '2025-04-15 16:30:00', 0, '2025-04-15 15:30:00'
FROM customer_profiles c
JOIN users u ON u.user_id = c.customer_id
WHERE u.nic = '200057913680';

INSERT INTO contact_change_requests
(customer_id, change_type, old_value, new_value, otp_id, status, requested_at, verified_at)
SELECT c.customer_id, 'PHONE', '0712345006', '0712345999', o.otp_id, 'VERIFIED', '2025-04-12 09:35:00', '2025-04-12 10:35:00'
FROM customer_profiles c
JOIN users u ON u.user_id = c.customer_id
JOIN otp_verifications o ON o.customer_id = c.customer_id AND o.purpose = 'PHONE_CHANGE'
WHERE u.nic = '199712345689';

INSERT INTO contact_change_requests
(customer_id, change_type, old_value, new_value, otp_id, status, requested_at, verified_at)
SELECT c.customer_id, 'EMAIL', 'mihiri.weerasinghe@example.lk', 'mihiri.new@example.lk', o.otp_id, 'PENDING', '2025-04-15 15:35:00', NULL
FROM customer_profiles c
JOIN users u ON u.user_id = c.customer_id
JOIN otp_verifications o ON o.customer_id = c.customer_id AND o.purpose = 'EMAIL_CHANGE'
WHERE u.nic = '200057913680';

-- =========================================================
-- Pawning transactions
-- =========================================================

INSERT INTO pawn_tickets
(receipt_no, branch_id, customer_id, created_by_staff_id, issue_date, period_id, due_date, loan_amount, annual_interest_rate, interest_type, status, closed_date)
SELECT 'SG-0001-250001', b.branch_id, c.customer_id, s.staff_id, '2025-10-18', p.period_id, '2026-04-18', 150000.00, 18.00, 'MONTHLY', 'ACTIVE', NULL
FROM branches b
JOIN customer_profiles c ON c.customer_id = (SELECT user_id FROM users WHERE nic = '200254369871' LIMIT 1)
JOIN staff_profiles s ON s.staff_username = 'assistant.colombo'
JOIN pawning_periods p ON p.period_name = '6 Months'
WHERE b.branch_code = '0001';

INSERT INTO pawn_tickets
(receipt_no, branch_id, customer_id, created_by_staff_id, issue_date, period_id, due_date, loan_amount, annual_interest_rate, interest_type, status, closed_date)
SELECT 'SG-0756-250002', b.branch_id, c.customer_id, s.staff_id, '2025-07-10', p.period_id, '2026-01-10', 220000.00, 18.00, 'MONTHLY', 'RENEWED', NULL
FROM branches b
JOIN customer_profiles c ON c.customer_id = (SELECT user_id FROM users WHERE nic = '199998877665' LIMIT 1)
JOIN staff_profiles s ON s.staff_username = 'manager.kandy'
JOIN pawning_periods p ON p.period_name = '6 Months'
WHERE b.branch_code = '0756';

INSERT INTO pawn_tickets
(receipt_no, branch_id, customer_id, created_by_staff_id, issue_date, period_id, due_date, loan_amount, annual_interest_rate, interest_type, status, closed_date)
SELECT 'SG-0266-250003', b.branch_id, c.customer_id, s.staff_id, '2025-05-15', p.period_id, '2025-11-15', 98000.00, 18.00, 'MONTHLY', 'RENEWED', NULL
FROM branches b
JOIN customer_profiles c ON c.customer_id = (SELECT user_id FROM users WHERE nic = '200013579246' LIMIT 1)
JOIN staff_profiles s ON s.staff_username = 'assistant.gampaha'
JOIN pawning_periods p ON p.period_name = '6 Months'
WHERE b.branch_code = '0266';

INSERT INTO pawn_tickets
(receipt_no, branch_id, customer_id, created_by_staff_id, issue_date, period_id, due_date, loan_amount, annual_interest_rate, interest_type, status, closed_date)
SELECT 'SG-0852-250004', b.branch_id, c.customer_id, s.staff_id, '2025-01-20', p.period_id, '2025-07-20', 310000.00, 18.00, 'MONTHLY', 'CLOSED', '2025-07-18'
FROM branches b
JOIN customer_profiles c ON c.customer_id = (SELECT user_id FROM users WHERE nic = '200024680135' LIMIT 1)
JOIN staff_profiles s ON s.staff_username = 'assistant.colombo'
JOIN pawning_periods p ON p.period_name = '6 Months'
WHERE b.branch_code = '0852';

INSERT INTO pawn_tickets
(receipt_no, branch_id, customer_id, created_by_staff_id, issue_date, period_id, due_date, loan_amount, annual_interest_rate, interest_type, status, closed_date)
SELECT 'SG-0931-250005', b.branch_id, c.customer_id, s.staff_id, '2025-08-02', p.period_id, '2026-02-02', 125000.00, 18.00, 'MONTHLY', 'REVERSED', NULL
FROM branches b
JOIN customer_profiles c ON c.customer_id = (SELECT user_id FROM users WHERE nic = '200035791468' LIMIT 1)
JOIN staff_profiles s ON s.staff_username = 'manager.kandy'
JOIN pawning_periods p ON p.period_name = '6 Months'
WHERE b.branch_code = '0931';

INSERT INTO pawn_tickets
(receipt_no, branch_id, customer_id, created_by_staff_id, issue_date, period_id, due_date, loan_amount, annual_interest_rate, interest_type, status, closed_date)
SELECT 'SG-0001-250006', b.branch_id, c.customer_id, s.staff_id, '2025-02-14', p.period_id, '2025-08-14', 76000.00, 18.00, 'MONTHLY', 'AUCTION', NULL
FROM branches b
JOIN customer_profiles c ON c.customer_id = (SELECT user_id FROM users WHERE nic = '199712345689' LIMIT 1)
JOIN staff_profiles s ON s.staff_username = 'assistant.colombo'
JOIN pawning_periods p ON p.period_name = '6 Months'
WHERE b.branch_code = '0001';

INSERT INTO gold_articles
(ticket_id, item_type, quantity, gross_weight_grams, net_weight_grams, purity_karat, assessed_value, notes)
SELECT t.ticket_id, 'Gold Necklace', 1, 14.200, 13.850, 22, 189500.00, 'Heavy yellow necklace with floral lock'
FROM pawn_tickets t WHERE t.receipt_no = 'SG-0001-250001';

INSERT INTO gold_articles
(ticket_id, item_type, quantity, gross_weight_grams, net_weight_grams, purity_karat, assessed_value, notes)
SELECT t.ticket_id, 'Pair of Bangles', 1, 11.800, 11.500, 18, 101000.00, 'Classic wedding set'
FROM pawn_tickets t WHERE t.receipt_no = 'SG-0001-250001';

INSERT INTO gold_articles
(ticket_id, item_type, quantity, gross_weight_grams, net_weight_grams, purity_karat, assessed_value, notes)
SELECT t.ticket_id, 'Gold Chain', 1, 18.500, 18.120, 24, 264500.00, 'Thick chain with polished finish'
FROM pawn_tickets t WHERE t.receipt_no = 'SG-0756-250002';

INSERT INTO gold_articles
(ticket_id, item_type, quantity, gross_weight_grams, net_weight_grams, purity_karat, assessed_value, notes)
SELECT t.ticket_id, 'Gold Ring', 2, 7.400, 7.050, 20, 108800.00, 'Two matching rings'
FROM pawn_tickets t WHERE t.receipt_no = 'SG-0266-250003';

INSERT INTO gold_articles
(ticket_id, item_type, quantity, gross_weight_grams, net_weight_grams, purity_karat, assessed_value, notes)
SELECT t.ticket_id, 'Gold Earrings', 1, 5.100, 4.850, 18, 41800.00, 'Lightweight pair in floral shape'
FROM pawn_tickets t WHERE t.receipt_no = 'SG-0852-250004';

INSERT INTO gold_articles
(ticket_id, item_type, quantity, gross_weight_grams, net_weight_grams, purity_karat, assessed_value, notes)
SELECT t.ticket_id, 'Gold Pendant', 1, 4.300, 4.100, 22, 56600.00, 'Pendant with stone setting'
FROM pawn_tickets t WHERE t.receipt_no = 'SG-0931-250005';

INSERT INTO gold_articles
(ticket_id, item_type, quantity, gross_weight_grams, net_weight_grams, purity_karat, assessed_value, notes)
SELECT t.ticket_id, 'Gold Bracelet', 1, 8.600, 8.320, 20, 87400.00, 'Slim bracelet with clasp'
FROM pawn_tickets t WHERE t.receipt_no = 'SG-0001-250006';

INSERT INTO payments
(ticket_id, branch_id, paid_by_type, paid_by_customer_id, paid_by_staff_id, received_by_staff_id, payment_date, amount, payment_method, payment_type, note)
SELECT t.ticket_id, b.branch_id, 'CUSTOMER', c.customer_id, NULL, s.staff_id, '2026-04-09 10:05:00', 16000.00, 'CASH', 'INTEREST', 'Renewal interest settlement'
FROM pawn_tickets t
JOIN branches b ON b.branch_id = t.branch_id
JOIN customer_profiles c ON c.customer_id = t.customer_id
JOIN staff_profiles s ON s.staff_username = 'manager.kandy'
WHERE t.receipt_no = 'SG-0756-250002';

INSERT INTO payments
(ticket_id, branch_id, paid_by_type, paid_by_customer_id, paid_by_staff_id, received_by_staff_id, payment_date, amount, payment_method, payment_type, note)
SELECT t.ticket_id, b.branch_id, 'CUSTOMER', c.customer_id, NULL, s.staff_id, '2025-11-20 14:20:00', 12000.00, 'CARD', 'PART', 'Partial principal payment'
FROM pawn_tickets t
JOIN branches b ON b.branch_id = t.branch_id
JOIN customer_profiles c ON c.customer_id = t.customer_id
JOIN staff_profiles s ON s.staff_username = 'assistant.gampaha'
WHERE t.receipt_no = 'SG-0266-250003';

INSERT INTO payments
(ticket_id, branch_id, paid_by_type, paid_by_customer_id, paid_by_staff_id, received_by_staff_id, payment_date, amount, payment_method, payment_type, note)
SELECT t.ticket_id, b.branch_id, 'CUSTOMER', c.customer_id, NULL, s.staff_id, '2025-07-18 11:45:00', 356000.00, 'ONLINE', 'FULL', 'Full redemption payment'
FROM pawn_tickets t
JOIN branches b ON b.branch_id = t.branch_id
JOIN customer_profiles c ON c.customer_id = t.customer_id
JOIN staff_profiles s ON s.staff_username = 'assistant.colombo'
WHERE t.receipt_no = 'SG-0852-250004';

INSERT INTO payments
(ticket_id, branch_id, paid_by_type, paid_by_customer_id, paid_by_staff_id, received_by_staff_id, payment_date, amount, payment_method, payment_type, note)
SELECT t.ticket_id, b.branch_id, 'CUSTOMER', c.customer_id, NULL, s.staff_id, '2025-12-08 15:15:00', 9400.00, 'CASH', 'INTEREST', 'Overdue interest paid before auction notice'
FROM pawn_tickets t
JOIN branches b ON b.branch_id = t.branch_id
JOIN customer_profiles c ON c.customer_id = t.customer_id
JOIN staff_profiles s ON s.staff_username = 'assistant.colombo'
WHERE t.receipt_no = 'SG-0001-250006';

INSERT INTO renewals
(ticket_id, renewed_by_type, renewed_by_customer_id, renewed_by_staff_id, renewal_date, old_due_date, new_due_date, interest_payment_id)
SELECT t.ticket_id, 'CUSTOMER', c.customer_id, NULL, '2026-04-10 10:15:00', '2026-01-10', '2026-04-10', p.payment_id
FROM pawn_tickets t
JOIN customer_profiles c ON c.customer_id = t.customer_id
JOIN payments p ON p.ticket_id = t.ticket_id AND p.amount = 16000.00 AND p.payment_type = 'INTEREST'
WHERE t.receipt_no = 'SG-0756-250002';

INSERT INTO renewals
(ticket_id, renewed_by_type, renewed_by_customer_id, renewed_by_staff_id, renewal_date, old_due_date, new_due_date, interest_payment_id)
SELECT t.ticket_id, 'CUSTOMER', c.customer_id, NULL, '2026-01-20 09:40:00', '2025-11-15', '2026-02-15', p.payment_id
FROM pawn_tickets t
JOIN customer_profiles c ON c.customer_id = t.customer_id
JOIN payments p ON p.ticket_id = t.ticket_id AND p.amount = 12000.00 AND p.payment_type = 'PART'
WHERE t.receipt_no = 'SG-0266-250003';

INSERT INTO redeems
(ticket_id, redeemed_by_type, redeemed_by_customer_id, redeemed_by_staff_id, redeemed_date, final_payment_id)
SELECT t.ticket_id, 'CUSTOMER', c.customer_id, NULL, '2025-07-18 12:00:00', p.payment_id
FROM pawn_tickets t
JOIN customer_profiles c ON c.customer_id = t.customer_id
JOIN payments p ON p.ticket_id = t.ticket_id AND p.amount = 356000.00 AND p.payment_type = 'FULL'
WHERE t.receipt_no = 'SG-0852-250004';

INSERT INTO appointments
(branch_id, customer_id, ticket_id, purpose, slot_id, appointment_date, time_slot_start, time_slot_end, status, created_at)
SELECT b.branch_id, c.customer_id, t.ticket_id, 'RENEW', s.slot_id, '2026-04-08', '10:00:00', '10:30:00', 'COMPLETED', '2026-04-05 08:45:00'
FROM branches b
JOIN customer_profiles c ON c.customer_id = (SELECT user_id FROM users WHERE nic = '199998877665' LIMIT 1)
JOIN pawn_tickets t ON t.receipt_no = 'SG-0756-250002'
JOIN time_slots s ON s.slot_start = '10:00:00' AND s.slot_end = '10:30:00'
WHERE b.branch_code = '0756';

INSERT INTO appointments
(branch_id, customer_id, ticket_id, purpose, slot_id, appointment_date, time_slot_start, time_slot_end, status, created_at)
SELECT b.branch_id, c.customer_id, t.ticket_id, 'REDEEM', s.slot_id, '2025-07-18', '11:00:00', '11:30:00', 'COMPLETED', '2025-07-16 09:20:00'
FROM branches b
JOIN customer_profiles c ON c.customer_id = (SELECT user_id FROM users WHERE nic = '200024680135' LIMIT 1)
JOIN pawn_tickets t ON t.receipt_no = 'SG-0852-250004'
JOIN time_slots s ON s.slot_start = '11:00:00' AND s.slot_end = '11:30:00'
WHERE b.branch_code = '0852';

INSERT INTO appointments
(branch_id, customer_id, ticket_id, purpose, slot_id, appointment_date, time_slot_start, time_slot_end, status, created_at)
SELECT b.branch_id, c.customer_id, t.ticket_id, 'RENEW', s.slot_id, '2025-12-08', '09:30:00', '10:00:00', 'APPROVED', '2025-12-06 14:10:00'
FROM branches b
JOIN customer_profiles c ON c.customer_id = (SELECT user_id FROM users WHERE nic = '200013579246' LIMIT 1)
JOIN pawn_tickets t ON t.receipt_no = 'SG-0266-250003'
JOIN time_slots s ON s.slot_start = '09:30:00' AND s.slot_end = '10:00:00'
WHERE b.branch_code = '0266';

INSERT INTO appointments
(branch_id, customer_id, ticket_id, purpose, slot_id, appointment_date, time_slot_start, time_slot_end, status, created_at)
SELECT b.branch_id, c.customer_id, t.ticket_id, 'REDEEM', s.slot_id, '2026-04-17', '13:00:00', '13:30:00', 'PENDING', '2026-04-15 11:00:00'
FROM branches b
JOIN customer_profiles c ON c.customer_id = (SELECT user_id FROM users WHERE nic = '200254369871' LIMIT 1)
JOIN pawn_tickets t ON t.receipt_no = 'SG-0001-250001'
JOIN time_slots s ON s.slot_start = '13:00:00' AND s.slot_end = '13:30:00'
WHERE b.branch_code = '0001';

INSERT INTO appointment_actions
(appointment_id, action_by_staff_id, action_type, action_time, note)
SELECT a.appointment_id, s.staff_id, 'COMPLETE', '2026-04-08 10:25:00', 'Renewal handled after interest payment'
FROM appointments a
JOIN staff_profiles s ON s.staff_username = 'manager.kandy'
JOIN pawn_tickets t ON t.ticket_id = a.ticket_id
WHERE t.receipt_no = 'SG-0756-250002';

INSERT INTO appointment_actions
(appointment_id, action_by_staff_id, action_type, action_time, note)
SELECT a.appointment_id, s.staff_id, 'COMPLETE', '2025-07-18 11:50:00', 'Redemption completed at the counter'
FROM appointments a
JOIN staff_profiles s ON s.staff_username = 'assistant.colombo'
JOIN pawn_tickets t ON t.ticket_id = a.ticket_id
WHERE t.receipt_no = 'SG-0852-250004';

INSERT INTO appointment_actions
(appointment_id, action_by_staff_id, action_type, action_time, note)
SELECT a.appointment_id, s.staff_id, 'APPROVE', '2025-12-06 14:20:00', 'Renewal appointment approved for next morning'
FROM appointments a
JOIN staff_profiles s ON s.staff_username = 'assistant.gampaha'
JOIN pawn_tickets t ON t.ticket_id = a.ticket_id
WHERE t.receipt_no = 'SG-0266-250003';

INSERT INTO sms_reminder_logs
(ticket_id, branch_id, customer_id, reminder_level, rule_id, scheduled_at, sent_at, status, provider_response)
SELECT t.ticket_id, b.branch_id, c.customer_id, 1, r.rule_id, '2025-08-14 08:00:00', '2025-08-14 08:05:00', 'SENT', 'SMS-OK-001'
FROM pawn_tickets t
JOIN branches b ON b.branch_id = t.branch_id
JOIN customer_profiles c ON c.customer_id = t.customer_id
JOIN reminder_rules r ON r.reminder_level = 1
WHERE t.receipt_no = 'SG-0001-250006';

INSERT INTO sms_reminder_logs
(ticket_id, branch_id, customer_id, reminder_level, rule_id, scheduled_at, sent_at, status, provider_response)
SELECT t.ticket_id, b.branch_id, c.customer_id, 2, r.rule_id, '2025-11-22 08:00:00', '2025-11-22 08:06:00', 'SENT', 'SMS-OK-002'
FROM pawn_tickets t
JOIN branches b ON b.branch_id = t.branch_id
JOIN customer_profiles c ON c.customer_id = t.customer_id
JOIN reminder_rules r ON r.reminder_level = 2
WHERE t.receipt_no = 'SG-0266-250003';

INSERT INTO sms_reminder_logs
(ticket_id, branch_id, customer_id, reminder_level, rule_id, scheduled_at, sent_at, status, provider_response)
SELECT t.ticket_id, b.branch_id, c.customer_id, 3, r.rule_id, '2025-06-30 08:00:00', '2025-06-30 08:04:00', 'SENT', 'SMS-OK-003'
FROM pawn_tickets t
JOIN branches b ON b.branch_id = t.branch_id
JOIN customer_profiles c ON c.customer_id = t.customer_id
JOIN reminder_rules r ON r.reminder_level = 3
WHERE t.receipt_no = 'SG-0931-250005';

INSERT INTO auction_cases
(ticket_id, branch_id, created_date, auction_status, auction_date, note)
SELECT t.ticket_id, b.branch_id, '2025-12-12 09:00:00', 'SCHEDULED', '2025-12-28', 'Auction scheduled after prolonged non-settlement'
FROM pawn_tickets t
JOIN branches b ON b.branch_id = t.branch_id
WHERE t.receipt_no = 'SG-0001-250006';

INSERT INTO reverse_pawning_requests
(ticket_id, branch_id, requested_by_staff_id, request_date, reason, status, approved_by_staff_id, approved_date)
SELECT t.ticket_id, b.branch_id, s.staff_id, '2026-04-16 10:10:00', 'Customer requested a short-term reverse pawning release for a family emergency', 'PENDING', NULL, NULL
FROM pawn_tickets t
JOIN branches b ON b.branch_id = t.branch_id
JOIN staff_profiles s ON s.staff_username = 'assistant.colombo'
WHERE t.receipt_no = 'SG-0001-250001';

INSERT INTO reverse_pawning_requests
(ticket_id, branch_id, requested_by_staff_id, request_date, reason, status, approved_by_staff_id, approved_date)
SELECT t.ticket_id, b.branch_id, s.staff_id, '2025-08-05 11:25:00', 'Customer agreed to temporary reverse release to settle a cash flow issue', 'APPROVED', a.staff_id, '2025-08-05 13:40:00'
FROM pawn_tickets t
JOIN branches b ON b.branch_id = t.branch_id
JOIN staff_profiles s ON s.staff_username = 'manager.kandy'
JOIN staff_profiles a ON a.staff_username = 'admin.colombo'
WHERE t.receipt_no = 'SG-0931-250005';

INSERT INTO reverse_pawning_requests
(ticket_id, branch_id, requested_by_staff_id, request_date, reason, status, approved_by_staff_id, approved_date)
SELECT t.ticket_id, b.branch_id, s.staff_id, '2025-12-10 09:15:00', 'Reverse pawning request rejected because the ticket was already under auction review', 'REJECTED', NULL, NULL
FROM pawn_tickets t
JOIN branches b ON b.branch_id = t.branch_id
JOIN staff_profiles s ON s.staff_username = 'assistant.colombo'
WHERE t.receipt_no = 'SG-0001-250006';

INSERT INTO ticket_status_history
(ticket_id, old_status, new_status, changed_by_staff_id, changed_at, remark)
SELECT t.ticket_id, 'ACTIVE', 'RENEWED', s.staff_id, '2026-04-10 10:20:00', 'Renewed after interest settlement'
FROM pawn_tickets t
JOIN staff_profiles s ON s.staff_username = 'manager.kandy'
WHERE t.receipt_no = 'SG-0756-250002';

INSERT INTO ticket_status_history
(ticket_id, old_status, new_status, changed_by_staff_id, changed_at, remark)
SELECT t.ticket_id, 'ACTIVE', 'RENEWED', s.staff_id, '2026-01-20 09:50:00', 'Extended for another cycle'
FROM pawn_tickets t
JOIN staff_profiles s ON s.staff_username = 'assistant.gampaha'
WHERE t.receipt_no = 'SG-0266-250003';

INSERT INTO ticket_status_history
(ticket_id, old_status, new_status, changed_by_staff_id, changed_at, remark)
SELECT t.ticket_id, 'ACTIVE', 'CLOSED', s.staff_id, '2025-07-18 12:05:00', 'Redeemed and closed at counter'
FROM pawn_tickets t
JOIN staff_profiles s ON s.staff_username = 'assistant.colombo'
WHERE t.receipt_no = 'SG-0852-250004';

INSERT INTO ticket_status_history
(ticket_id, old_status, new_status, changed_by_staff_id, changed_at, remark)
SELECT t.ticket_id, 'ACTIVE', 'REVERSED', a.staff_id, '2025-08-05 13:45:00', 'Reverse pawning approved by admin'
FROM pawn_tickets t
JOIN staff_profiles a ON a.staff_username = 'admin.colombo'
WHERE t.receipt_no = 'SG-0931-250005';

INSERT INTO ticket_status_history
(ticket_id, old_status, new_status, changed_by_staff_id, changed_at, remark)
SELECT t.ticket_id, 'ACTIVE', 'AUCTION', NULL, '2025-12-12 09:05:00', 'Moved to auction due to extended non-settlement'
FROM pawn_tickets t
WHERE t.receipt_no = 'SG-0001-250006';

INSERT INTO staff_second_login_sessions
(staff_id, branch_id, login_time, logout_time, status)
SELECT s.staff_id, b.branch_id, '2026-04-10 09:00:00', '2026-04-10 17:15:00', 'CLOSED'
FROM staff_profiles s
JOIN branches b ON b.branch_code = '0756'
WHERE s.staff_username = 'manager.kandy';

INSERT INTO staff_second_login_sessions
(staff_id, branch_id, login_time, logout_time, status)
SELECT s.staff_id, b.branch_id, '2026-04-16 08:55:00', '2026-04-16 17:10:00', 'CLOSED'
FROM staff_profiles s
JOIN branches b ON b.branch_code = '0001'
WHERE s.staff_username = 'assistant.colombo';

INSERT INTO staff_second_login_sessions
(staff_id, branch_id, login_time, logout_time, status)
SELECT s.staff_id, b.branch_id, '2026-04-18 09:05:00', NULL, 'ACTIVE'
FROM staff_profiles s
JOIN branches b ON b.branch_code = '0266'
WHERE s.staff_username = 'assistant.gampaha';

INSERT INTO activity_logs
(branch_id, user_id, role_name, action, entity_type, entity_id, description, created_at)
SELECT b.branch_id, u.user_id, 'ADMIN', 'UPDATE_SETTING', 'SYSTEM_SETTING', NULL, 'Updated annual interest and penalty settings', '2025-03-05 10:05:00'
FROM users u
JOIN branches b ON b.branch_code = '0001'
WHERE u.nic = '200158623145';

INSERT INTO activity_logs
(branch_id, user_id, role_name, action, entity_type, entity_id, description, created_at)
SELECT b.branch_id, u.user_id, 'STAFF', 'CREATE_TICKET', 'PAWN_TICKET', NULL, 'Created a new pawn receipt for a Colombo customer', '2025-10-18 11:20:00'
FROM users u
JOIN branches b ON b.branch_code = '0001'
WHERE u.nic = '199765423501';

INSERT INTO activity_logs
(branch_id, user_id, role_name, action, entity_type, entity_id, description, created_at)
SELECT b.branch_id, u.user_id, 'MANAGER', 'APPROVE_RENEWAL', 'RENEWAL', NULL, 'Approved renewal appointment for Kandy branch customer', '2026-04-10 10:30:00'
FROM users u
JOIN branches b ON b.branch_code = '0756'
WHERE u.nic = '199876512304';

INSERT INTO activity_logs
(branch_id, user_id, role_name, action, entity_type, entity_id, description, created_at)
SELECT b.branch_id, u.user_id, 'CUSTOMER', 'REQUEST_APPOINTMENT', 'APPOINTMENT', NULL, 'Requested redemption appointment through the customer portal', '2026-04-15 11:05:00'
FROM users u
JOIN branches b ON b.branch_code = '0001'
WHERE u.nic = '200254369871';

INSERT INTO activity_logs
(branch_id, user_id, role_name, action, entity_type, entity_id, description, created_at)
SELECT b.branch_id, u.user_id, 'STAFF', 'MARK_REVERSED', 'PAWN_TICKET', NULL, 'Marked a reverse pawning request as approved', '2025-08-05 13:45:00'
FROM users u
JOIN branches b ON b.branch_code = '0001'
WHERE u.nic = '200158623145';

INSERT INTO activity_logs
(branch_id, user_id, role_name, action, entity_type, entity_id, description, created_at)
SELECT b.branch_id, u.user_id, 'STAFF', 'SEND_REMINDER', 'SMS_REMINDER', NULL, 'Triggered overdue reminder for auction-bound ticket', '2025-12-10 08:15:00'
FROM users u
JOIN branches b ON b.branch_code = '0001'
WHERE u.nic = '199765423501';
