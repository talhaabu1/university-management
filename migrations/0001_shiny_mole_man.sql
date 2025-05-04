CREATE TABLE "books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"author" text NOT NULL,
	"genre" text NOT NULL,
	"rating" integer NOT NULL,
	"total_copies" integer DEFAULT 1 NOT NULL,
	"cover_url" text NOT NULL,
	"cover_color" text NOT NULL,
	"video_url" text NOT NULL,
	"summary" text NOT NULL,
	"available_copies" integer DEFAULT 0 NOT NULL,
	"status" "status" DEFAULT 'PENDING',
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "books_id_unique" UNIQUE("id")
);
