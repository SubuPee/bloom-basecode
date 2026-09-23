import { ValidationError } from "../errors/AppError";

// =====================================================
// AUTH VALIDATION RULES
// =====================================================

export interface LoginInput {
  email: string;
  password: string;
}

export const validateLoginInput = (data: any): LoginInput => {
  const errors: Record<string, string> = {};

  if (!data?.email || !String(data.email).trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email).trim())) {
    errors.email = "Please provide a valid email address";
  }

  if (!data?.password || !String(data.password).trim()) {
    errors.password = "Password is required";
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError("Validation failed", errors);
  }

  return {
    email: String(data.email).toLowerCase().trim(),
    password: String(data.password),
  };
};

export default {
  validateLoginInput,
};
