"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

// Import des projets depuis le fichier JSON
import projectsData from "@/data/projects.json";

// Mapping des icônes
const iconMap = {
  Heart,
  Users,
  HomeIcon,
  BookOpen,
  Music,
  Stethoscope,
  GraduationCap,
  Building,
  MapPin,
  TreePine,
  Droplets,
  Lightbulb,
  Palette,
};

// Projets avec icônes mappées
const projects = projectsData.map((project) => ({
  ...project,
  icon: iconMap[project.icon as keyof typeof iconMap] || Heart,
}));

const categoryColors = {
  Social: "bg-blue-100 text-blue-800",
  Santé: "bg-green-100 text-green-800",
  Patrimoine: "bg-purple-100 text-purple-800",
  Éducation: "bg-orange-100 text-orange-800",
  Logement: "bg-red-100 text-red-800",
  Environnement: "bg-emerald-100 text-emerald-800",
  Infrastructure: "bg-gray-100 text-gray-800",
  Culture: "bg-pink-100 text-pink-800",
  Humanitaire: "bg-red-100 text-red-800",
  Formation: "bg-yellow-100 text-yellow-800",
  Agriculture: "bg-green-100 text-green-800",
  Partenariat: "bg-violet-100 text-violet-800",
};

export default function Home() {
  // Nombre total de projets soutenus
  const totalProjects = projects.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="py-8 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-slate-800 mb-6">
            Association Hélène Chatel
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Depuis plus de 30 ans, l'Association Hélène Chatel finance des
            projets à vocation sociale ou humanitaire, en France comme à
            l'étranger. Chaque projet est proposé et suivi par un membre de la
            famille, perpétuant l'œuvre d'Hélène Chatel née Damour.
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-8 px-4">
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
                        variant="outline"
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
                      {project.summary || project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs text-slate-500">
                        {project.type}
                      </span>
                      <span className="text-sm text-slate-600 font-medium">
                        {project.location}
                      </span>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          En savoir plus
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <IconComponent className="h-6 w-6 text-emerald-600" />
                            {project.title}
                          </DialogTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              variant="outline"
                              className={
                                categoryColors[
                                  project.category as keyof typeof categoryColors
                                ]
                              }
                            >
                              {project.category}
                            </Badge>
                            <span className="text-sm text-slate-500">
                              {project.type} • {project.location}
                            </span>
                          </div>
                        </DialogHeader>
                        <DialogDescription className="text-base leading-relaxed mt-4">
                          {project.description}
                        </DialogDescription>
                      </DialogContent>
                    </Dialog>
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
            <h2 className="text-3xl font-bold text-slate-800 mb-8">À Propos</h2>
            <p className="text-lg text-slate-600 mb-8">
              L'Association Hélène Chatel est une association familiale
              philanthropique créée en 1993 suite au décès d'Hélène Chatel née
              Damour. Cette grande dame avait pris l'habitude de solliciter ses
              enfants, petits-enfants et ses nombreux visiteurs pour financer
              des projets qu'elle accompagnait dans le temps de par le monde.
              Dirigée par un bureau représentatif des neuf branches de la
              famille, l'association attribue chaque année plus de 20 000 euros
              de subventions permettant de financer une vingtaine de projets par
              an.
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

      {/* Footer */}
      <footer className="py-16 px-4 bg-slate-800">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Contact</h3>
            <p className="text-lg text-slate-200 mb-4">
              <strong>Delphine HARMEL</strong>
              <br />
              Présidente
            </p>
            <p className="text-slate-200">
              Pour plus d'informations : <br />
              <a
                href="mailto:bureau@liendamour.fr"
                className="text-emerald-400 hover:text-emerald-300"
              >
                bureau@liendamour.fr
              </a>
            </p>
            <p className="text-sm text-slate-400 mt-4">
              L'association est habilitée à émettre des reçus fiscaux et publie
              annuellement un rapport d'activités permettant de partager des
              nouvelles des différents projets financés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
