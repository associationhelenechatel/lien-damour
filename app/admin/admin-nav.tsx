"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users, FolderKanban, Mail, Shield } from "lucide-react";

const tabs = [
  { href: "/admin", label: "Membres", icon: Users },
  { href: "/admin/projects", label: "Projets", icon: FolderKanban },
  { href: "/admin/invitations", label: "Invitations", icon: Mail },
  { href: "/admin/administrators", label: "Administrateurs", icon: Shield },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="-mx-4 overflow-x-auto overflow-y-hidden touch-pan-x px-4 sm:mx-0 sm:px-0">
      <nav className="flex min-w-max items-end gap-1 px-0">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex shrink-0 items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-blue-600 text-blue-700"
                  : "text-slate-600 hover:text-slate-900 hover:border-slate-300"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
