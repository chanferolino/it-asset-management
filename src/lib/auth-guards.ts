import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasPermission, type PermissionKey } from "@/lib/permissions";
import type { Role } from "@/generated/prisma";

type GuardedSession = {
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
  };
};

export async function requireAdmin(): Promise<GuardedSession> {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return session as GuardedSession;
}

export async function requirePermission(
  key: PermissionKey
): Promise<GuardedSession> {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!hasPermission(session.user.role as Role, key)) {
    redirect("/");
  }

  return session as GuardedSession;
}
