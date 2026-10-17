import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { query } from './db.js';

export const COOKIE = 'sl_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('SESSION_SECRET must be set to at least 32 characters');
  return new TextEncoder().encode(s);
}

export function adminEmails() {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const isAdmin = (user) => Boolean(user) && adminEmails().includes(user.email);

export const hashPassword = (pw) => bcrypt.hash(pw, 10);
export const checkPassword = (pw, hash) => bcrypt.compare(pw, hash);

export async function createSessionCookie(user, secure) {
  const token = await new SignJWT({ sub: String(user.id) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}${secure ? '; Secure' : ''}`;
}

export function clearSessionCookie(secure) {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`;
}

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}

// Returns the logged-in user row (fresh from the database), or null.
export async function currentUser(req) {
  const token = readCookie(req, COOKIE);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ['HS256'] });
    const { rows } = await query('SELECT * FROM users WHERE id = $1', [Number(payload.sub)]);
    const user = rows[0];
    if (!user || user.status === 'suspended') return null;
    return user;
  } catch {
    return null;
  }
}

// Lock an email out after 8 failed logins in 15 minutes.
export async function tooManyFailures(email) {
  const { rows } = await query(
    "SELECT count(*)::int AS n FROM login_failures WHERE email = $1 AND at > now() - interval '15 minutes'",
    [email],
  );
  return rows[0].n >= 8;
}

export async function recordFailure(email) {
  await query('INSERT INTO login_failures (email) VALUES ($1)', [email]);
  await query("DELETE FROM login_failures WHERE at < now() - interval '1 day'");
}

export async function clearFailures(email) {
  await query('DELETE FROM login_failures WHERE email = $1', [email]);
}

// What the browser is allowed to see about a user.
export function publicUser(u) {
  return {
    id: u.id,
    role: u.role,
    name: u.name,
    email: u.email,
    phone: u.phone,
    city: u.city,
    status: u.status,
    profile: u.profile,
    created_at: u.created_at,
    is_admin: isAdmin(u),
  };
}
