const http = require("http");

function request(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const reqOptions = {
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: options.method || "GET",
      headers: { ...(options.headers || {}) },
      timeout: 10000,
    };

    if (data) {
      if (typeof data === "object") {
        data = JSON.stringify(data);
        reqOptions.headers["Content-Type"] = "application/json";
      }
      reqOptions.headers["Content-Length"] = Buffer.byteLength(data);
    }

    const req = http.request(reqOptions, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: body });
        }
      });
    });

    req.on("timeout", () => {
      req.destroy(new Error("Request timed out"));
    });
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log("=== STARTING PRODUCT MODULE E2E TEST ===");
  const BASE_URL = "http://localhost:5000";

  // 1. Login
  console.log("\n1. Logging in as Admin...");
  const loginRes = await request(`${BASE_URL}/api/auth/login`, { method: "POST" }, {
    email: "admin@bloom-ecommerce.com",
    password: "Admin@123456",
  });

  if (loginRes.status !== 200 || !loginRes.data.success) {
    console.error("Login failed:", loginRes.data);
    process.exit(1);
  }
  const token = loginRes.data.data.token;
  console.log("✓ Login successful!");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  // 2. Get Products (triggers auto-seeding if empty)
  console.log("\n2. GET /api/products (testing catalog & stock enrichment)...");
  const listRes = await request(`${BASE_URL}/api/products`, { headers: authHeaders });
  console.log(`Status: ${listRes.status}`);
  console.log(`Success: ${listRes.data.success}, Count: ${listRes.data.data?.length}`);
  if (listRes.status !== 200 || !listRes.data.success || !listRes.data.data?.length) {
    console.error("Failed to fetch products:", listRes.data);
    process.exit(1);
  }
  const firstProd = listRes.data.data[0];
  console.log(`Sample product: ${firstProd.productName} (${firstProd.productCode}), Stock: ${firstProd.stock}`);
  console.log("✓ Products catalog fetched and verified!");

  // 3. Get Stats
  console.log("\n3. GET /api/products/stats...");
  const statsRes = await request(`${BASE_URL}/api/products/stats`, { headers: authHeaders });
  console.log(`Status: ${statsRes.status}`);
  console.log("Stats:", JSON.stringify(statsRes.data.data, null, 2));
  if (statsRes.status !== 200 || !statsRes.data.success) {
    console.error("Failed to fetch stats:", statsRes.data);
    process.exit(1);
  }
  console.log("✓ Stats verified!");

  // 4. Create a Product
  console.log("\n4. POST /api/products (creating test product)...");
  const uniqueCode = `TST-${Date.now().toString().slice(-4)}`;
  const createPayload = {
    productCode: uniqueCode,
    productName: `Test Product ${uniqueCode}`,
    productType: "simple",
    category: firstProd.category?._id || firstProd.category,
    unit: firstProd.unit?._id || firstProd.unit,
    purchasePrice: 1500,
    sellingPrice: 2499,
    mrp: 2999,
    reorderLevel: 5,
    stockQuantity: 50,
    shortDescription: "Automated test item",
    description: "Full description for automated test product verification",
    slug: `test-product-${uniqueCode.toLowerCase()}`,
    status: "active",
    isPublished: true,
    isFeatured: false,
    tags: ["testing", "e2e"],
  };

  const createRes = await request(`${BASE_URL}/api/products`, { method: "POST", headers: authHeaders }, createPayload);
  console.log(`Status: ${createRes.status}`);
  if (createRes.status !== 201 || !createRes.data.success) {
    console.error("Product creation failed:", createRes.data);
    process.exit(1);
  }
  const createdId = createRes.data.data._id;
  console.log(`✓ Product created successfully! ID: ${createdId}`);

  // 5. Get Product by ID
  console.log(`\n5. GET /api/products/${createdId}...`);
  const getRes = await request(`${BASE_URL}/api/products/${createdId}`, { headers: authHeaders });
  console.log(`Status: ${getRes.status}`);
  console.log(`Retrieved: ${getRes.data.data?.productName}, Stock: ${getRes.data.data?.stock}`);
  if (getRes.status !== 200 || !getRes.data.success) {
    console.error("Get product by ID failed:", getRes.data);
    process.exit(1);
  }
  console.log("✓ Product by ID verified!");

  // 6. Duplicate Product
  console.log(`\n6. POST /api/products/${createdId}/duplicate...`);
  const dupRes = await request(`${BASE_URL}/api/products/${createdId}/duplicate`, { method: "POST", headers: authHeaders });
  console.log(`Status: ${dupRes.status}`);
  if (dupRes.status !== 201 || !dupRes.data.success) {
    console.error("Duplicate product failed:", dupRes.data);
    process.exit(1);
  }
  const dupId = dupRes.data.data._id;
  console.log(`✓ Duplicated product: ${dupRes.data.data?.productName} (${dupRes.data.data?.productCode}), Status: ${dupRes.data.data?.status}`);

  // 7. Update Product Status
  console.log(`\n7. PATCH /api/products/${createdId}/status...`);
  const statusRes = await request(`${BASE_URL}/api/products/${createdId}/status`, { method: "PATCH", headers: authHeaders }, {
    status: "draft",
  });
  console.log(`Status: ${statusRes.status}, New status: ${statusRes.data.data?.status}`);
  if (statusRes.status !== 200 || statusRes.data.data?.status !== "draft") {
    console.error("Update product status failed:", statusRes.data);
    process.exit(1);
  }
  console.log("✓ Product status updated successfully!");

  // 8. Bulk Update Publish
  console.log("\n8. POST /api/products/bulk/publish...");
  const bulkPubRes = await request(`${BASE_URL}/api/products/bulk/publish`, { method: "POST", headers: authHeaders }, {
    ids: [createdId, dupId],
    isPublished: true,
  });
  console.log(`Status: ${bulkPubRes.status}, Modified: ${bulkPubRes.data.data?.modifiedCount}`);
  if (bulkPubRes.status !== 200 || !bulkPubRes.data.success) {
    console.error("Bulk publish failed:", bulkPubRes.data);
    process.exit(1);
  }
  console.log("✓ Bulk publish verified!");

  // 9. Bulk Update Status
  console.log("\n9. POST /api/products/bulk/status...");
  const bulkStatusRes = await request(`${BASE_URL}/api/products/bulk/status`, { method: "POST", headers: authHeaders }, {
    ids: [createdId, dupId],
    status: "active",
  });
  console.log(`Status: ${bulkStatusRes.status}, Modified: ${bulkStatusRes.data.data?.modifiedCount}`);
  if (bulkStatusRes.status !== 200 || !bulkStatusRes.data.success) {
    console.error("Bulk status failed:", bulkStatusRes.data);
    process.exit(1);
  }
  console.log("✓ Bulk status update verified!");

  // 10. Get Product Orders
  console.log(`\n10. GET /api/products/${createdId}/orders...`);
  const ordersRes = await request(`${BASE_URL}/api/products/${createdId}/orders`, { headers: authHeaders });
  console.log(`Status: ${ordersRes.status}, Orders found: ${ordersRes.data.data?.length}`);
  if (ordersRes.status !== 200 || !ordersRes.data.success || !ordersRes.data.data?.length) {
    console.error("Get product orders failed:", ordersRes.data);
    process.exit(1);
  }
  console.log("Sample order:", ordersRes.data.data[0]);
  console.log("✓ Associated product orders verified!");

  // 11. Cleanup (Delete created & duplicated products)
  console.log("\n11. Cleanup test products...");
  const del1 = await request(`${BASE_URL}/api/products/${createdId}`, { method: "DELETE", headers: authHeaders });
  const del2 = await request(`${BASE_URL}/api/products/${dupId}`, { method: "DELETE", headers: authHeaders });
  console.log(`Deleted test items (${del1.status}, ${del2.status})`);
  console.log("✓ Cleanup completed!");

  // =============================================
  // 400-ERROR RESILIENCE VERIFICATIONS
  // =============================================
  console.log("\n=== TESTING 400-ERROR RESILIENCE ===");

  // 12. Create with minimal fields & string numbers (no code, no category, no unit, no mrp)
  console.log("\n12. POST /api/products with minimal fields & string prices...");
  const minRes = await request(`${BASE_URL}/api/products`, { method: "POST", headers: authHeaders }, {
    productName: "Resilient Earbuds",
    sellingPrice: "1499",
  });
  console.log(`Status: ${minRes.status}`);
  if (minRes.status !== 201 || !minRes.data.success) {
    console.error("Minimal product creation failed with 400:", minRes.data);
    process.exit(1);
  }
  const minId = minRes.data.data._id;
  console.log(`✓ Minimal product created with auto-code (${minRes.data.data.productCode}) and default category!`);

  // 13. Create with category and brand passed as string names (not ObjectIds)
  console.log("\n13. POST /api/products with string category & brand names...");
  const nameRes = await request(`${BASE_URL}/api/products`, { method: "POST", headers: authHeaders }, {
    productName: "Aura Noise Cancelling Headphones",
    category: "Electronics",
    brand: "Auralink",
    unit: "Piece",
    sellingPrice: "5999",
    mrp: "7999",
  });
  console.log(`Status: ${nameRes.status}`);
  if (nameRes.status !== 201 || !nameRes.data.success) {
    console.error("Product creation with string names failed with 400:", nameRes.data);
    process.exit(1);
  }
  const nameId = nameRes.data.data._id;
  console.log(`✓ Product created with name-resolved Category and Brand!`);

  // 14. Fetch product by SKU code (e.g. WH-1001) instead of ObjectId
  console.log("\n14. GET /api/products/WH-1001 (by SKU code)...");
  const skuRes = await request(`${BASE_URL}/api/products/WH-1001`, { headers: authHeaders });
  console.log(`Status: ${skuRes.status}, Found: ${skuRes.data.data?.productName}`);
  if (skuRes.status !== 200 || !skuRes.data.success) {
    console.error("Fetch by SKU failed with 400:", skuRes.data);
    process.exit(1);
  }
  console.log("✓ Fetch by SKU succeeded!");

  // 15. Fetch product by 1-based index (e.g. "1")
  console.log("\n15. GET /api/products/1 (by 1-based index)...");
  const indexRes = await request(`${BASE_URL}/api/products/1`, { headers: authHeaders });
  console.log(`Status: ${indexRes.status}, Found: ${indexRes.data.data?.productName}`);
  if (indexRes.status !== 200 || !indexRes.data.success) {
    console.error("Fetch by 1-based index failed with 400:", indexRes.data);
    process.exit(1);
  }
  console.log("✓ Fetch by index succeeded!");

  // 16. Fetch product by slug (e.g. "wireless-headphones")
  console.log("\n16. GET /api/products/wireless-headphones (by slug)...");
  const slugRes = await request(`${BASE_URL}/api/products/wireless-headphones`, { headers: authHeaders });
  console.log(`Status: ${slugRes.status}, Found: ${slugRes.data.data?.productName}`);
  if (slugRes.status !== 200 || !slugRes.data.success) {
    console.error("Fetch by slug failed with 400:", slugRes.data);
    process.exit(1);
  }
  console.log("✓ Fetch by slug succeeded!");

  // 17. Filter with "All" strings from frontend dropdowns
  console.log("\n17. GET /api/products?status=All&category=All&brand=All&productType=All&isPublished=All...");
  const allFilterRes = await request(`${BASE_URL}/api/products?status=All&category=All&brand=All&productType=All&isPublished=All`, { headers: authHeaders });
  console.log(`Status: ${allFilterRes.status}, Results: ${allFilterRes.data.data?.length}`);
  if (allFilterRes.status !== 200 || !allFilterRes.data.success) {
    console.error("Filter with All strings failed with 400:", allFilterRes.data);
    process.exit(1);
  }
  console.log("✓ Query with 'All' filters succeeded!");

  // 18. Cleanup resilience test items
  await request(`${BASE_URL}/api/products/${minId}`, { method: "DELETE", headers: authHeaders });
  await request(`${BASE_URL}/api/products/${nameId}`, { method: "DELETE", headers: authHeaders });
  console.log("✓ Cleaned up resilience test items!");

  console.log("\n=============================================");
  console.log("🎉 ALL PRODUCT MODULE & RESILIENCE TESTS PASSED!");
  console.log("=============================================\n");
}

runTests().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
