const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Creates a new staff account in the database.
 * Run: node scripts/createStaffAccount.js
 * 
 * Optionally override via env:
 *   STAFF_NIC=199988776655
 *   STAFF_PASSWORD=Staff@456
 *   STAFF_NAME="New Staff Member"
 */
const createStaffAccount = async () => {
  const NIC = process.env.STAFF_NIC || '199988776655';
  const PASSWORD = process.env.STAFF_PASSWORD || 'Staff@456';
  const FULL_NAME = process.env.STAFF_NAME || 'New Staff Member';

  let connection;

  try {
    console.log('Creating new staff account...\n');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'Smart_Gold',
      multipleStatements: true
    });

    // Check if NIC already exists
    const [existing] = await connection.query(
      'SELECT user_id FROM users WHERE nic = ?',
      [NIC]
    );

    if (existing.length > 0) {
      console.log('Staff with this NIC already exists.');
      console.log('Existing credentials:');
      console.log(`  NIC: ${NIC}`);
      console.log('  Password: (use the one you set when creating this account)');
      process.exit(0);
      return;
    }

    const passwordHash = await bcrypt.hash(PASSWORD, 10);

    await connection.query(
      `INSERT INTO users (nic, password_hash, full_name, status) 
       VALUES (?, ?, ?, 'ACTIVE')`,
      [NIC, passwordHash, FULL_NAME]
    );

    const [newUser] = await connection.query('SELECT user_id FROM users WHERE nic = ?', [NIC]);
    const userId = newUser[0].user_id;

    const [staffRole] = await connection.query('SELECT role_id FROM roles WHERE role_name = ?', ['STAFF']);
    if (staffRole.length > 0) {
      await connection.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
        [userId, staffRole[0].role_id]
      );
    }

    const [branch] = await connection.query('SELECT branch_id FROM branches LIMIT 1');
    if (branch.length > 0) {
      const staffUsername = `staff${userId}`;
      const staffSecondPassword = await bcrypt.hash(PASSWORD, 10);
      await connection.query(
        `INSERT INTO staff_profiles (staff_id, branch_id, staff_username, staff_password_hash, staff_type, joined_date) 
         VALUES (?, ?, ?, ?, 'PAWNING_ASSISTANT', CURDATE())`,
        [userId, branch[0].branch_id, staffUsername, staffSecondPassword]
      );
    }

    console.log('Staff account created successfully.\n');
    console.log('========================================');
    console.log('STAFF CREDENTIALS');
    console.log('========================================');
    console.log(`  NIC:      ${NIC}`);
    console.log(`  Password: ${PASSWORD}`);
    console.log(`  Name:     ${FULL_NAME}`);
    console.log('========================================');
    console.log('\nUse these credentials to log in as staff.\n');

  } catch (error) {
    console.error('Failed to create staff account:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

createStaffAccount();
