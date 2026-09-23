export interface JwtTokenPayload {
    userId: string;
    iat?: number;
    exp?: number;
}
export declare const getJwtSecret: () => string;
export declare const generateToken: (userId: string | {
    toString(): string;
}) => string;
export declare const verifyToken: (token: string) => JwtTokenPayload;
