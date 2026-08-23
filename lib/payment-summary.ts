import { Payment } from "@/models/Payment";
import { Tariff } from "@/models/Tariff";
import { Client } from "@/models/Client";

export type PaymentStatusSummary = "to_liq_to_langan" | "qisman_to_langan" | "to_lanmagan";

export interface ClientPaymentSummary {
  clientId: string;
  tariffPrice: number;
  totalPaid: number;
  remainingDebt: number;
  overpaidAmount: number;
  paymentStatus: PaymentStatusSummary;
  completionRatePercent: number;
  paymentsCount: number;
  lastPaymentDate?: Date;
}

export async function getPaymentSummaryForClient(clientId: string): Promise<ClientPaymentSummary> {
  const client = await Client.findById(clientId).lean();
  if (!client) throw new Error("Mijoz topilmadi");

  const tariff = await Tariff.findById(client.tariffId).lean();
  const tariffPrice = tariff?.price ?? 0;

  const confirmedPayments = await Payment.find({ clientId, status: "tasdiqlangan" })
    .sort({ createdAt: -1 })
    .lean();

  const totalPaid = confirmedPayments.reduce((sum, p) => sum + p.amount, 0);
  const remainingDebt = Math.max(0, tariffPrice - totalPaid);
  const overpaidAmount = Math.max(0, totalPaid - tariffPrice);

  let paymentStatus: PaymentStatusSummary = "to_lanmagan";
  if (tariffPrice > 0 && totalPaid >= tariffPrice) {
    paymentStatus = "to_liq_to_langan";
  } else if (totalPaid > 0) {
    paymentStatus = "qisman_to_langan";
  }

  const completionRatePercent =
    tariffPrice > 0
      ? Math.min(100, Math.round((totalPaid / tariffPrice) * 100))
      : totalPaid > 0
        ? 100
        : 0;

  return {
    clientId,
    tariffPrice,
    totalPaid,
    remainingDebt,
    overpaidAmount,
    paymentStatus,
    completionRatePercent,
    paymentsCount: confirmedPayments.length,
    lastPaymentDate: confirmedPayments[0]?.createdAt,
  };
}
