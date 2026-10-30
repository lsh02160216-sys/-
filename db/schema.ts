import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const videos = pgTable("videos", {
  id: serial().primaryKey(),
  youtubeId: text("youtube_id").notNull(),
  title: text().notNull(),
  author: text().notNull().default(""),
  description: text().notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
