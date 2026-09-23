import { Document, Model } from "mongoose";
export interface IShippingZone extends Document {
    zone: string;
    rate: string;
    eta: string;
    partners: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const ShippingZone: Model<IShippingZone>;
export default ShippingZone;
