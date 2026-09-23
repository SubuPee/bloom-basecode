import { fetchWithAuth, ApiError } from "./api";
import { type MasterKey, type MasterRow } from "./bloom-data";

export interface MasterQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  parentCategory?: string;
  category?: string;
}

const endpointMap: Record<MasterKey, string> = {
  categories: "/api/admin/master/categories",
  "sub-categories": "/api/admin/master/sub-categories",
  brands: "/api/admin/master/brands",
  units: "/api/admin/master/units",
  taxes: "/api/admin/master/taxes",
  warehouses: "/api/admin/master/warehouses",
  attributes: "/api/admin/master/attributes",
};

export function mapToMasterRow(kind: MasterKey, item: any, index: number = 0): MasterRow {
  const id = item._id || item.id || String(index + 1);
  let code = "";
  let name = "";
  let detail = "—";

  switch (kind) {
    case "categories":
      code = item.categoryCode || `CAT-${index + 1}`;
      name = item.categoryName || item.name || "Category";
      detail =
        typeof item.parentCategory === "object"
          ? item.parentCategory?.categoryName || "—"
          : item.parentCategory || "—";
      break;

    case "sub-categories":
      code = item.subCategoryCode || `SUB-${index + 1}`;
      name = item.subCategoryName || item.name || "Sub-Category";
      detail =
        typeof item.category === "object"
          ? item.category?.categoryName || "—"
          : item.category || "—";
      break;

    case "brands":
      code = item.brandCode || `BRD-${index + 1}`;
      name = item.brandName || item.name || "Brand";
      detail = "Brand Partner";
      break;

    case "units":
      code = item.unitCode || `UNT-${index + 1}`;
      name = item.unitName || item.name || "Unit";
      detail = item.symbol
        ? `${item.symbol} · ${item.unitType || "Quantity"}`
        : item.unitType || "Quantity";
      break;

    case "taxes":
      code = item.taxCode || `TAX-${index + 1}`;
      name = item.taxName || item.name || "Tax Rate";
      detail =
        item.taxType === "fixed"
          ? `₹${item.taxRate || 0} fixed`
          : `${item.taxRate !== undefined ? item.taxRate : 18}%`;
      break;

    case "warehouses":
      code = item.warehouseCode || `WH-${index + 1}`;
      name = item.warehouseName || item.name || "Warehouse";
      detail =
        [item.city, item.state].filter(Boolean).join(", ") ||
        item.country ||
        "India";
      break;

    case "attributes":
      code = item.attributeCode || `ATT-${index + 1}`;
      name = item.attributeName || item.name || "Attribute";
      detail = `${item.displayType || "Text"} · ${
        Array.isArray(item.values) ? item.values.length : 0
      } values`;
      break;

    default:
      code = item.code || `MST-${index + 1}`;
      name = item.name || "Item";
      detail = item.detail || "—";
  }

  const rawStatus = (item.status || "active").toLowerCase();
  const status: "Active" | "Inactive" = rawStatus === "inactive" ? "Inactive" : "Active";
  const updated = item.updatedAt
    ? new Date(item.updatedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Recently";

  return {
    id: typeof id === "number" ? id : id,
    code,
    name,
    status,
    detail,
    createdBy: item.createdBy?.name || item.createdBy || "Admin",
    updated,
    ...(item as any),
  };
}

export const masterApi = {
  /**
   * Fetch records for any master resource
   */
  async getItems(
    kind: MasterKey,
    params: MasterQueryParams = {}
  ): Promise<{
    items: MasterRow[];
    raw: any[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> {
    const endpoint = endpointMap[kind] || `/api/admin/master/${kind}`;
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search.trim());
    if (params.status && params.status !== "All") {
      query.set("status", params.status.toLowerCase());
    }

    const queryString = query.toString();
    const url = `${endpoint}${queryString ? `?${queryString}` : ""}`;
    const res = await fetchWithAuth<any>(url);

    let rawList: any[] = [];
    if (Array.isArray(res.data)) {
      rawList = res.data;
    } else if (res.data && typeof res.data === "object") {
      rawList =
        res.data.categories ||
        res.data.subCategories ||
        res.data.brands ||
        res.data.units ||
        res.data.taxes ||
        res.data.warehouses ||
        res.data.attributes ||
        res.data.items ||
        [];
    }

    const mapped = rawList.map((item, idx) => mapToMasterRow(kind, item, idx));

    return {
      items: mapped,
      raw: rawList,
      pagination: res.pagination || {
        total: mapped.length,
        page: params.page || 1,
        limit: params.limit || 50,
        pages: 1,
      },
    };
  },

  /**
   * Get single master item by ID
   */
  async getItemById(kind: MasterKey, id: string): Promise<MasterRow> {
    const endpoint = endpointMap[kind] || `/api/admin/master/${kind}`;
    const res = await fetchWithAuth<any>(`${endpoint}/${encodeURIComponent(id)}`);
    if (!res.data) {
      throw new ApiError("Master record not found", 404);
    }
    return mapToMasterRow(kind, res.data);
  },

  /**
   * Create master record
   */
  async createItem(kind: MasterKey, data: any): Promise<MasterRow> {
    const endpoint = endpointMap[kind] || `/api/admin/master/${kind}`;
    const payload: any = { ...data };

    // Format fields based on resource
    switch (kind) {
      case "categories":
        payload.categoryCode = data.code;
        payload.categoryName = data.name;
        if (data.parentCategory) payload.parentCategory = data.parentCategory;
        break;
      case "sub-categories":
        payload.subCategoryCode = data.code;
        payload.subCategoryName = data.name;
        if (data.category) payload.category = data.category;
        break;
      case "brands":
        payload.brandCode = data.code;
        payload.brandName = data.name;
        break;
      case "units":
        payload.unitCode = data.code;
        payload.unitName = data.name;
        payload.symbol = data.symbol || data.name.slice(0, 3).toLowerCase();
        payload.unitType = data.unitType || "quantity";
        break;
      case "taxes":
        payload.taxCode = data.code;
        payload.taxName = data.name;
        payload.taxRate = Number(data.taxRate || 18);
        payload.taxType = data.taxType || "percentage";
        payload.description = data.description || "";
        break;
      case "warehouses":
        payload.warehouseCode = data.code;
        payload.warehouseName = data.name;
        payload.addressLine1 = data.addressLine1 || "Headquarters Building";
        payload.city = data.city || "Mumbai";
        payload.state = data.state || "Maharashtra";
        payload.country = data.country || "India";
        payload.postalCode = data.postalCode || "400001";
        payload.contactPerson = data.contactPerson || "Warehouse Manager";
        payload.contactPhone = data.contactPhone || "+91 98765 00000";
        break;
      case "attributes":
        payload.attributeCode = data.code;
        payload.attributeName = data.name;
        payload.displayType = data.displayType || "dropdown";
        payload.values = Array.isArray(data.values)
          ? data.values
          : [{ value: "Default", isDefault: true }];
        break;
    }

    if (data.status) {
      payload.status = data.status.toLowerCase();
    } else {
      payload.status = "active";
    }

    const res = await fetchWithAuth<any>(endpoint, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return mapToMasterRow(kind, res.data || res);
  },

  /**
   * Update master record
   */
  async updateItem(kind: MasterKey, id: string, data: any): Promise<MasterRow> {
    const endpoint = endpointMap[kind] || `/api/admin/master/${kind}`;
    const payload: any = { ...data };

    switch (kind) {
      case "categories":
        if (data.code) payload.categoryCode = data.code;
        if (data.name) payload.categoryName = data.name;
        break;
      case "sub-categories":
        if (data.code) payload.subCategoryCode = data.code;
        if (data.name) payload.subCategoryName = data.name;
        break;
      case "brands":
        if (data.code) payload.brandCode = data.code;
        if (data.name) payload.brandName = data.name;
        break;
      case "units":
        if (data.code) payload.unitCode = data.code;
        if (data.name) payload.unitName = data.name;
        break;
      case "taxes":
        if (data.code) payload.taxCode = data.code;
        if (data.name) payload.taxName = data.name;
        if (data.taxRate !== undefined) payload.taxRate = Number(data.taxRate);
        break;
      case "warehouses":
        if (data.code) payload.warehouseCode = data.code;
        if (data.name) payload.warehouseName = data.name;
        break;
      case "attributes":
        if (data.code) payload.attributeCode = data.code;
        if (data.name) payload.attributeName = data.name;
        break;
    }

    if (data.status) {
      payload.status = data.status.toLowerCase();
    }

    const res = await fetchWithAuth<any>(`${endpoint}/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    return mapToMasterRow(kind, res.data || res);
  },

  /**
   * Toggle or update status
   */
  async updateStatus(
    kind: MasterKey,
    id: string,
    status: "active" | "inactive" | "Active" | "Inactive"
  ): Promise<void> {
    const endpoint = endpointMap[kind] || `/api/admin/master/${kind}`;
    await fetchWithAuth(`${endpoint}/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: status.toLowerCase() }),
    });
  },

  /**
   * Delete master record
   */
  async deleteItem(kind: MasterKey, id: string): Promise<void> {
    const endpoint = endpointMap[kind] || `/api/admin/master/${kind}`;
    await fetchWithAuth(`${endpoint}/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};
