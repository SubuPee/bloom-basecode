"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateShippingZonesHandler = exports.getShippingZonesHandler = exports.deleteTicketHandler = exports.updateTicketStatusHandler = exports.createTicketHandler = exports.getTicketsHandler = exports.deleteReviewHandler = exports.updateReviewStatusHandler = exports.createReviewHandler = exports.getReviewsHandler = exports.getRefundsHandler = exports.getPayoutsHandler = exports.getTransactionsHandler = exports.deleteOfferHandler = exports.updateOfferHandler = exports.createOfferHandler = exports.getOfferByIdHandler = exports.getOffersHandler = exports.getPlatformOverviewHandler = void 0;
const platform_service_1 = __importDefault(require("../services/platform.service"));
const logger_1 = __importDefault(require("../utils/logger"));
// =====================================================
// 1. OVERVIEW
// =====================================================
const getPlatformOverviewHandler = async (req, res) => {
    try {
        const overview = await platform_service_1.default.getOverview();
        res.status(200).json({
            success: true,
            data: overview,
        });
    }
    catch (error) {
        logger_1.default.error("Error in getPlatformOverviewHandler:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch platform overview",
        });
    }
};
exports.getPlatformOverviewHandler = getPlatformOverviewHandler;
// =====================================================
// 2. OFFERS
// =====================================================
const getOffersHandler = async (req, res) => {
    try {
        const { tab, search } = req.query;
        const offers = await platform_service_1.default.getOffers(tab, search);
        res.status(200).json({
            success: true,
            data: offers,
        });
    }
    catch (error) {
        logger_1.default.error("Error in getOffersHandler:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch offers",
        });
    }
};
exports.getOffersHandler = getOffersHandler;
const getOfferByIdHandler = async (req, res) => {
    try {
        const offer = await platform_service_1.default.getOfferById(req.params.id);
        if (!offer) {
            res.status(404).json({
                success: false,
                message: "Offer not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: offer,
        });
    }
    catch (error) {
        logger_1.default.error("Error in getOfferByIdHandler:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch offer",
        });
    }
};
exports.getOfferByIdHandler = getOfferByIdHandler;
const createOfferHandler = async (req, res) => {
    try {
        const { code, title, type, value, minOrder, limit, status, window, audience } = req.body;
        if (!code || !title || !value) {
            res.status(400).json({
                success: false,
                message: "Code, title, and value are required fields",
            });
            return;
        }
        const offer = await platform_service_1.default.createOffer({
            code,
            title,
            type: type || "Percent",
            value,
            minOrder: Number(minOrder) || 0,
            limit: Number(limit) || 1000,
            status: status || "Active",
            window: window || "Always on",
            audience: audience || "All customers",
        });
        res.status(201).json({
            success: true,
            data: offer,
            message: "Offer created successfully",
        });
    }
    catch (error) {
        logger_1.default.error("Error in createOfferHandler:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to create offer",
        });
    }
};
exports.createOfferHandler = createOfferHandler;
const updateOfferHandler = async (req, res) => {
    try {
        const offer = await platform_service_1.default.updateOffer(req.params.id, req.body);
        res.status(200).json({
            success: true,
            data: offer,
            message: "Offer updated successfully",
        });
    }
    catch (error) {
        logger_1.default.error("Error in updateOfferHandler:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to update offer",
        });
    }
};
exports.updateOfferHandler = updateOfferHandler;
const deleteOfferHandler = async (req, res) => {
    try {
        await platform_service_1.default.deleteOffer(req.params.id);
        res.status(200).json({
            success: true,
            message: "Offer deleted successfully",
        });
    }
    catch (error) {
        logger_1.default.error("Error in deleteOfferHandler:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to delete offer",
        });
    }
};
exports.deleteOfferHandler = deleteOfferHandler;
// =====================================================
// 3. PAYMENTS & PAYOUTS
// =====================================================
const getTransactionsHandler = async (req, res) => {
    try {
        const { status, method, search } = req.query;
        const result = await platform_service_1.default.getTransactions(status, method, search);
        res.status(200).json({
            success: true,
            data: result.transactions,
            summary: result.summary,
        });
    }
    catch (error) {
        logger_1.default.error("Error in getTransactionsHandler:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch transactions",
        });
    }
};
exports.getTransactionsHandler = getTransactionsHandler;
const getPayoutsHandler = async (req, res) => {
    try {
        const payouts = await platform_service_1.default.getPayouts();
        res.status(200).json({
            success: true,
            data: payouts,
        });
    }
    catch (error) {
        logger_1.default.error("Error in getPayoutsHandler:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch payouts",
        });
    }
};
exports.getPayoutsHandler = getPayoutsHandler;
const getRefundsHandler = async (req, res) => {
    try {
        const refunds = await platform_service_1.default.getRefunds();
        res.status(200).json({
            success: true,
            data: refunds,
        });
    }
    catch (error) {
        logger_1.default.error("Error in getRefundsHandler:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch refunds",
        });
    }
};
exports.getRefundsHandler = getRefundsHandler;
// =====================================================
// 4. REVIEWS
// =====================================================
const getReviewsHandler = async (req, res) => {
    try {
        const { status } = req.query;
        const reviews = await platform_service_1.default.getReviews(status);
        res.status(200).json({
            success: true,
            data: reviews,
        });
    }
    catch (error) {
        logger_1.default.error("Error in getReviewsHandler:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch reviews",
        });
    }
};
exports.getReviewsHandler = getReviewsHandler;
const createReviewHandler = async (req, res) => {
    try {
        const { product, customer, rating, text } = req.body;
        if (!product || !customer || !rating || !text) {
            res.status(400).json({
                success: false,
                message: "Product, customer, rating, and text are required fields",
            });
            return;
        }
        const review = await platform_service_1.default.createReview({
            product,
            customer,
            rating: Number(rating),
            text,
        });
        res.status(201).json({
            success: true,
            data: review,
            message: "Review created successfully",
        });
    }
    catch (error) {
        logger_1.default.error("Error in createReviewHandler:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to create review",
        });
    }
};
exports.createReviewHandler = createReviewHandler;
const updateReviewStatusHandler = async (req, res) => {
    try {
        const { status } = req.body;
        if (!["Pending", "Approved", "Rejected"].includes(status)) {
            res.status(400).json({
                success: false,
                message: "Status must be Pending, Approved, or Rejected",
            });
            return;
        }
        const review = await platform_service_1.default.updateReviewStatus(req.params.id, status);
        res.status(200).json({
            success: true,
            data: review,
            message: `Review status updated to ${status}`,
        });
    }
    catch (error) {
        logger_1.default.error("Error in updateReviewStatusHandler:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to update review status",
        });
    }
};
exports.updateReviewStatusHandler = updateReviewStatusHandler;
const deleteReviewHandler = async (req, res) => {
    try {
        await platform_service_1.default.deleteReview(req.params.id);
        res.status(200).json({
            success: true,
            message: "Review deleted successfully",
        });
    }
    catch (error) {
        logger_1.default.error("Error in deleteReviewHandler:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to delete review",
        });
    }
};
exports.deleteReviewHandler = deleteReviewHandler;
// =====================================================
// 5. SUPPORT TICKETS
// =====================================================
const getTicketsHandler = async (req, res) => {
    try {
        const { status } = req.query;
        const tickets = await platform_service_1.default.getTickets(status);
        res.status(200).json({
            success: true,
            data: tickets,
        });
    }
    catch (error) {
        logger_1.default.error("Error in getTicketsHandler:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch support tickets",
        });
    }
};
exports.getTicketsHandler = getTicketsHandler;
const createTicketHandler = async (req, res) => {
    try {
        const { subject, customer, priority } = req.body;
        if (!subject || !customer) {
            res.status(400).json({
                success: false,
                message: "Subject and customer are required fields",
            });
            return;
        }
        const ticket = await platform_service_1.default.createTicket({
            subject,
            customer,
            priority: priority || "Medium",
        });
        res.status(201).json({
            success: true,
            data: ticket,
            message: "Support ticket created successfully",
        });
    }
    catch (error) {
        logger_1.default.error("Error in createTicketHandler:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to create support ticket",
        });
    }
};
exports.createTicketHandler = createTicketHandler;
const updateTicketStatusHandler = async (req, res) => {
    try {
        const { status } = req.body;
        if (!["Open", "In progress", "Resolved", "Closed"].includes(status)) {
            res.status(400).json({
                success: false,
                message: "Status must be Open, In progress, Resolved, or Closed",
            });
            return;
        }
        const ticket = await platform_service_1.default.updateTicketStatus(req.params.id, status);
        res.status(200).json({
            success: true,
            data: ticket,
            message: `Ticket status updated to ${status}`,
        });
    }
    catch (error) {
        logger_1.default.error("Error in updateTicketStatusHandler:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to update ticket status",
        });
    }
};
exports.updateTicketStatusHandler = updateTicketStatusHandler;
const deleteTicketHandler = async (req, res) => {
    try {
        await platform_service_1.default.deleteTicket(req.params.id);
        res.status(200).json({
            success: true,
            message: "Ticket deleted successfully",
        });
    }
    catch (error) {
        logger_1.default.error("Error in deleteTicketHandler:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to delete ticket",
        });
    }
};
exports.deleteTicketHandler = deleteTicketHandler;
// =====================================================
// 6. SHIPPING ZONES
// =====================================================
const getShippingZonesHandler = async (req, res) => {
    try {
        const zones = await platform_service_1.default.getShippingZones();
        res.status(200).json({
            success: true,
            data: zones,
        });
    }
    catch (error) {
        logger_1.default.error("Error in getShippingZonesHandler:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch shipping zones",
        });
    }
};
exports.getShippingZonesHandler = getShippingZonesHandler;
const updateShippingZonesHandler = async (req, res) => {
    try {
        const { zones } = req.body;
        if (!Array.isArray(zones)) {
            res.status(400).json({
                success: false,
                message: "Zones must be an array",
            });
            return;
        }
        const updated = await platform_service_1.default.updateShippingZones(zones);
        res.status(200).json({
            success: true,
            data: updated,
            message: "Shipping zones updated successfully",
        });
    }
    catch (error) {
        logger_1.default.error("Error in updateShippingZonesHandler:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to update shipping zones",
        });
    }
};
exports.updateShippingZonesHandler = updateShippingZonesHandler;
//# sourceMappingURL=platform.controller.js.map