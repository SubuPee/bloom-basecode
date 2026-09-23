import Warehouse from "../../models/master/warehouse.model";
import {
  validateCreateWarehouse,
  validateUpdateWarehouse,
  validateObjectId,
} from "../../validations/master/warehouse.validation";

export interface CreateWarehouseDto {
  warehouseCode: string;
  warehouseName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  contactPerson: string;
  contactPhone: string;
  email?: string;
  status?: "active" | "inactive";
}

export interface UpdateWarehouseDto {
  warehouseCode?: string;
  warehouseName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  contactPerson?: string;
  contactPhone?: string;
  email?: string;
  status?: "active" | "inactive";
}

export interface GetWarehousesQuery {
  page?: number | string;
  limit?: number | string;
  search?: string;
  status?: string;
  city?: string;
  state?: string;
}

const escapeRegex = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// -----------------------------------------
// Create Warehouse
// -----------------------------------------
export const createWarehouse = async (data: CreateWarehouseDto, user?: any) => {
  const validation = validateCreateWarehouse(data);

  if (!validation.isValid) {
    const error: any = new Error("Validation failed");
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }

  const warehouseCode = data.warehouseCode.trim().toUpperCase();
  const warehouseName = data.warehouseName.trim();

  const existingCode = await Warehouse.findOne({
    warehouseCode,
  });

  if (existingCode) {
    const error: any = new Error("Warehouse code already exists");
    error.statusCode = 409;
    throw error;
  }

  const existingName = await Warehouse.findOne({
    warehouseName: {
      $regex: `^${escapeRegex(warehouseName)}$`,
      $options: "i",
    },
  });

  if (existingName) {
    const error: any = new Error("Warehouse name already exists");
    error.statusCode = 409;
    throw error;
  }

  const warehouse = await Warehouse.create({
    warehouseCode,
    warehouseName,
    addressLine1: data.addressLine1.trim(),
    addressLine2: data.addressLine2?.trim() || "",
    city: data.city.trim(),
    state: data.state.trim(),
    country: data.country.trim(),
    postalCode: data.postalCode.trim(),
    contactPerson: data.contactPerson.trim(),
    contactPhone: data.contactPhone.trim(),
    email: data.email?.trim().toLowerCase() || "",
    status: data.status || "active",
    createdBy: user?._id || null,
  });

  return warehouse;
};

// -----------------------------------------
// Get Warehouses
// -----------------------------------------
export const getWarehouses = async (query: GetWarehousesQuery = {}) => {
  const { page = 1, limit = 10, search, status, city, state } = query;

  const pageNumber = Math.max(parseInt(String(page), 10) || 1, 1);
  const limitNumber = Math.min(Math.max(parseInt(String(limit), 10) || 10, 1), 100);
  const skip = (pageNumber - 1) * limitNumber;

  const filter: any = {};

  if (search && search.trim()) {
    const searchRegex = new RegExp(escapeRegex(search.trim()), "i");
    filter.$or = [
      { warehouseCode: searchRegex },
      { warehouseName: searchRegex },
      { city: searchRegex },
      { state: searchRegex },
      { postalCode: searchRegex },
    ];
  }

  if (status) {
    filter.status = status;
  }

  if (city) {
    filter.city = new RegExp(`^${escapeRegex(city.trim())}$`, "i");
  }

  if (state) {
    filter.state = new RegExp(`^${escapeRegex(state.trim())}$`, "i");
  }

  const [warehouses, total] = await Promise.all([
    Warehouse.find(filter)
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean(),
    Warehouse.countDocuments(filter),
  ]);

  return {
    warehouses,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

// -----------------------------------------
// Get Warehouse By ID
// -----------------------------------------
export const getWarehouseById = async (id: string) => {
  if (!validateObjectId(id)) {
    const error: any = new Error("Invalid warehouse ID");
    error.statusCode = 400;
    throw error;
  }

  const warehouse = await Warehouse.findById(id)
    .populate("createdBy", "firstName lastName email")
    .populate("updatedBy", "firstName lastName email");

  if (!warehouse) {
    const error: any = new Error("Warehouse not found");
    error.statusCode = 404;
    throw error;
  }

  return warehouse;
};

// -----------------------------------------
// Update Warehouse
// -----------------------------------------
export const updateWarehouse = async (id: string, data: UpdateWarehouseDto, user?: any) => {
  if (!validateObjectId(id)) {
    const error: any = new Error("Invalid warehouse ID");
    error.statusCode = 400;
    throw error;
  }

  const validation = validateUpdateWarehouse(data);

  if (!validation.isValid) {
    const error: any = new Error("Validation failed");
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }

  const warehouse = await Warehouse.findById(id);

  if (!warehouse) {
    const error: any = new Error("Warehouse not found");
    error.statusCode = 404;
    throw error;
  }

  if (data.warehouseCode !== undefined) {
    const warehouseCode = data.warehouseCode.trim().toUpperCase();
    const existingCode = await Warehouse.findOne({
      warehouseCode,
      _id: { $ne: id },
    });

    if (existingCode) {
      const error: any = new Error("Warehouse code already exists");
      error.statusCode = 409;
      throw error;
    }

    warehouse.warehouseCode = warehouseCode;
  }

  if (data.warehouseName !== undefined) {
    const warehouseName = data.warehouseName.trim();
    const existingName = await Warehouse.findOne({
      warehouseName: {
        $regex: `^${escapeRegex(warehouseName)}$`,
        $options: "i",
      },
      _id: { $ne: id },
    });

    if (existingName) {
      const error: any = new Error("Warehouse name already exists");
      error.statusCode = 409;
      throw error;
    }

    warehouse.warehouseName = warehouseName;
  }

  if (data.addressLine1 !== undefined) {
    warehouse.addressLine1 = data.addressLine1.trim();
  }

  if (data.addressLine2 !== undefined) {
    warehouse.addressLine2 = data.addressLine2.trim();
  }

  if (data.city !== undefined) {
    warehouse.city = data.city.trim();
  }

  if (data.state !== undefined) {
    warehouse.state = data.state.trim();
  }

  if (data.country !== undefined) {
    warehouse.country = data.country.trim();
  }

  if (data.postalCode !== undefined) {
    warehouse.postalCode = data.postalCode.trim();
  }

  if (data.contactPerson !== undefined) {
    warehouse.contactPerson = data.contactPerson.trim();
  }

  if (data.contactPhone !== undefined) {
    warehouse.contactPhone = data.contactPhone.trim();
  }

  if (data.email !== undefined) {
    warehouse.email = data.email.trim().toLowerCase();
  }

  if (data.status !== undefined) {
    warehouse.status = data.status;
  }

  warehouse.updatedBy = user?._id || null;
  await warehouse.save();

  return warehouse;
};

// -----------------------------------------
// Update Warehouse Status
// -----------------------------------------
export const updateWarehouseStatus = async (id: string, status: string, user?: any) => {
  if (!validateObjectId(id)) {
    const error: any = new Error("Invalid warehouse ID");
    error.statusCode = 400;
    throw error;
  }

  if (!["active", "inactive"].includes(status)) {
    const error: any = new Error("Status must be either active or inactive");
    error.statusCode = 400;
    throw error;
  }

  const warehouse = await Warehouse.findById(id);

  if (!warehouse) {
    const error: any = new Error("Warehouse not found");
    error.statusCode = 404;
    throw error;
  }

  warehouse.status = status as "active" | "inactive";
  warehouse.updatedBy = user?._id || null;
  await warehouse.save();

  return warehouse;
};

// -----------------------------------------
// Delete Warehouse
// -----------------------------------------
export const deleteWarehouse = async (id: string) => {
  if (!validateObjectId(id)) {
    const error: any = new Error("Invalid warehouse ID");
    error.statusCode = 400;
    throw error;
  }

  const warehouse = await Warehouse.findById(id);

  if (!warehouse) {
    const error: any = new Error("Warehouse not found");
    error.statusCode = 404;
    throw error;
  }

  await Warehouse.findByIdAndDelete(id);
  return true;
};

export default {
  createWarehouse,
  getWarehouses,
  getWarehouseById,
  updateWarehouse,
  updateWarehouseStatus,
  deleteWarehouse,
};
