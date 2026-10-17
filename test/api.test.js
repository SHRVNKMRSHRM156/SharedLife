// End-to-end API tests against a real Postgres.
// Run: TEST_DATABASE_URL=postgres://... npm test   (the database is wiped)
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

const DB = process.env.TEST_DATABASE_URL;
process.env.DATABASE_URL = DB;
process.env.SESSION_SECRET = 'test-secret-test-secret-test-secret-123';
process.env.ADMIN_EMAILS = 'boss@sharedlife.in';

const { handle } = await import('../lib/api.js');
const db = await import('../lib/db.js');

let server;
let base;

before(async () => {
  if (!DB) throw new Error('Set TEST_DATABASE_URL');
  await db.query('DROP TABLE IF EXISTS bookings, login_failures, users CASCADE').catch(() => {});
  await db._reset();
  server = http.createServer(handle);
  await new Promise((r) => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.close();
  await db._reset();
});

function client() {
  let cookie = '';
  return async (method, path, body, headers = {}) => {
    const r = await fetch(base + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}), ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const set = r.headers.get('set-cookie');
    if (set) cookie = set.split(';')[0].endsWith('=') ? '' : set.split(';')[0];
    const text = await r.text();
    let json;
    try { json = JSON.parse(text); } catch { json = text; }
    return { status: r.status, body: json, headers: r.headers };
  };
}

const future = (days) => new Date(Date.now() + days * 86_400_000 + 5.5 * 3600_000).toISOString().slice(0, 10);
const base_ = { phone: '98765 43210', city: 'Delhi', password: 'longenough1', consent: true };

const seeker = client();
const counsellor = client();
const advocate = client();
const admin = client();
const stranger = client();

test('register validates input', async () => {
  let r = await seeker('POST', '/api/auth/register', { role: 'seeker', name: 'A', email: 'bad', ...base_ });
  assert.equal(r.status, 400);
  r = await seeker('POST', '/api/auth/register', { role: 'seeker', name: 'Asha Rao', email: 'asha@example.com', ...base_, consent: false, relationship: 'about_to_marry' });
  assert.equal(r.status, 400);
  assert.equal(r.body.field, 'consent');
  r = await seeker('POST', '/api/auth/register', { role: 'admin', name: 'Asha Rao', email: 'asha@example.com', ...base_ });
  assert.equal(r.status, 400);
  r = await counsellor('POST', '/api/auth/register', { role: 'advocate', name: 'Adv X', email: 'x@example.com', ...base_, bar_council: 'Delhi' });
  assert.equal(r.status, 400);
  assert.equal(r.body.field, 'enrolment_no');
});

test('three account types register; professionals start pending', async () => {
  let r = await seeker('POST', '/api/auth/register', { role: 'seeker', name: 'Asha Rao', email: 'Asha@Example.com', ...base_, relationship: 'about_to_marry', partner_name: 'Ravi', wedding_date: future(90) });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  assert.equal(r.body.user.status, 'active');
  assert.equal(r.body.user.email, 'asha@example.com');
  assert.equal(r.body.user.password_hash, undefined);

  r = await counsellor('POST', '/api/auth/register', { role: 'counsellor', name: 'Dr Meera', email: 'meera@example.com', ...base_, qualification: 'MA Clinical Psychology', experience_years: '9' });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  assert.equal(r.body.user.status, 'pending');
  assert.equal(r.body.user.profile.experience_years, 9);

  r = await advocate('POST', '/api/auth/register', { role: 'advocate', name: 'Adv Kapoor', email: 'kapoor@example.com', ...base_, enrolment_no: 'D/123/2015', bar_council: 'Bar Council of Delhi', experience_years: 10 });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  assert.equal(r.body.user.status, 'pending');

  r = await admin('POST', '/api/auth/register', { role: 'seeker', name: 'Shravan', email: 'boss@sharedlife.in', ...base_, relationship: 'other' });
  assert.equal(r.body.user.is_admin, true);

  r = await stranger('POST', '/api/auth/register', { role: 'seeker', name: 'Dup', email: 'asha@example.com', ...base_, password: 'different-pass', relationship: 'married' });
  assert.equal(r.status, 400);
  assert.match(r.body.error, /already exists/);
});

test('signing up again with the same email and password logs you in', async () => {
  const c = client();
  let r = await c('POST', '/api/auth/register', { role: 'seeker', name: 'Asha Rao', email: 'asha@example.com', ...base_, relationship: 'about_to_marry' });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal(r.body.user.email, 'asha@example.com');
  r = await c('GET', '/api/auth/me');
  assert.equal(r.body.user.name, 'Asha Rao');
});

test('sign-up saves nothing when the session secret is missing', async () => {
  const saved = process.env.SESSION_SECRET;
  process.env.SESSION_SECRET = 'short';
  try {
    let r = await stranger('POST', '/api/auth/register', { role: 'seeker', name: 'Ghost', email: 'ghost@example.com', ...base_, relationship: 'married' });
    assert.equal(r.status, 503);
    r = await stranger('GET', '/api/health');
    assert.deepEqual(r.body.missing_settings, ['SESSION_SECRET']);
    const { rows } = await db.query("SELECT 1 FROM users WHERE email = 'ghost@example.com'");
    assert.equal(rows.length, 0);
  } finally {
    process.env.SESSION_SECRET = saved;
  }
});

test('login, me, logout and lockout', async () => {
  const c = client();
  let r = await c('GET', '/api/auth/me');
  assert.equal(r.status, 401);
  r = await c('POST', '/api/auth/login', { email: 'asha@example.com', password: 'wrong-password' });
  assert.equal(r.status, 401);
  r = await c('POST', '/api/auth/login', { email: 'ASHA@example.com', password: 'longenough1' });
  assert.equal(r.status, 200);
  r = await c('GET', '/api/auth/me');
  assert.equal(r.body.user.name, 'Asha Rao');
  r = await c('POST', '/api/auth/logout', {});
  r = await c('GET', '/api/auth/me');
  assert.equal(r.status, 401);

  const l = client();
  for (let i = 0; i < 8; i++) await l('POST', '/api/auth/login', { email: 'nobody@example.com', password: 'x' });
  r = await l('POST', '/api/auth/login', { email: 'nobody@example.com', password: 'x' });
  assert.equal(r.status, 429);
});

test('people can change only the details that were optional at sign-up', async () => {
  let r = await seeker('PATCH', '/api/auth/me', { city: 'Gurugram', partner_name: 'Ravi Kumar', wedding_date: future(60), name: 'Someone Else', phone: '9999999999', relationship: 'married', email: 'hacker@example.com', role: 'advocate', status: 'approved' });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal(r.body.user.city, 'Gurugram');
  assert.equal(r.body.user.profile.partner_name, 'Ravi Kumar');
  assert.equal(r.body.user.profile.wedding_date, future(60));
  assert.equal(r.body.user.name, 'Asha Rao');
  assert.equal(r.body.user.phone, '9876543210');
  assert.equal(r.body.user.profile.relationship, 'about_to_marry');
  assert.equal(r.body.user.email, 'asha@example.com');
  assert.equal(r.body.user.role, 'seeker');
  assert.equal(r.body.user.status, 'active');

  r = await seeker('PATCH', '/api/auth/me', { wedding_date: 'soon' });
  assert.equal(r.status, 400);
  assert.equal(r.body.field, 'wedding_date');

  r = await counsellor('PATCH', '/api/auth/me', { languages: 'Hindi, English', city: 'Mumbai', qualification: 'PhD', experience_years: 30 });
  assert.equal(r.body.user.profile.languages, 'Hindi, English');
  assert.equal(r.body.user.profile.qualification, 'MA Clinical Psychology');
  assert.equal(r.body.user.profile.experience_years, 9);
  assert.equal(r.body.user.city, 'Delhi');
  assert.equal(r.body.user.status, 'pending');

  r = await stranger('PATCH', '/api/auth/me', { city: 'X' });
  assert.equal(r.status, 401);
  r = await seeker('PATCH', '/api/auth/me', { city: 'X' }, { Origin: 'https://evil.example' });
  assert.equal(r.status, 403);
});

test('a forged or foreign session is rejected', async () => {
  const r = await stranger('GET', '/api/auth/me', undefined, { Cookie: 'sl_session=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.bad' });
  assert.equal(r.status, 401);
});

test('cross-site POST is blocked', async () => {
  const r = await seeker('POST', '/api/bookings', { service: 'consultation' }, { Origin: 'https://evil.example' });
  assert.equal(r.status, 403);
});

let bookingId;

test('seekers book; others cannot', async () => {
  let r = await seeker('POST', '/api/bookings', { service: 'prenup', mode: 'online', preferred_date: future(0), preferred_slot: 'evening' });
  assert.equal(r.status, 400);
  assert.equal(r.body.field, 'preferred_date');
  r = await seeker('POST', '/api/bookings', { service: 'prenup', mode: 'online', preferred_date: future(5), preferred_slot: 'evening', partner_name: 'Ravi', notes: 'Wedding in Feb' });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  bookingId = r.body.booking.id;
  assert.equal(r.body.booking.status, 'requested');
  assert.equal(r.body.booking.admin_note, undefined);

  r = await counsellor('POST', '/api/bookings', { service: 'prenup', mode: 'online', preferred_date: future(5), preferred_slot: 'evening' });
  assert.equal(r.status, 403);
  r = await stranger('POST', '/api/bookings', { service: 'prenup', mode: 'online', preferred_date: future(5), preferred_slot: 'evening' });
  assert.equal(r.status, 401);

  r = await seeker('GET', '/api/bookings');
  assert.equal(r.body.bookings.length, 1);
});

test('admin sees everything, approves professionals and manages bookings', async () => {
  let r = await seeker('GET', '/api/admin/summary');
  assert.equal(r.status, 403);

  r = await admin('GET', '/api/admin/summary');
  assert.equal(r.status, 200);
  assert.equal(r.body.last7days.new_users, 4);

  r = await admin('GET', '/api/admin/users?role=counsellor&status=pending');
  assert.equal(r.body.users.length, 1);
  const counsellorId = r.body.users[0].id;

  // cannot assign a pending professional
  r = await admin('PATCH', `/api/bookings/${bookingId}`, { assigned_to: counsellorId });
  assert.equal(r.status, 400);

  r = await admin('PATCH', `/api/admin/users/${counsellorId}`, { status: 'active' });
  assert.equal(r.status, 400);
  r = await admin('PATCH', `/api/admin/users/${counsellorId}`, { status: 'approved' });
  assert.equal(r.body.user.status, 'approved');

  r = await admin('PATCH', `/api/bookings/${bookingId}`, { assigned_to: counsellorId, status: 'confirmed', scheduled_at: `${future(5)}T18:30:00+05:30`, admin_note: 'Called couple' });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal(r.body.booking.status, 'confirmed');
  assert.equal(r.body.booking.assigned_name, 'Dr Meera');

  r = await admin('GET', '/api/bookings');
  assert.equal(r.body.bookings.length, 1);
  assert.equal(r.body.bookings[0].user_email, 'asha@example.com');
});

test('professional sees assigned bookings and completes them', async () => {
  let r = await counsellor('GET', '/api/bookings');
  assert.equal(r.body.bookings.length, 1);
  assert.equal(r.body.bookings[0].user_phone, '9876543210');
  assert.equal(r.body.bookings[0].admin_note, undefined);

  r = await advocate('GET', '/api/bookings');
  assert.equal(r.body.bookings.length, 0);
  r = await advocate('PATCH', `/api/bookings/${bookingId}`, { status: 'completed' });
  assert.equal(r.status, 404);

  r = await counsellor('PATCH', `/api/bookings/${bookingId}`, { status: 'cancelled' });
  assert.equal(r.status, 403);
  r = await counsellor('PATCH', `/api/bookings/${bookingId}`, { status: 'completed' });
  assert.equal(r.body.booking.status, 'completed');

  r = await seeker('PATCH', `/api/bookings/${bookingId}`, { status: 'cancelled' });
  assert.equal(r.status, 409);
});

test('seekers cannot touch other bookings, and can cancel their own', async () => {
  const other = client();
  await other('POST', '/api/auth/register', { role: 'seeker', name: 'Neha', email: 'neha@example.com', ...base_, relationship: 'married' });
  let r = await other('PATCH', `/api/bookings/${bookingId}`, { status: 'cancelled' });
  assert.equal(r.status, 404);
  r = await other('POST', '/api/bookings', { service: 'marital', mode: 'in_person', preferred_date: future(3), preferred_slot: 'morning' });
  r = await other('PATCH', `/api/bookings/${r.body.booking.id}`, { status: 'cancelled' });
  assert.equal(r.body.booking.status, 'cancelled');
});

test('CSV export is admin-only and escapes formulas', async () => {
  const evil = client();
  await evil('POST', '/api/auth/register', { role: 'seeker', name: '=HYPERLINK("x")', email: 'evil@example.com', ...base_, relationship: 'married' });
  let r = await seeker('GET', '/api/admin/export?type=users');
  assert.equal(r.status, 403);
  r = await admin('GET', '/api/admin/export?type=users');
  assert.equal(r.status, 200);
  assert.match(r.headers.get('content-type'), /text\/csv/);
  assert.match(r.body, /profile_enrolment_no/);
  assert.match(r.body, /"'=HYPERLINK\(""x""\)"/);
  r = await admin('GET', '/api/admin/export?type=bookings');
  assert.match(r.body, /asha@example.com/);
});

test('suspended users are logged out', async () => {
  let r = await admin('GET', '/api/admin/users?role=seeker');
  const neha = r.body.users.find((u) => u.email === 'neha@example.com');
  r = await admin('PATCH', `/api/admin/users/${neha.id}`, { status: 'suspended' });
  assert.equal(r.status, 200);
  const c = client();
  r = await c('POST', '/api/auth/login', { email: 'neha@example.com', password: 'longenough1' });
  assert.equal(r.status, 403);
});

test('unknown routes', async () => {
  let r = await stranger('GET', '/api/nope');
  assert.equal(r.status, 404);
  r = await stranger('DELETE', '/api/bookings');
  assert.equal(r.status, 405);
  r = await stranger('GET', '/api/health');
  assert.equal(r.status, 200);
});
