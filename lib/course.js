import crypto from 'node:crypto';
import { MODULES, LESSONS } from '../api/_course/index.js';

export const COURSE_KEY = 'sharedlife';
export const COURSE_TITLE = 'The SharedLife Course';
const DEFAULT_PRICE_INR = 499; // COURSE_PRICE_INR overrides it

export function priceInr() {
  const n = Number(process.env.COURSE_PRICE_INR);
  return Number.isInteger(n) && n > 0 ? n : DEFAULT_PRICE_INR;
}

// Price after a percentage coupon, in paise. A 99% coupon on Rs 499 leaves Rs 4.99.
export function pricePaise(percentOff = 0) {
  return Math.round(priceInr() * (100 - percentOff));
}

export const normaliseCoupon = (code) => (typeof code === 'string' ? code.trim().toUpperCase() : '');
export const COUPON_RE = /^[A-Z0-9]{3,30}$/;

export const lessonById = (id) => LESSONS.find((l) => l.id === id);

// Titles and lengths only; safe to show anyone.
export function outline() {
  return {
    title: COURSE_TITLE,
    price_inr: priceInr(),
    lesson_count: LESSONS.length,
    minutes: LESSONS.reduce((s, l) => s + l.minutes, 0),
    modules: MODULES.map((m) => ({
      ...m,
      lessons: LESSONS.filter((l) => l.module === m.n).map((l) => ({ id: l.id, title: l.title, minutes: l.minutes, preview: Boolean(l.preview), draft: Boolean(l.draft) })),
    })),
  };
}

// Only embed players from these hosts.
const VIDEO = /^https:\/\/(www\.youtube-nocookie\.com\/embed\/|player\.vimeo\.com\/video\/)[\w\-?=&.]+$/;

export function lessonBody(l) {
  const i = LESSONS.indexOf(l);
  return {
    id: l.id, module: l.module, title: l.title, minutes: l.minutes, preview: Boolean(l.preview), draft: Boolean(l.draft),
    summary: l.summary, blocks: l.blocks,
    video: l.video && VIDEO.test(l.video) ? l.video : null,
    prev: i > 0 ? LESSONS[i - 1].id : null,
    next: i < LESSONS.length - 1 ? LESSONS[i + 1].id : null,
  };
}

// ---------- Razorpay ----------
// Payments switch on when both keys are set in Vercel. Without them, enrolments wait as "pending payment"
// and an admin marks them paid from the dashboard (for UPI or bank transfers).

// Trimmed, because a value pasted into Vercel with a stray space or line break still looks right on screen.
const keyId = () => (process.env.RAZORPAY_KEY_ID || '').trim();
const keySecret = () => (process.env.RAZORPAY_KEY_SECRET || '').trim();

// Names of Razorpay settings that are missing or malformed; empty when online payment is ready. Never reveals values.
export function razorpayProblems() {
  const problems = [];
  if (!/^rzp_(live|test)_\w+$/.test(keyId())) problems.push(keyId() ? 'RAZORPAY_KEY_ID (should start with rzp_live_ or rzp_test_)' : 'RAZORPAY_KEY_ID');
  if (!keySecret()) problems.push('RAZORPAY_KEY_SECRET');
  return problems;
}

export const razorpayEnabled = () => razorpayProblems().length === 0;
export const razorpayMode = () => (razorpayEnabled() ? (keyId().startsWith('rzp_live_') ? 'live' : 'test') : null);
export const razorpayKeyId = keyId;

async function razorpay(method, path, body) {
  const base = process.env.RAZORPAY_API_BASE || 'https://api.razorpay.com/v1';
  const auth = Buffer.from(`${keyId()}:${keySecret()}`).toString('base64');
  const r = await fetch(base + path, {
    method,
    headers: { Authorization: `Basic ${auth}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Razorpay ${method} ${path} failed: ${r.status} ${JSON.stringify(data).slice(0, 300)}`);
  return data;
}

export function createOrder(amountPaise, receipt, notes) {
  return razorpay('POST', '/orders', { amount: amountPaise, currency: 'INR', receipt, notes });
}

export async function orderIsPaid(orderId) {
  const order = await razorpay('GET', `/orders/${encodeURIComponent(orderId)}`);
  if (order.status !== 'paid') return null;
  const payments = await razorpay('GET', `/orders/${encodeURIComponent(orderId)}/payments`);
  const captured = (payments.items || []).find((p) => p.status === 'captured');
  return captured ? captured.id : 'paid';
}

// Checkout's signature is HMAC-SHA256 of "order_id|payment_id" with the key secret.
export function signatureValid(orderId, paymentId, signature) {
  if (typeof signature !== 'string' || !/^[0-9a-f]{64}$/.test(signature)) return false;
  const expected = crypto.createHmac('sha256', keySecret()).update(`${orderId}|${paymentId}`).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
