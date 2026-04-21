"use client";

import { useRef, useTransition } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  removeMemberProfilePictureAction,
  uploadMemberProfilePictureAction,
} from "@/lib/api/member-picture";
import { cn } from "@/lib/utils";

const frameClass =
  "relative mx-auto aspect-square w-40 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200/80 sm:mx-0 sm:w-44";

function initialsFromNames(firstName?: string | null, lastName?: string | null) {
  const a = firstName?.charAt(0)?.toUpperCase() ?? "?";
  const b = lastName?.charAt(0)?.toUpperCase() ?? "";
  return (a + b).slice(0, 2);
}

export type MemberPictureUploadedInfo = {
  pictureId: string;
  publicUrl: string;
};

type MemberProfileAvatarHoverUploadProps = {
  memberId: number;
  profileImageUrl: string | null;
  pictureId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  enableUpload: boolean;
  onUploaded: (info?: MemberPictureUploadedInfo) => void;
};

/**
 * Avatar principal : survol = indication « Changer la photo », clic = choix du fichier.
 */
export function MemberProfileAvatarHoverUpload({
  memberId,
  profileImageUrl,
  pictureId,
  firstName,
  lastName,
  enableUpload,
  onUploaded,
}: MemberProfileAvatarHoverUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  const url = profileImageUrl?.trim() || "";
  const isLocal = url.startsWith("/");
  const isRemote = url.startsWith("http://") || url.startsWith("https://");

  const triggerFile = () => {
    if (!enableUpload || pending) return;
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadMemberProfilePictureAction(memberId, formData);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Photo enregistrée.");
      onUploaded({
        pictureId: result.pictureId,
        publicUrl: result.publicUrl,
      });
    });
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;
    startTransition(async () => {
      const result = await removeMemberProfilePictureAction(memberId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Photo retirée.");
      onUploaded();
    });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!enableUpload || pending) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      triggerFile();
    }
  };

  const initials = initialsFromNames(firstName, lastName);

  const inner =
    url && isLocal ? (
      <Image
        src={url}
        alt=""
        fill
        className="object-cover"
        sizes="176px"
        priority
      />
    ) : url && isRemote ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="" className="h-full w-full object-cover" />
    ) : (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200",
          "text-3xl font-semibold tracking-wide text-slate-600 sm:text-4xl"
        )}
        aria-hidden
      >
        {initials}
      </div>
    );

  if (!enableUpload) {
    return <div className={frameClass}>{inner}</div>;
  }

  const hasR2Picture = Boolean(pictureId?.trim());

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={cn(
          frameClass,
          "group relative outline-none",
          !pending && "cursor-pointer",
          "focus-visible:ring-2 focus-visible:ring-emerald-600/55 focus-visible:ring-offset-2"
        )}
        tabIndex={0}
        role="button"
        aria-label="Changer la photo de profil"
        onClick={triggerFile}
        onKeyDown={onKeyDown}
      >
        {inner}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={handleChange}
          disabled={pending}
          tabIndex={-1}
        />

        <div
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl",
            "bg-black/0 opacity-0 transition-all duration-200",
            "group-hover:bg-black/45 group-hover:opacity-100",
            "group-focus-visible:bg-black/45 group-focus-visible:opacity-100"
          )}
        >
          <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-slate-900 shadow-md">
            Changer la photo
          </span>
        </div>

        {pending ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/35">
            <Loader2 className="h-8 w-8 animate-spin text-white" aria-hidden />
          </div>
        ) : null}
      </div>

      {hasR2Picture ? (
        <button
          type="button"
          onClick={handleRemove}
          disabled={pending}
          className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-red-700 hover:underline disabled:opacity-50"
        >
          Supprimer la photo
        </button>
      ) : null}
    </div>
  );
}
