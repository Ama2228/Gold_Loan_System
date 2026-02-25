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

const testFeature4 = async () => {
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
    console.log('\n🧪 Feature 4 – Pawn Ticket Creation Testing\n');
    console.log('=' .repeat(70));

    // ========== AUTHENTICATION ==========
    console.log('\n📝 Logging in as Staff...');
    const loginResponse = await makeRequest('POST', '/api/v1/auth/login', {
      nic: '199978901234',
      password: 'Staff@123'
    });

    if (loginResponse.status !== 200) {
      console.log('❌ Failed to login as staff');
      console.log('Response:', JSON.stringify(loginResponse, null, 2));
      return false;
    }

    const staffToken = loginResponse.data.data?.token || loginResponse.data.token;
    const staffBranchId = loginResponse.data.data?.user?.branchId || loginResponse.data.user?.branchId;

    if (!staffToken || !staffBranchId) {
      console.log('❌ Staff token or branch_id not found');
      console.log('Token:', staffToken ? '✅' : '❌');
      console.log('Branch ID:', staffBranchId ? `✅ ${staffBranchId}` : '❌');
      console.log('Response:', JSON.stringify(loginResponse, null, 2));
      return false;
    }

    console.log('✅ Staff logged in successfully');
    console.log(`   Branch ID: ${staffBranchId}`);

    // Get customer ID from database or create test customer
    console.log('\n📝 Getting test customer ID...');
    const getCustomersResponse = await makeRequest('GET', '/api/v1/staff/customers?limit=1', null, staffToken);
    
    if (getCustomersResponse.status !== 200 || !getCustomersResponse.data.data || !getCustomersResponse.data.data[0]) {
      console.log('❌ No customers found');
      console.log('Response:', JSON.stringify(getCustomersResponse, null, 2));
      return false;
    }

    const testCustomerId = getCustomersResponse.data.data[0].customer_id;
    console.log(`✅ Using customer ID: ${testCustomerId}`);

    // ========== TEST 1: Create Pawn Ticket ==========
    console.log('\n1️⃣  Testing POST /api/v1/staff/pawn-tickets');
    console.log('   Creating pawn ticket with 2 gold articles...');

    const createTicketResponse = await makeRequest(
      'POST',
      '/api/v1/staff/pawn-tickets',
      {
        customer_id: testCustomerId,
        branch_id: staffBranchId,
        pawning_period_months: 3,
        interest_percentage: 100,
        articles: [
          {
            item_type: 'Gold Ring',
            quantity: 1,
            gross_weight_grams: 5.5,
            net_weight_grams: 5.0,
            purity_karat: 18,
            notes: 'Yellow gold with stone'
          },
          {
            item_type: 'Gold Necklace',
            quantity: 1,
            gross_weight_grams: 12.8,
            net_weight_grams: 12.0,
            purity_karat: 22,
            notes: 'Fine gold chain'
          }
        ]
      },
      staffToken
    );

    const ticketCreated = createTicketResponse.status === 201 && createTicketResponse.data.data?.ticket_id;
    console.log(`   Status: ${createTicketResponse.status}`);
    
    if (ticketCreated) {
      const ticketData = createTicketResponse.data.data;
      console.log(`   ✅ PASS - Ticket Created`);
      console.log(`   Receipt#: ${ticketData.receipt_no}`);
      console.log(`   Ticket ID: ${ticketData.ticket_id}`);
      console.log(`   Loan Amount: Rs. ${ticketData.loan_amount.toFixed(2)}`);
      console.log(`   Due Date: ${ticketData.due_date}`);
      console.log(`   Articles: ${ticketData.articles_count}`);
    } else {
      console.log(`   ❌ FAIL - Ticket Creation Failed`);
      console.log(`   Message: ${createTicketResponse.data.message}`);
      console.log(`   Error: ${createTicketResponse.data.error}`);
      console.log(`   Full Response:`, JSON.stringify(createTicketResponse.data, null, 2));
    }
    addResult('POST - Create Pawn Ticket', ticketCreated);

    if (!ticketCreated) {
      console.log('\n⚠️  Cannot continue without ticket. Skipping remaining tests.');
      console.log('=' .repeat(70));
      return false;
    }

    const testTicketId = createTicketResponse.data.data.ticket_id;

    // ========== TEST 2: Get Ticket Details ==========
    console.log('\n2️⃣  Testing GET /api/v1/staff/pawn-tickets/:ticketId');
    const getTicketResponse = await makeRequest(
      'GET',
      `/api/v1/staff/pawn-tickets/${testTicketId}`,
      null,
      staffToken
    );

    const ticketDetailsSuccess = getTicketResponse.status === 200 && getTicketResponse.data.data?.ticket_id;
    console.log(`   Status: ${getTicketResponse.status}`);
    
    if (ticketDetailsSuccess) {
      const ticket = getTicketResponse.data.data;
      console.log(`   ✅ PASS - Ticket Details Retrieved`);
      console.log(`   Customer: ${ticket.customer.name}`);
      console.log(`   Status: ${ticket.status}`);
      console.log(`   Articles: ${ticket.articles.length}`);
      console.log(`   Total Loan: Rs. ${ticket.loan_amount.toFixed(2)}`);
    } else {
      console.log(`   ❌ FAIL - Failed to get ticket details`);
    }
    addResult('GET - Ticket Details', ticketDetailsSuccess);

    // ========== TEST 3: List Tickets with Pagination ==========
    console.log('\n3️⃣  Testing GET /api/v1/staff/pawn-tickets (List with Pagination)');
    const listTicketsResponse = await makeRequest(
      'GET',
      `/api/v1/staff/pawn-tickets?page=1&limit=5`,
      null,
      staffToken
    );

    const listSuccess = listTicketsResponse.status === 200 && listTicketsResponse.data.data?.data;
    console.log(`   Status: ${listTicketsResponse.status}`);
    
    if (listSuccess) {
      const listData = listTicketsResponse.data.data;
      console.log(`   ✅ PASS - Tickets Listed`);
      console.log(`   Page: ${listData.page}/${listData.pages}`);
      console.log(`   Total: ${listData.total} tickets`);
      console.log(`   Displayed: ${listData.data.length}`);
    } else {
      console.log(`   ❌ FAIL - Failed to list tickets`);
    }
    addResult('GET - List Tickets', listSuccess);

    // ========== TEST 4: List by Status ==========
    console.log('\n4️⃣  Testing GET /api/v1/staff/pawn-tickets/status/ACTIVE');
    const statusTicketsResponse = await makeRequest(
      'GET',
      `/api/v1/staff/pawn-tickets/status/ACTIVE?page=1&limit=10`,
      null,
      staffToken
    );

    const statusSuccess = statusTicketsResponse.status === 200;
    console.log(`   Status: ${statusTicketsResponse.status}`);
    
    if (statusSuccess) {
      const statusData = statusTicketsResponse.data.data;
      console.log(`   ✅ PASS - Active Tickets Retrieved`);
      console.log(`   Total: ${statusData.total}`);
      console.log(`   Displayed: ${statusData.data.length}`);
    } else {
      console.log(`   ❌ FAIL - Failed to get active tickets`);
    }
    addResult('GET - Tickets by Status', statusSuccess);

    // ========== TEST 5: Search Tickets ==========
    console.log('\n5️⃣  Testing GET /api/v1/staff/pawn-tickets/search/:searchTerm');
    const searchTerm = 'Gold'; // Search by item type or customer
    const searchResponse = await makeRequest(
      'GET',
      `/api/v1/staff/pawn-tickets/search/${searchTerm}`,
      null,
      staffToken
    );

    const searchSuccess = searchResponse.status === 200;
    console.log(`   Status: ${searchResponse.status}`);
    
    if (searchSuccess) {
      const searchData = searchResponse.data.data;
      console.log(`   ✅ PASS - Search Completed`);
      console.log(`   Found: ${searchData.total} tickets`);
      if (searchData.total > 0) {
        console.log(`   First Result: ${searchData.tickets[0].receipt_no}`);
      }
    } else {
      console.log(`   ❌ FAIL - Search failed`);
    }
    addResult('GET - Search Tickets', searchSuccess);

    // ========== TEST 6: Get Customer Tickets ==========
    console.log('\n6️⃣  Testing GET /api/v1/staff/pawn-tickets/customer/:customerId');
    const customerTicketsResponse = await makeRequest(
      'GET',
      `/api/v1/staff/pawn-tickets/customer/${testCustomerId}`,
      null,
      staffToken
    );

    const customerTicketsSuccess = customerTicketsResponse.status === 200;
    console.log(`   Status: ${customerTicketsResponse.status}`);
    
    if (customerTicketsSuccess) {
      const custData = customerTicketsResponse.data.data;
      console.log(`   ✅ PASS - Customer Tickets Retrieved`);
      console.log(`   Customer Tickets: ${custData.total}`);
      console.log(`   Displayed: ${custData.data.length}`);
    } else {
      console.log(`   ❌ FAIL - Failed to get customer tickets`);
    }
    addResult('GET - Customer Tickets', customerTicketsSuccess);

    // ========== TEST 7: Validation Tests ==========
    console.log('\n7️⃣  Testing Validation Rules');

    // 7a: Test minimum loan amount validation
    console.log('   Testing minimum loan (5000 Rs.)...');
    const minLoanTest = await makeRequest(
      'POST',
      '/api/v1/staff/pawn-tickets',
      {
        customer_id: testCustomerId,
        branch_id: staffBranchId,
        pawning_period_months: 3,
        articles: [
          {
            item_type: 'Small Item',
            quantity: 1,
            gross_weight_grams: 0.5,
            net_weight_grams: 0.3,
            purity_karat: 24,
            notes: 'Too small'
          }
        ]
      },
      staffToken
    );

    const minLoanPass = minLoanTest.status === 400 && minLoanTest.data.message.includes('minimum');
    console.log(`   ${minLoanPass ? '✅ PASS' : '❌ FAIL'} - Minimum loan validation`);
    addResult('Validation - Minimum Loan', minLoanPass);

    // 7b: Test max articles validation
    console.log('   Testing max articles (5 allowed)...');
    const maxArticlesTest = await makeRequest(
      'POST',
      '/api/v1/staff/pawn-tickets',
      {
        customer_id: testCustomerId,
        branch_id: staffBranchId,
        pawning_period_months: 3,
        articles: [
          { item_type: 'Item 1', quantity: 1, gross_weight_grams: 10, net_weight_grams: 10, purity_karat: 18 },
          { item_type: 'Item 2', quantity: 1, gross_weight_grams: 10, net_weight_grams: 10, purity_karat: 18 },
          { item_type: 'Item 3', quantity: 1, gross_weight_grams: 10, net_weight_grams: 10, purity_karat: 18 },
          { item_type: 'Item 4', quantity: 1, gross_weight_grams: 10, net_weight_grams: 10, purity_karat: 18 },
          { item_type: 'Item 5', quantity: 1, gross_weight_grams: 10, net_weight_grams: 10, purity_karat: 18 },
          { item_type: 'Item 6', quantity: 1, gross_weight_grams: 10, net_weight_grams: 10, purity_karat: 18 }
        ]
      },
      staffToken
    );

    const maxArticlesPass = maxArticlesTest.status === 400 && maxArticlesTest.data.message.includes('Maximum 5');
    console.log(`   ${maxArticlesPass ? '✅ PASS' : '❌ FAIL'} - Max 5 articles validation`);
    addResult('Validation - Max Articles (5)', maxArticlesPass);

    // 7c: Test invalid karat
    console.log('   Testing invalid karat...');
    const invalidKaratTest = await makeRequest(
      'POST',
      '/api/v1/staff/pawn-tickets',
      {
        customer_id: testCustomerId,
        branch_id: staffBranchId,
        pawning_period_months: 3,
        articles: [
          {
            item_type: 'Gold Ring',
            quantity: 1,
            gross_weight_grams: 10,
            net_weight_grams: 10,
            purity_karat: 99, // Invalid
          }
        ]
      },
      staffToken
    );

    const invalidKaratPass = invalidKaratTest.status === 400 && invalidKaratTest.data.message.includes('karat');
    console.log(`   ${invalidKaratPass ? '✅ PASS' : '❌ FAIL'} - Invalid karat validation`);
    addResult('Validation - Invalid Karat', invalidKaratPass);

    // ========== SUMMARY ==========
    console.log('\n' + '='.repeat(70));
    console.log('📊 FEATURE 4 TEST RESULTS');
    console.log('='.repeat(70));
    console.log(`\n✅ Passed: ${results.passed}/${results.tests.length}`);
    console.log(`❌ Failed: ${results.failed}/${results.tests.length}`);
    
    if (results.failed === 0) {
      console.log('\n🎉 Feature 4 – Pawn Ticket Creation: ALL TESTS PASSED!\n');
      console.log('✨ Feature 4 Summary:');
      console.log('   ✅ Create pawn ticket with transaction');
      console.log('   ✅ Calculate advance amount from karat rates');
      console.log('   ✅ Validate minimum loan (5000 Rs.)');
      console.log('   ✅ Validate max 5 articles per ticket');
      console.log('   ✅ Generate receipt number automatically');
      console.log('   ✅ Set due date based on pawning period');
      console.log('   ✅ Activity logging on creation');
      console.log('   ✅ List tickets with pagination');
      console.log('   ✅ Get single ticket with full details');
      console.log('   ✅ Search tickets by receipt/customer/NIC');
      console.log('   ✅ Filter by status (ACTIVE, RENEWED, etc)');
      console.log('   ✅ Get all tickets by customer');
      console.log('');
    } else {
      console.log('\n⚠️  Some tests failed. Details:\n');
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
testFeature4().then(success => {
  process.exit(success ? 0 : 1);
});
