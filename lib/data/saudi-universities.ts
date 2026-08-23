export interface SaudiUniversity {
  id: string;
  name: string;
  city: string;
  country: string;
  ranking: string;
  intake: string;
  defaultDeadline: string;
  popularPrograms: string[];
  scholarshipType: string;
  requirements: string;
}

export const SAUDI_UNIVERSITIES_CATALOG: SaudiUniversity[] = [
  {
    id: "ksu",
    name: "King Saud University (KSU)",
    city: "Ar-Riyod",
    country: "Saudi Arabia",
    ranking: "QS Top 200 / Saudiya #1",
    intake: "Kuzgi semestr 2026",
    defaultDeadline: "2026-08-30T23:59:59.000Z",
    popularPrograms: [
      "Kompyuter fanlari va Sun'iy Intellekt",
      "Biznes va Moliya menejmenti",
      "Dasturiy injiniring",
      "Arab tili va Adabiyoti",
    ],
    scholarshipType: "To'liq Grant (Stipendiya + Yotoqxona + Aviachipta)",
    requirements:
      "Attestat / Diplom (min 85%), Pasport, 2 ta Tavsiyanoma, Arab/Ingliz tili sertifikati",
  },
  {
    id: "kau",
    name: "King Abdulaziz University (KAU)",
    city: "Jidda",
    country: "Saudi Arabia",
    ranking: "QS Top 150 / Arab dunyosi #1",
    intake: "Kuzgi semestr 2026",
    defaultDeadline: "2026-08-25T23:59:59.000Z",
    popularPrograms: [
      "Tibbiyot va Biotexnologiya",
      "Iqtisodiyot va Xalqaro Moliya",
      "Dengiz fanlari",
      "Axborot texnologiyalari",
    ],
    scholarshipType: "To'liq Davlat Granti",
    requirements: "O'rtacha baho 4.5+, Sudlanmaganlik ma'lumotnomasi, Tibbiy ma'lumotnoma",
  },
  {
    id: "kfupm",
    name: "King Fahd University of Petroleum and Minerals (KFUPM)",
    city: "Dahron",
    country: "Saudi Arabia",
    ranking: "QS Top 160 / Dunyo miqyosidagi Muhandislik markazi",
    intake: "Kuzgi semestr 2026",
    defaultDeadline: "2026-09-01T23:59:59.000Z",
    popularPrograms: [
      "Neft-gaz muhandisligi",
      "Kimyo muhandisligi",
      "Kiberxavfsizlik va Ma'lumotlar ilmi",
      "Mexatronika va Robototexnika",
    ],
    scholarshipType: "100% To'liq Ilmiy Grant + Oylik Stipendiya",
    requirements: "IELTS 6.0+ yoki TOEFL, Matematika/Fizika bo'yicha a'lo baholar, GRE/GMAT (magistratura)",
  },
  {
    id: "ium",
    name: "Islamic University of Madinah (Madina Islom Universiteti)",
    city: "Madina Munavvara",
    country: "Saudi Arabia",
    ranking: "Islom ilmlari bo'yicha dunyodagi yetakchi dargoh",
    intake: "Kuz 2026",
    defaultDeadline: "2026-09-15T23:59:59.000Z",
    popularPrograms: [
      "Shariat va Huquqshunoslik",
      "Qur'on va Hadis ilmlari",
      "Arab tili va Diplomiya kursi",
      "Islom Iqtisodiyoti",
    ],
    scholarshipType: "To'liq Xayriya Granti (Haj/Umra imkoniyati + Bepul yotoqxona)",
    requirements: "Yoshi 17-25 oralig'ida, Attestat/Diplom, Masjiddan/Ulamolardan tavsiyanoma",
  },
  {
    id: "uqu",
    name: "Umm Al-Qura University",
    city: "Makka Mukarrama",
    country: "Saudi Arabia",
    ranking: "Makka shahridagi eng qadimiy nufuzli davlat universiteti",
    intake: "Kuz 2026",
    defaultDeadline: "2026-08-20T23:59:59.000Z",
    popularPrograms: [
      "Islom Me'morchiligi va Muhandisligi",
      "Arab tili instituti (Mahad)",
      "Tibbiyot fakulteti",
      "Ta'lim menejmenti",
    ],
    scholarshipType: "To'liq Davlat Granti",
    requirements: "Attestat, Pasport tarjimasi (Apostil/Notarius), 2 dona tavsiyanoma",
  },
  {
    id: "pnu",
    name: "Princess Nourah bint Abdulrahman University (PNU)",
    city: "Ar-Riyod",
    country: "Saudi Arabia",
    ranking: "Dunyodagi eng yirik Ayollar universiteti",
    intake: "Kuz 2026",
    defaultDeadline: "2026-09-10T23:59:59.000Z",
    popularPrograms: [
      "Dizayn va Moda san'ati",
      "Biznes boshqaruvi va Marketing",
      "Kompyuter injiniringi",
      "Farmatsevtika",
    ],
    scholarshipType: "Xalqaro talaba qizlar uchun 100% to'liq grant",
    requirements: "Faqat xotin-qizlar uchun, Attestat 85%+, Mahram ruxsati, Tibbiy ko'rik",
  },
  {
    id: "imamu",
    name: "Imam Mohammad Ibn Saud Islamic University",
    city: "Ar-Riyod",
    country: "Saudi Arabia",
    ranking: "Saudiya Arabistoni nufuzli poytaxt universiteti",
    intake: "Kuz 2026",
    defaultDeadline: "2026-09-05T23:59:59.000Z",
    popularPrograms: [
      "Xalqaro Munosabatlar va Diplomatiya",
      "Media va Jurnalistika",
      "Iqtisodiyot va Islomiy Bank ishi",
      "Arab filologiyasi",
    ],
    scholarshipType: "To'liq grant",
    requirements: "Attestat, Tavsiyanoma, Sudlanmaganlik",
  },
  {
    id: "tu",
    name: "Taibah University",
    city: "Madina Munavvara",
    country: "Saudi Arabia",
    ranking: "Madina shahridagi zamonaviy texnologik universitet",
    intake: "Kuz 2026",
    defaultDeadline: "2026-08-28T23:59:59.000Z",
    popularPrograms: ["Axborot texnologiyalari", "Muhandislik", "Ta'lim va Pedagogika", "Boshqaruv"],
    scholarshipType: "Davlat granti",
    requirements: "Attestat, Pasport, Notarial tarjimalar",
  },
];
