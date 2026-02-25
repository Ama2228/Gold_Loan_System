/**
 * Migration: Add REVERSED status to pawn_tickets
 * Run from project root: node backend/scripts/migrateAddReversedStatus.js
 * Or from backend/: node scripts/migrateAddReversedStatus.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { pool } = require(path.join(__dirname, '..', 'config', 'database'));

const run = async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(`
      ALTER TABLE pawn_tickets 
      MODIFY COLUMN status ENUM('ACTIVE','RENEWED','OVERDUE','CLOSED','AUCTION','REVERSED') NOT NULL DEFAULT 'ACTIVE'
    `);
    await conn.query(`
      ALTER TABLE ticket_status_history 
      MODIFY COLUMN old_status ENUM('ACTIVE','RENEWED','OVERDUE','CLOSED','AUCTION','REVERSED') NOT NULL
    `);
    await conn.query(`
      ALTER TABLE ticket_status_history 
      MODIFY COLUMN new_status ENUM('ACTIVE','RENEWED','OVERDUE','CLOSED','AUCTION','REVERSED') NOT NULL
    `);
    console.log('✅ REVERSED status added to pawn_tickets and ticket_status_history');
  } catch (err) {
    if (err.message?.includes("Duplicate") || err.message?.includes("REVERSED") || err.message?.includes("already")) {
      console.log('⚠️ REVERSED status may already exist. Check schema manually.');
    } else {
      console.error('❌ Migration failed:', err?.message || err);
      process.exit(1);
    }
  } finally {
    if (conn) conn.release();
  }
};
run();
