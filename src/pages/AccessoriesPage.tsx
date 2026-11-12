import { useMemo, useState } from 'react';
import { Search, SearchX, X } from 'lucide-react';
import PhotoIdentifier from '@/components/ai/PhotoIdentifier';
import ProductCard from '@/components/products/ProductCard';
import { useActiveProducts } from '@/hooks/useActiveProducts';
import { CATEGORY_LABELS } from '@/lib/labels';
import { matchesExactModel, matchesText } from '@/lib/productSearch';
import type { PhoneIdentification, ProductCategory } from '@/types';

type CategoryFilter = 'all' | ProductCategory;

const CATEGORY_TABS: CategoryFilter[] = ['all', 'screen', 'case', 'accessory', 'phone'];

export default function AccessoriesPage() {
  const { products, loading, error, reload } = useActiveProducts();
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [query, setQuery] = useState('');
  const [model, setModel] = useState<string | null>(null);
  const [modelInput, setModelInput] = useState('');

  const results = useMemo(
    () =>
      products.filter(
        (product) =>
          (category === 'all' || product.category === category) &&
          (!model || matchesExactModel(product, model)) &&
          matchesText(product, query),
      ),
    [products, category, model, query],
  );

  const applyModel = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setModel(trimmed);
    setModelInput(trimmed);
  };

  const handleIdentified = (identification: PhoneIdentification) => {
    applyModel(identification.model);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-10 max-w-2xl">
        <h1 className="text-4xl font-extrabold text-ink-100 sm:text-5xl">
          <span className="rgb-text">الإكسسوارات والشاشات</span>
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-300">
          اختار موبايلك بالصورة أو بالاسم، وهنعرضلك الشاشات والجرابات المتوافقة معاه بالظبط.
        </p>
      </header>

      <div className="mb-10">
        <PhotoIdentifier useLabel="ابحث عن إكسسوارات هذا الموديل" onIdentified={handleIdentified} />
      </div>

      <section className="glass mb-8 rounded-2xl p-5 sm:p-6" aria-label="البحث">
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            applyModel(modelInput);
          }}
        >
          <label className="flex-1">
            <span className="mb-2 block text-sm font-semibold text-ink-300">موديل الموبايل بالضبط</span>
            <input
              className="field"
              value={modelInput}
              onChange={(event) => setModelInput(event.target.value)}
              placeholder="مثال: iPhone 14 Pro Max"
              dir="ltr"
            />
          </label>
          <button type="submit" className="btn-primary sm:self-end">
            <Search className="h-4 w-4" aria-hidden="true" />
            تطابق الموديل
          </button>
        </form>

        <div className="mt-5 grid gap-3 border-t border-white/5 pt-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <label>
            <span className="mb-2 block text-sm font-semibold text-ink-300">بحث حر</span>
            <input
              className="field"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="اسم المنتج أو الماركة"
            />
          </label>
        </div>

        {model && (
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-neon-blue/30 bg-neon-blue/10 px-4 py-3 text-sm text-ink-100">
            <span>
              نتائج متوافقة مع <strong className="text-neon-blue" dir="ltr">{model}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setModel(null);
                setModelInput('');
              }}
              className="mr-auto inline-flex items-center gap-1 rounded-lg px-2 py-1 text-ink-300 transition hover:bg-white/10 hover:text-ink-100"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              إلغاء التطابق
            </button>
          </div>
        )}
      </section>

      <div className="mb-8 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="تصفية حسب النوع">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={category === tab}
            onClick={() => setCategory(tab)}
            className={`shrink-0 rounded-full border px-5 py-2 text-sm font-semibold transition ${
              category === tab
                ? 'border-neon-blue bg-neon-blue text-ink-950'
                : 'border-ink-700 bg-ink-900/70 text-ink-300 hover:border-neon-blue/50 hover:text-ink-100'
            }`}
          >
            {tab === 'all' ? 'الكل' : CATEGORY_LABELS[tab]}
          </button>
        ))}
      </div>

      {loading && <p className="text-ink-400">جاري تحميل المنتجات...</p>}
      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-danger">
          <p>{error}</p>
          <button type="button" onClick={reload} className="mt-3 font-semibold underline">
            إعادة المحاولة
          </button>
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <div className="glass flex flex-col items-center gap-3 rounded-2xl px-6 py-14 text-center">
          <SearchX className="h-10 w-10 text-ink-500" aria-hidden="true" />
          <p className="text-lg font-bold text-ink-100">مفيش نتايج مطابقة</p>
          <p className="max-w-md text-ink-400">
            جرب تغيير البحث، أو ابعت استفسار لصاحب المحل من صفحة الصيانة وهيرد عليك بالمتاح.
          </p>
          <a href="#/maintenance" className="btn-ghost mt-2">
            ابعت استفسار
          </a>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
