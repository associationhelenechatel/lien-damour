"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { User } from "@clerk/nextjs/server";

export async function getAllUsers(): Promise<User[]> {
  const client = await clerkClient();
  const { data: users } = await client.users.getUserList({
    limit: 100, // pagination obligatoire au-delà
  });

  return users;
}
