import { redirect } from "next/navigation";
import { AdminNav } from "./admin-nav";
import { isCurrentUserAdmin } from "@/lib/api/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-14 z-40 w-full border-b border-slate-300 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <AdminNav />
        </div>
      </header>
      <main className="container mx-auto px-4 py-4">
        {children}
      </main>
    </div>
  );
}
