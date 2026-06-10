// Helpers for working with Singapore-local dates as YYYY-MM-DD strings.
const SG_TZ = 'Asia/Singapore';

export function sgToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SG_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function sgDayName(dateStr) {
  // dateStr: YYYY-MM-DD -> weekday name. Parse as UTC noon to avoid TZ slips.
  const d = dateStr ? new Date(`${dateStr}T12:00:00Z`) : new Date();
  return new Intl.DateTimeFormat('en-US', {
    timeZone: SG_TZ,
    weekday: 'long',
  }).format(d);
}
