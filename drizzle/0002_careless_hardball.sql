ALTER TABLE "family_member" ADD COLUMN "latitude" numeric(10, 8);--> statement-breakpoint
ALTER TABLE "family_member" ADD COLUMN "longitude" numeric(11, 8);--> statement-breakpoint
ALTER TABLE "family_member" ADD COLUMN "mapbox_place_id" text;