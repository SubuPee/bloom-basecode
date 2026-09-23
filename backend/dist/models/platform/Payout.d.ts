import { Document, Model } from "mongoose";
export interface IPlatformPayout extends Document {
    payoutId: string;
    period: string;
    gross: number;
    fees: number;
    refunds: number;
    net: number;
    status: "Settled" | "Pending" | "Processing";
    bank: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const PlatformPayout: Model<IPlatformPayout>;
export default PlatformPayout;
