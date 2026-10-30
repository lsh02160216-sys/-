import { jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const videos = pgTable("videos", {
  id: serial().primaryKey(),
  youtubeId: text("youtube_id").notNull(),
  title: text().notNull(),
  author: text().notNull().default(""),
  description: text().notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Whole site configuration (texts, images, links, theme, ...) as one JSON document per row.
export const siteContent = pgTable("site_content", {
  id: text().primaryKey(),
  data: jsonb().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Visitor inquiries / bookings / alerts. Kept apart from site content because they hold personal data.
export const inquiries = pgTable("inquiries", {
  id: text().primaryKey(),
  data: jsonb().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
