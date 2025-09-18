import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { SharedHeader } from "@/components/shared-header";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";
import "./leaflet.css";

export const metadata: Metadata = {
  title: "Association Châtel",
  description:
    "Découvrez les projets solidaires soutenus par l'Association Châtel et explorez l'arbre généalogique familial",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <SharedHeader />
          <Suspense fallback={null}>{children}</Suspense>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
