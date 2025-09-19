export interface Person {
  id: string;
  name: string;
  birthYear: number;
  deathYear?: number;
  generation: number;
  parents: string[];
  children: string[];
  spouse?: string;
  occupation?: string;
  location?: string;
}
