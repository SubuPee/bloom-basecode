export type MasterKey =
  "categories" | "sub-categories" | "brands" | "units" | "taxes" | "warehouses" | "attributes";
export type MasterRow = {
  id: number;
  code: string;
  name: string;
  status: "Active" | "Inactive";
  detail: string;
  extra?: string;
  createdBy: string;
  updated: string;
};
export const masterConfig: Record<
  MasterKey,
  { title: string; singular: string; description: string; detailLabel: string; fields: string[] }
> = {
  categories: {
    title: "Categories",
    singular: "Category",
    description: "Manage your product categories and hierarchy.",
    detailLabel: "Parent Category",
    fields: ["Category Name", "Parent Category"],
  },
  "sub-categories": {
    title: "Sub-Categories",
    singular: "Sub-Category",
    description: "Organize products within their parent categories.",
    detailLabel: "Category",
    fields: ["Sub-Category Name", "Category"],
  },
  brands: {
    title: "Brands",
    singular: "Brand",
    description: "Manage the brands represented in your catalog.",
    detailLabel: "Brand Type",
    fields: ["Brand Name"],
  },
  units: {
    title: "Units",
    singular: "Unit",
    description: "Standardize how products are measured and sold.",
    detailLabel: "Unit Type",
    fields: ["Unit Name", "Symbol", "Unit Type"],
  },
  taxes: {
    title: "Taxes",
    singular: "Tax",
    description: "Configure tax rates used across your catalog.",
    detailLabel: "Tax Rate",
    fields: ["Tax Name", "Tax Rate", "Tax Type", "Description"],
  },
  warehouses: {
    title: "Warehouses",
    singular: "Warehouse",
    description: "Manage inventory locations and contacts.",
    detailLabel: "City / State",
    fields: [
      "Warehouse Name",
      "Address Line 1",
      "Address Line 2",
      "City",
      "State",
      "Country",
      "Postal Code",
      "Contact Person",
      "Contact Phone",
      "Email",
    ],
  },
  attributes: {
    title: "Attributes",
    singular: "Attribute",
    description: "Define product options and variant values.",
    detailLabel: "Display Type",
    fields: ["Attribute Name", "Display Type", "Values"],
  },
};
const names: Record<MasterKey, string[]> = {
  categories: [
    "Electronics",
    "Audio",
    "Apparel",
    "Men's Clothing",
    "Home & Kitchen",
    "Furniture",
    "Beauty",
    "Sports",
    "Books",
    "Toys",
    "Groceries",
    "Smart Home",
    "Accessories",
    "Footwear",
    "Outdoor",
    "Office",
  ],
  "sub-categories": [
    "Headphones",
    "Smartphones",
    "T-Shirts",
    "Jackets",
    "Cookware",
    "Lighting",
    "Skincare",
    "Fitness",
    "Fiction",
    "Board Games",
    "Coffee",
    "Speakers",
    "Bags",
    "Sneakers",
    "Camping",
    "Stationery",
  ],
  brands: [
    "Auralink",
    "Northstar",
    "Morrow",
    "Haven",
    "Vera",
    "Kanso",
    "Orbit",
    "Solace",
    "Ardent",
    "Pico",
    "Luma",
    "Forma",
    "Oak & Iron",
    "Mizu",
    "Rove",
    "Common Good",
  ],
  units: [
    "Piece",
    "Kilogram",
    "Gram",
    "Liter",
    "Meter",
    "Box",
    "Pair",
    "Pack",
    "Square Meter",
    "Milliliter",
    "Centimeter",
    "Set",
    "Dozen",
    "Carton",
    "Roll",
    "Bottle",
  ],
  taxes: [
    "GST Standard",
    "GST Reduced",
    "GST Essential",
    "Fixed Eco Fee",
    "GST Luxury",
    "GST Zero",
    "Service Tax",
    "Import Duty",
    "State Levy",
    "Packaging Fee",
    "Digital Goods",
    "Hospitality",
    "Textile GST",
    "Electronics GST",
    "Food GST",
    "Books Zero",
  ],
  warehouses: [
    "Mumbai Central",
    "Delhi North",
    "Bengaluru East",
    "Chennai Port",
    "Kolkata Hub",
    "Hyderabad West",
    "Pune Fulfilment",
    "Ahmedabad Depot",
    "Jaipur Center",
    "Kochi South",
    "Lucknow Hub",
    "Surat Storage",
    "Nagpur Central",
    "Indore Depot",
    "Gurugram Express",
    "Noida Hub",
  ],
  attributes: [
    "Color",
    "Size",
    "Material",
    "Storage",
    "Finish",
    "Pattern",
    "Fit",
    "Capacity",
    "Screen Size",
    "Flavor",
    "Style",
    "Length",
    "Voltage",
    "Pack Size",
    "Scent",
    "Compatibility",
  ],
};
function buildRows(key: MasterKey): MasterRow[] {
  return names[key].map((name, i) => ({
    id: i + 1,
    code: `${key.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(3, "0")}`,
    name,
    status: i % 5 === 0 ? "Inactive" : "Active",
    detail:
      key === "categories"
        ? i % 3 === 0
          ? "—"
          : (names.categories[i % 3] ?? "—")
        : key === "taxes"
          ? i % 4 === 3
            ? "₹50 fixed"
            : `${[5, 12, 18, 28][i % 4]}%`
          : key === "units"
            ? (["Quantity", "Weight", "Volume", "Length", "Area"][i % 5] ?? "Quantity")
            : key === "warehouses"
              ? (["Mumbai, MH", "Delhi, DL", "Bengaluru, KA"][i % 3] ?? "India")
              : key === "attributes"
                ? (["Dropdown · 6 values", "Radio · 4 values", "Color · 8 values"][i % 3] ?? "Text")
                : (names.categories[i % names.categories.length] ?? "—"),
    createdBy: i % 2 ? "Priya Shah" : "Alex Morgan",
    updated: `${i + 1} Sep 2026`,
  }));
}
const masterStore: Partial<Record<MasterKey, MasterRow[]>> = {};
export function rowsFor(key: MasterKey): MasterRow[] {
  if (!masterStore[key]) masterStore[key] = buildRows(key);
  return masterStore[key]!;
}
export function setRowsFor(key: MasterKey, rows: MasterRow[]) {
  masterStore[key] = rows;
}
export const products = [
  [
    "WH-1001",
    "Wireless Headphones",
    "Electronics",
    "Auralink",
    6999,
    8999,
    24,
    "Variable",
    "Active",
    true,
  ],
  [
    "TS-2041",
    "Organic Cotton T-Shirt",
    "Apparel",
    "Common Good",
    1299,
    1299,
    86,
    "Variable",
    "Active",
    true,
  ],
  ["LM-3010", "Arc Table Lamp", "Home & Kitchen", "Luma", 3499, 4499, 7, "Simple", "Active", true],
  [
    "SP-4022",
    "Portable Bluetooth Speaker",
    "Electronics",
    "Orbit",
    4999,
    5999,
    3,
    "Simple",
    "Active",
    false,
  ],
  ["SK-5102", "Vitamin C Face Serum", "Beauty", "Vera", 899, 1099, 42, "Simple", "Active", true],
  [
    "SN-6024",
    "Everyday Running Sneakers",
    "Footwear",
    "Rove",
    4299,
    5499,
    12,
    "Variable",
    "Inactive",
    false,
  ],
  [
    "CK-7008",
    "Ceramic Cookware Set",
    "Home & Kitchen",
    "Kanso",
    8999,
    10999,
    5,
    "Simple",
    "Active",
    true,
  ],
  [
    "BP-8021",
    "Urban Commuter Backpack",
    "Accessories",
    "Northstar",
    2699,
    3299,
    31,
    "Simple",
    "Active",
    true,
  ],
  [
    "KB-9004",
    "Mechanical Keyboard",
    "Electronics",
    "Pico",
    7499,
    8999,
    2,
    "Variable",
    "Active",
    false,
  ],
  [
    "CH-1033",
    "Ergonomic Desk Chair",
    "Furniture",
    "Forma",
    14999,
    17999,
    9,
    "Simple",
    "Active",
    true,
  ],
  ["WB-1109", "Insulated Water Bottle", "Sports", "Mizu", 1199, 1499, 65, "Simple", "Active", true],
  [
    "DG-1201",
    "Digital Planning Template",
    "Office",
    "Morrow",
    499,
    499,
    999,
    "Digital",
    "Active",
    true,
  ],
] as const;
