export interface FamilyMember {
  id: string;
  name: string;
  birthYear?: number;
  location?: string;
  occupation?: string;
  father?: string; // ID of father
  mother?: string; // ID of mother
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
  },
  {
    id: "2",
    name: "Mary Smith",
    birthYear: 1943,
    location: "San Francisco, CA",
    occupation: "Retired Teacher",
  },

  // Parents
  {
    id: "3",
    name: "David Smith",
    birthYear: 1970,
    location: "San Francisco, CA",
    occupation: "Software Engineer",
    father: "1", // Son of Robert
    mother: "2", // Son of Mary
  },
  {
    id: "4",
    name: "Sarah Smith",
    birthYear: 1972,
    location: "San Francisco, CA",
    occupation: "Marketing Director",
  },

  // Current Generation
  {
    id: "5",
    name: "John Smith",
    birthYear: 1995,
    location: "San Francisco, CA",
    occupation: "Product Manager",
    father: "3", // Son of David
    mother: "4", // Son of Sarah
  },
  {
    id: "6",
    name: "Emily Smith",
    birthYear: 1997,
    location: "San Francisco, CA",
    occupation: "Graphic Designer",
  },

  // Children
  {
    id: "7",
    name: "Emma Smith",
    birthYear: 2022,
    location: "San Francisco, CA",
    father: "5", // Daughter of John
    mother: "6", // Daughter of Emily
  },
  {
    id: "8",
    name: "Oliver Smith",
    birthYear: 2020,
    location: "San Francisco, CA",
    father: "5", // Son of John
    mother: "6", // Son of Emily
  },
  {
    id: "9",
    name: "Olivia Smith",
    birthYear: 2024,
    location: "San Francisco, CA",
    father: "5", // Daughter of John
    mother: "6", // Daughter of Emily
  },

  // David's second wife
  {
    id: "10",
    name: "Lisa Smith",
    birthYear: 1975,
    location: "San Francisco, CA",
    occupation: "Architect",
  },

  // Child from David's second marriage
  {
    id: "11",
    name: "Michael Smith",
    birthYear: 2018,
    location: "San Francisco, CA",
    father: "3", // Son of David
    mother: "10", // Son of Lisa
  },

  // More children of Robert and Mary Smith
  {
    id: "12",
    name: "Linda Smith Johnson",
    birthYear: 1968,
    location: "Portland, OR",
    occupation: "Nurse",
    father: "1", // Daughter of Robert
    mother: "2", // Daughter of Mary
  },
  {
    id: "13",
    name: "Robert Smith Jr.",
    birthYear: 1965,
    location: "Seattle, WA",
    occupation: "Architect",
    father: "1", // Son of Robert
    mother: "2", // Son of Mary
  },
  {
    id: "14",
    name: "Patricia Smith Williams",
    birthYear: 1973,
    location: "Los Angeles, CA",
    occupation: "Teacher",
    father: "1", // Daughter of Robert
    mother: "2", // Daughter of Mary
  },

  // Spouses of Robert and Mary's children
  {
    id: "15",
    name: "James Johnson",
    birthYear: 1966,
    location: "Portland, OR",
    occupation: "Firefighter",
  },
  {
    id: "16",
    name: "Margaret Smith",
    birthYear: 1967,
    location: "Seattle, WA",
    occupation: "Doctor",
  },
  {
    id: "17",
    name: "Thomas Williams",
    birthYear: 1971,
    location: "Los Angeles, CA",
    occupation: "Engineer",
  },

  // Linda and James Johnson's children
  {
    id: "18",
    name: "Amanda Johnson",
    birthYear: 1992,
    location: "Portland, OR",
    occupation: "Graphic Designer",
    father: "15", // Daughter of James
    mother: "12", // Daughter of Linda
  },
  {
    id: "19",
    name: "Ryan Johnson",
    birthYear: 1994,
    location: "Portland, OR",
    occupation: "Software Developer",
    father: "15", // Son of James
    mother: "12", // Son of Linda
  },
  {
    id: "20",
    name: "Jessica Johnson",
    birthYear: 1996,
    location: "Portland, OR",
    occupation: "Student",
    father: "15", // Daughter of James
    mother: "12", // Daughter of Linda
  },

  // Robert Jr. and Margaret Smith's children
  {
    id: "21",
    name: "Kevin Smith",
    birthYear: 1990,
    location: "Seattle, WA",
    occupation: "Lawyer",
    father: "13", // Son of Robert Jr.
    mother: "16", // Son of Margaret
  },
  {
    id: "22",
    name: "Nicole Smith",
    birthYear: 1993,
    location: "Seattle, WA",
    occupation: "Pharmacist",
    father: "13", // Daughter of Robert Jr.
    mother: "16", // Daughter of Margaret
  },
  {
    id: "23",
    name: "Brandon Smith",
    birthYear: 1995,
    location: "Seattle, WA",
    occupation: "Chef",
    father: "13", // Son of Robert Jr.
    mother: "16", // Son of Margaret
  },
  {
    id: "24",
    name: "Ashley Smith",
    birthYear: 1998,
    location: "Seattle, WA",
    occupation: "Student",
    father: "13", // Daughter of Robert Jr.
    mother: "16", // Daughter of Margaret
  },

  // Patricia and Thomas Williams's children
  {
    id: "25",
    name: "Daniel Williams",
    birthYear: 2000,
    location: "Los Angeles, CA",
    occupation: "Student",
    father: "17", // Son of Thomas
    mother: "14", // Son of Patricia
  },
  {
    id: "26",
    name: "Stephanie Williams",
    birthYear: 2002,
    location: "Los Angeles, CA",
    father: "17", // Daughter of Thomas
    mother: "14", // Daughter of Patricia
  },
  {
    id: "27",
    name: "Christopher Williams",
    birthYear: 2004,
    location: "Los Angeles, CA",
    father: "17", // Son of Thomas
    mother: "14", // Son of Patricia
  },

  // Spouses for the next generation
  {
    id: "28",
    name: "Rachel Davis",
    birthYear: 1991,
    location: "Portland, OR",
    occupation: "Marketing Manager",
  },
  {
    id: "29",
    name: "Mark Chen",
    birthYear: 1992,
    location: "Seattle, WA",
    occupation: "Data Scientist",
  },
  {
    id: "30",
    name: "Samantha Rodriguez",
    birthYear: 1989,
    location: "Seattle, WA",
    occupation: "Veterinarian",
  },

  // Amanda and Rachel's children (adopted)
  {
    id: "31",
    name: "Lily Johnson-Davis",
    birthYear: 2018,
    location: "Portland, OR",
    mother: "18", // Daughter of Amanda
    father: "28", // Daughter of Rachel (using father field for same-sex couple)
  },
  {
    id: "32",
    name: "Noah Johnson-Davis",
    birthYear: 2020,
    location: "Portland, OR",
    mother: "18", // Son of Amanda
    father: "28", // Son of Rachel (using father field for same-sex couple)
  },

  // Nicole and Mark Chen's children
  {
    id: "33",
    name: "Grace Chen",
    birthYear: 2019,
    location: "Seattle, WA",
    father: "29", // Daughter of Mark
    mother: "22", // Daughter of Nicole
  },
  {
    id: "34",
    name: "Ethan Chen",
    birthYear: 2021,
    location: "Seattle, WA",
    father: "29", // Son of Mark
    mother: "22", // Son of Nicole
  },

  // Kevin and Samantha's children
  {
    id: "35",
    name: "Isabella Rodriguez-Smith",
    birthYear: 2017,
    location: "Seattle, WA",
    father: "21", // Daughter of Kevin
    mother: "30", // Daughter of Samantha
  },
  {
    id: "36",
    name: "Alexander Rodriguez-Smith",
    birthYear: 2019,
    location: "Seattle, WA",
    father: "21", // Son of Kevin
    mother: "30", // Son of Samantha
  },

  // Additional family members - distant relatives
  {
    id: "37",
    name: "Catherine Smith",
    birthYear: 1963,
    location: "Denver, CO",
    occupation: "Retired Librarian",
    father: "1", // Daughter of Robert (another child)
    mother: "2", // Daughter of Mary
  },
  {
    id: "38",
    name: "Michael O'Brien",
    birthYear: 1961,
    location: "Denver, CO",
    occupation: "Retired Police Officer",
  },
  {
    id: "39",
    name: "Susan O'Brien",
    birthYear: 1988,
    location: "Denver, CO",
    occupation: "Social Worker",
    father: "38", // Daughter of Michael O'Brien
    mother: "37", // Daughter of Catherine
  },
  {
    id: "40",
    name: "Peter O'Brien",
    birthYear: 1991,
    location: "Denver, CO",
    occupation: "Mechanic",
    father: "38", // Son of Michael O'Brien
    mother: "37", // Son of Catherine
  },

  // More young adults
  {
    id: "41",
    name: "Melissa Taylor",
    birthYear: 1997,
    location: "San Francisco, CA",
    occupation: "Artist",
  },
  {
    id: "42",
    name: "Jacob Martinez",
    birthYear: 1999,
    location: "Portland, OR",
    occupation: "Musician",
  },

  // Ryan and Jacob's children (same-sex couple)
  {
    id: "43",
    name: "Sophie Martinez-Johnson",
    birthYear: 2022,
    location: "Portland, OR",
    father: "19", // Daughter of Ryan
    mother: "42", // Daughter of Jacob (using mother field for same-sex couple)
  },

  // John and Melissa's additional child
  {
    id: "44",
    name: "Lucas Smith-Taylor",
    birthYear: 2019,
    location: "San Francisco, CA",
    father: "5", // Son of John
    mother: "41", // Son of Melissa (second relationship)
  },

  // More extended family
  {
    id: "45",
    name: "George Smith",
    birthYear: 1961,
    location: "Austin, TX",
    occupation: "Retired Engineer",
    father: "1", // Son of Robert (another child)
    mother: "2", // Son of Mary
  },
  {
    id: "46",
    name: "Helen Garcia",
    birthYear: 1963,
    location: "Austin, TX",
    occupation: "Retired Teacher",
  },
  {
    id: "47",
    name: "Maria Garcia-Smith",
    birthYear: 1987,
    location: "Austin, TX",
    occupation: "Nurse Practitioner",
    father: "45", // Daughter of George
    mother: "46", // Daughter of Helen
  },
  {
    id: "48",
    name: "Carlos Garcia-Smith",
    birthYear: 1989,
    location: "Austin, TX",
    occupation: "IT Specialist",
    father: "45", // Son of George
    mother: "46", // Son of Helen
  },
  {
    id: "49",
    name: "Elena Garcia-Smith",
    birthYear: 1992,
    location: "Austin, TX",
    occupation: "Journalist",
    father: "45", // Daughter of George
    mother: "46", // Daughter of Helen
  },

  // Elena's partner and child
  {
    id: "50",
    name: "David Kim",
    birthYear: 1990,
    location: "Austin, TX",
    occupation: "Software Engineer",
  },
  {
    id: "51",
    name: "Emma Kim-Garcia",
    birthYear: 2020,
    location: "Austin, TX",
    father: "50", // Daughter of David Kim
    mother: "49", // Daughter of Elena
  },
];
