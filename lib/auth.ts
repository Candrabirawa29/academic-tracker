import { cookies } from 'next/headers';
import { prisma } from './prisma';

const COOKIE_NAME = 'academic_session';
const DEFAULT_SECRET = 'academic-tracker-default-secret-salt-2026-secure-key';

function getSecretKey(): string {
  return process.env.AUTH_SECRET || DEFAULT_SECRET;
}

// ── Web Crypto HMAC Helper ───────────────────────────────────────
async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(getSecretKey()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

export type SessionData = {
  userId: string;
  name: string;
  exp: number;
};

// ── Sign session token ───────────────────────────────────────────
export async function createSessionToken(userId: string, name: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload: SessionData = {
    userId,
    name,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const key = await getCryptoKey();
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(data)
  );
  const signature = Buffer.from(signatureBuffer)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${data}.${signature}`;
}

// ── Verify session token ─────────────────────────────────────────
export async function verifySessionToken(token?: string | null): Promise<SessionData | null> {
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const data = `${header}.${payload}`;

    const key = await getCryptoKey();
    const sigBytes = Buffer.from(
      signature.replace(/-/g, '+').replace(/_/g, '/'),
      'base64'
    );

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      new TextEncoder().encode(data)
    );

    if (!isValid) return null;

    const parsed: SessionData = JSON.parse(base64UrlDecode(payload));
    if (parsed.exp < Date.now()) return null; // Expired

    return parsed;
  } catch (err) {
    console.error('Session verification error:', err);
    return null;
  }
}

// ── Get current session from Next.js cookies ─────────────────────
export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    if (!sessionCookie?.value) return null;
    return await verifySessionToken(sessionCookie.value);
  } catch {
    return null;
  }
}

// ── Set session cookie ───────────────────────────────────────────
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

// ── Clear session cookie (Logout) ────────────────────────────────
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// ── Verify Owner Password ────────────────────────────────────────
export function verifyOwnerPassword(password: string): boolean {
  const configuredPassword = process.env.OWNER_PASSWORD || 'damar2026';
  return password.trim() === configuredPassword.trim();
}

// ── Get Default Owner User ───────────────────────────────────────
export async function getOwnerUser() {
  const user = await prisma.user.findFirst({
    orderBy: { createdAt: 'asc' },
  });
  return user;
}

// ── Verify Bot Token (WhatsApp Automation backward-compatible) ───
export function verifyBotToken(request: Request): boolean {
  const configuredKey = process.env.BOT_API_KEY;
  if (!configuredKey) {
    // If no BOT_API_KEY is configured in .env, permit bot operations during transition
    return true;
  }

  const authHeader = request.headers.get('authorization');
  const customHeader = request.headers.get('x-bot-token');

  if (customHeader === configuredKey) return true;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token === configuredKey) return true;
  }

  return false;
}

// ── Server-side Mutation Authorization ───────────────────────────
export async function checkMutationAuth(request: Request): Promise<{
  authorized: boolean;
  userId?: string;
  isBot?: boolean;
}> {
  // 1. Check Owner session cookie
  const session = await getSession();
  if (session?.userId) {
    return { authorized: true, userId: session.userId, isBot: false };
  }

  // 2. Check WhatsApp Bot API Key
  const isBot = verifyBotToken(request);
  if (isBot) {
    const owner = await getOwnerUser();
    return { authorized: true, userId: owner?.id, isBot: true };
  }

  return { authorized: false };
}
