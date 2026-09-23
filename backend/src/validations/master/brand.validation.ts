import mongoose from "mongoose";

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// -----------------------------------------
// Create Brand Validation
// -----------------------------------------

export const validateCreateBrand = (data: any = {}): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.brandCode) {
    errors.brandCode = "Brand code is required";
  } else if (
    typeof data.brandCode !== "string" ||
    !data.brandCode.trim()
  ) {
    errors.brandCode = "Brand code must be a valid string";
  }

  if (!data.brandName) {
    errors.brandName = "Brand name is required";
  } else if (
    typeof data.brandName !== "string" ||
    !data.brandName.trim()
  ) {
    errors.brandName = "Brand name must be a valid string";
  }

  if (
    data.status !== undefined &&
    !["active", "inactive"].includes(data.status)
  ) {
    errors.status =
      "Status must be either active or inactive";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// -----------------------------------------
// Update Brand Validation
// -----------------------------------------

export const validateUpdateBrand = (data: any = {}): ValidationResult => {
  const errors: Record<string, string> = {};

  if (
    data.brandCode !== undefined &&
    (
      typeof data.brandCode !== "string" ||
      !data.brandCode.trim()
    )
  ) {
    errors.brandCode = "Brand code must be a valid string";
  }

  if (
    data.brandName !== undefined &&
    (
      typeof data.brandName !== "string" ||
      !data.brandName.trim()
    )
  ) {
    errors.brandName = "Brand name must be a valid string";
  }

  if (
    data.status !== undefined &&
    !["active", "inactive"].includes(data.status)
  ) {
    errors.status =
      "Status must be either active or inactive";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// -----------------------------------------
// Object ID Validation
// -----------------------------------------

export const validateObjectId = (id: any): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

// -----------------------------------------
// Export
// -----------------------------------------

export default {
  validateCreateBrand,
  validateUpdateBrand,
  validateObjectId,
};