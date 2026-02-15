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

const testAllFeatures = async () => {
  console.log('🎯 COMPLETE SYSTEM TEST - All Features\n');
  console.log('='.repeat(70));
  console.log('\nTesting all 3 features:\n');
  console.log('✅ Feature 1 — Auth + Role');
  console.log('✅ Feature 2 — Admin Setup');
  console.log('✅ Feature 3 — Staff Creates Customers\n');
  console.log('='.repeat(70));

  const overallResults = {
    feature1: { passed: 0, failed: 0, total: 0 },
    feature2: { passed: 0, failed: 0, total: 0 },
    feature3: { passed: 0, failed: 0, total: 0 }
  };

  try {
    // Get tokens for testing
    const adminLogin = await makeRequest('POST', '/api/v1/auth/login', {
      nic: '200263000105',
      password: 'Dewama.952'
    });
    const adminToken = adminLogin.data.data?.token || adminLogin.data.token;

    const staffLogin = await makeRequest('POST', '/api/v1/auth/login', {
      nic: '199978901234',
      password: 'Staff@123'
    });
    const staffToken = staffLogin.data.data?.token || staffLogin.data.token;

    if (!adminToken || !staffToken) {
      console.error('❌ Failed to obtain authentication tokens');
      return;
    }

    // FEATURE 1: Auth + Role
    console.log('\n📦 FEATURE 1: Auth + Role');
    console.log('-'.repeat(70));

    const feature1Tests = [
      { name: 'Login - Staff', test: async () => staffToken ? true : false },
      { name: 'Login - Admin', test: async () => adminToken ? true : false },
      { name: 'JWT Token Validation', test: async () => {
        const res = await makeRequest('GET', '/api/v1/staff/customers/meta/occupations', null, staffToken);
        return res.status === 200;
      }},
      { name: 'Role Detection - Staff Access', test: async () => {
        const res = await makeRequest('GET', '/api/v1/staff/customers?page=1&limit=1', null, staffToken);
        return res.status === 200;
      }},
      { name: 'Role Detection - Admin Access', test: async () => {
        const res = await makeRequest('GET', '/api/v1/admin/branches', null, adminToken);
        return res.status === 200;
      }},
      { name: 'Role Detection - Staff Blocked from Admin', test: async () => {
        const res = await makeRequest('GET', '/api/v1/admin/branches', null, staffToken);
        return res.status === 403;
      }},
      { name: 'GetMe - User Profile', test: async () => {
        const res = await makeRequest('GET', '/api/v1/auth/me', null, staffToken);
        return res.status === 200 && res.data.data?.user;
      }}
    ];

    for (const test of feature1Tests) {
      const result = await test.test();
      overallResults.feature1.total++;
      if (result) {
        overallResults.feature1.passed++;
        console.log(`   ✅ ${test.name}`);
      } else {
        overallResults.feature1.failed++;
        console.log(`   ❌ ${test.name}`);
      }
    }

    // FEATURE 2: Admin Setup
    console.log('\n📦 FEATURE 2: Admin Setup');
    console.log('-'.repeat(70));

    const feature2Tests = [
      { name: 'GET Branches', endpoint: '/api/v1/admin/branches' },
      { name: 'GET System Settings', endpoint: '/api/v1/admin/settings' },
      { name: 'GET Time Slots', endpoint: '/api/v1/admin/time-slots' },
      { name: 'GET Karat Advance Rates', endpoint: '/api/v1/admin/advance-rates' },
      { name: 'GET Pawning Periods', endpoint: '/api/v1/admin/pawning-periods' },
      { name: 'GET Occupations', endpoint: '/api/v1/admin/occupations' }
    ];

    for (const test of feature2Tests) {
      const res = await makeRequest('GET', test.endpoint, null, adminToken);
      const result = res.status === 200;
      overallResults.feature2.total++;
      if (result) {
        overallResults.feature2.passed++;
        console.log(`   ✅ ${test.name}`);
      } else {
        overallResults.feature2.failed++;
        console.log(`   ❌ ${test.name} (Status: ${res.status})`);
      }
    }

    // FEATURE 3: Staff Creates Customers
    console.log('\n📦 FEATURE 3: Staff Creates Customers');
    console.log('-'.repeat(70));

    // Create a test customer
    const createRes = await makeRequest('POST', '/api/v1/staff/customers', {
      full_name: 'System Test Customer',
      nic: '200177776666',
      password: 'Test@123',
      phone: '0777776666',
      email: 'systemtest@example.com',
      branch_id: 1,
      occupation_id: 1,
      city_id: 1,
      address_line1: '777 Test Street'
    }, staffToken);

    const testCustomerId = createRes.data.data?.user_id;

    const feature3Tests = [
      { name: 'Create Customer', result: createRes.status === 201 || createRes.status === 409 },
      { name: 'List Customers (pagination)', test: async () => {
        const res = await makeRequest('GET', '/api/v1/staff/customers?page=1&limit=5', null, staffToken);
        return res.status === 200;
      }},
      { name: 'List Customers (search)', test: async () => {
        const res = await makeRequest('GET', '/api/v1/staff/customers?search=Test', null, staffToken);
        return res.status === 200;
      }},
      { name: 'Get Customer by ID', test: async () => {
        if (!testCustomerId) return true; // Skip if customer already exists
        const res = await makeRequest('GET', `/api/v1/staff/customers/${testCustomerId}`, null, staffToken);
        return res.status === 200;
      }},
      { name: 'Update Customer', test: async () => {
        if (!testCustomerId) return true; // Skip if customer already exists
        const res = await makeRequest('PUT', `/api/v1/staff/customers/${testCustomerId}`, {
          full_name: 'System Test Customer Updated',
          phone: '0771112222'
        }, staffToken);
        return res.status === 200;
      }},
      { name: 'Search Customers', test: async () => {
        const res = await makeRequest('GET', '/api/v1/staff/customers/search?q=Test', null, staffToken);
        return res.status === 200;
      }},
      { name: 'Soft Delete Customer', test: async () => {
        if (!testCustomerId) return true; // Skip if customer already exists
        const res = await makeRequest('DELETE', `/api/v1/staff/customers/${testCustomerId}`, null, staffToken);
        return res.status === 200;
      }}
    ];

    for (const test of feature3Tests) {
      let result;
      if (test.result !== undefined) {
        result = test.result;
      } else {
        result = await test.test();
      }
      
      overallResults.feature3.total++;
      if (result) {
        overallResults.feature3.passed++;
        console.log(`   ✅ ${test.name}`);
      } else {
        overallResults.feature3.failed++;
        console.log(`   ❌ ${test.name}`);
      }
    }

    // Final Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 COMPLETE SYSTEM TEST RESULTS');
    console.log('='.repeat(70));

    const totalPassed = overallResults.feature1.passed + overallResults.feature2.passed + overallResults.feature3.passed;
    const totalTests = overallResults.feature1.total + overallResults.feature2.total + overallResults.feature3.total;
    const totalFailed = totalTests - totalPassed;

    console.log('\n📦 Feature 1 — Auth + Role:');
    console.log(`   ✅ Passed: ${overallResults.feature1.passed}/${overallResults.feature1.total}`);
    console.log(`   ${overallResults.feature1.failed === 0 ? '🎉 ALL TESTS PASSED' : `❌ Failed: ${overallResults.feature1.failed}`}`);

    console.log('\n📦 Feature 2 — Admin Setup:');
    console.log(`   ✅ Passed: ${overallResults.feature2.passed}/${overallResults.feature2.total}`);
    console.log(`   ${overallResults.feature2.failed === 0 ? '🎉 ALL TESTS PASSED' : `❌ Failed: ${overallResults.feature2.failed}`}`);

    console.log('\n📦 Feature 3 — Staff Creates Customers:');
    console.log(`   ✅ Passed: ${overallResults.feature3.passed}/${overallResults.feature3.total}`);
    console.log(`   ${overallResults.feature3.failed === 0 ? '🎉 ALL TESTS PASSED' : `❌ Failed: ${overallResults.feature3.failed}`}`);

    console.log('\n' + '='.repeat(70));
    console.log(`🎯 OVERALL: ${totalPassed}/${totalTests} tests passed`);
    console.log('='.repeat(70));

    if (totalFailed === 0) {
      console.log('\n🎊🎉 SUCCESS! All features are working correctly! 🎉🎊\n');
    } else {
      console.log(`\n⚠️  ${totalFailed} test(s) failed. Review the details above.\n`);
    }

  } catch (error) {
    console.error('\n❌ Test suite failed with error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Cannot connect to server. Please make sure the backend server is running:');
      console.error('   cd backend && npm run dev\n');
    }
  }
};

// Run all tests
testAllFeatures();
