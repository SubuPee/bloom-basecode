import { Document, Model, Types } from "mongoose";
export interface IAttributeValue {
    _id?: Types.ObjectId;
    value: string;
    status: "active" | "inactive";
}
export interface IAttribute extends Document {
    attributeCode: string;
    attributeName: string;
    displayType: "dropdown" | "radio" | "checkbox" | "text" | "color";
    values: IAttributeValue[];
    status: "active" | "inactive";
    createdBy?: Types.ObjectId | null;
    updatedBy?: Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Attribute: Model<IAttribute>;
export default Attribute;
