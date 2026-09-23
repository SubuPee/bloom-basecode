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
  console.log("🚀 STARTING MASTER DATA MODULE E2E TEST");
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

  const token = loginRes.body?.data?.token || loginRes.body?.token;
  assert(loginRes.status === 200 && !!token, "Admin login successful (200)");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Helper for requests
  const api = {
    get: (path) =>
      request({
        hostname: "localhost",
        port: 5000,
        path,
        method: "GET",
        headers: authHeaders,
      }),
    post: (path, data) =>
      request(
        {
          hostname: "localhost",
          port: 5000,
          path,
          method: "POST",
          headers: authHeaders,
        },
        data
      ),
    put: (path, data) =>
      request(
        {
          hostname: "localhost",
          port: 5000,
          path,
          method: "PUT",
          headers: authHeaders,
        },
        data
      ),
    patch: (path, data) =>
      request(
        {
          hostname: "localhost",
          port: 5000,
          path,
          method: "PATCH",
          headers: authHeaders,
        },
        data
      ),
    delete: (path) =>
      request({
        hostname: "localhost",
        port: 5000,
        path,
        method: "DELETE",
        headers: authHeaders,
      }),
  };

  const ts = Date.now().toString().slice(-4);

  // 2. Categories Master
  console.log("\n2. Testing Categories Master (/api/admin/master/categories)...");
  const catList = await api.get("/api/admin/master/categories");
  assert(catList.status === 200, "GET /categories returned 200 OK");
  assert(Array.isArray(catList.body?.data), "Categories data is an array");

  const newCat = await api.post("/api/admin/master/categories", {
    categoryCode: `CAT-${ts}`,
    categoryName: `Test Category ${ts}`,
    status: "active",
  });
  assert(newCat.status === 201, `POST /categories created category (201)`);
  const catId = newCat.body?.data?._id;

  if (catId) {
    const catGet = await api.get(`/api/admin/master/categories/${catId}`);
    assert(catGet.status === 200, `GET /categories/${catId} returned 200 OK`);

    const catPatch = await api.patch(`/api/admin/master/categories/${catId}/status`, {
      status: "inactive",
    });
    assert(catPatch.status === 200, `PATCH /categories/${catId}/status returned 200 OK`);

    const catDel = await api.delete(`/api/admin/master/categories/${catId}`);
    assert(catDel.status === 200, `DELETE /categories/${catId} returned 200 OK`);
  }

  // 3. Brands Master
  console.log("\n3. Testing Brands Master (/api/admin/master/brands)...");
  const brandList = await api.get("/api/admin/master/brands");
  assert(brandList.status === 200, "GET /brands returned 200 OK");

  const newBrand = await api.post("/api/admin/master/brands", {
    brandCode: `BRD-${ts}`,
    brandName: `Test Brand ${ts}`,
    status: "active",
  });
  assert(newBrand.status === 201, `POST /brands created brand (201)`);
  const brandId = newBrand.body?.data?._id;

  if (brandId) {
    const brandGet = await api.get(`/api/admin/master/brands/${brandId}`);
    assert(brandGet.status === 200, `GET /brands/${brandId} returned 200 OK`);

    const brandPatch = await api.patch(`/api/admin/master/brands/${brandId}/status`, {
      status: "inactive",
    });
    assert(brandPatch.status === 200, `PATCH /brands/${brandId}/status returned 200 OK`);

    const brandDel = await api.delete(`/api/admin/master/brands/${brandId}`);
    assert(brandDel.status === 200, `DELETE /brands/${brandId} returned 200 OK`);
  }

  // 4. Units Master
  console.log("\n4. Testing Units Master (/api/admin/master/units)...");
  const unitList = await api.get("/api/admin/master/units");
  assert(unitList.status === 200, "GET /units returned 200 OK");

  const newUnit = await api.post("/api/admin/master/units", {
    unitCode: `UNT-${ts}`,
    unitName: `Box ${ts}`,
    symbol: `bx${ts}`,
    unitType: "quantity",
    status: "active",
  });
  assert(newUnit.status === 201, `POST /units created unit (201)`);
  const unitId = newUnit.body?.data?._id;

  if (unitId) {
    const unitPatch = await api.patch(`/api/admin/master/units/${unitId}/status`, {
      status: "inactive",
    });
    assert(unitPatch.status === 200, `PATCH /units/${unitId}/status returned 200 OK`);

    const unitDel = await api.delete(`/api/admin/master/units/${unitId}`);
    assert(unitDel.status === 200, `DELETE /units/${unitId} returned 200 OK`);
  }

  // 5. Taxes Master
  console.log("\n5. Testing Taxes Master (/api/admin/master/taxes)...");
  const taxList = await api.get("/api/admin/master/taxes");
  assert(taxList.status === 200, "GET /taxes returned 200 OK");

  const newTax = await api.post("/api/admin/master/taxes", {
    taxCode: `TAX-${ts}`,
    taxName: `GST Special ${ts}`,
    taxRate: 15,
    taxType: "percentage",
    description: "Special test levy",
    status: "active",
  });
  assert(newTax.status === 201, `POST /taxes created tax (201)`);
  const taxId = newTax.body?.data?._id;

  if (taxId) {
    const taxPatch = await api.patch(`/api/admin/master/taxes/${taxId}/status`, {
      status: "inactive",
    });
    assert(taxPatch.status === 200, `PATCH /taxes/${taxId}/status returned 200 OK`);

    const taxDel = await api.delete(`/api/admin/master/taxes/${taxId}`);
    assert(taxDel.status === 200, `DELETE /taxes/${taxId} returned 200 OK`);
  }

  // 6. Warehouses Master
  console.log("\n6. Testing Warehouses Master (/api/admin/master/warehouses)...");
  const whList = await api.get("/api/admin/master/warehouses");
  assert(whList.status === 200, "GET /warehouses returned 200 OK");

  const newWh = await api.post("/api/admin/master/warehouses", {
    warehouseCode: `WH-${ts}`,
    warehouseName: `Central Hub ${ts}`,
    addressLine1: "Industrial Area Phase 2",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    postalCode: "400001",
    contactPerson: "Rahul Verma",
    contactPhone: "+91 98765 43210",
    status: "active",
  });
  assert(newWh.status === 201, `POST /warehouses created warehouse (201)`);
  const whId = newWh.body?.data?._id;

  if (whId) {
    const whPatch = await api.patch(`/api/admin/master/warehouses/${whId}/status`, {
      status: "inactive",
    });
    assert(whPatch.status === 200, `PATCH /warehouses/${whId}/status returned 200 OK`);

    const whDel = await api.delete(`/api/admin/master/warehouses/${whId}`);
    assert(whDel.status === 200, `DELETE /warehouses/${whId} returned 200 OK`);
  }

  // 7. Attributes Master
  console.log("\n7. Testing Attributes Master (/api/admin/master/attributes)...");
  const attrList = await api.get("/api/admin/master/attributes");
  assert(attrList.status === 200, "GET /attributes returned 200 OK");

  const newAttr = await api.post("/api/admin/master/attributes", {
    attributeCode: `ATT-${ts}`,
    attributeName: `Color Finish ${ts}`,
    displayType: "dropdown",
    values: [
      { value: "Matte Black", isDefault: true },
      { value: "Gloss White", isDefault: false },
    ],
    status: "active",
  });
  assert(newAttr.status === 201, `POST /attributes created attribute (201)`);
  const attrId = newAttr.body?.data?._id;

  if (attrId) {
    const attrPatch = await api.patch(`/api/admin/master/attributes/${attrId}/status`, {
      status: "inactive",
    });
    assert(attrPatch.status === 200, `PATCH /attributes/${attrId}/status returned 200 OK`);

    const attrDel = await api.delete(`/api/admin/master/attributes/${attrId}`);
    assert(attrDel.status === 200, `DELETE /attributes/${attrId} returned 200 OK`);
  }

  // 8. Sub-Categories Master
  console.log("\n8. Testing Sub-Categories Master (/api/admin/master/sub-categories)...");
  const subCatList = await api.get("/api/admin/master/sub-categories");
  assert(subCatList.status === 200, "GET /sub-categories returned 200 OK");

  console.log("\n=================================================");
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
