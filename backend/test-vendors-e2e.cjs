const http = require("http");

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const parsed = res.headers["content-type"]?.includes("application/json")
            ? JSON.parse(body)
            : body;
          resolve({ status: res.statusCode, headers: res.headers, body: parsed, rawBody: body });
        } catch (err) {
          resolve({ status: res.statusCode, headers: res.headers, body, rawBody: body });
        }
      });
    });

    req.on("error", reject);

    if (data) {
      if (typeof data === "object") {
        req.write(JSON.stringify(data));
      } else {
        req.write(data);
      }
    }
    req.end();
  });
}

async function runTests() {
  console.log("=================================================");
  console.log("🚀 STARTING VENDOR MODULE E2E VERIFICATION TEST");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Authenticate as Super Admin
  console.log("1. Authenticating as Admin...");
  let token = "";

  try {
    const loginRes = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/auth/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      { email: "admin@bloom-ecommerce.com", password: "Admin@123456" }
    );

    if (loginRes.status === 200) {
      token = loginRes.body?.data?.token || loginRes.body?.token;
      assert(true, "Admin login successful (200)");
    }
    assert(!!token, "JWT token retrieved successfully");
  } catch (err) {
    console.error("Authentication error:", err.message);
  }

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // 2. GET /api/vendors/dashboard-stats
  console.log("\n2. Testing GET /api/vendors/dashboard-stats...");
  try {
    const statsRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/vendors/dashboard-stats",
      method: "GET",
      headers: authHeaders,
    });

    assert(statsRes.status === 200, "GET /api/vendors/dashboard-stats returned 200 OK");
    assert(statsRes.body?.success === true, "Response has success: true");
    assert(typeof statsRes.body?.data?.totalVendors === "number", "totalVendors is a number");
    assert(typeof statsRes.body?.data?.activeVendors === "number", "activeVendors is a number");
  } catch (err) {
    assert(false, `Stats error: ${err.message}`);
  }

  // 3. GET /api/vendors/registrations
  console.log("\n3. Testing GET /api/vendors/registrations...");
  let sampleVendorId = "";
  try {
    const regsRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/vendors/registrations",
      method: "GET",
      headers: authHeaders,
    });

    assert(regsRes.status === 200, "GET /api/vendors/registrations returned 200 OK");
    assert(regsRes.body?.success === true, "Response success is true");
    const vendors = regsRes.body?.data?.vendors || regsRes.body?.data || [];
    assert(Array.isArray(vendors), "Vendors is an array");
    if (vendors.length > 0) {
      sampleVendorId = vendors[0].vendorId || vendors[0].id || vendors[0]._id;
      assert(true, `Found sample vendor: ${sampleVendorId} (${vendors[0].businessName})`);
    }
  } catch (err) {
    assert(false, `Registrations error: ${err.message}`);
  }

  // 4. POST /api/vendors (Registration)
  console.log("\n4. Testing POST /api/vendors (Vendor Registration)...");
  let createdVendorId = "";
  try {
    const testEmail = `testvendor_${Date.now()}@example.com`;
    const regPayload = {
      businessName: "Vertex Craftworks LLC",
      ownerName: "Devon Vance",
      businessType: "Manufacturer",
      email: testEmail,
      phone: "9876500000",
      address: "Plot 42, Industrial Area",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560100",
      commissionRate: 12,
    };

    const createRes = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/vendors",
        method: "POST",
        headers: authHeaders,
      },
      regPayload
    );

    assert(createRes.status === 201, `POST /api/vendors returned 201 Created (got ${createRes.status})`);
    assert(createRes.body?.success === true, "Create response success is true");
    createdVendorId = createRes.body?.data?.vendorId || createRes.body?.data?.id;
    assert(!!createdVendorId, `Created vendor ID: ${createdVendorId}`);
  } catch (err) {
    assert(false, `Vendor registration error: ${err.message}`);
  }

  const targetId = createdVendorId || sampleVendorId;

  // 5. GET /api/vendors/:id
  console.log(`\n5. Testing GET /api/vendors/${targetId}...`);
  try {
    const getRes = await request({
      hostname: "localhost",
      port: 5000,
      path: `/api/vendors/${targetId}`,
      method: "GET",
      headers: authHeaders,
    });

    assert(getRes.status === 200, `GET /api/vendors/${targetId} returned 200 OK`);
    assert(getRes.body?.success === true, "Vendor detail success is true");
    assert(getRes.body?.data?.businessName?.length > 0, "Vendor business name present");
  } catch (err) {
    assert(false, `Vendor detail error: ${err.message}`);
  }

  // 6. PATCH /api/vendors/:id/status
  console.log(`\n6. Testing PATCH /api/vendors/${targetId}/status...`);
  try {
    const statusRes = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: `/api/vendors/${targetId}/status`,
        method: "PATCH",
        headers: authHeaders,
      },
      { status: "Approved", reason: "All initial compliance verified" }
    );

    assert(statusRes.status === 200, "PATCH status returned 200 OK");
    assert(statusRes.body?.data?.status === "Approved", "Vendor status confirmed Approved");
  } catch (err) {
    assert(false, `Status update error: ${err.message}`);
  }

  // 7. PATCH /api/vendors/:id/commission
  console.log(`\n7. Testing PATCH /api/vendors/${targetId}/commission...`);
  try {
    const commRes = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: `/api/vendors/${targetId}/commission`,
        method: "PATCH",
        headers: authHeaders,
      },
      { commissionRate: 15 }
    );

    assert(commRes.status === 200, "PATCH commission returned 200 OK");
    assert(commRes.body?.data?.commissionRate === 15, "Commission updated to 15%");
  } catch (err) {
    assert(false, `Commission update error: ${err.message}`);
  }

  // 8. GET /api/vendors/orders
  console.log("\n8. Testing GET /api/vendors/orders...");
  try {
    const ordersRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/vendors/orders",
      method: "GET",
      headers: authHeaders,
    });

    assert(ordersRes.status === 200, "GET /api/vendors/orders returned 200 OK");
    assert(ordersRes.body?.success === true, "Orders response success is true");
    const orders = ordersRes.body?.data?.orders || ordersRes.body?.data || [];
    assert(Array.isArray(orders), "Orders is an array");
  } catch (err) {
    assert(false, `Orders error: ${err.message}`);
  }

  // 9. GET /api/vendors/settlements
  console.log("\n9. Testing GET /api/vendors/settlements...");
  try {
    const stlRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/vendors/settlements",
      method: "GET",
      headers: authHeaders,
    });

    assert(stlRes.status === 200, "GET /api/vendors/settlements returned 200 OK");
    assert(stlRes.body?.success === true, "Settlements response success is true");
    const settlements = stlRes.body?.data?.settlements || stlRes.body?.data || [];
    assert(Array.isArray(settlements), "Settlements is an array");
  } catch (err) {
    assert(false, `Settlements error: ${err.message}`);
  }

  // 10. GET /api/vendors/returns
  console.log("\n10. Testing GET /api/vendors/returns...");
  try {
    const retRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/vendors/returns",
      method: "GET",
      headers: authHeaders,
    });

    assert(retRes.status === 200, "GET /api/vendors/returns returned 200 OK");
    assert(retRes.body?.success === true, "Returns response success is true");
    const returns = retRes.body?.data?.returns || retRes.body?.data || [];
    assert(Array.isArray(returns), "Returns is an array");
  } catch (err) {
    assert(false, `Returns error: ${err.message}`);
  }

  // 11. GET /api/vendors/transactions
  console.log("\n11. Testing GET /api/vendors/transactions...");
  try {
    const txnRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/vendors/transactions",
      method: "GET",
      headers: authHeaders,
    });

    assert(txnRes.status === 200, "GET /api/vendors/transactions returned 200 OK");
    assert(txnRes.body?.success === true, "Transactions response success is true");
    const txns = txnRes.body?.data?.transactions || txnRes.body?.data || [];
    assert(Array.isArray(txns), "Transactions is an array");
  } catch (err) {
    assert(false, `Transactions error: ${err.message}`);
  }

  // 12. GET /api/vendors/activity-logs
  console.log("\n12. Testing GET /api/vendors/activity-logs...");
  try {
    const logRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/vendors/activity-logs",
      method: "GET",
      headers: authHeaders,
    });

    assert(logRes.status === 200, "GET /api/vendors/activity-logs returned 200 OK");
    assert(logRes.body?.success === true, "Activity logs response success is true");
    const logs = logRes.body?.data?.logs || logRes.body?.data || [];
    assert(Array.isArray(logs), "Activity logs is an array");
  } catch (err) {
    assert(false, `Activity logs error: ${err.message}`);
  }

  console.log("\n=================================================");
  console.log(`🏁 VENDOR TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) process.exit(1);
}

runTests();
