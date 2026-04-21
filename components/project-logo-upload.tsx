"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  removeProjectLogoAction,
  uploadProjectLogoAction,
} from "@/lib/api/project-picture";
import {
  isProjectLogoObjectKeyForProject,
} from "@/lib/r2/member-picture-storage";
import {
  isProjectLogoSrcLocalPath,
  isProjectLogoSrcRemoteHttp,
  publicR2UrlMatchesObjectKey,
  resolveProjectLogoSrc,
} from "@/lib/project-logo-url";
import { cn } from "@/lib/utils";

const DEFAULT_LOGO = "/assets/logo-square.png";

const previewClass =
  "relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 ring-1 ring-slate-200/60";

type ProjectLogoUploadProps = {
  /** null en mode création : pas d’upload avant sauvegarde */
  projectId: number | null;
  /** Clé R2 `projects/{id}/...` enregistrée en base (vide si aucun logo). */
  logo: string;
  /** URL absolue du logo, résolue côté serveur (ex. champ `logoDisplayUrl` de `getProjects`). */
  serverResolvedLogoUrl?: string | null;
  onLogoChange: (next: string | null) => void;
  /** Après upload / suppression réussis (ex. recharger la liste). */
  onPersisted?: () => void | Promise<void>;
  className?: string;
};

export function ProjectLogoUpload({
  projectId,
  logo,
  serverResolvedLogoUrl = null,
  onLogoChange,
  onPersisted,
  className,
}: ProjectLogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [lastUploaded, setLastUploaded] = useState<{
    key: string;
    url: string;
  } | null>(null);

  useEffect(() => {
    setLastUploaded(null);
  }, [projectId]);

  useEffect(() => {
    if (!lastUploaded) return;
    if (!logo.trim() || logo.trim() !== lastUploaded.key) {
      setLastUploaded(null);
    }
  }, [logo, lastUploaded]);

  const fromUpload =
    lastUploaded && logo.trim() === lastUploaded.key
      ? lastUploaded.url
      : null;
  const fromServer =
    serverResolvedLogoUrl?.trim() &&
    logo.trim() &&
    publicR2UrlMatchesObjectKey(serverResolvedLogoUrl, logo.trim())
      ? serverResolvedLogoUrl.trim()
      : null;

  const displaySrc =
    fromUpload ??
    fromServer ??
    resolveProjectLogoSrc(logo || null, DEFAULT_LOGO);
  const isLocal = isProjectLogoSrcLocalPath(displaySrc);
  const isRemoteHttp = isProjectLogoSrcRemoteHttp(displaySrc);

  const canUpload = projectId != null;
  const hasR2Logo =
    canUpload &&
    Boolean(logo?.trim()) &&
    isProjectLogoObjectKeyForProject(logo.trim(), projectId);

  const triggerFile = () => {
    if (!canUpload || pending) return;
    inputRef.current?.click();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || projectId == null) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadProjectLogoAction(projectId, formData);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Logo enregistré.");
      if (result.publicUrl) {
        setLastUploaded({ key: result.logoKey, url: result.publicUrl });
      }
      onLogoChange(result.logoKey);
      await onPersisted?.();
    });
  };

  const handleRemove = () => {
    if (!canUpload || projectId == null || pending) return;
    startTransition(async () => {
      const result = await removeProjectLogoAction(projectId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Logo retiré.");
      setLastUploaded(null);
      onLogoChange(null);
      await onPersisted?.();
    });
  };

  const preview =
    isLocal ? (
      <Image
        src={displaySrc}
        alt=""
        fill
        className="object-cover"
        sizes="112px"
        unoptimized
      />
    ) : isRemoteHttp ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={displaySrc} alt="" className="h-full w-full object-cover" />
    ) : null;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="text-sm font-medium leading-none">Logo</div>
      <p className="text-xs text-muted-foreground">
        {!canUpload
          ? " Enregistrez le projet, puis rouvrez la modification pour ajouter un logo."
          : null}
      </p>

      <div className="flex flex-col items-start gap-1.5">
        <div
          className={cn(
            previewClass,
            canUpload && !pending && "cursor-pointer",
            "group outline-none"
          )}
          tabIndex={canUpload ? 0 : undefined}
          role={canUpload ? "button" : undefined}
          aria-label={canUpload ? "Changer le logo du projet" : undefined}
          onClick={canUpload ? triggerFile : undefined}
          onKeyDown={(e) => {
            if (!canUpload || pending) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              triggerFile();
            }
          }}
        >
          {preview}
          {canUpload ? (
            <>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={handleFile}
                disabled={pending}
                tabIndex={-1}
              />
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl",
                  "bg-black/0 opacity-0 transition-all duration-200",
                  "group-hover:bg-black/40 group-hover:opacity-100",
                  "group-focus-visible:bg-black/40 group-focus-visible:opacity-100"
                )}
              >
                <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-medium text-slate-900 shadow">
                  Changer
                </span>
              </div>
            </>
          ) : null}
          {pending ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/35">
              <Loader2 className="h-7 w-7 animate-spin text-white" aria-hidden />
            </div>
          ) : null}
        </div>

        {hasR2Logo ? (
          <button
            type="button"
            onClick={handleRemove}
            disabled={pending}
            className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-red-700 hover:underline disabled:opacity-50"
          >
            Retirer le logo
          </button>
        ) : null}
      </div>
    </div>
  );
}
