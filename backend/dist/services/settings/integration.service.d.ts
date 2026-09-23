import { IIntegration } from "../../models/settings/Integration";
export declare const ensureDefaultIntegrations: () => Promise<void>;
export declare const getIntegrations: () => Promise<{
    id: string;
    key: string;
    name: string;
    category: string;
    status: import("../../models/settings/Integration").IntegrationStatus;
    detail: string;
    config: Record<string, any>;
    lastSyncedAt: Date | undefined;
}[]>;
export declare const toggleIntegration: (idOrKey: string) => Promise<import("mongoose").Document<unknown, {}, IIntegration, {}, import("mongoose").DefaultSchemaOptions> & IIntegration & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const configureIntegration: (idOrKey: string, data: {
    detail?: string;
    config?: Record<string, any>;
    status?: "Connected" | "Not connected";
}) => Promise<import("mongoose").Document<unknown, {}, IIntegration, {}, import("mongoose").DefaultSchemaOptions> & IIntegration & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
