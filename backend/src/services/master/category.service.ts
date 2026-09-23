import mongoose from "mongoose";
import Category, { ICategory } from "../../models/master/category.model";

export interface CreateCategoryDto {
  categoryCode: string;
  categoryName: string;
  parentCategory?: string | null;
  status?: "active" | "inactive";
}

export interface UpdateCategoryDto {
  categoryCode?: string;
  categoryName?: string;
  parentCategory?: string | null;
  status?: "active" | "inactive";
}

export interface GetCategoriesParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  status?: string;
  parentCategory?: string | null;
}

// ---------------------------------------
// Create Category
// ---------------------------------------
export const createCategory = async (data: CreateCategoryDto, userId?: string) => {
  const { categoryCode, categoryName, parentCategory, status } = data;

  // Check duplicate code
  const existingCode = await Category.findOne({
    categoryCode: categoryCode.trim().toUpperCase(),
  });

  if (existingCode) {
    throw new Error("Category code already exists");
  }

  // Check duplicate name
  const existingName = await Category.findOne({
    categoryName: categoryName.trim(),
  });

  if (existingName) {
    throw new Error("Category name already exists");
  }

  // Validate parent
  let parent: ICategory | null = null;

  if (parentCategory) {
    parent = await Category.findById(parentCategory);

    if (!parent) {
      throw new Error("Parent category not found");
    }

    if (parent.status !== "active") {
      throw new Error("Inactive category cannot be selected as parent");
    }
  }

  const category = await Category.create({
    categoryCode: categoryCode.trim().toUpperCase(),
    categoryName: categoryName.trim(),
    parentCategory: parent ? parent._id : null,
    status: status || "active",
    createdBy: userId || null,
    updatedBy: userId || null,
  });

  return Category.findById(category._id)
    .populate("parentCategory", "categoryCode categoryName")
    .populate("createdBy", "firstName lastName email");
};

// ---------------------------------------
// Get Categories
// ---------------------------------------
export const getCategories = async ({
  page = 1,
  limit = 10,
  search = "",
  status,
  parentCategory,
}: GetCategoriesParams = {}) => {
  let pageNum = Number(page);
  let limitNum = Number(limit);

  if (pageNum < 1) pageNum = 1;
  if (limitNum < 1) limitNum = 10;
  if (limitNum > 100) limitNum = 100;

  const skip = (pageNum - 1) * limitNum;
  const filter: any = {};

  // Search
  if (search && search.trim()) {
    filter.$or = [
      { categoryCode: { $regex: search.trim(), $options: "i" } },
      { categoryName: { $regex: search.trim(), $options: "i" } },
    ];
  }

  // Status
  if (status) {
    filter.status = status;
  }

  // Parent
  if (parentCategory === "null") {
    filter.parentCategory = null;
  } else if (parentCategory && mongoose.Types.ObjectId.isValid(parentCategory)) {
    filter.parentCategory = parentCategory;
  }

  const [categories, total] = await Promise.all([
    Category.find(filter)
      .populate("parentCategory", "categoryCode categoryName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Category.countDocuments(filter),
  ]);

  return {
    categories,
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
// Get Single Category
// ---------------------------------------
export const getCategoryById = async (categoryId: string) => {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new Error("Invalid category ID");
  }

  const category = await Category.findById(categoryId)
    .populate("parentCategory", "categoryCode categoryName")
    .populate("createdBy", "firstName lastName email")
    .populate("updatedBy", "firstName lastName email");

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
};

// ---------------------------------------
// Update Category
// ---------------------------------------
export const updateCategory = async (
  categoryId: string,
  data: UpdateCategoryDto,
  userId?: string
) => {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new Error("Invalid category ID");
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new Error("Category not found");
  }

  // Category code
  if (data.categoryCode) {
    const code = data.categoryCode.trim().toUpperCase();
    const duplicateCode = await Category.findOne({
      categoryCode: code,
      _id: { $ne: categoryId },
    });

    if (duplicateCode) {
      throw new Error("Category code already exists");
    }

    category.categoryCode = code;
  }

  // Category name
  if (data.categoryName) {
    const name = data.categoryName.trim();
    const duplicateName = await Category.findOne({
      categoryName: name,
      _id: { $ne: categoryId },
    });

    if (duplicateName) {
      throw new Error("Category name already exists");
    }

    category.categoryName = name;
  }

  // Parent category
  if (data.parentCategory !== undefined) {
    if (data.parentCategory === null || data.parentCategory === "") {
      category.parentCategory = null as any;
    } else {
      if (!mongoose.Types.ObjectId.isValid(data.parentCategory)) {
        throw new Error("Invalid parent category ID");
      }

      if (data.parentCategory.toString() === categoryId.toString()) {
        throw new Error("Category cannot be its own parent");
      }

      const parent = await Category.findById(data.parentCategory);

      if (!parent) {
        throw new Error("Parent category not found");
      }

      if (parent.status !== "active") {
        throw new Error("Inactive category cannot be selected as parent");
      }

      category.parentCategory = parent._id as any;
    }
  }

  // Status
  if (data.status) {
    category.status = data.status;
  }

  category.updatedBy = (userId as any) || null;
  await category.save();

  return Category.findById(category._id)
    .populate("parentCategory", "categoryCode categoryName")
    .populate("updatedBy", "firstName lastName email");
};

// ---------------------------------------
// Update Status
// ---------------------------------------
export const updateCategoryStatus = async (
  categoryId: string,
  status: string,
  userId?: string
) => {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new Error("Invalid category ID");
  }

  if (!["active", "inactive"].includes(status)) {
    throw new Error("Status must be active or inactive");
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new Error("Category not found");
  }

  category.status = status as "active" | "inactive";
  category.updatedBy = (userId as any) || null;

  await category.save();
  return category;
};

// ---------------------------------------
// Delete Category
// ---------------------------------------
export const deleteCategory = async (categoryId: string) => {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new Error("Invalid category ID");
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new Error("Category not found");
  }

  // Check children
  const childCount = await Category.countDocuments({
    parentCategory: categoryId,
  });

  if (childCount > 0) {
    throw new Error("Cannot delete category because it has sub categories");
  }

  await Category.findByIdAndDelete(categoryId);
  return true;
};

export default {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
};
