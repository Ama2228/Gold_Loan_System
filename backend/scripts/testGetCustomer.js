const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3307,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    await conn.query('USE Smart_Gold');
    
    console.log('✅ Testing GET /api/v1/staff/customers/:customerId\n');
    
    const [customers] = await conn.query('SELECT customer_id FROM customer_profiles LIMIT 1');
    
    if (customers.length === 0) {
      console.log('ℹ️  No customers in database');
      conn.end();
      return;
    }
    
    const testId = customers[0].customer_id;
    console.log('Testing with customer_id:', testId, '\n');
    
    const [result] = await conn.query(`
      SELECT 
        cp.customer_id,
        u.nic,
        u.full_name,
        cp.phone,
        cp.email,
        cp.address_line1,
        cp.address_line2,
        cp.city_id,
        c.city_name,
        d.district_id,
        d.district_name,
        cp.occupation_id,
        o.occupation_name,
        cp.status,
        cp.registered_date,
        b.branch_id as registered_branch_id,
        b.branch_name as registered_branch,
        b.branch_code
      FROM customer_profiles cp
      INNER JOIN users u ON cp.customer_id = u.user_id
      LEFT JOIN branches b ON cp.registered_branch_id = b.branch_id
      LEFT JOIN cities c ON cp.city_id = c.city_id
      LEFT JOIN districts d ON c.district_id = d.district_id
      LEFT JOIN occupations o ON cp.occupation_id = o.occupation_id
      WHERE cp.customer_id = ?
    `, [testId]);
    
    if (result.length === 0) {
      console.log('❌ Query returned no results');
      conn.end();
      return;
    }
    
    console.log('✅ Query Result:');
    console.log(JSON.stringify(result[0], null, 2));
    
    console.log('\n✅ All fields returned:');
    console.log('  - customer_id:', result[0].customer_id);
    console.log('  - full_name:', result[0].full_name);
    console.log('  - nic:', result[0].nic);
    console.log('  - phone:', result[0].phone);
    console.log('  - email:', result[0].email);
    console.log('  - address_line1:', result[0].address_line1);
    console.log('  - address_line2:', result[0].address_line2);
    console.log('  - occupation_name:', result[0].occupation_name);
    console.log('  - city_name:', result[0].city_name);
    console.log('  - district_name:', result[0].district_name);
    console.log('  - registered_branch:', result[0].registered_branch);
    console.log('  - branch_code:', result[0].branch_code);
    console.log('  - status:', result[0].status);

    conn.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
})();
