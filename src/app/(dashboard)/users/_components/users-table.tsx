"use client";

import { Pencil, UserX } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { User } from "./types";

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const ROLE_STYLES: Record<User["role"], string> = {
  ADMIN: "bg-red-500/[0.08] text-[#c80000]",
  MANAGER: "bg-amber-500/[0.08] text-amber-700",
  USER: "bg-gray-500/[0.08] text-[#555555]",
};

const STATUS_STYLES: Record<User["status"], string> = {
  ACTIVE: "bg-green-500/[0.08] text-green-700",
  INACTIVE: "bg-gray-500/[0.08] text-[#888888]",
};

const TH_CLASS = "text-xs font-semibold uppercase tracking-wide text-[#555555]";

export function UsersTable({ users, onEdit, onDelete }: UsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[#e0e0e0] bg-white/40 p-10 text-center backdrop-blur-xl">
        <p className="text-sm text-[#888888]">No users found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/80 bg-white/70 shadow-xl shadow-black/[0.08] backdrop-blur-xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={TH_CLASS}>Name</TableHead>
            <TableHead className={TH_CLASS}>Email</TableHead>
            <TableHead className={TH_CLASS}>Role</TableHead>
            <TableHead className={TH_CLASS}>Department</TableHead>
            <TableHead className={TH_CLASS}>Status</TableHead>
            <TableHead className={cn(TH_CLASS, "text-right")}>
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium text-[#300000]">
                {user.name}
              </TableCell>
              <TableCell className="text-[#888888]">{user.email}</TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    "border-transparent text-xs font-medium",
                    ROLE_STYLES[user.role]
                  )}
                >
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell className="text-[#888888]">
                {user.department ?? "\u2014"}
              </TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    "border-transparent text-xs font-medium",
                    STATUS_STYLES[user.status]
                  )}
                >
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => onEdit(user)}
                    className="text-[#888888] transition-all hover:text-[#300000]"
                  >
                    <Pencil aria-hidden="true" />
                    <span className="sr-only">Edit {user.name}</span>
                  </Button>
                  {user.status === "ACTIVE" && (
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => onDelete(user)}
                      className="text-[#888888] transition-all hover:text-[#c80000]"
                    >
                      <UserX aria-hidden="true" />
                      <span className="sr-only">Deactivate {user.name}</span>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
