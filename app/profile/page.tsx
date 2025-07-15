import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import ProfileEditor from "@/components/profile-editor"

export default async function ProfilePage() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  return <ProfileEditor user={user} />
}
