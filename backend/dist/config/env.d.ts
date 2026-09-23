export interface EnvironmentConfig {
    NODE_ENV: string;
    PORT: number;
    MONGO_URI: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    API_URL: string;
    CORS_ORIGIN: string;
    isProduction: boolean;
    isDevelopment: boolean;
}
export declare const env: Readonly<EnvironmentConfig>;
export default env;
