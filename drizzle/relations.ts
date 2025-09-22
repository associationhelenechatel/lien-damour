import { relations } from "drizzle-orm/relations";
import { familyMember, familyRelation, partnership } from "./schema";

export const familyRelationRelations = relations(familyRelation, ({one}) => ({
	familyMember_parentId: one(familyMember, {
		fields: [familyRelation.parentId],
		references: [familyMember.id],
		relationName: "familyRelation_parentId_familyMember_id"
	}),
	familyMember_childId: one(familyMember, {
		fields: [familyRelation.childId],
		references: [familyMember.id],
		relationName: "familyRelation_childId_familyMember_id"
	}),
}));

export const familyMemberRelations = relations(familyMember, ({many}) => ({
	familyRelations_parentId: many(familyRelation, {
		relationName: "familyRelation_parentId_familyMember_id"
	}),
	familyRelations_childId: many(familyRelation, {
		relationName: "familyRelation_childId_familyMember_id"
	}),
	partnerships_partner1Id: many(partnership, {
		relationName: "partnership_partner1Id_familyMember_id"
	}),
	partnerships_partner2Id: many(partnership, {
		relationName: "partnership_partner2Id_familyMember_id"
	}),
}));

export const partnershipRelations = relations(partnership, ({one}) => ({
	familyMember_partner1Id: one(familyMember, {
		fields: [partnership.partner1Id],
		references: [familyMember.id],
		relationName: "partnership_partner1Id_familyMember_id"
	}),
	familyMember_partner2Id: one(familyMember, {
		fields: [partnership.partner2Id],
		references: [familyMember.id],
		relationName: "partnership_partner2Id_familyMember_id"
	}),
}));