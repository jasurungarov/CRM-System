import jsPDF from "jspdf";
import { COMPANY_INFO } from "@/lib/company-info";

export interface ContractPdfData {
  contractNumber: string;
  sentAt: string | Date;
  confirmedAt?: string | Date | null;
  clientAcceptedName?: string;
  clientData: {
    fullName: string;
    phone: string;
    email: string;
    pin: string;
    tariffName: string;
    tariffPrice: number;
    totalPaid: number;
    remainingDebt: number;
    assignedConsultantName: string;
    universities: Array<{ name: string; program: string; deadline: string | Date }>;
  };
}

function som(n: number) {
  return `${n.toLocaleString("uz-UZ")} so'm`;
}

export function downloadContractPdf(data: ContractPdfData) {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const navy: [number, number, number] = [18, 41, 63];
  const gold: [number, number, number] = [201, 150, 42];
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  let y = 0;

  doc.setFillColor(...navy);
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.text(COMPANY_INFO.name, margin, 12);
  doc.setFontSize(9);
  doc.text(`INN: ${COMPANY_INFO.inn} · ${COMPANY_INFO.phone}`, margin, 18);
  doc.setTextColor(...gold);
  doc.setFontSize(11);
  doc.text(`Shartnoma-tasdiqnoma № ${data.contractNumber}`, margin, 24);

  y = 36;
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(10);

  const line = (label: string, value: string) => {
    doc.setFont("helvetica", "normal");
    doc.text(label, margin, y);
    doc.setFont("helvetica", "bold");
    doc.text(value, pageWidth - margin, y, { align: "right" });
    y += 6.5;
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("1. Mijoz ma'lumotlari", margin, y);
  y += 7;
  doc.setFontSize(10);
  line("F.I.SH:", data.clientData.fullName);
  line("Telefon:", data.clientData.phone);
  line("PIN:", data.clientData.pin);
  line("Konsultant:", data.clientData.assignedConsultantName);

  y += 3;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("2. Tarif va moliyaviy shartlar", margin, y);
  y += 7;
  doc.setFontSize(10);
  line("Tanlangan tarif:", data.clientData.tariffName);
  line("Tarif narxi:", som(data.clientData.tariffPrice));
  line("To'langan summa:", som(data.clientData.totalPaid));
  line("Qolgan qarzdorlik:", som(data.clientData.remainingDebt));

  y += 3;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("3. Tanlangan universitetlar", margin, y);
  y += 7;
  doc.setFontSize(10);
  if (data.clientData.universities.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.text("Hozircha universitet tanlanmagan", margin, y);
    y += 6.5;
  } else {
    for (const u of data.clientData.universities) {
      doc.setFont("helvetica", "normal");
      doc.text(`• ${u.name} — ${u.program} (muddat: ${new Date(u.deadline).toLocaleDateString("uz-UZ")})`, margin, y, {
        maxWidth: pageWidth - margin * 2,
      });
      y += 6.5;
    }
  }

  y += 3;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("4. Umumiy shartlar", margin, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const terms = [
    "4.1. Ansor Edu Consulting mijozga tanlangan universitet(lar)ga hujjat topshirish, konsultatsiya va vizaga tayyorgarlik bo'yicha xizmat ko'rsatadi.",
    "4.2. Mijoz tanlangan tarif bo'yicha belgilangan to'lovni o'z vaqtida amalga oshirishga majburdir.",
    "4.3. Agar ariza universitet tomonidan rad etilsa — to'lov qaytarilmaydi. Agar rad etilish Ansor Edu xodimining aybi bilan bog'liq bo'lsa — mijozga to'liq yoki qisman pul qaytarish (refund) huquqi beriladi.",
    "4.4. Mijozning shaxsiy ma'lumotlari faqat ariza topshirish jarayoni doirasida ishlatiladi va uchinchi shaxslarga berilmaydi.",
    "4.5. Ushbu hujjatni elektron tasdiqlash orqali mijoz yuqoridagi barcha shartlarni to'liq o'qib chiqqan va rozi bo'lganini tasdiqlaydi.",
  ];
  for (const t of terms) {
    doc.text(t, margin, y, { maxWidth: pageWidth - margin * 2 });
    y += 10;
  }

  y += 4;
  doc.setDrawColor(...gold);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  if (data.confirmedAt) {
    doc.setTextColor(...navy);
    doc.text("ELEKTRON TASDIQLANGAN", margin, y);
    y += 6.5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 20, 20);
    doc.text(`Tasdiqlagan: ${data.clientAcceptedName ?? data.clientData.fullName}`, margin, y);
    y += 6.5;
    doc.text(`Sana: ${new Date(data.confirmedAt).toLocaleString("uz-UZ")}`, margin, y);
  } else {
    doc.text("Holat: hali tasdiqlanmagan", margin, y);
  }

  doc.save(`${data.contractNumber}.pdf`);
}
