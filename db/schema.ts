import {
  pgTable,
  serial,
  text,
  date,
  timestamp,
  integer,
  decimal,
} from "drizzle-orm/pg-core";

export const familyMember = pgTable("family_member", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  maidenName: text("maiden_name"),
  gender: text("gender"), // enum possible
  birthDate: date("birth_date"),
  deathDate: date("death_date"),
  address: text("address"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  mapboxPlaceId: text("mapbox_place_id"),
  phone: text("phone"),
  mail: text("mail"),
  pictureId: text("picture_id"),
  code: text("code"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const familyRelation = pgTable("family_relation", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id")
    .references(() => familyMember.id)
    .notNull(),
  childId: integer("child_id")
    .references(() => familyMember.id)
    .notNull(),
  relationType: text("relation_type"), // bio, adoptive, step
});

export const partnership = pgTable("partnership", {
  id: serial("id").primaryKey(),
  partner1Id: integer("partner1_id")
    .references(() => familyMember.id)
    .notNull(),
  partner2Id: integer("partner2_id")
    .references(() => familyMember.id)
    .notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
});
