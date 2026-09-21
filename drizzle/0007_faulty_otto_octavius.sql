CREATE TABLE "family_member_document" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" integer NOT NULL,
	"object_key" text NOT NULL,
	"file_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"uploaded_by_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "family_member_document" ADD CONSTRAINT "family_member_document_member_id_family_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."family_member"("id") ON DELETE no action ON UPDATE no action;