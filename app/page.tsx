import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import Dashboard from "@/components/dashboard";

export default async function Home() {
  const user = await getUser();

  // if (!user) {
  //   redirect("/login");
  // }

  return <Dashboard user={user} />;
}
