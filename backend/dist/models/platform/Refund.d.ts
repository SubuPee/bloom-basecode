import { Document, Model } from "mongoose";
export interface IPlatformRefund extends Document {
    refundId: string;
    orderId: string;
    customer: string;
    amount: number;
    reason: string;
    status: "Processed" | "In review" | "Rejected";
    date: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const PlatformRefund: Model<IPlatformRefund>;
export default PlatformRefund;
