import type React from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { SharedHeader } from "@/components/header/shared-header";
import { isCurrentUserAdmin } from "@/lib/api/admin";
import "./globals.css";

export const metadata: Metadata = {
  title: "Association Hélène Chatel",
  description:
    "Découvrez les projets solidaires soutenus par l'Association Hélène Chatel et explorez l'arbre généalogique familial",
  generator: "v0.app",
};

const ceraProFont = localFont({
  src: "./fonts/CeraPro.woff2",
  variable: "--font-cera-pro",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAdmin = await isCurrentUserAdmin();
  return (
    <ClerkProvider>
      <html lang="fr">
        <body
          className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${ceraProFont.variable}`}
        >
          <SharedHeader isAdmin={isAdmin} />
          <Suspense fallback={null}>{children}</Suspense>
          <Toaster />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
