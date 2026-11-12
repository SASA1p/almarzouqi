import { useCallback, useEffect, useState } from 'react';
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';
import ProductForm from '@/components/owner/ProductForm';
import { supabase } from '@/lib/supabase';
import { CATEGORY_LABELS, formatPrice } from '@/lib/labels';
import type { Product } from '@/types';

export default function ProductsPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: queryError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (queryError) {
      setError('تعذر تحميل المنتجات، حاول مرة أخرى.');
    } else {
      setProducts((data ?? []) as Product[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleVisibility = async (product: Product) => {
    setActionError(null);
    const { error: updateError } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id);
    if (updateError) {
      setActionError('تعذر تغيير ظهور المنتج، حاول مرة أخرى.');
      return;
    }
    setProducts((current) => current.map((item) => (item.id === product.id ? { ...item, is_active: !item.is_active } : item)));
  };

  const removeProduct = async (product: Product) => {
    if (!window.confirm(`متأكد إنك عايز تمسح "${product.name}"؟`)) return;
    setActionError(null);
    const { error: deleteError } = await supabase.from('products').delete().eq('id', product.id);
    if (deleteError) {
      setActionError('تعذر حذف المنتج، حاول مرة أخرى.');
      return;
    }
    setProducts((current) => current.filter((item) => item.id !== product.id));
  };

  const handleSaved = (saved: Product) => {
    setProducts((current) => {
      const exists = current.some((item) => item.id === saved.id);
      return exists ? current.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...current];
    });
    setEditing(null);
    setCreating(false);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-ink-400">{products.length} منتج في المتجر</p>
        <button type="button" onClick={() => setCreating(true)} className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          إضافة منتج
        </button>
      </div>

      {error && <p className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-danger">{error}</p>}
      {actionError && <p className="text-sm text-danger">{actionError}</p>}
      {loading && <p className="text-ink-400">جاري التحميل...</p>}

      <div className="grid gap-4">
        {products.map((product) => (
          <article key={product.id} className="glass flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center">
            <div className="h-20 w-full shrink-0 overflow-hidden rounded-xl bg-ink-900 sm:w-28">
              {product.image_url && <img src={product.image_url} alt="" className="h-full w-full object-cover" loading="lazy" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-ink-100">{product.name}</h3>
                <span className="rounded-full bg-neon-blue/15 px-2.5 py-0.5 text-xs font-semibold text-neon-blue">
                  {CATEGORY_LABELS[product.category]}
                </span>
                {!product.is_active && (
                  <span className="rounded-full bg-ink-700 px-2.5 py-0.5 text-xs font-semibold text-ink-300">مخفي</span>
                )}
              </div>
              <p className="mt-1 text-sm text-ink-400">
                {formatPrice(product.price)} · الكمية: {product.stock}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleVisibility(product)}
                className="btn-ghost px-3 py-2"
                aria-label={product.is_active ? 'إخفاء المنتج' : 'إظهار المنتج'}
                title={product.is_active ? 'إخفاء المنتج' : 'إظهار المنتج'}
              >
                {product.is_active ? <Eye className="h-4 w-4" aria-hidden="true" /> : <EyeOff className="h-4 w-4" aria-hidden="true" />}
              </button>
              <button type="button" onClick={() => setEditing(product)} className="btn-ghost px-3 py-2" aria-label="تعديل المنتج">
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => removeProduct(product)}
                className="flex items-center justify-center rounded-xl border border-danger/30 px-3 py-2 text-danger transition hover:bg-danger/10"
                aria-label="حذف المنتج"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {(creating || editing) && (
        <ProductForm
          product={editing}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={handleSaved}
        />
      )}
    </section>
  );
}
