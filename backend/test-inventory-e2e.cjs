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
  console.log("🚀 STARTING INVENTORY MODULE E2E VERIFICATION TEST");
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

  // 2. GET /api/inventory/overview
  console.log("\n2. Testing GET /api/inventory/overview...");
  try {
    const overviewRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/inventory/overview",
      method: "GET",
      headers: authHeaders,
    });

    assert(overviewRes.status === 200, "GET /api/inventory/overview returned 200 OK");
    assert(overviewRes.body?.success === true, "Response has success: true");
    assert(typeof overviewRes.body?.data?.availableStock === "number", "availableStock is a number");
    assert(Array.isArray(overviewRes.body?.data?.recentMovements), "recentMovements is an array");
  } catch (err) {
    assert(false, `Overview error: ${err.message}`);
  }

  // 3. GET /api/inventory/stock
  console.log("\n3. Testing GET /api/inventory/stock...");
  let sampleItem = null;
  try {
    const stockRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/inventory/stock",
      method: "GET",
      headers: authHeaders,
    });

    assert(stockRes.status === 200, "GET /api/inventory/stock returned 200 OK");
    assert(stockRes.body?.success === true, "Stock ledger success is true");
    const items = stockRes.body?.data?.data || stockRes.body?.data || [];
    assert(Array.isArray(items), "Stock items is an array");
    if (items.length > 0) {
      sampleItem = items[0];
      assert(true, `Found sample stock item for SKU: ${sampleItem.variantId}`);
    }
  } catch (err) {
    assert(false, `Stock error: ${err.message}`);
  }

  // 4. GET /api/inventory/low-stock
  console.log("\n4. Testing GET /api/inventory/low-stock...");
  try {
    const lowRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/inventory/low-stock",
      method: "GET",
      headers: authHeaders,
    });

    assert(lowRes.status === 200, "GET /api/inventory/low-stock returned 200 OK");
    assert(lowRes.body?.success === true, "Low stock response success is true");
  } catch (err) {
    assert(false, `Low stock error: ${err.message}`);
  }

  // 5. GET /api/inventory/out-of-stock
  console.log("\n5. Testing GET /api/inventory/out-of-stock...");
  try {
    const outRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/inventory/out-of-stock",
      method: "GET",
      headers: authHeaders,
    });

    assert(outRes.status === 200, "GET /api/inventory/out-of-stock returned 200 OK");
    assert(outRes.body?.success === true, "Out of stock response success is true");
  } catch (err) {
    assert(false, `Out of stock error: ${err.message}`);
  }

  // 6. GET /api/inventory/movements
  console.log("\n6. Testing GET /api/inventory/movements...");
  try {
    const movRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/inventory/movements",
      method: "GET",
      headers: authHeaders,
    });

    assert(movRes.status === 200, "GET /api/inventory/movements returned 200 OK");
    assert(movRes.body?.success === true, "Movements response success is true");
  } catch (err) {
    assert(false, `Movements error: ${err.message}`);
  }

  // 7. GET /api/inventory/history
  console.log("\n7. Testing GET /api/inventory/history...");
  try {
    const histRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/inventory/history",
      method: "GET",
      headers: authHeaders,
    });

    assert(histRes.status === 200, "GET /api/inventory/history returned 200 OK");
    assert(histRes.body?.success === true, "History response success is true");
  } catch (err) {
    assert(false, `History error: ${err.message}`);
  }

  // 8. GET /api/inventory/transfers
  console.log("\n8. Testing GET /api/inventory/transfers...");
  try {
    const trfRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/inventory/transfers",
      method: "GET",
      headers: authHeaders,
    });

    assert(trfRes.status === 200, "GET /api/inventory/transfers returned 200 OK");
    assert(trfRes.body?.success === true, "Transfers response success is true");
  } catch (err) {
    assert(false, `Transfers error: ${err.message}`);
  }

  // 9. GET /api/inventory/stock/adjust
  console.log("\n9. Testing GET /api/inventory/stock/adjust (Adjustment History)...");
  try {
    const adjRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/inventory/stock/adjust",
      method: "GET",
      headers: authHeaders,
    });

    assert(adjRes.status === 200, "GET /api/inventory/stock/adjust returned 200 OK");
    assert(adjRes.body?.success === true, "Adjustment history success is true");
  } catch (err) {
    assert(false, `Adjustment history error: ${err.message}`);
  }

  console.log("\n=================================================");
  console.log(`🏁 INVENTORY TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) process.exit(1);
}

runTests();
