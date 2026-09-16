CREATE TABLE "diagrams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(140) NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" varchar(500) DEFAULT '' NOT NULL,
	"mime_type" varchar(60) DEFAULT 'image/svg+xml' NOT NULL,
	"encoding" varchar(10) DEFAULT 'utf8' NOT NULL,
	"content" text NOT NULL,
	"size_bytes" integer DEFAULT 0 NOT NULL,
	"category" varchar(60) DEFAULT 'general' NOT NULL,
	"updated_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "diagrams" ADD CONSTRAINT "diagrams_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "diagrams_slug_uq" ON "diagrams" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "diagrams_category_idx" ON "diagrams" USING btree ("category");