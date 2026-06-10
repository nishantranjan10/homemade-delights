// Mask contact details so the UI can confirm where a code was sent without
// exposing the full address/number.

export function maskEmail(email) {
  if (!email || !email.includes('@')) return '';
  const [user, domain] = email.split('@');
  const head = user.slice(0, 2);
  return `${head}${'*'.repeat(Math.max(1, user.length - 2))}@${domain}`;
}

export function maskPhone(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\s+/g, '');
  return digits.length <= 4
    ? digits
    : `${digits.slice(0, 3)}${'*'.repeat(digits.length - 5)}${digits.slice(-2)}`;
}
