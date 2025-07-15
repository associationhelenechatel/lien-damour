export async function getUser() {
  // In a real app, this would validate a JWT token or session
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user")
    return userStr ? JSON.parse(userStr) : null
  }
  return null
}
