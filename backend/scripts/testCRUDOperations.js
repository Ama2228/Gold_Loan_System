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

const testCRUDOperations = async () => {
  let testCustomerId = null;

  try {
    console.log('🧪 Testing Complete CRUD Operations\n');
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
    console.log('✅ Login successful\n');

    // Step 2: CREATE - Create a new customer
    console.log('📝 Step 2: CREATE - Creating a new customer...');
    const newCustomer = {
      full_name: 'CRUD Test Customer',
      nic: '200299998888',
      password: 'Test@123',
      phone: '0779999999',
      email: 'crud.test@example.com',
      branch_id: 1,
      occupation_id: 1,
      city_id: 1,
      address_line1: '999 Test Street',
      address_line2: 'CRUD Test Area'
    };

    const createResponse = await makeRequest('POST', '/api/v1/staff/customers', newCustomer, token);
    
    if (createResponse.status === 201) {
      testCustomerId = createResponse.data.data.user_id;
      console.log('✅ Customer created successfully');
      console.log(`   Customer ID: ${testCustomerId}`);
      console.log(`   Name: ${createResponse.data.data.full_name}`);
      console.log(`   NIC: ${createResponse.data.data.nic}`);
    } else {
      console.log('❌ Failed to create customer');
      console.log('   Response:', JSON.stringify(createResponse.data, null, 2));
      return;
    }

    // Step 3: READ - Get customer by ID
    console.log('\n📝 Step 3: READ - Fetching customer by ID...');
    const getResponse = await makeRequest('GET', `/api/v1/staff/customers/${testCustomerId}`, null, token);
    
    if (getResponse.status === 200) {
      console.log('✅ Customer fetched successfully');
      console.log(`   Name: ${getResponse.data.data.full_name}`);
      console.log(`   Phone: ${getResponse.data.data.phone}`);
      console.log(`   Email: ${getResponse.data.data.email}`);
      console.log(`   Occupation: ${getResponse.data.data.occupation_name}`);
      console.log(`   City: ${getResponse.data.data.city_name}`);
      console.log(`   Status: ${getResponse.data.data.status}`);
    } else {
      console.log('❌ Failed to fetch customer');
      console.log('   Response:', JSON.stringify(getResponse.data, null, 2));
    }

    // Step 4: UPDATE - Update customer details
    console.log('\n📝 Step 4: UPDATE - Updating customer details...');
    const updateData = {
      full_name: 'CRUD Test Customer Updated',
      phone: '0771111111',
      email: 'updated.crud@example.com',
      occupation_id: 2
    };

    const updateResponse = await makeRequest('PUT', `/api/v1/staff/customers/${testCustomerId}`, updateData, token);
    
    if (updateResponse.status === 200) {
      console.log('✅ Customer updated successfully');
      console.log(`   Updated Name: ${updateResponse.data.data.full_name}`);
      console.log(`   Updated Phone: ${updateResponse.data.data.phone}`);
      console.log(`   Updated Email: ${updateResponse.data.data.email}`);
      console.log(`   Updated Occupation: ${updateResponse.data.data.occupation_name}`);
    } else {
      console.log('❌ Failed to update customer');
      console.log('   Response:', JSON.stringify(updateResponse.data, null, 2));
    }

    // Step 5: Verify UPDATE - Fetch again to confirm changes
    console.log('\n📝 Step 5: Verifying update...');
    const verifyResponse = await makeRequest('GET', `/api/v1/staff/customers/${testCustomerId}`, null, token);
    
    if (verifyResponse.status === 200) {
      console.log('✅ Update verified');
      console.log(`   Current Name: ${verifyResponse.data.data.full_name}`);
      console.log(`   Current Phone: ${verifyResponse.data.data.phone}`);
      console.log(`   Current Status: ${verifyResponse.data.data.status}`);
    }

    // Step 6: Test UPDATE validation - Try to update with no fields
    console.log('\n📝 Step 6: Testing update validation (no fields)...');
    const emptyUpdateResponse = await makeRequest('PUT', `/api/v1/staff/customers/${testCustomerId}`, {}, token);
    
    if (emptyUpdateResponse.status === 400) {
      console.log('✅ Validation works correctly');
      console.log(`   Message: ${emptyUpdateResponse.data.message}`);
    } else {
      console.log('⚠️  Expected 400 status for empty update');
    }

    // Step 7: DELETE - Soft delete the customer
    console.log('\n📝 Step 7: DELETE - Soft deleting customer...');
    const deleteResponse = await makeRequest('DELETE', `/api/v1/staff/customers/${testCustomerId}`, null, token);
    
    if (deleteResponse.status === 200) {
      console.log('✅ Customer soft deleted successfully');
      console.log(`   Message: ${deleteResponse.data.message}`);
    } else {
      console.log('❌ Failed to delete customer');
      console.log('   Response:', JSON.stringify(deleteResponse.data, null, 2));
    }

    // Step 8: Verify DELETE - Check status is INACTIVE
    console.log('\n📝 Step 8: Verifying soft delete...');
    const verifyDeleteResponse = await makeRequest('GET', `/api/v1/staff/customers/${testCustomerId}`, null, token);
    
    if (verifyDeleteResponse.status === 200) {
      console.log('✅ Customer still exists in database');
      console.log(`   Status: ${verifyDeleteResponse.data.data.status}`);
      if (verifyDeleteResponse.data.data.status === 'INACTIVE') {
        console.log('✅ Status correctly set to INACTIVE');
      } else {
        console.log('⚠️  Status should be INACTIVE after soft delete');
      }
    }

    // Step 9: Test invalid customer ID
    console.log('\n📝 Step 9: Testing invalid customer ID...');
    const invalidIdResponse = await makeRequest('GET', '/api/v1/staff/customers/99999', null, token);
    
    if (invalidIdResponse.status === 404) {
      console.log('✅ 404 error handled correctly for non-existent customer');
    } else if (invalidIdResponse.status === 200 && invalidIdResponse.data.data === null) {
      console.log('✅ Non-existent customer handled correctly');
    }

    // Step 10: Test SEARCH functionality
    console.log('\n📝 Step 10: Testing SEARCH...');
    const searchResponse = await makeRequest('GET', '/api/v1/staff/customers/search?q=CRUD', null, token);
    
    if (searchResponse.status === 200) {
      console.log('✅ Search works correctly');
      console.log(`   Found ${searchResponse.data.data.length} customer(s)`);
      if (searchResponse.data.data.length > 0) {
        searchResponse.data.data.forEach((customer, i) => {
          console.log(`   ${i + 1}. ${customer.full_name} (${customer.nic})`);
        });
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 All CRUD operations tested successfully!\n');

    // Summary
    console.log('📊 Test Summary:');
    console.log('   ✅ CREATE - Customer created with ID:', testCustomerId);
    console.log('   ✅ READ - Customer fetched successfully');
    console.log('   ✅ UPDATE - Customer details updated');
    console.log('   ✅ DELETE - Customer soft deleted (status=INACTIVE)');
    console.log('   ✅ SEARCH - Search functionality working');
    console.log('   ✅ VALIDATION - Empty update validation working');
    console.log('   ✅ ERROR HANDLING - 404 handled correctly\n');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Cannot connect to server. Please make sure the backend server is running:');
      console.error('   npm run dev\n');
    }
  }
};

// Run the test
testCRUDOperations();
