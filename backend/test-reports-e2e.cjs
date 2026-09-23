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
  console.log("🚀 STARTING REPORTS & ANALYTICS MODULE E2E TEST");
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

  // 2. Testing GET /api/reports/overview
  console.log("\n2. Testing GET /api/reports/overview...");
  try {
    const res = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/reports/overview?dateRange=30d",
      method: "GET",
      headers: authHeaders,
    });

    assert(res.status === 200, "GET /api/reports/overview returns 200 OK");
    assert(res.body?.success === true, "Reports overview reports success: true");
    const data = res.body?.data;
    assert(!!data, "Reports overview data payload exists");
  } catch (err) {
    assert(false, `Overview exception: ${err.message}`);
  }

  // 3. Testing GET /api/reports/sales
  console.log("\n3. Testing GET /api/reports/sales...");
  try {
    const res = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/reports/sales?page=1&limit=5",
      method: "GET",
      headers: authHeaders,
    });

    assert(res.status === 200, "GET /api/reports/sales returns 200 OK");
    assert(res.body?.success === true, "Sales report reports success: true");
  } catch (err) {
    assert(false, `Sales report exception: ${err.message}`);
  }

  // 4. Testing GET /api/reports/orders
  console.log("\n4. Testing GET /api/reports/orders...");
  try {
    const res = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/reports/orders?page=1&limit=5",
      method: "GET",
      headers: authHeaders,
    });

    assert(res.status === 200, "GET /api/reports/orders returns 200 OK");
    assert(res.body?.success === true, "Orders report reports success: true");
  } catch (err) {
    assert(false, `Orders report exception: ${err.message}`);
  }

  // 5. Testing GET /api/reports/inventory
  console.log("\n5. Testing GET /api/reports/inventory...");
  try {
    const res = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/reports/inventory?page=1&limit=5",
      method: "GET",
      headers: authHeaders,
    });

    assert(res.status === 200, "GET /api/reports/inventory returns 200 OK");
    assert(res.body?.success === true, "Inventory report reports success: true");
  } catch (err) {
    assert(false, `Inventory report exception: ${err.message}`);
  }

  // 6. Testing GET /api/reports/production
  console.log("\n6. Testing GET /api/reports/production...");
  try {
    const res = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/reports/production?page=1&limit=5",
      method: "GET",
      headers: authHeaders,
    });

    assert(res.status === 200, "GET /api/reports/production returns 200 OK");
    assert(res.body?.success === true, "Production report reports success: true");
  } catch (err) {
    assert(false, `Production report exception: ${err.message}`);
  }

  // 7. Testing GET /api/reports/transactions
  console.log("\n7. Testing GET /api/reports/transactions...");
  try {
    const res = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/reports/transactions?page=1&limit=5",
      method: "GET",
      headers: authHeaders,
    });

    assert(res.status === 200, "GET /api/reports/transactions returns 200 OK");
    assert(res.body?.success === true, "Transactions report reports success: true");
  } catch (err) {
    assert(false, `Transactions report exception: ${err.message}`);
  }

  // 8. Testing GET /api/reports/settlements
  console.log("\n8. Testing GET /api/reports/settlements...");
  try {
    const res = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/reports/settlements?page=1&limit=5",
      method: "GET",
      headers: authHeaders,
    });

    assert(res.status === 200, "GET /api/reports/settlements returns 200 OK");
    assert(res.body?.success === true, "Settlements report reports success: true");
  } catch (err) {
    assert(false, `Settlements report exception: ${err.message}`);
  }

  // 9. Testing GET /api/reports/returns
  console.log("\n9. Testing GET /api/reports/returns...");
  try {
    const res = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/reports/returns?page=1&limit=5",
      method: "GET",
      headers: authHeaders,
    });

    assert(res.status === 200, "GET /api/reports/returns returns 200 OK");
    assert(res.body?.success === true, "Returns report reports success: true");
  } catch (err) {
    assert(false, `Returns report exception: ${err.message}`);
  }

  // 10. Testing GET /api/reports/export (CSV & JSON)
  console.log("\n10. Testing GET /api/reports/export...");
  try {
    const resJson = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/reports/export?category=overview&format=json",
      method: "GET",
      headers: authHeaders,
    });

    assert(resJson.status === 200, "Export format=json returns 200 OK");
    assert(resJson.body?.success === true, "Export JSON reports success: true");

    const resCsv = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/reports/export?category=sales&format=csv",
      method: "GET",
      headers: authHeaders,
    });

    assert(resCsv.status === 200, "Export format=csv returns 200 OK");
    assert(typeof resCsv.rawBody === "string" && resCsv.rawBody.length > 0, "CSV export returned non-empty content");
  } catch (err) {
    assert(false, `Export exception: ${err.message}`);
  }

  console.log("\n=================================================");
  console.log(`🏁 REPORTS MODULE E2E RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
