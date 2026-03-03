"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPinnedIcon } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { PersonalInfosTab } from "./personal-infos-tab";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/family", label: "Annuaire" },
  { href: "/docs", label: "Documents" },
  { href: "/admin", label: "Administration" },
] as const;

export function SharedHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <div className="w-full px-4 sm:px-6 py-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-shrink-0">
            <Link href="/">
              <Image
                src="/assets/logo.png"
                height={36}
                width={150}
                alt="Association Hélène Chatel"
              />
            </Link>
          </div>

          <div className="ml-12 flex gap-8 items-center flex-shrink-0">
            <SignedIn>
              {NAV_LINKS.map(({ href, label }) => {
                const isActive =
                  pathname === href || (pathname?.startsWith(href + "/") ?? false);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`font-normal hover:text-black ${isActive ? "text-black" : "text-slate-500"}`}
                  >
                    {label}
                  </Link>
                );
              })}
            </SignedIn>
          </div>

          <div className="flex-1 min-w-0" />

          <div className="flex-shrink-0">
            <SignedIn>
              <UserButton
                userProfileProps={{
                  appearance: {
                    elements: {
                      formFieldRow__name: {
                        display: "none",
                      },
                    },
                  },
                }}
              >
                <UserButton.UserProfilePage
                  label="Infos personnelles"
                  labelIcon={<MapPinnedIcon className="h-4 w-4" />}
                  url="/informations"
                >
                  <PersonalInfosTab />
                </UserButton.UserProfilePage>
                <UserButton.UserProfilePage label="security" />
              </UserButton>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <span className="font-normal text-slate-500 hover:text-black cursor-pointer">
                  Se connecter
                </span>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
}
