export interface FamilyMember {
  id: string;
  name: string;
  birthYear?: number;
  location?: string;
  occupation?: string;
  spouse?: string; // ID of spouse
  children?: string[]; // Array of child IDs
  bio?: string;
}

export const familyData: FamilyMember[] = [
  // Grandparents
  {
    id: "1",
    name: "Robert Smith",
    birthYear: 1940,
    location: "San Francisco, CA",
    occupation: "Retired Engineer",
    spouse: "2",
    children: ["3"],
  },
  {
    id: "2",
    name: "Mary Smith",
    birthYear: 1943,
    location: "San Francisco, CA",
    occupation: "Retired Teacher",
    spouse: "1",
    children: ["3"],
  },

  // Parents
  {
    id: "3",
    name: "David Smith",
    birthYear: 1970,
    location: "San Francisco, CA",
    occupation: "Software Engineer",
    spouse: "4",
    children: ["5"],
  },
  {
    id: "4",
    name: "Sarah Smith",
    birthYear: 1972,
    location: "San Francisco, CA",
    occupation: "Marketing Director",
    spouse: "3",
    children: ["5"],
  },

  // Current Generation
  {
    id: "5",
    name: "John Smith",
    birthYear: 1995,
    location: "San Francisco, CA",
    occupation: "Product Manager",
    spouse: "6",
    children: ["7", "8", "9"],
  },
  {
    id: "6",
    name: "Emily Smith",
    birthYear: 1997,
    location: "San Francisco, CA",
    occupation: "Graphic Designer",
    spouse: "5",
    children: ["7", "8", "9"],
  },

  // Children
  {
    id: "7",
    name: "Emma Smith",
    birthYear: 2022,
    location: "San Francisco, CA",
  },
  {
    id: "8",
    name: "Oliver Smith",
    birthYear: 2020,
    location: "San Francisco, CA",
  },
  {
    id: "9",
    name: "Olivia Smith",
    birthYear: 2024,
    location: "San Francisco, CA",
  },
];
