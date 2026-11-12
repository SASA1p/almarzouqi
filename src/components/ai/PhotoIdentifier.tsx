import { useRef, useState } from 'react';
import { AlertCircle, Camera, CheckCircle2, ImagePlus, Loader2, Sparkles } from 'lucide-react';
import { identifyPhoneImage } from '@/lib/ai';
import { fileToResizedDataUrl } from '@/lib/image';
import type { PhoneIdentification } from '@/types';

interface PhotoIdentifierProps {
  onIdentified?: (identification: PhoneIdentification) => void;
  useLabel: string;
}

type Status = 'idle' | 'reading' | 'analyzing' | 'done' | 'error';

export default function PhotoIdentifier({ onIdentified, useLabel }: PhotoIdentifierProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<PhoneIdentification | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setResult(null);
    setStatus('reading');
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      setPreview(dataUrl);
      setStatus('analyzing');
      const response = await identifyPhoneImage(dataUrl);
      if (response.error) {
        setError(response.error);
        setStatus('error');
        return;
      }
      setResult(response.data);
      setStatus('done');
    } catch {
      setError('لم نتمكن من قراءة الصورة، جرب صورة أخرى.');
      setStatus('error');
    }
  };

  const isBusy = status === 'reading' || status === 'analyzing';
  const identifiedModel = result?.model.trim() ?? '';

  return (
    <div className="glass rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isBusy}
          className="group relative flex aspect-square w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-dashed border-ink-600 bg-ink-900/80 text-ink-300 transition hover:border-neon-blue/60 hover:text-neon-blue disabled:cursor-wait sm:w-48 sm:shrink-0"
        >
          {preview ? (
            <img src={preview} alt="صورة الموبايل المرفوعة" className="h-full w-full object-cover" />
          ) : (
            <>
              <Camera className="h-9 w-9" aria-hidden="true" />
              <span className="text-sm font-semibold">التقط أو ارفع صورة</span>
            </>
          )}
          {isBusy && (
            <span className="absolute inset-0 flex items-center justify-center bg-ink-950/70 backdrop-blur-sm">
              <Loader2 className="h-8 w-8 animate-spin text-neon-blue" aria-hidden="true" />
            </span>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => {
            handleFile(event.target.files?.[0]);
            event.target.value = '';
          }}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neon-blue/10 text-neon-blue">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-bold text-ink-100">تعرف على موبايلك بالصورة</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-400">
                صوّر الجهاز بشكل واضح من الأمام أو الخلف، والذكاء الاصطناعي هيحدد الماركة والموديل.
              </p>
            </div>
          </div>

          {status === 'analyzing' && <p className="text-sm text-ink-300">جاري تحليل الصورة...</p>}

          {error && (
            <p className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </p>
          )}

          {result && status === 'done' && (
            <div className="animate-rise-in rounded-xl border border-white/10 bg-ink-900/80 p-4">
              {identifiedModel ? (
                <>
                  <p className="flex items-center gap-2 text-sm font-semibold text-success">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    تم التعرف على الجهاز
                    {result.confidence > 0 && <span className="text-ink-400">({Math.round(result.confidence * 100)}%)</span>}
                  </p>
                  <p className="mt-2 text-xl font-extrabold text-ink-100" dir="ltr">
                    {[result.brand, identifiedModel].filter(Boolean).join(' ')}
                  </p>
                  {result.color && <p className="mt-1 text-sm text-ink-400">اللون: {result.color}</p>}
                  {result.details && <p className="mt-2 text-sm leading-relaxed text-ink-300">{result.details}</p>}
                  {onIdentified && (
                    <button type="button" onClick={() => onIdentified(result)} className="btn-primary mt-4 w-full sm:w-auto">
                      {useLabel}
                    </button>
                  )}
                </>
              ) : (
                <p className="text-sm leading-relaxed text-ink-300">
                  لم نتمكن من تحديد موديل واضح. جرب صورة أقرب للجهاز، أو اكتب اسم الموديل يدوياً.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
