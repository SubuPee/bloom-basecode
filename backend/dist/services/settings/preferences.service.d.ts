import { IWorkspaceSettings } from "../../models/settings/WorkspaceSettings";
export declare const getPreferences: () => Promise<import("mongoose").Document<unknown, {}, IWorkspaceSettings, {}, import("mongoose").DefaultSchemaOptions> & IWorkspaceSettings & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const updatePreferences: (data: {
    storeDetails?: Partial<IWorkspaceSettings["storeDetails"]>;
    regional?: Partial<IWorkspaceSettings["regional"]>;
    notificationPreferences?: Partial<IWorkspaceSettings["notificationPreferences"]>;
}) => Promise<import("mongoose").Document<unknown, {}, IWorkspaceSettings, {}, import("mongoose").DefaultSchemaOptions> & IWorkspaceSettings & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
