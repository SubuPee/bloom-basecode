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
exports.Attribute = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const attributeValueSchema = new mongoose_1.Schema({
    value: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
}, {
    _id: true,
});
const attributeSchema = new mongoose_1.Schema({
    attributeCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
    },
    attributeName: {
        type: String,
        required: true,
        trim: true,
    },
    displayType: {
        type: String,
        enum: ["dropdown", "radio", "checkbox", "text", "color"],
        default: "dropdown",
    },
    values: {
        type: [attributeValueSchema],
        default: [],
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
attributeSchema.index({ attributeName: 1 });
attributeSchema.index({ status: 1 });
exports.Attribute = mongoose_1.default.models.AttributeMaster ||
    mongoose_1.default.model("AttributeMaster", attributeSchema);
exports.default = exports.Attribute;
//# sourceMappingURL=attribute.model.js.map