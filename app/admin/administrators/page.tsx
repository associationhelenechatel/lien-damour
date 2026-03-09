"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Shield, ShieldPlus, ShieldMinus, Search } from "lucide-react";
import {
  getAdminsForList,
  searchNonAdminUsers,
  addAdmin,
  removeAdmin,
  type UserForAdminList,
} from "@/lib/api/admin";
import { toast } from "sonner";

const SEARCH_DEBOUNCE_MS = 300;

export default function AdminAdministratorsPage() {
  const [admins, setAdmins] = useState<UserForAdminList[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserForAdminList[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const loadAdmins = useCallback(async () => {
    try {
      setAdminsLoading(true);
      setError(null);
      const list = await getAdminsForList();
      setAdmins(list);
    } catch (err) {
      setError("Impossible de charger les administrateurs");
      console.error(err);
    } finally {
      setAdminsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  // Recherche avec debounce
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const results = await searchNonAdminUsers(q);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handlePromote = async (user: UserForAdminList) => {
    setActingId(user.id);
    try {
      const result = await addAdmin(user.id);
      if (result.ok) {
        toast.success(`${user.displayName} est maintenant admin`);
        await loadAdmins();
        setSearchQuery("");
        setSearchResults([]);
      } else {
        toast.error(result.error);
      }
    } finally {
      setActingId(null);
    }
  };

  const handleRevoke = async (user: UserForAdminList) => {
    setActingId(user.id);
    try {
      const result = await removeAdmin(user.id);
      if (result.ok) {
        toast.success("Droits admin retirés");
        await loadAdmins();
      } else {
        toast.error(result.error);
      }
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-8 py-6">
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Section 1 : Liste complète des admins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Administrateurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            Liste de tous les comptes ayant accès au panneau d’administration.
          </p>
          {adminsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : admins.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">
              Aucun administrateur pour le moment.
            </p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {admins.map((user) => {
                const busy = actingId === user.id;
                return (
                  <li
                    key={user.id}
                    className="py-3 flex flex-wrap items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <span className="font-medium text-slate-900">
                        {user.displayName}
                      </span>
                      <span className="text-slate-500 text-sm ml-2">
                        {user.email}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => handleRevoke(user)}
                      className="border-red-200 text-red-700 hover:bg-red-50 shrink-0"
                    >
                      {busy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <ShieldMinus className="h-4 w-4 mr-1" />
                          Retirer
                        </>
                      )}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Section 2 : Promouvoir un utilisateur (recherche) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldPlus className="h-5 w-5 text-emerald-600" />
            Promouvoir un utilisateur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            Recherchez par nom ou adresse email (min. 2 caractères).
          </p>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Label htmlFor="search-user" className="sr-only">
                Rechercher un utilisateur
              </Label>
              <Input
                id="search-user"
                type="search"
                placeholder="Nom ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {searchQuery.trim().length >= 2 && (
              <div className="min-h-[80px]">
                {searching ? (
                  <div className="flex items-center gap-2 py-4 text-slate-500 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Recherche...
                  </div>
                ) : searchResults.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4">
                    Aucun compte trouvé (hors admins).
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-100 rounded-md border border-slate-200 bg-slate-50/50">
                    {searchResults.map((user) => {
                      const busy = actingId === user.id;
                      return (
                        <li
                          key={user.id}
                          className="px-3 py-2 flex flex-wrap items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <span className="font-medium text-slate-900">
                              {user.displayName}
                            </span>
                            <span className="text-slate-500 text-sm ml-2">
                              {user.email}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            disabled={busy}
                            onClick={() => handlePromote(user)}
                            className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
                          >
                            {busy ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <ShieldPlus className="h-4 w-4 mr-1" />
                                Promouvoir
                              </>
                            )}
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
