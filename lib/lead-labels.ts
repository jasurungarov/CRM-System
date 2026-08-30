import type { EducationLevel, LeadStatus } from "@/lib/enums";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  yangi: "statusYangi",
  boglanildi: "statusBoglanildi",
  qiziqmoqda: "statusQiziqmoqda",
  tayyor: "statusTayyor",
  rad_etdi: "statusRadEtdi",
};

export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  maktab_bitiruvchisi: "educationMaktab",
  kollej_litsey: "educationKollej",
  bakalavriat: "educationBakalavriat",
  magistratura: "educationMagistratura",
  boshqa: "educationBoshqa",
};
