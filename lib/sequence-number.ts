import { Counter } from "@/models/Counter";

async function nextSequence(counterKey: string): Promise<number> {
  const updated = await Counter.findByIdAndUpdate(
    counterKey,
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  ).lean();
  return updated!.seq;
}

/**
 * "ANSOR EDU-2026-0001" formatida kvitansiya raqami. MongoDB'ning atomik
 * $inc operatsiyasi orqali generatsiya qilinadi — bir vaqtda bir nechta
 * to'lov qabul qilinsa ham raqamlar takrorlanmaydi (eski in-memory counter
 * bunga kafolat bermas edi).
 */
export async function generateReceiptNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const seq = await nextSequence(`receipt_${year}`);
  return `ANSOR EDU-${year}-${String(seq).padStart(4, "0")}`;
}

/** "ANS-SH-2026-0001" formatida shartnoma raqami (Confirmations moduli uchun) */
export async function generateContractNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const seq = await nextSequence(`contract_${year}`);
  return `ANS-SH-${year}-${String(seq).padStart(4, "0")}`;
}
