import type { Product } from '@/types';

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '');

export function matchesExactModel(product: Product, model: string) {
  const target = normalize(model);
  if (!target) return false;
  return product.compatible_models.split(',').some((entry) => {
    const candidate = normalize(entry);
    return candidate.length > 0 && (candidate === target || target.endsWith(candidate));
  });
}

export function matchesText(product: Product, query: string) {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  const haystack = [product.name, product.brand, product.compatible_models, product.description]
    .join(' ')
    .toLowerCase();
  return tokens.every((token) => haystack.includes(token));
}
