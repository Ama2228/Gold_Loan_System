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

const testFeature1 = async () => {
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  const addResult = (name, passed, message = '') => {
    results.tests.push({ name, passed, message });
    if (passed) results.passed++;
    else results.failed++;
  };

  try {
    console.log('🧪 Feature 1 – Auth + Role Testing\n');
    console.log('=' .repeat(60));

    // Test 1: Login with valid credentials (Staff)
    console.log('\n1️⃣  Testing Login - Staff User');
    const staffLoginResponse = await makeRequest('POST', '/api/v1/auth/login', {
      nic: '199978901234',
      password: 'Staff@123'
    });
    
    const staffToken = staffLoginResponse.data.data?.token || staffLoginResponse.data.token;
    const staffLoginSuccess = staffLoginResponse.status === 200 && staffToken;
    console.log(`   Status: ${staffLoginResponse.status}`);
    console.log(`   ${staffLoginSuccess ? '✅ PASS' : '❌ FAIL'} - Staff login successful`);
    if (staffLoginSuccess) {
      console.log(`   Token received: ${staffToken.substring(0, 20)}...`);
    }
    addResult('Login - Staff User', staffLoginSuccess);

    // Test 2: Login with valid credentials (Manager)
    console.log('\n2️⃣  Testing Login - Manager User');
    const managerLoginResponse = await makeRequest('POST', '/api/v1/auth/login', {
      nic: '199911223344',
      password: 'Manager@123'
    });
    
    const managerToken = managerLoginResponse.data.data?.token || managerLoginResponse.data.token;
    const managerLoginSuccess = managerLoginResponse.status === 200 && managerToken;
    console.log(`   Status: ${managerLoginResponse.status}`);
    console.log(`   ${managerLoginSuccess ? '✅ PASS' : '❌ FAIL'} - Manager login successful`);
    addResult('Login - Manager User', managerLoginSuccess);

    // Test 3: Login with valid credentials (Admin)
    console.log('\n3️⃣  Testing Login - Admin User');
    const adminLoginResponse = await makeRequest('POST', '/api/v1/auth/login', {
      nic: '200263000105',
      password: 'Dewama.952'
    });
    
    const adminToken = adminLoginResponse.data.data?.token || adminLoginResponse.data.token;
    const adminLoginSuccess = adminLoginResponse.status === 200 && adminToken;
    console.log(`   Status: ${adminLoginResponse.status}`);
    console.log(`   ${adminLoginSuccess ? '✅ PASS' : '❌ FAIL'} - Admin login successful`);
    addResult('Login - Admin User', adminLoginSuccess);

    // Test 4: Login with invalid credentials
    console.log('\n4️⃣  Testing Login - Invalid Credentials');
    const invalidLoginResponse = await makeRequest('POST', '/api/v1/auth/login', {
      nic: '199978901234',
      password: 'WrongPassword'
    });
    
    const invalidLoginCorrect = invalidLoginResponse.status === 401;
    console.log(`   Status: ${invalidLoginResponse.status}`);
    console.log(`   ${invalidLoginCorrect ? '✅ PASS' : '❌ FAIL'} - Invalid credentials rejected`);
    addResult('Login - Invalid Credentials', invalidLoginCorrect);

    // Test 5: JWT Token - Verify token is valid
    console.log('\n5️⃣  Testing JWT Token Validation');
    const protectedResponse = await makeRequest('GET', '/api/v1/staff/customers/meta/occupations', null, staffToken);
    const jwtValid = protectedResponse.status === 200;
    console.log(`   Status: ${protectedResponse.status}`);
    console.log(`   ${jwtValid ? '✅ PASS' : '❌ FAIL'} - JWT token is valid`);
    addResult('JWT Token Validation', jwtValid);

    // Test 6: JWT Token - Reject request without token
    console.log('\n6️⃣  Testing JWT - No Token');
    const noTokenResponse = await makeRequest('GET', '/api/v1/staff/customers/meta/occupations', null, null);
    const noTokenRejected = noTokenResponse.status === 401;
    console.log(`   Status: ${noTokenResponse.status}`);
    console.log(`   ${noTokenRejected ? '✅ PASS' : '❌ FAIL'} - Request without token rejected`);
    addResult('JWT - No Token', noTokenRejected);

    // Test 7: JWT Token - Reject invalid token
    console.log('\n7️⃣  Testing JWT - Invalid Token');
    const invalidTokenResponse = await makeRequest('GET', '/api/v1/staff/customers/meta/occupations', null, 'invalid-token-123');
    const invalidTokenRejected = invalidTokenResponse.status === 401;
    console.log(`   Status: ${invalidTokenResponse.status}`);
    console.log(`   ${invalidTokenRejected ? '✅ PASS' : '❌ FAIL'} - Invalid token rejected`);
    addResult('JWT - Invalid Token', invalidTokenRejected);

    // Test 8: Role Detection - Staff can access staff endpoints
    console.log('\n8️⃣  Testing Role Detection - Staff Access');
    const staffAccessResponse = await makeRequest('GET', '/api/v1/staff/customers?page=1&limit=1', null, staffToken);
    const staffCanAccess = staffAccessResponse.status === 200;
    console.log(`   Status: ${staffAccessResponse.status}`);
    console.log(`   ${staffCanAccess ? '✅ PASS' : '❌ FAIL'} - Staff can access staff endpoints`);
    addResult('Role Detection - Staff Access', staffCanAccess);

    // Test 9: Role Detection - Admin can access admin endpoints
    console.log('\n9️⃣  Testing Role Detection - Admin Access');
    const adminAccessResponse = await makeRequest('GET', '/api/v1/admin/branches', null, adminToken);
    const adminCanAccess = adminAccessResponse.status === 200;
    console.log(`   Status: ${adminAccessResponse.status}`);
    console.log(`   ${adminCanAccess ? '✅ PASS' : '❌ FAIL'} - Admin can access admin endpoints`);
    addResult('Role Detection - Admin Access', adminCanAccess);

    // Test 10: Role Detection - Staff cannot access admin endpoints
    console.log('\n🔟  Testing Role Detection - Staff Blocked from Admin');
    const staffBlockedResponse = await makeRequest('GET', '/api/v1/admin/branches', null, staffToken);
    const staffBlocked = staffBlockedResponse.status === 403;
    console.log(`   Status: ${staffBlockedResponse.status}`);
    console.log(`   ${staffBlocked ? '✅ PASS' : '❌ FAIL'} - Staff blocked from admin endpoints`);
    addResult('Role Detection - Staff Blocked', staffBlocked);

    // Test 11: GetMe - Staff user
    console.log('\n1️⃣1️⃣  Testing GetMe - Staff User Profile');
    const staffMeResponse = await makeRequest('GET', '/api/v1/auth/me', null, staffToken);
    const staffMeSuccess = staffMeResponse.status === 200 && staffMeResponse.data.data?.full_name;
    console.log(`   Status: ${staffMeResponse.status}`);
    if (staffMeSuccess) {
      console.log(`   User: ${staffMeResponse.data.data.full_name}`);
      console.log(`   Roles: ${staffMeResponse.data.data.roles.join(', ')}`);
      console.log(`   ${staffMeSuccess ? '✅ PASS' : '❌ FAIL'} - GetMe returns user profile`);
    } else {
      console.log(`   ${staffMeSuccess ? '✅ PASS' : '❌ FAIL'} - GetMe failed`);
    }
    addResult('GetMe - Staff Profile', staffMeSuccess);

    // Test 12: GetMe - Admin user
    console.log('\n1️⃣2️⃣  Testing GetMe - Admin User Profile');
    const adminMeResponse = await makeRequest('GET', '/api/v1/auth/me', null, adminToken);
    const adminMeSuccess = adminMeResponse.status === 200 && adminMeResponse.data.data?.full_name;
    console.log(`   Status: ${adminMeResponse.status}`);
    if (adminMeSuccess) {
      console.log(`   User: ${adminMeResponse.data.data.full_name}`);
      console.log(`   Roles: ${adminMeResponse.data.data.roles.join(', ')}`);
      console.log(`   ${adminMeSuccess ? '✅ PASS' : '❌ FAIL'} - GetMe returns admin profile`);
    } else {
      console.log(`   ${adminMeSuccess ? '✅ PASS' : '❌ FAIL'} - GetMe failed`);
    }
    addResult('GetMe - Admin Profile', adminMeSuccess);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 FEATURE 1 TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`\n✅ Passed: ${results.passed}/${results.tests.length}`);
    console.log(`❌ Failed: ${results.failed}/${results.tests.length}`);
    
    if (results.failed === 0) {
      console.log('\n🎉 Feature 1 – Auth + Role: ALL TESTS PASSED!\n');
    } else {
      console.log('\n⚠️  Some tests failed. Details:');
      results.tests.filter(t => !t.passed).forEach(t => {
        console.log(`   ❌ ${t.name}`);
      });
      console.log('');
    }

    return results.failed === 0;

  } catch (error) {
    console.error('\n❌ Test suite failed with error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Cannot connect to server. Please make sure the backend server is running:');
      console.error('   npm run dev\n');
    }
    return false;
  }
};

// Run the test
testFeature1().then(success => {
  process.exit(success ? 0 : 1);
});
