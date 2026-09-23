// =====================================================
// STOCK TRANSFER VALIDATIONS
// =====================================================

export const validateCreateTransfer = (data: any = {}): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.productId || !String(data.productId).trim()) {
    errors.productId = "Product ID is required";
  }
  if (!data.variantId || !String(data.variantId).trim()) {
    errors.variantId = "Variant ID is required";
  }
  if (!data.fromWarehouseId || !String(data.fromWarehouseId).trim()) {
    errors.fromWarehouseId = "Source warehouse is required";
  }
  if (!data.toWarehouseId || !String(data.toWarehouseId).trim()) {
    errors.toWarehouseId = "Destination warehouse is required";
  }
  if (
    data.fromWarehouseId &&
    data.toWarehouseId &&
    String(data.fromWarehouseId) === String(data.toWarehouseId)
  ) {
    errors.toWarehouseId = "Source and destination warehouses must be different";
  }
  if (data.quantity === undefined || data.quantity === null) {
    errors.quantity = "Transfer quantity is required";
  } else {
    const qty = Number(data.quantity);
    if (isNaN(qty) || qty <= 0) {
      errors.quantity = "Transfer quantity must be a positive number";
    }
  }

  return errors;
};

export const validateCancelTransfer = (data: any = {}): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.cancelReason || !String(data.cancelReason).trim()) {
    errors.cancelReason = "Cancellation reason is required";
  }

  return errors;
};

export default {
  validateCreateTransfer,
  validateCancelTransfer,
};
