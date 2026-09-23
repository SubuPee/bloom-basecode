import { Document, Model } from "mongoose";
export interface IPlatformTransaction extends Document {
    txnId: string;
    orderId: string;
    customer: string;
    method: "UPI" | "Card" | "Netbanking" | "COD" | "Wallet";
    amount: number;
    status: "Captured" | "Pending" | "Refunded" | "Failed";
    date: string;
    gateway: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const PlatformTransaction: Model<IPlatformTransaction>;
export default PlatformTransaction;
