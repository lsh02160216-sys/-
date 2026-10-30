import type { Config } from "@netlify/functions";
import { desc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { inquiries } from "../../db/schema.js";
import { requireAdmin } from "../lib/auth.js";

const clip = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);

export default async (req: Request) => {
  // Admin only: inquiries contain names and phone numbers
  if (req.method === "GET") {
    const denied = requireAdmin(req);
    if (denied) return denied;
    const rows = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt)).limit(1000);
    return Response.json(rows.map((r) => r.data), { headers: { "Cache-Control": "no-store" } });
  }

  if (req.method === "POST") {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }
    const inquiry = {
      id: `inq-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
      name: clip(body.name, 80),
      phone: clip(body.phone, 40),
      email: clip(body.email, 120),
      type: clip(body.type, 200),
      content: clip(body.content, 3000),
      date: clip(body.date, 40) || new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
      status: "미확인",
      sentToFormspree: body.sentToFormspree === true,
    };
    if (!inquiry.name && !inquiry.phone) {
      return Response.json({ error: "이름 또는 연락처가 필요합니다." }, { status: 400 });
    }
    await db.insert(inquiries).values({ id: inquiry.id, data: inquiry });
    return Response.json(inquiry, { status: 201 });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/inquiries",
};
