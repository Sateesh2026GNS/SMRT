/** Client-side password policy (mirrors backend/app/utils/password.py). */

export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "upper", label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { id: "lower", label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { id: "digit", label: "One number", test: (p) => /\d/.test(p) },
  { id: "special", label: "One special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function validatePasswordStrength(password) {
  const failed = PASSWORD_RULES.filter((r) => !r.test(password));
  if (failed.length === 0) return null;
  return failed[0].label;
}

export function passwordRuleStatus(password) {
  return PASSWORD_RULES.map((r) => ({
    ...r,
    met: r.test(password),
  }));
}
