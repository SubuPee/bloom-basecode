import Tax from "../../models/master/tax.model";
import {
  validateCreateTax,
  validateUpdateTax,
  validateObjectId,
} from "../../validations/master/tax.validation";

export interface CreateTaxDto {
  taxCode: string;
  taxName: string;
  taxRate: number;
  taxType: string;
  description?: string;
  status?: "active" | "inactive";
}

export interface UpdateTaxDto {
  taxCode?: string;
  taxName?: string;
  taxRate?: number;
  taxType?: string;
  description?: string;
  status?: "active" | "inactive";
}

export interface GetTaxesQuery {
  page?: number | string;
  limit?: number | string;
  search?: string;
  status?: string;
  taxType?: string;
}

const escapeRegex = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// -----------------------------------------
// Create Tax
// -----------------------------------------
export const createTax = async (data: CreateTaxDto, user?: any) => {
  const validation = validateCreateTax(data);

  if (!validation.isValid) {
    const error: any = new Error("Validation failed");
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }

  const taxCode = data.taxCode.trim().toUpperCase();
  const taxName = data.taxName.trim();
  const taxType = String(data.taxType).trim().toLowerCase();
  const taxRate = Number(data.taxRate);
  const description = data.description?.trim() || "";

  // Duplicate code
  const existingCode = await Tax.findOne({
    taxCode,
  });

  if (existingCode) {
    const error: any = new Error("Tax code already exists");
    error.statusCode = 409;
    throw error;
  }

  // Duplicate name
  const existingName = await Tax.findOne({
    taxName: {
      $regex: `^${escapeRegex(taxName)}$`,
      $options: "i",
    },
  });

  if (existingName) {
    const error: any = new Error("Tax name already exists");
    error.statusCode = 409;
    throw error;
  }

  const tax = await Tax.create({
    taxCode,
    taxName,
    taxRate,
    taxType: taxType as any,
    description,
    status: data.status || "active",
    createdBy: user?._id || null,
  });

  return tax;
};

// -----------------------------------------
// Get Taxes
// -----------------------------------------
export const getTaxes = async (query: GetTaxesQuery = {}) => {
  const { page = 1, limit = 10, search, status, taxType } = query;

  const pageNumber = Math.max(parseInt(String(page), 10) || 1, 1);
  const limitNumber = Math.min(Math.max(parseInt(String(limit), 10) || 10, 1), 100);
  const skip = (pageNumber - 1) * limitNumber;

  const filter: any = {};

  if (search && search.trim()) {
    const searchRegex = new RegExp(escapeRegex(search.trim()), "i");
    filter.$or = [
      { taxCode: searchRegex },
      { taxName: searchRegex },
      { description: searchRegex },
    ];
  }

  if (status) {
    filter.status = status;
  }

  if (taxType) {
    filter.taxType = taxType.toLowerCase();
  }

  const [taxes, total] = await Promise.all([
    Tax.find(filter)
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean(),
    Tax.countDocuments(filter),
  ]);

  return {
    taxes,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

// -----------------------------------------
// Get Tax By ID
// -----------------------------------------
export const getTaxById = async (id: string) => {
  if (!validateObjectId(id)) {
    const error: any = new Error("Invalid tax ID");
    error.statusCode = 400;
    throw error;
  }

  const tax = await Tax.findById(id)
    .populate("createdBy", "firstName lastName email")
    .populate("updatedBy", "firstName lastName email");

  if (!tax) {
    const error: any = new Error("Tax not found");
    error.statusCode = 404;
    throw error;
  }

  return tax;
};

// -----------------------------------------
// Update Tax
// -----------------------------------------
export const updateTax = async (id: string, data: UpdateTaxDto, user?: any) => {
  if (!validateObjectId(id)) {
    const error: any = new Error("Invalid tax ID");
    error.statusCode = 400;
    throw error;
  }

  const validation = validateUpdateTax(data);

  if (!validation.isValid) {
    const error: any = new Error("Validation failed");
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }

  const tax = await Tax.findById(id);

  if (!tax) {
    const error: any = new Error("Tax not found");
    error.statusCode = 404;
    throw error;
  }

  const finalTaxType =
    data.taxType !== undefined
      ? String(data.taxType).trim().toLowerCase()
      : tax.taxType;

  const finalTaxRate =
    data.taxRate !== undefined ? Number(data.taxRate) : tax.taxRate;

  if (finalTaxType === "percentage" && finalTaxRate > 100) {
    const error: any = new Error("Percentage tax rate cannot exceed 100");
    error.statusCode = 400;
    throw error;
  }

  if (data.taxCode !== undefined) {
    const taxCode = data.taxCode.trim().toUpperCase();
    const existingCode = await Tax.findOne({
      taxCode,
      _id: { $ne: id },
    });

    if (existingCode) {
      const error: any = new Error("Tax code already exists");
      error.statusCode = 409;
      throw error;
    }

    tax.taxCode = taxCode;
  }

  if (data.taxName !== undefined) {
    const taxName = data.taxName.trim();
    const existingName = await Tax.findOne({
      taxName: {
        $regex: `^${escapeRegex(taxName)}$`,
        $options: "i",
      },
      _id: { $ne: id },
    });

    if (existingName) {
      const error: any = new Error("Tax name already exists");
      error.statusCode = 409;
      throw error;
    }

    tax.taxName = taxName;
  }

  if (data.taxRate !== undefined) {
    tax.taxRate = finalTaxRate;
  }

  if (data.taxType !== undefined) {
    tax.taxType = finalTaxType as any;
  }

  if (data.description !== undefined) {
    tax.description = data.description.trim();
  }

  if (data.status !== undefined) {
    tax.status = data.status;
  }

  tax.updatedBy = user?._id || null;
  await tax.save();

  return tax;
};

// -----------------------------------------
// Update Tax Status
// -----------------------------------------
export const updateTaxStatus = async (id: string, status: string, user?: any) => {
  if (!validateObjectId(id)) {
    const error: any = new Error("Invalid tax ID");
    error.statusCode = 400;
    throw error;
  }

  if (!["active", "inactive"].includes(status)) {
    const error: any = new Error("Status must be either active or inactive");
    error.statusCode = 400;
    throw error;
  }

  const tax = await Tax.findById(id);

  if (!tax) {
    const error: any = new Error("Tax not found");
    error.statusCode = 404;
    throw error;
  }

  tax.status = status as "active" | "inactive";
  tax.updatedBy = user?._id || null;
  await tax.save();

  return tax;
};

// -----------------------------------------
// Delete Tax
// -----------------------------------------
export const deleteTax = async (id: string) => {
  if (!validateObjectId(id)) {
    const error: any = new Error("Invalid tax ID");
    error.statusCode = 400;
    throw error;
  }

  const tax = await Tax.findById(id);

  if (!tax) {
    const error: any = new Error("Tax not found");
    error.statusCode = 404;
    throw error;
  }

  await Tax.findByIdAndDelete(id);
  return true;
};

export default {
  createTax,
  getTaxes,
  getTaxById,
  updateTax,
  updateTaxStatus,
  deleteTax,
};
