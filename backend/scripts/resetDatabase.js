const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

(async () => {
  let connection;
  try {
    console.log('📡 Connecting to MySQL...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3307,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });
    console.log('✅ Connected\n');

    console.log('🔄 Clearing all data...');
    try {
      await connection.query('USE Smart_Gold');
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');
      await connection.query('TRUNCATE TABLE user_roles');
      await connection.query('TRUNCATE TABLE roles');
      await connection.query('TRUNCATE TABLE users');
      await connection.query('TRUNCATE TABLE staff_profiles');
      await connection.query('TRUNCATE TABLE branches');
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
      console.log('✅ All data cleared\n');
    } catch(e) {
      console.log('ℹ️  Creating database from schema...\n');
      console.log('📄 Reading Schema.sql...');
      const schemaPath = path.join(__dirname, '..', '..', 'Schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');

      console.log('🔧 Executing schema...');
      await connection.query(schema);
      console.log('✅ Database and schema created\n');

      await connection.query('USE Smart_Gold');
    }

    // Insert roles
    console.log('📝 Inserting roles...');
    await connection.query(
      'INSERT IGNORE INTO roles (role_name) VALUES (\'ADMIN\'),(\'MANAGER\'),(\'STAFF\'),(\'CUSTOMER\')'
    );
    console.log('✅ Roles created\n');

    // Hash passwords
    const staffPass = await bcrypt.hash('Staff@123', 10);
    const managerPass = await bcrypt.hash('Manager@123', 10);
    const adminPass = await bcrypt.hash('Dewama.952', 10);
    const customerPass = await bcrypt.hash('Dewama.952', 10);

    // Insert users
    console.log('👥 Creating users...');
    const users = [
      { nic: '199978901234', pass: staffPass, name: 'Staff User' },
      { nic: '199911223344', pass: managerPass, name: 'Manager User' },
      { nic: '200263000105', pass: adminPass, name: 'Admin User' },
      { nic: '200123456789', pass: customerPass, name: 'Customer User' }
    ];

    for (const user of users) {
      await connection.query(
        'INSERT IGNORE INTO users (nic, password_hash, full_name, status) VALUES (?, ?, ?, ?)',
        [user.nic, user.pass, user.name, 'ACTIVE']
      );
    }
    console.log('✅ Users created\n');

    // Get role IDs
    const [staffRole] = await connection.query('SELECT role_id FROM roles WHERE role_name = ?', ['STAFF']);
    const [managerRole] = await connection.query('SELECT role_id FROM roles WHERE role_name = ?', ['MANAGER']);
    const [adminRole] = await connection.query('SELECT role_id FROM roles WHERE role_name = ?', ['ADMIN']);
    const [customerRole] = await connection.query('SELECT role_id FROM roles WHERE role_name = ?', ['CUSTOMER']);

    // Assign roles
    console.log('🔑 Assigning roles...');
    const [staffUser] = await connection.query('SELECT user_id FROM users WHERE nic = ?', ['199978901234']);
    const [managerUser] = await connection.query('SELECT user_id FROM users WHERE nic = ?', ['199911223344']);
    const [adminUser] = await connection.query('SELECT user_id FROM users WHERE nic = ?', ['200263000105']);
    const [customerUser] = await connection.query('SELECT user_id FROM users WHERE nic = ?', ['200123456789']);

    await connection.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [staffUser[0].user_id, staffRole[0].role_id]);
    await connection.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [managerUser[0].user_id, managerRole[0].role_id]);
    await connection.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [adminUser[0].user_id, adminRole[0].role_id]);
    await connection.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [customerUser[0].user_id, customerRole[0].role_id]);
    console.log('✅ Roles assigned\n');

    // Create branch
    console.log('🏢 Creating branch...');
    await connection.query(
      'INSERT INTO branches (branch_code, branch_name, address_line1, city, phone, is_head_office, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['0001', 'Colombo Central', 'No. 123, Main Street', 'Colombo', '0112345678', 1, 'ACTIVE']
    );
    const [branch] = await connection.query('SELECT branch_id FROM branches WHERE branch_code = ?', ['0001']);
    console.log('✅ Branch created\n');

    // Create staff profiles
    console.log('👔 Creating staff profiles...');
    const staffSecondPass = await bcrypt.hash('staff123', 10);
    const managerSecondPass = await bcrypt.hash('manager123', 10);

    await connection.query(
      'INSERT INTO staff_profiles (staff_id, branch_id, staff_username, staff_password_hash, staff_type, joined_date) VALUES (?, ?, ?, ?, ?, CURDATE())',
      [staffUser[0].user_id, branch[0].branch_id, 'staff001', staffSecondPass, 'PAWNING_ASSISTANT']
    );
    await connection.query(
      'INSERT INTO staff_profiles (staff_id, branch_id, staff_username, staff_password_hash, staff_type, joined_date) VALUES (?, ?, ?, ?, ?, CURDATE())',
      [managerUser[0].user_id, branch[0].branch_id, 'manager001', managerSecondPass, 'MANAGER']
    );
    console.log('✅ Staff profiles created\n');

    console.log('✨ Database cleared and reseeded successfully!\n');
    console.log('📋 Login Credentials:');
    console.log('   Staff    - NIC: 199978901234, Password: Staff@123');
    console.log('   Manager  - NIC: 199911223344, Password: Manager@123');
    console.log('   Admin    - NIC: 200263000105, Password: Dewama.952');
    console.log('   Customer - NIC: 200123456789, Password: Dewama.952\n');

    connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
