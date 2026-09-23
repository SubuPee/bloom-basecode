// =====================================================
// VENDOR VALIDATIONS
// =====================================================

export const validateCreateVendor = (data: any = {}): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.businessName || !data.businessName.trim()) {
    errors.businessName = "Business name is required";
  }

  if (!data.ownerName || !data.ownerName.trim()) {
    errors.ownerName = "Owner / Contact person name is required";
  }

  if (!data.email || !data.email.trim()) {
    errors.email = "Email address is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = "Please enter a valid email address";
  }

  if (!data.phone || !data.phone.trim()) {
    errors.phone = "Phone number is required";
  }

  if (!data.address || !data.address.trim()) {
    errors.address = "Registered address is required";
  }

  if (!data.city || !data.city.trim()) {
    errors.city = "City is required";
  }

  if (!data.state || !data.state.trim()) {
    errors.state = "State is required";
  }

  if (!data.pincode || !data.pincode.trim()) {
    errors.pincode = "Postal code / PIN code is required";
  }

  if (data.commissionRate !== undefined) {
    const rate = Number(data.commissionRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      errors.commissionRate = "Commission rate must be a percentage between 0 and 100";
    }
  }

  return errors;
};

export const validateUpdateVendor = (data: any = {}): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = "Please enter a valid email address";
  }

  if (data.commissionRate !== undefined) {
    const rate = Number(data.commissionRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      errors.commissionRate = "Commission rate must be a percentage between 0 and 100";
    }
  }

  return errors;
};

export const validateStatusUpdate = (data: any = {}): Record<string, string> => {
  const errors: Record<string, string> = {};
  const validStatuses = ["Pending", "Under Review", "Approved", "Rejected", "Suspended", "Inactive"];

  if (!data.status) {
    errors.status = "Status is required";
  } else if (!validStatuses.includes(data.status)) {
    errors.status = `Status must be one of: ${validStatuses.join(", ")}`;
  }

  if ((data.status === "Rejected" || data.status === "Suspended") && (!data.reason || !data.reason.trim())) {
    errors.reason = `Reason is mandatory when setting status to ${data.status}`;
  }

  return errors;
};

export const validateKycUpdate = (data: any = {}): Record<string, string> => {
  const errors: Record<string, string> = {};
  const validKyc = ["Pending", "Verified", "Rejected", "In Review"];

  if (!data.kycStatus) {
    errors.kycStatus = "KYC status is required";
  } else if (!validKyc.includes(data.kycStatus)) {
    errors.kycStatus = `KYC status must be one of: ${validKyc.join(", ")}`;
  }

  return errors;
};

export const validateDocVerify = (data: any = {}): Record<string, string> => {
  const errors: Record<string, string> = {};
  const validStatuses = ["Pending", "Verified", "Rejected", "Expired"];

  if (!data.status) {
    errors.status = "Document verification status is required";
  } else if (!validStatuses.includes(data.status)) {
    errors.status = `Status must be one of: ${validStatuses.join(", ")}`;
  }

  return errors;
};

export const validateProcessPayment = (data: any = {}): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.referenceId || !data.referenceId.trim()) {
    errors.referenceId = "Payment Reference / UTR Number is required";
  }

  return errors;
};

export default {
  validateCreateVendor,
  validateUpdateVendor,
  validateStatusUpdate,
  validateKycUpdate,
  validateDocVerify,
  validateProcessPayment,
};
