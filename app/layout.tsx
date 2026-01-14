import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { SharedHeader } from "@/components/shared-header";
import "./globals.css";
import "./leaflet.css";

export const metadata: Metadata = {
  title: "Association Hélène Chatel",
  description:
    "Découvrez les projets solidaires soutenus par l'Association Hélène Chatel et explorez l'arbre généalogique familial",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body
          className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}
        >
          <SharedHeader />
          <Suspense fallback={null}>{children}</Suspense>
          <Toaster />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
