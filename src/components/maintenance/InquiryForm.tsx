import { useState, type FormEvent } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { REQUEST_TYPE_LABELS } from '@/lib/labels';
import type { RequestType } from '@/types';

interface InquiryFormProps {
  deviceModel: string;
  onDeviceModelChange: (value: string) => void;
}

type SubmitState = 'idle' | 'submitting' | 'sent' | 'error';

const REQUEST_TYPES = Object.keys(REQUEST_TYPE_LABELS) as RequestType[];

export default function InquiryForm({ deviceModel, onDeviceModelChange }: InquiryFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [requestType, setRequestType] = useState<RequestType>('price');
  const [part, setPart] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<SubmitState>('idle');
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setPhone('');
    setPart('');
    setMessage('');
    onDeviceModelChange('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    if (!cleanName || cleanPhone.length < 5) {
      setFormError('من فضلك اكتب الاسم ورقم موبايل صحيح للتواصل.');
      return;
    }
    if (!deviceModel.trim() && !part.trim() && !message.trim()) {
      setFormError('اكتب موديل الموبايل أو القطعة المطلوبة أو تفاصيل المشكلة.');
      return;
    }
    setFormError(null);
    setState('submitting');

    const { error } = await supabase.from('maintenance_inquiries').insert({
      customer_name: cleanName,
      customer_phone: cleanPhone,
      device_model: deviceModel.trim(),
      request_type: requestType,
      part_requested: part.trim(),
      message: message.trim(),
      status: 'new',
      owner_reply: '',
    });

    if (error) {
      setState('error');
      setFormError('تعذر إرسال الاستفسار، حاول مرة أخرى بعد قليل.');
      return;
    }
    setState('sent');
    resetForm();
  };

  if (state === 'sent') {
    return (
      <div className="animate-rise-in glass flex flex-col items-center gap-4 rounded-2xl px-6 py-12 text-center">
        <CheckCircle2 className="h-12 w-12 text-success" aria-hidden="true" />
        <h3 className="text-2xl font-bold text-ink-100">تم إرسال استفسارك</h3>
        <p className="max-w-md text-ink-300">هيوصل لصاحب المحل فوراً، وهيرد عليك على رقم الموبايل اللي كتبته.</p>
        <button type="button" onClick={() => setState('idle')} className="btn-ghost mt-2">
          إرسال استفسار آخر
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass grid gap-5 rounded-2xl p-5 sm:p-8" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-semibold text-ink-300">الاسم</span>
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="name" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-ink-300">رقم الموبايل للتواصل</span>
          <input
            className="field"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={30}
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-semibold text-ink-300">موديل الموبايل</span>
          <input
            className="field"
            value={deviceModel}
            onChange={(e) => onDeviceModelChange(e.target.value)}
            maxLength={160}
            placeholder="مثال: Galaxy A54"
            dir="ltr"
          />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-ink-300">نوع الطلب</span>
          <select className="field" value={requestType} onChange={(e) => setRequestType(e.target.value as RequestType)}>
            {REQUEST_TYPES.map((type) => (
              <option key={type} value={type}>
                {REQUEST_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label>
        <span className="mb-2 block text-sm font-semibold text-ink-300">القطعة أو الخدمة المطلوبة</span>
        <input
          className="field"
          value={part}
          onChange={(e) => setPart(e.target.value)}
          maxLength={160}
          placeholder="مثال: شاشة، سماعة مكالمات، بطارية"
        />
      </label>

      <label>
        <span className="mb-2 block text-sm font-semibold text-ink-300">تفاصيل إضافية</span>
        <textarea
          className="field min-h-28 resize-y"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
          placeholder="اوصف المشكلة أو أي تفاصيل تساعدنا نرد عليك بدقة"
        />
      </label>

      {formError && <p className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{formError}</p>}

      <button type="submit" disabled={state === 'submitting'} className="btn-primary w-full sm:w-auto sm:justify-self-start">
        <Send className="h-4 w-4" aria-hidden="true" />
        {state === 'submitting' ? 'جاري الإرسال...' : 'إرسال الاستفسار'}
      </button>
    </form>
  );
}
