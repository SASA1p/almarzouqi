import { useState, type FormEvent } from 'react';
import { AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Mode = 'signin' | 'signup';

export default function OwnerAuthForm() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setNotice(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || password.length < 6) {
      setError('اكتب بريد إلكتروني صحيح وكلمة سر من 6 حروف على الأقل.');
      return;
    }
    setError(null);
    setNotice(null);
    setBusy(true);

    if (mode === 'signin') {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (signInError) {
        setError('البريد أو كلمة السر غير صحيحة.');
      }
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({ email: cleanEmail, password });
      if (signUpError) {
        setError(
          signUpError.message.toLowerCase().includes('already')
            ? 'البريد ده مسجل قبل كده، سجل دخول بدلاً من إنشاء حساب.'
            : 'تعذر إنشاء الحساب، تأكد من البيانات وحاول مرة أخرى.',
        );
      } else if (!data.session) {
        setNotice('تم إنشاء الحساب. سجل دخول الآن.');
        switchMode('signin');
      }
    }
    setBusy(false);
  };

  return (
    <div className="glass mx-auto w-full max-w-md rounded-2xl p-6 sm:p-8">
      <div className="mb-6 flex rounded-xl bg-ink-900 p-1">
        {(['signin', 'signup'] as Mode[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => switchMode(item)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
              mode === item ? 'bg-neon-blue text-ink-950' : 'text-ink-300 hover:text-ink-100'
            }`}
          >
            {item === 'signin' ? 'تسجيل الدخول' : 'إنشاء حساب'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <label>
          <span className="mb-2 block text-sm font-semibold text-ink-300">البريد الإلكتروني</span>
          <input
            type="email"
            className="field"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            dir="ltr"
          />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-ink-300">كلمة السر</span>
          <input
            type="password"
            className="field"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            dir="ltr"
          />
        </label>

        {error && (
          <p className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}
        {notice && <p className="rounded-xl border border-success/30 bg-success/10 p-3 text-sm text-success">{notice}</p>}

        <button type="submit" disabled={busy} className="btn-primary w-full">
          {mode === 'signin' ? <LogIn className="h-4 w-4" aria-hidden="true" /> : <UserPlus className="h-4 w-4" aria-hidden="true" />}
          {busy ? 'جاري التنفيذ...' : mode === 'signin' ? 'دخول' : 'إنشاء الحساب'}
        </button>
      </form>
    </div>
  );
}
