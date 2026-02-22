/**
 * Types basés sur le schéma Drizzle ORM
 */

import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { familyMember, familyRelation, partnership } from "@/db/schema";

// Types de base générés automatiquement par Drizzle
export type FamilyMember = InferSelectModel<typeof familyMember>;
export type FamilyRelation = InferSelectModel<typeof familyRelation>;
export type Partnership = InferSelectModel<typeof partnership>;

// Types pour l'insertion (création de nouvelles entrées)
export type NewFamilyMember = InferInsertModel<typeof familyMember>;
export type NewFamilyRelation = InferInsertModel<typeof familyRelation>;
export type NewPartnership = InferInsertModel<typeof partnership>;

// Types enrichis pour l'arbre généalogique complet
export type FamilyMemberWithRelations = FamilyMember & {
  // Relations familiales
  parents: FamilyMember[];
  children: FamilyMember[];

  // Partenariat/mariage
  partner: FamilyMember | null;

  // Métadonnées utiles pour l'affichage
  fullName: string;
  displayName: string;
  birthYear: number | null;
  deathYear: number | null;
  isAlive: boolean;
  age: number | null;

  // Coordonnées géographiques (optionnelles)
  latitude?: string | null;
  longitude?: string | null;
};

// Type pour l'arbre généalogique complet
export type FamilyTree = {
  members: FamilyMemberWithRelations[];
  relations: FamilyRelation[];
  partnerships: Partnership[];
  stats: {
    totalMembers: number;
    totalRelations: number;
    totalPartnerships: number;
    livingMembers: number;
    deceasedMembers: number;
  };
};

// Types pour les requêtes et filtres
export type FamilyMemberFilter = {
  searchTerm?: string;
  generation?: number;
  isAlive?: boolean;
  hasChildren?: boolean;
  hasPartner?: boolean;
};
