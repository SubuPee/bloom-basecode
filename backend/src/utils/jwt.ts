import jwt from "jsonwebtoken";
import env from "../config/env";

export interface JwtTokenPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export const getJwtSecret = (): string => {
  const secret = env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }
  return secret;
};

export const generateToken = (userId: string | { toString(): string }): string => {
  return jwt.sign(
    {
      userId: userId.toString(),
    },
    getJwtSecret(),
    {
      expiresIn: (env.JWT_EXPIRES_IN || "7d") as any,
    }
  );
};

export const verifyToken = (token: string): JwtTokenPayload => {
  return jwt.verify(token, getJwtSecret()) as JwtTokenPayload;
};
