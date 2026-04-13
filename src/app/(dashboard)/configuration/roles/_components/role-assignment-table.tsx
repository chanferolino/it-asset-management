"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateUserRole } from "@/lib/actions/roles";
import type { Role } from "@/generated/prisma";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface RoleAssignmentTableProps {
  users: UserRow[];
  currentUserId: string;
}

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "USER", label: "User" },
];

export function RoleAssignmentTable({
  users,
  currentUserId,
}: RoleAssignmentTableProps) {
  const [isPending, startTransition] = useTransition();

  function handleChange(user: UserRow, newRole: Role) {
    if (newRole === user.role) return;

    startTransition(async () => {
      const result = await updateUserRole({ userId: user.id, newRole });
      if (result.success) {
        toast.success(`Updated ${user.name} to ${newRole}`);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
              Name
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
              Email
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
              Role
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-[#888888]">
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => {
              const isSelf = user.id === currentUserId;
              return (
                <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                  <TableCell className="font-medium text-[#300000]">
                    {user.name}
                    {isSelf && (
                      <span className="ml-2 rounded-full bg-red-500/[0.08] px-2 py-0.5 text-xs text-[#c80000]">
                        you
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-[#888888]">{user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) =>
                        handleChange(user, value as Role)
                      }
                      disabled={isSelf || isPending}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} label={opt.label}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
