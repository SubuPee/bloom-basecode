import dotenv from "dotenv";

dotenv.config();

// =====================================================
// DYNAMIC ENVIRONMENT CONFIGURATION & VALIDATION (Fail-Fast)
// =====================================================

const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"] as const;

const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error(`❌ CRITICAL: Missing required environment variables: ${missingVars.join(", ")}`);
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
}

export interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  MONGO_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  API_URL: string;
  CORS_ORIGIN: string;
  isProduction: boolean;
  isDevelopment: boolean;
}

export const env: Readonly<EnvironmentConfig> = Object.freeze({
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  MONGO_URI: process.env.MONGO_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "fallback_development_secret_do_not_use_in_production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  API_URL: process.env.API_URL || "http://localhost:5000",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV !== "production",
});

export default env;
