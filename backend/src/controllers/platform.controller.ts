import { Request, Response } from "express";
import platformService from "../services/platform.service";
import logger from "../utils/logger";

// =====================================================
// 1. OVERVIEW
// =====================================================

export const getPlatformOverviewHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const overview = await platformService.getOverview();
    res.status(200).json({
      success: true,
      data: overview,
    });
  } catch (error: any) {
    logger.error("Error in getPlatformOverviewHandler:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch platform overview",
    });
  }
};

// =====================================================
// 2. OFFERS
// =====================================================

export const getOffersHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { tab, search } = req.query;
    const offers = await platformService.getOffers(
      tab as string | undefined,
      search as string | undefined
    );
    res.status(200).json({
      success: true,
      data: offers,
    });
  } catch (error: any) {
    logger.error("Error in getOffersHandler:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch offers",
    });
  }
};

export const getOfferByIdHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const offer = await platformService.getOfferById(req.params.id as string);
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
  } catch (error: any) {
    logger.error("Error in getOfferByIdHandler:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch offer",
    });
  }
};

export const createOfferHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { code, title, type, value, minOrder, limit, status, window, audience } = req.body;
    if (!code || !title || !value) {
      res.status(400).json({
        success: false,
        message: "Code, title, and value are required fields",
      });
      return;
    }
    const offer = await platformService.createOffer({
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
  } catch (error: any) {
    logger.error("Error in createOfferHandler:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create offer",
    });
  }
};

export const updateOfferHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const offer = await platformService.updateOffer(req.params.id as string, req.body);
    res.status(200).json({
      success: true,
      data: offer,
      message: "Offer updated successfully",
    });
  } catch (error: any) {
    logger.error("Error in updateOfferHandler:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update offer",
    });
  }
};

export const deleteOfferHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await platformService.deleteOffer(req.params.id as string);
    res.status(200).json({
      success: true,
      message: "Offer deleted successfully",
    });
  } catch (error: any) {
    logger.error("Error in deleteOfferHandler:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to delete offer",
    });
  }
};

// =====================================================
// 3. PAYMENTS & PAYOUTS
// =====================================================

export const getTransactionsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status, method, search } = req.query;
    const result = await platformService.getTransactions(
      status as string | undefined,
      method as string | undefined,
      search as string | undefined
    );
    res.status(200).json({
      success: true,
      data: result.transactions,
      summary: result.summary,
    });
  } catch (error: any) {
    logger.error("Error in getTransactionsHandler:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch transactions",
    });
  }
};

export const getPayoutsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const payouts = await platformService.getPayouts();
    res.status(200).json({
      success: true,
      data: payouts,
    });
  } catch (error: any) {
    logger.error("Error in getPayoutsHandler:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch payouts",
    });
  }
};

export const getRefundsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const refunds = await platformService.getRefunds();
    res.status(200).json({
      success: true,
      data: refunds,
    });
  } catch (error: any) {
    logger.error("Error in getRefundsHandler:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch refunds",
    });
  }
};

// =====================================================
// 4. REVIEWS
// =====================================================

export const getReviewsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.query;
    const reviews = await platformService.getReviews(status as string | undefined);
    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error: any) {
    logger.error("Error in getReviewsHandler:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch reviews",
    });
  }
};

export const createReviewHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { product, customer, rating, text } = req.body;
    if (!product || !customer || !rating || !text) {
      res.status(400).json({
        success: false,
        message: "Product, customer, rating, and text are required fields",
      });
      return;
    }
    const review = await platformService.createReview({
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
  } catch (error: any) {
    logger.error("Error in createReviewHandler:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create review",
    });
  }
};

export const updateReviewStatusHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.body;
    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      res.status(400).json({
        success: false,
        message: "Status must be Pending, Approved, or Rejected",
      });
      return;
    }
    const review = await platformService.updateReviewStatus(req.params.id as string, status);
    res.status(200).json({
      success: true,
      data: review,
      message: `Review status updated to ${status}`,
    });
  } catch (error: any) {
    logger.error("Error in updateReviewStatusHandler:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update review status",
    });
  }
};

export const deleteReviewHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await platformService.deleteReview(req.params.id as string);
    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error: any) {
    logger.error("Error in deleteReviewHandler:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to delete review",
    });
  }
};

// =====================================================
// 5. SUPPORT TICKETS
// =====================================================

export const getTicketsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.query;
    const tickets = await platformService.getTickets(status as string | undefined);
    res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (error: any) {
    logger.error("Error in getTicketsHandler:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch support tickets",
    });
  }
};

export const createTicketHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { subject, customer, priority } = req.body;
    if (!subject || !customer) {
      res.status(400).json({
        success: false,
        message: "Subject and customer are required fields",
      });
      return;
    }
    const ticket = await platformService.createTicket({
      subject,
      customer,
      priority: priority || "Medium",
    });
    res.status(201).json({
      success: true,
      data: ticket,
      message: "Support ticket created successfully",
    });
  } catch (error: any) {
    logger.error("Error in createTicketHandler:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create support ticket",
    });
  }
};

export const updateTicketStatusHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.body;
    if (!["Open", "In progress", "Resolved", "Closed"].includes(status)) {
      res.status(400).json({
        success: false,
        message: "Status must be Open, In progress, Resolved, or Closed",
      });
      return;
    }
    const ticket = await platformService.updateTicketStatus(req.params.id as string, status);
    res.status(200).json({
      success: true,
      data: ticket,
      message: `Ticket status updated to ${status}`,
    });
  } catch (error: any) {
    logger.error("Error in updateTicketStatusHandler:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update ticket status",
    });
  }
};

export const deleteTicketHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await platformService.deleteTicket(req.params.id as string);
    res.status(200).json({
      success: true,
      message: "Ticket deleted successfully",
    });
  } catch (error: any) {
    logger.error("Error in deleteTicketHandler:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to delete ticket",
    });
  }
};

// =====================================================
// 6. SHIPPING ZONES
// =====================================================

export const getShippingZonesHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const zones = await platformService.getShippingZones();
    res.status(200).json({
      success: true,
      data: zones,
    });
  } catch (error: any) {
    logger.error("Error in getShippingZonesHandler:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch shipping zones",
    });
  }
};

export const updateShippingZonesHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { zones } = req.body;
    if (!Array.isArray(zones)) {
      res.status(400).json({
        success: false,
        message: "Zones must be an array",
      });
      return;
    }
    const updated = await platformService.updateShippingZones(zones);
    res.status(200).json({
      success: true,
      data: updated,
      message: "Shipping zones updated successfully",
    });
  } catch (error: any) {
    logger.error("Error in updateShippingZonesHandler:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update shipping zones",
    });
  }
};
