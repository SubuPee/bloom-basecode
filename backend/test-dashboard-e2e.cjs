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
  console.log("🚀 STARTING EXECUTIVE DASHBOARD MODULE E2E TEST");
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

  // 2. Testing GET /api/dashboard/overview
  console.log("\n2. Testing GET /api/dashboard/overview...");
  try {
    const res = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/dashboard/overview",
      method: "GET",
      headers: authHeaders,
    });

    assert(res.status === 200, "GET /api/dashboard/overview returns 200 OK");
    assert(res.body?.success === true, "Response reports success: true");

    const data = res.body?.data;
    assert(!!data, "Overview payload data exists");

    // Stats
    assert(Array.isArray(data?.stats) && data.stats.length === 4, "Contains exactly 4 top KPI stats cards");
    const statLabels = (data?.stats || []).map((s) => s.label);
    assert(statLabels.includes("Total Products"), "KPI includes 'Total Products'");
    assert(statLabels.includes("Active Categories"), "KPI includes 'Active Categories'");
    assert(statLabels.includes("Low Stock Alerts"), "KPI includes 'Low Stock Alerts'");
    assert(statLabels.includes("Total Warehouses"), "KPI includes 'Total Warehouses'");

    // Products By Category
    assert(Array.isArray(data?.productsByCategory), "Contains productsByCategory array");
    assert(data.productsByCategory.length > 0, "Products by category has at least 1 category");
    const firstCat = data.productsByCategory[0];
    assert(typeof firstCat?.name === "string" && typeof firstCat?.count === "number", "Category entry has name and count");

    // Status Split
    assert(typeof data?.statusSplit?.total === "number", "Status split contains total products count");
    assert(typeof data?.statusSplit?.active === "number", "Status split contains active count");
    assert(typeof data?.statusSplit?.inactive === "number", "Status split contains inactive count");
    assert(typeof data?.statusSplit?.draft === "number", "Status split contains draft count");

    // Recent Products
    assert(Array.isArray(data?.recentProducts), "Contains recentProducts array");
    assert(data.recentProducts.length > 0, "Recent products array has items");
    const firstProd = data.recentProducts[0];
    assert(!!firstProd.name && !!firstProd.price, "Recent product contains name and formatted price");

    // Orders summary
    assert(typeof data?.ordersSummary?.totalOrders === "number", "Orders summary contains totalOrders count");
    assert(typeof data?.ordersSummary?.awaitingConfirmation === "number", "Orders summary contains awaitingConfirmation count");
  } catch (err) {
    assert(false, `Overview exception: ${err.message}`);
  }

  // 3. Testing GET /api/dashboard/stats
  console.log("\n3. Testing GET /api/dashboard/stats...");
  try {
    const res = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/dashboard/stats",
      method: "GET",
      headers: authHeaders,
    });

    assert(res.status === 200, "GET /api/dashboard/stats returns 200 OK");
    assert(res.body?.success === true, "Stats returns success: true");
    assert(Array.isArray(res.body?.data) && res.body.data.length === 4, "Returns 4 KPI stats cards");
    const s0 = res.body?.data?.[0];
    assert(!!s0?.label && !!s0?.value && s0?.trend !== undefined, "Stats item has label, value, and trend");
  } catch (err) {
    assert(false, `Stats endpoint exception: ${err.message}`);
  }

  // 4. Testing GET /api/dashboard/category-split
  console.log("\n4. Testing GET /api/dashboard/category-split...");
  try {
    const res = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/dashboard/category-split",
      method: "GET",
      headers: authHeaders,
    });

    assert(res.status === 200, "GET /api/dashboard/category-split returns 200 OK");
    assert(res.body?.success === true, "Category split returns success: true");
    assert(Array.isArray(res.body?.data), "Category split returns array of categories");
    if (res.body?.data?.length > 0) {
      const c0 = res.body.data[0];
      assert(!!c0.name && typeof c0.count === "number" && typeof c0.percentage === "number", "Category item has name, count, and percentage");
    }
  } catch (err) {
    assert(false, `Category split endpoint exception: ${err.message}`);
  }

  // 5. Testing GET /api/dashboard/recent-products
  console.log("\n5. Testing GET /api/dashboard/recent-products...");
  try {
    const res = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/dashboard/recent-products?limit=4",
      method: "GET",
      headers: authHeaders,
    });

    assert(res.status === 200, "GET /api/dashboard/recent-products returns 200 OK");
    assert(res.body?.success === true, "Recent products returns success: true");
    assert(Array.isArray(res.body?.data), "Recent products returns array");
    assert(res.body.data.length <= 4, "Respects query limit of 4 items");
    if (res.body?.data?.length > 0) {
      const p0 = res.body.data[0];
      assert(!!p0.name && !!p0.code && !!p0.price, "Product has name, code, and price");
    }
  } catch (err) {
    assert(false, `Recent products endpoint exception: ${err.message}`);
  }

  console.log("\n=================================================");
  console.log(`🏁 DASHBOARD MODULE E2E RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
