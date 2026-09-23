// =====================================================
// CMS VALIDATIONS
// =====================================================

const ALLOWED_TYPES = [
  "Homepage banner",
  "Editorial page",
  "Policy page",
  "Campaign",
  "Content page",
] as const;

const ALLOWED_STATUSES = ["Published", "Draft", "Archived"] as const;

export const validateCreateCms = (data: any = {}): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.title || typeof data.title !== "string" || !data.title.trim()) {
    errors.title = "Content title is required";
  }

  if (data.type && !ALLOWED_TYPES.includes(data.type)) {
    errors.type = `Content type must be one of: ${ALLOWED_TYPES.join(", ")}`;
  }

  if (data.status && !ALLOWED_STATUSES.includes(data.status)) {
    errors.status = `Status must be one of: ${ALLOWED_STATUSES.join(", ")}`;
  }

  if (data.slug && typeof data.slug === "string") {
    if (!/^[a-z0-9-]+$/.test(data.slug.trim().toLowerCase())) {
      errors.slug = "Slug must contain only lowercase letters, numbers, and hyphens";
    }
  }

  return errors;
};

export const validateUpdateCms = (data: any = {}): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (data.title !== undefined) {
    if (typeof data.title !== "string" || !data.title.trim()) {
      errors.title = "Content title cannot be empty";
    }
  }

  if (data.type !== undefined && !ALLOWED_TYPES.includes(data.type)) {
    errors.type = `Content type must be one of: ${ALLOWED_TYPES.join(", ")}`;
  }

  if (data.status !== undefined && !ALLOWED_STATUSES.includes(data.status)) {
    errors.status = `Status must be one of: ${ALLOWED_STATUSES.join(", ")}`;
  }

  if (data.slug !== undefined && typeof data.slug === "string") {
    if (!/^[a-z0-9-]+$/.test(data.slug.trim().toLowerCase())) {
      errors.slug = "Slug must contain only lowercase letters, numbers, and hyphens";
    }
  }

  return errors;
};
