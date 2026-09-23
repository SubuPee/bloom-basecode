import { LoginDto, AuthUserResponse, AuthenticatedUser } from "../types/common.types";
export interface LoginResult {
    token: string;
    user: AuthUserResponse;
}
export declare const loginAdmin: ({ email, password }: LoginDto) => Promise<LoginResult>;
export declare const getCurrentUser: (user: AuthenticatedUser | any) => Promise<AuthUserResponse>;
declare const _default: {
    loginAdmin: typeof loginAdmin;
    getCurrentUser: typeof getCurrentUser;
};
export default _default;
