export interface LoginInput {
    email: string;
    password: string;
}
export declare const validateLoginInput: (data: any) => LoginInput;
declare const _default: {
    validateLoginInput: typeof validateLoginInput;
};
export default _default;
