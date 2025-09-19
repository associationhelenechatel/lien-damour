"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Users,
  MapPin,
  GraduationCap,
  Home as HomeIcon,
  Utensils,
  Stethoscope,
  TreePine,
  Droplets,
  Lightbulb,
  Building,
  Palette,
  Music,
  BookOpen,
} from "lucide-react";

const projects = [
  {
    id: 1,
    title: "Aide aux familles en difficulté",
    description:
      "Soutien financier et matériel aux familles traversant des périodes difficiles",
    icon: Heart,
    category: "Social",
    amount: "15 000€",
  },
  {
    id: 2,
    title: "Centre d'accueil pour personnes âgées",
    description:
      "Amélioration des conditions de vie et des soins pour nos aînés",
    icon: Users,
    category: "Santé",
    amount: "25 000€",
  },
  {
    id: 3,
    title: "Rénovation du patrimoine local",
    description:
      "Préservation et restauration des monuments historiques de Châtel",
    icon: Building,
    category: "Patrimoine",
    amount: "30 000€",
  },
  {
    id: 4,
    title: "Bourses d'études",
    description: "Aide financière aux étudiants méritants de la région",
    icon: GraduationCap,
    category: "Éducation",
    amount: "12 000€",
  },
  {
    id: 5,
    title: "Logements sociaux",
    description: "Construction et rénovation de logements abordables",
    icon: HomeIcon,
    category: "Logement",
    amount: "50 000€",
  },
  {
    id: 6,
    title: "Banque alimentaire locale",
    description:
      "Distribution de denrées alimentaires aux personnes dans le besoin",
    icon: Utensils,
    category: "Social",
    amount: "8 000€",
  },
  {
    id: 7,
    title: "Équipements médicaux",
    description: "Achat d'équipements pour le centre de santé local",
    icon: Stethoscope,
    category: "Santé",
    amount: "20 000€",
  },
  {
    id: 8,
    title: "Reforestation",
    description: "Plantation d'arbres et protection de l'environnement local",
    icon: TreePine,
    category: "Environnement",
    amount: "10 000€",
  },
  {
    id: 9,
    title: "Accès à l'eau potable",
    description: "Installation de points d'eau dans les zones rurales",
    icon: Droplets,
    category: "Infrastructure",
    amount: "18 000€",
  },
  {
    id: 10,
    title: "Énergie renouvelable",
    description: "Installation de panneaux solaires sur les bâtiments publics",
    icon: Lightbulb,
    category: "Environnement",
    amount: "35 000€",
  },
  {
    id: 11,
    title: "Centre culturel",
    description: "Rénovation et équipement du centre culturel municipal",
    icon: Palette,
    category: "Culture",
    amount: "22 000€",
  },
  {
    id: 12,
    title: "École de musique",
    description: "Instruments et cours de musique pour les jeunes",
    icon: Music,
    category: "Culture",
    amount: "7 000€",
  },
  {
    id: 13,
    title: "Bibliothèque numérique",
    description:
      "Modernisation de la bibliothèque avec des ressources numériques",
    icon: BookOpen,
    category: "Éducation",
    amount: "15 000€",
  },
  {
    id: 14,
    title: "Transport adapté",
    description: "Service de transport pour personnes à mobilité réduite",
    icon: MapPin,
    category: "Social",
    amount: "28 000€",
  },
];

const categoryColors = {
  Social: "bg-blue-100 text-blue-800",
  Santé: "bg-green-100 text-green-800",
  Patrimoine: "bg-purple-100 text-purple-800",
  Éducation: "bg-orange-100 text-orange-800",
  Logement: "bg-red-100 text-red-800",
  Environnement: "bg-emerald-100 text-emerald-800",
  Infrastructure: "bg-gray-100 text-gray-800",
  Culture: "bg-pink-100 text-pink-800",
};

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Rediriger vers la page famille si l'utilisateur est connecté
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/family");
    }
  }, [isAuthenticated, router]);

  // Ne pas afficher la page si l'utilisateur est connecté
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Redirection vers l'espace famille...</p>
        </div>
      </div>
    );
  }

  const totalAmount = projects.reduce((sum, project) => {
    return (
      sum + parseInt(project.amount.replace(/[€\s]/g, "").replace(/\./g, ""))
    );
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-slate-800 mb-6">
            Association Hélène Châtel
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Depuis plus de 50 ans, l'Association Hélène Châtel s'engage pour le
            développement social, culturel et économique de notre région.
            Découvrez les projets que nous soutenons financièrement pour
            améliorer la vie de notre communauté.
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
            Nos Projets Soutenus
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project) => {
              const IconComponent = project.icon;
              return (
                <Card
                  key={project.id}
                  className="hover:shadow-lg transition-shadow duration-300"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <IconComponent className="h-8 w-8 text-emerald-600" />
                      <Badge
                        className={
                          categoryColors[
                            project.category as keyof typeof categoryColors
                          ]
                        }
                      >
                        {project.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-emerald-600">
                        {project.amount}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-8">
              Notre Mission
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              L'Association Hélène Châtel œuvre pour le bien-être de tous les
              habitants de notre région. Grâce à vos dons et à notre engagement,
              nous finançons des projets concrets qui améliorent la qualité de
              vie, favorisent l'éducation, préservent notre patrimoine et
              protègent notre environnement.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="bg-emerald-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Solidarité
                </h3>
                <p className="text-slate-600">
                  Nous soutenons les plus vulnérables de notre communauté
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <GraduationCap className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Éducation
                </h3>
                <p className="text-slate-600">
                  Nous investissons dans l'avenir de nos jeunes
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <TreePine className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Environnement
                </h3>
                <p className="text-slate-600">
                  Nous préservons notre cadre de vie pour les générations
                  futures
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
