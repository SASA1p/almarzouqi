import { useCallback, useEffect, useState } from 'react';
import { Inbox, RefreshCw } from 'lucide-react';
import InquiryCard from '@/components/owner/InquiryCard';
import { supabase } from '@/lib/supabase';
import { INQUIRY_STATUS_LABELS } from '@/lib/labels';
import type { InquiryStatus, MaintenanceInquiry } from '@/types';

type Filter = 'all' | InquiryStatus;
const FILTERS: Filter[] = ['all', 'new', 'answered', 'closed'];

export default function InquiriesPanel() {
  const [inquiries, setInquiries] = useState<MaintenanceInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: queryError } = await supabase
      .from('maintenance_inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    if (queryError) {
      setError('تعذر تحميل الاستفسارات، حاول مرة أخرى.');
    } else {
      setInquiries((data ?? []) as MaintenanceInquiry[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = filter === 'all' ? inquiries : inquiries.filter((item) => item.status === filter);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => {
            const count = item === 'all' ? inquiries.length : inquiries.filter((i) => i.status === item).length;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                  filter === item
                    ? 'border-neon-blue bg-neon-blue text-ink-950'
                    : 'border-ink-700 text-ink-300 hover:border-neon-blue/50 hover:text-ink-100'
                }`}
              >
                {item === 'all' ? 'الكل' : INQUIRY_STATUS_LABELS[item]} ({count})
              </button>
            );
          })}
        </div>
        <button type="button" onClick={load} className="btn-ghost py-2" disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          تحديث
        </button>
      </div>

      {error && <p className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-danger">{error}</p>}

      {!loading && !error && visible.length === 0 && (
        <div className="glass flex flex-col items-center gap-3 rounded-2xl px-6 py-14 text-center">
          <Inbox className="h-10 w-10 text-ink-500" aria-hidden="true" />
          <p className="font-bold text-ink-100">مفيش استفسارات هنا</p>
          <p className="text-ink-400">أول ما العملاء يبعتوا استفسار هيظهر هنا.</p>
        </div>
      )}

      <div className="grid gap-5">
        {visible.map((inquiry) => (
          <InquiryCard
            key={inquiry.id}
            inquiry={inquiry}
            onChange={(next) => setInquiries((current) => current.map((item) => (item.id === next.id ? next : item)))}
            onDelete={(id) => setInquiries((current) => current.filter((item) => item.id !== id))}
          />
        ))}
      </div>
    </section>
  );
}
