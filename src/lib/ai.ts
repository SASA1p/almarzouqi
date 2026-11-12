import { supabase } from '@/lib/supabase';
import type { ChatMessage, PhoneIdentification } from '@/types';

type AiResponse<T> = { data: T; error: null } | { data: null; error: string };

const NETWORK_ERROR = 'تعذر الاتصال بالمساعد الذكي، تحقق من الإنترنت وحاول مرة أخرى.';

async function readServerError(error: unknown): Promise<string> {
  const context = (error as { context?: Response })?.context;
  if (context && typeof context.json === 'function') {
    try {
      const body = (await context.json()) as { error?: string };
      if (typeof body.error === 'string') return body.error;
    } catch {
      return NETWORK_ERROR;
    }
  }
  return NETWORK_ERROR;
}

async function callAi<T>(body: Record<string, unknown>): Promise<AiResponse<T>> {
  try {
    const { data, error } = await supabase.functions.invoke<T>('ai-assistant', { body });
    if (error) {
      return { data: null, error: await readServerError(error) };
    }
    if (!data) {
      return { data: null, error: 'لم يصل رد من المساعد الذكي.' };
    }
    return { data, error: null };
  } catch {
    return { data: null, error: NETWORK_ERROR };
  }
}

export function identifyPhoneImage(image: string) {
  return callAi<PhoneIdentification>({ action: 'identify', image });
}

export function sendChatMessages(messages: ChatMessage[]) {
  return callAi<{ reply: string }>({ action: 'chat', messages });
}
