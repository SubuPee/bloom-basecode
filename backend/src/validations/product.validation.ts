import mongoose from "mongoose";

// =====================================================
// CONSTANTS
// =====================================================

const PRODUCT_TYPES = [
  "simple",
  "variable",
  "digital",
  "service",
];

const PRODUCT_STATUSES = [
  "active",
  "inactive",
  "draft",
  "archived",
];

const WEIGHT_UNITS = [
  "g",
  "kg",
  "lb",
  "oz",
];

const DIMENSION_UNITS = [
  "cm",
  "m",
  "in",
  "ft",
];

// =====================================================
// HELPERS
// =====================================================

const isValidString = (value: any): boolean => {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
};

const isNonNegativeNumber = (value: any): boolean => {
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return !Number.isNaN(parsed) && Number.isFinite(parsed) && parsed >= 0;
  }
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  );
};

const isBoolean = (value: any): boolean => {
  return typeof value === "boolean" || value === "true" || value === "false";
};

const isValidObjectId = (value: any): boolean => {
  return mongoose.Types.ObjectId.isValid(value);
};

const isValidEmail = (value: any): boolean => {
  if (!value) return true;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

// =====================================================
// IMAGE VALIDATION
// =====================================================

const validateImages = (
  images: any,
  errors: Record<string, string>,
  fieldName: string = "images"
): void => {
  if (images === undefined) {
    return;
  }

  if (!Array.isArray(images)) {
    errors[fieldName] =
      "Images must be an array.";
    return;
  }

  let primaryImageCount = 0;

  images.forEach((image, index) => {
    if (
      !image ||
      typeof image !== "object" ||
      Array.isArray(image)
    ) {
      errors[`${fieldName}.${index}`] =
        "Each image must be an object.";

      return;
    }

    if (!isValidString(image.url)) {
      errors[`${fieldName}.${index}.url`] =
        "Image URL is required.";
    }

    if (
      image.altText !== undefined &&
      typeof image.altText !== "string"
    ) {
      errors[`${fieldName}.${index}.altText`] =
        "Alt text must be a string.";
    }

    if (
      image.isPrimary !== undefined &&
      !isBoolean(image.isPrimary)
    ) {
      errors[`${fieldName}.${index}.isPrimary`] =
        "isPrimary must be a boolean.";
    }

    if (
      image.isPrimary === true
    ) {
      primaryImageCount += 1;
    }

    if (
      image.sortOrder !== undefined &&
      !isNonNegativeNumber(image.sortOrder)
    ) {
      errors[`${fieldName}.${index}.sortOrder`] =
        "Sort order must be a non-negative number.";
    }
  });

  if (primaryImageCount > 1) {
    errors[fieldName] =
      "Only one primary image is allowed.";
  }
};

// =====================================================
// VARIANT ATTRIBUTE VALIDATION
// =====================================================

const validateVariantAttributes = (
  attributes: any,
  errors: Record<string, string>,
  fieldName: string
): void => {
  if (!Array.isArray(attributes)) {
    errors[fieldName] =
      "Variant attributes must be an array.";

    return;
  }

  const attributeIds = new Set();

  attributes.forEach((item, index) => {
    if (
      !item ||
      typeof item !== "object" ||
      Array.isArray(item)
    ) {
      errors[`${fieldName}.${index}`] =
        "Each variant attribute must be an object.";

      return;
    }

    if (!isValidObjectId(item.attribute)) {
      errors[
        `${fieldName}.${index}.attribute`
      ] = "Invalid attribute ID.";
    } else {
      const attributeId =
        item.attribute.toString();

      if (attributeIds.has(attributeId)) {
        errors[
          `${fieldName}.${index}.attribute`
        ] =
          "Duplicate attribute is not allowed in a variant.";
      }

      attributeIds.add(attributeId);
    }

    if (!isValidString(item.value)) {
      errors[
        `${fieldName}.${index}.value`
      ] = "Variant attribute value is required.";
    }
  });
};

// =====================================================
// VARIANT VALIDATION
// =====================================================

const validateVariants = (
  variants: any,
  errors: Record<string, string>
): void => {
  if (variants === undefined) {
    return;
  }

  if (!Array.isArray(variants)) {
    errors.variants =
      "Variants must be an array.";

    return;
  }

  const skuSet = new Set();

  variants.forEach((variant, index) => {
    if (
      !variant ||
      typeof variant !== "object" ||
      Array.isArray(variant)
    ) {
      errors[`variants.${index}`] =
        "Each variant must be an object.";

      return;
    }

    // Skip empty dummy objects (e.g. from Swagger UI {})
    if (Object.keys(variant).length === 0) {
      return;
    }

    // SKU
    if (!isValidString(variant.sku)) {
      errors[`variants.${index}.sku`] =
        "Variant SKU is required.";
    } else {
      const sku =
        variant.sku.trim().toUpperCase();

      if (skuSet.has(sku)) {
        errors[`variants.${index}.sku`] =
          "Duplicate variant SKU is not allowed.";
      }

      skuSet.add(sku);
    }

    // Barcode
    if (
      variant.barcode !== undefined &&
      typeof variant.barcode !== "string"
    ) {
      errors[`variants.${index}.barcode`] =
        "Variant barcode must be a string.";
    }

    // Attributes
    if (variant.attributes !== undefined) {
      validateVariantAttributes(
        variant.attributes,
        errors,
        `variants.${index}.attributes`
      );
    }

    // Purchase price
    if (
      variant.purchasePrice !== undefined &&
      !isNonNegativeNumber(
        variant.purchasePrice
      )
    ) {
      errors[
        `variants.${index}.purchasePrice`
      ] =
        "Variant purchase price must be a non-negative number.";
    }

    // Selling price
    if (
      variant.sellingPrice === undefined
    ) {
      errors[
        `variants.${index}.sellingPrice`
      ] =
        "Variant selling price is required.";
    } else if (
      !isNonNegativeNumber(
        variant.sellingPrice
      )
    ) {
      errors[
        `variants.${index}.sellingPrice`
      ] =
        "Variant selling price must be a non-negative number.";
    }

    // MRP
    if (
      variant.mrp !== undefined &&
      !isNonNegativeNumber(variant.mrp)
    ) {
      errors[`variants.${index}.mrp`] =
        "Variant MRP must be a non-negative number.";
    }

    // MRP >= Selling Price
    if (
      isNonNegativeNumber(
        variant.sellingPrice
      ) &&
      isNonNegativeNumber(variant.mrp) &&
      variant.mrp <
        variant.sellingPrice
    ) {
      errors[`variants.${index}.mrp`] =
        "Variant MRP cannot be lower than selling price.";
    }

    // Images
    if (variant.images !== undefined) {
      validateImages(
        variant.images,
        errors,
        `variants.${index}.images`
      );
    }

    // Status
    if (
      variant.status !== undefined &&
      !PRODUCT_STATUSES.includes(
        variant.status
      )
    ) {
      errors[`variants.${index}.status`] =
        "Variant status must be active or inactive.";
    }
  });
};

// =====================================================
// ATTRIBUTE ID ARRAY VALIDATION
// =====================================================

const validateAttributeIds = (
  attributes: any,
  errors: Record<string, string>
): void => {
  if (attributes === undefined) {
    return;
  }

  if (!Array.isArray(attributes)) {
    errors.attributes =
      "Attributes must be an array.";

    return;
  }

  const attributeIds = new Set();

  attributes.forEach((attribute, index) => {
    // Skip placeholder dummy values from Swagger UI
    if (typeof attribute === "string" && (attribute.trim() === "" || attribute.trim().toLowerCase() === "string")) {
      return;
    }

    if (!isValidObjectId(attribute)) {
      errors[`attributes.${index}`] =
        "Invalid attribute ID.";

      return;
    }

    const attributeId =
      attribute.toString();

    if (attributeIds.has(attributeId)) {
      errors[`attributes.${index}`] =
        "Duplicate attribute is not allowed.";
    }

    attributeIds.add(attributeId);
  });
};

// =====================================================
// COMMON PRODUCT VALIDATION
// =====================================================

const validateProductFields = (
  data: any,
  errors: Record<string, string>,
  isUpdate: boolean = false
): Record<string, string> => {
  // ---------------------------------------------------
  // Product Code
  // ---------------------------------------------------

  if (data.productCode !== undefined && !isValidString(data.productCode)) {
    errors.productCode = "Product code cannot be empty.";
  }

  // ---------------------------------------------------
  // Product Name
  // ---------------------------------------------------

  if (
    !isUpdate ||
    data.productName !== undefined
  ) {
    if (!isValidString(data.productName)) {
      errors.productName =
        "Product name is required.";
    }
  }

  // ---------------------------------------------------
  // Product Type
  // ---------------------------------------------------

  if (data.productType !== undefined) {
    if (
      !PRODUCT_TYPES.includes(
        String(data.productType).toLowerCase()
      )
    ) {
      errors.productType =
        `Product type must be one of: ${PRODUCT_TYPES.join(
          ", "
        )}.`;
    }
  }

  // ---------------------------------------------------
  // Category
  // ---------------------------------------------------

  if (data.category !== undefined && data.category !== null && data.category !== "") {
    if (!isValidObjectId(data.category) && !isValidString(data.category)) {
      errors.category = "Category must be a valid ID or name.";
    }
  }

  // ---------------------------------------------------
  // Sub Category
  // ---------------------------------------------------

  if (
    data.subCategory !== undefined &&
    data.subCategory !== null &&
    data.subCategory !== ""
  ) {
    if (
      !isValidObjectId(data.subCategory) &&
      !isValidString(data.subCategory)
    ) {
      errors.subCategory =
        "Invalid sub category ID or name.";
    }
  }

  // ---------------------------------------------------
  // Brand
  // ---------------------------------------------------

  if (
    data.brand !== undefined &&
    data.brand !== null &&
    data.brand !== ""
  ) {
    if (!isValidObjectId(data.brand) && !isValidString(data.brand)) {
      errors.brand =
        "Invalid brand ID or name.";
    }
  }

  // ---------------------------------------------------
  // Unit
  // ---------------------------------------------------

  if (data.unit !== undefined && data.unit !== null && data.unit !== "") {
    if (!isValidObjectId(data.unit) && !isValidString(data.unit)) {
      errors.unit =
        "Unit must be a valid ID or name.";
    }
  }

  // ---------------------------------------------------
  // HSN / SAC Code
  // ---------------------------------------------------

  if (
    data.hsnSacCode !== undefined &&
    typeof data.hsnSacCode !== "string"
  ) {
    errors.hsnSacCode =
      "HSN/SAC code must be a string.";
  }

  // ---------------------------------------------------
  // Barcode
  // ---------------------------------------------------

  if (
    data.barcode !== undefined &&
    typeof data.barcode !== "string"
  ) {
    errors.barcode =
      "Barcode must be a string.";
  }

  // ---------------------------------------------------
  // Short Description
  // ---------------------------------------------------

  if (
    data.shortDescription !== undefined &&
    typeof data.shortDescription !== "string"
  ) {
    errors.shortDescription =
      "Short description must be a string.";
  }

  // ---------------------------------------------------
  // Description
  // ---------------------------------------------------

  if (
    data.description !== undefined &&
    typeof data.description !== "string"
  ) {
    errors.description =
      "Description must be a string.";
  }

  // ---------------------------------------------------
  // Purchase Price
  // ---------------------------------------------------

  if (
    data.purchasePrice !== undefined &&
    !isNonNegativeNumber(
      data.purchasePrice
    )
  ) {
    errors.purchasePrice =
      "Purchase price must be a non-negative number.";
  }

  // ---------------------------------------------------
  // Selling Price
  // ---------------------------------------------------

  if (
    !isUpdate ||
    data.sellingPrice !== undefined
  ) {
    if (
      !isNonNegativeNumber(
        data.sellingPrice
      )
    ) {
      errors.sellingPrice =
        "Selling price must be a non-negative number.";
    }
  }

  // ---------------------------------------------------
  // MRP
  // ---------------------------------------------------

  if (data.mrp !== undefined && data.mrp !== null && data.mrp !== "") {
    if (!isNonNegativeNumber(data.mrp)) {
      errors.mrp =
        "MRP must be a non-negative number.";
    }
  }

  // ---------------------------------------------------
  // MRP >= Selling Price
  // ---------------------------------------------------

  if (
    isNonNegativeNumber(data.sellingPrice) &&
    isNonNegativeNumber(data.mrp) &&
    Number(data.mrp) < Number(data.sellingPrice)
  ) {
    errors.mrp =
      "MRP cannot be lower than selling price.";
  }

  // ---------------------------------------------------
  // Tax
  // ---------------------------------------------------

  if (
    data.tax !== undefined &&
    data.tax !== null &&
    data.tax !== ""
  ) {
    if (!isValidObjectId(data.tax) && !isValidString(data.tax)) {
      errors.tax =
        "Tax must be a valid ID or name.";
    }
  }

  // ---------------------------------------------------
  // Reorder Level
  // ---------------------------------------------------

  if (
    data.reorderLevel !== undefined &&
    !isNonNegativeNumber(
      data.reorderLevel
    )
  ) {
    errors.reorderLevel =
      "Reorder level must be a non-negative number.";
  }

  // ---------------------------------------------------
  // Images
  // ---------------------------------------------------

  validateImages(
    data.images,
    errors
  );

  // ---------------------------------------------------
  // Has Variants
  // ---------------------------------------------------

  if (
    data.hasVariants !== undefined &&
    !isBoolean(data.hasVariants)
  ) {
    errors.hasVariants =
      "hasVariants must be a boolean.";
  }

  // ---------------------------------------------------
  // Attributes & Variants
  // ---------------------------------------------------

  const hasVariants = data.hasVariants === true;
  const isVariable = String(data.productType || "").toLowerCase() === "variable";

  if (hasVariants || isVariable) {
    validateAttributeIds(
      data.attributes,
      errors
    );

    validateVariants(
      data.variants,
      errors
    );
  }

  // ---------------------------------------------------
  // Slug
  // ---------------------------------------------------

  if (
    data.slug !== undefined
  ) {
    if (!isValidString(data.slug)) {
      errors.slug =
        "Slug cannot be empty.";
    } else if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
        data.slug.trim().toLowerCase()
      )
    ) {
      errors.slug =
        "Slug can contain lowercase letters, numbers and hyphens only.";
    }
  }

  // ---------------------------------------------------
  // Meta Title
  // ---------------------------------------------------

  if (
    data.metaTitle !== undefined &&
    typeof data.metaTitle !== "string"
  ) {
    errors.metaTitle =
      "Meta title must be a string.";
  }

  // ---------------------------------------------------
  // Meta Description
  // ---------------------------------------------------

  if (
    data.metaDescription !== undefined &&
    typeof data.metaDescription !== "string"
  ) {
    errors.metaDescription =
      "Meta description must be a string.";
  }

  // ---------------------------------------------------
  // Meta Keywords
  // ---------------------------------------------------

  if (
    data.metaKeywords !== undefined
  ) {
    if (
      !Array.isArray(data.metaKeywords)
    ) {
      errors.metaKeywords =
        "Meta keywords must be an array.";
    } else {
      data.metaKeywords.forEach(
        (keyword: any, index: number) => {
          if (!isValidString(keyword)) {
            errors[
              `metaKeywords.${index}`
            ] =
              "Meta keyword must be a valid string.";
          }
        }
      );
    }
  }

  // ---------------------------------------------------
  // Published
  // ---------------------------------------------------

  if (
    data.isPublished !== undefined &&
    !isBoolean(data.isPublished)
  ) {
    errors.isPublished =
      "isPublished must be a boolean.";
  }

  // ---------------------------------------------------
  // Featured
  // ---------------------------------------------------

  if (
    data.isFeatured !== undefined &&
    !isBoolean(data.isFeatured)
  ) {
    errors.isFeatured =
      "isFeatured must be a boolean.";
  }

  // ---------------------------------------------------
  // Tags
  // ---------------------------------------------------

  if (data.tags !== undefined) {
    if (!Array.isArray(data.tags)) {
      errors.tags =
        "Tags must be an array.";
    } else {
      data.tags.forEach(
        (tag: any, index: number) => {
          if (!isValidString(tag)) {
            errors[`tags.${index}`] =
              "Each tag must be a valid string.";
          }
        }
      );
    }
  }

  // ---------------------------------------------------
  // Requires Shipping
  // ---------------------------------------------------

  if (
    data.requiresShipping !== undefined &&
    !isBoolean(data.requiresShipping)
  ) {
    errors.requiresShipping =
      "requiresShipping must be a boolean.";
  }

  // ---------------------------------------------------
  // Weight
  // ---------------------------------------------------

  if (
    data.weight !== undefined &&
    !isNonNegativeNumber(data.weight)
  ) {
    errors.weight =
      "Weight must be a non-negative number.";
  }

  // ---------------------------------------------------
  // Weight Unit
  // ---------------------------------------------------

  if (
    data.weightUnit !== undefined &&
    !WEIGHT_UNITS.includes(
      data.weightUnit
    )
  ) {
    errors.weightUnit =
      `Weight unit must be one of: ${WEIGHT_UNITS.join(
        ", "
      )}.`;
  }

  // ---------------------------------------------------
  // Dimensions
  // ---------------------------------------------------

  ["length", "width", "height"].forEach(
    (field) => {
      if (
        data[field] !== undefined &&
        !isNonNegativeNumber(data[field])
      ) {
        errors[field] =
          `${field} must be a non-negative number.`;
      }
    }
  );

  // ---------------------------------------------------
  // Dimension Unit
  // ---------------------------------------------------

  if (
    data.dimensionUnit !== undefined &&
    !DIMENSION_UNITS.includes(
      data.dimensionUnit
    )
  ) {
    errors.dimensionUnit =
      `Dimension unit must be one of: ${DIMENSION_UNITS.join(
        ", "
      )}.`;
  }

  // ---------------------------------------------------
  // Status
  // ---------------------------------------------------

  if (
    data.status !== undefined &&
    !PRODUCT_STATUSES.includes(
      String(data.status).toLowerCase()
    )
  ) {
    errors.status =
      `Status must be one of: ${PRODUCT_STATUSES.join(", ")}.`;
  }

  return errors;
};

// =====================================================
// CREATE VALIDATION
// =====================================================

const validateCreateProduct = (
  data: any = {}
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    return {
      body: "Request body must be an object.",
    };
  }

  validateProductFields(
    data,
    errors,
    false
  );

  // ===================================================
  // VARIANT BUSINESS RULES
  // ===================================================

  const productType =
    data.productType || "simple";

  const hasVariants =
    data.hasVariants === true;

  const variants =
    Array.isArray(data.variants)
      ? data.variants
      : [];

  const attributes =
    Array.isArray(data.attributes)
      ? data.attributes
      : [];

  const realVariants = variants.filter(
    (v: any) => v && typeof v === "object" && Object.keys(v).length > 0 && (v.sku || v.sellingPrice)
  );

  const realAttributes = attributes.filter(
    (a: any) => a && typeof a === "string" && a.trim() !== "" && a.trim().toLowerCase() !== "string"
  );

  // Variable product must have variants
  if (
    productType === "variable" ||
    hasVariants
  ) {
    if (!hasVariants) {
      errors.hasVariants =
        "Variable products must have hasVariants set to true.";
    }

    if (realAttributes.length === 0) {
      errors.attributes =
        "At least one attribute is required for a variable product.";
    }

    if (realVariants.length === 0) {
      errors.variants =
        "At least one variant is required for a variable product.";
    }
  }

  // Simple product should not have variants
  if (
    productType === "simple" &&
    hasVariants
  ) {
    // Allowed because UI may select hasVariants
    // and productType may not be updated separately.
  }

  // Non-variable products should not contain variants
  if (
    productType !== "variable" &&
    realVariants.length > 0 &&
    !hasVariants
  ) {
    errors.variants =
      "Variants are only allowed when hasVariants is true.";
  }

  return errors;
};

// =====================================================
// UPDATE VALIDATION
// =====================================================

const validateUpdateProduct = (
  data: any = {}
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    return {
      body: "Request body must be an object.",
    };
  }

  validateProductFields(
    data,
    errors,
    true
  );

  return errors;
};

// =====================================================
// OBJECT ID VALIDATION
// =====================================================

const validateObjectId = (
  id: any,
  fieldName: string = "id"
): Record<string, string> => {
  if (!id || (typeof id !== "string" && typeof id !== "number") || (typeof id === "string" && !id.trim())) {
    return {
      [fieldName]: `Invalid ${fieldName}.`,
    };
  }

  return {};
};

// =====================================================
// BULK OPERATIONS VALIDATION
// =====================================================

const validateBulkStatus = (data: any = {}): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!Array.isArray(data.ids) || data.ids.length === 0) {
    errors.ids = "A non-empty array of product IDs is required.";
  } else {
    data.ids.forEach((id: any, index: number) => {
      if (!id || (typeof id !== "string" && typeof id !== "number") || (typeof id === "string" && !id.trim())) {
        errors[`ids.${index}`] = `Invalid product ID at index ${index}.`;
      }
    });
  }

  if (!data.status || !PRODUCT_STATUSES.includes(String(data.status).toLowerCase())) {
    errors.status = `Status is required and must be one of: ${PRODUCT_STATUSES.join(", ")}.`;
  }

  return errors;
};

const validateBulkPublish = (data: any = {}): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!Array.isArray(data.ids) || data.ids.length === 0) {
    errors.ids = "A non-empty array of product IDs is required.";
  } else {
    data.ids.forEach((id: any, index: number) => {
      if (!id || (typeof id !== "string" && typeof id !== "number") || (typeof id === "string" && !id.trim())) {
        errors[`ids.${index}`] = `Invalid product ID at index ${index}.`;
      }
    });
  }

  if (typeof data.isPublished !== "boolean" && data.isPublished !== "true" && data.isPublished !== "false") {
    errors.isPublished = "isPublished must be a boolean.";
  }

  return errors;
};

const validateBulkDelete = (data: any = {}): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!Array.isArray(data.ids) || data.ids.length === 0) {
    errors.ids = "A non-empty array of product IDs is required.";
  } else {
    data.ids.forEach((id: any, index: number) => {
      if (!id || (typeof id !== "string" && typeof id !== "number") || (typeof id === "string" && !id.trim())) {
        errors[`ids.${index}`] = `Invalid product ID at index ${index}.`;
      }
    });
  }

  return errors;
};

// =====================================================
// EXPORTS
// =====================================================

export {
  PRODUCT_STATUSES,
  validateCreateProduct,
  validateUpdateProduct,
  validateObjectId,
  validateBulkStatus,
  validateBulkPublish,
  validateBulkDelete,
};

export default {
  PRODUCT_STATUSES,
  validateCreateProduct,
  validateUpdateProduct,
  validateObjectId,
  validateBulkStatus,
  validateBulkPublish,
  validateBulkDelete,
};