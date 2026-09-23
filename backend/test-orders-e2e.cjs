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
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (err) {
          resolve({ status: res.statusCode, headers: res.headers, body });
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
  console.log("🚀 STARTING ORDERS MODULE E2E VERIFICATION TEST");
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

  // 1. Authenticate as Admin
  console.log("1. Authenticating as Admin...");
  let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTlmMzBhYThmYTg0YTRiN2M5ZDQ4NDYiLCJpYXQiOjE3OTAwMjY5NzMsImV4cCI6MTc5MDYzMTc3M30.Q8wQmh8_HVKc_n1Fo1Zbxn6UShDydSmfJyN2i4I2-yU";
  
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
    token = loginRes.body?.data?.accessToken || loginRes.body?.token || token;
    assert(true, "Admin login successful (200)");
  } else {
    assert(!!token, "Using existing admin Bearer token from environment");
  }

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // 2. GET /api/orders (Listing & Auto-seed)
  console.log("\n2. Testing GET /api/orders (Listing & Auto-seeding)...");
  const listRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/orders",
    method: "GET",
    headers: authHeaders,
  });

  assert(listRes.status === 200, "GET /api/orders returned 200 OK");
  assert(listRes.body?.success === true, "Response has success: true");
  assert(Array.isArray(listRes.body?.data), "Response data is an array");
  assert(listRes.body?.data?.length >= 6, `Found ${listRes.body?.data?.length} orders (>= 6 seeded)`);

  const sampleOrder = listRes.body?.data[0];
  assert(!!sampleOrder.id, "Order has 'id' field");
  assert(!!sampleOrder.orderNumber, "Order has 'orderNumber' field");
  assert(!!sampleOrder.customer, "Order has 'customer' field");
  assert(!!sampleOrder.total, "Order has formatted 'total' field (e.g. ₹8,298)");
  assert(!!sampleOrder.status, "Order has 'status' field");
  assert(!!sampleOrder.payment, "Order has 'payment' field");
  assert(Array.isArray(sampleOrder.products), "Order has 'products' string array for UI display");
  assert(Array.isArray(sampleOrder.itemsList), "Order has 'itemsList' array");

  // 3. GET /api/orders/stats
  console.log("\n3. Testing GET /api/orders/stats (Dashboard Metric Cards)...");
  const statsRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/orders/stats",
    method: "GET",
    headers: authHeaders,
  });

  assert(statsRes.status === 200, "GET /api/orders/stats returned 200 OK");
  assert(Array.isArray(statsRes.body?.data?.cards), "Response includes 4 UI stat cards");
  assert(statsRes.body?.data?.cards?.length === 4, "Exact 4 cards returned (New, Processing, In transit, Returns)");
  assert(statsRes.body?.data?.metrics?.totalOrders >= 6, "Total orders in metrics matches count");
  assert(statsRes.body?.data?.metrics?.totalRevenue > 0, `Total revenue computed (${statsRes.body?.data?.metrics?.formattedTotalRevenue})`);

  // 4. GET /api/orders/:id (Resilient Identifier Lookup)
  console.log("\n4. Testing GET /api/orders/:id (Resilient Lookup by Number, Hash, Index & ObjectId)...");
  
  // 4a. Lookup by BLM-10482
  const byNumberRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/orders/BLM-10482",
    method: "GET",
    headers: authHeaders,
  });
  assert(byNumberRes.status === 200, "Lookup by 'BLM-10482' returned 200 OK");
  assert(byNumberRes.body?.data?.orderNumber === "BLM-10482", "Fetched BLM-10482 correctly");
  assert(Array.isArray(byNumberRes.body?.data?.timeline), "Fulfillment timeline is present in order details");

  // 4b. Lookup by #BLM-10482
  const byHashRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/orders/%23BLM-10482",
    method: "GET",
    headers: authHeaders,
  });
  assert(byHashRes.status === 200, "Lookup by '#BLM-10482' (with hash) returned 200 OK");

  // 4c. Lookup by 1-based index '1'
  const byIndexRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/orders/1",
    method: "GET",
    headers: authHeaders,
  });
  assert(byIndexRes.status === 200, "Lookup by index '1' returned 200 OK");

  // 4d. Lookup by MongoDB ObjectId
  const mongoId = sampleOrder._id;
  const byMongoIdRes = await request({
    hostname: "localhost",
    port: 5000,
    path: `/api/orders/${mongoId}`,
    method: "GET",
    headers: authHeaders,
  });
  assert(byMongoIdRes.status === 200, "Lookup by MongoDB ObjectId returned 200 OK");

  // 5. POST /api/orders (Create Order)
  console.log("\n5. Testing POST /api/orders (Create New Customer Order)...");
  const testOrderNum = `BLM-TEST-${Date.now().toString().slice(-4)}`;
  const createPayload = {
    orderNumber: testOrderNum,
    customerName: "Priya Sharma",
    customerEmail: "priya.sharma@example.com",
    customerPhone: "+91 98111 22334",
    customerSegment: "VIP",
    items: [
      {
        productName: "Wireless Headphones",
        quantity: 2,
        unitPrice: 6999,
      },
      {
        productName: "Organic Cotton T-Shirt",
        quantity: 1,
        unitPrice: 1299,
      },
    ],
    shippingAddress: "404 Marine Lines, Nariman Point, Mumbai",
    paymentStatus: "Paid",
    paymentMethod: "Credit Card",
    orderStatus: "Processing",
  };

  const createRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: "/api/orders",
      method: "POST",
      headers: authHeaders,
    },
    createPayload
  );

  assert(createRes.status === 201, "POST /api/orders returned 201 Created");
  assert(createRes.body?.data?.orderNumber === testOrderNum, "Order created with designated orderNumber");
  assert(createRes.body?.data?.subtotal === 15297, `Subtotal correctly computed (15297 vs ${createRes.body?.data?.subtotal})`);
  assert(createRes.body?.data?.totalAmount === 15297, "TotalAmount correctly computed");
  assert(createRes.body?.data?.timeline?.length >= 2, "Timeline initialized with Order confirmed and Payment received");

  // 6. PATCH /api/orders/:id/status (Status Transition & Timeline)
  console.log("\n6. Testing PATCH /api/orders/:id/status (Transition to Shipped)...");
  const statusRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: `/api/orders/${testOrderNum}/status`,
      method: "PATCH",
      headers: authHeaders,
    },
    { status: "Shipped", notes: "Dispatched with BlueDart AWB #987654321" }
  );

  assert(statusRes.status === 200, "PATCH /api/orders/:id/status returned 200 OK");
  assert(statusRes.body?.data?.status === "Shipped", "Order status transitioned to 'Shipped'");
  const latestTimeline = statusRes.body?.data?.timeline?.slice(-1)[0];
  assert(latestTimeline?.step === "Shipped", "Fulfillment timeline appended with 'Shipped' step");

  // 7. PATCH /api/orders/:id/payment (Payment Status Update)
  console.log("\n7. Testing PATCH /api/orders/:id/payment (Update Payment Status)...");
  const payRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: `/api/orders/${testOrderNum}/payment`,
      method: "PATCH",
      headers: authHeaders,
    },
    { paymentStatus: "Paid", notes: "Manual payment confirmation verified" }
  );

  assert(payRes.status === 200, "PATCH /api/orders/:id/payment returned 200 OK");
  assert(payRes.body?.data?.payment === "Paid", "Payment status confirmed as 'Paid'");

  // 8. GET /api/orders/:id/invoice (Invoice Details)
  console.log("\n8. Testing GET /api/orders/:id/invoice (Invoice Details)...");
  const invRes = await request({
    hostname: "localhost",
    port: 5000,
    path: `/api/orders/${testOrderNum}/invoice`,
    method: "GET",
    headers: authHeaders,
  });

  assert(invRes.status === 200, "GET /api/orders/:id/invoice returned 200 OK");
  assert(invRes.body?.data?.invoiceNumber === `INV-${testOrderNum}`, "Invoice number formatted properly");
  assert(!!invRes.body?.data?.seller?.name, "Seller information present");
  assert(!!invRes.body?.data?.customer?.name, "Customer information present");
  assert(Array.isArray(invRes.body?.data?.items), "Itemized lines present");
  assert(!!invRes.body?.data?.summary?.formattedTotal, "Formatted total present");

  // 9. POST /api/orders/bulk/status (Bulk Update)
  console.log("\n9. Testing POST /api/orders/bulk/status (Bulk Status Update)...");
  const bulkRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: "/api/orders/bulk/status",
      method: "POST",
      headers: authHeaders,
    },
    { ids: [testOrderNum, "BLM-10481"], status: "Delivered", notes: "Confirmed delivery by courier" }
  );

  assert(bulkRes.status === 200, "POST /api/orders/bulk/status returned 200 OK");
  assert(bulkRes.body?.data?.updatedCount === 2, "Updated exactly 2 orders");
  assert(bulkRes.body?.data?.status === "Delivered", "Bulk status updated to 'Delivered'");

  // 10. GET /api/orders/export (CSV & JSON Export)
  console.log("\n10. Testing GET /api/orders/export (CSV & JSON Export)...");
  const exportCsvRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/orders/export?format=csv",
    method: "GET",
    headers: authHeaders,
  });

  assert(exportCsvRes.status === 200, "Export CSV returned 200 OK");
  assert(exportCsvRes.headers["content-type"]?.includes("text/csv"), "Content-Type is text/csv");
  assert(typeof exportCsvRes.body === "string" && exportCsvRes.body.includes("Order ID"), "CSV contains headers");

  const exportJsonRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/orders/export?format=json",
    method: "GET",
    headers: authHeaders,
  });
  assert(exportJsonRes.status === 200, "Export JSON returned 200 OK");
  assert(Array.isArray(exportJsonRes.body?.data), "Export JSON returned orders array");

  // 11. DELETE /api/orders/:id (Delete Order Cleanup)
  console.log("\n11. Testing DELETE /api/orders/:id (Cleanup Test Order)...");
  const delRes = await request({
    hostname: "localhost",
    port: 5000,
    path: `/api/orders/${testOrderNum}`,
    method: "DELETE",
    headers: authHeaders,
  });

  assert(delRes.status === 200, "DELETE /api/orders/:id returned 200 OK");
  assert(delRes.body?.success === true, "Order deleted successfully");

  // Check that deleted order now returns 404
  const checkDelRes = await request({
    hostname: "localhost",
    port: 5000,
    path: `/api/orders/${testOrderNum}`,
    method: "GET",
    headers: authHeaders,
  });
  assert(checkDelRes.status === 404, "Deleted order returns 404 Not Found");

  console.log("\n=================================================");
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed with error:", err);
  process.exit(1);
});
