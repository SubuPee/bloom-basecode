import { Document, Model } from "mongoose";
export interface IWorkspaceSettings extends Document {
    storeDetails: {
        storeName: string;
        supportEmail: string;
        supportPhone: string;
        storefrontDomain: string;
    };
    regional: {
        currency: string;
        timezone: string;
        dateFormat: string;
        weightUnit: string;
    };
    notificationPreferences: {
        orders: boolean;
        stock: boolean;
        payouts: boolean;
        reviews: boolean;
        security: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const WorkspaceSettings: Model<IWorkspaceSettings>;
export default WorkspaceSettings;
