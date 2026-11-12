import { useState } from 'react';
import { LogOut, MessageSquare, Package, ShieldAlert } from 'lucide-react';
import InquiriesPanel from '@/components/owner/InquiriesPanel';
import OwnerAuthForm from '@/components/owner/OwnerAuthForm';
import ProductsPanel from '@/components/owner/ProductsPanel';
import { supabase } from '@/lib/supabase';
import { useOwnerAccess } from '@/hooks/useOwnerAccess';

type OwnerTab = 'inquiries' | 'products';

const TABS: { id: OwnerTab; label: string; icon: typeof MessageSquare }[] = [
  { id: 'inquiries', label: 'الاستفسارات', icon: MessageSquare },
  { id: 'products', label: 'المنتجات', icon: Package },
];

function CenteredMessage({ title, text, children }: { title: string; text: string; children?: React.ReactNode }) {
  return (
    <div className="glass mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl p-8 text-center">
      <ShieldAlert className="h-10 w-10 text-warning" aria-hidden="true" />
      <h2 className="text-xl font-bold text-ink-100">{title}</h2>
      <p className="leading-relaxed text-ink-300">{text}</p>
      {children}
    </div>
  );
}

export default function OwnerPage() {
  const access = useOwnerAccess();
  const [tab, setTab] = useState<OwnerTab>('inquiries');

  const signOut = () => {
    supabase.auth.signOut();
  };

  if (access.status === 'loading') {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-ink-700 border-t-neon-blue" />
      </div>
    );
  }

  if (access.status === 'signed_out') {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-ink-100">
            <span className="rgb-text">صفحة صاحب المحل</span>
          </h1>
          <p className="mt-4 text-ink-300">سجل دخول لإدارة الاستفسارات والمنتجات.</p>
        </header>
        <OwnerAuthForm />
      </div>
    );
  }

  if (access.status === 'error') {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <CenteredMessage title="تعذر التحقق من الحساب" text="حاول تحديث الصفحة بعد لحظات.">
          <button type="button" onClick={signOut} className="btn-ghost">
            تسجيل الخروج
          </button>
        </CenteredMessage>
      </div>
    );
  }

  if (access.status === 'not_owner') {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <CenteredMessage
          title="الحساب في انتظار التفعيل"
          text="تم تسجيل دخولك بنجاح، لكن الحساب ده مش مفعل كحساب صاحب المحل. تواصل مع إدارة المتجر لتفعيله."
        >
          <button type="button" onClick={signOut} className="btn-ghost">
            تسجيل الخروج
          </button>
        </CenteredMessage>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-ink-100 sm:text-4xl">
            <span className="rgb-text">لوحة صاحب المحل</span>
          </h1>
          <p className="mt-2 text-sm text-ink-400" dir="ltr">
            {access.email}
          </p>
        </div>
        <button type="button" onClick={signOut} className="btn-ghost py-2">
          <LogOut className="h-4 w-4" aria-hidden="true" />
          تسجيل الخروج
        </button>
      </header>

      <div className="mb-8 flex gap-2 border-b border-white/5" role="tablist" aria-label="أقسام اللوحة">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
              tab === id ? 'border-neon-blue text-neon-blue' : 'border-transparent text-ink-400 hover:text-ink-100'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'inquiries' ? <InquiriesPanel /> : <ProductsPanel />}
    </div>
  );
}
