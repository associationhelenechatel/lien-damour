import * as schema from "@/drizzle/schema";

type MemberInsert = typeof schema.familyMember.$inferInsert;
export type MemberWithSeedId = MemberInsert & { id: number };

export type FamilyRelationSeed = {
  parentId: number;
  childId: number;
  relationType: string;
};

export type PartnershipSeed = {
  partner1Id: number;
  partner2Id: number;
  startDate: string | null;
  endDate: string | null;
};

const FIRST_NAMES_M = [
  "Jean", "Pierre", "Paul", "Luc", "Marc", "Thomas", "Nicolas", "Antoine",
  "Julien", "François", "Henri", "Louis", "Charles", "Olivier", "David",
  "Sébastien", "Alexandre", "Maxime", "Romain", "Baptiste", "Gabriel",
  "Hugo", "Arthur", "Léo", "Noah", "Adam", "Ethan", "Tom", "Nathan",
  "Théo", "Mathis", "Raphaël", "Jules", "Aaron", "Axel", "Eliott",
  "Gaspard", "Simon", "Valentin", "Victor", "William", "Yann", "Édouard",
  "Félix", "Guillaume", "Hector", "Ivan", "Jérémy", "Kilian",
] as const;

const FIRST_NAMES_F = [
  "Marie", "Sophie", "Emma", "Léa", "Chloé", "Camille", "Julie", "Laura",
  "Sarah", "Claire", "Anne", "Isabelle", "Nathalie", "Céline", "Valérie",
  "Hélène", "Patricia", "Sandrine", "Stéphanie", "Caroline", "Émilie",
  "Pauline", "Charlotte", "Manon", "Lucie", "Inès", "Zoé", "Lola", "Alice",
  "Rose", "Anna", "Eva", "Nina", "Luna", "Mia", "Lily", "Julia", "Elena",
  "Clara", "Margaux", "Louise", "Jeanne", "Margot", "Élise", "Amélie",
  "Bérénice", "Coralie", "Diane", "Éléonore", "Florence", "Gaëlle",
] as const;

const CITIES = [
  {
    address: "12 Rue de Rivoli, 75004 Paris, France",
    latitude: "48.8578",
    longitude: "2.3582",
    mapboxPlaceId: "seed_paris",
  },
  {
    address: "5 Place Bellecour, 69002 Lyon, France",
    latitude: "45.7578",
    longitude: "4.8320",
    mapboxPlaceId: "seed_lyon",
  },
  {
    address: "3 Quai du Port, 13002 Marseille, France",
    latitude: "43.2965",
    longitude: "5.3698",
    mapboxPlaceId: "seed_marseille",
  },
  {
    address: "8 Place du Capitole, 31000 Toulouse, France",
    latitude: "43.6047",
    longitude: "1.4442",
    mapboxPlaceId: "seed_toulouse",
  },
  {
    address: "4 Place Royale, 44000 Nantes, France",
    latitude: "47.2184",
    longitude: "-1.5536",
    mapboxPlaceId: "seed_nantes",
  },
  {
    address: "1 Place de la Comédie, 34000 Montpellier, France",
    latitude: "43.6108",
    longitude: "3.8767",
    mapboxPlaceId: "seed_montpellier",
  },
] as const;

const TARGET_COUNT = 100;

/** Probabilité qu’un descendant (hors 1re génération) reste sans conjoint. */
const P_SINGLE_NO_SPOUSE = 0.12;

function pickCity(i: number) {
  return CITIES[i % CITIES.length]!;
}

function isoDate(year: number, month1to12: number, day1to28: number) {
  const m = ((month1to12 - 1) % 12) + 1;
  const d = ((day1to28 - 1) % 28) + 1;
  return `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

type Couple = { p1: number; p2: number; branchCode: string };

function buildHundredMemberSeed(): {
  familyMembers: MemberWithSeedId[];
  familyRelations: FamilyRelationSeed[];
  partnerships: PartnershipSeed[];
} {
  const familyMembers: MemberWithSeedId[] = [];
  const familyRelations: FamilyRelationSeed[] = [];
  const partnerships: PartnershipSeed[] = [];

  let nameIdx = 0;

  const addMember = (
    partial: Partial<Omit<MemberInsert, "id">> & { code: string }
  ): number => {
    const id = familyMembers.length + 1;
    const city = pickCity(id);
    const gender = partial.gender ?? "M";
    const firstName =
      partial.firstName ??
      (gender === "F"
        ? FIRST_NAMES_F[nameIdx % FIRST_NAMES_F.length]!
        : FIRST_NAMES_M[nameIdx % FIRST_NAMES_M.length]!);
    nameIdx++;

    familyMembers.push({
      id,
      firstName,
      lastName: partial.lastName ?? "Moreau",
      maidenName: partial.maidenName ?? null,
      gender,
      birthDate: partial.birthDate ?? null,
      deathDate: partial.deathDate ?? null,
      address: partial.address ?? city.address,
      latitude: partial.latitude ?? city.latitude,
      longitude: partial.longitude ?? city.longitude,
      mapboxPlaceId: partial.mapboxPlaceId ?? city.mapboxPlaceId,
      phone:
        partial.phone ??
        (id % 3 === 0
          ? null
          : `+33 ${6 + (id % 4)} ${10 + (id % 80)} ${20 + (id % 70)} ${30 + (id % 60)} ${40 + (id % 50)}`),
      mail: partial.mail ?? (id % 5 === 0 ? null : `membre.${id}@example.com`),
      code: partial.code!,
    });
    return id;
  };

  const linkChild = (parentId: number, childId: number) => {
    familyRelations.push({
      parentId,
      childId,
      relationType: "bio",
    });
  };

  const linkPartners = (a: number, b: number) => {
    partnerships.push({
      partner1Id: a,
      partner2Id: b,
      startDate: "1970-01-15",
      endDate: null,
    });
  };

  const root = addMember({
    code: "0",
    firstName: "Hélène",
    lastName: "Moreau",
    maidenName: "Leroy",
    gender: "F",
    birthDate: "1920-05-15",
    deathDate: "1993-03-20",
    phone: null,
    mail: null,
  });
  const rootSpouse = addMember({
    code: "0.0",
    firstName: "Henri",
    lastName: "Moreau",
    gender: "M",
    birthDate: "1918-11-03",
    deathDate: "1988-09-12",
    phone: null,
    mail: null,
  });
  linkPartners(root, rootSpouse);

  let couples: Couple[] = [];

  const rootChildCount = randInt(3, 5);
  for (let i = 1; i <= rootChildCount && familyMembers.length < TARGET_COUNT; i++) {
    const code = String(i);
    const y = 1945 + ((i - 1) % 5) + randInt(-2, 2);
    const child = addMember({
      code,
      gender: i % 2 === 1 ? "M" : "F",
      birthDate: isoDate(y, 1 + (i % 12), 5 + i),
    });
    linkChild(root, child);
    linkChild(rootSpouse, child);

    if (familyMembers.length >= TARGET_COUNT) break;

    const spouseCode = `${code}.0`;
    const spouse = addMember({
      code: spouseCode,
      gender: i % 2 === 1 ? "F" : "M",
      lastName: i % 2 === 1 ? "Bernard" : "Moreau",
      birthDate: isoDate(
        y + 1 + randInt(0, 1),
        2 + (i % 11),
        3 + (i % 25)
      ),
    });
    linkPartners(child, spouse);
    couples.push({
      p1: i % 2 === 1 ? child : spouse,
      p2: i % 2 === 1 ? spouse : child,
      branchCode: code,
    });
  }

  while (familyMembers.length < TARGET_COUNT && couples.length > 0) {
    const nextCouples: Couple[] = [];
    for (const { p1, p2, branchCode } of couples) {
      if (familyMembers.length >= TARGET_COUNT) break;

      const parentBirthYear = parseInt(
        familyMembers[p1 - 1]!.birthDate?.slice(0, 4) ?? "1970",
        10
      );
      const maxKids = Math.min(4, TARGET_COUNT - familyMembers.length);
      const numKids =
        familyMembers.length > TARGET_COUNT - 8
          ? Math.min(maxKids, TARGET_COUNT - familyMembers.length)
          : randInt(1, Math.max(1, maxKids));

      for (let j = 1; j <= numKids && familyMembers.length < TARGET_COUNT; j++) {
        const childCode = `${branchCode}.${j}`;
        const childYear = Math.min(
          2020,
          parentBirthYear + 20 + randInt(0, 12) + j * 2
        );
        const child = addMember({
          code: childCode,
          gender: j % 2 === 1 ? "M" : "F",
          birthDate: isoDate(
            childYear,
            ((j + branchCode.length + randInt(0, 2)) % 12) + 1,
            (j % 28) + 1
          ),
        });
        linkChild(p1, child);
        linkChild(p2, child);

        if (familyMembers.length >= TARGET_COUNT) break;

        const singleKid = Math.random() < P_SINGLE_NO_SPOUSE;
        if (singleKid) continue;

        if (familyMembers.length >= TARGET_COUNT) break;

        const spouseCode = `${childCode}.0`;
        const spouse = addMember({
          code: spouseCode,
          gender: j % 2 === 1 ? "F" : "M",
          lastName: j % 2 === 1 ? "Dubois" : "Moreau",
          birthDate: isoDate(
            childYear + 1 + randInt(0, 2),
            ((j + 3) % 12) + 1,
            ((j + 2) % 28) + 1
          ),
        });
        linkPartners(child, spouse);
        nextCouples.push({
          p1: j % 2 === 1 ? child : spouse,
          p2: j % 2 === 1 ? spouse : child,
          branchCode: childCode,
        });
      }
    }
    couples = nextCouples;
  }

  let fillIdx = 0;
  while (familyMembers.length < TARGET_COUNT) {
    fillIdx++;
    const code = `+${fillIdx}`;
    const py = Math.max(
      parseInt(familyMembers[0]!.birthDate?.slice(0, 4) ?? "1920", 10),
      parseInt(familyMembers[1]!.birthDate?.slice(0, 4) ?? "1918", 10)
    );
    const c = addMember({
      code,
      gender: Math.random() < 0.5 ? "M" : "F",
      birthDate: isoDate(Math.min(2000, py + 28 + (fillIdx % 12)), 3 + (fillIdx % 10), 10),
    });
    linkChild(root, c);
    linkChild(rootSpouse, c);
  }

  if (familyMembers.length !== TARGET_COUNT) {
    throw new Error(
      `Seed: attendu ${TARGET_COUNT} membres, obtenu ${familyMembers.length}.`
    );
  }

  return {
    familyMembers,
    familyRelations,
    partnerships: partnerships as PartnershipSeed[],
  };
}

const built = buildHundredMemberSeed();

export const familyMembers: MemberWithSeedId[] = built.familyMembers;
export const familyRelations: Array<typeof schema.familyRelation.$inferInsert> =
  built.familyRelations;
export const partnerships: Array<typeof schema.partnership.$inferInsert> =
  built.partnerships;
