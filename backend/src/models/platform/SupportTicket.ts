import mongoose, { Document, Schema, Model } from "mongoose";

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

const supportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    customer: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Open", "In progress", "Resolved", "Closed"],
      default: "Open",
    },
    age: {
      type: String,
      default: "Just now",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

supportTicketSchema.index({ ticketId: 1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ priority: 1 });

const SupportTicket: Model<ISupportTicket> =
  mongoose.models.SupportTicket ||
  mongoose.model<ISupportTicket>("SupportTicket", supportTicketSchema);

export default SupportTicket;
