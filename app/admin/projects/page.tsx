"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  FolderKanban,
} from "lucide-react";
import Image from "next/image";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "@/lib/api/project";
import type { Project } from "@/lib/types";
import { EditProjectDialog } from "@/app/admin/projects/edit-project-dialog";
import { DeleteProjectDialog } from "@/app/admin/projects/delete-project-dialog";

const DEFAULT_PROJECT_IMAGE =
  "https://picsum.photos/seed/project/160/120";

export default function AdminProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      setError("Impossible de charger les projets");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filteredProjects = searchTerm
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.tag?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : projects;

  const handleAddProject = async (data: Partial<Project>) => {
    await createProject(data as Parameters<typeof createProject>[0]);
    await loadProjects();
    setShowAddDialog(false);
  };

  const handleEditProject = async (data: Partial<Project>) => {
    if (!selectedProject) return;
    await updateProject(selectedProject.id, data);
    await loadProjects();
    setShowEditDialog(false);
    setSelectedProject(null);
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    await deleteProject(selectedProject.id);
    await loadProjects();
    setShowDeleteDialog(false);
    setSelectedProject(null);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 h-4 w-4" />
          <Input
            placeholder="Rechercher par nom, lieu, type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-emerald-200 focus:border-emerald-500"
          />
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un projet
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="ml-2 text-emerald-600">Chargement...</span>
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error}</p>
            <Button onClick={() => loadProjects()} variant="outline" className="mt-4">
              Réessayer
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <div className="grid gap-4">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="border-emerald-200 hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex gap-4 flex-1 min-w-0">
                    <div className="relative shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-slate-100">
                      <Image
                        src={project.logo || DEFAULT_PROJECT_IMAGE}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <FolderKanban className="h-5 w-5 text-emerald-600 shrink-0" />
                        <h3 className="text-lg font-semibold text-emerald-900">
                          {project.name}
                        </h3>
                        {project.type && (
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {project.type}
                          </span>
                        )}
                        {project.tag && (
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {project.tag}
                          </span>
                        )}
                      </div>
                      {project.shortDescription && (
                        <p className="text-sm text-slate-600 line-clamp-2 mb-1">
                          {project.shortDescription}
                        </p>
                      )}
                      {project.location && (
                        <p className="text-sm text-slate-500">{project.location}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedProject(project);
                        setShowEditDialog(true);
                      }}
                      className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedProject(project);
                        setShowDeleteDialog(true);
                      }}
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && filteredProjects.length === 0 && (
        <Card className="border-emerald-200">
          <CardContent className="p-8 text-center">
            <p className="text-emerald-700">
              {searchTerm
                ? "Aucun projet trouvé pour cette recherche."
                : "Aucun projet. Ajoutez-en un pour commencer."}
            </p>
          </CardContent>
        </Card>
      )}

      <EditProjectDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        project={null}
        onSubmit={handleAddProject}
        title="Nouveau projet"
      />

      {selectedProject && (
        <EditProjectDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          project={selectedProject}
          onSubmit={handleEditProject}
          title="Modifier le projet"
        />
      )}

      {selectedProject && (
        <DeleteProjectDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          project={selectedProject}
          onConfirm={handleDeleteProject}
        />
      )}
    </>
  );
}
