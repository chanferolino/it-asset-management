"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UsersTable } from "./users-table";
import { UserFormModal } from "./user-form-modal";
import { DeleteUserDialog } from "./delete-user-dialog";
import type { User } from "./types";

interface UsersPageClientProps {
  users: User[];
  departments: string[];
}

export function UsersPageClient({
  users,
  departments,
}: UsersPageClientProps) {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | undefined>();
  const [deleteUser, setDeleteUser] = useState<User | undefined>();

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.department?.toLowerCase().includes(q) ?? false)
    );
  }, [users, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#300000]">
          Users
        </h1>
        <p className="mt-1 text-[#888888]">
          Manage user accounts, roles, and department assignments.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#bbbbbb]"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or department..."
            className="rounded-xl border border-[#e0e0e0] bg-white/60 pl-9 text-[#300000] placeholder:text-[#bbbbbb] backdrop-blur-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/[0.08]"
          />
        </div>
        <Button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="rounded-xl bg-[#c80000] text-white transition-all hover:bg-[#b10000] active:scale-[0.98] active:bg-[#7b0000]"
        >
          Add User <Plus aria-hidden="true" />
        </Button>
      </div>

      <UsersTable
        users={filtered}
        onEdit={setEditUser}
        onDelete={setDeleteUser}
      />

      <UserFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        departments={departments}
      />

      <UserFormModal
        open={editUser !== undefined}
        onOpenChange={(open) => {
          if (!open) setEditUser(undefined);
        }}
        user={editUser}
        departments={departments}
      />

      <DeleteUserDialog
        open={deleteUser !== undefined}
        onOpenChange={(open) => {
          if (!open) setDeleteUser(undefined);
        }}
        user={deleteUser}
      />
    </div>
  );
}
