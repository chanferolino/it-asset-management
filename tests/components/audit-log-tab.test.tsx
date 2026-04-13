import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/actions/reports", () => ({
  getAuditLogs: vi.fn(),
  getAuditLogCount: vi.fn(),
}));

vi.mock("@/lib/csv-export", () => ({
  exportToCsv: vi.fn(),
}));

import { AuditLogTab } from "@/app/(dashboard)/reports/_components/audit-log-tab";
import type { AuditLogEntry } from "@/app/(dashboard)/reports/_components/types";

const MOCK_LOGS: AuditLogEntry[] = [
  {
    id: "log_1",
    action: "CREATE",
    entity: "Asset",
    entityId: "asset_abc123",
    details: '{"name":"MacBook Pro"}',
    createdAt: "2026-03-15T14:30:00.000Z",
    user: { id: "u1", name: "Alice Johnson" },
  },
  {
    id: "log_2",
    action: "DELETE",
    entity: "Vendor",
    entityId: "vendor_xyz789",
    details: null,
    createdAt: "2026-03-14T09:00:00.000Z",
    user: null,
  },
];

describe("AuditLogTab", () => {
  it("renders audit log entries with action badge, entity, user, and date", () => {
    render(<AuditLogTab initialLogs={MOCK_LOGS} initialCount={2} />);

    // Action badges
    expect(screen.getByText("Create")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();

    // Entity names
    expect(screen.getByText("Asset")).toBeInTheDocument();
    expect(screen.getByText("Vendor")).toBeInTheDocument();

    // User name
    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();

    // Pagination info
    expect(screen.getByText(/Page 1 of 1/)).toBeInTheDocument();
  });

  it("shows empty state when no entries", () => {
    render(<AuditLogTab initialLogs={[]} initialCount={0} />);

    expect(screen.getByText("No audit logs found.")).toBeInTheDocument();
  });

  it('shows "System" for entries with no user', () => {
    render(<AuditLogTab initialLogs={MOCK_LOGS} initialCount={2} />);

    expect(screen.getByText("System")).toBeInTheDocument();
  });
});
