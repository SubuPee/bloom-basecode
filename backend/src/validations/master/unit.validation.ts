import mongoose from "mongoose";

export const UNIT_TYPES = [
  "quantity",
  "weight",
  "length",
  "volume",
  "area",
];

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateCreateUnit = (data: any = {}): ValidationResult => {
  const errors: Record<string, string> = {};

  // Unit Code
  if (!data.unitCode) {
    errors.unitCode = "Unit code is required";
  } else if (
    typeof data.unitCode !== "string" ||
    !data.unitCode.trim()
  ) {
    errors.unitCode = "Unit code must be a valid string";
  }

  // Unit Name
  if (!data.unitName) {
    errors.unitName = "Unit name is required";
  } else if (
    typeof data.unitName !== "string" ||
    !data.unitName.trim()
  ) {
    errors.unitName = "Unit name must be a valid string";
  }

  // Symbol
  if (!data.symbol) {
    errors.symbol = "Unit symbol is required";
  } else if (
    typeof data.symbol !== "string" ||
    !data.symbol.trim()
  ) {
    errors.symbol = "Unit symbol must be a valid string";
  }

  // Unit Type
  if (!data.unitType) {
    errors.unitType = "Unit type is required";
  } else if (
    !UNIT_TYPES.includes(
      String(data.unitType).toLowerCase()
    )
  ) {
    errors.unitType =
      "Unit type must be one of: quantity, weight, length, volume, area";
  }

  // Status
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

export const validateUpdateUnit = (data: any = {}): ValidationResult => {
  const errors: Record<string, string> = {};

  // Unit Code
  if (
    data.unitCode !== undefined &&
    (
      typeof data.unitCode !== "string" ||
      !data.unitCode.trim()
    )
  ) {
    errors.unitCode =
      "Unit code must be a valid string";
  }

  // Unit Name
  if (
    data.unitName !== undefined &&
    (
      typeof data.unitName !== "string" ||
      !data.unitName.trim()
    )
  ) {
    errors.unitName =
      "Unit name must be a valid string";
  }

  // Symbol
  if (
    data.symbol !== undefined &&
    (
      typeof data.symbol !== "string" ||
      !data.symbol.trim()
    )
  ) {
    errors.symbol =
      "Unit symbol must be a valid string";
  }

  // Unit Type
  if (
    data.unitType !== undefined &&
    !UNIT_TYPES.includes(
      String(data.unitType).toLowerCase()
    )
  ) {
    errors.unitType =
      "Unit type must be one of: quantity, weight, length, volume, area";
  }

  // Status
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

export const validateObjectId = (id: any): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

export default {
  validateCreateUnit,
  validateUpdateUnit,
  validateObjectId,
  UNIT_TYPES,
};