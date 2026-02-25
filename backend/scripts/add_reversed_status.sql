-- Add REVERSED status to pawn_tickets and ticket_status_history
-- Run: mysql -u root -p Smart_Gold < backend/scripts/add_reversed_status.sql
-- Or run in MySQL Workbench / command line

USE Smart_Gold;

ALTER TABLE pawn_tickets 
MODIFY COLUMN status ENUM('ACTIVE','RENEWED','OVERDUE','CLOSED','AUCTION','REVERSED') NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE ticket_status_history 
MODIFY COLUMN old_status ENUM('ACTIVE','RENEWED','OVERDUE','CLOSED','AUCTION','REVERSED') NOT NULL,
MODIFY COLUMN new_status ENUM('ACTIVE','RENEWED','OVERDUE','CLOSED','AUCTION','REVERSED') NOT NULL;
