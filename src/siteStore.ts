// Server-backed persistence for the admin dashboard.
// Site content lives in Netlify Database (shared with every visitor), uploaded images in Netlify Blobs.
import { STORAGE_KEY } from './siteTexts';

// Pre-server data saved by older versions of the admin. Read-only: kept for migration, never deleted.
export const LEGACY_STORAGE_KEY = STORAGE_KEY;
// Last content fetched from the server, used to render instantly before the network responds.
export const CACHE_KEY = 'cheongsong_apple_fest_site_cache_v1';
const LEGACY_INQUIRIES_MIGRATED_KEY = 'cheongsong_apple_fest_legacy_inquiries_migrated';
const ADMIN_PASSWORD_KEY = 'cheongsong_apple_fest_admin_pw';

type Json = Record<string, any>;

function readLocalJSON(key: string): Json | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function loadLegacyLocalData(): Json | null {
  return readLocalJSON(LEGACY_STORAGE_KEY);
}

export function loadCachedData(): Json | null {
  return readLocalJSON(CACHE_KEY);
}

export function writeCache(data: Json) {
  try {
    const { inquiries: _omit, ...content } = data;
    localStorage.setItem(CACHE_KEY, JSON.stringify(content));
  } catch {
    // Cache only; the server copy is authoritative
  }
}

// Fills keys missing from saved data (e.g. added in a newer version) with defaults, without touching saved values.
export function mergeWithDefaults<T extends Json>(defaults: T, saved: Json | null | undefined): T {
  if (!saved || typeof saved !== 'object') return JSON.parse(JSON.stringify(defaults));
  const result: Json = { ...JSON.parse(JSON.stringify(defaults)), ...saved };
  for (const key of Object.keys(defaults)) {
    const def = (defaults as Json)[key];
    const val = saved[key];
    if (def && typeof def === 'object' && !Array.isArray(def)) {
      result[key] = val && typeof val === 'object' && !Array.isArray(val) ? { ...def, ...val } : { ...def };
    } else if (Array.isArray(def)) {
      result[key] = Array.isArray(val) ? val : [...def];
    } else if (val === undefined) {
      result[key] = def;
    }
  }
  return result as T;
}

async function readError(res: Response, fallback: string): Promise<string> {
  const body = await res.json().catch(() => null);
  return body?.error || `${fallback} (오류 코드 ${res.status})`;
}

export async function fetchSiteContent(): Promise<Json | null> {
  const res = await fetch('/api/site-content', { cache: 'no-store' });
  if (!res.ok) throw new Error(await readError(res, '사이트 데이터를 불러오지 못했습니다'));
  const body = await res.json();
  return body.data ?? null;
}

// ---------- Admin password (kept only for this browser tab) ----------
export function getAdminPassword(): string | null {
  try {
    return sessionStorage.getItem(ADMIN_PASSWORD_KEY);
  } catch {
    return null;
  }
}

export function setAdminPassword(pw: string | null) {
  try {
    if (pw) sessionStorage.setItem(ADMIN_PASSWORD_KEY, pw);
    else sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
  } catch {
    // ignore
  }
}

export class AuthError extends Error {}

// Also serves as the admin login check
export async function fetchInquiries(password: string): Promise<Json[]> {
  const res = await fetch('/api/inquiries', { headers: { 'x-admin-password': password }, cache: 'no-store' });
  if (res.status === 401) throw new AuthError(await readError(res, '비밀번호가 올바르지 않습니다'));
  if (!res.ok) throw new Error(await readError(res, '문의 내역을 불러오지 못했습니다'));
  return res.json();
}

export async function submitInquiry(inquiry: Json): Promise<boolean> {
  try {
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiry),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Inquiries that only exist in this browser's old local storage, imported once on the next admin save.
export function getUnmigratedLegacyInquiries(): Json[] {
  try {
    if (localStorage.getItem(LEGACY_INQUIRIES_MIGRATED_KEY)) return [];
  } catch {
    return [];
  }
  const legacy = loadLegacyLocalData();
  return Array.isArray(legacy?.inquiries) ? legacy!.inquiries.filter((i: Json) => i && typeof i.id === 'string') : [];
}

function markLegacyInquiriesMigrated() {
  try {
    localStorage.setItem(LEGACY_INQUIRIES_MIGRATED_KEY, new Date().toISOString());
  } catch {
    // ignore
  }
}

// ---------- Images ----------
export const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024;

const isDataImage = (v: unknown): v is string => typeof v === 'string' && v.startsWith('data:image/');

export async function uploadImage(blob: Blob, password: string): Promise<string> {
  if (blob.size > MAX_UPLOAD_BYTES) throw new Error('이미지 용량이 너무 큽니다. 더 작은 이미지를 사용해주세요.');
  const res = await fetch('/api/images', {
    method: 'POST',
    headers: { 'Content-Type': blob.type || 'application/octet-stream', 'x-admin-password': password },
    body: blob,
  });
  if (res.status === 401) throw new AuthError(await readError(res, '비밀번호가 올바르지 않습니다'));
  if (!res.ok) throw new Error(await readError(res, '이미지 업로드에 실패했습니다'));
  const { url } = await res.json();
  if (typeof url !== 'string') throw new Error('이미지 업로드 응답이 올바르지 않습니다.');
  return url;
}

function collectDataImages(value: unknown, found: Set<string>) {
  if (isDataImage(value)) found.add(value);
  else if (Array.isArray(value)) value.forEach((v) => collectDataImages(v, found));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => collectDataImages(v, found));
}

function replaceStrings(value: any, map: Map<string, string>): any {
  if (typeof value === 'string') return map.get(value) ?? value;
  if (Array.isArray(value)) return value.map((v) => replaceStrings(v, map));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, replaceStrings(v, map)]));
  }
  return value;
}

// Uploads every embedded base64 image (new uploads and old locally-saved ones) and swaps it for its URL.
export async function uploadEmbeddedImages<T>(data: T, password: string, onProgress?: (done: number, total: number) => void): Promise<T> {
  const found = new Set<string>();
  collectDataImages(data, found);
  if (!found.size) return data;
  const map = new Map<string, string>();
  let done = 0;
  onProgress?.(done, found.size);
  for (const dataUrl of found) {
    let blob: Blob;
    try {
      blob = await (await fetch(dataUrl)).blob();
    } catch {
      throw new Error('이미지 데이터 변환에 실패했습니다. 해당 이미지를 다시 업로드해주세요.');
    }
    map.set(dataUrl, await uploadImage(blob, password));
    onProgress?.(++done, found.size);
  }
  return replaceStrings(data, map);
}

// ---------- Save ----------
// Postgres jsonb reorders object keys, so compare with sorted keys
function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .filter((k) => (value as Json)[k] !== undefined)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stableStringify((value as Json)[k])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value ?? null);
}

export async function saveSiteContent(
  data: Json,
  inquiries: Json[],
  deletedInquiryIds: string[],
  password: string
): Promise<Json> {
  const { inquiries: _omit, ...content } = data;
  const res = await fetch('/api/site-content', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
    body: JSON.stringify({ data: content, inquiries, deletedInquiryIds }),
  });
  if (res.status === 401) throw new AuthError(await readError(res, '비밀번호가 올바르지 않습니다'));
  if (!res.ok) throw new Error(await readError(res, '서버 저장에 실패했습니다'));
  const body = await res.json();
  // Confirm the server stored exactly what was sent before reporting success
  if (stableStringify(body.data) !== stableStringify(content)) {
    throw new Error('서버에 저장된 내용이 전송한 내용과 다릅니다. 다시 시도해주세요.');
  }
  markLegacyInquiriesMigrated();
  writeCache(body.data);
  return body.data;
}

// ---------- Image file → compressed data URL ----------
function readAsDataURL(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('이미지 파일을 읽지 못했습니다.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('이미지를 해석하지 못했습니다. 손상되었거나 지원하지 않는 형식입니다.'));
    img.src = src;
  });
}

const approxBytes = (dataUrl: string) => Math.ceil((dataUrl.length - dataUrl.indexOf(',') - 1) * 0.75);

// Resizes large photos so they upload reliably and load fast for visitors.
export async function prepareImageFile(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('이미지 파일만 업로드할 수 있습니다.');
  if (file.size > 30 * 1024 * 1024) throw new Error('원본 이미지가 30MB를 초과합니다.');

  const original = await readAsDataURL(file);
  // Keep animation / vector data intact
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
    if (file.size > MAX_UPLOAD_BYTES) throw new Error('GIF/SVG 이미지는 4.5MB 이하만 업로드할 수 있습니다.');
    return original;
  }

  const img = await loadImage(original);
  const keepAlpha = file.type === 'image/png' || file.type === 'image/webp';
  for (const [maxSide, quality] of [[1920, 0.85], [1600, 0.78], [1280, 0.7], [1024, 0.6]] as const) {
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    if (scale === 1 && file.size <= 1024 * 1024) return original;
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) return original;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    let out = canvas.toDataURL(keepAlpha ? 'image/webp' : 'image/jpeg', quality);
    if (!out.startsWith('data:image/webp') && keepAlpha) out = canvas.toDataURL('image/png');
    if (approxBytes(out) <= MAX_UPLOAD_BYTES) return out;
  }
  throw new Error('이미지를 충분히 압축하지 못했습니다. 더 작은 이미지를 사용해주세요.');
}
