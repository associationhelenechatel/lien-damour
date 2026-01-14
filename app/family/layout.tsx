import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function FamilyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return <>{children}</>;
}
