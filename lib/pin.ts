import { Client } from "@/models/Client";

/**
 * 6 xonali unikal PIN generatsiya qiladi. Bir marta berilgan PIN mijoz
 * uchun hech qachon o'zgarmaydi — shuning uchun bazada mavjud emasligini
 * tekshirib chiqamiz.
 */
export async function generateUniquePin(): Promise<string> {
  let pin = "";
  let attempts = 0;

  while (attempts < 1000) {
    attempts++;
    pin = Math.floor(100000 + Math.random() * 900000).toString();
    const exists = await Client.exists({ pin });
    if (!exists) return pin;
  }

  throw new Error("Unikal PIN generatsiya qilib bo'lmadi, qaytadan urinib ko'ring");
}
