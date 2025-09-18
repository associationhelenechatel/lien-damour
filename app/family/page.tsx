"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { FamilyTreeApp } from "@/components/family-tree-app";

export default function FamilyPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Accès restreint
          </h2>
          <p className="text-slate-600">
            Veuillez vous connecter pour accéder à l'arbre généalogique.
          </p>
        </div>
      </div>
    );
  }

  return <FamilyTreeApp />;
}
