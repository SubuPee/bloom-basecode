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
  console.log("🚀 STARTING CMS MODULE E2E VERIFICATION TEST");
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

  // 2. GET /api/cms/stats (KPI Cards)
  console.log("\n2. Testing GET /api/cms/stats...");
  try {
    const statsRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/cms/stats",
      method: "GET",
      headers: authHeaders,
    });
    assert(statsRes.status === 200, "GET /api/cms/stats returned 200 OK");
    assert(statsRes.body?.success === true, "Response has success: true");

    const statsData = statsRes.body?.data;
    assert(!!statsData, "Stats data object exists");
    assert(!!statsData?.publishedPages, `Published pages stat: ${statsData?.publishedPages}`);
    assert(!!statsData?.activeCampaigns, `Active campaigns stat: ${statsData?.activeCampaigns}`);
    assert(!!statsData?.reusableSections, `Reusable sections stat: ${statsData?.reusableSections}`);

    assert(Array.isArray(statsData?.stats), "stats is an array");
    assert(statsData?.stats?.length === 3, "Exact 3 KPI summary cards returned");
    assert(Array.isArray(statsData?.statsTuples), "statsTuples is an array for TanStack UI");
  } catch (err) {
    assert(false, `Stats test threw error: ${err.message}`);
  }

  // 3. GET /api/cms (List & Parity)
  console.log("\n3. Testing GET /api/cms (List)...");
  let sampleSlug = "";
  let sampleMongoId = "";
  try {
    const listRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/cms?limit=10",
      method: "GET",
      headers: authHeaders,
    });
    assert(listRes.status === 200, "GET /api/cms returned 200 OK");
    assert(listRes.body?.success === true, "Response success is true");
    assert(Array.isArray(listRes.body?.data), "data is an array of CMS entries");
    assert(listRes.body?.data?.length > 0, "CMS list contains catalog entries");

    const first = listRes.body?.data[0];
    sampleSlug = first.id;
    sampleMongoId = first._id;

    assert(!!first.id, `Entry id (slug) present: ${first.id}`);
    assert(!!first.title, `Entry title present: ${first.title}`);
    assert(!!first.type, `Entry type present: ${first.type}`);
    assert(!!first.status, `Entry status present: ${first.status}`);
    assert(!!first.author, `Entry author present: ${first.author}`);
    assert(!!first.placement, `Entry placement present: ${first.placement}`);
    assert(!!first.summary, `Entry summary present: ${first.summary}`);
    assert(!!first.updated, `Entry updated date string present: ${first.updated}`);

    // Check pagination
    assert(!!listRes.body?.pagination, "Pagination object present");
    assert(listRes.body?.pagination?.totalCount > 0, "totalCount is positive");
  } catch (err) {
    assert(false, `List test threw error: ${err.message}`);
  }

  // 4. GET /api/admin/cms (Dual Admin mount)
  console.log("\n4. Testing GET /api/admin/cms (Admin mount)...");
  try {
    const adminMountRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/admin/cms",
      method: "GET",
      headers: authHeaders,
    });
    assert(adminMountRes.status === 200, "GET /api/admin/cms returned 200 OK");
    assert(Array.isArray(adminMountRes.body?.data), "Admin mount returns data array");
  } catch (err) {
    assert(false, `Admin mount test threw error: ${err.message}`);
  }

  // 5. Search & Filters
  console.log("\n5. Testing search and filter parameters...");
  try {
    // Search
    const searchRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/cms?search=Monsoon",
      method: "GET",
      headers: authHeaders,
    });
    assert(searchRes.status === 200, "Search query returned 200 OK");
    const searchItems = searchRes.body?.data || [];
    assert(
      searchItems.length > 0 && searchItems.some((e) => e.title.includes("Monsoon")),
      "Search returned entry matching 'Monsoon'"
    );

    // Type Filter
    const typeRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/cms?type=Policy%20page",
      method: "GET",
      headers: authHeaders,
    });
    assert(typeRes.status === 200, "Type filter returned 200 OK");
    const typeItems = typeRes.body?.data || [];
    assert(
      typeItems.length > 0 && typeItems.every((e) => e.type === "Policy page"),
      "All returned items match type 'Policy page'"
    );

    // Status Filter
    const statusRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/cms?status=Published",
      method: "GET",
      headers: authHeaders,
    });
    assert(statusRes.status === 200, "Status filter returned 200 OK");
    const statusItems = statusRes.body?.data || [];
    assert(
      statusItems.length > 0 && statusItems.every((e) => e.status === "Published"),
      "All returned items match status 'Published'"
    );
  } catch (err) {
    assert(false, `Filter test threw error: ${err.message}`);
  }

  // 6. GET /api/cms/hero (Storefront Hero Banner)
  console.log("\n6. Testing GET /api/cms/hero (Storefront Live Hero)...");
  try {
    const heroRes = await request({
      hostname: "localhost",
      port: 5000,
      path: "/api/cms/hero",
      method: "GET",
      headers: authHeaders,
    });
    assert(heroRes.status === 200, "GET /api/cms/hero returned 200 OK");
    assert(heroRes.body?.success === true, "Hero response success is true");
    const heroData = heroRes.body?.data;
    assert(!!heroData?.title, `Hero title present: ${heroData?.title}`);
    assert(heroData?.type === "Homepage banner", `Hero type matches: ${heroData?.type}`);
    assert(!!heroData?.heroConfig, "Hero configuration block present");
    assert(!!heroData?.heroConfig?.ctaText, `Hero CTA text: ${heroData?.heroConfig?.ctaText}`);
  } catch (err) {
    assert(false, `Hero test threw error: ${err.message}`);
  }

  // 7. GET /api/cms/:id (Detail view by slug & ObjectId)
  console.log("\n7. Testing GET /api/cms/:id (Detail)...");
  try {
    // By slug (e.g. home-banner)
    const slugToTest = sampleSlug || "home-banner";
    const detailBySlugRes = await request({
      hostname: "localhost",
      port: 5000,
      path: `/api/cms/${slugToTest}`,
      method: "GET",
      headers: authHeaders,
    });
    assert(detailBySlugRes.status === 200, `GET /api/cms/${slugToTest} returned 200 OK`);
    const detailData = detailBySlugRes.body?.data;
    assert(detailData?.id === slugToTest, `Detail ID matches requested slug: ${detailData?.id}`);
    assert(!!detailData?.summary, "Summary present");
    assert(!!detailData?.visibility, `Visibility present: ${detailData?.visibility}`);
    assert(detailData?.version !== undefined, `Version present: ${detailData?.version}`);
    assert(!!detailData?.slug, `Formatted slug link present: ${detailData?.slug}`);
    assert(!!detailData?.created, `Created date present: ${detailData?.created}`);
    assert(!!detailData?.updated, `Updated date present: ${detailData?.updated}`);

    // By ObjectId
    if (sampleMongoId) {
      const detailByIdRes = await request({
        hostname: "localhost",
        port: 5000,
        path: `/api/cms/${sampleMongoId}`,
        method: "GET",
        headers: authHeaders,
      });
      assert(detailByIdRes.status === 200, "Lookup by MongoDB ObjectId returned 200 OK");
    }
  } catch (err) {
    assert(false, `Detail test threw error: ${err.message}`);
  }

  // 8. POST /api/cms (Create new content)
  console.log("\n8. Testing POST /api/cms (Create)...");
  let createdEntrySlug = "";
  try {
    const testEntryPayload = {
      title: "Diwali Gift Guide 2026",
      type: "Editorial page",
      status: "Draft",
      author: "Alex Morgan",
      placement: "Discover · Featured",
      summary: "Curated gift bundles for the upcoming Diwali celebration.",
      body: "Comprehensive gift guide highlighting artisanal home fragrances, luxury handcrafted lamps, and celebratory apparel.",
    };

    const createRes = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/cms",
        method: "POST",
        headers: authHeaders,
      },
      testEntryPayload
    );

    assert(createRes.status === 201, "POST /api/cms returned 201 Created");
    assert(createRes.body?.success === true, "Create response has success: true");
    const createdData = createRes.body?.data;
    assert(!!createdData?.id, `Created content slug generated: ${createdData?.id}`);
    assert(createdData?.title === testEntryPayload.title, "Created content title matches");
    assert(createdData?.type === "Editorial page", "Created content type matches");
    assert(createdData?.status === "Draft", "Created content status is Draft");
    assert(createdData?.version === 1, "Initial version is 1");

    createdEntrySlug = createdData?.id;
  } catch (err) {
    assert(false, `Create CMS test threw error: ${err.message}`);
  }

  // 9. PUT /api/cms/:id (Update content)
  console.log("\n9. Testing PUT /api/cms/:id (Update)...");
  try {
    if (createdEntrySlug) {
      const updateRes = await request(
        {
          hostname: "localhost",
          port: 5000,
          path: `/api/cms/${createdEntrySlug}`,
          method: "PUT",
          headers: authHeaders,
        },
        {
          status: "Published",
          summary: "Updated Diwali gift guide with new festive discounts and bundles.",
        }
      );

      assert(updateRes.status === 200, "PUT /api/cms/:id returned 200 OK");
      assert(updateRes.body?.data?.status === "Published", "Content status updated to Published");
      assert(updateRes.body?.data?.version === 2, "Version incremented to 2");
    } else {
      assert(false, "Skipping update: No createdEntrySlug available");
    }
  } catch (err) {
    assert(false, `Update CMS test threw error: ${err.message}`);
  }

  // 10. DELETE /api/cms/:id (Delete content)
  console.log("\n10. Testing DELETE /api/cms/:id (Delete)...");
  try {
    if (createdEntrySlug) {
      const deleteRes = await request({
        hostname: "localhost",
        port: 5000,
        path: `/api/cms/${createdEntrySlug}`,
        method: "DELETE",
        headers: authHeaders,
      });
      assert(deleteRes.status === 200, "DELETE /api/cms/:id returned 200 OK");
      assert(deleteRes.body?.success === true, "Delete response has success: true");

      // Verify 404 on subsequent get
      const verifyRes = await request({
        hostname: "localhost",
        port: 5000,
        path: `/api/cms/${createdEntrySlug}`,
        method: "GET",
        headers: authHeaders,
      });
      assert(verifyRes.status === 404, "Subsequent GET returned 404 Not Found");
    }
  } catch (err) {
    assert(false, `Delete test threw error: ${err.message}`);
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
