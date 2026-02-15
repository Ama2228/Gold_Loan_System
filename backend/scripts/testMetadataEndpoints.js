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

const testMetadataEndpoints = async () => {
  try {
    console.log('🧪 Testing Metadata Endpoints\n');
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

    // Step 2: Test GET /api/v1/staff/customers/meta/occupations
    console.log('\n📝 Step 2: Fetching occupations...');
    const occupationsResponse = await makeRequest('GET', '/api/v1/staff/customers/meta/occupations', null, token);
    
    console.log(`   Status: ${occupationsResponse.status}`);
    if (occupationsResponse.status === 200) {
      console.log('✅ Occupations fetched successfully');
      console.log(`   Total occupations: ${occupationsResponse.data.data.length}`);
      if (occupationsResponse.data.data.length > 0) {
        console.log('   Sample occupations:');
        occupationsResponse.data.data.slice(0, 5).forEach(occ => {
          console.log(`     - ${occ.occupation_name} (ID: ${occ.occupation_id})`);
        });
      }
    } else {
      console.log('❌ Failed to fetch occupations');
      console.log('   Response:', JSON.stringify(occupationsResponse.data, null, 2).split('\n').join('\n   '));
    }

    // Step 3: Test GET /api/v1/staff/customers/meta/cities
    console.log('\n📝 Step 3: Fetching cities...');
    const citiesResponse = await makeRequest('GET', '/api/v1/staff/customers/meta/cities', null, token);
    
    console.log(`   Status: ${citiesResponse.status}`);
    if (citiesResponse.status === 200) {
      console.log('✅ Cities fetched successfully');
      console.log(`   Total cities: ${citiesResponse.data.data.length}`);
      if (citiesResponse.data.data.length > 0) {
        console.log('   Sample cities with districts:');
        citiesResponse.data.data.slice(0, 5).forEach(city => {
          console.log(`     - ${city.city_name} (District: ${city.district_name || 'N/A'})`);
        });
      }
    } else {
      console.log('❌ Failed to fetch cities');
      console.log('   Response:', JSON.stringify(citiesResponse.data, null, 2).split('\n').join('\n   '));
    }

    // Step 4: Test GET /api/v1/staff/customers/meta/districts
    console.log('\n📝 Step 4: Fetching districts...');
    const districtsResponse = await makeRequest('GET', '/api/v1/staff/customers/meta/districts', null, token);
    
    console.log(`   Status: ${districtsResponse.status}`);
    if (districtsResponse.status === 200) {
      console.log('✅ Districts fetched successfully');
      console.log(`   Total districts: ${districtsResponse.data.data.length}`);
      if (districtsResponse.data.data.length > 0) {
        console.log('   Sample districts:');
        districtsResponse.data.data.slice(0, 5).forEach(dist => {
          console.log(`     - ${dist.district_name} (ID: ${dist.district_id})`);
        });
      }
    } else {
      console.log('❌ Failed to fetch districts');
      console.log('   Response:', JSON.stringify(districtsResponse.data, null, 2).split('\n').join('\n   '));
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
testMetadataEndpoints();
