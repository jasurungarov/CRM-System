const TELEGRAM_API = "https://api.telegram.org";

/**
 * Telegram Bot API orqali xabar yuboradi.
 *
 * ESLATMA: bu ishlashi uchun (1) .env'da TELEGRAM_BOT_TOKEN to'ldirilgan
 * bo'lishi va (2) mijozning shu bot bilan avval /start bosgan bo'lishi va
 * uning Telegram chat ID'si ClientConfirmation.telegramChatId maydonida
 * saqlangan bo'lishi kerak (chat ID botga /start bosilganda bot serverida
 * ko'rinadi — hozircha xodim buni qo'lda kiritadi; kelajakda buni avtomatik
 * bog'lash uchun bot webhook + mijoz profiliga "Telegram ulash" tugmasi
 * qo'shish mumkin).
 *
 * Agar chat ID mavjud bo'lmasa, tizim "Telegram orqali ulashish" havolasi
 * (t.me/share/url) orqali xodimning o'z Telegramidan yuborishini taklif
 * qiladi — bu holatda serverga ulanish shart emas.
 */
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
