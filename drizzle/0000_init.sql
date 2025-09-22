CREATE TABLE "family_member" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text,
	"gender" text,
	"birth_date" date,
	"death_date" date,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "family_relation" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer NOT NULL,
	"child_id" integer NOT NULL,
	"relation_type" text
);
--> statement-breakpoint
CREATE TABLE "partnership" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner1_id" integer NOT NULL,
	"partner2_id" integer NOT NULL,
	"start_date" date,
	"end_date" date
);
--> statement-breakpoint
ALTER TABLE "family_relation" ADD CONSTRAINT "family_relation_parent_id_family_member_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."family_member"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_relation" ADD CONSTRAINT "family_relation_child_id_family_member_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."family_member"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partnership" ADD CONSTRAINT "partnership_partner1_id_family_member_id_fk" FOREIGN KEY ("partner1_id") REFERENCES "public"."family_member"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partnership" ADD CONSTRAINT "partnership_partner2_id_family_member_id_fk" FOREIGN KEY ("partner2_id") REFERENCES "public"."family_member"("id") ON DELETE no action ON UPDATE no action;