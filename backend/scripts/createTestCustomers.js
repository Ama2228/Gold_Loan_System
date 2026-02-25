const http = require('http');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Helper function to make HTTP requests
const makeRequest = (method, path, data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
};

const createTestCustomers = async () => {
  try {
    console.log('🧪 Creating Test Customers for Pagination Testing\n');
    console.log('=' .repeat(60));

    // Step 1: Login as Staff
    console.log('\n📝 Step 1: Logging in as Staff...');
    const loginResponse = await makeRequest('POST', '/api/v1/auth/login', {
      nic: '199978901234',
      password: 'Staff@123'
    });

    if (loginResponse.status !== 200) {
      console.error('❌ Login failed:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.data?.token || loginResponse.data.token;
    if (!token) {
      console.error('❌ No token in response');
      return;
    }
    console.log('✅ Login successful');

    // Step 2: Create multiple test customers
    const testCustomers = [
      { name: 'John Silva', nic: '198801234567', phone: '0771111111' },
      { name: 'Sarah Fernando', nic: '199012345678', phone: '0772222222' },
      { name: 'Michael Perera', nic: '198512345679', phone: '0773333333' },
      { name: 'Emma Jayawardena', nic: '199212345680', phone: '0774444444' },
      { name: 'David Rodrigo', nic: '198712345681', phone: '0775555555' },
      { name: 'Sophia Wickramasinghe', nic: '199112345682', phone: '0776666666' },
      { name: 'James Gunawardena', nic: '198612345683', phone: '0777777777' }
    ];

    console.log(`\n📝 Step 2: Creating ${testCustomers.length} test customers...\n`);
    
    let successCount = 0;
    let failCount = 0;

    for (const customer of testCustomers) {
      const customerData = {
        full_name: customer.name,
        nic: customer.nic,
        password: 'Test@123',
        phone: customer.phone,
        email: `${customer.name.toLowerCase().replace(' ', '.')}@test.com`,
        branch_id: 1,
        occupation_id: 1,
        city_id: 1,
        address_line1: `${Math.floor(Math.random() * 999) + 1} Test Street`,
        address_line2: 'Test Area'
      };

      const response = await makeRequest('POST', '/api/v1/staff/customers', customerData, token);
      
      if (response.status === 201) {
        console.log(`   ✅ Created: ${customer.name} (NIC: ${customer.nic})`);
        successCount++;
      } else if (response.status === 409) {
        console.log(`   ⚠️  Skipped: ${customer.name} (already exists)`);
      } else {
        console.log(`   ❌ Failed: ${customer.name} - ${response.data.message}`);
        failCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   - Successfully created: ${successCount}`);
    console.log(`   - Skipped (duplicates): ${testCustomers.length - successCount - failCount}`);
    console.log(`   - Failed: ${failCount}`);

    // Step 3: Verify by listing customers
    console.log('\n📝 Step 3: Verifying customers list...');
    const listResponse = await makeRequest('GET', '/api/v1/staff/customers?page=1&limit=20', null, token);
    
    if (listResponse.status === 200) {
      console.log(`   ✅ Total customers in database: ${listResponse.data.pagination.total}`);
      console.log(`   ✅ Total pages (limit=20): ${listResponse.data.pagination.totalPages}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Test data creation completed!\n');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Cannot connect to server. Please make sure the backend server is running:');
      console.error('   npm run dev\n');
    }
  }
};

// Run the test
createTestCustomers();
