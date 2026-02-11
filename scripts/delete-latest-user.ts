import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, createdAt: true },
  });

  if (!user) {
    console.log("No users found");
    return;
  }

  await prisma.user.delete({ where: { id: user.id } });
  console.log("Deleted user", { id: user.id, email: user.email, createdAt: user.createdAt });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
