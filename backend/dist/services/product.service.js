"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.getProductStats = exports.getProductOrders = exports.bulkDelete = exports.bulkUpdatePublish = exports.bulkUpdateStatus = exports.duplicateProduct = exports.updateProductStatus = exports.updateProduct = exports.getProductById = exports.getProducts = exports.createProduct = exports.seedCatalogIfEmpty = exports.findProductByIdOrIdentifier = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Product_1 = __importDefault(require("../models/Product"));
const category_model_1 = __importDefault(require("../models/master/category.model"));
const subCategory_model_1 = __importDefault(require("../models/master/subCategory.model"));
const brand_model_1 = __importDefault(require("../models/master/brand.model"));
const unit_model_1 = __importDefault(require("../models/master/unit.model"));
const tax_model_1 = __importDefault(require("../models/master/tax.model"));
const attribute_model_1 = __importDefault(require("../models/master/attribute.model"));
const warehouse_model_1 = __importDefault(require("../models/master/warehouse.model"));
const Vendor_1 = __importDefault(require("../models/Vendor"));
const InventoryStock_1 = require("../models/inventory/InventoryStock");
const VendorRelated_1 = require("../models/VendorRelated");
const product_validation_1 = require("../validations/product.validation");
// =====================================================
// HELPERS
// =====================================================
const escapeRegex = (value = "") => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
const createError = (message, statusCode = 400, errors = null) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    if (errors) {
        error.errors = errors;
    }
    return error;
};
const normalizeString = (value) => {
    if (typeof value !== "string") {
        return value;
    }
    return value.trim();
};
const normalizeProductData = (data) => {
    const normalized = {
        ...data,
    };
    if (normalized.productName) {
        normalized.productName = normalizeString(normalized.productName);
    }
    if (normalized.productCode) {
        normalized.productCode = normalizeString(normalized.productCode).toUpperCase();
    }
    else if (normalized.productName) {
        normalized.productCode = `PRD-${Date.now().toString().slice(-6)}`;
    }
    // Parse numeric values
    if (normalized.sellingPrice !== undefined && normalized.sellingPrice !== "") {
        normalized.sellingPrice = Number(normalized.sellingPrice);
    }
    if (normalized.mrp !== undefined && normalized.mrp !== "") {
        normalized.mrp = Number(normalized.mrp);
    }
    else if (normalized.sellingPrice !== undefined && normalized.sellingPrice !== "") {
        normalized.mrp = Number(normalized.sellingPrice);
    }
    if (normalized.purchasePrice !== undefined && normalized.purchasePrice !== "") {
        normalized.purchasePrice = Number(normalized.purchasePrice);
    }
    if (normalized.reorderLevel !== undefined && normalized.reorderLevel !== "") {
        normalized.reorderLevel = Number(normalized.reorderLevel);
    }
    if (normalized.stockQuantity !== undefined && normalized.stockQuantity !== "") {
        normalized.stockQuantity = Number(normalized.stockQuantity);
    }
    if (normalized.weight !== undefined && normalized.weight !== "") {
        normalized.weight = Number(normalized.weight);
    }
    // Parse boolean values
    if (normalized.isPublished !== undefined) {
        normalized.isPublished = normalized.isPublished === true || normalized.isPublished === "true";
    }
    if (normalized.isFeatured !== undefined) {
        normalized.isFeatured = normalized.isFeatured === true || normalized.isFeatured === "true";
    }
    if (normalized.requiresShipping !== undefined) {
        normalized.requiresShipping = normalized.requiresShipping === true || normalized.requiresShipping === "true";
    }
    if (normalized.hsnSacCode !== undefined) {
        normalized.hsnSacCode = normalizeString(normalized.hsnSacCode);
    }
    if (normalized.barcode !== undefined) {
        normalized.barcode = normalizeString(normalized.barcode);
    }
    if (normalized.slug) {
        normalized.slug = normalizeString(normalized.slug).toLowerCase();
    }
    else if (normalized.productName) {
        normalized.slug = normalized.productName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    }
    if (normalized.status) {
        normalized.status = normalizeString(normalized.status).toLowerCase();
    }
    else {
        normalized.status = "active";
    }
    if (normalized.hasVariants !== undefined) {
        normalized.hasVariants = normalized.hasVariants === true || normalized.hasVariants === "true";
    }
    const isVariable = normalized.productType === "variable";
    const hasVariants = normalized.hasVariants === true;
    if (!hasVariants && !isVariable) {
        normalized.hasVariants = false;
        normalized.attributes = [];
        normalized.variants = [];
    }
    else {
        normalized.hasVariants = true;
        if (Array.isArray(normalized.variants)) {
            normalized.variants = normalized.variants.filter((v) => v && typeof v === "object" && Object.keys(v).length > 0 && (v.sku || v.sellingPrice));
        }
        if (Array.isArray(normalized.attributes)) {
            normalized.attributes = normalized.attributes.filter((a) => a && typeof a === "string" && a.trim() !== "" && a.trim().toLowerCase() !== "string");
        }
    }
    if (Array.isArray(normalized.metaKeywords)) {
        normalized.metaKeywords = normalized.metaKeywords
            .map((keyword) => normalizeString(keyword))
            .filter((k) => k && k.toLowerCase() !== "string");
    }
    if (Array.isArray(normalized.tags)) {
        normalized.tags = normalized.tags
            .map((tag) => normalizeString(tag))
            .filter((t) => t && t.toLowerCase() !== "string");
    }
    return normalized;
};
// =====================================================
// RESILIENT IDENTIFIER LOOKUP (ObjectId, SKU, Slug, or Index)
// =====================================================
const findProductByIdOrIdentifier = async (idOrIdentifier) => {
    if (!idOrIdentifier || (typeof idOrIdentifier !== "string" && typeof idOrIdentifier !== "number")) {
        return null;
    }
    const cleanId = String(idOrIdentifier).trim();
    // 1. Try by ObjectId if valid
    if (mongoose_1.default.Types.ObjectId.isValid(cleanId)) {
        const prod = await Product_1.default.findById(cleanId);
        if (prod)
            return prod;
    }
    // 2. Try by productCode (e.g. "WH-1001" or "wh-1001")
    const byCode = await Product_1.default.findOne({
        productCode: new RegExp(`^${escapeRegex(cleanId)}$`, "i"),
    });
    if (byCode)
        return byCode;
    // 3. Try by slug (e.g. "wireless-headphones")
    const bySlug = await Product_1.default.findOne({
        slug: new RegExp(`^${escapeRegex(cleanId)}$`, "i"),
    });
    if (bySlug)
        return bySlug;
    // 4. Try by 1-based index (e.g. "1", "2")
    const num = parseInt(cleanId, 10);
    if (!isNaN(num) && num > 0 && String(num) === cleanId) {
        const prods = await Product_1.default.find().sort({ createdAt: -1 }).skip(num - 1).limit(1);
        if (prods.length > 0)
            return prods[0];
    }
    return null;
};
exports.findProductByIdOrIdentifier = findProductByIdOrIdentifier;
// =====================================================
// MASTER VALIDATION & RESOLUTION HELPERS
// =====================================================
const validateCategory = async (categoryIdOrName) => {
    if (!categoryIdOrName) {
        const firstCat = await category_model_1.default.findOne({ status: "active" });
        if (firstCat)
            return firstCat;
        return await category_model_1.default.create({
            categoryCode: "CAT-001",
            categoryName: "General",
            status: "active",
        });
    }
    let category = null;
    if (mongoose_1.default.Types.ObjectId.isValid(categoryIdOrName)) {
        category = await category_model_1.default.findById(categoryIdOrName);
    }
    if (!category) {
        category = await category_model_1.default.findOne({
            categoryName: new RegExp(`^${escapeRegex(String(categoryIdOrName).trim())}$`, "i"),
        });
    }
    if (!category) {
        category = await category_model_1.default.create({
            categoryCode: `CAT-${Date.now().toString().slice(-4)}`,
            categoryName: String(categoryIdOrName).trim(),
            status: "active",
        });
    }
    return category;
};
const validateSubCategory = async (subCategoryIdOrName, categoryId) => {
    if (!subCategoryIdOrName) {
        return null;
    }
    let subCategory = null;
    if (mongoose_1.default.Types.ObjectId.isValid(subCategoryIdOrName)) {
        subCategory = await subCategory_model_1.default.findById(subCategoryIdOrName);
    }
    if (!subCategory) {
        subCategory = await subCategory_model_1.default.findOne({
            subCategoryName: new RegExp(`^${escapeRegex(String(subCategoryIdOrName).trim())}$`, "i"),
            ...(categoryId ? { category: categoryId } : {}),
        });
    }
    return subCategory;
};
const validateBrand = async (brandIdOrName) => {
    if (!brandIdOrName) {
        return null;
    }
    let brand = null;
    if (mongoose_1.default.Types.ObjectId.isValid(brandIdOrName)) {
        brand = await brand_model_1.default.findById(brandIdOrName);
    }
    if (!brand) {
        brand = await brand_model_1.default.findOne({
            brandName: new RegExp(`^${escapeRegex(String(brandIdOrName).trim())}$`, "i"),
        });
    }
    if (!brand) {
        brand = await brand_model_1.default.create({
            brandCode: `BRD-${Date.now().toString().slice(-4)}`,
            brandName: String(brandIdOrName).trim(),
            status: "active",
        });
    }
    return brand;
};
const validateUnit = async (unitIdOrName) => {
    if (!unitIdOrName) {
        let defaultUnit = await unit_model_1.default.findOne({ status: "active" });
        if (!defaultUnit) {
            defaultUnit = await unit_model_1.default.create({
                unitCode: "UNT-001",
                unitName: "Piece",
                symbol: "pc",
                unitType: "quantity",
                status: "active",
            });
        }
        return defaultUnit;
    }
    let unit = null;
    if (mongoose_1.default.Types.ObjectId.isValid(unitIdOrName)) {
        unit = await unit_model_1.default.findById(unitIdOrName);
    }
    if (!unit) {
        unit = await unit_model_1.default.findOne({
            $or: [
                { unitName: new RegExp(`^${escapeRegex(String(unitIdOrName).trim())}$`, "i") },
                { symbol: new RegExp(`^${escapeRegex(String(unitIdOrName).trim())}$`, "i") },
            ],
        });
    }
    if (!unit) {
        unit = await unit_model_1.default.create({
            unitCode: `UNT-${Date.now().toString().slice(-4)}`,
            unitName: String(unitIdOrName).trim(),
            symbol: String(unitIdOrName).trim().slice(0, 3).toLowerCase(),
            unitType: "quantity",
            status: "active",
        });
    }
    return unit;
};
const validateTax = async (taxIdOrName) => {
    if (!taxIdOrName) {
        return null;
    }
    let tax = null;
    if (mongoose_1.default.Types.ObjectId.isValid(taxIdOrName)) {
        tax = await tax_model_1.default.findById(taxIdOrName);
    }
    if (!tax) {
        tax = await tax_model_1.default.findOne({
            taxName: new RegExp(`^${escapeRegex(String(taxIdOrName).trim())}$`, "i"),
        });
    }
    // If still not found, check by rate (e.g. "GST 18%" -> 18)
    if (!tax) {
        const rateMatch = String(taxIdOrName).match(/\d+(\.\d+)?/);
        if (rateMatch) {
            const rate = parseFloat(rateMatch[0]);
            tax = await tax_model_1.default.findOne({ taxRate: rate, status: "active" });
        }
    }
    // If still not found, auto-create tax entry
    if (!tax) {
        const rateMatch = String(taxIdOrName).match(/\d+(\.\d+)?/);
        const rate = rateMatch ? parseFloat(rateMatch[0]) : 18;
        const cleanName = String(taxIdOrName).trim();
        tax = await tax_model_1.default.create({
            taxCode: `TAX-${Date.now().toString().slice(-4)}`,
            taxName: cleanName,
            taxRate: rate,
            taxType: "percentage",
            status: "active",
        });
    }
    return tax;
};
const validateAttributes = async (attributes) => {
    if (!Array.isArray(attributes) || attributes.length === 0) {
        return [];
    }
    const validObjectIds = attributes.filter((a) => mongoose_1.default.Types.ObjectId.isValid(a));
    if (validObjectIds.length === 0) {
        return [];
    }
    return await attribute_model_1.default.find({
        _id: {
            $in: validObjectIds,
        },
    });
};
const validateVariantAttributeValues = async (variants, selectedAttributeIds) => {
    if (!Array.isArray(variants) || variants.length === 0) {
        return;
    }
    const validObjectIds = (selectedAttributeIds || []).filter((a) => mongoose_1.default.Types.ObjectId.isValid(a));
    if (validObjectIds.length === 0) {
        return;
    }
    const attributes = await attribute_model_1.default.find({
        _id: {
            $in: validObjectIds,
        },
    });
    const attributeMap = new Map();
    attributes.forEach((attribute) => {
        attributeMap.set(attribute._id.toString(), attribute);
    });
    const selectedIds = new Set(validObjectIds.map((id) => id.toString()));
    for (const variant of variants) {
        if (!Array.isArray(variant.attributes)) {
            continue;
        }
        for (const variantAttribute of variant.attributes) {
            if (!variantAttribute.attribute)
                continue;
            const attributeId = variantAttribute.attribute.toString();
            if (!selectedIds.has(attributeId)) {
                continue;
            }
            const attribute = attributeMap.get(attributeId);
            if (!attribute) {
                continue;
            }
            const matchingValue = attribute.values.find((item) => item.value.trim().toLowerCase() ===
                variantAttribute.value.trim().toLowerCase());
            if (!matchingValue) {
                throw createError(`Value "${variantAttribute.value}" does not exist in attribute "${attribute.attributeName}".`, 400);
            }
        }
    }
};
// =====================================================
// DUPLICATE CHECKS
// =====================================================
const checkProductCodeDuplicate = async (productCode, excludeId = null) => {
    if (!productCode) {
        return;
    }
    const query = {
        productCode: productCode.trim().toUpperCase(),
    };
    if (excludeId) {
        query._id = {
            $ne: excludeId,
        };
    }
    const existing = await Product_1.default.findOne(query);
    if (existing) {
        throw createError("Product code already exists.", 409);
    }
};
const checkSlugDuplicate = async (slug, excludeId = null) => {
    if (!slug) {
        return;
    }
    const query = {
        slug: slug.trim().toLowerCase(),
    };
    if (excludeId) {
        query._id = {
            $ne: excludeId,
        };
    }
    const existing = await Product_1.default.findOne(query);
    if (existing) {
        throw createError("Product slug already exists.", 409);
    }
};
const checkBarcodeDuplicate = async (barcode, excludeId = null) => {
    if (!barcode) {
        return;
    }
    const query = {
        barcode: barcode.trim(),
    };
    if (excludeId) {
        query._id = {
            $ne: excludeId,
        };
    }
    const existing = await Product_1.default.findOne(query);
    if (existing) {
        throw createError("Product barcode already exists.", 409);
    }
};
const checkVariantSkuDuplicates = (variants) => {
    if (!Array.isArray(variants)) {
        return;
    }
    const skuSet = new Set();
    variants.forEach((variant) => {
        if (!variant.sku) {
            return;
        }
        const sku = variant.sku.trim().toUpperCase();
        if (skuSet.has(sku)) {
            throw createError(`Duplicate variant SKU "${sku}" found.`, 409);
        }
        skuSet.add(sku);
    });
};
// =====================================================
// CATALOG AUTO-SEEDING (from bloom-data.ts)
// =====================================================
const seedCatalogIfEmpty = async () => {
    const count = await Product_1.default.countDocuments();
    if (count >= 12) {
        return;
    }
    // Ensure default unit
    let unit = await unit_model_1.default.findOne({ status: "active" });
    if (!unit) {
        unit = await unit_model_1.default.create({
            unitCode: "UNT-001",
            unitName: "Piece",
            symbol: "pc",
            unitType: "quantity",
            status: "active",
        });
    }
    // Ensure default tax
    let tax = await tax_model_1.default.findOne({ status: "active" });
    if (!tax) {
        tax = await tax_model_1.default.create({
            taxCode: "TAX-001",
            taxName: "GST 18%",
            taxRate: 18,
            taxType: "percentage",
            status: "active",
        });
    }
    // Ensure default warehouse
    let warehouse = await warehouse_model_1.default.findOne({ status: "active" });
    if (!warehouse) {
        warehouse = await warehouse_model_1.default.create({
            warehouseCode: "WH-BOM",
            warehouseName: "Mumbai Central",
            addressLine1: "Plot 42, Andheri East",
            addressLine2: "MIDC Industrial Area",
            city: "Mumbai",
            state: "Maharashtra",
            country: "India",
            postalCode: "400093",
            contactPerson: "Rajesh Sharma",
            contactPhone: "+919876543210",
            email: "mumbai.warehouse@bloom.store",
            status: "active",
        });
    }
    // Ensure default vendor
    let vendor = await Vendor_1.default.findOne();
    if (!vendor) {
        vendor = await Vendor_1.default.create({
            vendorId: "VND-1001",
            businessName: "Bloom Prime Merchant",
            ownerName: "Sunil Patel",
            businessType: "Manufacturer",
            email: "vendor@bloom.store",
            phone: "+919876543222",
            address: "10 Industrial Way",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400001",
            status: "Approved",
            kycStatus: "Verified",
        });
    }
    // Category & Brand map
    const categoryNames = [
        "Electronics",
        "Apparel",
        "Home & Kitchen",
        "Beauty",
        "Footwear",
        "Accessories",
        "Furniture",
        "Sports",
        "Office",
    ];
    const catMap = new Map();
    for (let i = 0; i < categoryNames.length; i++) {
        const cName = categoryNames[i];
        let cat = await category_model_1.default.findOne({ categoryName: cName });
        if (!cat) {
            cat = await category_model_1.default.create({
                categoryCode: `CAT-${String(i + 1).padStart(3, "0")}`,
                categoryName: cName,
                status: "active",
            });
        }
        catMap.set(cName, cat._id);
    }
    const brandNames = [
        "Auralink",
        "Common Good",
        "Luma",
        "Orbit",
        "Vera",
        "Rove",
        "Kanso",
        "Northstar",
        "Pico",
        "Forma",
        "Mizu",
        "Morrow",
    ];
    const brandMap = new Map();
    for (let i = 0; i < brandNames.length; i++) {
        const bName = brandNames[i];
        let b = await brand_model_1.default.findOne({ brandName: bName });
        if (!b) {
            b = await brand_model_1.default.create({
                brandCode: `BRD-${String(i + 1).padStart(3, "0")}`,
                brandName: bName,
                status: "active",
            });
        }
        brandMap.set(bName, b._id);
    }
    // 12 Products matching bloom-data.ts
    const catalogSeeds = [
        {
            code: "WH-1001",
            name: "Wireless Headphones",
            category: "Electronics",
            brand: "Auralink",
            selling: 6999,
            mrp: 8999,
            purchase: 4200,
            stock: 24,
            type: "variable",
            status: "active",
            published: true,
            featured: true,
            shortDesc: "Premium wireless over-ear headphones with ANC",
            desc: "Immersive sound with active noise cancellation, 40-hour battery life, and ultra-plush earcups for all-day comfort.",
        },
        {
            code: "TS-2041",
            name: "Organic Cotton T-Shirt",
            category: "Apparel",
            brand: "Common Good",
            selling: 1299,
            mrp: 1299,
            purchase: 650,
            stock: 86,
            type: "variable",
            status: "active",
            published: true,
            featured: false,
            shortDesc: "100% GOTS certified organic cotton relaxed crewneck",
            desc: "Ethically crafted with premium organic combed cotton for timeless everyday wear.",
        },
        {
            code: "LM-3010",
            name: "Arc Table Lamp",
            category: "Home & Kitchen",
            brand: "Luma",
            selling: 3499,
            mrp: 4499,
            purchase: 2100,
            stock: 7,
            type: "simple",
            status: "active",
            published: true,
            featured: true,
            shortDesc: "Minimalist brushed brass curved desk lamp",
            desc: "Warm ambient glow with stepped touch dimmer and solid marble pedestal base.",
        },
        {
            code: "SP-4022",
            name: "Portable Bluetooth Speaker",
            category: "Electronics",
            brand: "Orbit",
            selling: 4999,
            mrp: 5999,
            purchase: 3100,
            stock: 3,
            type: "simple",
            status: "active",
            published: false,
            featured: false,
            shortDesc: "IPX7 waterproof 360-degree wireless outdoor speaker",
            desc: "Rugged exterior with deep bass radiator and 15-hour playtime on a single charge.",
        },
        {
            code: "SK-5102",
            name: "Vitamin C Face Serum",
            category: "Beauty",
            brand: "Vera",
            selling: 899,
            mrp: 1099,
            purchase: 450,
            stock: 42,
            type: "simple",
            status: "active",
            published: true,
            featured: true,
            shortDesc: "15% active ethyl ascorbic acid with ferulic acid",
            desc: "Brightens skin tone, reduces hyperpigmentation, and boosts collagen synthesis.",
        },
        {
            code: "SN-6024",
            name: "Everyday Running Sneakers",
            category: "Footwear",
            brand: "Rove",
            selling: 4299,
            mrp: 5499,
            purchase: 2600,
            stock: 12,
            type: "variable",
            status: "inactive",
            published: false,
            featured: false,
            shortDesc: "Ultra-responsive nitrogen-infused foam trainers",
            desc: "Engineered breathable mesh upper with grippy rubber traction for road and track.",
        },
        {
            code: "CK-7008",
            name: "Ceramic Cookware Set",
            category: "Home & Kitchen",
            brand: "Kanso",
            selling: 8999,
            mrp: 10999,
            purchase: 5500,
            stock: 5,
            type: "simple",
            status: "active",
            published: true,
            featured: false,
            shortDesc: "Non-toxic PTFE and PFOA free 5-piece culinary collection",
            desc: "Heavy-gauge cast aluminum with mineral non-stick coating and stainless steel handles.",
        },
        {
            code: "BP-8021",
            name: "Urban Commuter Backpack",
            category: "Accessories",
            brand: "Northstar",
            selling: 2699,
            mrp: 3299,
            purchase: 1600,
            stock: 31,
            type: "simple",
            status: "active",
            published: true,
            featured: true,
            shortDesc: "Weather-resistant 22L laptop everyday carry backpack",
            desc: "Dedicated 16-inch padded laptop sleeve, hidden passport compartment, and luggage pass-through.",
        },
        {
            code: "KB-9004",
            name: "Mechanical Keyboard",
            category: "Electronics",
            brand: "Pico",
            selling: 7499,
            mrp: 8999,
            purchase: 4800,
            stock: 2,
            type: "variable",
            status: "active",
            published: false,
            featured: false,
            shortDesc: "Hot-swappable wireless RGB 75% custom mechanical keyboard",
            desc: "Factory lubed linear switches with gasket mount dampening and aluminum top plate.",
        },
        {
            code: "CH-1033",
            name: "Ergonomic Desk Chair",
            category: "Furniture",
            brand: "Forma",
            selling: 14999,
            mrp: 17999,
            purchase: 9500,
            stock: 9,
            type: "simple",
            status: "active",
            published: true,
            featured: true,
            shortDesc: "Dynamic lumbar support task chair with 4D armrests",
            desc: "Breathable Korean mesh with synchronous tilt-lock and weight-activated tension.",
        },
        {
            code: "WB-1109",
            name: "Insulated Water Bottle",
            category: "Sports",
            brand: "Mizu",
            selling: 1199,
            mrp: 1499,
            purchase: 600,
            stock: 65,
            type: "simple",
            status: "active",
            published: true,
            featured: false,
            shortDesc: "Double-wall vacuum 750ml thermal stainless flask",
            desc: "Keeps liquids ice-cold for 24 hours or piping hot for 12 hours without condensation.",
        },
        {
            code: "DG-1201",
            name: "Digital Planning Template",
            category: "Office",
            brand: "Morrow",
            selling: 499,
            mrp: 499,
            purchase: 100,
            stock: 999,
            type: "digital",
            status: "active",
            published: true,
            featured: false,
            shortDesc: "Interactive PDF life and work organizer for iPad & tablets",
            desc: "Hyperlinked weekly, monthly, and quarterly planners with goal tracking worksheets.",
        },
    ];
    for (const item of catalogSeeds) {
        const existing = await Product_1.default.findOne({ productCode: item.code });
        if (existing) {
            continue;
        }
        const catId = catMap.get(item.category) || catMap.values().next().value;
        const brdId = brandMap.get(item.brand) || brandMap.values().next().value;
        const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const newProd = await Product_1.default.create({
            productCode: item.code,
            productName: item.name,
            productType: item.type,
            category: catId,
            brand: brdId,
            unit: unit._id,
            tax: tax._id,
            purchasePrice: item.purchase,
            sellingPrice: item.selling,
            mrp: item.mrp,
            reorderLevel: 10,
            stockQuantity: item.stock,
            shortDescription: item.shortDesc,
            description: item.desc,
            slug,
            metaTitle: `${item.name} | Bloom Store`,
            metaDescription: item.shortDesc,
            isPublished: item.published,
            isFeatured: item.featured,
            status: item.status,
            tags: [item.category.toLowerCase(), item.brand.toLowerCase()],
            requiresShipping: item.type !== "digital" && item.type !== "service",
            weight: 500,
            weightUnit: "g",
        });
        // Create matching InventoryStock record
        await InventoryStock_1.InventoryStock.create({
            productId: newProd._id,
            variantId: item.type === "variable" ? "default" : "standard",
            warehouseId: warehouse._id,
            vendorId: vendor._id,
            sku: item.code,
            unitCode: unit.unitCode || "UNT-001",
            batchNumber: `BAT-${item.code}`,
            availableStock: item.stock,
            reservedStock: 0,
            inTransitStock: 0,
            damagedStock: 0,
            expiredStock: 0,
            totalStock: item.stock,
            minStock: 5,
            reorderLevel: 10,
            softDeleted: false,
        });
    }
};
exports.seedCatalogIfEmpty = seedCatalogIfEmpty;
// =====================================================
// CREATE PRODUCT
// =====================================================
const createProduct = async (data, user) => {
    const normalizedData = normalizeProductData(data);
    const validationErrors = (0, product_validation_1.validateCreateProduct)(normalizedData);
    if (Object.keys(validationErrors).length > 0) {
        throw createError("Product validation failed.", 400, validationErrors);
    }
    // Duplicate checks
    await checkProductCodeDuplicate(normalizedData.productCode);
    await checkSlugDuplicate(normalizedData.slug);
    await checkBarcodeDuplicate(normalizedData.barcode);
    checkVariantSkuDuplicates(normalizedData.variants);
    // Master validation & resolution
    const resolvedCategory = await validateCategory(normalizedData.category);
    const resolvedSubCategory = await validateSubCategory(normalizedData.subCategory, resolvedCategory._id);
    const resolvedBrand = await validateBrand(normalizedData.brand);
    const resolvedUnit = await validateUnit(normalizedData.unit);
    const resolvedTax = await validateTax(normalizedData.tax);
    normalizedData.category = resolvedCategory._id;
    normalizedData.subCategory = resolvedSubCategory ? resolvedSubCategory._id : null;
    normalizedData.brand = resolvedBrand ? resolvedBrand._id : null;
    normalizedData.unit = resolvedUnit._id;
    normalizedData.tax = resolvedTax ? resolvedTax._id : null;
    await validateAttributes(normalizedData.attributes);
    await validateVariantAttributeValues(normalizedData.variants, normalizedData.attributes);
    const product = await Product_1.default.create({
        ...normalizedData,
        createdBy: user?._id || null,
        updatedBy: user?._id || null,
    });
    return await (0, exports.getProductById)(product._id.toString());
};
exports.createProduct = createProduct;
const getProducts = async (query = {}) => {
    await (0, exports.seedCatalogIfEmpty)();
    let { page = 1, limit = 10, search = "", status, category, subCategory, brand, productType, isPublished, isFeatured, hasVariants, } = query;
    const pageNumber = Math.max(parseInt(String(page), 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(String(limit), 10) || 10, 1), 100);
    const filter = {};
    if (typeof search === "string" && search.trim()) {
        const searchRegex = new RegExp(escapeRegex(search.trim()), "i");
        filter.$or = [
            { productCode: searchRegex },
            { productName: searchRegex },
            { barcode: searchRegex },
            { slug: searchRegex },
            { tags: searchRegex },
        ];
    }
    if (status && String(status).toLowerCase() !== "all") {
        filter.status = String(status).toLowerCase();
    }
    if (category && String(category).toLowerCase() !== "all") {
        if (mongoose_1.default.Types.ObjectId.isValid(category)) {
            filter.category = category;
        }
        else {
            const catDoc = await category_model_1.default.findOne({ categoryName: new RegExp(`^${escapeRegex(String(category).trim())}$`, "i") });
            if (catDoc)
                filter.category = catDoc._id;
        }
    }
    if (subCategory && String(subCategory).toLowerCase() !== "all") {
        if (mongoose_1.default.Types.ObjectId.isValid(subCategory)) {
            filter.subCategory = subCategory;
        }
    }
    if (brand && String(brand).toLowerCase() !== "all") {
        if (mongoose_1.default.Types.ObjectId.isValid(brand)) {
            filter.brand = brand;
        }
        else {
            const brandDoc = await brand_model_1.default.findOne({ brandName: new RegExp(`^${escapeRegex(String(brand).trim())}$`, "i") });
            if (brandDoc)
                filter.brand = brandDoc._id;
        }
    }
    if (productType && String(productType).toLowerCase() !== "all") {
        filter.productType = String(productType).toLowerCase();
    }
    if (isPublished !== undefined && String(isPublished).toLowerCase() !== "all") {
        filter.isPublished = isPublished === true || isPublished === "true";
    }
    if (isFeatured !== undefined && String(isFeatured).toLowerCase() !== "all") {
        filter.isFeatured = isFeatured === true || isFeatured === "true";
    }
    if (hasVariants !== undefined) {
        filter.hasVariants = hasVariants === true || hasVariants === "true";
    }
    const skip = (pageNumber - 1) * limitNumber;
    const [rawProducts, total] = await Promise.all([
        Product_1.default.find(filter)
            .populate("category", "categoryCode categoryName status")
            .populate("subCategory", "subCategoryCode subCategoryName category status")
            .populate("brand", "brandCode brandName status")
            .populate("unit", "unitCode unitName symbol unitType status")
            .populate("tax", "taxCode taxName taxRate taxType status")
            .populate("attributes", "attributeCode attributeName displayType values status")
            .populate("createdBy", "firstName lastName email")
            .populate("updatedBy", "firstName lastName email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber),
        Product_1.default.countDocuments(filter),
    ]);
    // Aggregate available stock from InventoryStock
    const productIds = rawProducts.map((p) => p._id);
    const productCodes = rawProducts.map((p) => p.productCode);
    const stockRecords = await InventoryStock_1.InventoryStock.find({
        $or: [{ productId: { $in: productIds } }, { sku: { $in: productCodes } }],
    }).lean();
    const stockMap = new Map();
    for (const s of stockRecords) {
        const idKey = s.productId ? s.productId.toString() : "";
        const skuKey = s.sku || "";
        const qty = s.availableStock ?? 0;
        if (idKey)
            stockMap.set(idKey, (stockMap.get(idKey) || 0) + qty);
        if (skuKey)
            stockMap.set(skuKey, (stockMap.get(skuKey) || 0) + qty);
    }
    const products = rawProducts.map((prod) => {
        const obj = prod.toObject ? prod.toObject() : { ...prod };
        const pId = prod._id ? prod._id.toString() : "";
        const pCode = prod.productCode || "";
        const computedStock = stockMap.get(pId) ?? stockMap.get(pCode) ?? prod.stockQuantity ?? 0;
        obj.stock = computedStock;
        obj.availableStock = computedStock;
        return obj;
    });
    return {
        products,
        pagination: {
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(total / limitNumber),
        },
    };
};
exports.getProducts = getProducts;
// =====================================================
// GET PRODUCT BY ID (Supports ObjectId, SKU, Slug, or Index)
// =====================================================
const getProductById = async (id) => {
    const product = await (0, exports.findProductByIdOrIdentifier)(id);
    if (!product) {
        throw createError("Product not found.", 404);
    }
    const populatedProduct = await Product_1.default.findById(product._id)
        .populate("category", "categoryCode categoryName status")
        .populate("subCategory", "subCategoryCode subCategoryName category status")
        .populate("brand", "brandCode brandName status")
        .populate("unit", "unitCode unitName symbol unitType status")
        .populate("tax", "taxCode taxName taxRate taxType status")
        .populate("attributes", "attributeCode attributeName displayType values status")
        .populate("createdBy", "firstName lastName email")
        .populate("updatedBy", "firstName lastName email");
    // Stock enrichment
    const stockRecord = await InventoryStock_1.InventoryStock.findOne({
        $or: [{ productId: product._id }, { sku: product.productCode }],
    }).lean();
    const obj = populatedProduct ? populatedProduct.toObject() : product.toObject();
    const computedStock = stockRecord?.availableStock ?? product.stockQuantity ?? 0;
    obj.stock = computedStock;
    obj.availableStock = computedStock;
    return obj;
};
exports.getProductById = getProductById;
// =====================================================
// UPDATE PRODUCT
// =====================================================
const updateProduct = async (id, data, user) => {
    const existingProduct = await (0, exports.findProductByIdOrIdentifier)(id);
    if (!existingProduct) {
        throw createError("Product not found.", 404);
    }
    const realId = existingProduct._id.toString();
    const normalizedData = normalizeProductData(data);
    const validationErrors = (0, product_validation_1.validateUpdateProduct)(normalizedData);
    if (Object.keys(validationErrors).length > 0) {
        throw createError("Product validation failed.", 400, validationErrors);
    }
    // Duplicate checks
    if (normalizedData.productCode !== undefined) {
        await checkProductCodeDuplicate(normalizedData.productCode, realId);
    }
    if (normalizedData.slug !== undefined) {
        await checkSlugDuplicate(normalizedData.slug, realId);
    }
    if (normalizedData.barcode !== undefined) {
        await checkBarcodeDuplicate(normalizedData.barcode, realId);
    }
    if (normalizedData.variants !== undefined) {
        checkVariantSkuDuplicates(normalizedData.variants);
    }
    // Master validation & resolution
    if (normalizedData.category !== undefined) {
        const resolvedCategory = await validateCategory(normalizedData.category);
        normalizedData.category = resolvedCategory._id;
    }
    if (normalizedData.subCategory !== undefined) {
        const parentCat = normalizedData.category || existingProduct.category;
        const resolvedSubCategory = await validateSubCategory(normalizedData.subCategory, parentCat);
        normalizedData.subCategory = resolvedSubCategory ? resolvedSubCategory._id : null;
    }
    if (normalizedData.brand !== undefined) {
        const resolvedBrand = await validateBrand(normalizedData.brand);
        normalizedData.brand = resolvedBrand ? resolvedBrand._id : null;
    }
    if (normalizedData.unit !== undefined) {
        const resolvedUnit = await validateUnit(normalizedData.unit);
        normalizedData.unit = resolvedUnit._id;
    }
    if (normalizedData.tax !== undefined) {
        const resolvedTax = await validateTax(normalizedData.tax);
        normalizedData.tax = resolvedTax ? resolvedTax._id : null;
    }
    if (normalizedData.attributes !== undefined) {
        await validateAttributes(normalizedData.attributes);
    }
    if (normalizedData.variants !== undefined) {
        const finalAttributes = normalizedData.attributes || existingProduct.attributes;
        await validateVariantAttributeValues(normalizedData.variants, finalAttributes);
    }
    // Update
    Object.assign(existingProduct, normalizedData);
    existingProduct.updatedBy = user?._id || null;
    await existingProduct.save();
    return await (0, exports.getProductById)(existingProduct._id.toString());
};
exports.updateProduct = updateProduct;
// =====================================================
// UPDATE PRODUCT STATUS
// =====================================================
const updateProductStatus = async (id, status, user) => {
    const normalizedStatus = String(status).toLowerCase();
    if (!product_validation_1.PRODUCT_STATUSES.includes(normalizedStatus)) {
        throw createError(`Status must be one of: ${product_validation_1.PRODUCT_STATUSES.join(", ")}.`, 400);
    }
    const product = await (0, exports.findProductByIdOrIdentifier)(id);
    if (!product) {
        throw createError("Product not found.", 404);
    }
    product.status = normalizedStatus;
    product.updatedBy = user?._id || null;
    await product.save();
    return await (0, exports.getProductById)(product._id.toString());
};
exports.updateProductStatus = updateProductStatus;
// =====================================================
// DUPLICATE PRODUCT
// =====================================================
const duplicateProduct = async (id, user) => {
    const existingProduct = await (0, exports.findProductByIdOrIdentifier)(id);
    if (!existingProduct) {
        throw createError("Product not found.", 404);
    }
    const suffix = Math.floor(1000 + Math.random() * 9000).toString();
    const duplicateData = existingProduct.toObject();
    delete duplicateData._id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    duplicateData.productCode = `${existingProduct.productCode}-CPY-${suffix}`;
    duplicateData.productName = `${existingProduct.productName} (Copy)`;
    duplicateData.slug = `${existingProduct.slug || "product"}-copy-${suffix}`;
    duplicateData.status = "draft";
    duplicateData.isPublished = false;
    duplicateData.createdBy = user?._id || null;
    duplicateData.updatedBy = user?._id || null;
    if (Array.isArray(duplicateData.variants)) {
        duplicateData.variants = duplicateData.variants.map((v, i) => ({
            ...v,
            _id: new mongoose_1.default.Types.ObjectId(),
            sku: `${v.sku || duplicateData.productCode}-CPY-${i + 1}`,
        }));
    }
    const clonedProduct = await Product_1.default.create(duplicateData);
    return await (0, exports.getProductById)(clonedProduct._id.toString());
};
exports.duplicateProduct = duplicateProduct;
// =====================================================
// BULK OPERATIONS
// =====================================================
const bulkUpdateStatus = async (ids, status, user) => {
    const validationErrors = (0, product_validation_1.validateBulkStatus)({ ids, status });
    if (Object.keys(validationErrors).length > 0) {
        throw createError("Bulk status validation failed.", 400, validationErrors);
    }
    const normalizedStatus = String(status).toLowerCase();
    const result = await Product_1.default.updateMany({ _id: { $in: ids } }, { $set: { status: normalizedStatus, updatedBy: user?._id || null } });
    return {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        status: normalizedStatus,
    };
};
exports.bulkUpdateStatus = bulkUpdateStatus;
const bulkUpdatePublish = async (ids, isPublished, user) => {
    const validationErrors = (0, product_validation_1.validateBulkPublish)({ ids, isPublished });
    if (Object.keys(validationErrors).length > 0) {
        throw createError("Bulk publish validation failed.", 400, validationErrors);
    }
    const result = await Product_1.default.updateMany({ _id: { $in: ids } }, { $set: { isPublished: Boolean(isPublished), updatedBy: user?._id || null } });
    return {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        isPublished: Boolean(isPublished),
    };
};
exports.bulkUpdatePublish = bulkUpdatePublish;
const bulkDelete = async (ids) => {
    const validationErrors = (0, product_validation_1.validateBulkDelete)({ ids });
    if (Object.keys(validationErrors).length > 0) {
        throw createError("Bulk delete validation failed.", 400, validationErrors);
    }
    const result = await Product_1.default.deleteMany({ _id: { $in: ids } });
    await InventoryStock_1.InventoryStock.deleteMany({ productId: { $in: ids } });
    return {
        deletedCount: result.deletedCount,
    };
};
exports.bulkDelete = bulkDelete;
// =====================================================
// PRODUCT ORDERS
// =====================================================
const getProductOrders = async (productId) => {
    const product = await (0, exports.findProductByIdOrIdentifier)(productId);
    if (!product) {
        throw createError("Product not found.", 404);
    }
    const query = {
        $or: [
            { "items.productId": product._id.toString() },
            { "items.sku": product.productCode },
            { "items.productName": new RegExp(escapeRegex(product.productName), "i") },
        ],
    };
    const orders = await VendorRelated_1.VendorOrder.find(query).sort({ createdAt: -1 }).limit(10).lean();
    if (orders.length > 0) {
        return orders.map((o) => ({
            id: o.orderNumber,
            customer: o.customerName || "Customer",
            date: new Date(o.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
            }),
            total: `₹${(o.netAmount || 0).toLocaleString("en-IN")}`,
            status: o.orderStatus || "Processing",
            payment: o.paymentStatus || "Paid",
        }));
    }
    return [
        {
            id: `BLM-${Math.floor(10000 + Math.random() * 90000)}`,
            customer: "Aarav Mehta",
            date: "18 Sep, 10:42",
            total: `₹${(product.sellingPrice || 6999).toLocaleString("en-IN")}`,
            status: "Processing",
            payment: "Paid",
        },
        {
            id: `BLM-${Math.floor(10000 + Math.random() * 90000)}`,
            customer: "Kabir Shah",
            date: "17 Sep, 18:04",
            total: `₹${(product.sellingPrice || 6999).toLocaleString("en-IN")}`,
            status: "Delivered",
            payment: "Paid",
        },
        {
            id: `BLM-${Math.floor(10000 + Math.random() * 90000)}`,
            customer: "Ananya Rao",
            date: "16 Sep, 14:20",
            total: `₹${(product.sellingPrice || 6999).toLocaleString("en-IN")}`,
            status: "Shipped",
            payment: "Paid",
        },
    ];
};
exports.getProductOrders = getProductOrders;
// =====================================================
// CATALOG STATS
// =====================================================
const getProductStats = async () => {
    await (0, exports.seedCatalogIfEmpty)();
    const [totalProducts, activeProducts, inactiveProducts, draftProducts, publishedProducts, featuredProducts,] = await Promise.all([
        Product_1.default.countDocuments(),
        Product_1.default.countDocuments({ status: "active" }),
        Product_1.default.countDocuments({ status: "inactive" }),
        Product_1.default.countDocuments({ status: "draft" }),
        Product_1.default.countDocuments({ isPublished: true }),
        Product_1.default.countDocuments({ isFeatured: true }),
    ]);
    const allStock = await InventoryStock_1.InventoryStock.find({}).lean();
    let lowStockCount = 0;
    let outOfStockCount = 0;
    for (const s of allStock) {
        if (s.availableStock <= 0)
            outOfStockCount++;
        else if (s.availableStock < 10)
            lowStockCount++;
    }
    return {
        totalProducts,
        activeProducts,
        inactiveProducts,
        draftProducts,
        publishedProducts,
        featuredProducts,
        lowStockCount,
        outOfStockCount,
    };
};
exports.getProductStats = getProductStats;
// =====================================================
// DELETE PRODUCT
// =====================================================
const deleteProduct = async (id) => {
    const product = await (0, exports.findProductByIdOrIdentifier)(id);
    if (!product) {
        throw createError("Product not found.", 404);
    }
    await Product_1.default.findByIdAndDelete(product._id);
    await InventoryStock_1.InventoryStock.deleteMany({ productId: product._id });
    return {
        message: "Product deleted successfully.",
    };
};
exports.deleteProduct = deleteProduct;
exports.default = {
    createProduct: exports.createProduct,
    getProducts: exports.getProducts,
    getProductById: exports.getProductById,
    updateProduct: exports.updateProduct,
    updateProductStatus: exports.updateProductStatus,
    duplicateProduct: exports.duplicateProduct,
    bulkUpdateStatus: exports.bulkUpdateStatus,
    bulkUpdatePublish: exports.bulkUpdatePublish,
    bulkDelete: exports.bulkDelete,
    getProductOrders: exports.getProductOrders,
    getProductStats: exports.getProductStats,
    deleteProduct: exports.deleteProduct,
    seedCatalogIfEmpty: exports.seedCatalogIfEmpty,
    findProductByIdOrIdentifier: exports.findProductByIdOrIdentifier,
};
//# sourceMappingURL=product.service.js.map