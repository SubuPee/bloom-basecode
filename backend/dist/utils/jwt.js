"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = exports.getJwtSecret = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = __importDefault(require("../config/env"));
const getJwtSecret = () => {
    const secret = env_1.default.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET environment variable is not defined");
    }
    return secret;
};
exports.getJwtSecret = getJwtSecret;
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({
        userId: userId.toString(),
    }, (0, exports.getJwtSecret)(), {
        expiresIn: (env_1.default.JWT_EXPIRES_IN || "7d"),
    });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, (0, exports.getJwtSecret)());
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=jwt.js.map