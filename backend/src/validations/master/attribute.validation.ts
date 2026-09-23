import mongoose from "mongoose";

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// -----------------------------------------
// Validate Attribute Values
// -----------------------------------------

const validateValues = (values: any, errors: Record<string, string>): void => {
  if (values === undefined) {
    return;
  }

  if (!Array.isArray(values)) {
    errors.values = "Values must be an array";
    return;
  }

  const seenValues = new Set<string>();

  values.forEach((item: any, index: number) => {
    if (!item || typeof item !== "object") {
      errors[`values.${index}`] =
        "Attribute value must be an object";
      return;
    }

    // Validate value
    if (
      typeof item.value !== "string" ||
      !item.value.trim()
    ) {
      errors[`values.${index}.value`] =
        "Attribute value must be a valid string";
    } else {
      const normalizedValue = item.value
        .trim()
        .toLowerCase();

      if (seenValues.has(normalizedValue)) {
        errors[`values.${index}.value`] =
          "Duplicate attribute value";
      }

      seenValues.add(normalizedValue);
    }

    // Validate value status
    if (
      item.status !== undefined &&
      !["active", "inactive"].includes(item.status)
    ) {
      errors[`values.${index}.status`] =
        "Value status must be either active or inactive";
    }
  });
};

// -----------------------------------------
// Create Attribute Validation
// -----------------------------------------

export const validateCreateAttribute = (data: any = {}): ValidationResult => {
  const errors: Record<string, string> = {};

  // Attribute Code
  if (!data.attributeCode) {
    errors.attributeCode =
      "Attribute code is required";
  } else if (
    typeof data.attributeCode !== "string" ||
    !data.attributeCode.trim()
  ) {
    errors.attributeCode =
      "Attribute code must be a valid string";
  }

  // Attribute Name
  if (!data.attributeName) {
    errors.attributeName =
      "Attribute name is required";
  } else if (
    typeof data.attributeName !== "string" ||
    !data.attributeName.trim()
  ) {
    errors.attributeName =
      "Attribute name must be a valid string";
  }

  // Display Type
  if (
    data.displayType !== undefined &&
    ![
      "dropdown",
      "radio",
      "checkbox",
      "text",
      "color",
    ].includes(data.displayType)
  ) {
    errors.displayType =
      "Display type must be dropdown, radio, checkbox, text or color";
  }

  // Values
  validateValues(data.values, errors);

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

// -----------------------------------------
// Update Attribute Validation
// -----------------------------------------

export const validateUpdateAttribute = (data: any = {}): ValidationResult => {
  const errors: Record<string, string> = {};

  // Attribute Code
  if (
    data.attributeCode !== undefined &&
    (
      typeof data.attributeCode !== "string" ||
      !data.attributeCode.trim()
    )
  ) {
    errors.attributeCode =
      "Attribute code must be a valid string";
  }

  // Attribute Name
  if (
    data.attributeName !== undefined &&
    (
      typeof data.attributeName !== "string" ||
      !data.attributeName.trim()
    )
  ) {
    errors.attributeName =
      "Attribute name must be a valid string";
  }

  // Display Type
  if (
    data.displayType !== undefined &&
    ![
      "dropdown",
      "radio",
      "checkbox",
      "text",
      "color",
    ].includes(data.displayType)
  ) {
    errors.displayType =
      "Display type must be dropdown, radio, checkbox, text or color";
  }

  // Values
  validateValues(data.values, errors);

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

// -----------------------------------------
// ObjectId Validation
// -----------------------------------------

export const validateObjectId = (id: any): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

export default {
  validateCreateAttribute,
  validateUpdateAttribute,
  validateObjectId,
};