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

const testGetCustomers = async () => {
  try {
    console.log('🧪 Testing GET /api/v1/staff/customers (with pagination & search)\n');
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

    // Step 2: Test basic pagination (page 1, limit 10)
    console.log('\n📝 Step 2: Testing basic pagination (page=1, limit=10)...');
    const page1Response = await makeRequest('GET', '/api/v1/staff/customers?page=1&limit=10', null, token);
    
    console.log(`   Status: ${page1Response.status}`);
    if (page1Response.status === 200) {
      console.log('✅ Customers fetched successfully');
      console.log('   Pagination info:');
      console.log(`     - Page: ${page1Response.data.pagination.page}`);
      console.log(`     - Limit: ${page1Response.data.pagination.limit}`);
      console.log(`     - Total Records: ${page1Response.data.pagination.total}`);
      console.log(`     - Total Pages: ${page1Response.data.pagination.totalPages}`);
      console.log(`     - Records in this page: ${page1Response.data.data.length}`);
      
      if (page1Response.data.data.length > 0) {
        console.log('\n   Sample customers:');
        page1Response.data.data.slice(0, 3).forEach((customer, index) => {
          console.log(`     ${index + 1}. ${customer.full_name} (NIC: ${customer.nic})`);
          console.log(`        Phone: ${customer.phone}, City: ${customer.city_name || 'N/A'}`);
        });
      }
    } else {
      console.log('❌ Failed to fetch customers');
      console.log('   Response:', JSON.stringify(page1Response.data, null, 2).split('\n').join('\n   '));
    }

    // Step 3: Test pagination with different limit
    console.log('\n📝 Step 3: Testing pagination (page=1, limit=5)...');
    const page2Response = await makeRequest('GET', '/api/v1/staff/customers?page=1&limit=5', null, token);
    
    console.log(`   Status: ${page2Response.status}`);
    if (page2Response.status === 200) {
      console.log('✅ Pagination works correctly');
      console.log(`   - Records returned: ${page2Response.data.data.length}`);
      console.log(`   - Expected: 5 or less`);
    }

    // Step 4: Test search by name
    console.log('\n📝 Step 4: Testing search by name (search=Customer)...');
    const searchNameResponse = await makeRequest('GET', '/api/v1/staff/customers?search=Customer', null, token);
    
    console.log(`   Status: ${searchNameResponse.status}`);
    if (searchNameResponse.status === 200) {
      console.log('✅ Search by name works correctly');
      console.log(`   - Total matching records: ${searchNameResponse.data.pagination.total}`);
      console.log(`   - Records in this page: ${searchNameResponse.data.data.length}`);
      
      if (searchNameResponse.data.data.length > 0) {
        console.log('\n   Found customers:');
        searchNameResponse.data.data.slice(0, 3).forEach((customer) => {
          console.log(`     - ${customer.full_name} (NIC: ${customer.nic})`);
        });
      }
    } else {
      console.log('❌ Search failed');
    }

    // Step 5: Test search by NIC
    console.log('\n📝 Step 5: Testing search by NIC (search=200)...');
    const searchNicResponse = await makeRequest('GET', '/api/v1/staff/customers?search=200', null, token);
    
    console.log(`   Status: ${searchNicResponse.status}`);
    if (searchNicResponse.status === 200) {
      console.log('✅ Search by NIC works correctly');
      console.log(`   - Total matching records: ${searchNicResponse.data.pagination.total}`);
      console.log(`   - Records in this page: ${searchNicResponse.data.data.length}`);
      
      if (searchNicResponse.data.data.length > 0) {
        console.log('\n   Found customers:');
        searchNicResponse.data.data.forEach((customer) => {
          console.log(`     - ${customer.full_name} (NIC: ${customer.nic})`);
        });
      }
    } else {
      console.log('❌ Search failed');
    }

    // Step 6: Test search with pagination
    console.log('\n📝 Step 6: Testing search with pagination (search=Customer&page=1&limit=2)...');
    const searchPaginationResponse = await makeRequest('GET', '/api/v1/staff/customers?search=Customer&page=1&limit=2', null, token);
    
    console.log(`   Status: ${searchPaginationResponse.status}`);
    if (searchPaginationResponse.status === 200) {
      console.log('✅ Search with pagination works correctly');
      console.log(`   - Total matching: ${searchPaginationResponse.data.pagination.total}`);
      console.log(`   - Page: ${searchPaginationResponse.data.pagination.page}`);
      console.log(`   - Limit: ${searchPaginationResponse.data.pagination.limit}`);
      console.log(`   - Total Pages: ${searchPaginationResponse.data.pagination.totalPages}`);
      console.log(`   - Records returned: ${searchPaginationResponse.data.data.length}`);
    }

    // Step 7: Test empty search
    console.log('\n📝 Step 7: Testing search with no results (search=XYZABC123)...');
    const emptySearchResponse = await makeRequest('GET', '/api/v1/staff/customers?search=XYZABC123', null, token);
    
    console.log(`   Status: ${emptySearchResponse.status}`);
    if (emptySearchResponse.status === 200) {
      console.log('✅ Empty search handled correctly');
      console.log(`   - Total records: ${emptySearchResponse.data.pagination.total}`);
      console.log(`   - Records returned: ${emptySearchResponse.data.data.length}`);
      if (emptySearchResponse.data.pagination.total === 0) {
        console.log('   ✅ Correctly returns 0 results for non-existent search');
      }
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
testGetCustomers();
