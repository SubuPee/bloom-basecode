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
  console.log("🚀 STARTING PLATFORM & B2C OPERATIONS E2E TEST");
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
      {
        email: "admin@bloom-ecommerce.com",
        password: "Admin@123456",
      }
    );

    if (loginRes.status === 200) {
      token = loginRes.body?.data?.token || loginRes.body?.data?.accessToken || loginRes.body?.token;
      assert(true, "Admin login successful (200)");
      assert(!!token, "JWT token retrieved successfully");
    } else {
      assert(false, `Admin login failed with status ${loginRes.status}`);
    }
  } catch (err) {
    assert(false, `Login exception: ${err.message}`);
  }

  const authHeaders = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // 2. Testing GET /api/platform/overview
  console.log("\n2. Testing GET /api/platform/overview...");
  try {
    const res = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/platform/overview",
      method: "GET",
      headers: authHeaders,
    });

    assert(res.status === 200, "GET /api/platform/overview returns 200 OK");
    assert(res.body?.success === true, "Platform overview reports success: true");
    const data = res.body?.data;
    assert(Array.isArray(data?.kpis) && data.kpis.length === 4, "Overview contains 4 KPI items");
    assert(Array.isArray(data?.recentTransactions), "Overview contains recentTransactions array");
    assert(Array.isArray(data?.activeOffers), "Overview contains activeOffers array");
    assert(Array.isArray(data?.recentReviews), "Overview contains recentReviews array");
    assert(Array.isArray(data?.recentTickets), "Overview contains recentTickets array");
  } catch (err) {
    assert(false, `Overview exception: ${err.message}`);
  }

  // 3. Testing Offers CRUD (/api/platform/offers)
  console.log("\n3. Testing Offers CRUD...");
  let createdOfferId = "";
  try {
    // List offers
    const listRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/platform/offers?tab=All",
      method: "GET",
      headers: authHeaders,
    });
    assert(listRes.status === 200, "GET /api/platform/offers returns 200 OK");
    assert(Array.isArray(listRes.body?.data), "Returns array of offers");

    // Create offer
    const createRes = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/platform/offers",
        method: "POST",
        headers: authHeaders,
      },
      {
        code: `TESTPROMO${Date.now().toString().slice(-4)}`,
        title: "Test Automated Campaign",
        type: "Percent",
        value: "15%",
        minOrder: 500,
        limit: 1000,
        status: "Active",
        audience: "All customers",
      }
    );
    assert(createRes.status === 201, "POST /api/platform/offers returns 201 Created");
    createdOfferId = createRes.body?.data?._id || createRes.body?.data?.id;
    assert(!!createdOfferId, "Created offer has valid ID");

    // Get offer by ID
    const getRes = await request({
      hostname: "localhost",
      port: 5000,
      path: `/api/platform/offers/${createdOfferId}`,
      method: "GET",
      headers: authHeaders,
    });
    assert(getRes.status === 200, "GET /api/platform/offers/:id returns 200 OK");

    // Update offer
    const updateRes = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: `/api/platform/offers/${createdOfferId}`,
        method: "PUT",
        headers: authHeaders,
      },
      {
        title: "Updated Test Campaign",
        status: "Scheduled",
      }
    );
    assert(updateRes.status === 200, "PUT /api/platform/offers/:id returns 200 OK");

    // Delete offer
    const deleteRes = await request({
      hostname: "localhost",
      port: 5000,
      path: `/api/platform/offers/${createdOfferId}`,
      method: "DELETE",
      headers: authHeaders,
    });
    assert(deleteRes.status === 200, "DELETE /api/platform/offers/:id returns 200 OK");
  } catch (err) {
    assert(false, `Offers CRUD exception: ${err.message}`);
  }

  // 4. Testing Payments (/payments/transactions, /payments/payouts, /payments/refunds)
  console.log("\n4. Testing Payments endpoints...");
  try {
    const txnRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/platform/payments/transactions",
      method: "GET",
      headers: authHeaders,
    });
    assert(txnRes.status === 200, "GET /api/platform/payments/transactions returns 200 OK");
    assert(Array.isArray(txnRes.body?.data), "Transactions returns array");

    const poRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/platform/payments/payouts",
      method: "GET",
      headers: authHeaders,
    });
    assert(poRes.status === 200, "GET /api/platform/payments/payouts returns 200 OK");
    assert(Array.isArray(poRes.body?.data), "Payouts returns array");

    const refRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/platform/payments/refunds",
      method: "GET",
      headers: authHeaders,
    });
    assert(refRes.status === 200, "GET /api/platform/payments/refunds returns 200 OK");
    assert(Array.isArray(refRes.body?.data), "Refunds returns array");
  } catch (err) {
    assert(false, `Payments exception: ${err.message}`);
  }

  // 5. Testing Reviews Moderation (/api/platform/reviews)
  console.log("\n5. Testing Reviews endpoints...");
  let createdRevId = "";
  try {
    const listRev = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/platform/reviews",
      method: "GET",
      headers: authHeaders,
    });
    assert(listRev.status === 200, "GET /api/platform/reviews returns 200 OK");
    assert(Array.isArray(listRev.body?.data), "Reviews returns array");

    // Create review
    const createRev = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/platform/reviews",
        method: "POST",
        headers: authHeaders,
      },
      {
        product: "Wireless Headphones Studio Pro",
        customer: "Dev Tester",
        rating: 5,
        text: "Crisp highs and deep lows, extremely comfortable.",
      }
    );
    assert(createRev.status === 201, "POST /api/platform/reviews returns 201 Created");
    createdRevId = createRev.body?.data?._id || createRev.body?.data?.id || createRev.body?.data?.reviewId;

    // Patch status
    const patchRev = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: `/api/platform/reviews/${createdRevId}/status`,
        method: "PATCH",
        headers: authHeaders,
      },
      { status: "Approved" }
    );
    assert(patchRev.status === 200, "PATCH /api/platform/reviews/:id/status returns 200 OK");

    // Delete review
    const delRev = await request({
      hostname: "localhost",
      port: 5000,
      path: `/api/platform/reviews/${createdRevId}`,
      method: "DELETE",
      headers: authHeaders,
    });
    assert(delRev.status === 200, "DELETE /api/platform/reviews/:id returns 200 OK");
  } catch (err) {
    assert(false, `Reviews exception: ${err.message}`);
  }

  // 6. Testing Support Tickets (/api/platform/tickets)
  console.log("\n6. Testing Tickets endpoints...");
  let createdTicketId = "";
  try {
    const listTick = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/platform/tickets",
      method: "GET",
      headers: authHeaders,
    });
    assert(listTick.status === 200, "GET /api/platform/tickets returns 200 OK");
    assert(Array.isArray(listTick.body?.data), "Tickets returns array");

    // Create ticket
    const createTick = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/platform/tickets",
        method: "POST",
        headers: authHeaders,
      },
      {
        customer: "Aarav Sharma",
        subject: "Delivery address correction needed",
        status: "Open",
        priority: "High",
        channel: "Email",
      }
    );
    assert(createTick.status === 201, "POST /api/platform/tickets returns 201 Created");
    createdTicketId = createTick.body?.data?._id || createTick.body?.data?.id || createTick.body?.data?.ticketId;

    // Patch ticket status
    const patchTick = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: `/api/platform/tickets/${createdTicketId}/status`,
        method: "PATCH",
        headers: authHeaders,
      },
      { status: "Resolved" }
    );
    assert(patchTick.status === 200, "PATCH /api/platform/tickets/:id/status returns 200 OK");

    // Delete ticket
    const delTick = await request({
      hostname: "localhost",
      port: 5000,
      path: `/api/platform/tickets/${createdTicketId}`,
      method: "DELETE",
      headers: authHeaders,
    });
    assert(delTick.status === 200, "DELETE /api/platform/tickets/:id returns 200 OK");
  } catch (err) {
    assert(false, `Tickets exception: ${err.message}`);
  }

  // 7. Testing Shipping Zones (/api/platform/shipping-zones)
  console.log("\n7. Testing Shipping Zones endpoints...");
  try {
    const listZones = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/platform/shipping-zones",
      method: "GET",
      headers: authHeaders,
    });
    assert(listZones.status === 200, "GET /api/platform/shipping-zones returns 200 OK");
    assert(Array.isArray(listZones.body?.data), "Shipping zones returns array");

    // Update zones
    const updateZones = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/platform/shipping-zones",
        method: "PUT",
        headers: authHeaders,
      },
      {
        zones: [
          {
            zone: "Metro Tier 1",
            rate: "₹49",
            eta: "1 – 2 days",
            partners: "Delhivery, Blue Dart",
          },
        ],
      }
    );
    assert(updateZones.status === 200, "PUT /api/platform/shipping-zones returns 200 OK");
  } catch (err) {
    assert(false, `Shipping zones exception: ${err.message}`);
  }

  console.log("\n=================================================");
  console.log(`🏁 PLATFORM MODULE E2E RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
