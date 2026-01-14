"use client";

import { useEffect, useState } from "react";
import { useUser, useSession } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, User, Calendar, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import type { FamilyMemberWithRelations } from "@/lib/types";
import { DatePicker } from "@/components/ui/date-picker";

interface FamilyMember {
  id: number;
  firstName: string;
  lastName: string | null;
  maidenName: string | null;
  birthDate: string | null;
  address: string | null;
  phone: string | null;
  mail: string | null;
  code: string | null;
}

export default function OnboardingForm({
  familyMembers,
}: {
  familyMembers: FamilyMemberWithRelations[];
}) {
  const { user, isLoaded } = useUser();
  const { session } = useSession();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Formulaire
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  // Mettre à jour les infos du membre sélectionné
  useEffect(() => {
    if (selectedMemberId) {
      const member = familyMembers.find(
        (m) => m.id === parseInt(selectedMemberId)
      );
      if (member) {
        // Pré-remplir avec les données existantes
        setFirstName(user?.firstName || member.firstName || "");
        setLastName(user?.lastName || member.lastName || "");
        setBirthDate(member.birthDate ? new Date(member.birthDate) : undefined);
        setAddress(member.address || "");
        setPhone(member.phone || "");
      }
    }
  }, [selectedMemberId, familyMembers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMemberId) {
      toast.error("Veuillez sélectionner un membre de la famille");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          familyMemberId: parseInt(selectedMemberId),
          firstName,
          lastName,
          birthDate: birthDate?.toLocaleDateString("fr-FR") || null,
          address: address || null,
          phone: phone,
          mail: user?.emailAddresses[0]?.emailAddress || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de l'onboarding");
      }

      toast.success("Onboarding complété avec succès !");

      // Forcer Clerk à regénérer le JWT avec les nouvelles publicMetadata
      // Cela met à jour les sessionClaims dans le middleware
      await session?.reload();

      // Maintenant le middleware verra le nouveau familyMemberId
      router.push("/family");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'onboarding"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="container max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-emerald-900">
              Bienvenue !
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Complétez votre profil pour accéder à l'annuaire familial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sélection du membre */}
              <div className="space-y-2">
                <h3 className="font-semibold text-base">Qui es-tu ?</h3>

                <Select
                  value={selectedMemberId}
                  onValueChange={setSelectedMemberId}
                >
                  <SelectTrigger id="familyMember" className="w-full">
                    <SelectValue placeholder="Sélectionnez un membre de la famille" />
                  </SelectTrigger>
                  <SelectContent>
                    {familyMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.firstName} {member.lastName || ""}
                        {member.maidenName && ` (née ${member.maidenName})`}
                        {member.code && ` - ${member.code}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Informations à compléter */}
              {selectedMemberId && (
                <div className="space-y-4 pt-4">
                  <h3 className="font-semibold text-base">
                    Complétez vos informations
                  </h3>
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      Prénom
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Prénom"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="lastName"
                      className="flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      Nom
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Nom"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="birthDate"
                      className="flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Date de naissance
                    </Label>
                    <DatePicker
                      value={birthDate}
                      onChange={(date) => setBirthDate(date)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="address"
                      className="flex items-center gap-2"
                    >
                      <MapPin className="h-4 w-4" />
                      Adresse
                    </Label>
                    <Input
                      id="address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Votre adresse complète"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Téléphone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={!selectedMemberId || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    Terminer l'onboarding
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
