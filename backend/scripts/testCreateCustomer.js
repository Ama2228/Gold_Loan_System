const http = require('http');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

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

const testCreateCustomer = async () => {
  try {
    console.log('🧪 Testing POST /api/v1/staff/customers\n');
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
      console.error('❌ No token in response:', JSON.stringify(loginResponse.data, null, 2));
      return;
    }
    console.log('✅ Login successful');
    console.log(`   Token: ${token.substring(0, 20)}...`);

    // Step 2: Create a new customer
    console.log('\n📝 Step 2: Creating new customer...');
    
    const newCustomer = {
      full_name: 'Test Customer ' + Date.now(),
      nic: '200199887766', // Unique NIC for testing
      password: 'Customer@123',
      phone: '0771234567',
      email: 'test.customer@example.com',
      branch_id: 1,
      occupation_id: 1,
      city_id: 1,
      address_line1: '123 Test Street',
      address_line2: 'Test Area'
    };

    console.log('   Request payload:');
    console.log('   ', JSON.stringify(newCustomer, null, 2).split('\n').join('\n    '));

    const createResponse = await makeRequest('POST', '/api/v1/staff/customers', newCustomer, token);

    console.log('\n📊 Response:');
    console.log(`   Status: ${createResponse.status}`);
    console.log('   Body:', JSON.stringify(createResponse.data, null, 2).split('\n').join('\n   '));

    if (createResponse.status === 201) {
      console.log('\n✅ TEST PASSED: Customer created successfully!');
      console.log(`   Customer ID: ${createResponse.data.data.user_id}`);
      console.log(`   NIC: ${createResponse.data.data.nic}`);
      console.log(`   Name: ${createResponse.data.data.full_name}`);
    } else {
      console.log('\n❌ TEST FAILED: Unexpected status code');
    }

    // Step 3: Try creating duplicate (should fail with 409)
    console.log('\n📝 Step 3: Testing duplicate NIC validation...');
    const duplicateResponse = await makeRequest('POST', '/api/v1/staff/customers', newCustomer, token);
    
    console.log(`   Status: ${duplicateResponse.status}`);
    console.log('   Body:', JSON.stringify(duplicateResponse.data, null, 2).split('\n').join('\n   '));

    if (duplicateResponse.status === 409) {
      console.log('\n✅ Duplicate validation works correctly!');
    } else {
      console.log('\n⚠️  Expected 409 status code for duplicate NIC');
    }

    // Step 4: Test validation (missing required field)
    console.log('\n📝 Step 4: Testing validation (missing phone)...');
    const invalidCustomer = {
      full_name: 'Invalid Customer',
      nic: '200188776655',
      password: 'Test@123',
      // phone missing
      branch_id: 1,
      occupation_id: 1,
      city_id: 1,
      address_line1: '456 Test Road'
    };

    const validationResponse = await makeRequest('POST', '/api/v1/staff/customers', invalidCustomer, token);
    
    console.log(`   Status: ${validationResponse.status}`);
    console.log('   Body:', JSON.stringify(validationResponse.data, null, 2).split('\n').join('\n   '));

    if (validationResponse.status === 400) {
      console.log('\n✅ Validation works correctly!');
    } else {
      console.log('\n⚠️  Expected 400 status code for missing phone');
    }

    // Step 5: Test NIC format validation
    console.log('\n📝 Step 5: Testing NIC format validation...');
    const invalidNicCustomer = {
      full_name: 'Invalid NIC Customer',
      nic: '12345', // Invalid: not 12 digits
      password: 'Test@123',
      phone: '0771234567',
      branch_id: 1,
      occupation_id: 1,
      city_id: 1,
      address_line1: '789 Test Lane'
    };

    const nicValidationResponse = await makeRequest('POST', '/api/v1/staff/customers', invalidNicCustomer, token);
    
    console.log(`   Status: ${nicValidationResponse.status}`);
    console.log('   Body:', JSON.stringify(nicValidationResponse.data, null, 2).split('\n').join('\n   '));

    if (nicValidationResponse.status === 400 && nicValidationResponse.data.message.includes('12 digits')) {
      console.log('\n✅ NIC format validation works correctly!');
    } else {
      console.log('\n⚠️  Expected 400 status code with NIC format message');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 All tests completed!\n');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Cannot connect to server. Please make sure the backend server is running:');
      console.error('   npm run dev\n');
    }
  }
};

// Run the test
testCreateCustomer();
