"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Heart, Loader2, GraduationCap, TreePine } from "lucide-react";
import { getProjects } from "@/lib/api/project";
import type { Project } from "@/lib/types";

const DEFAULT_PROJECT_IMAGE =
  "https://picsum.photos/seed/project/160/120";

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <section className="py-8 px-4 bg-white/95">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
            L&apos;Association Hélène Chatel
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Depuis plus de 30 ans, l&apos;Association Hélène Chatel finance des
            projets à vocation sociale ou humanitaire, en France comme à
            l&apos;étranger. Chaque projet est proposé et suivi par un membre de la
            famille, perpétuant l&apos;œuvre d&apos;Hélène Chatel née Damour.
          </p>
        </div>
        <div className="container mx-auto text-center">
          <a
            href="https://www.helloasso.com/associations/association-helene-chatel/formulaires/5"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-base px-8 py-6">
              <Heart className="h-5 w-5 mr-2" />
              Faire un don
            </Button>
          </a>
        </div>
      </section>

      <section className="py-8 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
            Nos Projets Soutenus
          </h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <CardContent className="p-4 flex flex-col gap-3">
                    {/* 1. Logo + nom */}
                    <div className="flex gap-3">
                      <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-slate-100">
                        <Image
                          src={project.logo || DEFAULT_PROJECT_IMAGE}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                          sizes="56px"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex items-center">
                        <CardTitle className="text-base leading-tight">
                          {project.name}
                        </CardTitle>
                      </div>
                    </div>
                    {/* 2. Description pleine largeur */}
                    <CardDescription className="text-sm line-clamp-4 w-full">
                      {project.shortDescription || project.description}
                    </CardDescription>
                    {/* 3. Catégorie uniquement */}
                    {project.tag && (
                      <div className="w-fit">
                        <Badge
                          variant="outline"
                          className={
                            categoryColors[
                              project.tag as keyof typeof categoryColors
                            ]
                          }
                        >
                          {project.tag}
                        </Badge>
                      </div>
                    )}
                    {/* 4. Bouton */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          En savoir plus
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Heart className="h-6 w-6 text-emerald-600" />
                            {project.name}
                          </DialogTitle>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <div>
                              {project.tag && (
                                <Badge
                                  variant="outline"
                                  className={
                                    categoryColors[
                                      project.tag as keyof typeof categoryColors
                                    ]
                                  }
                                >
                                  {project.tag}
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm text-slate-500">
                              {[project.type, project.location]
                                .filter(Boolean)
                                .join(" • ")}
                            </span>
                          </div>
                        </DialogHeader>
                        <DialogDescription className="text-base leading-relaxed mt-4">
                          {project.description || project.shortDescription || ""}
                        </DialogDescription>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-8">À Propos</h2>
            <p className="text-lg text-slate-600 mb-8">
              L&apos;Association Hélène Chatel est une association familiale
              philanthropique créée en 1993 suite au décès d&apos;Hélène Chatel née
              Damour. Cette grande dame avait pris l&apos;habitude de solliciter ses
              enfants, petits-enfants et ses nombreux visiteurs pour financer
              des projets qu&apos;elle accompagnait dans le temps de par le monde.
              Dirigée par un bureau représentatif des neuf branches de la
              famille, l&apos;association attribue chaque année plus de 20 000 euros
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
                  Nous investissons dans l&apos;avenir de nos jeunes
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
              Pour plus d&apos;informations : <br />
              <a
                href="mailto:bureau@liendamour.fr"
                className="text-emerald-400 hover:text-emerald-300"
              >
                bureau@liendamour.fr
              </a>
            </p>
            <p className="text-sm text-slate-400 mt-4">
              L&apos;association est habilitée à émettre des reçus fiscaux et publie
              annuellement un rapport d&apos;activités permettant de partager des
              nouvelles des différents projets financés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
