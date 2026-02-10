const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const initDatabase = async () => {
  let connection;

  try {
    console.log('🔧 Initializing Smart Gold Database...\n');

    // Connect to MySQL server (without database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL server');

    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'Smart_Gold'} 
      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    
    console.log(`✅ Database '${process.env.DB_NAME || 'Smart_Gold'}' ready`);

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME || 'Smart_Gold'}`);

    // Insert default roles
    console.log('\n📝 Inserting default roles...');
    await connection.query(`
      INSERT IGNORE INTO roles (role_name) VALUES 
      ('ADMIN'),
      ('MANAGER'),
      ('STAFF'),
      ('CUSTOMER')
    `);
    console.log('✅ Roles inserted');

    // Hash passwords
    const staffPassword = await bcrypt.hash('Staff@123', 10);
    const managerPassword = await bcrypt.hash('Manager@123', 10);
    const adminPassword = await bcrypt.hash('Dewama.952', 10);

    // Insert demo users
    console.log('\n👥 Creating demo users...');
    
    // Staff user
    await connection.query(`
      INSERT IGNORE INTO users (nic, password_hash, full_name, status) 
      VALUES ('199978901234', ?, 'Hasindu Nimantha', 'ACTIVE')
    `, [staffPassword]);

    // Manager user
    await connection.query(`
      INSERT IGNORE INTO users (nic, password_hash, full_name, status) 
      VALUES ('199911223344', ?, 'Manager User', 'ACTIVE')
    `, [managerPassword]);

    // Admin user
    await connection.query(`
      INSERT IGNORE INTO users (nic, password_hash, full_name, status) 
      VALUES ('200263000105', ?, 'Dewama Admin', 'ACTIVE')
    `, [adminPassword]);

    console.log('✅ Demo users created');

    // Get user IDs
    const [staffUser] = await connection.query('SELECT user_id FROM users WHERE nic = ?', ['199978901234']);
    const [managerUser] = await connection.query('SELECT user_id FROM users WHERE nic = ?', ['199911223344']);
    const [adminUser] = await connection.query('SELECT user_id FROM users WHERE nic = ?', ['200263000105']);

    // Get role IDs
    const [staffRole] = await connection.query('SELECT role_id FROM roles WHERE role_name = ?', ['STAFF']);
    const [managerRole] = await connection.query('SELECT role_id FROM roles WHERE role_name = ?', ['MANAGER']);
    const [adminRole] = await connection.query('SELECT role_id FROM roles WHERE role_name = ?', ['ADMIN']);

    // Assign roles
    console.log('\n🔑 Assigning roles...');
    if (staffUser.length > 0 && staffRole.length > 0) {
      await connection.query(`
        INSERT IGNORE INTO user_roles (user_id, role_id) 
        VALUES (?, ?)
      `, [staffUser[0].user_id, staffRole[0].role_id]);
    }

    if (managerUser.length > 0 && managerRole.length > 0) {
      await connection.query(`
        INSERT IGNORE INTO user_roles (user_id, role_id) 
        VALUES (?, ?)
      `, [managerUser[0].user_id, managerRole[0].role_id]);
    }

    if (adminUser.length > 0 && adminRole.length > 0) {
      await connection.query(`
        INSERT IGNORE INTO user_roles (user_id, role_id) 
        VALUES (?, ?)
      `, [adminUser[0].user_id, adminRole[0].role_id]);
    }

    console.log('✅ Roles assigned');

    // Insert demo branch
    console.log('\n🏢 Creating demo branch...');
    await connection.query(`
      INSERT IGNORE INTO branches (branch_code, branch_name, address_line1, city, phone, is_head_office, status) 
      VALUES ('0001', 'Colombo Central', 'No. 123, Main Street', 'Colombo', '0112345678', 1, 'ACTIVE')
    `);
    console.log('✅ Demo branch created');

    // Get branch ID
    const [branch] = await connection.query('SELECT branch_id FROM branches WHERE branch_code = ?', ['0001']);

    // Create staff profiles
    console.log('\n👔 Creating staff profiles...');
    const staffUsername = 'staff001';
    const managerUsername = 'manager001';
    const staffSecondPassword = await bcrypt.hash('staff123', 10);
    const managerSecondPassword = await bcrypt.hash('manager123', 10);

    if (staffUser.length > 0 && branch.length > 0) {
      await connection.query(`
        INSERT IGNORE INTO staff_profiles (staff_id, branch_id, staff_username, staff_password_hash, staff_type, joined_date) 
        VALUES (?, ?, ?, ?, 'PAWNING_ASSISTANT', CURDATE())
      `, [staffUser[0].user_id, branch[0].branch_id, staffUsername, staffSecondPassword]);
    }

    if (managerUser.length > 0 && branch.length > 0) {
      await connection.query(`
        INSERT IGNORE INTO staff_profiles (staff_id, branch_id, staff_username, staff_password_hash, staff_type, joined_date) 
        VALUES (?, ?, ?, ?, 'MANAGER', CURDATE())
      `, [managerUser[0].user_id, branch[0].branch_id, managerUsername, managerSecondPassword]);
    }

    console.log('✅ Staff profiles created');

    console.log('\n✨ Database initialization completed successfully!\n');
    console.log('📋 Demo Credentials:');
    console.log('   Staff    - NIC: 199978901234, Password: Staff@123');
    console.log('   Manager  - NIC: 199911223344, Password: Manager@123');
    console.log('   Admin    - NIC: 200263000105, Password: Dewama.952');
    console.log('\n');

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run initialization
initDatabase();
