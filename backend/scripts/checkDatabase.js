const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'Smart_Gold'
  });

  console.log('\n📋 Users in Database:\n');
  const [users] = await conn.query('SELECT user_id, nic, full_name FROM users ORDER BY user_id');
  users.forEach(u => {
    console.log(`  User ID: ${u.user_id}`);
    console.log(`  Name: ${u.full_name}`);
    console.log(`  NIC: ${u.nic}`);
    console.log('  ---');
  });

  console.log('\n📋 User Roles:\n');
  const [userRoles] = await conn.query(`
    SELECT u.user_id, u.full_name, GROUP_CONCAT(r.role_name) as roles
    FROM users u
    LEFT JOIN user_roles ur ON u.user_id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.role_id
    GROUP BY u.user_id
  `);
  userRoles.forEach(u => {
    console.log(`  ${u.full_name}: ${u.roles || 'No roles'}`);
  });

  conn.end();
})();
