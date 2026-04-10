import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { PermissionMatrix } from "./_components/permission-matrix";
import { RoleAssignmentTable } from "./_components/role-assignment-table";

export default async function RolesPage() {
  const session = await requireAdmin();

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl">
        <div className="mb-6 space-y-1">
          <h2 className="text-lg font-bold tracking-tight text-[#300000]">
            Permission Matrix
          </h2>
          <p className="text-sm text-[#888888]">
            Read-only view of what each role can do. Permissions are fixed in
            code; custom roles are not supported in this version.
          </p>
        </div>
        <PermissionMatrix />
      </section>

      <section className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl">
        <div className="mb-6 space-y-1">
          <h2 className="text-lg font-bold tracking-tight text-[#300000]">
            User Role Assignments
          </h2>
          <p className="text-sm text-[#888888]">
            Change a user&apos;s role. You cannot demote your own account.
          </p>
        </div>
        <RoleAssignmentTable
          users={users}
          currentUserId={session.user.id}
        />
      </section>
    </div>
  );
}
