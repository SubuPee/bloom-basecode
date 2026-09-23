import { Document, Model } from "mongoose";
export interface IOffer extends Document {
    code: string;
    title: string;
    type: "Percent" | "Flat" | "Free shipping" | "BOGO";
    value: string;
    minOrder: number;
    used: number;
    limit: number;
    status: "Active" | "Scheduled" | "Expired";
    window: string;
    audience: string;
    isActive: boolean;
    softDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const Offer: Model<IOffer>;
export default Offer;
