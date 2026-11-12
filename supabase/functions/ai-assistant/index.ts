const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";
const MAX_IMAGE_CHARS = 6_000_000;
const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 2000;

const SHOP_CONTEXT = `أنت المساعد الذكي لمتجر "المرزوقي" لبيع وصيانة الموبايلات وإكسسواراتها.
تتكلم بالعربية (باللهجة المصرية الواضحة) ما لم يكتب العميل بلغة أخرى.
تساعد العميل في معرفة أنواع الشاشات والجرابات والإكسسوارات المناسبة لموبايله، وفي شرح أعطال الهاتف البسيطة،
وفي توجيهه لإرسال استفسار للمحل للحصول على السعر الدقيق. لا تعطي أسعاراً محددة من عندك؛ قل إن السعر يحدده المحل.
اجعل الردود قصيرة ومرتبة.`;

const IDENTIFY_PROMPT = `You identify mobile phones and their accessories from photos.
Return ONLY a JSON object with these keys:
- "brand": manufacturer name in English (e.g. "Apple", "Samsung", "Xiaomi"), or "" if unknown
- "model": full model name as precisely as possible (e.g. "iPhone 14 Pro Max", "Galaxy S23 Ultra"), or "" if unknown
- "color": visible color, or ""
- "confidence": number from 0 to 1
- "item_type": one of "phone", "screen", "case", "accessory", "unknown"
- "details": a short Arabic sentence describing what is visible and any uncertainty
If the image does not show a phone or accessory, set item_type to "unknown" and model to "".`;

type ChatMessage = { role: "user" | "assistant"; content: string };

const isChatMessage = (value: unknown): value is ChatMessage => {
  if (!value || typeof value !== "object") return false;
  const { role, content } = value as Record<string, unknown>;
  return (role === "user" || role === "assistant") &&
    typeof content === "string" && content.length > 0 && content.length <= MAX_MESSAGE_CHARS;
};

async function callOpenAI(apiKey: string, body: Record<string, unknown>) {
  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: MODEL, ...body }),
  });
  if (!response.ok) {
    throw new Error(`AI service responded with status ${response.status}`);
  }
  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("AI service returned an unexpected response");
  }
  return content;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return jsonResponse({ error: "AI is not configured yet" }, 503);
    }

    const payload = await req.json();
    const action = payload?.action;

    if (action === "identify") {
      const image = payload?.image;
      if (typeof image !== "string" || !image.startsWith("data:image/") || image.length > MAX_IMAGE_CHARS) {
        return jsonResponse({ error: "Invalid image" }, 400);
      }
      const content = await callOpenAI(apiKey, {
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: IDENTIFY_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Identify this device." },
              { type: "image_url", image_url: { url: image, detail: "high" } },
            ],
          },
        ],
      });
      const result = JSON.parse(content);
      return jsonResponse({
        brand: String(result.brand ?? ""),
        model: String(result.model ?? ""),
        color: String(result.color ?? ""),
        confidence: Number(result.confidence) || 0,
        item_type: String(result.item_type ?? "unknown"),
        details: String(result.details ?? ""),
      });
    }

    if (action === "chat") {
      const messages = payload?.messages;
      if (!Array.isArray(messages) || messages.length === 0 || !messages.every(isChatMessage)) {
        return jsonResponse({ error: "Invalid messages" }, 400);
      }
      const reply = await callOpenAI(apiKey, {
        messages: [
          { role: "system", content: SHOP_CONTEXT },
          ...messages.slice(-MAX_MESSAGES),
        ],
      });
      return jsonResponse({ reply });
    }

    return jsonResponse({ error: "Unknown action" }, 400);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return jsonResponse({ error: message }, 500);
  }
});
