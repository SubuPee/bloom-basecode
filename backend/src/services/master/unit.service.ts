import Unit from "../../models/master/unit.model";
import {
  validateCreateUnit,
  validateUpdateUnit,
  validateObjectId,
} from "../../validations/master/unit.validation";

export interface CreateUnitDto {
  unitCode: string;
  unitName: string;
  symbol: string;
  unitType: string;
  status?: "active" | "inactive";
}

export interface UpdateUnitDto {
  unitCode?: string;
  unitName?: string;
  symbol?: string;
  unitType?: string;
  status?: "active" | "inactive";
}

export interface GetUnitsQuery {
  page?: number | string;
  limit?: number | string;
  search?: string;
  status?: string;
  unitType?: string;
}

const escapeRegex = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// -----------------------------------------
// Create Unit
// -----------------------------------------
export const createUnit = async (data: CreateUnitDto, user?: any) => {
  const validation = validateCreateUnit(data);

  if (!validation.isValid) {
    const error: any = new Error("Validation failed");
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }

  const unitCode = data.unitCode.trim().toUpperCase();
  const unitName = data.unitName.trim();
  const symbol = data.symbol.trim().toUpperCase();
  const unitType = String(data.unitType).trim().toLowerCase();

  // Duplicate code
  const existingCode = await Unit.findOne({
    unitCode,
  });

  if (existingCode) {
    const error: any = new Error("Unit code already exists");
    error.statusCode = 409;
    throw error;
  }

  // Duplicate name
  const existingName = await Unit.findOne({
    unitName: {
      $regex: `^${escapeRegex(unitName)}$`,
      $options: "i",
    },
  });

  if (existingName) {
    const error: any = new Error("Unit name already exists");
    error.statusCode = 409;
    throw error;
  }

  // Duplicate symbol
  const existingSymbol = await Unit.findOne({
    symbol,
  });

  if (existingSymbol) {
    const error: any = new Error("Unit symbol already exists");
    error.statusCode = 409;
    throw error;
  }

  const unit = await Unit.create({
    unitCode,
    unitName,
    symbol,
    unitType: unitType as any,
    status: data.status || "active",
    createdBy: user?._id || null,
  });

  return unit;
};

// -----------------------------------------
// Get Units
// -----------------------------------------
export const getUnits = async (query: GetUnitsQuery = {}) => {
  const { page = 1, limit = 10, search, status, unitType } = query;

  const pageNumber = Math.max(parseInt(String(page), 10) || 1, 1);
  const limitNumber = Math.min(Math.max(parseInt(String(limit), 10) || 10, 1), 100);
  const skip = (pageNumber - 1) * limitNumber;

  const filter: any = {};

  if (search && search.trim()) {
    const searchRegex = new RegExp(escapeRegex(search.trim()), "i");
    filter.$or = [
      { unitCode: searchRegex },
      { unitName: searchRegex },
      { symbol: searchRegex },
    ];
  }

  if (status) {
    filter.status = status;
  }

  if (unitType) {
    filter.unitType = unitType.toLowerCase();
  }

  const [units, total] = await Promise.all([
    Unit.find(filter)
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean(),
    Unit.countDocuments(filter),
  ]);

  return {
    units,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

// -----------------------------------------
// Get Unit By ID
// -----------------------------------------
export const getUnitById = async (id: string) => {
  if (!validateObjectId(id)) {
    const error: any = new Error("Invalid unit ID");
    error.statusCode = 400;
    throw error;
  }

  const unit = await Unit.findById(id)
    .populate("createdBy", "firstName lastName email")
    .populate("updatedBy", "firstName lastName email");

  if (!unit) {
    const error: any = new Error("Unit not found");
    error.statusCode = 404;
    throw error;
  }

  return unit;
};

// -----------------------------------------
// Update Unit
// -----------------------------------------
export const updateUnit = async (id: string, data: UpdateUnitDto, user?: any) => {
  if (!validateObjectId(id)) {
    const error: any = new Error("Invalid unit ID");
    error.statusCode = 400;
    throw error;
  }

  const validation = validateUpdateUnit(data);

  if (!validation.isValid) {
    const error: any = new Error("Validation failed");
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }

  const unit = await Unit.findById(id);

  if (!unit) {
    const error: any = new Error("Unit not found");
    error.statusCode = 404;
    throw error;
  }

  // Unit Code
  if (data.unitCode !== undefined) {
    const unitCode = data.unitCode.trim().toUpperCase();

    const existingCode = await Unit.findOne({
      unitCode,
      _id: { $ne: id },
    });

    if (existingCode) {
      const error: any = new Error("Unit code already exists");
      error.statusCode = 409;
      throw error;
    }

    unit.unitCode = unitCode;
  }

  // Unit Name
  if (data.unitName !== undefined) {
    const unitName = data.unitName.trim();

    const existingName = await Unit.findOne({
      unitName: {
        $regex: `^${escapeRegex(unitName)}$`,
        $options: "i",
      },
      _id: { $ne: id },
    });

    if (existingName) {
      const error: any = new Error("Unit name already exists");
      error.statusCode = 409;
      throw error;
    }

    unit.unitName = unitName;
  }

  // Symbol
  if (data.symbol !== undefined) {
    const symbol = data.symbol.trim().toUpperCase();

    const existingSymbol = await Unit.findOne({
      symbol,
      _id: { $ne: id },
    });

    if (existingSymbol) {
      const error: any = new Error("Unit symbol already exists");
      error.statusCode = 409;
      throw error;
    }

    unit.symbol = symbol;
  }

  // Unit Type
  if (data.unitType !== undefined) {
    unit.unitType = String(data.unitType).trim().toLowerCase() as any;
  }

  // Status
  if (data.status !== undefined) {
    unit.status = data.status;
  }

  unit.updatedBy = user?._id || null;
  await unit.save();

  return unit;
};

// -----------------------------------------
// Update Unit Status
// -----------------------------------------
export const updateUnitStatus = async (id: string, status: string, user?: any) => {
  if (!validateObjectId(id)) {
    const error: any = new Error("Invalid unit ID");
    error.statusCode = 400;
    throw error;
  }

  if (!["active", "inactive"].includes(status)) {
    const error: any = new Error("Status must be either active or inactive");
    error.statusCode = 400;
    throw error;
  }

  const unit = await Unit.findById(id);

  if (!unit) {
    const error: any = new Error("Unit not found");
    error.statusCode = 404;
    throw error;
  }

  unit.status = status as "active" | "inactive";
  unit.updatedBy = user?._id || null;
  await unit.save();

  return unit;
};

// -----------------------------------------
// Delete Unit
// -----------------------------------------
export const deleteUnit = async (id: string) => {
  if (!validateObjectId(id)) {
    const error: any = new Error("Invalid unit ID");
    error.statusCode = 400;
    throw error;
  }

  const unit = await Unit.findById(id);

  if (!unit) {
    const error: any = new Error("Unit not found");
    error.statusCode = 404;
    throw error;
  }

  await Unit.findByIdAndDelete(id);
  return true;
};

export default {
  createUnit,
  getUnits,
  getUnitById,
  updateUnit,
  updateUnitStatus,
  deleteUnit,
};
