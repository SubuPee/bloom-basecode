import { Document, Model } from "mongoose";
export interface ISupportTicket extends Document {
    ticketId: string;
    subject: string;
    customer: string;
    priority: "High" | "Medium" | "Low";
    status: "Open" | "In progress" | "Resolved" | "Closed";
    age: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const SupportTicket: Model<ISupportTicket>;
export default SupportTicket;
