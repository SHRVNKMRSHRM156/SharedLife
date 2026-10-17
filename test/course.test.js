// Course enrolment, payments and lessons against a real Postgres and a fake Razorpay.
// Run: TEST_DATABASE_URL=postgres://... npm test   (the database is wiped)
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import crypto from 'node:crypto';

const DB = process.env.TEST_DATABASE_URL;
process.env.DATABASE_URL = DB;
process.env.SESSION_SECRET = 'test-secret-test-secret-test-secret-123';
process.env.ADMIN_EMAILS = 'boss@sharedlife.in';
delete process.env.RAZORPAY_KEY_ID;
delete process.env.RAZORPAY_KEY_SECRET;
delete process.env.COURSE_PRICE_INR;

const { handle } = await import('../lib/api.js');
const db = await import('../lib/db.js');

let server;
let base;
let rzp;
const orders = new Map();
let orderSeq = 0;

before(async () => {
  if (!DB) throw new Error('Set TEST_DATABASE_URL');
  await db.query('DROP TABLE IF EXISTS lesson_progress, course_coupons, course_enrolments, bookings, login_failures, users CASCADE').catch(() => {});
  await db._reset();
  server = http.createServer(handle);
  await new Promise((r) => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;

  // Just enough of the Razorpay Orders API.
  rzp = http.createServer(async (req, res) => {
    const auth = Buffer.from((req.headers.authorization || '').replace('Basic ', ''), 'base64').toString();
    res.setHeader('Content-Type', 'application/json');
    if (auth !== 'rzp_test_key:rzp_test_secret') { res.statusCode = 401; return res.end('{}'); }
    let body = '';
    for await (const c of req) body += c;
    let m;
    if (req.method === 'POST' && req.url === '/orders') {
      const o = { id: `order_${++orderSeq}`, status: 'created', ...JSON.parse(body) };
      orders.set(o.id, o);
      return res.end(JSON.stringify(o));
    }
    if ((m = /^\/orders\/([\w]+)(\/payments)?$/.exec(req.url)) && orders.has(m[1])) {
      const o = orders.get(m[1]);
      return res.end(JSON.stringify(m[2] ? { items: o.status === 'paid' ? [{ id: `pay_for_${o.id}`, status: 'captured' }] : [] } : o));
    }
    res.statusCode = 404;
    res.end('{}');
  });
  await new Promise((r) => rzp.listen(0, r));
});

after(async () => {
  server.close();
  rzp.close();
  await db._reset();
});

function client() {
  let cookie = '';
  return async (method, path, body) => {
    const r = await fetch(base + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const set = r.headers.get('set-cookie');
    if (set) cookie = set.split(';')[0].endsWith('=') ? '' : set.split(';')[0];
    const text = await r.text();
    let json;
    try { json = JSON.parse(text); } catch { json = text; }
    return { status: r.status, body: json };
  };
}

const base_ = { phone: '98765 43210', city: 'Delhi', password: 'longenough1', consent: true };
const asha = client();
const ravi = client();
const pro = client();
const admin = client();
const stranger = client();

function useRazorpay(on) {
  if (on) {
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
    process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret';
    process.env.RAZORPAY_API_BASE = `http://127.0.0.1:${rzp.address().port}`;
  } else {
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;
  }
}
const sign = (orderId, paymentId) => crypto.createHmac('sha256', 'rzp_test_secret').update(`${orderId}|${paymentId}`).digest('hex');

test('setup accounts', async () => {
  for (const [c, name, email, role, extra] of [
    [asha, 'Asha Rao', 'asha@example.com', 'seeker', { relationship: 'about_to_marry' }],
    [ravi, 'Ravi Kumar', 'ravi@example.com', 'seeker', { relationship: 'married' }],
    [pro, 'Dr Meera', 'meera@example.com', 'counsellor', { qualification: 'MA', experience_years: 5 }],
    [admin, 'Boss', 'boss@sharedlife.in', 'seeker', { relationship: 'other' }],
  ]) {
    const r = await c('POST', '/api/auth/register', { role, name, email, ...base_, ...extra });
    assert.equal(r.status, 201, JSON.stringify(r.body));
  }
});

test('anyone sees the outline and the free preview, but not paid lessons', async () => {
  let r = await stranger('GET', '/api/course');
  assert.equal(r.status, 200);
  assert.equal(r.body.course.modules.length, 8);
  assert.equal(r.body.course.lesson_count, 32);
  assert.equal(r.body.course.price_inr, 4999);
  assert.equal(r.body.payments, 'manual');
  assert.equal(r.body.access, false);
  assert.equal(r.body.course.modules[0].lessons[0].summary, undefined, 'outline must not leak lesson text');

  r = await stranger('GET', '/api/course/lessons/1');
  assert.equal(r.status, 200);
  assert.ok(r.body.lesson.blocks.length > 5);
  assert.ok(r.body.lesson.title.en && r.body.lesson.title.hi, 'lesson 1 is in English and Hindi');
  assert.ok(r.body.lesson.blocks.some((b) => b.type === 'story' && b.en && b.hi));
  assert.equal(r.body.lesson.next, 2);

  r = await stranger('GET', '/api/course/lessons/2');
  assert.equal(r.status, 401);
  r = await asha('GET', '/api/course/lessons/2');
  assert.equal(r.status, 402);
  r = await asha('GET', '/api/course/lessons/999');
  assert.equal(r.status, 404);
  r = await asha('PUT', '/api/course/progress/1', { done: true });
  assert.equal(r.status, 402);
});

test('without Razorpay keys, enrolment waits for payment and an admin marks it paid', async () => {
  let r = await pro('POST', '/api/course/enrol', {});
  assert.equal(r.status, 403);
  r = await stranger('POST', '/api/course/enrol', {});
  assert.equal(r.status, 401);

  r = await asha('POST', '/api/course/enrol', {});
  assert.equal(r.status, 201, JSON.stringify(r.body));
  assert.equal(r.body.payment, 'manual');
  assert.equal(r.body.enrolment.status, 'pending_payment');
  assert.equal(r.body.enrolment.amount_inr, 4999);
  r = await asha('POST', '/api/course/enrol', {});
  assert.equal(r.body.enrolment.status, 'pending_payment');

  r = await asha('GET', '/api/course/lessons/2');
  assert.equal(r.status, 402);

  r = await asha('GET', '/api/admin/enrolments');
  assert.equal(r.status, 403);
  r = await admin('GET', '/api/admin/enrolments');
  assert.equal(r.body.enrolments.length, 1);
  const id = r.body.enrolments[0].id;
  assert.equal(r.body.enrolments[0].user_email, 'asha@example.com');

  r = await asha('PATCH', `/api/admin/enrolments/${id}`, { status: 'active' });
  assert.equal(r.status, 403);
  r = await admin('PATCH', `/api/admin/enrolments/${id}`, { status: 'active' });
  assert.equal(r.body.enrolment.status, 'active');
  assert.equal(r.body.enrolment.method, 'manual');

  r = await asha('GET', '/api/course/lessons/2');
  assert.equal(r.status, 200);
  r = await asha('GET', '/api/course');
  assert.equal(r.body.access, true);
  assert.equal(r.body.can_enrol, false);
});

test('progress is saved per learner', async () => {
  let r = await asha('PUT', '/api/course/progress/1', { done: true });
  assert.deepEqual(r.body.progress, [1]);
  r = await asha('PUT', '/api/course/progress/2', { done: true });
  r = await asha('PUT', '/api/course/progress/1', { done: false });
  assert.deepEqual(r.body.progress, [2]);
  r = await asha('PUT', '/api/course/progress/77', { done: true });
  assert.equal(r.status, 404);
  r = await admin('GET', '/api/admin/enrolments');
  assert.equal(r.body.enrolments[0].lessons_done, 1);
});

test('admins can open every lesson without enrolling', async () => {
  const r = await admin('GET', '/api/course/lessons/32');
  assert.equal(r.status, 200);
  assert.equal(r.body.lesson.next, null);
});

test('with Razorpay keys, a verified payment opens the course', async () => {
  useRazorpay(true);
  let r = await ravi('POST', '/api/course/enrol', {});
  assert.equal(r.status, 201, JSON.stringify(r.body));
  assert.equal(r.body.payment, 'razorpay');
  const { order_id: orderId, amount, key } = r.body.checkout;
  assert.equal(amount, 499900);
  assert.equal(key, 'rzp_test_key');
  assert.equal(orders.get(orderId).amount, 499900);

  r = await ravi('POST', '/api/course/verify', { razorpay_order_id: orderId, razorpay_payment_id: 'pay_1', razorpay_signature: sign(orderId, 'pay_2') });
  assert.equal(r.status, 400);
  r = await ravi('POST', '/api/course/verify', { razorpay_order_id: 'order_other', razorpay_payment_id: 'pay_1', razorpay_signature: sign('order_other', 'pay_1') });
  assert.equal(r.status, 400);
  r = await ravi('GET', '/api/course/lessons/3');
  assert.equal(r.status, 402);

  r = await ravi('POST', '/api/course/verify', { razorpay_order_id: orderId, razorpay_payment_id: 'pay_1', razorpay_signature: sign(orderId, 'pay_1') });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal(r.body.enrolment.status, 'active');
  assert.equal(r.body.enrolment.method, 'razorpay');
  r = await ravi('GET', '/api/course/lessons/3');
  assert.equal(r.status, 200);
  useRazorpay(false);
});

test('a payment that finished after the browser closed is picked up from Razorpay', async () => {
  useRazorpay(true);
  const c = client();
  await c('POST', '/api/auth/register', { role: 'seeker', name: 'Neha', email: 'neha@example.com', ...base_, relationship: 'married' });
  let r = await c('POST', '/api/course/enrol', {});
  const orderId = r.body.checkout.order_id;
  r = await c('GET', '/api/course');
  assert.equal(r.body.access, false);
  orders.get(orderId).status = 'paid';
  r = await c('GET', '/api/course');
  assert.equal(r.body.access, true);
  assert.equal(r.body.enrolment.method, 'razorpay');
  useRazorpay(false);
});

test('admin can grant the course and cancel access; export and summary include enrolments', async () => {
  const c = client();
  await c('POST', '/api/auth/register', { role: 'seeker', name: 'Guest', email: 'guest@example.com', ...base_, relationship: 'other' });
  let r = await admin('POST', '/api/admin/enrolments', { email: 'nobody@example.com', method: 'complimentary' });
  assert.equal(r.status, 400);
  r = await admin('POST', '/api/admin/enrolments', { email: 'meera@example.com', method: 'complimentary' });
  assert.equal(r.status, 400);
  r = await admin('POST', '/api/admin/enrolments', { email: 'guest@example.com', method: 'complimentary' });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal(r.body.enrolment.status, 'active');
  assert.equal(r.body.enrolment.amount_inr, 0);
  const id = r.body.enrolment.id;
  r = await c('GET', '/api/course/lessons/5');
  assert.equal(r.status, 200);

  r = await admin('PATCH', `/api/admin/enrolments/${id}`, { status: 'cancelled' });
  assert.equal(r.body.enrolment.status, 'cancelled');
  r = await c('GET', '/api/course/lessons/5');
  assert.equal(r.status, 402);

  r = await admin('GET', '/api/admin/summary');
  const active = r.body.enrolments.find((e) => e.status === 'active');
  assert.equal(active.n, 3);
  r = await admin('GET', '/api/admin/export?type=enrolments');
  assert.match(r.body, /ravi@example.com/);
  assert.match(r.body, /lessons_done/);
});

test('health names the Razorpay settings that are missing, without their values', async () => {
  process.env.RAZORPAY_KEY_ID = ' rzp_live_abc123\n';
  delete process.env.RAZORPAY_KEY_SECRET;
  let r = await stranger('GET', '/api/health');
  assert.equal(r.body.course_payments, 'manual');
  assert.deepEqual(r.body.razorpay_missing, ['RAZORPAY_KEY_SECRET']);
  process.env.RAZORPAY_KEY_SECRET = 'shh-secret ';
  r = await stranger('GET', '/api/health');
  assert.equal(r.body.course_payments, 'razorpay');
  assert.equal(r.body.razorpay_mode, 'live');
  assert.ok(!JSON.stringify(r.body).includes('shh-secret'));
  process.env.RAZORPAY_KEY_ID = 'abc123';
  r = await stranger('GET', '/api/health');
  assert.match(r.body.razorpay_missing[0], /should start with rzp_live_/);
  useRazorpay(false);
});

test('price can be set in Vercel', async () => {
  process.env.COURSE_PRICE_INR = '4999';
  const r = await stranger('GET', '/api/course');
  assert.equal(r.body.course.price_inr, 4999);
  delete process.env.COURSE_PRICE_INR;
});

test('EARLYBIRD99 takes 99% off, and admins manage coupons', async () => {
  useRazorpay(true);
  const c = client();
  await c('POST', '/api/auth/register', { role: 'seeker', name: 'Pooja', email: 'pooja@example.com', ...base_, relationship: 'about_to_marry' });
  let r = await c('GET', '/api/course/coupon?code=earlybird99');
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.deepEqual(r.body.coupon, { code: 'EARLYBIRD99', percent_off: 99, price_inr: 4999, amount_inr: 49.99 });
  r = await c('GET', '/api/course/coupon?code=NOPE');
  assert.equal(r.status, 400);
  assert.equal(r.body.field, 'coupon');
  r = await c('POST', '/api/course/enrol', { coupon: 'NOPE' });
  assert.equal(r.status, 400);

  r = await c('POST', '/api/course/enrol', { coupon: ' earlybird99 ' });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  assert.equal(r.body.checkout.amount, 4999);
  assert.equal(orders.get(r.body.checkout.order_id).amount, 4999);
  assert.equal(r.body.enrolment.coupon, 'EARLYBIRD99');
  // Changing your mind about the coupon reprices the pending enrolment.
  r = await c('POST', '/api/course/enrol', {});
  assert.equal(r.body.checkout.amount, 499900);
  assert.equal(r.body.enrolment.coupon, null);

  r = await c('GET', '/api/admin/coupons');
  assert.equal(r.status, 403);
  r = await admin('POST', '/api/admin/coupons', { code: 'bad code', percent_off: 10 });
  assert.equal(r.body.field, 'code');
  r = await admin('POST', '/api/admin/coupons', { code: 'GIFT', percent_off: 100 });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  r = await admin('POST', '/api/admin/coupons', { code: 'EARLYBIRD99', percent_off: 99, active: false });
  assert.equal(r.body.coupon.active, false);
  r = await c('POST', '/api/course/enrol', { coupon: 'EARLYBIRD99' });
  assert.equal(r.status, 400, 'a switched-off coupon is refused');

  r = await c('POST', '/api/course/enrol', { coupon: 'GIFT' });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal(r.body.enrolment.status, 'active');
  assert.equal(r.body.enrolment.method, 'complimentary');
  r = await admin('GET', '/api/admin/coupons');
  assert.equal(r.body.coupons.find((x) => x.code === 'GIFT').used, 1);
  await admin('POST', '/api/admin/coupons', { code: 'EARLYBIRD99', percent_off: 99, active: true });
  useRazorpay(false);
});
