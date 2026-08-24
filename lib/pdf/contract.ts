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
  "4.1. Ansor Edu firmasi mijozga tanlangan universitet(lar)ga hujjatlarni tayyorlash, topshirish va konsultatsiya xizmatlarini ko'rsatadi. Firma xizmati jarayonni professional tashkil etishdan iborat bo'lib, universitet tomonidan qabul qilinishga kafolat bermaydi, chunki qabul qilish qarori to'liq universitetning ichki komissiyasi ixtiyorida.",
  "",
  "4.2. Agar mijoz tanlangan universitet(lar)ga qabul qilinmasa, bu firma xizmatining sifatsizligi deb hisoblanmaydi. Mijoz bunday holatda firmaga yoki uning xodimlariga nisbatan haqoratli yoki tuhmat xarakteridagi so'z va ayblovlarni bildirmaslikka rozilik bildiradi.",
  "",
  "4.3. To'lovni qaytarish shartlari quyidagicha belgilanadi: 4.3.1. Agar mijozning hujjatlari tanlangan universitet(lar)ga muvaffaqiyatli topshirilgan bo'lsa-yu, universitet komissiyasi qabul qilishdan bosh tortsa — bu holatda mijoz tomonidan to'langan xizmat haqi qaytarilmaydi, chunki firma o'z majburiyatini (topshirish jarayonini to'liq va sifatli tashkil etish) bajargan hisoblanadi. 4.3.2. Agar mijozning arizasi firma xodimi (menejer)ning aybi yoki e'tiborsizligi tufayli belgilangan muddatda universitet(lar)ga topshirilmay qolib ketgan bo'lsa — bu holatda mijoz tomonidan to'langan xizmat haqining to'liq summasi qaytariladi.",
  "",
  "",
  "4.4. Mijoz taqdim etgan barcha ma'lumot va hujjatlarning to'g'riligiga o'zi javobgar bo'lib, noto'g'ri ma'lumot sababli yuzaga kelgan rad javobiga firma javobgar emas. Mijozning shaxsiy ma'lumotlari faqat ariza topshirish jarayoni doirasida ishlatiladi va uchinchi shaxslarga berilmaydi.",
  "",
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
