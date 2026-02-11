import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { normalizeEmail } from "@/lib/auth/normalize";

async function main() {
  const email = normalizeEmail("test.user+login@canvist.local");
  const password = "CorrectHorseBatteryStaple";
  const wrongPassword = "WrongHorseBatteryStaple";

  await prisma.user.deleteMany({ where: { email } });

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: {
      email,
      name: "Test User",
      passwordHash,
    },
  });

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, passwordHash: true },
  });

  const hasPasswordHash = Boolean(user?.passwordHash);
  const ok = user?.passwordHash ? await verifyPassword(password, user.passwordHash) : false;
  const bad = user?.passwordHash ? await verifyPassword(wrongPassword, user.passwordHash) : true;

  if (!user?.id || !hasPasswordHash || !ok || bad) {
    console.error("Credentials test failed", {
      userFound: Boolean(user?.id),
      hasPasswordHash,
      correctPasswordOk: ok,
      wrongPasswordOk: bad,
    });
    process.exitCode = 1;
    return;
  }

  console.log("Credentials test passed", {
    userFound: true,
    hasPasswordHash,
    correctPasswordOk: ok,
    wrongPasswordOk: bad,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
