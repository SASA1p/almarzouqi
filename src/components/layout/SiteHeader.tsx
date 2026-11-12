import { useState } from 'react';
import { Menu, Smartphone, X } from 'lucide-react';

const NAV_ITEMS = [
  { href: '#/', label: 'الرئيسية', path: '/' },
  { href: '#/accessories', label: 'الإكسسوارات', path: '/accessories' },
  { href: '#/maintenance', label: 'الصيانة', path: '/maintenance' },
  { href: '#/owner', label: 'صفحة المالك', path: '/owner' },
];

interface SiteHeaderProps {
  route: string;
}

export default function SiteHeader({ route }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-800 ring-1 ring-white/10">
            <Smartphone className="h-5 w-5 text-neon-blue" aria-hidden="true" />
          </span>
          <span className="rgb-text text-xl font-extrabold">المرزوقي</span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="القائمة الرئيسية">
          {NAV_ITEMS.map((item) => {
            const active = route === item.path;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  active ? 'bg-neon-blue/15 text-neon-blue' : 'text-ink-300 hover:bg-white/5 hover:text-ink-100'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-700 text-ink-100 transition hover:border-neon-blue/60 md:hidden"
          aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/5 bg-ink-950/95 px-4 py-3 md:hidden" aria-label="القائمة على الموبايل">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-4 py-3 text-base font-semibold ${
                  route === item.path ? 'bg-neon-blue/15 text-neon-blue' : 'text-ink-200 hover:bg-white/5'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
