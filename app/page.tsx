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
import { Heart, Loader2, GraduationCap, Users } from "lucide-react";
import { getProjects } from "@/lib/api/project";
import {
  isProjectLogoSrcLocalPath,
  isProjectLogoSrcRemoteHttp,
  resolveProjectLogoSrc,
} from "@/lib/project-logo-url";
import type { ProjectWithLogoDisplay } from "@/lib/types";

const DEFAULT_PROJECT_IMAGE =
  "/assets/logo-square.png";

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
  const [projects, setProjects] = useState<ProjectWithLogoDisplay[]>([]);
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
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-6">
            L&apos;Association Hélène Chatel
          </h2>
          <p className="text-xl font-medium text-slate-700 mb-6 max-w-3xl mx-auto">
            Bienvenue sur le site de l&apos;Association Hélène Chatel.
          </p>
          <p className="text-lg text-slate-600 mb-4 max-w-3xl mx-auto">
            Sa partie publique présente l&apos;Association et les projets
            solidaires qu&apos;elle soutient en France et à l&apos;étranger.
            Chaque projet est proposé et suivi par un membre de la famille,
            dans la continuité de l&apos;engagement d&apos;Hélène Chatel née
            Damour.
          </p>
          <p className="text-lg text-slate-600 mb-8 max-w-3xl mx-auto">
            Le site comprend également un espace privé, réservé aux
            descendants de Pierre et Hélène Chatel ainsi qu&apos;à leurs
            conjoints ou partenaires. Cet espace leur permet de consulter
            l&apos;annuaire familial et de retrouver les informations
            relatives à la vie de la famille et de l&apos;Association.
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
              {projects.map((project) => {
                const logoSrc =
                  project.logoDisplayUrl?.trim() ||
                  resolveProjectLogoSrc(
                    project.logo,
                    DEFAULT_PROJECT_IMAGE
                  );
                return (
                <Card
                  key={project.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <CardContent className="p-4 flex flex-col gap-3">
                    {/* 1. Logo + nom */}
                    <div className="flex gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                        {isProjectLogoSrcLocalPath(logoSrc) ? (
                          <Image
                            src={logoSrc}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                            sizes="56px"
                          />
                        ) : isProjectLogoSrcRemoteHttp(logoSrc) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={logoSrc}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
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
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-8">
              À propos de l&apos;Association
            </h2>
            <p className="text-lg text-slate-600 mb-6 text-left">
              Créée en 1993, l&apos;Association Hélène Chatel prolonge
              l&apos;œuvre de générosité et de solidarité initiée par Hélène
              Chatel née Damour. Tout au long de sa vie, elle a mobilisé ses
              enfants, ses petits-enfants et ses proches afin de soutenir,
              dans la durée, des projets porteurs d&apos;espérance en France
              et dans le monde.
            </p>
            <p className="text-lg text-slate-600 mb-6 text-left">
              Association familiale et philanthropique, elle poursuit trois
              ambitions complémentaires : soutenir des projets à vocation
              sociale, éducative ou humanitaire ; développer et transmettre
              un esprit philanthropique au sein de la famille ; entretenir
              les liens entre les générations autour d&apos;engagements
              concrets.
            </p>
            <p className="text-lg text-slate-600 mb-6 text-left">
              Chaque projet est proposé et accompagné par un membre de la
              famille, puis examiné par le Conseil d&apos;administration.
              Cette implication personnelle permet de construire une
              relation durable avec les structures soutenues, de suivre
              concrètement l&apos;utilisation des fonds attribués et,
              lorsque les besoins le justifient, de renouveler l&apos;aide
              afin d&apos;inscrire l&apos;engagement de l&apos;Association
              dans le temps long. Grâce aux dons recueillis, l&apos;Association
              soutient ainsi de nombreux projets à vocation sociale,
              éducative ou humanitaire, en France et à l&apos;étranger.
            </p>
            <p className="text-lg text-slate-600 mb-6 text-left">
              Organisée autour des neuf branches issues de Pierre et Hélène
              Chatel, l&apos;Association s&apos;appuie notamment sur des
              ambassadeurs de branche chargés de faciliter la circulation de
              l&apos;information, la participation de chacun et la mise à
              jour de l&apos;annuaire familial.
            </p>
            <p className="text-lg text-slate-600 mb-8 text-left">
              L&apos;Association est habilitée à délivrer des reçus fiscaux
              dans les conditions prévues par la réglementation. Elle publie
              chaque année un rapport d&apos;activité présentant les projets
              soutenus et l&apos;utilisation des fonds qui leur sont
              consacrés.
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
                  Nous soutenons des actions concrètes en faveur des
                  personnes et des communautés les plus fragiles.
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
                  Nous favorisons l&apos;accès à l&apos;éducation, à la
                  formation et à l&apos;autonomie de ceux qui en ont le plus
                  besoin.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Transmission
                </h3>
                <p className="text-slate-600">
                  Nous développons et transmettons, de génération en
                  génération, l&apos;esprit philanthropique qui anime notre
                  famille.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-16 px-4 bg-slate-800">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">
              Informations, confidentialité et protection des données
            </h3>

            <div className="space-y-8 text-slate-200">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Mise à jour des informations publiques
                </h4>
                <p>
                  Les associations et toute autre information les
                  concernant. Toute demande peut être adressée à
                  l&apos;Association Hélène Chatel à l&apos;adresse{" "}
                  <a
                    href="mailto:associationhelenechatel@gmail.com"
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    associationhelenechatel@gmail.com
                  </a>
                  .
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Espace familial privé
                </h4>
                <p className="mb-3">
                  Les informations, coordonnées, photographies et documents
                  accessibles dans l&apos;espace familial privé sont
                  strictement destinés à un usage familial. Ils ne peuvent
                  être utilisés à des fins commerciales, communiqués à des
                  tiers extérieurs à la famille, reproduits ou publiés sur
                  Internet sans l&apos;accord préalable des personnes
                  concernées.
                </p>
                <p className="mb-3">
                  Toute personne mentionnée ou représentée peut demander à
                  tout moment la modification ou la suppression des
                  informations ou photographies la concernant. Cette
                  demande peut être adressée à son ambassadeur de branche
                  ou à l&apos;Association Hélène Chatel à l&apos;adresse{" "}
                  <a
                    href="mailto:associationhelenechatel@gmail.com"
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    associationhelenechatel@gmail.com
                  </a>
                  .
                </p>
                <p>
                  Conformément à la réglementation relative à la protection
                  des données personnelles, chacun dispose d&apos;un droit
                  d&apos;accès, de rectification, d&apos;opposition, de
                  limitation et, selon les cas, de suppression des données
                  le concernant.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  À propos du site
                </h4>
                <p className="mb-3">
                  Ce site est le fruit d&apos;une longue tradition familiale
                  de partage et de transmission de l&apos;information. Il
                  s&apos;inscrit dans la continuité du premier site familial
                  mis en ligne par Michèle D., avec le soutien de Nicolas R.
                  D. et de Dominique D.
                </p>
                <p className="mb-3">
                  La version actuelle repose notamment sur l&apos;important
                  travail réalisé par Humphrey D. pour constituer et
                  structurer la base de données familiale. À partir de
                  cette base, Alexandre de T. a entièrement repris
                  l&apos;architecture du site afin de concevoir et de
                  mettre en ligne la version que vous consultez
                  aujourd&apos;hui.
                </p>
                <p>
                  L&apos;Association remercie chaleureusement chacun
                  d&apos;eux pour sa contribution à la préservation et à la
                  transmission de la mémoire familiale.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Informations légales
                </h4>
                <p className="mb-3">
                  Le présent site est édité par l&apos;Association Hélène
                  Chatel, association régie par la loi du 1er juillet 1901.
                </p>
                <p>
                  Siège social : 50 bis, avenue de la Grande Armée, 75017
                  Paris
                  <br />
                  Présidente et responsable de la publication : Delphine
                  Harmel
                  <br />
                  Contact :{" "}
                  <a
                    href="mailto:associationhelenechatel@gmail.com"
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    associationhelenechatel@gmail.com
                  </a>
                </p>
              </div>
            </div>

            <p className="text-center text-sm text-slate-400 mt-10 pt-8 border-t border-slate-700">
              © Association Hélène Chatel – Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
