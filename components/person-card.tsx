"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Heart, MapPin, Briefcase, Calendar, Users, Baby } from "lucide-react";

interface Person {
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

interface PersonCardProps {
  person: Person;
  familyData: Person[];
  onPersonSelect?: (personId: string) => void;
}

export function PersonCard({
  person,
  familyData,
  onPersonSelect,
}: PersonCardProps) {
  const getRelatives = () => {
    const parents = person.parents
      .map((id) => {
        const parent = familyData.find((p) => p.id === id);
        return parent ? { id: parent.id, name: parent.name } : null;
      })
      .filter(Boolean);

    const children = person.children
      .map((id) => {
        const child = familyData.find((p) => p.id === id);
        return child ? { id: child.id, name: child.name } : null;
      })
      .filter(Boolean);

    const spouse = person.spouse
      ? familyData.find((p) => p.name === person.spouse)
      : null;

    return { parents, children, spouse };
  };

  const { parents, children, spouse } = getRelatives();
  const age = person.deathYear
    ? person.deathYear - person.birthYear
    : new Date().getFullYear() - person.birthYear;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <Users className="h-8 w-8 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-balance">{person.name}</h2>
          <Badge
            variant="secondary"
            className="bg-emerald-100 text-emerald-800"
          >
            Génération {person.generation}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Basic Info */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>
            {person.birthYear}
            {person.deathYear && ` - ${person.deathYear}`}
            <span className="text-muted-foreground ml-2">
              ({age} ans{!person.deathYear && " actuellement"})
            </span>
          </span>
        </div>

        {person.occupation && (
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span>{person.occupation}</span>
          </div>
        )}

        {person.location && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{person.location}</span>
          </div>
        )}
      </div>

      <Separator />

      {/* Relations Familiales */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Relations Familiales
        </h3>

        {spouse && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Heart className="h-4 w-4 text-red-500" />
              Époux/Épouse
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-left p-2 h-auto bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
              onClick={() => onPersonSelect?.(spouse.id)}
            >
              <span className="font-medium text-red-900">{spouse.name}</span>
            </Button>
          </div>
        )}

        {parents.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4 text-blue-600" />
              Parent{parents.length > 1 ? "s" : ""} ({parents.length})
            </div>
            <div className="grid gap-1">
              {parents.map((parent) => (
                <Button
                  key={parent.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left p-2 h-auto bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                  onClick={() => onPersonSelect?.(parent.id)}
                >
                  <span className="font-medium text-blue-900">
                    {parent.name}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {children.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Baby className="h-4 w-4 text-emerald-600" />
              Enfant{children.length > 1 ? "s" : ""} ({children.length})
            </div>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {children.map((child) => (
                <Button
                  key={child.id}
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0 px-3 py-1 h-auto bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors text-xs"
                  onClick={() => onPersonSelect?.(child.id)}
                >
                  <span className="font-medium text-emerald-900">
                    {child.name}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {parents.length === 0 && children.length === 0 && !spouse && (
          <div className="text-center py-4 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune relation familiale enregistrée</p>
          </div>
        )}
      </div>
    </div>
  );
}
