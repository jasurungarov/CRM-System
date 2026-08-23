"use server";

import { connectDB } from "@/lib/db";
import { Client } from "@/models/Client";
import { Payment } from "@/models/Payment";
import { User } from "@/models/User";
import { Tariff } from "@/models/Tariff";
import { requireRole } from "@/lib/auth";

/** Oylik tushum (joriy yil, Reports sahifasidagi chart uchun) */
export async function getMonthlyRevenueReport() {
  await requireRole(["admin", "manager"]);
  await connectDB();

  const year = new Date().getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);

  const payments = await Payment.find({
    status: "tasdiqlangan",
    createdAt: { $gte: start, $lt: end },
  })
    .select("amount createdAt")
    .lean();

  const monthNames = [
    "Yan", "Fev", "Mar", "Apr", "May", "Iyun",
    "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek",
  ];
  const monthly = monthNames.map((label) => ({ month: label, revenue: 0 }));

  for (const p of payments) {
    const monthIndex = new Date(p.createdAt).getMonth();
    monthly[monthIndex].revenue += p.amount;
  }

  return monthly;
}

/** Ariza holatlari bo'yicha taqsimot (funnel/pie chart uchun) */
export async function getApplicationsFunnelReport() {
  await requireRole(["admin", "manager"]);
  await connectDB();

  const clients = await Client.find({}).select("universities").lean();
  const counts = { topshirilmagan: 0, topshirilgan: 0, qabul_qilindi: 0, rad_etildi: 0 };

  for (const c of clients) {
    for (const u of c.universities) {
      counts[u.submissionStatus as keyof typeof counts] =
        (counts[u.submissionStatus as keyof typeof counts] ?? 0) + 1;
    }
  }

  return [
    { status: "Topshirilmagan", count: counts.topshirilmagan },
    { status: "Topshirilgan", count: counts.topshirilgan },
    { status: "Qabul qilindi", count: counts.qabul_qilindi },
    { status: "Rad etildi", count: counts.rad_etildi },
  ];
}

/** Har bir konsultant bo'yicha samaradorlik: mijozlar soni, arizalar, tushum */
export async function getConsultantPerformanceReport() {
  await requireRole(["admin", "manager"]);
  await connectDB();

  const consultants = await User.find({ role: { $in: ["consultant", "manager"] }, isActive: true }).lean();
  const results = [];

  for (const c of consultants) {
    const clients = await Client.find({ assignedTo: c._id }).lean();
    const clientIds = clients.map((cl) => cl._id);
    const payments = await Payment.find({ clientId: { $in: clientIds }, status: "tasdiqlangan" }).lean();

    const totalApplications = clients.reduce((sum, cl) => sum + cl.universities.length, 0);
    const acceptedApplications = clients.reduce(
      (sum, cl) => sum + cl.universities.filter((u) => u.submissionStatus === "qabul_qilindi").length,
      0
    );
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    results.push({
      consultantId: String(c._id),
      consultantName: c.name,
      clientsCount: clients.length,
      applicationsCount: totalApplications,
      acceptedCount: acceptedApplications,
      revenue: totalRevenue,
    });
  }

  return results.sort((a, b) => b.revenue - a.revenue);
}

/** Excel eksport uchun xom mijozlar ma'lumoti (brauzerda xlsx generatsiya qilinadi) */
export async function getClientsExportData() {
  await requireRole(["admin", "manager"]);
  await connectDB();

  const clients = await Client.find({}).lean();
  const tariffs = await Tariff.find({}).lean();
  const consultants = await User.find({}).lean();
  const tariffMap = new Map(tariffs.map((t) => [String(t._id), t.name]));
  const consultantMap = new Map(consultants.map((u) => [String(u._id), u.name]));

  return clients.map((c) => ({
    "F.I.SH": c.fullName,
    Telefon: c.phone,
    Email: c.email,
    PIN: c.pin,
    Tarif: tariffMap.get(String(c.tariffId)) ?? "",
    Konsultant: consultantMap.get(String(c.assignedTo)) ?? "",
    "Universitetlar soni": c.universities.length,
    "Profil to'liqligi (%)": c.profileCompletionPercent,
    "Ro'yxatdan o'tgan sana": new Date(c.createdAt).toLocaleDateString("uz-UZ"),
  }));
}

/** Excel eksport uchun xom to'lovlar ma'lumoti */
export async function getPaymentsExportData() {
  await requireRole(["admin", "manager"]);
  await connectDB();

  const payments = await Payment.find({}).sort({ createdAt: -1 }).lean();
  const clients = await Client.find({}).lean();
  const clientMap = new Map(clients.map((c) => [String(c._id), c]));

  return payments.map((p) => {
    const client = clientMap.get(String(p.clientId));
    return {
      Kvitansiya: p.receiptNumber,
      Mijoz: client?.fullName ?? "",
      PIN: p.pin,
      Summa: p.amount,
      "To'lov usuli": p.paymentMethod,
      Holat: p.status,
      Sana: new Date(p.createdAt).toLocaleDateString("uz-UZ"),
    };
  });
}
