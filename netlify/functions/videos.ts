import type { Config } from "@netlify/functions";
import { desc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { videos } from "../../db/schema.js";

// Accepts watch, short, shorts, embed, live and music URLs, or a bare 11-char ID
function extractYoutubeId(input: string): string | null {
  const value = input.trim();
  if (/^[\w-]{11}$/.test(value)) return value;
  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    const host = url.hostname.replace(/^(www\.|m\.|music\.)/, "");
    let id: string | null = null;
    if (host === "youtu.be") {
      id = url.pathname.split("/")[1] || null;
    } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      id = url.searchParams.get("v");
      if (!id) {
        const match = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([\w-]{11})/);
        id = match ? match[1] : null;
      }
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export default async (req: Request) => {
  if (req.method === "GET") {
    const rows = await db.select().from(videos).orderBy(desc(videos.createdAt)).limit(200);
    return Response.json(rows);
  }

  if (req.method === "POST") {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }

    const youtubeId = extractYoutubeId(String(body.url ?? ""));
    if (!youtubeId) {
      return Response.json({ error: "올바른 유튜브 링크를 입력해주세요." }, { status: 400 });
    }

    const title = String(body.title ?? "").trim().slice(0, 120);
    if (!title) {
      return Response.json({ error: "영상 제목을 입력해주세요." }, { status: 400 });
    }

    const [row] = await db
      .insert(videos)
      .values({
        youtubeId,
        title,
        author: String(body.author ?? "").trim().slice(0, 40),
        description: String(body.description ?? "").trim().slice(0, 500),
      })
      .returning();
    return Response.json(row, { status: 201 });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/videos",
};
