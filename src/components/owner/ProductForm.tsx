import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CATEGORY_LABELS } from '@/lib/labels';
import type { Product, ProductCategory } from '@/types';

interface ProductFormProps {
  product: Product | null;
  onClose: () => void;
  onSaved: (product: Product) => void;
}

type FormValues = {
  name: string;
  category: ProductCategory;
  brand: string;
  compatible_models: string;
  description: string;
  price: string;
  stock: string;
  image_url: string;
  is_active: boolean;
};

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ProductCategory[];

const toFormValues = (product: Product | null): FormValues => ({
  name: product?.name ?? '',
  category: product?.category ?? 'screen',
  brand: product?.brand ?? '',
  compatible_models: product?.compatible_models ?? '',
  description: product?.description ?? '',
  price: product ? String(product.price) : '',
  stock: product ? String(product.stock) : '1',
  image_url: product?.image_url ?? '',
  is_active: product?.is_active ?? true,
});

export default function ProductForm({ product, onClose, onSaved }: ProductFormProps) {
  const [values, setValues] = useState<FormValues>(() => toFormValues(product));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const price = Number(values.price);
    const stock = Number(values.stock);
    const name = values.name.trim();
    if (!name) {
      setError('اكتب اسم المنتج.');
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError('اكتب سعر صحيح.');
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      setError('الكمية لازم تكون رقم صحيح.');
      return;
    }

    const payload = {
      name,
      category: values.category,
      brand: values.brand.trim(),
      compatible_models: values.compatible_models.trim(),
      description: values.description.trim(),
      price,
      stock,
      image_url: values.image_url.trim(),
      is_active: values.is_active,
    };

    setBusy(true);
    setError(null);
    const query = product
      ? supabase.from('products').update(payload).eq('id', product.id).select().single()
      : supabase.from('products').insert(payload).select().single();
    const { data, error: saveError } = await query;
    setBusy(false);

    if (saveError || !data) {
      setError('تعذر حفظ المنتج، تأكد من البيانات وحاول مرة أخرى.');
      return;
    }
    onSaved(data as Product);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div className="animate-rise-in glass max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl p-6 sm:rounded-2xl sm:p-8">
        <header className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-ink-100">{product ? 'تعديل منتج' : 'إضافة منتج جديد'}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-300 transition hover:bg-white/10"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2" noValidate>
          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-ink-300">اسم المنتج</span>
            <input className="field" value={values.name} onChange={(e) => update('name', e.target.value)} maxLength={160} />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-ink-300">النوع</span>
            <select className="field" value={values.category} onChange={(e) => update('category', e.target.value as ProductCategory)}>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-ink-300">الماركة</span>
            <input className="field" value={values.brand} onChange={(e) => update('brand', e.target.value)} maxLength={80} />
          </label>
          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-ink-300">الموبايلات المتوافقة (افصل بينها بفاصلة)</span>
            <input
              className="field"
              value={values.compatible_models}
              onChange={(e) => update('compatible_models', e.target.value)}
              maxLength={500}
              placeholder="iPhone 14 Pro, iPhone 14 Pro Max"
              dir="ltr"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-ink-300">السعر (ج.م)</span>
            <input className="field" type="number" min="0" step="1" value={values.price} onChange={(e) => update('price', e.target.value)} />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-ink-300">الكمية المتاحة</span>
            <input className="field" type="number" min="0" step="1" value={values.stock} onChange={(e) => update('stock', e.target.value)} />
          </label>
          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-ink-300">رابط الصورة</span>
            <input
              className="field"
              value={values.image_url}
              onChange={(e) => update('image_url', e.target.value)}
              maxLength={2000}
              placeholder="https://..."
              dir="ltr"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-ink-300">وصف مختصر</span>
            <textarea
              className="field min-h-24 resize-y"
              value={values.description}
              onChange={(e) => update('description', e.target.value)}
              maxLength={1000}
            />
          </label>
          <label className="flex items-center gap-3 sm:col-span-2">
            <input
              type="checkbox"
              checked={values.is_active}
              onChange={(e) => update('is_active', e.target.checked)}
              className="h-5 w-5 accent-[#2de2ff]"
            />
            <span className="text-sm font-semibold text-ink-200">ظاهر للعملاء في الموقع</span>
          </label>

          {error && <p className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger sm:col-span-2">{error}</p>}

          <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="btn-ghost">
              إلغاء
            </button>
            <button type="submit" disabled={busy} className="btn-primary">
              {busy ? 'جاري الحفظ...' : 'حفظ المنتج'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
