import mongoose from "mongoose";

// ---------------------------------------
// Create validation
// ---------------------------------------

export const validateCreateSubCategory = (data: any = {}): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.subCategoryCode) {
    errors.subCategoryCode =
      "Sub category code is required";
  } else if (
    typeof data.subCategoryCode !== "string"
  ) {
    errors.subCategoryCode =
      "Sub category code must be a string";
  } else if (
    data.subCategoryCode.trim().length < 2
  ) {
    errors.subCategoryCode =
      "Sub category code must be at least 2 characters";
  }

  if (!data.subCategoryName) {
    errors.subCategoryName =
      "Sub category name is required";
  } else if (
    typeof data.subCategoryName !== "string"
  ) {
    errors.subCategoryName =
      "Sub category name must be a string";
  } else if (
    data.subCategoryName.trim().length < 2
  ) {
    errors.subCategoryName =
      "Sub category name must be at least 2 characters";
  }

  if (!data.category) {
    errors.category =
      "Category is required";
  } else if (
    !mongoose.Types.ObjectId.isValid(
      data.category
    )
  ) {
    errors.category =
      "Invalid category ID";
  }

  if (
    data.status &&
    !["active", "inactive"].includes(
      data.status
    )
  ) {
    errors.status =
      "Status must be active or inactive";
  }

  return errors;
};

// ---------------------------------------
// Update validation
// ---------------------------------------

export const validateUpdateSubCategory = (
  data: any = {}
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (
    data.subCategoryCode !== undefined
  ) {
    if (
      typeof data.subCategoryCode !== "string"
    ) {
      errors.subCategoryCode =
        "Sub category code must be a string";
    } else if (
      data.subCategoryCode.trim().length < 2
    ) {
      errors.subCategoryCode =
        "Sub category code must be at least 2 characters";
    }
  }

  if (
    data.subCategoryName !== undefined
  ) {
    if (
      typeof data.subCategoryName !== "string"
    ) {
      errors.subCategoryName =
        "Sub category name must be a string";
    } else if (
      data.subCategoryName.trim().length < 2
    ) {
      errors.subCategoryName =
        "Sub category name must be at least 2 characters";
    }
  }

  if (
    data.category !== undefined
  ) {
    if (
      !mongoose.Types.ObjectId.isValid(
        data.category
      )
    ) {
      errors.category =
        "Invalid category ID";
    }
  }

  if (
    data.status !== undefined &&
    !["active", "inactive"].includes(
      data.status
    )
  ) {
    errors.status =
      "Status must be active or inactive";
  }

  return errors;
};

export default {
  validateCreateSubCategory,
  validateUpdateSubCategory,
};