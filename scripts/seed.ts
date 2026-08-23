import "dotenv/config";
import bcrypt from "bcryptjs";
// Eslatma: tsx orqali to'g'ridan-to'g'ri ishga tushirilgani uchun (Next.js
// bundlersiz) bu yerda "@/" alias o'rniga nisbiy yo'l ishlatiladi.
import { connectDB } from "../lib/db";
import { User } from "../models/User";
import { Tariff } from "../models/Tariff";

async function seed() {
  await connectDB();

  const adminEmail = "admin@ansoredu.uz";
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("ChangeMe123!", 10);
    await User.create({
      name: "Bosh Administrator",
      email: adminEmail,
      passwordHash,
      role: "admin",
      isActive: true,
    });
    console.log(`✔ Admin yaratildi: ${adminEmail} / ChangeMe123! (birinchi kirishdan keyin o'zgartiring)`);
  } else {
    console.log("— Admin allaqachon mavjud, o'tkazib yuborildi");
  }

  const tariffCount = await Tariff.countDocuments();
  if (tariffCount === 0) {
    await Tariff.insertMany([
      { name: "Standart", price: 5_000_000, description: "Bitta universitetga topshirish" },
      { name: "Premium", price: 9_000_000, description: "3 tagacha universitetga topshirish" },
      { name: "VIP", price: 15_000_000, description: "Cheklanmagan universitet + tezkor xizmat" },
    ]);
    console.log("✔ 3 ta boshlang'ich tarif yaratildi");
  } else {
    console.log("— Tariflar allaqachon mavjud, o'tkazib yuborildi");
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed xatosi:", err);
  process.exit(1);
});
