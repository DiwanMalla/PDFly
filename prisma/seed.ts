import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.admin.upsert({
    where: { email: "malladipin@gmail.com" },
    update: {},
    create: {
      email: "malladipin@gmail.com",
      password: "$2b$10$wTm2nUt4ijndFzH0aPutgujzDyeX2xO7N7AeAQWURu7n996nobEiu", // TempPass123!
    },
  });
  console.log("Admin user seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
