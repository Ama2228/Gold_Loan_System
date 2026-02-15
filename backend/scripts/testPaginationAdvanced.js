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

const testPaginationAdvanced = async () => {
  try {
    console.log('🧪 Advanced Pagination Testing\n');
    console.log('=' .repeat(60));

    // Login
    console.log('\n📝 Logging in as Staff...');
    const loginResponse = await makeRequest('POST', '/api/v1/auth/login', {
      nic: '199978901234',
      password: 'Staff@123'
    });

    const token = loginResponse.data.data?.token || loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Test with 3 records per page
    const limit = 3;
    
    console.log(`📝 Testing pagination with ${limit} records per page:\n`);
    
    // Get first page
    const page1 = await makeRequest('GET', `/api/v1/staff/customers?page=1&limit=${limit}`, null, token);
    console.log(`Page 1 (limit=${limit}):`);
    console.log(`  Total Records: ${page1.data.pagination.total}`);
    console.log(`  Total Pages: ${page1.data.pagination.totalPages}`);
    console.log(`  Records in this page: ${page1.data.data.length}`);
    console.log('  Customers:');
    page1.data.data.forEach((c, i) => {
      console.log(`    ${i + 1}. ${c.full_name} (${c.nic})`);
    });

    // Get second page
    console.log(`\nPage 2 (limit=${limit}):`);
    const page2 = await makeRequest('GET', `/api/v1/staff/customers?page=2&limit=${limit}`, null, token);
    console.log(`  Records in this page: ${page2.data.data.length}`);
    console.log('  Customers:');
    page2.data.data.forEach((c, i) => {
      console.log(`    ${i + 1}. ${c.full_name} (${c.nic})`);
    });

    // Get third page
    console.log(`\nPage 3 (limit=${limit}):`);
    const page3 = await makeRequest('GET', `/api/v1/staff/customers?page=3&limit=${limit}`, null, token);
    console.log(`  Records in this page: ${page3.data.data.length}`);
    console.log('  Customers:');
    page3.data.data.forEach((c, i) => {
      console.log(`    ${i + 1}. ${c.full_name} (${c.nic})`);
    });

    // Test search with name pattern
    console.log('\n\n📝 Testing search functionality:\n');
    
    console.log('Search: "a" (names containing "a"):');
    const searchA = await makeRequest('GET', '/api/v1/staff/customers?search=a', null, token);
    console.log(`  Total matches: ${searchA.data.pagination.total}`);
    console.log('  Matching customers:');
    searchA.data.data.forEach((c, i) => {
      console.log(`    ${i + 1}. ${c.full_name} (${c.nic})`);
    });

    console.log('\nSearch: "Silva":');
    const searchSilva = await makeRequest('GET', '/api/v1/staff/customers?search=Silva', null, token);
    console.log(`  Total matches: ${searchSilva.data.pagination.total}`);
    console.log('  Matching customers:');
    searchSilva.data.data.forEach((c, i) => {
      console.log(`    ${i + 1}. ${c.full_name} (${c.nic})`);
    });

    console.log('\nSearch by NIC pattern: "1988":');
    const search1988 = await makeRequest('GET', '/api/v1/staff/customers?search=1988', null, token);
    console.log(`  Total matches: ${search1988.data.pagination.total}`);
    console.log('  Matching customers:');
    search1988.data.data.forEach((c, i) => {
      console.log(`    ${i + 1}. ${c.full_name} (${c.nic})`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ Advanced pagination testing completed!\n');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
  }
};

testPaginationAdvanced();
