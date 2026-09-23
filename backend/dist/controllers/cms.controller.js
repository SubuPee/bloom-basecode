"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCmsEntryHandler = exports.updateCmsEntryHandler = exports.createCmsEntryHandler = exports.getCmsEntryByIdHandler = exports.getStorefrontHeroHandler = exports.getCmsEntriesHandler = exports.getCmsStatsHandler = void 0;
const cms_service_1 = __importDefault(require("../services/cms.service"));
const cms_validation_1 = require("../validations/cms.validation");
const logger_1 = __importDefault(require("../utils/logger"));
// =====================================================
// 1. GET CMS STATS
// =====================================================
const getCmsStatsHandler = async (req, res) => {
    try {
        const stats = await cms_service_1.default.getCmsStats();
        res.status(200).json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        logger_1.default.error("Error in getCmsStatsHandler:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch CMS statistics",
        });
    }
};
exports.getCmsStatsHandler = getCmsStatsHandler;
// =====================================================
// 2. GET CMS ENTRIES LIST
// =====================================================
const getCmsEntriesHandler = async (req, res) => {
    try {
        const result = await cms_service_1.default.getCmsEntries(req.query);
        res.status(200).json({
            success: true,
            data: result.items,
            pagination: result.pagination,
        });
    }
    catch (error) {
        logger_1.default.error("Error in getCmsEntriesHandler:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch CMS entries",
        });
    }
};
exports.getCmsEntriesHandler = getCmsEntriesHandler;
// =====================================================
// 3. GET STOREFRONT HERO BANNER
// =====================================================
const getStorefrontHeroHandler = async (req, res) => {
    try {
        const hero = await cms_service_1.default.getStorefrontHero();
        if (!hero) {
            res.status(404).json({
                success: false,
                message: "No active storefront hero banner found",
            });
            return;
        }
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
// 4. GET CMS ENTRY BY ID OR SLUG
// =====================================================
const getCmsEntryByIdHandler = async (req, res) => {
    try {
        const idOrSlug = String(req.params.id);
        const entry = await cms_service_1.default.getCmsEntryById(idOrSlug);
        if (!entry) {
            res.status(404).json({
                success: false,
                message: `CMS entry with identifier '${idOrSlug}' not found`,
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: entry,
        });
    }
    catch (error) {
        logger_1.default.error("Error in getCmsEntryByIdHandler:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch CMS entry",
        });
    }
};
exports.getCmsEntryByIdHandler = getCmsEntryByIdHandler;
// =====================================================
// 5. CREATE CMS ENTRY
// =====================================================
const createCmsEntryHandler = async (req, res) => {
    try {
        const validationErrors = (0, cms_validation_1.validateCreateCms)(req.body);
        if (Object.keys(validationErrors).length > 0) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validationErrors,
            });
            return;
        }
        const userId = req.user?.id || req.user?._id;
        const entry = await cms_service_1.default.createCmsEntry(req.body, userId);
        res.status(201).json({
            success: true,
            message: "CMS entry created successfully",
            data: entry,
        });
    }
    catch (error) {
        logger_1.default.error("Error in createCmsEntryHandler:", error);
        const status = error.message?.includes("already exists") ? 409 : 500;
        res.status(status).json({
            success: false,
            message: error.message || "Failed to create CMS entry",
        });
    }
};
exports.createCmsEntryHandler = createCmsEntryHandler;
// =====================================================
// 6. UPDATE CMS ENTRY
// =====================================================
const updateCmsEntryHandler = async (req, res) => {
    try {
        const validationErrors = (0, cms_validation_1.validateUpdateCms)(req.body);
        if (Object.keys(validationErrors).length > 0) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validationErrors,
            });
            return;
        }
        const idOrSlug = String(req.params.id);
        const userId = req.user?.id || req.user?._id;
        const entry = await cms_service_1.default.updateCmsEntry(idOrSlug, req.body, userId);
        if (!entry) {
            res.status(404).json({
                success: false,
                message: `CMS entry with identifier '${idOrSlug}' not found`,
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "CMS entry updated successfully",
            data: entry,
        });
    }
    catch (error) {
        logger_1.default.error("Error in updateCmsEntryHandler:", error);
        const status = error.message?.includes("already exists") ? 409 : 500;
        res.status(status).json({
            success: false,
            message: error.message || "Failed to update CMS entry",
        });
    }
};
exports.updateCmsEntryHandler = updateCmsEntryHandler;
// =====================================================
// 7. DELETE CMS ENTRY
// =====================================================
const deleteCmsEntryHandler = async (req, res) => {
    try {
        const idOrSlug = String(req.params.id);
        const result = await cms_service_1.default.deleteCmsEntry(idOrSlug);
        if (!result) {
            res.status(404).json({
                success: false,
                message: `CMS entry with identifier '${idOrSlug}' not found`,
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "CMS entry deleted successfully",
            data: result,
        });
    }
    catch (error) {
        logger_1.default.error("Error in deleteCmsEntryHandler:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to delete CMS entry",
        });
    }
};
exports.deleteCmsEntryHandler = deleteCmsEntryHandler;
exports.default = {
    getCmsStatsHandler: exports.getCmsStatsHandler,
    getCmsEntriesHandler: exports.getCmsEntriesHandler,
    getStorefrontHeroHandler: exports.getStorefrontHeroHandler,
    getCmsEntryByIdHandler: exports.getCmsEntryByIdHandler,
    createCmsEntryHandler: exports.createCmsEntryHandler,
    updateCmsEntryHandler: exports.updateCmsEntryHandler,
    deleteCmsEntryHandler: exports.deleteCmsEntryHandler,
};
//# sourceMappingURL=cms.controller.js.map