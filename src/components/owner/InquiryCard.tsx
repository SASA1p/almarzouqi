import { useState } from 'react';
import { Phone, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { INQUIRY_STATUS_LABELS, REQUEST_TYPE_LABELS, formatDate } from '@/lib/labels';
import type { InquiryStatus, MaintenanceInquiry } from '@/types';

interface InquiryCardProps {
  inquiry: MaintenanceInquiry;
  onChange: (next: MaintenanceInquiry) => void;
  onDelete: (id: string) => void;
}

const STATUS_STYLES: Record<InquiryStatus, string> = {
  new: 'bg-neon-blue/15 text-neon-blue',
  answered: 'bg-success/15 text-success',
  closed: 'bg-ink-700 text-ink-300',
};

export default function InquiryCard({ inquiry, onChange, onDelete }: InquiryCardProps) {
  const [reply, setReply] = useState(inquiry.owner_reply);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (status: InquiryStatus) => {
    const trimmedReply = reply.trim();
    setBusy(true);
    setError(null);
    const { error: updateError } = await supabase
      .from('maintenance_inquiries')
      .update({ owner_reply: trimmedReply, status })
      .eq('id', inquiry.id);
    setBusy(false);
    if (updateError) {
      setError('تعذر حفظ الرد، حاول مرة أخرى.');
      return;
    }
    onChange({ ...inquiry, owner_reply: trimmedReply, status });
  };

  const remove = async () => {
    if (!window.confirm('متأكد إنك عايز تمسح الاستفسار ده نهائياً؟')) return;
    setBusy(true);
    const { error: deleteError } = await supabase.from('maintenance_inquiries').delete().eq('id', inquiry.id);
    setBusy(false);
    if (deleteError) {
      setError('تعذر حذف الاستفسار، حاول مرة أخرى.');
      return;
    }
    onDelete(inquiry.id);
  };

  return (
    <article className="glass rounded-2xl p-5 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-ink-100">{inquiry.customer_name}</h3>
          <a href={`tel:${inquiry.customer_phone}`} className="mt-1 inline-flex items-center gap-2 text-sm text-neon-blue hover:underline" dir="ltr">
            <Phone className="h-4 w-4" aria-hidden="true" />
            {inquiry.customer_phone}
          </a>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[inquiry.status]}`}>
            {INQUIRY_STATUS_LABELS[inquiry.status]}
          </span>
          <time className="text-xs text-ink-500">{formatDate(inquiry.created_at)}</time>
        </div>
      </header>

      <dl className="mt-4 grid gap-3 rounded-xl bg-ink-900/70 p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-ink-500">نوع الطلب</dt>
          <dd className="font-semibold text-ink-100">{REQUEST_TYPE_LABELS[inquiry.request_type]}</dd>
        </div>
        <div>
          <dt className="text-ink-500">الموديل</dt>
          <dd className="font-semibold text-ink-100" dir="ltr">{inquiry.device_model || '-'}</dd>
        </div>
        {inquiry.part_requested && (
          <div className="sm:col-span-2">
            <dt className="text-ink-500">القطعة المطلوبة</dt>
            <dd className="font-semibold text-ink-100">{inquiry.part_requested}</dd>
          </div>
        )}
        {inquiry.message && (
          <div className="sm:col-span-2">
            <dt className="text-ink-500">التفاصيل</dt>
            <dd className="whitespace-pre-wrap leading-relaxed text-ink-200">{inquiry.message}</dd>
          </div>
        )}
      </dl>

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-semibold text-ink-300">ردك على العميل</span>
        <textarea
          className="field min-h-24 resize-y"
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          maxLength={2000}
          placeholder="مثال: سعر الشاشة 4200 ج.م والتركيب فوري"
        />
      </label>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => save('answered')} disabled={busy || !reply.trim()} className="btn-primary">
          حفظ الرد
        </button>
        {inquiry.status !== 'closed' && (
          <button type="button" onClick={() => save('closed')} disabled={busy} className="btn-ghost">
            إغلاق الاستفسار
          </button>
        )}
        <button
          type="button"
          onClick={remove}
          disabled={busy}
          className="ms-auto inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-danger transition hover:bg-danger/10 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          حذف
        </button>
      </div>
    </article>
  );
}
