const tz = () => process.env.CLINIC_TIMEZONE || 'Asia/Manila';

// Returns today's date in the clinic's timezone as YYYY-MM-DD.
export function todayInClinic() {
  return new Date().toLocaleDateString('en-CA', { timeZone: tz() });
}

export function addDays(isoDate, days) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

export function isValidISODate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

// 0 = Sunday. Using UTC avoids server-timezone surprises for a plain calendar date.
export function weekdayOf(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

// "08:00" + 60 -> "09:00"
export function addMinutes(hhmm, mins) {
  const [h, m] = hhmm.split(':').map(Number);
  const t = h * 60 + m + mins;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

// Age in whole years on a given date (both YYYY-MM-DD).
export function ageOn(dob, onDate) {
  let age = Number(onDate.slice(0, 4)) - Number(dob.slice(0, 4));
  if (onDate.slice(5) < dob.slice(5)) age -= 1;
  return age;
}
