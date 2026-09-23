// =====================================================
// INVENTORY VALIDATIONS
// =====================================================

export const validateAddStock = (data: any = {}): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.productId || !String(data.productId).trim()) {
    errors.productId = "Product ID is required";
  }
  if (!data.variantId || !String(data.variantId).trim()) {
    errors.variantId = "Variant ID is required";
  }
  if (!data.warehouseId || !String(data.warehouseId).trim()) {
    errors.warehouseId = "Warehouse ID is required";
  }
  if (data.quantity === undefined || data.quantity === null) {
    errors.quantity = "Quantity is required";
  } else {
    const qty = Number(data.quantity);
    if (isNaN(qty) || qty <= 0) {
      errors.quantity = "Quantity must be a positive number";
    }
  }
  if (!data.notes || !String(data.notes).trim()) {
    errors.notes = "Notes / reason is required";
  }

  return errors;
};

export const validateStockAdjustment = (data: any = {}): Record<string, string> => {
  const errors: Record<string, string> = {};
  const validTypes = ["Increase", "Decrease", "Damage", "Expiry"];

  if (!data.productId || !String(data.productId).trim()) {
    errors.productId = "Product ID is required";
  }
  if (!data.variantId || !String(data.variantId).trim()) {
    errors.variantId = "Variant ID is required";
  }
  if (!data.warehouseId || !String(data.warehouseId).trim()) {
    errors.warehouseId = "Warehouse ID is required";
  }
  if (!data.adjustmentType) {
    errors.adjustmentType = "Adjustment type is required";
  } else if (!validTypes.includes(data.adjustmentType)) {
    errors.adjustmentType = `Adjustment type must be one of: ${validTypes.join(", ")}`;
  }
  if (data.quantity === undefined || data.quantity === null) {
    errors.quantity = "Quantity is required";
  } else {
    const qty = Number(data.quantity);
    if (isNaN(qty) || qty <= 0) {
      errors.quantity = "Quantity must be a positive number";
    }
  }
  if (!data.reason || !String(data.reason).trim()) {
    errors.reason = "Adjustment reason is required";
  }
  if (!data.notes || !String(data.notes).trim()) {
    errors.notes = "Audit justification notes are required";
  }

  return errors;
};

export default {
  validateAddStock,
  validateStockAdjustment,
};
