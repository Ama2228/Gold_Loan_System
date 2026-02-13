const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const testLogin = async () => {
  let connection;

  try {
    console.log('🔍 Testing login credentials...\n');

    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3307,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'Smart_Gold'
    });

    console.log('✅ Connected to database');

    // Check users
    const [users] = await connection.query('SELECT user_id, nic, full_name, password_hash, status FROM users');
    
    console.log('\n📋 Users in database:');
    users.forEach(user => {
      console.log(`  - ${user.full_name} (${user.nic}) - Status: ${user.status}`);
    });

    // Test password for Staff user
    const testNic = '199978901234';
    const testPassword = 'Staff@123';
    
    console.log(`\n🔐 Testing password for NIC: ${testNic}`);
    
    const [staffUsers] = await connection.query('SELECT * FROM users WHERE nic = ?', [testNic]);
    
    if (staffUsers.length === 0) {
      console.log('❌ User not found!');
      return;
    }

    const user = staffUsers[0];
    console.log(`✅ User found: ${user.full_name}`);
    console.log(`📝 Stored hash: ${user.password_hash.substring(0, 20)}...`);

    // Test password comparison
    const isValid = await bcrypt.compare(testPassword, user.password_hash);
    console.log(`🔑 Password "${testPassword}" is ${isValid ? '✅ VALID' : '❌ INVALID'}`);

    // Check roles
    const [userRoles] = await connection.query(`
      SELECT r.role_name 
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.role_id
      WHERE ur.user_id = ?
    `, [user.user_id]);

    console.log(`\n👤 Roles assigned:`);
    userRoles.forEach(role => {
      console.log(`  - ${role.role_name}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

testLogin();
