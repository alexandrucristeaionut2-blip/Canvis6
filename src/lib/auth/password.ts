import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  // bcryptjs uses the same bcrypt algorithm; 12 rounds is a good local default.
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}
