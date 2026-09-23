import { Document, Model } from "mongoose";
export interface IPlatformReview extends Document {
    reviewId: string;
    product: string;
    customer: string;
    rating: number;
    text: string;
    status: "Pending" | "Approved" | "Rejected";
    date: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const PlatformReview: Model<IPlatformReview>;
export default PlatformReview;
