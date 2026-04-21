/**
 * Types basés sur le schéma Drizzle ORM
 */

import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { familyMember, familyRelation, partnership, project } from "@/drizzle/schema";

// Types de base générés automatiquement par Drizzle
export type FamilyMember = InferSelectModel<typeof familyMember>;
export type FamilyRelation = InferSelectModel<typeof familyRelation>;
export type Partnership = InferSelectModel<typeof partnership>;
export type Project = InferSelectModel<typeof project>;

/** Projet avec URL de logo résolue côté serveur (affichage sans `NEXT_PUBLIC_*`). */
export type ProjectWithLogoDisplay = Project & {
  logoDisplayUrl: string | null;
};

// Types pour l'insertion (création de nouvelles entrées)
export type NewFamilyMember = InferInsertModel<typeof familyMember>;
export type NewFamilyRelation = InferInsertModel<typeof familyRelation>;
export type NewPartnership = InferInsertModel<typeof partnership>;
export type NewProject = InferInsertModel<typeof project>;

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

  /** Photo profil Clerk si le compte a `publicMetadata.familyMemberId` (hors base). */
  clerkProfileImageUrl: string | null;

  /** URL affichée : image R2 (`picture_id`) si disponible, sinon Clerk. */
  profileImageUrl: string | null;
};

// Type pour l'arbre généalogique complet
export type FamilyTree = {
  members: FamilyMemberWithRelations[];
  relations: FamilyRelation[];
  partnerships: Partnership[];
};

// Types pour les requêtes et filtres
export type FamilyMemberFilter = {
  searchTerm?: string;
  generation?: number;
  isAlive?: boolean;
  hasChildren?: boolean;
  hasPartner?: boolean;
};
