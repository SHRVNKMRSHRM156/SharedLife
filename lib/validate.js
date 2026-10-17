// Small hand-written validators. Each returns { value } or { error }.

export class InputError extends Error {
  constructor(message, field) {
    super(message);
    this.field = field;
  }
}

const str = (v) => (typeof v === 'string' ? v.trim() : '');

export function text(body, field, label, { required = true, max = 200, min = 0 } = {}) {
  const v = str(body[field]);
  if (required && !v) throw new InputError(`${label} is required.`, field);
  if (v.length > max) throw new InputError(`${label} must be ${max} characters or fewer.`, field);
  if (v && v.length < min) throw new InputError(`${label} must be at least ${min} characters.`, field);
  return v;
}

export function email(body, field = 'email') {
  const v = str(body[field]).toLowerCase();
  if (!v) throw new InputError('Email is required.', field);
  if (v.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) throw new InputError('Enter a valid email address.', field);
  return v;
}

export function phone(body, field = 'phone') {
  const raw = str(body[field]);
  const digits = raw.replace(/[\s\-()]/g, '');
  if (!/^\+?\d{10,15}$/.test(digits)) throw new InputError('Enter a valid phone number with 10 to 15 digits.', field);
  return digits;
}

export function password(body, field = 'password') {
  const v = typeof body[field] === 'string' ? body[field] : '';
  if (v.length < 8) throw new InputError('Password must be at least 8 characters.', field);
  if (v.length > 200) throw new InputError('Password is too long.', field);
  return v;
}

export function oneOf(body, field, label, options, { required = true } = {}) {
  const v = str(body[field]);
  if (!v && !required) return '';
  if (!options.includes(v)) throw new InputError(`Choose a valid ${label.toLowerCase()}.`, field);
  return v;
}

export function int(body, field, label, { min = 0, max = 80, required = false } = {}) {
  const raw = body[field];
  if ((raw === undefined || raw === null || raw === '') && !required) return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min || n > max) throw new InputError(`${label} must be a whole number between ${min} and ${max}.`, field);
  return n;
}

// A YYYY-MM-DD date. Options are day offsets from today (India time).
export function date(body, field, label, { required = true, minDays, maxDays } = {}) {
  const v = str(body[field]);
  if (!v) {
    if (required) throw new InputError(`${label} is required.`, field);
    return null;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(Date.parse(`${v}T00:00:00Z`))) throw new InputError(`${label} must be a valid date.`, field);
  const today = todayInIndia();
  const days = Math.round((Date.parse(`${v}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
  if (minDays !== undefined && days < minDays) throw new InputError(`${label} is too early.`, field);
  if (maxDays !== undefined && days > maxDays) throw new InputError(`${label} is too far ahead.`, field);
  return v;
}

export function todayInIndia() {
  return new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10);
}
