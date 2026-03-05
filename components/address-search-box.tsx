"use client";

import type React from "react";
import dynamic from "next/dynamic";
import type { SearchBox } from "@mapbox/search-js-react";
import { Input } from "@/components/ui/input";

const MapboxSearchBox = dynamic(
  () =>
    import("@mapbox/search-js-react").then((mod) => mod.SearchBox),
  {
    ssr: false,
    loading: () => (
      <Input
        placeholder="Chargement de la recherche d'adresse..."
        disabled
      />
    ),
  }
);

type AddressSearchBoxProps = React.ComponentProps<typeof SearchBox>;

/**
 * SearchBox Mapbox chargé dynamiquement (SSR désactivé).
 * Utiliser ce composant partagé au lieu de dupliquer le dynamic() dans chaque formulaire.
 */
export function AddressSearchBox(props: AddressSearchBoxProps) {
  return <MapboxSearchBox {...props} />;
}
