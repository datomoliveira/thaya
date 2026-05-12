import type { JWTPayload } from '../types';

// ── Base64Url helpers (CF Workers compatible — no unescape/escape) ──

function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64UrlEncodeBuffer(buffer: ArrayBuffer): string {
  let binary = '';
  new Uint8Array(buffer).forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64UrlDecode(str: string): string {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  const binary = atob(padded + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function base64UrlDecodeToBuffer(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  const binary = atob(padded + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// ── HMAC key helper ──

async function getKey(secret: string, usage: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    usage,
  );
}

// ── JWT sign / verify ──

export async function signJWT(
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  secret: string,
  expiresInSeconds = 7 * 24 * 3600,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = { ...payload, iat: now, exp: now + expiresInSeconds };
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify(fullPayload));
  const signingInput = `${header}.${body}`;
  const key = await getKey(secret, ['sign']);
  const sigBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput));
  return `${signingInput}.${base64UrlEncodeBuffer(sigBuffer)}`;
}

export async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;
    const key = await getKey(secret, ['verify']);
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlDecodeToBuffer(sig),
      new TextEncoder().encode(`${header}.${body}`),
    );
    if (!valid) return null;
    const payload = JSON.parse(base64UrlDecode(body)) as JWTPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function extractToken(request: Request): string | null {
  const auth = request.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  const cookie = request.headers.get('Cookie');
  if (cookie) {
    const match = cookie.match(/thaya_token=([^;]+)/);
    if (match) return match[1];
  }
  return null;
}

// ── Password hashing with PBKDF2 ──

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

export async function hashPassword(password: string, saltHex?: string): Promise<string> {
  const saltBytes = saltHex
    ? hexToBytes(saltHex)
    : crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBytes, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256,
  );
  return `${bytesToHex(saltBytes)}:${bytesToHex(new Uint8Array(hash))}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt] = stored.split(':');
  const computed = await hashPassword(password, salt);
  return computed === stored;
}
