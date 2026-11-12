import { ArrowLeft, Bot, Camera, Smartphone, Wrench } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { useActiveProducts } from '@/hooks/useActiveProducts';

const FEATURES = [
  {
    href: '#/accessories',
    icon: Smartphone,
    title: 'شاشات وجرابات مطابقة',
    text: 'صوّر موبايلك أو اكتب موديله، والذكاء الاصطناعي يجيب لك الشاشة والجراب المناسبين بالضبط.',
  },
  {
    href: '#/maintenance',
    icon: Wrench,
    title: 'صيانة وتشخيص بالصورة',
    text: 'صوّر الموبايل واعرف موديله تلقائياً، واسأل عن سعر أي قطعة وهيوصل الاستفسار لصاحب المحل مباشرة.',
  },
  {
    href: '#/maintenance',
    icon: Bot,
    title: 'مساعد ذكي للمحل',
    text: 'اسأل المساعد عن أي عطل أو إكسسوار، وهيرشدك للخطوة الجاية في ثواني.',
  },
];

export default function HomePage() {
  const { products, loading, error } = useActiveProducts();
  const featured = products.slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <section className="flex min-h-[72vh] flex-col justify-center py-16 md:py-24">
        <p className="animate-rise-in mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-ink-900/70 px-4 py-1.5 text-sm text-ink-300 backdrop-blur">
          <span className="h-2 w-2 animate-pulse rounded-full bg-success" aria-hidden="true" />
          موبايلات، صيانة، وإكسسوارات في مكان واحد
        </p>
        <h1 className="animate-rise-in text-5xl font-extrabold leading-tight sm:text-6xl md:text-7xl">
          <span className="rgb-text">المرزوقي</span>
        </h1>
        <p className="animate-rise-in mt-6 max-w-2xl text-lg leading-relaxed text-ink-200 [animation-delay:120ms] sm:text-xl">
          متجر متخصص في الموبايلات الجديدة والشاشات والجرابات، مع صيانة بخبرة وتشخيص دقيق بالذكاء الاصطناعي.
        </p>
        <div className="animate-rise-in mt-10 flex flex-col gap-3 sm:flex-row [animation-delay:220ms]">
          <a href="#/accessories" className="btn-primary">
            تصفح الإكسسوارات
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </a>
          <a href="#/maintenance" className="btn-ghost">
            <Camera className="h-4 w-4" aria-hidden="true" />
            صوّر موبايلك واستفسر
          </a>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3" aria-label="خدمات المتجر">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <a
              key={feature.title}
              href={feature.href}
              className="glass group relative rounded-2xl p-6 transition duration-300 hover:-translate-y-1 hover:border-neon-blue/40"
            >
              <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-neon-blue/10 text-neon-blue ring-1 ring-neon-blue/30 transition group-hover:shadow-[0_0_24px_-4px_rgba(45,226,255,0.8)]">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className="text-xl font-bold text-ink-100">{feature.title}</h2>
              <p className="mt-3 leading-relaxed text-ink-300">{feature.text}</p>
            </a>
          );
        })}
      </section>

      <section className="mt-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-ink-100">أحدث المنتجات</h2>
            <p className="mt-2 text-ink-400">اختيارات مختارة من المحل</p>
          </div>
          <a href="#/accessories" className="hidden text-sm font-semibold text-neon-blue hover:underline sm:inline">
            عرض الكل
          </a>
        </div>

        {loading && <p className="text-ink-400">جاري تحميل المنتجات...</p>}
        {error && <p className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-danger">{error}</p>}
        {!loading && !error && featured.length === 0 && (
          <p className="text-ink-400">لا توجد منتجات معروضة حالياً.</p>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
