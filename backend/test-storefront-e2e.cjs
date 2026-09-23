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
  console.log("🚀 STARTING STOREFRONT MODULE E2E VERIFICATION TEST");
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
      token =
        loginRes.body?.data?.accessToken ||
        loginRes.body?.accessToken ||
        loginRes.body?.data?.token ||
        loginRes.body?.token;
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

  // 2. GET /api/storefront (Complete Live Preview Bundle)
  console.log("\n2. Testing GET /api/storefront (Complete Preview Bundle)...");
  let firstProductId = "";
  try {
    const previewRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/storefront",
      method: "GET",
      headers: authHeaders,
    });

    assert(previewRes.status === 200, "GET /api/storefront returned 200 OK");
    assert(previewRes.body?.success === true, "Response has success: true");

    const data = previewRes.body?.data;
    assert(!!data, "Preview data object exists");

    // Store Info
    assert(data.store?.domain === "bloom.store", `Store domain verified: ${data.store?.domain}`);
    assert(!!data.store?.liveUrl, `Store liveUrl present: ${data.store?.liveUrl}`);
    assert(!!data.store?.description, `Store description present: ${data.store?.description}`);

    // Hero Section
    assert(!!data.hero, "Hero section present");
    assert(!!data.hero?.title, `Hero title: ${data.hero?.title}`);
    assert(!!data.hero?.type, `Hero type: ${data.hero?.type}`);
    assert(!!data.hero?.summary, `Hero summary present: ${data.hero?.summary}`);
    assert(!!data.hero?.ctaText, `Hero CTA: ${data.hero?.ctaText}`);
    assert(!!data.hero?.ctaLink, `Hero CTA link: ${data.hero?.ctaLink}`);
    assert(!!data.hero?.editLink, `Hero edit link: ${data.hero?.editLink}`);
    assert(!!data.hero?.imageUrl, `Hero image URL: ${data.hero?.imageUrl}`);

    // Highlights
    assert(Array.isArray(data.highlights), "Highlights is an array");
    assert(data.highlights?.length === 3, "Exact 3 trust highlights returned");
    assert(data.highlights[0]?.title === "Free delivery", `Highlight 1: ${data.highlights[0]?.title}`);
    assert(data.highlights[1]?.title === "4.8 average rating", `Highlight 2: ${data.highlights[1]?.title}`);
    assert(data.highlights[2]?.title === "Easy returns", `Highlight 3: ${data.highlights[2]?.title}`);

    // Published Products
    assert(Array.isArray(data.publishedProducts), "publishedProducts is an array");
    assert(data.publishedProducts?.length > 0, `Published products count: ${data.publishedProducts?.length}`);
    assert(data.totalPublishedCount > 0, `totalPublishedCount: ${data.totalPublishedCount}`);

    const sample = data.publishedProducts[0];
    firstProductId = sample.id || sample._id;

    assert(!!sample.name, `Sample product name: ${sample.name}`);
    assert(!!sample.category, `Sample product category: ${sample.category}`);
    assert(sample.sellingPrice > 0, `Sample product price: ${sample.sellingPrice}`);
    assert(typeof sample.sellingPriceFormatted === "string" && sample.sellingPriceFormatted.startsWith("₹"), `Formatted price: ${sample.sellingPriceFormatted}`);
    assert(typeof sample.mrpFormatted === "string" && sample.mrpFormatted.startsWith("₹"), `Formatted MRP: ${sample.mrpFormatted}`);
    assert(typeof sample.hasDiscount === "boolean", `hasDiscount boolean: ${sample.hasDiscount}`);
    assert(!!sample.image, `Product image URL present: ${sample.image}`);
    assert(sample.rating === 4.8, `Product rating: ${sample.rating}`);
  } catch (err) {
    assert(false, `Storefront preview test threw error: ${err.message}`);
  }

  // 3. GET /api/admin/storefront (Dual Mount)
  console.log("\n3. Testing GET /api/admin/storefront (Admin Mount)...");
  try {
    const adminMountRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/admin/storefront",
      method: "GET",
      headers: authHeaders,
    });
    assert(adminMountRes.status === 200, "GET /api/admin/storefront returned 200 OK");
    assert(adminMountRes.body?.data?.store?.domain === "bloom.store", "Admin mount domain confirmed");
  } catch (err) {
    assert(false, `Admin mount test threw error: ${err.message}`);
  }

  // 4. GET /api/storefront/hero
  console.log("\n4. Testing GET /api/storefront/hero...");
  try {
    const heroRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/storefront/hero",
      method: "GET",
      headers: authHeaders,
    });
    assert(heroRes.status === 200, "GET /api/storefront/hero returned 200 OK");
    assert(!!heroRes.body?.data?.title, `Storefront hero title: ${heroRes.body?.data?.title}`);
    assert(!!heroRes.body?.data?.imageUrl, "Storefront hero image present");
  } catch (err) {
    assert(false, `Hero test threw error: ${err.message}`);
  }

  // 5. GET /api/storefront/products (Filtered & Catalog)
  console.log("\n5. Testing GET /api/storefront/products...");
  try {
    const productsRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/storefront/products",
      method: "GET",
      headers: authHeaders,
    });
    assert(productsRes.status === 200, "GET /api/storefront/products returned 200 OK");
    assert(Array.isArray(productsRes.body?.data), "Products data is an array");
    assert(productsRes.body?.totalCount > 0, "Products totalCount > 0");

    // Search query
    const searchRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/storefront/products?search=Headphones",
      method: "GET",
      headers: authHeaders,
    });
    assert(searchRes.status === 200, "Product search returned 200 OK");
    const searchItems = searchRes.body?.data || [];
    assert(
      searchItems.length > 0 && searchItems.some((p) => p.name.includes("Headphones")),
      "Search returned product matching 'Headphones'"
    );
  } catch (err) {
    assert(false, `Products test threw error: ${err.message}`);
  }

  // 6. GET /api/storefront/highlights
  console.log("\n6. Testing GET /api/storefront/highlights...");
  try {
    const highlightsRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/storefront/highlights",
      method: "GET",
      headers: authHeaders,
    });
    assert(highlightsRes.status === 200, "GET /api/storefront/highlights returned 200 OK");
    assert(Array.isArray(highlightsRes.body?.data), "Highlights data is an array");
    assert(highlightsRes.body?.data?.length === 3, "3 policy highlights returned");
  } catch (err) {
    assert(false, `Highlights test threw error: ${err.message}`);
  }

  // 7. GET /api/storefront/config
  console.log("\n7. Testing GET /api/storefront/config...");
  try {
    const configRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/storefront/config",
      method: "GET",
      headers: authHeaders,
    });
    assert(configRes.status === 200, "GET /api/storefront/config returned 200 OK");
    assert(configRes.body?.data?.storeDomain === "bloom.store", "Config storeDomain verified");
  } catch (err) {
    assert(false, `Config test threw error: ${err.message}`);
  }

  // 8. PUT /api/storefront/config (Update settings)
  console.log("\n8. Testing PUT /api/storefront/config (Update)...");
  try {
    const updateRes = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/storefront/config",
        method: "PUT",
        headers: authHeaders,
      },
      {
        announcement: {
          enabled: true,
          text: "Special Festive Offer: 20% off with code BLOOM20",
          link: "/storefront",
        },
      }
    );
    assert(updateRes.status === 200, "PUT /api/storefront/config returned 200 OK");
    assert(
      updateRes.body?.data?.announcement?.text === "Special Festive Offer: 20% off with code BLOOM20",
      "Announcement text updated successfully"
    );
  } catch (err) {
    assert(false, `Update config test threw error: ${err.message}`);
  }

  // 9. POST /api/storefront/products/:id/publish (Toggle publication status)
  console.log("\n9. Testing POST /api/storefront/products/:id/publish...");
  try {
    if (firstProductId) {
      // Toggle to false
      const toggleHideRes = await request(
        {
          hostname: "localhost",
          port: 5000,
          path: `/api/storefront/products/${firstProductId}/publish`,
          method: "POST",
          headers: authHeaders,
        },
        { isPublished: false }
      );
      assert(toggleHideRes.status === 200, "Publish toggle to false returned 200 OK");
      assert(toggleHideRes.body?.data?.isPublished === false, "Product isPublished updated to false");

      // Toggle back to true
      const togglePublishRes = await request(
        {
          hostname: "localhost",
          port: 5000,
          path: `/api/storefront/products/${firstProductId}/publish`,
          method: "POST",
          headers: authHeaders,
        },
        { isPublished: true }
      );
      assert(togglePublishRes.status === 200, "Publish toggle to true returned 200 OK");
      assert(togglePublishRes.body?.data?.isPublished === true, "Product isPublished restored to true");
    } else {
      assert(false, "Skipping publish toggle: No product ID available");
    }
  } catch (err) {
    assert(false, `Publish toggle test threw error: ${err.message}`);
  }

  console.log("\n=================================================");
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
