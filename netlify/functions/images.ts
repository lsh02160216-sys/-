import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { requireAdmin } from "../lib/auth.js";

const MAX_BYTES = 5 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/avif": "avif",
};

const store = () => getStore({ name: "site-images", consistency: "strong" });

export default async (req: Request, context: Context) => {
  if (req.method === "GET") {
    const key = context.params.key;
    if (!key) return new Response("Not found", { status: 404 });
    const result = await store().getWithMetadata(key, { type: "arrayBuffer" });
    if (!result) return new Response("Not found", { status: 404 });
    return new Response(result.data, {
      headers: {
        "Content-Type": String(result.metadata.contentType || "application/octet-stream"),
        // Keys are unique per upload, so the content never changes
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  if (req.method === "POST") {
    const denied = requireAdmin(req);
    if (denied) return denied;

    const contentType = (req.headers.get("content-type") || "").split(";")[0].trim();
    const ext = EXTENSIONS[contentType];
    if (!ext) {
      return Response.json({ error: `지원하지 않는 이미지 형식입니다 (${contentType || "알 수 없음"}).` }, { status: 415 });
    }
    const bytes = await req.arrayBuffer();
    if (!bytes.byteLength) {
      return Response.json({ error: "이미지 데이터가 비어 있습니다." }, { status: 400 });
    }
    if (bytes.byteLength > MAX_BYTES) {
      return Response.json({ error: "이미지 용량이 5MB를 초과합니다." }, { status: 413 });
    }
    const key = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
    await store().set(key, bytes, { metadata: { contentType } });
    return Response.json({ url: `/api/images/${key}` }, { status: 201 });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: ["/api/images", "/api/images/:key"],
};
