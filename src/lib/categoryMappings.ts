
interface ProductMapping {
  productName: string;
  category: string;
}

const STORAGE_KEY = 'product_category_mappings';

export function getProductMappings(): Record<string, string> {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return {};
  try {
    return JSON.parse(stored);
  } catch (e) {
    return {};
  }
}

export function saveProductMapping(productName: string, category: string) {
  const normalizedName = productName.toLowerCase().trim();
  const mappings = getProductMappings();
  mappings[normalizedName] = category;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
}

export function getCategoryForProduct(productName: string): string | null {
  const normalizedName = productName.toLowerCase().trim();
  const mappings = getProductMappings();
  return mappings[normalizedName] || null;
}
