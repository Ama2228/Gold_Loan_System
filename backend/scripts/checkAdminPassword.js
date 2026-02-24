git const mysql = require('mysql2/promise');
const path = require('path');

// Load dotenv from parent directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'Smart_Gold'
  });

  const adminNIC = '200263000105';

  console.log('\n🔍 Checking Admin User Password:\n');
  
  const [users] = await conn.query('SELECT user_id, nic, full_name, password_hash FROM users WHERE nic = ?', [adminNIC]);
  
  if (users.length === 0) {
    console.log('❌ Admin user not found with NIC:', adminNIC);
    conn.end();
    return;
  }

  const user = users[0];
  console.log(`✅ Found user: ${user.full_name} (ID: ${user.user_id})`);
  console.log(`   NIC: ${user.nic}`);
  console.log(`   Password Hash in DB:\n   ${user.password_hash}`);
  
  console.log('\n📋 Checking all admin users:');
  const [adminUsers] = await conn.query(`
    SELECT u.user_id, u.nic, u.full_name, u.password_hash
    FROM users u
    INNER JOIN user_roles ur ON u.user_id = ur.user_id
    INNER JOIN roles r ON ur.role_id = r.role_id
    WHERE r.role_name = 'ADMIN'
  `);
  
  adminUsers.forEach(admin => {
    console.log(`\n  User: ${admin.full_name}`);
    console.log(`  NIC: ${admin.nic}`);
    console.log(`  Hash: ${admin.password_hash.substring(0, 30)}...`);
  });

  conn.end();
})();
