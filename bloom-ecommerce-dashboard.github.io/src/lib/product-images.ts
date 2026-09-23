import headphones from "@/assets/product-headphones.jpg";
import shirt from "@/assets/product-shirt.jpg";
import lamp from "@/assets/product-lamp.jpg";
import speaker from "@/assets/product-speaker.jpg";
import serum from "@/assets/product-serum.jpg";
import sneakers from "@/assets/product-sneakers.jpg";

const fallbackImages = [headphones, shirt, lamp, speaker, serum, sneakers];

export const productImages: Record<string, string> = {
  "WH-1001": headphones,
  "TS-2041": shirt,
  "LM-3010": lamp,
  "SP-4022": speaker,
  "SK-5102": serum,
  "SN-6024": sneakers,
};

export function imageForProduct(code: string, index = 0) {
  return productImages[code] ?? fallbackImages[index % fallbackImages.length];
}

export { headphones };
