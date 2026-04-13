import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { UsersTable } from "@/app/(dashboard)/users/_components/users-table";
import type { User } from "@/app/(dashboard)/users/_components/types";

const ACTIVE_ADMIN: User = {
  id: "u_001",
  name: "Alice Admin",
  email: "alice@example.com",
  role: "ADMIN",
  status: "ACTIVE",
  department: "Engineering",
  phone: "+1 555-0001",
  createdAt: new Date("2026-01-10T09:00:00Z"),
  updatedAt: new Date("2026-01-10T09:00:00Z"),
};

const ACTIVE_MANAGER: User = {
  id: "u_002",
  name: "Bob Manager",
  email: "bob@example.com",
  role: "MANAGER",
  status: "ACTIVE",
  department: null,
  phone: null,
  createdAt: new Date("2026-02-01T09:00:00Z"),
  updatedAt: new Date("2026-02-01T09:00:00Z"),
};

const INACTIVE_USER: User = {
  id: "u_003",
  name: "Carol User",
  email: "carol@example.com",
  role: "USER",
  status: "INACTIVE",
  department: "Marketing",
  phone: null,
  createdAt: new Date("2026-03-01T09:00:00Z"),
  updatedAt: new Date("2026-03-01T09:00:00Z"),
};

describe("UsersTable", () => {
  it("renders user data in table rows", () => {
    render(
      <UsersTable
        users={[ACTIVE_ADMIN]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("Alice Admin")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("ADMIN")).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
  });

  it("shows em dash for null department", () => {
    render(
      <UsersTable
        users={[ACTIVE_MANAGER]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("\u2014")).toBeInTheDocument();
  });

  it("shows correct role badge styles", () => {
    render(
      <UsersTable
        users={[ACTIVE_ADMIN, ACTIVE_MANAGER, INACTIVE_USER]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    const adminBadge = screen.getByText("ADMIN");
    expect(adminBadge.className).toContain("text-[#c80000]");

    const managerBadge = screen.getByText("MANAGER");
    expect(managerBadge.className).toContain("text-amber-700");

    const userBadge = screen.getByText("USER");
    expect(userBadge.className).toContain("text-[#555555]");
  });

  it("shows correct status badge styles", () => {
    render(
      <UsersTable
        users={[ACTIVE_ADMIN, INACTIVE_USER]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    const activeBadge = screen.getByText("ACTIVE");
    expect(activeBadge.className).toContain("text-green-700");

    const inactiveBadge = screen.getByText("INACTIVE");
    expect(inactiveBadge.className).toContain("text-[#888888]");
  });

  it("calls onEdit when edit button is clicked", () => {
    const onEdit = vi.fn();

    render(
      <UsersTable users={[ACTIVE_ADMIN]} onEdit={onEdit} onDelete={vi.fn()} />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /edit alice admin/i }),
    );
    expect(onEdit).toHaveBeenCalledOnce();
    expect(onEdit).toHaveBeenCalledWith(ACTIVE_ADMIN);
  });

  it("calls onDelete when deactivate button is clicked", () => {
    const onDelete = vi.fn();

    render(
      <UsersTable
        users={[ACTIVE_ADMIN]}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /deactivate alice admin/i }),
    );
    expect(onDelete).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledWith(ACTIVE_ADMIN);
  });

  it("hides deactivate button for inactive users", () => {
    render(
      <UsersTable
        users={[INACTIVE_USER]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /deactivate carol user/i }),
    ).not.toBeInTheDocument();
    // Edit button should still be present
    expect(
      screen.getByRole("button", { name: /edit carol user/i }),
    ).toBeInTheDocument();
  });

  it("shows empty state when no users", () => {
    render(
      <UsersTable users={[]} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(screen.getByText("No users found.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
