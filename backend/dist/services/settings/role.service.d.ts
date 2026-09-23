export declare const defaultPermissionModules: readonly ["Dashboard", "Vendors", "Inventory", "Production", "Transactions", "Settlements", "Products", "Orders", "Customers", "CMS", "Settings"];
export declare const ensureDefaultRoles: () => Promise<void>;
export declare const getRoles: () => Promise<{
    id: any;
    name: any;
    description: any;
    scope: any;
    isSystemRole: any;
    members: number;
    permissions: Record<string, string[]>;
}[]>;
export declare const getRoleById: (id: string) => Promise<{
    id: any;
    name: string;
    description: string;
    scope: any;
    isSystemRole: boolean;
    membersCount: number;
    permissions: Record<string, string[]>;
    members: {
        id: any;
        name: string;
        email: any;
        initials: string;
        lastActive: string;
    }[];
}>;
export declare const createRole: (data: {
    name: string;
    description?: string;
    scope?: string;
    modulePermissions?: Record<string, string[]>;
}) => Promise<{
    id: any;
    name: string;
    description: string;
    scope: any;
    isSystemRole: boolean;
    membersCount: number;
    permissions: Record<string, string[]>;
    members: {
        id: any;
        name: string;
        email: any;
        initials: string;
        lastActive: string;
    }[];
}>;
export declare const updateRole: (id: string, data: {
    name?: string;
    description?: string;
    scope?: string;
    modulePermissions?: Record<string, string[]>;
}) => Promise<{
    id: any;
    name: string;
    description: string;
    scope: any;
    isSystemRole: boolean;
    membersCount: number;
    permissions: Record<string, string[]>;
    members: {
        id: any;
        name: string;
        email: any;
        initials: string;
        lastActive: string;
    }[];
}>;
export declare const deleteRole: (id: string) => Promise<{
    message: string;
}>;
