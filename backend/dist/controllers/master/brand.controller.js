"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBrand = exports.updateBrandStatus = exports.updateBrand = exports.getBrandById = exports.getBrands = exports.createBrand = void 0;
const brand_service_1 = __importDefault(require("../../services/master/brand.service"));
const logger_1 = __importDefault(require("../../utils/logger"));
// -----------------------------------------
// Create Brand
// -----------------------------------------
const createBrand = async (req, res) => {
    try {
        const brand = await brand_service_1.default.createBrand(req.body, req.user);
        return res.status(201).json({
            success: true,
            message: "Brand created successfully",
            data: brand,
        });
    }
    catch (error) {
        logger_1.default.error("Create brand error: " + (error?.message || error));
        return res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || "Failed to create brand",
            ...(error.errors && {
                errors: error.errors,
            }),
        });
    }
};
exports.createBrand = createBrand;
// -----------------------------------------
// Get All Brands
// -----------------------------------------
const getBrands = async (req, res) => {
    try {
        const result = await brand_service_1.default.getBrands(req.query);
        return res.status(200).json({
            success: true,
            message: "Brands retrieved successfully",
            data: result.brands,
            pagination: result.pagination,
        });
    }
    catch (error) {
        logger_1.default.error("Get brands error: " + (error?.message || error));
        return res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || "Failed to get brands",
        });
    }
};
exports.getBrands = getBrands;
// -----------------------------------------
// Get Brand By ID
// -----------------------------------------
const getBrandById = async (req, res) => {
    try {
        const brand = await brand_service_1.default.getBrandById(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Brand retrieved successfully",
            data: brand,
        });
    }
    catch (error) {
        logger_1.default.error("Get brand by ID error: " + (error?.message || error));
        return res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || "Failed to get brand",
        });
    }
};
exports.getBrandById = getBrandById;
// -----------------------------------------
// Update Brand
// -----------------------------------------
const updateBrand = async (req, res) => {
    try {
        const brand = await brand_service_1.default.updateBrand(req.params.id, req.body, req.user);
        return res.status(200).json({
            success: true,
            message: "Brand updated successfully",
            data: brand,
        });
    }
    catch (error) {
        logger_1.default.error("Update brand error: " + (error?.message || error));
        return res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || "Failed to update brand",
            ...(error.errors && {
                errors: error.errors,
            }),
        });
    }
};
exports.updateBrand = updateBrand;
// -----------------------------------------
// Update Brand Status
// -----------------------------------------
const updateBrandStatus = async (req, res) => {
    try {
        const brand = await brand_service_1.default.updateBrandStatus(req.params.id, req.body.status, req.user);
        return res.status(200).json({
            success: true,
            message: "Brand status updated successfully",
            data: brand,
        });
    }
    catch (error) {
        logger_1.default.error("Update brand status error: " + (error?.message || error));
        return res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || "Failed to update brand status",
        });
    }
};
exports.updateBrandStatus = updateBrandStatus;
// -----------------------------------------
// Delete Brand
// -----------------------------------------
const deleteBrand = async (req, res) => {
    try {
        await brand_service_1.default.deleteBrand(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Brand deleted successfully",
        });
    }
    catch (error) {
        logger_1.default.error("Delete brand error: " + (error?.message || error));
        return res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || "Failed to delete brand",
        });
    }
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
//# sourceMappingURL=brand.controller.js.map