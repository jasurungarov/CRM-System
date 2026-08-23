// Butun loyihada ishlatiladigan umumiy tur (type) va enum qiymatlar.
// Modellar, server actionlar va UI komponentlar shu yerdan import qiladi —
// bitta joyda saqlanishi kelajakda o'zgartirishni osonlashtiradi.

export type UserRole = "admin" | "manager" | "consultant";

export type ApplicationStatus =
  | "topshirilmagan"
  | "topshirilgan"
  | "rad_etildi"
  | "qabul_qilindi";

export type FailureReason = "universitet_rad_etdi" | "menejer_aybi" | null;

export type PaymentMethod =
  | "naqd"
  | "karta"
  | "bank_otkazma"
  | "payme"
  | "click"
  | "boshqa";

export type PaymentStatus = "tasdiqlangan" | "kutilmoqda" | "bekor_qilingan";

export type DocumentType =
  | "pasport"
  | "attestat_diplom"
  | "metrika"
  | "tibbiy_malumotnoma"
  | "sudlanmaganlik"
  | "foto_3x4"
  | "tavsiyanoma_1"
  | "tavsiyanoma_2"
  | "tarjimai_hol"
  | "til_sertifikati"
  | "boshqa";

export type DocumentStatus = "yuklanmagan" | "kutilmoqda" | "qabul_qilindi" | "rad_etildi";

export type ConfirmationStatus = "yuborildi" | "tasdiqlandi" | "muddati_otgan" | "bekor_qilingan";

export type NotificationType =
  | "deadline_urgent"
  | "deadline_warning"
  | "deadline_approaching"
  | "payment_debt"
  | "document_missing"
  | "contract_pending"
  | "contract_accepted"
  | "system_alert"
  | "status_change";

export type NotificationPriority = "shoshilinch" | "yuqori" | "orta" | "past";

export type AuditCategory =
  | "auth"
  | "client"
  | "payment"
  | "application"
  | "document"
  | "confirmation"
  | "staff"
  | "system";

export type AuditSeverity = "info" | "warning" | "danger" | "critical";
