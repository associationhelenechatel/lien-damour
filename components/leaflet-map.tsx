"use client";
import dynamic from "next/dynamic";

const LeafletMapComponent = dynamic(() => import("./simple-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-slate-600">Chargement de la carte...</p>
      </div>
    </div>
  ),
});

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

interface LeafletMapProps {
  familyData: Person[];
  selectedPerson?: string | null;
  onPersonSelect?: (personId: string) => void;
}

export function LeafletMap(props: LeafletMapProps) {
  return <LeafletMapComponent {...props} />;
}
