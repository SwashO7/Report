CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(160) NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"image_key" varchar(120),
	"image_mime" varchar(60),
	"image_size_bytes" integer,
	"image_alt" varchar(300) DEFAULT '' NOT NULL,
	"video_key" varchar(120),
	"video_mime" varchar(60),
	"video_size_bytes" bigint,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"author_id" uuid,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "reports_slug_uq" ON "reports" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "reports_status_published_idx" ON "reports" USING btree ("status","published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "reports_image_key_uq" ON "reports" USING btree ("image_key");--> statement-breakpoint
CREATE UNIQUE INDEX "reports_video_key_uq" ON "reports" USING btree ("video_key");