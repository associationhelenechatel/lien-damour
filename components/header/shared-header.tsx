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
    <header className="sticky top-0 z-50 w-full bg-white/95 border-b border-slate-300">
      <div className="w-full px-10 sm:px-12">
        <div className="flex flex-col sm:flex-row sm:items-stretch sm:h-14 gap-4">
          <div className="flex-shrink-0 flex items-center py-2 sm:py-0">
            <Link href="/">
              <Image
                src="/assets/logo.png"
                height={36}
                width={150}
                alt="Association Hélène Chatel"
              />
            </Link>
          </div>

          <nav className="ml-12 flex gap-8 items-stretch flex-shrink-0 min-h-0 font-cera">
            <SignedIn>
              {NAV_LINKS.map(({ href, label }) => {
                const isActive =
                  pathname === href || (href !== "/" && (pathname?.startsWith(href + "/") ?? false));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`relative flex h-full items-center min-h-0 font-normal hover:text-black ${isActive ? "text-black" : "text-slate-500"}`}
                  >
                    {label}
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-black origin-left animate-[nav-underline-fill_0.25s_ease-out_forwards]"
                        aria-hidden
                      />
                    )}
                  </Link>
                );
              })}
            </SignedIn>
          </nav>

          <div className="flex-1 min-w-0" />

          <div className="flex-shrink-0 flex items-center py-2 sm:py-0">
            <SignedIn>
              <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-slate-500 p-px shrink-0">
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
              </div>
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
