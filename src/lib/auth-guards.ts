import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

async function validateSessionUser(session: GuardedSession): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });

  if (!user) {
    await signOut({ redirect: false });
    redirect("/login");
  }
}

export async function requireAdmin(): Promise<GuardedSession> {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const guarded = session as GuardedSession;
  await validateSessionUser(guarded);

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return guarded;
}

export async function requirePermission(
  key: PermissionKey
): Promise<GuardedSession> {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const guarded = session as GuardedSession;
  await validateSessionUser(guarded);

  if (!hasPermission(session.user.role as Role, key)) {
    redirect("/");
  }

  return guarded;
}
