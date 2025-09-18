"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, MapPin, ChevronDown, ChevronRight, Users, TreePine } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface Person {
  id: string
  name: string
  birthYear: number
  deathYear?: number
  generation: number
  parents: string[]
  children: string[]
  spouse?: string
  occupation?: string
  location?: string
}

interface FamilyTreeProps {
  familyData: Person[]
  onPersonSelect: (id: string) => void
  selectedPerson: string | null
}

interface FamilyBranch {
  patriarch: Person
  descendants: Person[]
  totalMembers: number
  generations: number
}

export default function FamilyTree({ familyData, onPersonSelect, selectedPerson }: FamilyTreeProps) {
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set())

  const familyBranches = useMemo(() => {
    const branches: FamilyBranch[] = []

    // Find patriarchs/matriarchs (people with no parents)
    const ancestors = familyData.filter((person) => person.parents.length === 0)

    ancestors.forEach((ancestor) => {
      const descendants = getDescendants(ancestor.id, familyData)
      const allMembers = [ancestor, ...descendants]
      const generations = Math.max(...allMembers.map((p) => p.generation)) - ancestor.generation + 1

      branches.push({
        patriarch: ancestor,
        descendants,
        totalMembers: allMembers.length,
        generations,
      })
    })

    return branches.sort((a, b) => b.totalMembers - a.totalMembers)
  }, [familyData])

  function getDescendants(personId: string, allPeople: Person[]): Person[] {
    const descendants: Person[] = []
    const person = allPeople.find((p) => p.id === personId)

    if (person) {
      person.children.forEach((childId) => {
        const child = allPeople.find((p) => p.id === childId)
        if (child) {
          descendants.push(child)
          descendants.push(...getDescendants(childId, allPeople))
        }
      })
    }

    return descendants
  }

  const toggleBranch = (branchId: string) => {
    const newExpanded = new Set(expandedBranches)
    if (newExpanded.has(branchId)) {
      newExpanded.delete(branchId)
    } else {
      newExpanded.add(branchId)
    }
    setExpandedBranches(newExpanded)
  }

  const toggleAllBranches = () => {
    if (expandedBranches.size === familyBranches.length) {
      setExpandedBranches(new Set())
    } else {
      setExpandedBranches(new Set(familyBranches.map((branch) => branch.patriarch.id)))
    }
  }

  const groupByGeneration = (people: Person[], baseGeneration: number) => {
    const groups: { [key: number]: Person[] } = {}
    people.forEach((person) => {
      const relativeGen = person.generation - baseGeneration
      if (!groups[relativeGen]) {
        groups[relativeGen] = []
      }
      groups[relativeGen].push(person)
    })
    return groups
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {familyBranches.length} branche{familyBranches.length > 1 ? "s" : ""} familiale
          {familyBranches.length > 1 ? "s" : ""} • {familyData.length} membres
        </div>
        <Button variant="outline" size="sm" onClick={toggleAllBranches} className="text-xs bg-transparent">
          {expandedBranches.size === familyBranches.length ? "Tout réduire" : "Tout développer"}
        </Button>
      </div>

      {familyBranches.map((branch) => {
        const isExpanded = expandedBranches.has(branch.patriarch.id)
        const generationGroups = groupByGeneration(
          [branch.patriarch, ...branch.descendants],
          branch.patriarch.generation,
        )

        return (
          <Collapsible
            key={branch.patriarch.id}
            open={isExpanded}
            onOpenChange={() => toggleBranch(branch.patriarch.id)}
          >
            <Card className="overflow-hidden">
              <CollapsibleTrigger asChild>
                <div className="w-full p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div className="flex items-center gap-2">
                        <TreePine className="h-4 w-4 text-primary" />
                        <div>
                          <div className="font-medium text-sm">{branch.patriarch.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {branch.patriarch.birthYear}
                            {branch.patriarch.deathYear && ` - ${branch.patriarch.deathYear}`}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {branch.totalMembers} membre{branch.totalMembers > 1 ? "s" : ""}
                      </div>
                      <div>
                        {branch.generations} génération{branch.generations > 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="px-4 pb-4 space-y-4">
                  {Object.entries(generationGroups)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([relativeGen, people]) => {
                      const genNumber = Number(relativeGen)
                      const genLabel =
                        genNumber === 0
                          ? "Ancêtre"
                          : genNumber === 1
                            ? "Enfants"
                            : genNumber === 2
                              ? "Petits-enfants"
                              : genNumber === 3
                                ? "Arrière-petits-enfants"
                                : `Génération +${genNumber}`

                      return (
                        <div key={relativeGen} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {genLabel}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {people.length} personne{people.length > 1 ? "s" : ""}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 ml-4">
                            {people.map((person) => {
                              const isSelected = selectedPerson === person.id

                              return (
                                <Card
                                  key={person.id}
                                  className={`cursor-pointer transition-all duration-200 hover:shadow-sm border ${
                                    isSelected
                                      ? "ring-1 ring-primary bg-primary/5 border-primary"
                                      : "hover:border-primary/30"
                                  }`}
                                  onClick={() => onPersonSelect(person.id)}
                                >
                                  <div className="p-3 space-y-2">
                                    <div className="space-y-1">
                                      <h3 className="font-medium text-sm leading-tight line-clamp-1">{person.name}</h3>
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <span>
                                          {person.birthYear}
                                          {person.deathYear && ` - ${person.deathYear}`}
                                        </span>
                                        {person.deathYear && (
                                          <span className="text-xs">({person.deathYear - person.birthYear} ans)</span>
                                        )}
                                      </div>
                                    </div>

                                    {(person.occupation || person.location) && (
                                      <div className="space-y-1">
                                        {person.occupation && (
                                          <p className="text-xs font-medium text-secondary line-clamp-1">
                                            {person.occupation}
                                          </p>
                                        )}
                                        {person.location && (
                                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                                            <span className="line-clamp-1">{person.location}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {(person.spouse || person.children.length > 0) && (
                                      <div className="pt-1 border-t space-y-1">
                                        {person.spouse && (
                                          <div className="flex items-center gap-1 text-xs">
                                            <Heart className="h-2.5 w-2.5 text-accent flex-shrink-0" />
                                            <span className="text-muted-foreground line-clamp-1">{person.spouse}</span>
                                          </div>
                                        )}
                                        {person.children.length > 0 && (
                                          <div className="text-xs text-muted-foreground">
                                            {person.children.length} enfant{person.children.length > 1 ? "s" : ""}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </Card>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )
      })}
    </div>
  )
}

export { FamilyTree }
