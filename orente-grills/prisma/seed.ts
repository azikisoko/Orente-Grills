import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("changeme123", 10);

  await prisma.user.upsert({
    where: { phone: "09139932456" },
    update: {},
    create: {
      name: "Super Admin",
      phone: "09139932456",
      passwordHash,
      role: "ADMIN",
    },
  });

  await prisma.storeSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  console.log("Seed complete. Admin login: 08000000000 / changeme123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
