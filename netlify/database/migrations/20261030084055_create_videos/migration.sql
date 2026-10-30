CREATE TABLE "videos" (
	"id" serial PRIMARY KEY,
	"youtube_id" text NOT NULL,
	"title" text NOT NULL,
	"author" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
