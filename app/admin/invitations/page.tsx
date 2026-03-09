"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Loader2, Mail, Clock, CheckCircle, XCircle } from "lucide-react";
import {
  createInvitation,
  getPendingInvitations,
  getAcceptedInvitations,
  getRevokedInvitations,
  type Invitation,
} from "@/lib/api/clerk";
import { toast } from "sonner";

function InvitationList({
  invitations,
  emptyLabel,
}: {
  invitations: Invitation[];
  emptyLabel: string;
}) {
  return (
    <ul className="divide-y divide-slate-200">
      {invitations.length === 0 ? (
        <li className="py-3 text-sm text-slate-500">{emptyLabel}</li>
      ) : (
        invitations.map((inv) => (
          <li key={inv.id} className="py-3 flex items-center justify-between gap-2">
            <span className="text-sm font-medium">{inv.emailAddress}</span>
            <span className="text-xs text-slate-500">
              {inv.createdAt
                ? new Date(inv.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : ""}
            </span>
          </li>
        ))
      )}
    </ul>
  );
}

export default function AdminInvitationsPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [pending, setPending] = useState<Invitation[]>([]);
  const [accepted, setAccepted] = useState<Invitation[]>([]);
  const [revoked, setRevoked] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      const [pendingRes, acceptedRes, revokedRes] = await Promise.all([
        getPendingInvitations(),
        getAcceptedInvitations(),
        getRevokedInvitations(),
      ]);
      setPending(pendingRes.data);
      setAccepted(acceptedRes.data);
      setRevoked(revokedRes.data);
    } catch (err) {
      setError("Impossible de charger les invitations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Saisissez une adresse email.");
      return;
    }
    setSending(true);
    try {
      const result = await createInvitation({
        emailAddress: trimmed,
        redirectUrl: typeof window !== "undefined" ? `${window.location.origin}/onboarding` : undefined,
      });
      if (result.ok) {
        toast.success(`Invitation envoyée à ${trimmed}`);
        setEmail("");
        await loadInvitations();
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 py-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Inviter une personne
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="invite-email" className="sr-only">
                Email
              </Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={sending}
                className="w-full"
              />
            </div>
            <Button
              type="submit"
              disabled={sending}
              className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-amber-600" />
                En attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InvitationList
                invitations={pending}
                emptyLabel="Aucune invitation en attente."
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                Acceptées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InvitationList
                invitations={accepted}
                emptyLabel="Aucune invitation acceptée."
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <XCircle className="h-4 w-4 text-slate-400" />
                Expirées / Révoquées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InvitationList
                invitations={revoked}
                emptyLabel="Aucune invitation expirée ou révoquée."
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
