import Attribute from "../../models/master/attribute.model";
import {
  validateCreateAttribute,
  validateUpdateAttribute,
  validateObjectId,
} from "../../validations/master/attribute.validation";

export interface CreateAttributeDto {
  attributeCode: string;
  attributeName: string;
  displayType?: "dropdown" | "radio" | "checkbox" | "text" | "color" | string;
  values?: Array<{ value: string; status?: "active" | "inactive" }>;
  status?: "active" | "inactive";
}

export interface UpdateAttributeDto {
  attributeCode?: string;
  attributeName?: string;
  displayType?: "dropdown" | "radio" | "checkbox" | "text" | "color" | string;
  values?: Array<{ value: string; status?: "active" | "inactive" }>;
  status?: "active" | "inactive";
}

export interface GetAttributesQuery {
  page?: number | string;
  limit?: number | string;
  search?: string;
  status?: string;
  displayType?: string;
}

const escapeRegex = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// -----------------------------------------
// Create Attribute
// -----------------------------------------
export const createAttribute = async (data: CreateAttributeDto, user?: any) => {
  const validation = validateCreateAttribute(data);

  if (!validation.isValid) {
    const error: any = new Error("Validation failed");
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }

  const attributeCode = data.attributeCode.trim().toUpperCase();
  const attributeName = data.attributeName.trim();

  const existingCode = await Attribute.findOne({
    attributeCode,
  });

  if (existingCode) {
    const error: any = new Error("Attribute code already exists");
    error.statusCode = 409;
    throw error;
  }

  const existingName = await Attribute.findOne({
    attributeName: {
      $regex: `^${escapeRegex(attributeName)}$`,
      $options: "i",
    },
  });

  if (existingName) {
    const error: any = new Error("Attribute name already exists");
    error.statusCode = 409;
    throw error;
  }

  const values = (data.values || []).map((item) => ({
    value: item.value.trim(),
    status: item.status || "active",
  }));

  const attribute = await Attribute.create({
    attributeCode,
    attributeName,
    displayType: (data.displayType || "dropdown") as any,
    values,
    status: data.status || "active",
    createdBy: user?._id || null,
  });

  return attribute;
};

// -----------------------------------------
// Get Attributes
// -----------------------------------------
export const getAttributes = async (query: GetAttributesQuery = {}) => {
  const { page = 1, limit = 10, search, status, displayType } = query;

  const pageNumber = Math.max(parseInt(String(page), 10) || 1, 1);
  const limitNumber = Math.min(Math.max(parseInt(String(limit), 10) || 10, 1), 100);
  const skip = (pageNumber - 1) * limitNumber;

  const filter: any = {};

  if (search && search.trim()) {
    const searchRegex = new RegExp(escapeRegex(search.trim()), "i");
    filter.$or = [
      { attributeCode: searchRegex },
      { attributeName: searchRegex },
      { "values.value": searchRegex },
    ];
  }

  if (status) {
    filter.status = status;
  }

  if (displayType) {
    filter.displayType = displayType;
  }

  const [attributes, total] = await Promise.all([
    Attribute.find(filter)
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean(),
    Attribute.countDocuments(filter),
  ]);

  return {
    attributes,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

// -----------------------------------------
// Get Attribute By ID
// -----------------------------------------
export const getAttributeById = async (id: string) => {
  if (!validateObjectId(id)) {
    const error: any = new Error("Invalid attribute ID");
    error.statusCode = 400;
    throw error;
  }

  const attribute = await Attribute.findById(id)
    .populate("createdBy", "firstName lastName email")
    .populate("updatedBy", "firstName lastName email");

  if (!attribute) {
    const error: any = new Error("Attribute not found");
    error.statusCode = 404;
    throw error;
  }

  return attribute;
};

// -----------------------------------------
// Update Attribute
// -----------------------------------------
export const updateAttribute = async (id: string, data: UpdateAttributeDto, user?: any) => {
  if (!validateObjectId(id)) {
    const error: any = new Error("Invalid attribute ID");
    error.statusCode = 400;
    throw error;
  }

  const validation = validateUpdateAttribute(data);

  if (!validation.isValid) {
    const error: any = new Error("Validation failed");
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }

  const attribute = await Attribute.findById(id);

  if (!attribute) {
    const error: any = new Error("Attribute not found");
    error.statusCode = 404;
    throw error;
  }

  if (data.attributeCode !== undefined) {
    const attributeCode = data.attributeCode.trim().toUpperCase();
    const existingCode = await Attribute.findOne({
      attributeCode,
      _id: { $ne: id },
    });

    if (existingCode) {
      const error: any = new Error("Attribute code already exists");
      error.statusCode = 409;
      throw error;
    }

    attribute.attributeCode = attributeCode;
  }

  if (data.attributeName !== undefined) {
    const attributeName = data.attributeName.trim();
    const existingName = await Attribute.findOne({
      attributeName: {
        $regex: `^${escapeRegex(attributeName)}$`,
        $options: "i",
      },
      _id: { $ne: id },
    });

    if (existingName) {
      const error: any = new Error("Attribute name already exists");
      error.statusCode = 409;
      throw error;
    }

    attribute.attributeName = attributeName;
  }

  if (data.displayType !== undefined) {
    attribute.displayType = data.displayType as any;
  }

  if (data.values !== undefined) {
    attribute.values = data.values.map((item) => ({
      value: item.value.trim(),
      status: item.status || "active",
    })) as any;
  }

  if (data.status !== undefined) {
    attribute.status = data.status;
  }

  attribute.updatedBy = user?._id || null;
  await attribute.save();

  return attribute;
};

// -----------------------------------------
// Update Attribute Status
// -----------------------------------------
export const updateAttributeStatus = async (id: string, status: string, user?: any) => {
  if (!validateObjectId(id)) {
    const error: any = new Error("Invalid attribute ID");
    error.statusCode = 400;
    throw error;
  }

  if (!["active", "inactive"].includes(status)) {
    const error: any = new Error("Status must be either active or inactive");
    error.statusCode = 400;
    throw error;
  }

  const attribute = await Attribute.findById(id);

  if (!attribute) {
    const error: any = new Error("Attribute not found");
    error.statusCode = 404;
    throw error;
  }

  attribute.status = status as "active" | "inactive";
  attribute.updatedBy = user?._id || null;
  await attribute.save();

  return attribute;
};

// -----------------------------------------
// Delete Attribute
// -----------------------------------------
export const deleteAttribute = async (id: string) => {
  if (!validateObjectId(id)) {
    const error: any = new Error("Invalid attribute ID");
    error.statusCode = 400;
    throw error;
  }

  const attribute = await Attribute.findById(id);

  if (!attribute) {
    const error: any = new Error("Attribute not found");
    error.statusCode = 404;
    throw error;
  }

  await Attribute.findByIdAndDelete(id);
  return true;
};

export default {
  createAttribute,
  getAttributes,
  getAttributeById,
  updateAttribute,
  updateAttributeStatus,
  deleteAttribute,
};
