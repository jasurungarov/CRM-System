import type { LeadStatus, EducationLevel } from "@/lib/enums";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  yangi: "Yangi",
  boglanildi: "Bog'lanildi",
  qiziqmoqda: "Qiziqmoqda",
  tayyor: "Tayyor",
  rad_etdi: "Rad etdi",
};

export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  maktab_bitiruvchisi: "Maktab bitiruvchisi",
  kollej_litsey: "Kollej-litsey",
  bakalavriat: "Bakalavriat",
  magistratura: "Magistratura",
  boshqa: "Boshqa",
};