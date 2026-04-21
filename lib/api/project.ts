"use server";

import { revalidatePath } from "next/cache";
import { eq, asc } from "drizzle-orm";
import { db } from "@/drizzle/client";
import { project } from "@/drizzle/schema";
import { resolveProjectLogoPublicUrl } from "@/lib/project-logo-url";
import type { Project, NewProject, ProjectWithLogoDisplay } from "@/lib/types";

function withLogoDisplay(row: Project): ProjectWithLogoDisplay {
  return {
    ...row,
    logoDisplayUrl: resolveProjectLogoPublicUrl(row.logo),
  };
}

export async function getProjects(): Promise<ProjectWithLogoDisplay[]> {
  const rows = await db
    .select()
    .from(project)
    .orderBy(asc(project.name));
  return rows.map(withLogoDisplay);
}

export async function getProjectById(
  id: number
): Promise<ProjectWithLogoDisplay | null> {
  const [row] = await db
    .select()
    .from(project)
    .where(eq(project.id, id))
    .limit(1);
  return row ? withLogoDisplay(row) : null;
}

export async function createProject(
  data: NewProject
): Promise<ProjectWithLogoDisplay> {
  const [created] = await db
    .insert(project)
    .values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  revalidatePath("/admin");
  revalidatePath("/admin/projects");
  revalidatePath("/");
  return withLogoDisplay(created);
}

export async function updateProject(
  id: number,
  data: Partial<NewProject>
): Promise<ProjectWithLogoDisplay> {
  const [updated] = await db
    .update(project)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(project.id, id))
    .returning();
  revalidatePath("/admin");
  revalidatePath("/admin/projects");
  revalidatePath("/");
  return withLogoDisplay(updated);
}

export async function deleteProject(id: number): Promise<void> {
  await db.delete(project).where(eq(project.id, id));
  revalidatePath("/admin");
  revalidatePath("/admin/projects");
  revalidatePath("/");
}
