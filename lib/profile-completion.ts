interface ClientLike {
  fullName?: string;
  phone?: string;
  email?: string;
  tariffId?: unknown;
  assignedTo?: unknown;
  universities?: unknown[];
}

/**
 * Mijoz profilining to'liqlik foizini hisoblaydi (0-100).
 * Ballar: F.I.SH (20) + telefon (20) + email (15) + tarif (15) +
 * biriktirilgan konsultant (10) + kamida 1 ta universitet arizasi (20).
 */
export function calculateProfileCompletion(client: ClientLike): number {
  let score = 0;
  if (client.fullName && client.fullName.trim().length > 3) score += 20;
  if (client.phone && client.phone.trim().length >= 7) score += 20;
  if (client.email && client.email.includes("@")) score += 15;
  if (client.tariffId) score += 15;
  if (client.assignedTo) score += 10;
  if (client.universities && client.universities.length > 0) score += 20;
  return Math.min(100, score);
}
