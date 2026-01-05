export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
};

export function passwordStrength(password: string): PasswordStrength {
  const p = password ?? "";
  let score = 0;

  if (p.length >= 8) score += 1;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score += 1;
  if (/\d/.test(p)) score += 1;
  if (/[^A-Za-z0-9]/.test(p)) score += 1;

  const clamped = Math.min(4, Math.max(0, score)) as 0 | 1 | 2 | 3 | 4;
  const label = ["Too weak", "Weak", "Ok", "Strong", "Very strong"][clamped];
  return { score: clamped, label };
}
