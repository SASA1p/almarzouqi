import { PackageOpen } from 'lucide-react';
import { CATEGORY_LABELS, formatPrice } from '@/lib/labels';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const outOfStock = product.stock <= 0;

  return (
    <article className="glass group flex flex-col overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-1 hover:border-neon-blue/40 hover:shadow-[0_0_32px_-8px_rgba(45,226,255,0.45)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-900">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-500">
            <PackageOpen className="h-10 w-10" aria-hidden="true" />
          </div>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-ink-950/80 px-3 py-1 text-xs font-semibold text-neon-blue backdrop-blur">
          {CATEGORY_LABELS[product.category]}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          {product.brand && <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{product.brand}</p>}
          <h3 className="mt-1 text-lg font-bold text-ink-100">{product.name}</h3>
        </div>
        {product.compatible_models && (
          <p className="text-sm leading-relaxed text-ink-300">
            <span className="font-semibold text-ink-200">متوافق مع: </span>
            {product.compatible_models}
          </p>
        )}
        {product.description && <p className="text-sm leading-relaxed text-ink-400">{product.description}</p>}

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-xl font-extrabold text-ink-100">{formatPrice(product.price)}</span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              outOfStock ? 'bg-danger/15 text-danger' : 'bg-success/15 text-success'
            }`}
          >
            {outOfStock ? 'غير متوفر حالياً' : 'متوفر'}
          </span>
        </div>
      </div>
    </article>
  );
}
