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
  console.log("🚀 STARTING SALES & REVENUE ANALYTICS E2E TEST");
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

  // 2. Testing GET /api/admin/sales/overview
  console.log("\n2. Testing GET /api/admin/sales/overview...");
  try {
    const res = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/admin/sales/overview",
      method: "GET",
      headers: authHeaders,
    });

    assert(res.status === 200, "GET /api/admin/sales/overview returns 200 OK");
    assert(res.body?.success === true, "Overview reports success: true");

    const data = res.body?.data;
    assert(!!data, "Overview payload exists");

    // Stats
    assert(Array.isArray(data?.stats) && data.stats.length === 4, "Contains exactly 4 sales KPI cards");
    const statLabels = (data?.stats || []).map((s) => s.label);
    assert(statLabels.includes("Gross sales"), "Contains 'Gross sales'");
    assert(statLabels.includes("Net revenue"), "Contains 'Net revenue'");
    assert(statLabels.includes("Orders"), "Contains 'Orders'");
    assert(statLabels.includes("Avg. order value"), "Contains 'Avg. order value'");

    // Revenue Overview
    assert(Array.isArray(data?.revenueOverview?.bars), "Contains revenueOverview bars array");
    assert(data.revenueOverview.bars.length > 0, "Revenue bars has data points");
    assert(Array.isArray(data?.revenueOverview?.labels), "Contains revenue overview labels");

    // Channels
    assert(Array.isArray(data?.channels), "Contains channels array");
    assert(data.channels.length >= 3, "Contains at least 3 sales channels");
    const ch0 = data.channels[0];
    assert(!!ch0?.name && !!ch0?.share && !!ch0?.formattedAmount, "Channel has name, share, and formattedAmount");

    // Top Products
    assert(Array.isArray(data?.topProducts), "Contains topProducts array");
    assert(data.topProducts.length > 0, "Top products list has items");
    const p0 = data.topProducts[0];
    assert(!!p0?.name && !!p0?.soldText && !!p0?.formattedRevenue, "Top product has name, soldText, and formattedRevenue");

    // Customer Mix
    assert(!!data?.customerMix?.totalCustomers, "Customer mix has totalCustomers count");
    assert(typeof data?.customerMix?.returning?.percentage === "number", "Customer mix has returning percentage");
    assert(typeof data?.customerMix?.new?.percentage === "number", "Customer mix has new percentage");
  } catch (err) {
    assert(false, `Overview exception: ${err.message}`);
  }

  // 3. Testing GET /api/admin/sales/metrics
  console.log("\n3. Testing GET /api/admin/sales/metrics...");
  try {
    const res = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/admin/sales/metrics?period=this_month",
      method: "GET",
      headers: authHeaders,
    });

    assert(res.status === 200, "GET /api/admin/sales/metrics returns 200 OK");
    assert(res.body?.success === true, "Metrics returns success: true");
    const stats = res.body?.data?.stats;
    assert(Array.isArray(stats) && stats.length === 4, "Metrics returns 4 KPI cards");
  } catch (err) {
    assert(false, `Metrics exception: ${err.message}`);
  }

  // 4. Testing GET /api/admin/sales/chart
  console.log("\n4. Testing GET /api/admin/sales/chart...");
  try {
    const res = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/admin/sales/chart?interval=daily",
      method: "GET",
      headers: authHeaders,
    });

    assert(res.status === 200, "GET /api/admin/sales/chart returns 200 OK");
    assert(res.body?.success === true, "Chart returns success: true");
    const rev = res.body?.data?.revenueOverview;
    assert(Array.isArray(rev?.bars), "Chart returns bars array");
    assert(Array.isArray(rev?.points), "Chart returns points array");
  } catch (err) {
    assert(false, `Chart exception: ${err.message}`);
  }

  // 5. Testing GET /api/admin/sales/channels
  console.log("\n5. Testing GET /api/admin/sales/channels...");
  try {
    const res = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/admin/sales/channels",
      method: "GET",
      headers: authHeaders,
    });

    assert(res.status === 200, "GET /api/admin/sales/channels returns 200 OK");
    assert(res.body?.success === true, "Channels returns success: true");
    assert(Array.isArray(res.body?.data?.channels), "Channels returns channels array");
  } catch (err) {
    assert(false, `Channels exception: ${err.message}`);
  }

  // 6. Testing GET /api/admin/sales/top-products
  console.log("\n6. Testing GET /api/admin/sales/top-products...");
  try {
    const res = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/admin/sales/top-products",
      method: "GET",
      headers: authHeaders,
    });

    assert(res.status === 200, "GET /api/admin/sales/top-products returns 200 OK");
    assert(res.body?.success === true, "Top products returns success: true");
    assert(Array.isArray(res.body?.data?.topProducts), "Top products returns topProducts array");
  } catch (err) {
    assert(false, `Top products exception: ${err.message}`);
  }

  // 7. Testing GET /api/admin/sales/customer-mix
  console.log("\n7. Testing GET /api/admin/sales/customer-mix...");
  try {
    const res = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/admin/sales/customer-mix",
      method: "GET",
      headers: authHeaders,
    });

    assert(res.status === 200, "GET /api/admin/sales/customer-mix returns 200 OK");
    assert(res.body?.success === true, "Customer mix returns success: true");
    assert(!!res.body?.data?.totalCustomers, "Customer mix contains totalCustomers");
  } catch (err) {
    assert(false, `Customer mix exception: ${err.message}`);
  }

  // 8. Testing GET /api/admin/sales/transactions
  console.log("\n8. Testing GET /api/admin/sales/transactions...");
  try {
    const res = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/admin/sales/transactions?page=1&limit=5",
      method: "GET",
      headers: authHeaders,
    });

    assert(res.status === 200, "GET /api/admin/sales/transactions returns 200 OK");
    assert(res.body?.success === true, "Transactions returns success: true");
    assert(Array.isArray(res.body?.data), "Transactions returns data array");
    assert(!!res.body?.pagination, "Transactions includes pagination metadata");
  } catch (err) {
    assert(false, `Transactions exception: ${err.message}`);
  }

  // 9. Testing GET /api/admin/sales/export (CSV & JSON)
  console.log("\n9. Testing GET /api/admin/sales/export...");
  try {
    const resJson = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/admin/sales/export?format=json",
      method: "GET",
      headers: authHeaders,
    });

    assert(resJson.status === 200, "Export format=json returns 200 OK");
    assert(resJson.body?.success === true, "Export JSON reports success: true");

    const resCsv = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/admin/sales/export?format=csv",
      method: "GET",
      headers: authHeaders,
    });

    assert(resCsv.status === 200, "Export format=csv returns 200 OK");
    assert(typeof resCsv.rawBody === "string" && resCsv.rawBody.includes("Transaction ID"), "CSV export contains headers");
  } catch (err) {
    assert(false, `Export exception: ${err.message}`);
  }

  console.log("\n=================================================");
  console.log(`🏁 SALES MODULE E2E RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
