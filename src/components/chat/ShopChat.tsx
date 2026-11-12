import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AlertCircle, Bot, Send, X } from 'lucide-react';
import { sendChatMessages } from '@/lib/ai';
import type { ChatMessage } from '@/types';

const GREETING: ChatMessage = {
  role: 'assistant',
  content: 'أهلاً بيك في المرزوقي! اسألني عن أي شاشة أو جراب أو عطل في موبايلك، وأنا أساعدك.',
};

export default function ShopChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setError(null);
    setSending(true);

    const response = await sendChatMessages(nextMessages.filter((message) => message !== GREETING));
    setSending(false);

    if (response.error || !response.data) {
      setError(response.error ?? 'لم يصل رد من المساعد الذكي.');
      return;
    }
    const reply = response.data.reply;
    setMessages((current) => [...current, { role: 'assistant', content: reply }]);
  };

  return (
    <div className="fixed bottom-5 end-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <section
          aria-label="المساعد الذكي"
          className="animate-rise-in glass flex h-[min(560px,75vh)] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl shadow-2xl shadow-black/60"
        >
          <header className="flex items-center justify-between border-b border-white/5 bg-ink-900/80 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon-blue/15 text-neon-blue">
                <Bot className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-bold text-ink-100">مساعد المرزوقي</p>
                <p className="text-xs text-success">متاح الآن</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-300 transition hover:bg-white/10 hover:text-ink-100"
              aria-label="إغلاق المساعد"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'ms-auto bg-neon-blue text-ink-950'
                    : 'me-auto bg-ink-800 text-ink-100'
                }`}
              >
                {message.content}
              </div>
            ))}
            {sending && (
              <div className="me-auto flex w-fit items-center gap-1.5 rounded-2xl bg-ink-800 px-4 py-3" aria-label="جاري الرد">
                <span className="h-2 w-2 animate-bounce rounded-full bg-ink-300 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-ink-300 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-ink-300" />
              </div>
            )}
            {error && (
              <p className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-white/5 p-3">
            <input
              className="field py-2.5"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="اكتب سؤالك هنا..."
              maxLength={2000}
              aria-label="اكتب رسالتك"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="btn-primary h-11 w-11 shrink-0 p-0"
              aria-label="إرسال"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="group flex h-14 items-center gap-2 rounded-full bg-ink-900 px-5 font-bold text-ink-100 shadow-lg ring-1 ring-neon-blue/40 transition hover:ring-neon-blue animate-glow-pulse"
        aria-expanded={open}
      >
        <Bot className="h-5 w-5 text-neon-blue" aria-hidden="true" />
        <span>{open ? 'إغلاق' : 'اسأل المساعد'}</span>
      </button>
    </div>
  );
}
