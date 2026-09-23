import { products } from "./bloom-data";
import { orders } from "./bloom-commerce";

/** Resolve a product by display name and return its catalog row plus 1-based route id. */
export function productByName(name: string) {
  const index = products.findIndex((p) => p[1] === name);
  if (index < 0) return null;
  return { product: products[index]!, index, productId: String(index + 1) };
}

/** Orders that contain a given product name. */
export function ordersForProduct(name: string) {
  return orders.filter((o) => (o.products as readonly string[]).includes(name));
}
