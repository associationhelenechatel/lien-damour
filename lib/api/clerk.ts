"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { User } from "@clerk/nextjs/server";

//TODO: je risque d'avoir + de 100 users
export async function getAllUsers(): Promise<User[]> {
  const client = await clerkClient();
  const { data: users } = await client.users.getUserList({
    limit: 100, // pagination obligatoire au-delà
  });

  return users;
}
