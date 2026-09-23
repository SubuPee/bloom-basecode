"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleProductPublishHandler = exports.updateStorefrontConfigHandler = exports.getStorefrontConfigHandler = exports.getStorefrontHighlightsHandler = exports.getStorefrontProductsHandler = exports.getStorefrontHeroHandler = exports.getStorefrontPreviewHandler = void 0;
const storefront_service_1 = __importDefault(require("../services/storefront.service"));
const storefront_validation_1 = require("../validations/storefront.validation");
const logger_1 = __importDefault(require("../utils/logger"));
// =====================================================
// 1. GET STOREFRONT PREVIEW (COMPLETE BUNDLE)
// =====================================================
const getStorefrontPreviewHandler = async (req, res) => {
    try {
        const preview = await storefront_service_1.default.getStorefrontPreview();
        res.status(200).json({
            success: true,
            data: preview,
        });
    }
    catch (error) {
        logger_1.default.error("Error in getStorefrontPreviewHandler:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch storefront preview",
        });
    }
};
exports.getStorefrontPreviewHandler = getStorefrontPreviewHandler;
// =====================================================
// 2. GET STOREFRONT HERO BANNER
// =====================================================
const getStorefrontHeroHandler = async (req, res) => {
    try {
        const hero = await storefront_service_1.default.getStorefrontHero();
        res.status(200).json({
            success: true,
            data: hero,
        });
    }
    catch (error) {
        logger_1.default.error("Error in getStorefrontHeroHandler:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch storefront hero banner",
        });
    }
};
exports.getStorefrontHeroHandler = getStorefrontHeroHandler;
// =====================================================
// 3. GET PUBLISHED STOREFRONT PRODUCTS
// =====================================================
const getStorefrontProductsHandler = async (req, res) => {
    try {
        const result = await storefront_service_1.default.getStorefrontProducts(req.query);
        res.status(200).json({
            success: true,
            data: result.items,
            totalCount: result.totalCount,
        });
    }
    catch (error) {
        logger_1.default.error("Error in getStorefrontProductsHandler:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch storefront products",
        });
    }
};
exports.getStorefrontProductsHandler = getStorefrontProductsHandler;
// =====================================================
// 4. GET STOREFRONT HIGHLIGHTS
// =====================================================
const getStorefrontHighlightsHandler = async (req, res) => {
    try {
        const highlights = await storefront_service_1.default.getStorefrontHighlights();
        res.status(200).json({
            success: true,
            data: highlights,
        });
    }
    catch (error) {
        logger_1.default.error("Error in getStorefrontHighlightsHandler:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch storefront highlights",
        });
    }
};
exports.getStorefrontHighlightsHandler = getStorefrontHighlightsHandler;
// =====================================================
// 5. GET STOREFRONT CONFIG
// =====================================================
const getStorefrontConfigHandler = async (req, res) => {
    try {
        const config = await storefront_service_1.default.getStorefrontConfig();
        res.status(200).json({
            success: true,
            data: config,
        });
    }
    catch (error) {
        logger_1.default.error("Error in getStorefrontConfigHandler:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch storefront configuration",
        });
    }
};
exports.getStorefrontConfigHandler = getStorefrontConfigHandler;
// =====================================================
// 6. UPDATE STOREFRONT CONFIG
// =====================================================
const updateStorefrontConfigHandler = async (req, res) => {
    try {
        const validationErrors = (0, storefront_validation_1.validateUpdateStorefrontConfig)(req.body);
        if (Object.keys(validationErrors).length > 0) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validationErrors,
            });
            return;
        }
        const userId = req.user?.id || req.user?._id;
        const config = await storefront_service_1.default.updateStorefrontConfig(req.body, userId);
        res.status(200).json({
            success: true,
            message: "Storefront configuration updated successfully",
            data: config,
        });
    }
    catch (error) {
        logger_1.default.error("Error in updateStorefrontConfigHandler:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update storefront configuration",
        });
    }
};
exports.updateStorefrontConfigHandler = updateStorefrontConfigHandler;
// =====================================================
// 7. TOGGLE PRODUCT PUBLISH STATUS
// =====================================================
const toggleProductPublishHandler = async (req, res) => {
    try {
        const validationErrors = (0, storefront_validation_1.validatePublishToggle)(req.body);
        if (Object.keys(validationErrors).length > 0) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validationErrors,
            });
            return;
        }
        const productId = String(req.params.id);
        const result = await storefront_service_1.default.toggleProductPublish(productId, req.body.isPublished);
        if (!result) {
            res.status(404).json({
                success: false,
                message: `Product with identifier '${productId}' not found`,
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: `Product publication status updated to ${result.isPublished ? "published" : "hidden"}`,
            data: result,
        });
    }
    catch (error) {
        logger_1.default.error("Error in toggleProductPublishHandler:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to toggle product publish status",
        });
    }
};
exports.toggleProductPublishHandler = toggleProductPublishHandler;
exports.default = {
    getStorefrontPreviewHandler: exports.getStorefrontPreviewHandler,
    getStorefrontHeroHandler: exports.getStorefrontHeroHandler,
    getStorefrontProductsHandler: exports.getStorefrontProductsHandler,
    getStorefrontHighlightsHandler: exports.getStorefrontHighlightsHandler,
    getStorefrontConfigHandler: exports.getStorefrontConfigHandler,
    updateStorefrontConfigHandler: exports.updateStorefrontConfigHandler,
    toggleProductPublishHandler: exports.toggleProductPublishHandler,
};
//# sourceMappingURL=storefront.controller.js.map