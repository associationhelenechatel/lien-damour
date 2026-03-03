"use client";

import Image from 'next/image';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MapPinnedIcon, Settings, Users } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { PersonalInfosTab } from "./personal-infos-tab";

export function SharedHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <div className="w-full px-4 sm:px-6 py-2">
        <div className="flex flex-col sm:flex-row mx-8 sm:items-center sm:justify-between gap-4">
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

          <div className="flex gap-2 items-center flex-shrink-0 sm:ml-auto">
            <SignedIn>
              <Link href="/family">
                <Button
                  variant={pathname?.startsWith("/family") ? "default" : "outline"}
                  className={
                    pathname?.startsWith("/family")
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "border-emerald-300 text-emerald-700 hover:text-emerald-700 hover:bg-emerald-50 bg-transparent"
                  }
                >
                  <Users className="h-4 w-4 mr-2" />
                  Famille
                </Button>
              </Link>
              <Link href="/admin">
                <Button
                  variant={pathname?.startsWith("/admin") ? "default" : "outline"}
                  className={
                    pathname?.startsWith("/admin")
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "border-blue-300 text-blue-700 hover:text-blue-700 hover:bg-blue-50 bg-transparent"
                  }
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Administration
                </Button>
              </Link>
              <div className="h-6 w-px bg-slate-300 mx-2" />
              <UserButton>
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
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Espace Famille
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
}
