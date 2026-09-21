"use client";

import { useRef, useState, useTransition } from "react";
import { Download, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import {
  confirmMemberDocumentUploadAction,
  createMemberDocumentUploadAction,
  deleteMemberDocumentAction,
} from "@/lib/api/member-documents";
import type { FamilyMemberDocumentWithUrl } from "@/lib/types";
import { Button } from "@/components/ui/button";

const MAX_DOCUMENT_MB = 20;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  const units = ["Ko", "Mo", "Go"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unitIndex]}`;
}

export function MemberDocumentsSection({
  memberId,
  initialDocuments,
  canManage,
}: {
  memberId: number;
  initialDocuments: FamilyMemberDocumentWithUrl[];
  canManage: boolean;
}) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [pendingUpload, startUpload] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!canManage && documents.length === 0) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_DOCUMENT_MB * 1024 * 1024) {
      toast.error(`Fichier trop volumineux (maximum ${MAX_DOCUMENT_MB} Mo).`);
      return;
    }

    startUpload(async () => {
      const prepared = await createMemberDocumentUploadAction(
        memberId,
        file.name,
        file.type,
        file.size
      );
      if (!prepared.ok) {
        toast.error(prepared.error);
        return;
      }

      let putResponse: Response;
      try {
        putResponse = await fetch(prepared.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": prepared.contentType,
            ...(prepared.contentDisposition
              ? { "Content-Disposition": prepared.contentDisposition }
              : {}),
          },
          body: file,
        });
      } catch {
        toast.error("Échec de l’envoi vers le stockage.");
        return;
      }
      if (!putResponse.ok) {
        toast.error("Échec de l’envoi vers le stockage.");
        return;
      }

      const result = await confirmMemberDocumentUploadAction(
        memberId,
        prepared.objectKey,
        file.name
      );
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setDocuments((prev) => [...prev, result.document]);
      toast.success("Document ajouté.");
    });
  };

  const handleDelete = (documentId: number, fileName: string) => {
    setDeletingId(documentId);
    void (async () => {
      const result = await deleteMemberDocumentAction(documentId);
      setDeletingId(null);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setDocuments((prev) => prev.filter((d) => d.id !== documentId));
      toast.success(`« ${fileName} » supprimé.`);
    })();
  };

  return (
    <section className="mt-10 border-t border-slate-200/80 pt-10">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Documents
        </h2>
        {canManage ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 shrink-0 gap-1.5 border-emerald-200 bg-emerald-50/80 text-emerald-900 hover:bg-emerald-100"
              onClick={() => inputRef.current?.click()}
              disabled={pendingUpload}
            >
              {pendingUpload ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              Ajouter
            </Button>
            <input
              ref={inputRef}
              type="file"
              className="sr-only"
              onChange={handleFileChange}
              disabled={pendingUpload}
              tabIndex={-1}
            />
          </>
        ) : null}
      </div>

      {documents.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Aucun document pour le moment.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2.5">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-slate-50 px-4 py-3 text-sm shadow-sm"
            >
              <FileText
                className="h-5 w-5 shrink-0 text-slate-500"
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-800">
                  {doc.fileName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(doc.sizeBytes)}
                </p>
              </div>
              {doc.url ? (
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-full p-2 text-slate-500 transition-colors hover:bg-emerald-100 hover:text-emerald-800"
                  aria-label={`Télécharger ${doc.fileName}`}
                  title="Télécharger"
                >
                  <Download className="h-4 w-4" />
                </a>
              ) : null}
              {canManage ? (
                <button
                  type="button"
                  onClick={() => handleDelete(doc.id, doc.fileName)}
                  disabled={deletingId === doc.id}
                  className="shrink-0 rounded-full p-2 text-slate-500 transition-colors hover:bg-red-100 hover:text-red-700 disabled:opacity-50"
                  aria-label={`Supprimer ${doc.fileName}`}
                  title="Supprimer"
                >
                  {deletingId === doc.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
