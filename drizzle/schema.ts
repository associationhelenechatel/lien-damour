import { pgTable, serial, text, date, timestamp, foreignKey, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const familyMember = pgTable("family_member", {
	id: serial().primaryKey().notNull(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name"),
	gender: text(),
	birthDate: date("birth_date"),
	deathDate: date("death_date"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const familyRelation = pgTable("family_relation", {
	id: serial().primaryKey().notNull(),
	parentId: integer("parent_id").notNull(),
	childId: integer("child_id").notNull(),
	relationType: text("relation_type"),
}, (table) => [
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [familyMember.id],
			name: "family_relation_parent_id_family_member_id_fk"
		}),
	foreignKey({
			columns: [table.childId],
			foreignColumns: [familyMember.id],
			name: "family_relation_child_id_family_member_id_fk"
		}),
]);

export const partnership = pgTable("partnership", {
	id: serial().primaryKey().notNull(),
	partner1Id: integer("partner1_id").notNull(),
	partner2Id: integer("partner2_id").notNull(),
	startDate: date("start_date"),
	endDate: date("end_date"),
}, (table) => [
	foreignKey({
			columns: [table.partner1Id],
			foreignColumns: [familyMember.id],
			name: "partnership_partner1_id_family_member_id_fk"
		}),
	foreignKey({
			columns: [table.partner2Id],
			foreignColumns: [familyMember.id],
			name: "partnership_partner2_id_family_member_id_fk"
		}),
]);
