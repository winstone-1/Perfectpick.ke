import { CATEGORY_GROUPS } from '../config/categories.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
// llama-3.3-70b-versatile is decommissioned (404) as of 2026-09; best available free-tier replacement is openai/gpt-oss-20b (verified working, 20B, fast).
const GROQ_MODEL = 'openai/gpt-oss-20b';
const WHATSAPP_URL = 'https://wa.me/254787251690';
const WHATSAPP_DISPLAY = '+254 787 251 690';
const FALLBACK_MESSAGE = `Sorry, I'm having trouble right now — chat with us directly on WhatsApp (${WHATSAPP_DISPLAY}): ${WHATSAPP_URL}`;
const HANDOFF_PHRASE = 'let me connect you to our team on WhatsApp';

// Build grounded system prompt from real shop data
const buildSystemPrompt = () => {
  const categoryLines = CATEGORY_GROUPS.map(g => `- ${g.parent}: ${g.categories.join(', ')}`).join('\n');
  return `You are Pia, the friendly assistant for PerfectPick — a curated luxury boutique in Nairobi, Kenya.

REAL SHOP INFO (use only this, do not invent):
- Location: Amaziah Square, Muthiga, Along Waiyaki Way, Nairobi (https://maps.google.com/?q=Amaziah+Square+Muthiga+Waiyaki+Way+Nairobi)
- WhatsApp / Phone: ${WHATSAPP_DISPLAY} (${WHATSAPP_URL})
- Hours: Mon - Sat: 8:30 AM - 7:30 PM, Sun & Holidays: 10:30 AM - 6:00 PM
- Payment: M-Pesa (Lipa na M-Pesa), Till number shared at checkout
- Delivery: Nairobi 1-2 business days, Free delivery in Nairobi CBD & Estates (standard). 7-day exchange/returns.
- Business started 2025, curated luxury: bags, shoes, jewelry, accessories, clothes, gifts — not mass-market retail.

REAL CATEGORIES (do not invent others):
${categoryLines}

RULES — STRICT:
- NEVER invent stock levels, prices, variants, order status, tracking numbers, or order-specific data. You have NO access to inventory DB or user orders.
- If asked about stock/price for a specific product, give general guidance (e.g., "check the product page for current stock/price") and offer WhatsApp for exact availability.
- For order status lookups, complaints, refunds, price negotiation, or anything requiring account/DB access, say exactly: "${HANDOFF_PHRASE} (${WHATSAPP_DISPLAY}): ${WHATSAPP_URL}" — do not guess.
- For general product/shop Q&A (what categories we carry, where we are, hours, how to order, delivery, payment methods, styling advice) answer helpfully and concisely.
- Keep answers short (2-4 sentences), friendly, Kenyan context. Use English unless user writes in Kiswahili — then reply in Kiswahili.
- Never claim to be human. You are Pia, an AI assistant for PerfectPick.
- If unsure, prefer handoff: "${HANDOFF_PHRASE}".`;
};

export const chatWithPia = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }
    if (message.length > 1000) {
      return res.status(400).json({ success: false, message: 'Message too long (max 1000 chars)' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn('[CHAT] GROQ_API_KEY missing — returning fallback');
      return res.json({ success: true, reply: FALLBACK_MESSAGE, fallback: true });
    }

    // Sanitize history: expect [{role:'user'|'assistant', content:string}]
    const sanitizedHistory = Array.isArray(history)
      ? history
          .filter(h => h && typeof h.content === 'string' && ['user','assistant'].includes(h.role))
          .slice(-10) // last 10 turns only
          .map(h => ({ role: h.role, content: h.content.slice(0, 1000) }))
      : [];

    const messages = [
      { role: 'system', content: buildSystemPrompt() },
      ...sanitizedHistory,
      { role: 'user', content: message.trim() },
    ];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error(`[CHAT] Groq error ${response.status}: ${errText.slice(0,500)}`);
      // On quota/rate limit, return fallback but not 500 — keep UX intact
      return res.json({ success: true, reply: FALLBACK_MESSAGE, fallback: true });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      console.error('[CHAT] Groq empty choices:', JSON.stringify(data).slice(0,500));
      return res.json({ success: true, reply: FALLBACK_MESSAGE, fallback: true });
    }

    return res.json({ success: true, reply });
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('[CHAT] Groq timeout');
    } else {
      console.error('[CHAT] Groq fetch failed:', error.message);
    }
    return res.json({ success: true, reply: FALLBACK_MESSAGE, fallback: true });
  }
};
