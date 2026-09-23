"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = __importDefault(require("./env"));
const logger_1 = __importDefault(require("../utils/logger"));
const connectDB = async () => {
    try {
        const mongoUri = env_1.default.MONGO_URI;
        if (!mongoUri) {
            throw new Error("MONGO_URI environment variable is not defined");
        }
        const connection = await mongoose_1.default.connect(mongoUri);
        logger_1.default.info(`MongoDB connected: ${connection.connection.host} (${connection.connection.name})`);
        return connection;
    }
    catch (error) {
        logger_1.default.error(`MongoDB connection failed: ${error.message}`, { error: error.stack });
        process.exit(1);
    }
};
exports.connectDB = connectDB;
exports.default = exports.connectDB;
//# sourceMappingURL=db.js.map