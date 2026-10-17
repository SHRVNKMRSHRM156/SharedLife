import { query } from './db.js';
import {
  configProblems, currentUser, isAdmin, publicUser, hashPassword, checkPassword,
  createSessionCookie, clearSessionCookie, tooManyFailures, recordFailure, clearFailures,
} from './auth.js';
import * as v from './validate.js';
import * as course from './course.js';

export const ROLES = ['seeker', 'counsellor', 'advocate'];
export const SERVICES = ['consultation', 'premarital', 'marital', 'prenup', 'course', 'workshop'];
const BOOKING_STATUSES = ['requested', 'confirmed', 'completed', 'cancelled'];
const USER_STATUSES = ['active', 'pending', 'approved', 'rejected', 'suspended'];

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// ---------- plumbing ----------

function send(res, status, data, headers = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  for (const [k, val] of Object.entries(headers)) res.setHeader(k, val);
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  if (req.body !== undefined) {
    if (typeof req.body === 'string') return req.body ? JSON.parse(req.body) : {};
    if (Buffer.isBuffer(req.body)) return req.body.length ? JSON.parse(req.body.toString('utf8')) : {};
    return req.body || {};
  }
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > 50_000) throw new HttpError(413, 'Request is too large.');
    chunks.push(c);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

const isSecure = (req) => (req.headers['x-forwarded-proto'] || '').includes('https') || process.env.NODE_ENV === 'production';

// Reject state-changing requests that come from another website.
function checkOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  try {
    if (new URL(origin).host !== host) throw new HttpError(403, 'Request blocked.');
  } catch (e) {
    if (e instanceof HttpError) throw e;
    throw new HttpError(403, 'Request blocked.');
  }
}

async function requireUser(req) {
  const user = await currentUser(req);
  if (!user) throw new HttpError(401, 'Please log in.');
  return user;
}

async function requireAdmin(req) {
  const user = await requireUser(req);
  if (!isAdmin(user)) throw new HttpError(403, 'Admins only.');
  return user;
}

// ---------- auth ----------

function professionalProfile(role, body) {
  if (role === 'counsellor') {
    return {
      qualification: v.text(body, 'qualification', 'Qualification', { max: 200 }),
      experience_years: v.int(body, 'experience_years', 'Years of experience', { required: true }),
      registration_no: v.text(body, 'registration_no', 'Registration number', { required: false, max: 80 }),
      specialisation: v.text(body, 'specialisation', 'Areas of focus', { required: false, max: 300 }),
      languages: v.text(body, 'languages', 'Languages', { required: false, max: 120 }),
    };
  }
  if (role === 'advocate') {
    return {
      enrolment_no: v.text(body, 'enrolment_no', 'Bar Council enrolment number', { max: 80 }),
      bar_council: v.text(body, 'bar_council', 'State Bar Council', { max: 120 }),
      experience_years: v.int(body, 'experience_years', 'Years of practice', { required: true }),
      practice_areas: v.text(body, 'practice_areas', 'Practice areas', { required: false, max: 300 }),
      languages: v.text(body, 'languages', 'Languages', { required: false, max: 120 }),
    };
  }
  return {
    relationship: v.oneOf(body, 'relationship', 'Relationship stage', ['about_to_marry', 'married', 'other']),
    partner_name: v.text(body, 'partner_name', "Partner's name", { required: false, max: 120 }),
    wedding_date: v.date(body, 'wedding_date', 'Wedding date', { required: false, minDays: -365 * 60, maxDays: 365 * 5 }),
  };
}

async function register(req, res) {
  checkOrigin(req);
  const body = await readBody(req);
  const role = v.oneOf(body, 'role', 'Account type', ROLES);
  const name = v.text(body, 'name', 'Full name', { max: 120, min: 2 });
  const email = v.email(body);
  const phone = v.phone(body);
  const city = v.text(body, 'city', 'City', { required: role !== 'seeker', max: 80 });
  const pw = v.password(body);
  if (body.consent !== true) throw new v.InputError('Please agree to the privacy terms to continue.', 'consent');
  const profile = professionalProfile(role, body);

  // Check the server can sign people in before saving anything, so a failed sign-up never leaves an account behind.
  if (configProblems().includes('SESSION_SECRET')) throw new HttpError(503, 'Sign-up is not available right now. Please try again later.');

  const status = role === 'seeker' ? 'active' : 'pending';
  const hash = await hashPassword(pw);
  let user;
  try {
    const { rows } = await query(
      `INSERT INTO users (role, name, email, phone, city, password_hash, status, profile, consent_at, last_login_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now(), now()) RETURNING *`,
      [role, name, email, phone, city, hash, status, profile],
    );
    user = rows[0];
  } catch (e) {
    if (e.code !== '23505') throw e;
    // Same email and password again (for example a retried sign-up): log them in instead of failing.
    if (await tooManyFailures(email)) throw new HttpError(429, 'Too many attempts. Please wait 15 minutes and try again.');
    const existing = (await query('SELECT * FROM users WHERE email = $1', [email])).rows[0];
    if (!existing || existing.status === 'suspended' || !(await checkPassword(pw, existing.password_hash))) {
      await recordFailure(email);
      throw new v.InputError('An account with this email already exists. Try logging in.', 'email');
    }
    await clearFailures(email);
    await query('UPDATE users SET last_login_at = now() WHERE id = $1', [existing.id]);
    return send(res, 200, { user: publicUser(existing) }, { 'Set-Cookie': await createSessionCookie(existing, isSecure(req)) });
  }
  send(res, 201, { user: publicUser(user) }, { 'Set-Cookie': await createSessionCookie(user, isSecure(req)) });
}

async function login(req, res) {
  checkOrigin(req);
  const body = await readBody(req);
  const email = v.email(body);
  const pw = typeof body.password === 'string' ? body.password : '';
  if (await tooManyFailures(email)) throw new HttpError(429, 'Too many attempts. Please wait 15 minutes and try again.');
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];
  const ok = user ? await checkPassword(pw, user.password_hash) : false;
  if (!ok) {
    await recordFailure(email);
    throw new HttpError(401, 'Email or password is incorrect.');
  }
  if (user.status === 'suspended') throw new HttpError(403, 'This account has been suspended. Please contact us.');
  await clearFailures(email);
  await query('UPDATE users SET last_login_at = now() WHERE id = $1', [user.id]);
  send(res, 200, { user: publicUser(user) }, { 'Set-Cookie': await createSessionCookie(user, isSecure(req)) });
}

async function logout(req, res) {
  send(res, 200, { ok: true }, { 'Set-Cookie': clearSessionCookie(isSecure(req)) });
}

async function me(req, res) {
  const user = await requireUser(req);
  send(res, 200, { user: publicUser(user) });
}

// Only the details that were optional at sign-up can be changed later; everything else is fixed.
const EDITABLE = {
  seeker: { city: 'City', partner_name: "Partner's name", wedding_date: 'Wedding date' },
  counsellor: { registration_no: 'Registration number', specialisation: 'Areas of focus', languages: 'Languages' },
  advocate: { practice_areas: 'Practice areas', languages: 'Languages' },
};

async function updateMe(req, res) {
  checkOrigin(req);
  const user = await requireUser(req);
  const body = await readBody(req);
  const fields = EDITABLE[user.role];
  const profile = { ...(user.profile || {}) };
  let city = user.city;
  for (const [field, label] of Object.entries(fields)) {
    if (!(field in body)) continue;
    const value = field === 'wedding_date'
      ? v.date(body, field, label, { required: false, minDays: -365 * 60, maxDays: 365 * 5 })
      : v.text(body, field, label, { required: false, max: field === 'city' ? 80 : field === 'languages' ? 120 : 300 });
    if (field === 'city') city = value || null; else profile[field] = value || null;
  }
  const { rows } = await query('UPDATE users SET city = $1, profile = $2 WHERE id = $3 RETURNING *', [city, profile, user.id]);
  send(res, 200, { user: publicUser(rows[0]) });
}

// ---------- bookings ----------

const BOOKING_SELECT = `
  SELECT b.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone, u.city AS user_city,
         a.name AS assigned_name, a.role AS assigned_role
  FROM bookings b
  JOIN users u ON u.id = b.user_id
  LEFT JOIN users a ON a.id = b.assigned_to`;

function bookingFor(viewer, b) {
  const out = {
    id: b.id, service: b.service, mode: b.mode, preferred_date: b.preferred_date, preferred_slot: b.preferred_slot,
    partner_name: b.partner_name, notes: b.notes, status: b.status, scheduled_at: b.scheduled_at,
    assigned_name: b.assigned_name, assigned_role: b.assigned_role, created_at: b.created_at,
  };
  if (viewer.id !== b.user_id || isAdmin(viewer)) {
    // Professionals and admins need to know who the client is.
    Object.assign(out, { user_name: b.user_name, user_email: b.user_email, user_phone: b.user_phone, user_city: b.user_city });
  }
  if (isAdmin(viewer)) Object.assign(out, { user_id: b.user_id, assigned_to: b.assigned_to, admin_note: b.admin_note, updated_at: b.updated_at });
  return out;
}

async function listBookings(req, res) {
  const user = await requireUser(req);
  let rows;
  if (isAdmin(user)) {
    ({ rows } = await query(`${BOOKING_SELECT} ORDER BY b.created_at DESC LIMIT 1000`));
  } else if (user.role === 'seeker') {
    ({ rows } = await query(`${BOOKING_SELECT} WHERE b.user_id = $1 ORDER BY b.created_at DESC`, [user.id]));
  } else {
    ({ rows } = await query(`${BOOKING_SELECT} WHERE b.assigned_to = $1 AND b.status <> 'cancelled' ORDER BY b.preferred_date`, [user.id]));
  }
  send(res, 200, { bookings: rows.map((b) => bookingFor(user, b)) });
}

async function createBooking(req, res) {
  checkOrigin(req);
  const user = await requireUser(req);
  if (user.role !== 'seeker') throw new HttpError(403, 'Bookings are made from a client account.');
  const body = await readBody(req);
  const service = v.oneOf(body, 'service', 'Service', SERVICES);
  const mode = v.oneOf(body, 'mode', 'Mode', ['online', 'in_person']);
  const preferredDate = v.date(body, 'preferred_date', 'Preferred date', { minDays: 1, maxDays: 120 });
  const slot = v.oneOf(body, 'preferred_slot', 'Time of day', ['morning', 'afternoon', 'evening']);
  const partner = v.text(body, 'partner_name', "Partner's name", { required: false, max: 120 });
  const notes = v.text(body, 'notes', 'Notes', { required: false, max: 2000 });

  const open = await query("SELECT count(*)::int AS n FROM bookings WHERE user_id = $1 AND status = 'requested'", [user.id]);
  if (open.rows[0].n >= 5) throw new HttpError(429, 'You already have 5 bookings waiting for confirmation. We will be in touch soon.');

  const { rows } = await query(
    `INSERT INTO bookings (user_id, service, mode, preferred_date, preferred_slot, partner_name, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [user.id, service, mode, preferredDate, slot, partner, notes],
  );
  const full = await query(`${BOOKING_SELECT} WHERE b.id = $1`, [rows[0].id]);
  send(res, 201, { booking: bookingFor(user, full.rows[0]) });
}

async function updateBooking(req, res, id) {
  checkOrigin(req);
  const user = await requireUser(req);
  const body = await readBody(req);
  const found = await query('SELECT * FROM bookings WHERE id = $1', [id]);
  const b = found.rows[0];
  if (!b) throw new HttpError(404, 'Booking not found.');

  if (isAdmin(user)) {
    const sets = [];
    const params = [];
    const add = (col, val) => { params.push(val); sets.push(`${col} = $${params.length}`); };
    if ('status' in body) add('status', v.oneOf(body, 'status', 'Status', BOOKING_STATUSES));
    if ('admin_note' in body) add('admin_note', v.text(body, 'admin_note', 'Note', { required: false, max: 2000 }));
    if ('scheduled_at' in body) {
      const s = body.scheduled_at;
      if (s === null || s === '') add('scheduled_at', null);
      else {
        const t = Date.parse(s);
        if (Number.isNaN(t)) throw new v.InputError('Scheduled time must be a valid date and time.', 'scheduled_at');
        add('scheduled_at', new Date(t).toISOString());
      }
    }
    if ('assigned_to' in body) {
      if (body.assigned_to === null || body.assigned_to === '') add('assigned_to', null);
      else {
        const pid = Number(body.assigned_to);
        const p = await query("SELECT id FROM users WHERE id = $1 AND role IN ('counsellor','advocate') AND status = 'approved'", [pid]);
        if (!p.rows[0]) throw new v.InputError('Assign an approved counsellor or advocate.', 'assigned_to');
        add('assigned_to', pid);
      }
    }
    if (!sets.length) throw new v.InputError('Nothing to update.');
    params.push(id);
    await query(`UPDATE bookings SET ${sets.join(', ')}, updated_at = now() WHERE id = $${params.length}`, params);
  } else if (user.role === 'seeker' && b.user_id === user.id) {
    if (body.status !== 'cancelled') throw new HttpError(403, 'You can only cancel your own booking.');
    if (!['requested', 'confirmed'].includes(b.status)) throw new HttpError(409, 'This booking can no longer be cancelled.');
    await query("UPDATE bookings SET status = 'cancelled', updated_at = now() WHERE id = $1", [id]);
  } else if (b.assigned_to === user.id && user.status === 'approved') {
    if (body.status !== 'completed') throw new HttpError(403, 'You can only mark an assigned booking as completed.');
    if (b.status !== 'confirmed') throw new HttpError(409, 'Only confirmed bookings can be marked completed.');
    await query("UPDATE bookings SET status = 'completed', updated_at = now() WHERE id = $1", [id]);
  } else {
    throw new HttpError(404, 'Booking not found.');
  }
  const full = await query(`${BOOKING_SELECT} WHERE b.id = $1`, [id]);
  send(res, 200, { booking: bookingFor(user, full.rows[0]) });
}

// ---------- course ----------

const ENROLMENT_STATUSES = ['pending_payment', 'active', 'cancelled'];

async function findEnrolment(userId) {
  const { rows } = await query('SELECT * FROM course_enrolments WHERE user_id = $1 AND course = $2', [userId, course.COURSE_KEY]);
  return rows[0] || null;
}

const enrolmentFor = (e) => e && { id: e.id, status: e.status, method: e.method, amount_inr: e.amount_paise / 100, created_at: e.created_at, activated_at: e.activated_at };

async function activate(e, method, paymentId) {
  const { rows } = await query(
    `UPDATE course_enrolments SET status = 'active', method = $2, payment_id = COALESCE($3, payment_id), activated_at = COALESCE(activated_at, now())
     WHERE id = $1 RETURNING *`,
    [e.id, method, paymentId],
  );
  return rows[0];
}

// If the learner paid but the browser closed before we heard back, Razorpay still knows; ask it.
async function reconcile(e) {
  if (!e || e.status !== 'pending_payment' || !e.order_id || !course.razorpayEnabled()) return e;
  try {
    const paid = await course.orderIsPaid(e.order_id);
    return paid ? activate(e, 'razorpay', paid === 'paid' ? null : paid) : e;
  } catch (err) {
    console.error(err);
    return e;
  }
}

async function hasAccess(user) {
  if (isAdmin(user)) return true;
  const e = await findEnrolment(user.id);
  return Boolean(e && e.status === 'active');
}

async function courseInfo(req, res) {
  const user = await currentUser(req);
  const out = { course: course.outline(), payments: course.razorpayEnabled() ? 'razorpay' : 'manual', enrolment: null, progress: [], access: false, can_enrol: false };
  if (user) {
    const e = await reconcile(await findEnrolment(user.id));
    out.enrolment = enrolmentFor(e);
    out.access = isAdmin(user) || Boolean(e && e.status === 'active');
    out.can_enrol = user.role === 'seeker' && !out.access;
    const p = await query('SELECT lesson_id FROM lesson_progress WHERE user_id = $1 AND course = $2 ORDER BY completed_at', [user.id, course.COURSE_KEY]);
    out.progress = p.rows.map((r) => r.lesson_id);
  }
  send(res, 200, out);
}

async function enrol(req, res) {
  checkOrigin(req);
  const user = await requireUser(req);
  if (user.role !== 'seeker') throw new HttpError(403, 'The course is taken from a couple or individual account.');
  const amount = course.priceInr() * 100;
  await query(
    `INSERT INTO course_enrolments (user_id, course, status, amount_paise) VALUES ($1, $2, 'pending_payment', $3)
     ON CONFLICT (user_id, course) DO UPDATE SET status = 'pending_payment', amount_paise = EXCLUDED.amount_paise
     WHERE course_enrolments.status = 'cancelled'`,
    [user.id, course.COURSE_KEY, amount],
  );
  let e = await findEnrolment(user.id);
  if (e.status === 'active') return send(res, 200, { enrolment: enrolmentFor(e) });
  if (e.status === 'pending_payment' && e.amount_paise !== amount) {
    e = (await query('UPDATE course_enrolments SET amount_paise = $2 WHERE id = $1 RETURNING *', [e.id, amount])).rows[0];
  }
  if (!course.razorpayEnabled()) return send(res, 201, { enrolment: enrolmentFor(e), payment: 'manual' });

  e = await reconcile(e);
  if (e.status === 'active') return send(res, 200, { enrolment: enrolmentFor(e) });
  let order;
  try {
    order = await course.createOrder(e.amount_paise, `enrolment-${e.id}`, { enrolment_id: String(e.id), email: user.email });
  } catch (err) {
    console.error(err);
    throw new HttpError(502, 'Online payment is not available right now. Please try again in a few minutes.');
  }
  await query('UPDATE course_enrolments SET order_id = $2 WHERE id = $1', [e.id, order.id]);
  send(res, 201, {
    enrolment: enrolmentFor(e),
    payment: 'razorpay',
    checkout: {
      key: course.razorpayKeyId(), order_id: order.id, amount: e.amount_paise, currency: 'INR',
      name: 'SharedLife', description: course.COURSE_TITLE,
      prefill: { name: user.name, email: user.email, contact: user.phone },
    },
  });
}

async function verifyPayment(req, res) {
  checkOrigin(req);
  const user = await requireUser(req);
  const body = await readBody(req);
  const e = await findEnrolment(user.id);
  if (e && e.status === 'active') return send(res, 200, { enrolment: enrolmentFor(e) });
  if (!course.razorpayEnabled() || !e || !e.order_id || body.razorpay_order_id !== e.order_id) throw new HttpError(400, 'We could not match this payment to your enrolment. Please contact us.');
  const paymentId = typeof body.razorpay_payment_id === 'string' ? body.razorpay_payment_id.slice(0, 64) : '';
  if (!paymentId || !course.signatureValid(e.order_id, paymentId, body.razorpay_signature)) throw new HttpError(400, 'We could not verify this payment. If money was taken, contact us and we will sort it out.');
  send(res, 200, { enrolment: enrolmentFor(await activate(e, 'razorpay', paymentId)) });
}

async function getLesson(req, res, id) {
  const l = course.lessonById(id);
  if (!l) throw new HttpError(404, 'Lesson not found.');
  if (!l.preview) {
    const user = await requireUser(req);
    if (!(await hasAccess(user))) throw new HttpError(402, 'Enrol in the course to open this lesson.');
  }
  send(res, 200, { lesson: course.lessonBody(l) });
}

async function setProgress(req, res, id) {
  checkOrigin(req);
  const user = await requireUser(req);
  if (!course.lessonById(id)) throw new HttpError(404, 'Lesson not found.');
  if (!(await hasAccess(user))) throw new HttpError(402, 'Enrol in the course to track your progress.');
  const body = await readBody(req);
  if (body.done === false) {
    await query('DELETE FROM lesson_progress WHERE user_id = $1 AND course = $2 AND lesson_id = $3', [user.id, course.COURSE_KEY, id]);
  } else {
    await query('INSERT INTO lesson_progress (user_id, course, lesson_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [user.id, course.COURSE_KEY, id]);
  }
  const p = await query('SELECT lesson_id FROM lesson_progress WHERE user_id = $1 AND course = $2 ORDER BY completed_at', [user.id, course.COURSE_KEY]);
  send(res, 200, { progress: p.rows.map((r) => r.lesson_id) });
}

const ENROLMENT_SELECT = `
  SELECT e.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone, u.city AS user_city,
         (SELECT count(*)::int FROM lesson_progress p WHERE p.user_id = e.user_id AND p.course = e.course) AS lessons_done
  FROM course_enrolments e JOIN users u ON u.id = e.user_id`;

const adminEnrolment = (e) => ({
  ...enrolmentFor(e), order_id: e.order_id, payment_id: e.payment_id, lessons_done: e.lessons_done,
  user_id: e.user_id, user_name: e.user_name, user_email: e.user_email, user_phone: e.user_phone, user_city: e.user_city,
});

async function adminEnrolments(req, res) {
  await requireAdmin(req);
  const { rows } = await query(`${ENROLMENT_SELECT} ORDER BY e.created_at DESC LIMIT 2000`);
  send(res, 200, { enrolments: rows.map(adminEnrolment), lesson_count: course.outline().lesson_count });
}

// Give someone the course without online payment (paid by UPI or bank transfer, or complimentary).
async function adminGrant(req, res) {
  checkOrigin(req);
  await requireAdmin(req);
  const body = await readBody(req);
  const email = v.email(body);
  const method = v.oneOf(body, 'method', 'Method', ['manual', 'complimentary']);
  const u = (await query('SELECT * FROM users WHERE email = $1', [email])).rows[0];
  if (!u) throw new v.InputError('No account uses this email. Ask them to create one first.', 'email');
  if (u.role !== 'seeker') throw new v.InputError('The course is taken from a couple or individual account.', 'email');
  const amount = method === 'complimentary' ? 0 : course.priceInr() * 100;
  await query(
    `INSERT INTO course_enrolments (user_id, course, status, method, amount_paise, activated_at) VALUES ($1, $2, 'active', $3, $4, now())
     ON CONFLICT (user_id, course) DO UPDATE SET status = 'active', method = EXCLUDED.method,
       amount_paise = CASE WHEN course_enrolments.status = 'active' THEN course_enrolments.amount_paise ELSE EXCLUDED.amount_paise END,
       activated_at = COALESCE(course_enrolments.activated_at, now())`,
    [u.id, course.COURSE_KEY, method, amount],
  );
  const e = await findEnrolment(u.id);
  const { rows } = await query(`${ENROLMENT_SELECT} WHERE e.id = $1`, [e.id]);
  send(res, 200, { enrolment: adminEnrolment(rows[0]) });
}

async function adminUpdateEnrolment(req, res, id) {
  checkOrigin(req);
  await requireAdmin(req);
  const body = await readBody(req);
  const status = v.oneOf(body, 'status', 'Status', ENROLMENT_STATUSES);
  const found = (await query('SELECT * FROM course_enrolments WHERE id = $1', [id])).rows[0];
  if (!found) throw new HttpError(404, 'Enrolment not found.');
  if (status === 'active' && found.status !== 'active') await activate(found, found.method === 'razorpay' && found.payment_id ? 'razorpay' : 'manual', null);
  else await query('UPDATE course_enrolments SET status = $2 WHERE id = $1', [id, status]);
  const { rows } = await query(`${ENROLMENT_SELECT} WHERE e.id = $1`, [id]);
  send(res, 200, { enrolment: adminEnrolment(rows[0]) });
}

// ---------- admin ----------

function adminUser(u) {
  return { ...publicUser(u), last_login_at: u.last_login_at, consent_at: u.consent_at, booking_count: u.booking_count ?? undefined };
}

async function adminSummary(req, res) {
  await requireAdmin(req);
  const [users, bookings, week, enrolments] = await Promise.all([
    query('SELECT role, status, count(*)::int AS n FROM users GROUP BY role, status'),
    query('SELECT status, service, count(*)::int AS n FROM bookings GROUP BY status, service'),
    query(`SELECT
             (SELECT count(*)::int FROM users WHERE created_at > now() - interval '7 days') AS new_users,
             (SELECT count(*)::int FROM bookings WHERE created_at > now() - interval '7 days') AS new_bookings`),
    query('SELECT status, count(*)::int AS n, sum(amount_paise)::bigint AS paise FROM course_enrolments GROUP BY status'),
  ]);
  send(res, 200, {
    users: users.rows, bookings: bookings.rows, last7days: week.rows[0],
    enrolments: enrolments.rows.map((r) => ({ status: r.status, n: r.n, amount_inr: Number(r.paise) / 100 })),
  });
}

async function adminUsers(req, res, url) {
  await requireAdmin(req);
  const role = url.searchParams.get('role');
  const status = url.searchParams.get('status');
  const where = [];
  const params = [];
  if (role && ROLES.includes(role)) { params.push(role); where.push(`u.role = $${params.length}`); }
  if (status && USER_STATUSES.includes(status)) { params.push(status); where.push(`u.status = $${params.length}`); }
  const { rows } = await query(
    `SELECT u.*, (SELECT count(*)::int FROM bookings b WHERE b.user_id = u.id) AS booking_count
     FROM users u ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY u.created_at DESC LIMIT 2000`,
    params,
  );
  send(res, 200, { users: rows.map(adminUser) });
}

async function adminUpdateUser(req, res, id) {
  checkOrigin(req);
  const admin = await requireAdmin(req);
  const body = await readBody(req);
  const status = v.oneOf(body, 'status', 'Status', USER_STATUSES);
  const found = await query('SELECT * FROM users WHERE id = $1', [id]);
  const u = found.rows[0];
  if (!u) throw new HttpError(404, 'User not found.');
  if (u.id === admin.id && status === 'suspended') throw new HttpError(409, 'You cannot suspend your own account.');
  const allowed = u.role === 'seeker' ? ['active', 'suspended'] : ['pending', 'approved', 'rejected', 'suspended'];
  if (!allowed.includes(status)) throw new v.InputError(`A ${u.role} account can be set to: ${allowed.join(', ')}.`, 'status');
  const { rows } = await query('UPDATE users SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
  send(res, 200, { user: adminUser(rows[0]) });
}

function csv(rows, columns) {
  const esc = (val) => {
    if (val === null || val === undefined) return '';
    let s = val instanceof Date ? val.toISOString() : typeof val === 'object' ? JSON.stringify(val) : String(val);
    if (/^[=+\-@]/.test(s)) s = `'${s}`; // keep spreadsheet apps from running cell formulas
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [columns.join(','), ...rows.map((r) => columns.map((c) => esc(r[c])).join(','))].join('\r\n');
}

async function adminExport(req, res, url) {
  await requireAdmin(req);
  const type = url.searchParams.get('type');
  let body;
  if (type === 'users') {
    const { rows } = await query('SELECT * FROM users ORDER BY created_at');
    const flat = rows.map((u) => ({ ...u, ...Object.fromEntries(Object.entries(u.profile || {}).map(([k, val]) => [`profile_${k}`, val])) }));
    const profileCols = [...new Set(flat.flatMap((r) => Object.keys(r).filter((k) => k.startsWith('profile_'))))].sort();
    body = csv(flat, ['id', 'role', 'status', 'name', 'email', 'phone', 'city', 'created_at', 'last_login_at', ...profileCols]);
  } else if (type === 'bookings') {
    const { rows } = await query(`${BOOKING_SELECT} ORDER BY b.created_at`);
    body = csv(rows, ['id', 'created_at', 'status', 'service', 'mode', 'preferred_date', 'preferred_slot', 'scheduled_at',
      'user_name', 'user_email', 'user_phone', 'user_city', 'partner_name', 'notes', 'assigned_name', 'assigned_role', 'admin_note']);
  } else if (type === 'enrolments') {
    const { rows } = await query(`${ENROLMENT_SELECT} ORDER BY e.created_at`);
    body = csv(rows.map((e) => ({ ...e, amount_inr: e.amount_paise / 100 })), ['id', 'created_at', 'status', 'method', 'amount_inr', 'activated_at',
      'user_name', 'user_email', 'user_phone', 'user_city', 'lessons_done', 'order_id', 'payment_id']);
  } else {
    throw new v.InputError('Choose users, bookings or enrolments to export.', 'type');
  }
  const day = new Date().toISOString().slice(0, 10);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="sharedlife-${type}-${day}.csv"`);
  res.setHeader('Cache-Control', 'no-store');
  res.end(`﻿${body}`);
}

// ---------- router ----------

const routes = [
  ['GET', /^\/api\/health$/, async (req, res) => { await query('SELECT 1'); const missing = configProblems(); send(res, 200, { ok: !missing.length, database: true, missing_settings: missing, course_payments: course.razorpayEnabled() ? 'razorpay' : 'manual', razorpay_mode: course.razorpayMode(), razorpay_missing: course.razorpayProblems() }); }],
  ['POST', /^\/api\/auth\/register$/, register],
  ['POST', /^\/api\/auth\/login$/, login],
  ['POST', /^\/api\/auth\/logout$/, logout],
  ['GET', /^\/api\/auth\/me$/, me],
  ['PATCH', /^\/api\/auth\/me$/, updateMe],
  ['GET', /^\/api\/bookings$/, listBookings],
  ['POST', /^\/api\/bookings$/, createBooking],
  ['PATCH', /^\/api\/bookings\/(\d+)$/, updateBooking],
  ['GET', /^\/api\/course$/, courseInfo],
  ['POST', /^\/api\/course\/enrol$/, enrol],
  ['POST', /^\/api\/course\/verify$/, verifyPayment],
  ['GET', /^\/api\/course\/lessons\/(\d+)$/, getLesson],
  ['PUT', /^\/api\/course\/progress\/(\d+)$/, setProgress],
  ['GET', /^\/api\/admin\/summary$/, adminSummary],
  ['GET', /^\/api\/admin\/users$/, adminUsers],
  ['PATCH', /^\/api\/admin\/users\/(\d+)$/, adminUpdateUser],
  ['GET', /^\/api\/admin\/enrolments$/, adminEnrolments],
  ['POST', /^\/api\/admin\/enrolments$/, adminGrant],
  ['PATCH', /^\/api\/admin\/enrolments\/(\d+)$/, adminUpdateEnrolment],
  ['GET', /^\/api\/admin\/export$/, adminExport],
];

export async function handle(req, res) {
  const url = new URL(req.url, 'http://local');
  const path = url.pathname.replace(/\/+$/, '');
  try {
    const match = routes.find(([m, re]) => re.test(path) && m === req.method);
    if (!match) {
      const known = routes.some(([, re]) => re.test(path));
      throw new HttpError(known ? 405 : 404, known ? 'Method not allowed.' : 'Not found.');
    }
    const [, re, fn] = match;
    const param = path.match(re)[1];
    await fn(req, res, param !== undefined ? Number(param) : url, url);
  } catch (err) {
    if (err instanceof v.InputError) return send(res, 400, { error: err.message, field: err.field });
    if (err instanceof HttpError) return send(res, err.status, { error: err.message });
    if (err instanceof SyntaxError) return send(res, 400, { error: 'Invalid request.' });
    console.error(err);
    send(res, 500, { error: 'Something went wrong on our side. Please try again.' });
  }
}
