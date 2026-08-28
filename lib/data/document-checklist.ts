import type { DocumentType } from "@/lib/enums";

export const DOCUMENT_CHECKLIST_TEMPLATE: Array<{
  docType: DocumentType;
  title: string;
  description: string;
  isRequired: boolean;
}> = [
  {
    docType: "pasport",
    title: "Xorijga chiqish pasporti (Zagran pasport)",
    description: "Amal qilish muddati kamida 2 yil bo'lishi lozim. Asl nusxa va to'liq skaneri.",
    isRequired: true,
  },
  {
    docType: "attestat_diplom",
    title: "Attestat / Diplom va Baholar ilovasi",
    description:
      "Maktab attestati yoki kollej/litsey diplomi. Arab tiliga notarial tasdiqlangan tarjimasi va apostili bilan.",
    isRequired: true,
  },
  {
    docType: "tibbiy_malumotnoma",
    title: "Tibbiy ma'lumotnoma (086-U / Yuqumli kasalliklar tahlili)",
    description: "OITS (OIV), Gepatit B va C, Sil (fluorografiya) yo'qligi to'g'risida rasmiy poliklinika xulosasi.",
    isRequired: true,
  },
  {
    docType: "sudlanmaganlik",
    title: "Sudlanmaganlik haqida ma'lumotnoma",
    description: "Yagona darcha (my.gov.uz) yoki IIV tomonidan berilgan va arabchaga notarial tarjima qilingan.",
    isRequired: true,
  },
  {
    docType: "foto_3x4",
    title: "3x4 (yoki 4x6) Oq fondagi fotosurat",
    description: "Yaqin 3 oy ichida olingan, oq fonda, yorug'​ va sifatli elektron fotosurat.",
    isRequired: true,
  },
  {
    docType: "tavsiyanoma_1",
    title: "Tavsiyanoma (Tavsiya xati)",
    description: "Imom-xatib, masjid, maktab, litsey yoki universitet o'qituvchisi yoki ilmiy rahbar tomonidan.",
    isRequired: true,
  },
  {
    docType: "tarjimai_hol",
    title: "Tarjimai hol (CV / Resume / Motivatsion xat)",
    description: "Talabaning qiziqishlari, ta'lim maqsadi va Saudiya grantiga nega munosibligi haqidagi bayonot.",
    isRequired: true,
  },
  {
    docType: "til_sertifikati",
    title: "Arab tili / Ingliz tili sertifikati",
    description: "IELTS, CEFR yoki boshqa til sertifikatlari (ixtiyoriy, lekin grant olish imkoniyatini oshiradi).",
    isRequired: false,
  },
];
