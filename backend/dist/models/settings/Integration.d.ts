import { Document, Model } from "mongoose";
export type IntegrationStatus = "Connected" | "Not connected";
export interface IIntegration extends Document {
    key: string;
    name: string;
    category: string;
    status: IntegrationStatus;
    detail: string;
    config?: Record<string, any>;
    lastSyncedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Integration: Model<IIntegration>;
export default Integration;
