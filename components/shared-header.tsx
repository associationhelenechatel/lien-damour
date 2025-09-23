"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Settings, Map, Users, LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginDialog } from "@/components/login-dialog";

export function SharedHeader() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-slate-800 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity">
                Association Hélène Chatel
              </h1>
            </Link>
          </div>

          <div className="flex gap-2 items-center">
            {isAuthenticated ? (
              <>
                <Link href="/family">
                  <Button
                    variant={pathname === "/family" ? "default" : "outline"}
                    className={
                      pathname === "/family"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "border-emerald-300 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                    }
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Famille
                  </Button>
                </Link>
                <Link href="/admin">
                  <Button
                    variant={pathname === "/admin" ? "default" : "outline"}
                    className={
                      pathname === "/admin"
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent"
                    }
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Administration
                  </Button>
                </Link>
                <div className="h-6 w-px bg-slate-300 mx-2" />
                <Button
                  variant="outline"
                  onClick={logout}
                  className="border-red-300 text-red-700 hover:bg-red-50 bg-transparent"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </>
            ) : (
              <LoginDialog>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <LogIn className="h-4 w-4 mr-2" />
                  Espace Famille
                </Button>
              </LoginDialog>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
