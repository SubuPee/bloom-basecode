import { Types } from "mongoose";
import { IOffer } from "../models/platform/Offer";
import { IPlatformTransaction } from "../models/platform/Transaction";
import { IPlatformPayout } from "../models/platform/Payout";
import { IPlatformRefund } from "../models/platform/Refund";
import { IPlatformReview } from "../models/platform/Review";
import { ISupportTicket } from "../models/platform/SupportTicket";
import { IShippingZone } from "../models/platform/ShippingZone";
export declare const ensurePlatformSeeded: () => Promise<void>;
declare class PlatformService {
    getOverview(): Promise<{
        kpis: {
            label: string;
            value: string;
            delta: string;
            tone: string;
        }[];
        recentTransactions: (IPlatformTransaction & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        activeOffers: (IOffer & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        recentReviews: (IPlatformReview & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        recentTickets: (ISupportTicket & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
    }>;
    getOffers(tab?: string, search?: string): Promise<(import("mongoose").Document<unknown, {}, IOffer, {}, import("mongoose").DefaultSchemaOptions> & IOffer & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getOfferById(id: string): Promise<(import("mongoose").Document<unknown, {}, IOffer, {}, import("mongoose").DefaultSchemaOptions> & IOffer & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    createOffer(data: any): Promise<import("mongoose").Document<unknown, {}, IOffer, {}, import("mongoose").DefaultSchemaOptions> & IOffer & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateOffer(id: string, data: any): Promise<import("mongoose").Document<unknown, {}, IOffer, {}, import("mongoose").DefaultSchemaOptions> & IOffer & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    deleteOffer(id: string): Promise<import("mongoose").Document<unknown, {}, IOffer, {}, import("mongoose").DefaultSchemaOptions> & IOffer & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getTransactions(status?: string, method?: string, search?: string): Promise<{
        transactions: (import("mongoose").Document<unknown, {}, IPlatformTransaction, {}, import("mongoose").DefaultSchemaOptions> & IPlatformTransaction & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        summary: {
            capturedTotal: number;
            totalCount: number;
        };
    }>;
    getPayouts(): Promise<(import("mongoose").Document<unknown, {}, IPlatformPayout, {}, import("mongoose").DefaultSchemaOptions> & IPlatformPayout & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getRefunds(): Promise<(import("mongoose").Document<unknown, {}, IPlatformRefund, {}, import("mongoose").DefaultSchemaOptions> & IPlatformRefund & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getReviews(status?: string): Promise<(import("mongoose").Document<unknown, {}, IPlatformReview, {}, import("mongoose").DefaultSchemaOptions> & IPlatformReview & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    createReview(data: any): Promise<import("mongoose").Document<unknown, {}, IPlatformReview, {}, import("mongoose").DefaultSchemaOptions> & IPlatformReview & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateReviewStatus(id: string, status: "Pending" | "Approved" | "Rejected"): Promise<import("mongoose").Document<unknown, {}, IPlatformReview, {}, import("mongoose").DefaultSchemaOptions> & IPlatformReview & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    deleteReview(id: string): Promise<import("mongoose").Document<unknown, {}, IPlatformReview, {}, import("mongoose").DefaultSchemaOptions> & IPlatformReview & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getTickets(status?: string): Promise<(import("mongoose").Document<unknown, {}, ISupportTicket, {}, import("mongoose").DefaultSchemaOptions> & ISupportTicket & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    createTicket(data: any): Promise<import("mongoose").Document<unknown, {}, ISupportTicket, {}, import("mongoose").DefaultSchemaOptions> & ISupportTicket & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateTicketStatus(id: string, status: "Open" | "In progress" | "Resolved" | "Closed"): Promise<import("mongoose").Document<unknown, {}, ISupportTicket, {}, import("mongoose").DefaultSchemaOptions> & ISupportTicket & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    deleteTicket(id: string): Promise<import("mongoose").Document<unknown, {}, ISupportTicket, {}, import("mongoose").DefaultSchemaOptions> & ISupportTicket & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getShippingZones(): Promise<(import("mongoose").Document<unknown, {}, IShippingZone, {}, import("mongoose").DefaultSchemaOptions> & IShippingZone & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    updateShippingZones(zones: any[]): Promise<(Omit<import("mongoose").Document<unknown, {}, IShippingZone, {}, import("mongoose").DefaultSchemaOptions> & IShippingZone & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, string | number | symbol> & Omit<any, "_id">)[]>;
}
declare const _default: PlatformService;
export default _default;
