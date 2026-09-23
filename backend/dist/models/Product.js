"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// =====================================================
// PRODUCT IMAGE SCHEMA
// =====================================================
const productImageSchema = new mongoose_1.default.Schema({
    url: {
        type: String,
        required: true,
        trim: true,
    },
    altText: {
        type: String,
        trim: true,
        default: "",
    },
    isPrimary: {
        type: Boolean,
        default: false,
    },
    sortOrder: {
        type: Number,
        default: 0,
        min: 0,
    },
}, {
    _id: true,
});
// =====================================================
// VARIANT ATTRIBUTE SCHEMA
// =====================================================
const variantAttributeSchema = new mongoose_1.default.Schema({
    attribute: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "AttributeMaster",
        required: true,
    },
    value: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    _id: false,
});
// =====================================================
// PRODUCT VARIANT SCHEMA
// =====================================================
const productVariantSchema = new mongoose_1.default.Schema({
    sku: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
    },
    barcode: {
        type: String,
        trim: true,
        default: "",
    },
    attributes: {
        type: [variantAttributeSchema],
        default: [],
    },
    purchasePrice: {
        type: Number,
        min: 0,
        default: 0,
    },
    sellingPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    mrp: {
        type: Number,
        min: 0,
        default: 0,
    },
    images: {
        type: [productImageSchema],
        default: [],
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
}, {
    _id: true,
    timestamps: true,
});
// =====================================================
// PRODUCT SCHEMA
// =====================================================
const productSchema = new mongoose_1.default.Schema({
    // =================================================
    // 1. BASIC INFORMATION
    // =================================================
    productCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
    },
    productName: {
        type: String,
        required: true,
        trim: true,
    },
    productType: {
        type: String,
        enum: [
            "simple",
            "variable",
            "digital",
            "service",
        ],
        default: "simple",
        lowercase: true,
        trim: true,
    },
    category: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "CategoryMaster",
        required: true,
    },
    subCategory: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "SubCategoryMaster",
        default: null,
    },
    brand: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "BrandMaster",
        default: null,
    },
    unit: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "UnitMaster",
        required: true,
    },
    hsnSacCode: {
        type: String,
        trim: true,
        default: "",
    },
    barcode: {
        type: String,
        trim: true,
        default: "",
    },
    shortDescription: {
        type: String,
        trim: true,
        default: "",
    },
    description: {
        type: String,
        trim: true,
        default: "",
    },
    // =================================================
    // 2. PRICING & TAX
    // =================================================
    purchasePrice: {
        type: Number,
        min: 0,
        default: 0,
    },
    sellingPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    mrp: {
        type: Number,
        required: true,
        min: 0,
    },
    tax: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "TaxMaster",
        default: null,
    },
    // =================================================
    // 3. INVENTORY SETTINGS
    // =================================================
    reorderLevel: {
        type: Number,
        min: 0,
        default: 0,
    },
    stockQuantity: {
        type: Number,
        min: 0,
        default: 0,
    },
    // =================================================
    // 4. PRODUCT IMAGES
    // =================================================
    images: {
        type: [productImageSchema],
        default: [],
    },
    // =================================================
    // 5. PRODUCT VARIANTS
    // =================================================
    hasVariants: {
        type: Boolean,
        default: false,
    },
    attributes: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "AttributeMaster",
        },
    ],
    variants: {
        type: [productVariantSchema],
        default: [],
    },
    // =================================================
    // 6. SEO
    // =================================================
    slug: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        lowercase: true,
    },
    metaTitle: {
        type: String,
        trim: true,
        default: "",
    },
    metaDescription: {
        type: String,
        trim: true,
        default: "",
    },
    metaKeywords: {
        type: [String],
        default: [],
    },
    // =================================================
    // 7. STOREFRONT
    // =================================================
    isPublished: {
        type: Boolean,
        default: false,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    tags: {
        type: [String],
        default: [],
    },
    // =================================================
    // 8. SHIPPING
    // =================================================
    requiresShipping: {
        type: Boolean,
        default: true,
    },
    weight: {
        type: Number,
        min: 0,
        default: 0,
    },
    weightUnit: {
        type: String,
        enum: ["g", "kg", "lb", "oz"],
        default: "kg",
    },
    length: {
        type: Number,
        min: 0,
        default: 0,
    },
    width: {
        type: Number,
        min: 0,
        default: 0,
    },
    height: {
        type: Number,
        min: 0,
        default: 0,
    },
    dimensionUnit: {
        type: String,
        enum: ["cm", "m", "in", "ft"],
        default: "cm",
    },
    // =================================================
    // 9. STATUS
    // =================================================
    status: {
        type: String,
        enum: ["active", "inactive", "draft", "archived"],
        default: "active",
        lowercase: true,
        trim: true,
    },
    // =================================================
    // 10. AUDIT
    // =================================================
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    updatedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
}, {
    timestamps: true,
});
// =====================================================
// INDEXES
// =====================================================
productSchema.index({
    productName: 1,
});
productSchema.index({
    category: 1,
});
productSchema.index({
    subCategory: 1,
});
productSchema.index({
    brand: 1,
});
productSchema.index({
    status: 1,
});
productSchema.index({
    productType: 1,
});
productSchema.index({
    barcode: 1,
});
productSchema.index({
    isPublished: 1,
});
productSchema.index({
    isFeatured: 1,
});
productSchema.index({
    tags: 1,
});
exports.Product = mongoose_1.default.models.Product || mongoose_1.default.model("Product", productSchema);
exports.default = exports.Product;
//# sourceMappingURL=Product.js.map