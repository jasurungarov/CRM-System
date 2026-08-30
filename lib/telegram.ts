const TELEGRAM_API = "https://api.telegram.org";

export async function sendTelegramMessage(chatId: string, text: string): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return { ok: false, error: "TELEGRAM_BOT_TOKEN sozlanmagan" };
  }

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    const data = await res.json();
    if (!data.ok) {
      return { ok: false, error: data.description || "Telegram xabar yuborishda xatolik" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Telegram serveriga ulanib bo'lmadi" };
  }
}

/** Xodim o'z Telegramidan ulashishi uchun tayyor havola (bot infratuzilmasisiz ishlaydi) */
export function buildTelegramShareUrl(link: string, text: string): string {
  const params = new URLSearchParams({ url: link, text });
  return `https://t.me/share/url?${params.toString()}`;
}

/** Telegram HTML parse_mode uchun xavfli belgilarni ekranlaydi */
export function escapeTelegramHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
