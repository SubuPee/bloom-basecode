import { Document, Model } from "mongoose";
export interface IProduct extends Document {
    [key: string]: any;
}
export declare const Product: Model<IProduct>;
export default Product;
