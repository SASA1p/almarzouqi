import { Smartphone } from 'lucide-react';

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-ink-950/80">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-center sm:flex-row sm:px-6 sm:text-right">
        <div className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-neon-blue" aria-hidden="true" />
          <span className="font-bold text-ink-100">المرزوقي</span>
        </div>
        <p className="text-sm text-ink-400">موبايلات جديدة، شاشات، جرابات، وصيانة بضمان على كل قطعة.</p>
        <p className="text-xs text-ink-500">جميع الحقوق محفوظة {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
