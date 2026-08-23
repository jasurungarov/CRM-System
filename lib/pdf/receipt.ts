import jsPDF from "jspdf";

export interface ReceiptData {
  receiptNumber: string;
  date: string | Date;
  clientName: string;
  clientPin: string;
  clientPhone: string;
  tariffName: string;
  tariffPrice: number;
  amount: number;
  paymentMethod: string;
  totalPaid: number;
  remainingDebt: number;
  paymentStatus: string;
  cashierName: string;
  note?: string;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  naqd: "Naqd",
  karta: "Plastik karta",
  bank_otkazma: "Bank o'tkazmasi",
  payme: "Payme",
  click: "Click",
  boshqa: "Boshqa",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  to_liq_to_langan: "To'liq to'langan",
  qisman_to_langan: "Qisman to'langan",
  to_lanmagan: "To'lanmagan",
};

function formatSom(value: number) {
  return `${value.toLocaleString("uz-UZ")} so'm`;
}

/** To'lov kvitansiyasini A5 formatidagi PDF sifatida generatsiya qilib, brauzerda yuklab beradi. */
export function downloadReceiptPdf(data: ReceiptData) {
  const doc = new jsPDF({ format: "a5", unit: "mm" });
  const navy: [number, number, number] = [18, 41, 63];
  const gold: [number, number, number] = [201, 150, 42];
  const pageWidth = doc.internal.pageSize.getWidth();

  // Sarlavha
  doc.setFillColor(...navy);
  doc.rect(0, 0, pageWidth, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text("Ansor Edu Consulting", pageWidth / 2, 10, { align: "center" });
  doc.setFontSize(9);
  doc.text("To'lov kvitansiyasi", pageWidth / 2, 16, { align: "center" });

  doc.setTextColor(...gold);
  doc.setFontSize(10);
  doc.text(data.receiptNumber, pageWidth / 2, 20.5, { align: "center" });

  let y = 32;
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(10);

  const row = (label: string, value: string) => {
    doc.setFont("helvetica", "normal");
    doc.text(label, 12, y);
    doc.setFont("helvetica", "bold");
    doc.text(value, pageWidth - 12, y, { align: "right" });
    y += 7;
  };

  row("Sana:", new Date(data.date).toLocaleDateString("uz-UZ"));
  row("Mijoz:", data.clientName);
  row("PIN:", data.clientPin);
  row("Telefon:", data.clientPhone);
  row("Tarif:", `${data.tariffName} (${formatSom(data.tariffPrice)})`);

  y += 2;
  doc.setDrawColor(...gold);
  doc.line(12, y, pageWidth - 12, y);
  y += 8;

  doc.setFontSize(11);
  row("To'lov summasi:", formatSom(data.amount));
  row("To'lov usuli:", PAYMENT_METHOD_LABELS[data.paymentMethod] ?? data.paymentMethod);

  y += 2;
  doc.line(12, y, pageWidth - 12, y);
  y += 8;

  row("Jami to'langan:", formatSom(data.totalPaid));
  row("Qolgan qarz:", formatSom(data.remainingDebt));
  row("Holat:", PAYMENT_STATUS_LABELS[data.paymentStatus] ?? data.paymentStatus);

  if (data.note) {
    y += 2;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text(`Izoh: ${data.note}`, 12, y, { maxWidth: pageWidth - 24 });
    y += 8;
  }

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Kassir: ${data.cashierName}`, 12, y);

  doc.save(`${data.receiptNumber}.pdf`);
}
