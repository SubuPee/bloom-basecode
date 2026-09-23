"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unit = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const unitSchema = new mongoose_1.Schema({
    unitCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
    },
    unitName: {
        type: String,
        required: true,
        trim: true,
    },
    symbol: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
    },
    unitType: {
        type: String,
        required: true,
        enum: ["quantity", "weight", "length", "volume", "area"],
        lowercase: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
}, {
    timestamps: true,
});
unitSchema.index({ unitName: 1 });
unitSchema.index({ symbol: 1 });
unitSchema.index({ unitType: 1 });
unitSchema.index({ status: 1 });
exports.Unit = mongoose_1.default.models.UnitMaster ||
    mongoose_1.default.model("UnitMaster", unitSchema);
exports.default = exports.Unit;
//# sourceMappingURL=unit.model.js.map