"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogInIcon, MenuIcon } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/family", label: "Annuaire" },
  // { href: "/docs", label: "Documents" },
  { href: "/admin", label: "Administration" },
] as const;

export function Navbar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const links = isAdmin ? NAV_LINKS : NAV_LINKS.filter((l) => l.href !== "/admin");

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 border-b border-slate-300">
      <div className="w-full px-4 sm:px-12">
        <div className="relative flex h-14 items-center gap-2 sm:gap-0">
          <div className="w-10 sm:hidden">
            <SignedIn>
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Ouvrir le menu">
                    <MenuIcon className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex h-full w-72 max-w-[85vw] flex-col justify-start p-0 sm:max-w-[85vw]">
                  <div className="p-5">
                    <SheetTitle className="font-cera">Navigation</SheetTitle>
                    <SheetDescription className="sr-only">
                      Sélectionne un onglet de navigation
                    </SheetDescription>
                  </div>
                  <nav className="flex flex-col px-2 pb-4 font-cera">
                    {links.map(({ href, label }) => {
                      const isActive =
                        pathname === href || (href !== "/" && (pathname?.startsWith(href + "/") ?? false));
                      return (
                        <SheetClose key={href} asChild>
                          <Link
                            href={href}
                            className={`rounded-md px-3 py-2 text-base transition-colors ${isActive ? "bg-slate-100 text-black" : "text-slate-600 hover:bg-slate-50 hover:text-black"}`}
                          >
                            {label}
                          </Link>
                        </SheetClose>
                      );
                    })}
                  </nav>
                </SheetContent>
              </Sheet>
            </SignedIn>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 sm:static sm:translate-x-0 sm:flex-shrink-0 sm:flex sm:items-center">
            <Link href="/">
              <Image
                src="/assets/logo.png"
                height={36}
                width={150}
                alt="Association Hélène Chatel"
              />
            </Link>
          </div>

          <nav className="ml-12 hidden h-full items-stretch gap-8 font-cera sm:flex">
            <SignedIn>
              {links.map(({ href, label }) => {
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

          <div className="flex-1 min-w-0 sm:block" />

          <div className="flex h-full min-w-[40px] flex-shrink-0 items-center justify-end">
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
                <UserButton.UserProfilePage label="security" />
              </UserButton>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" className="font-cera bg-emerald-600 hover:bg-emerald-700 text-white text-sm">
                  <LogInIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Se connecter</span>
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
}
