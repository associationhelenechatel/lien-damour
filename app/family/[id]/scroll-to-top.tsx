"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Évite que Next / le navigateur réappliquent une ancienne position de scroll
 * entre /family/:id et /family/:autreId (même layout parent).
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const prev = history.scrollRestoration;
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    return () => {
      history.scrollRestoration = prev;
    };
  }, [pathname]);

  return null;
}
