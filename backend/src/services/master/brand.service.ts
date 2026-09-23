import Brand from "../../models/master/brand.model";
import {
  validateCreateBrand,
  validateUpdateBrand,
  validateObjectId,
} from "../../validations/master/brand.validation";

export interface CreateBrandDto {
  brandCode: string;
  brandName: string;
  status?: "active" | "inactive";
}

export interface UpdateBrandDto {
  brandCode?: string;
  brandName?: string;
  status?: "active" | "inactive";
}

export interface GetBrandsQuery {
  page?: number | string;
  limit?: number | string;
  search?: string;
  status?: string;
}

const escapeRegex = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// -----------------------------------------
// Create Brand
// -----------------------------------------
export const createBrand = async (data: CreateBrandDto, user?: any) => {
  const { isValid, errors } = validateCreateBrand(data);

  if (!isValid) {
    const error: any = new Error("Validation failed");
    error.statusCode = 400;
    error.errors = errors;
    throw error;
  }

  const brandCode = data.brandCode.trim().toUpperCase();
  const brandName = data.brandName.trim();

  // Check duplicate brand code
  const existingCode = await Brand.findOne({
    brandCode,
  });

  if (existingCode) {
    const error: any = new Error("Brand code already exists");
    error.statusCode = 400;
    throw error;
  }

  // Check duplicate brand name
  const existingName = await Brand.findOne({
    brandName: {
      $regex: `^${escapeRegex(brandName)}$`,
      $options: "i",
    },
  });

  if (existingName) {
    const error: any = new Error("Brand name already exists");
    error.statusCode = 400;
    throw error;
  }

  const brand = await Brand.create({
    brandCode,
    brandName,
    status: data.status || "active",
    createdBy: user?._id || null,
  });

  return brand;
};

// -----------------------------------------
// Get All Brands
// -----------------------------------------
export const getBrands = async (query: GetBrandsQuery = {}) => {
  const page = Math.max(parseInt(String(query.page), 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(String(query.limit), 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const filter: any = {};

  if (query.search) {
    const search = escapeRegex(query.search.trim());
    filter.$or = [
      { brandCode: { $regex: search, $options: "i" } },
      { brandName: { $regex: search, $options: "i" } },
    ];
  }

  if (query.status) {
    if (!["active", "inactive"].includes(query.status)) {
      const error: any = new Error("Invalid status");
      error.statusCode = 400;
      throw error;
    }
    filter.status = query.status;
  }

  const [brands, total] = await Promise.all([
    Brand.find(filter)
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Brand.countDocuments(filter),
  ]);

  return {
    brands,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// -----------------------------------------
// Get Brand By ID
// -----------------------------------------
export const getBrandById = async (id: string) => {
  if (!validateObjectId(id)) {
    const error: any = new Error("Invalid brand ID");
    error.statusCode = 400;
    throw error;
  }

  const brand = await Brand.findById(id)
    .populate("createdBy", "firstName lastName email")
    .populate("updatedBy", "firstName lastName email");

  if (!brand) {
    const error: any = new Error("Brand not found");
    error.statusCode = 404;
    throw error;
  }

  return brand;
};

// -----------------------------------------
// Update Brand
// -----------------------------------------
export const updateBrand = async (id: string, data: UpdateBrandDto, user?: any) => {
  if (!validateObjectId(id)) {
    const error: any = new Error("Invalid brand ID");
    error.statusCode = 400;
    throw error;
  }

  const { isValid, errors } = validateUpdateBrand(data);

  if (!isValid) {
    const error: any = new Error("Validation failed");
    error.statusCode = 400;
    error.errors = errors;
    throw error;
  }

  const brand = await Brand.findById(id);

  if (!brand) {
    const error: any = new Error("Brand not found");
    error.statusCode = 404;
    throw error;
  }

  // Brand Code
  if (data.brandCode !== undefined) {
    const brandCode = data.brandCode.trim().toUpperCase();

    const duplicateCode = await Brand.findOne({
      brandCode,
      _id: { $ne: id },
    });

    if (duplicateCode) {
      const error: any = new Error("Brand code already exists");
      error.statusCode = 400;
      throw error;
    }

    brand.brandCode = brandCode;
  }

  // Brand Name
  if (data.brandName !== undefined) {
    const brandName = data.brandName.trim();

    const duplicateName = await Brand.findOne({
      brandName: {
        $regex: `^${escapeRegex(brandName)}$`,
        $options: "i",
      },
      _id: { $ne: id },
    });

    if (duplicateName) {
      const error: any = new Error("Brand name already exists");
      error.statusCode = 400;
      throw error;
    }

    brand.brandName = brandName;
  }

  if (data.status !== undefined) {
    brand.status = data.status;
  }

  brand.updatedBy = user?._id || null;
  await brand.save();

  return brand;
};

// -----------------------------------------
// Update Brand Status
// -----------------------------------------
export const updateBrandStatus = async (id: string, status: string, user?: any) => {
  if (!validateObjectId(id)) {
    const error: any = new Error("Invalid brand ID");
    error.statusCode = 400;
    throw error;
  }

  if (!["active", "inactive"].includes(status)) {
    const error: any = new Error("Status must be either active or inactive");
    error.statusCode = 400;
    throw error;
  }

  const brand = await Brand.findById(id);

  if (!brand) {
    const error: any = new Error("Brand not found");
    error.statusCode = 404;
    throw error;
  }

  brand.status = status as "active" | "inactive";
  brand.updatedBy = user?._id || null;
  await brand.save();

  return brand;
};

// -----------------------------------------
// Delete Brand
// -----------------------------------------
export const deleteBrand = async (id: string) => {
  if (!validateObjectId(id)) {
    const error: any = new Error("Invalid brand ID");
    error.statusCode = 400;
    throw error;
  }

  const brand = await Brand.findById(id);

  if (!brand) {
    const error: any = new Error("Brand not found");
    error.statusCode = 404;
    throw error;
  }

  await Brand.findByIdAndDelete(id);
  return true;
};

export default {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  updateBrandStatus,
  deleteBrand,
};
