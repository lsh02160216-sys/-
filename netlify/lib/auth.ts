import { createHash, timingSafeEqual } from "node:crypto";

const digest = (value: string) => createHash("sha256").update(value).digest();

// Returns an error Response when the request lacks a valid admin password, otherwise null.
export function requireAdmin(req: Request): Response | null {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return Response.json(
      { error: "관리자 비밀번호(ADMIN_PASSWORD 환경변수)가 아직 설정되지 않았습니다." },
      { status: 503 }
    );
  }
  const given = req.headers.get("x-admin-password") ?? "";
  if (!given || !timingSafeEqual(digest(given), digest(expected))) {
    return Response.json({ error: "관리자 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }
  return null;
}
