import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const { pathnameMock } = vi.hoisted(() => ({
  pathnameMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: pathnameMock,
}));

import { ConfigTabs } from "@/app/(dashboard)/configuration/_components/config-tabs";

function renderWithPath(path: string) {
  pathnameMock.mockReturnValue(path);
  return render(<ConfigTabs />);
}

describe("ConfigTabs", () => {
  afterEach(() => {
    pathnameMock.mockReset();
  });

  it("renders all four configuration tab links with correct hrefs", () => {
    renderWithPath("/configuration/settings");

    const expected = [
      { label: "System Settings", href: "/configuration/settings" },
      { label: "Roles & Permissions", href: "/configuration/roles" },
      { label: "Integrations", href: "/configuration/integrations" },
      { label: "Backup & Restore", href: "/configuration/backup" },
    ];

    for (const tab of expected) {
      const link = screen.getByRole("link", { name: tab.label });
      expect(link).toHaveAttribute("href", tab.href);
    }
  });

  it("marks the Settings tab as the current page when pathname matches", () => {
    renderWithPath("/configuration/settings");

    const settingsLink = screen.getByRole("link", { name: "System Settings" });
    expect(settingsLink).toHaveAttribute("aria-current", "page");

    const rolesLink = screen.getByRole("link", { name: "Roles & Permissions" });
    expect(rolesLink).not.toHaveAttribute("aria-current");
  });

  it("marks the Roles tab as the current page when on a roles sub-route", () => {
    renderWithPath("/configuration/roles");

    const rolesLink = screen.getByRole("link", { name: "Roles & Permissions" });
    expect(rolesLink).toHaveAttribute("aria-current", "page");

    const settingsLink = screen.getByRole("link", { name: "System Settings" });
    expect(settingsLink).not.toHaveAttribute("aria-current");
  });

  it("marks the Integrations tab as the current page when on integrations", () => {
    renderWithPath("/configuration/integrations");

    expect(
      screen.getByRole("link", { name: "Integrations" })
    ).toHaveAttribute("aria-current", "page");
  });

  it("marks the Backup tab as the current page when on backup", () => {
    renderWithPath("/configuration/backup");

    expect(
      screen.getByRole("link", { name: "Backup & Restore" })
    ).toHaveAttribute("aria-current", "page");
  });
});
