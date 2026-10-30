import type { Config } from "@netlify/functions";
import { eq, inArray, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { inquiries, siteContent } from "../../db/schema.js";
import { requireAdmin } from "../lib/auth.js";

const ROW_ID = "main";

export default async (req: Request) => {
  if (req.method === "GET") {
    const [row] = await db.select().from(siteContent).where(eq(siteContent.id, ROW_ID));
    return Response.json(
      { data: row?.data ?? null, updatedAt: row?.updatedAt ?? null },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  if (req.method === "PUT") {
    const denied = requireAdmin(req);
    if (denied) return denied;

    let body: { data?: unknown; inquiries?: unknown; deletedInquiryIds?: unknown };
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "저장 데이터를 읽을 수 없습니다." }, { status: 400 });
    }
    const data = body.data;
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return Response.json({ error: "저장할 사이트 데이터가 없습니다." }, { status: 400 });
    }
    // Inquiries never live inside the public document
    const { inquiries: _omit, ...content } = data as Record<string, unknown>;

    const upserts = Array.isArray(body.inquiries)
      ? body.inquiries.filter((i): i is Record<string, unknown> => !!i && typeof i === "object" && typeof (i as any).id === "string")
      : [];
    const deletedIds = Array.isArray(body.deletedInquiryIds)
      ? body.deletedInquiryIds.filter((id): id is string => typeof id === "string")
      : [];

    const updatedAt = new Date();
    await db.transaction(async (tx) => {
      await tx
        .insert(siteContent)
        .values({ id: ROW_ID, data: content, updatedAt })
        .onConflictDoUpdate({ target: siteContent.id, set: { data: content, updatedAt } });
      if (deletedIds.length) {
        await tx.delete(inquiries).where(inArray(inquiries.id, deletedIds));
      }
      for (const inquiry of upserts) {
        await tx
          .insert(inquiries)
          .values({ id: inquiry.id as string, data: inquiry })
          .onConflictDoUpdate({ target: inquiries.id, set: { data: sql`excluded.data` } });
      }
    });

    // Echo back what is now stored so the client can confirm the round-trip
    const [row] = await db.select().from(siteContent).where(eq(siteContent.id, ROW_ID));
    return Response.json({ data: row.data, updatedAt: row.updatedAt });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/site-content",
};
