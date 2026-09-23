"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBrand = exports.updateBrandStatus = exports.updateBrand = exports.getBrandById = exports.getBrands = exports.createBrand = void 0;
const brand_model_1 = __importDefault(require("../../models/master/brand.model"));
const brand_validation_1 = require("../../validations/master/brand.validation");
const escapeRegex = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
// -----------------------------------------
// Create Brand
// -----------------------------------------
const createBrand = async (data, user) => {
    const { isValid, errors } = (0, brand_validation_1.validateCreateBrand)(data);
    if (!isValid) {
        const error = new Error("Validation failed");
        error.statusCode = 400;
        error.errors = errors;
        throw error;
    }
    const brandCode = data.brandCode.trim().toUpperCase();
    const brandName = data.brandName.trim();
    // Check duplicate brand code
    const existingCode = await brand_model_1.default.findOne({
        brandCode,
    });
    if (existingCode) {
        const error = new Error("Brand code already exists");
        error.statusCode = 400;
        throw error;
    }
    // Check duplicate brand name
    const existingName = await brand_model_1.default.findOne({
        brandName: {
            $regex: `^${escapeRegex(brandName)}$`,
            $options: "i",
        },
    });
    if (existingName) {
        const error = new Error("Brand name already exists");
        error.statusCode = 400;
        throw error;
    }
    const brand = await brand_model_1.default.create({
        brandCode,
        brandName,
        status: data.status || "active",
        createdBy: user?._id || null,
    });
    return brand;
};
exports.createBrand = createBrand;
// -----------------------------------------
// Get All Brands
// -----------------------------------------
const getBrands = async (query = {}) => {
    const page = Math.max(parseInt(String(query.page), 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(String(query.limit), 10) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const filter = {};
    if (query.search) {
        const search = escapeRegex(query.search.trim());
        filter.$or = [
            { brandCode: { $regex: search, $options: "i" } },
            { brandName: { $regex: search, $options: "i" } },
        ];
    }
    if (query.status) {
        if (!["active", "inactive"].includes(query.status)) {
            const error = new Error("Invalid status");
            error.statusCode = 400;
            throw error;
        }
        filter.status = query.status;
    }
    const [brands, total] = await Promise.all([
        brand_model_1.default.find(filter)
            .populate("createdBy", "firstName lastName email")
            .populate("updatedBy", "firstName lastName email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        brand_model_1.default.countDocuments(filter),
    ]);
    return {
        brands,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.getBrands = getBrands;
// -----------------------------------------
// Get Brand By ID
// -----------------------------------------
const getBrandById = async (id) => {
    if (!(0, brand_validation_1.validateObjectId)(id)) {
        const error = new Error("Invalid brand ID");
        error.statusCode = 400;
        throw error;
    }
    const brand = await brand_model_1.default.findById(id)
        .populate("createdBy", "firstName lastName email")
        .populate("updatedBy", "firstName lastName email");
    if (!brand) {
        const error = new Error("Brand not found");
        error.statusCode = 404;
        throw error;
    }
    return brand;
};
exports.getBrandById = getBrandById;
// -----------------------------------------
// Update Brand
// -----------------------------------------
const updateBrand = async (id, data, user) => {
    if (!(0, brand_validation_1.validateObjectId)(id)) {
        const error = new Error("Invalid brand ID");
        error.statusCode = 400;
        throw error;
    }
    const { isValid, errors } = (0, brand_validation_1.validateUpdateBrand)(data);
    if (!isValid) {
        const error = new Error("Validation failed");
        error.statusCode = 400;
        error.errors = errors;
        throw error;
    }
    const brand = await brand_model_1.default.findById(id);
    if (!brand) {
        const error = new Error("Brand not found");
        error.statusCode = 404;
        throw error;
    }
    // Brand Code
    if (data.brandCode !== undefined) {
        const brandCode = data.brandCode.trim().toUpperCase();
        const duplicateCode = await brand_model_1.default.findOne({
            brandCode,
            _id: { $ne: id },
        });
        if (duplicateCode) {
            const error = new Error("Brand code already exists");
            error.statusCode = 400;
            throw error;
        }
        brand.brandCode = brandCode;
    }
    // Brand Name
    if (data.brandName !== undefined) {
        const brandName = data.brandName.trim();
        const duplicateName = await brand_model_1.default.findOne({
            brandName: {
                $regex: `^${escapeRegex(brandName)}$`,
                $options: "i",
            },
            _id: { $ne: id },
        });
        if (duplicateName) {
            const error = new Error("Brand name already exists");
            error.statusCode = 400;
            throw error;
        }
        brand.brandName = brandName;
    }
    if (data.status !== undefined) {
        brand.status = data.status;
    }
    brand.updatedBy = user?._id || null;
    await brand.save();
    return brand;
};
exports.updateBrand = updateBrand;
// -----------------------------------------
// Update Brand Status
// -----------------------------------------
const updateBrandStatus = async (id, status, user) => {
    if (!(0, brand_validation_1.validateObjectId)(id)) {
        const error = new Error("Invalid brand ID");
        error.statusCode = 400;
        throw error;
    }
    if (!["active", "inactive"].includes(status)) {
        const error = new Error("Status must be either active or inactive");
        error.statusCode = 400;
        throw error;
    }
    const brand = await brand_model_1.default.findById(id);
    if (!brand) {
        const error = new Error("Brand not found");
        error.statusCode = 404;
        throw error;
    }
    brand.status = status;
    brand.updatedBy = user?._id || null;
    await brand.save();
    return brand;
};
exports.updateBrandStatus = updateBrandStatus;
// -----------------------------------------
// Delete Brand
// -----------------------------------------
const deleteBrand = async (id) => {
    if (!(0, brand_validation_1.validateObjectId)(id)) {
        const error = new Error("Invalid brand ID");
        error.statusCode = 400;
        throw error;
    }
    const brand = await brand_model_1.default.findById(id);
    if (!brand) {
        const error = new Error("Brand not found");
        error.statusCode = 404;
        throw error;
    }
    await brand_model_1.default.findByIdAndDelete(id);
    return true;
};
exports.deleteBrand = deleteBrand;
exports.default = {
    createBrand: exports.createBrand,
    getBrands: exports.getBrands,
    getBrandById: exports.getBrandById,
    updateBrand: exports.updateBrand,
    updateBrandStatus: exports.updateBrandStatus,
    deleteBrand: exports.deleteBrand,
};
//# sourceMappingURL=brand.service.js.map