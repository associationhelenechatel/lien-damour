"use server";

import { revalidatePath } from "next/cache";
import { eq, asc } from "drizzle-orm";
import { db } from "@/db/client";
import { project } from "@/db/schema";
import type { Project, NewProject } from "@/lib/types";

export async function getProjects(): Promise<Project[]> {
  const rows = await db
    .select()
    .from(project)
    .orderBy(asc(project.name));
  return rows;
}

export async function getProjectById(id: number): Promise<Project | null> {
  const [row] = await db
    .select()
    .from(project)
    .where(eq(project.id, id))
    .limit(1);
  return row ?? null;
}

export async function createProject(data: NewProject): Promise<Project> {
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
  return created;
}

export async function updateProject(
  id: number,
  data: Partial<NewProject>
): Promise<Project> {
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
  return updated;
}

export async function deleteProject(id: number): Promise<void> {
  await db.delete(project).where(eq(project.id, id));
  revalidatePath("/admin");
  revalidatePath("/admin/projects");
}
