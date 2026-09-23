import mongoose from "mongoose";
import SubCategory, { ISubCategory } from "../../models/master/subCategory.model";
import Category from "../../models/master/category.model";

export interface CreateSubCategoryDto {
  subCategoryCode: string;
  subCategoryName: string;
  category: string;
  status?: "active" | "inactive";
}

export interface UpdateSubCategoryDto {
  subCategoryCode?: string;
  subCategoryName?: string;
  category?: string;
  status?: "active" | "inactive";
}

export interface GetSubCategoriesParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  status?: string;
  category?: string;
}

// ---------------------------------------
// Create Sub Category
// ---------------------------------------
export const createSubCategory = async (data: CreateSubCategoryDto, userId?: string) => {
  const { subCategoryCode, subCategoryName, category, status } = data;

  const normalizedCode = subCategoryCode.trim().toUpperCase();
  const normalizedName = subCategoryName.trim();

  // Check duplicate code
  const existingCode = await SubCategory.findOne({
    subCategoryCode: normalizedCode,
  });

  if (existingCode) {
    throw new Error("Sub category code already exists");
  }

  // Check parent category
  const parentCategory = await Category.findById(category);

  if (!parentCategory) {
    throw new Error("Category not found");
  }

  if (parentCategory.status !== "active") {
    throw new Error("Inactive category cannot be selected");
  }

  // Duplicate name inside category
  const existingName = await SubCategory.findOne({
    subCategoryName: normalizedName,
    category,
  });

  if (existingName) {
    throw new Error("Sub category name already exists under this category");
  }

  const subCategory = await SubCategory.create({
    subCategoryCode: normalizedCode,
    subCategoryName: normalizedName,
    category: parentCategory._id,
    status: status || "active",
    createdBy: userId || null,
    updatedBy: userId || null,
  });

  return SubCategory.findById(subCategory._id)
    .populate("category", "categoryCode categoryName status")
    .populate("createdBy", "firstName lastName email");
};

// ---------------------------------------
// Get all Sub Categories
// ---------------------------------------
export const getSubCategories = async ({
  page = 1,
  limit = 10,
  search = "",
  status,
  category,
}: GetSubCategoriesParams = {}) => {
  let pageNum = Number(page);
  let limitNum = Number(limit);

  if (pageNum < 1) pageNum = 1;
  if (limitNum < 1) limitNum = 10;
  if (limitNum > 100) limitNum = 100;

  const skip = (pageNum - 1) * limitNum;
  const filter: any = {};

  if (search && search.trim()) {
    filter.$or = [
      { subCategoryCode: { $regex: search.trim(), $options: "i" } },
      { subCategoryName: { $regex: search.trim(), $options: "i" } },
    ];
  }

  if (status) {
    filter.status = status;
  }

  if (category && mongoose.Types.ObjectId.isValid(category)) {
    filter.category = category;
  }

  const [subCategories, total] = await Promise.all([
    SubCategory.find(filter)
      .populate("category", "categoryCode categoryName status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    SubCategory.countDocuments(filter),
  ]);

  return {
    subCategories,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      hasNextPage: pageNum < Math.ceil(total / limitNum),
      hasPreviousPage: pageNum > 1,
    },
  };
};

// ---------------------------------------
// Get by ID
// ---------------------------------------
export const getSubCategoryById = async (subCategoryId: string) => {
  if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
    throw new Error("Invalid sub category ID");
  }

  const subCategory = await SubCategory.findById(subCategoryId)
    .populate("category", "categoryCode categoryName status")
    .populate("createdBy", "firstName lastName email")
    .populate("updatedBy", "firstName lastName email");

  if (!subCategory) {
    throw new Error("Sub category not found");
  }

  return subCategory;
};

// ---------------------------------------
// Update
// ---------------------------------------
export const updateSubCategory = async (
  subCategoryId: string,
  data: UpdateSubCategoryDto,
  userId?: string
) => {
  if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
    throw new Error("Invalid sub category ID");
  }

  const subCategory = await SubCategory.findById(subCategoryId);

  if (!subCategory) {
    throw new Error("Sub category not found");
  }

  // Code
  if (data.subCategoryCode) {
    const normalizedCode = data.subCategoryCode.trim().toUpperCase();
    const duplicateCode = await SubCategory.findOne({
      subCategoryCode: normalizedCode,
      _id: { $ne: subCategoryId },
    });

    if (duplicateCode) {
      throw new Error("Sub category code already exists");
    }

    subCategory.subCategoryCode = normalizedCode;
  }

  // Category
  let catId: any = subCategory.category;

  if (data.category !== undefined) {
    if (!mongoose.Types.ObjectId.isValid(data.category)) {
      throw new Error("Invalid category ID");
    }

    const parentCategory = await Category.findById(data.category);

    if (!parentCategory) {
      throw new Error("Category not found");
    }

    if (parentCategory.status !== "active") {
      throw new Error("Inactive category cannot be selected");
    }

    subCategory.category = parentCategory._id as any;
    catId = parentCategory._id;
  }

  // Name
  if (data.subCategoryName) {
    const normalizedName = data.subCategoryName.trim();
    const duplicateName = await SubCategory.findOne({
      subCategoryName: normalizedName,
      category: catId,
      _id: { $ne: subCategoryId },
    });

    if (duplicateName) {
      throw new Error("Sub category name already exists under this category");
    }

    subCategory.subCategoryName = normalizedName;
  }

  if (data.status) {
    subCategory.status = data.status;
  }

  subCategory.updatedBy = (userId as any) || null;
  await subCategory.save();

  return SubCategory.findById(subCategory._id)
    .populate("category", "categoryCode categoryName status")
    .populate("updatedBy", "firstName lastName email");
};

// ---------------------------------------
// Update Status
// ---------------------------------------
export const updateSubCategoryStatus = async (
  subCategoryId: string,
  status: string,
  userId?: string
) => {
  if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
    throw new Error("Invalid sub category ID");
  }

  if (!["active", "inactive"].includes(status)) {
    throw new Error("Status must be active or inactive");
  }

  const subCategory = await SubCategory.findById(subCategoryId);

  if (!subCategory) {
    throw new Error("Sub category not found");
  }

  subCategory.status = status as "active" | "inactive";
  subCategory.updatedBy = (userId as any) || null;
  await subCategory.save();

  return SubCategory.findById(subCategory._id).populate(
    "category",
    "categoryCode categoryName status"
  );
};

// ---------------------------------------
// Delete
// ---------------------------------------
export const deleteSubCategory = async (subCategoryId: string) => {
  if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
    throw new Error("Invalid sub category ID");
  }

  const subCategory = await SubCategory.findById(subCategoryId);

  if (!subCategory) {
    throw new Error("Sub category not found");
  }

  await SubCategory.findByIdAndDelete(subCategoryId);
  return true;
};

export default {
  createSubCategory,
  getSubCategories,
  getSubCategoryById,
  updateSubCategory,
  updateSubCategoryStatus,
  deleteSubCategory,
};
