import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const { toastSuccessMock, toastErrorMock } = vi.hoisted(() => ({
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}));

vi.mock("@/lib/actions/notification-preferences", () => ({
  saveNotificationPreferences: vi.fn().mockResolvedValue({ success: true }),
}));

import {
  PreferencesForm,
  notificationPreferencesSchema,
} from "@/app/(dashboard)/notifications/preferences/_components/preferences-form";

const baseDefaults = {
  system: true,
  security: true,
  maintenance: true,
  warranty: true,
  inApp: true,
  email: false,
};

function renderForm(overrides: Partial<typeof baseDefaults> = {}) {
  return render(
    <PreferencesForm defaultValues={{ ...baseDefaults, ...overrides }} />
  );
}

describe("PreferencesForm", () => {
  beforeEach(() => {
    toastSuccessMock.mockReset();
    toastErrorMock.mockReset();
  });

  it("renders six switches for the four categories and two delivery channels", () => {
    renderForm();

    expect(screen.getByText("System events")).toBeInTheDocument();
    expect(screen.getByText("Security incidents")).toBeInTheDocument();
    expect(screen.getByText("Scheduled maintenance")).toBeInTheDocument();
    expect(screen.getByText("Warranty alerts")).toBeInTheDocument();
    expect(screen.getByText("In-app")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();

    expect(screen.getAllByRole("switch")).toHaveLength(6);
  });

  it("disables the save button until a switch is toggled", async () => {
    renderForm();

    const saveButton = screen.getByRole("button", { name: /save preferences/i });
    expect(saveButton).toBeDisabled();

    const switches = screen.getAllByRole("switch");
    fireEvent.click(switches[0]!);

    await waitFor(() => {
      expect(saveButton).toBeEnabled();
    });
  });

  it("shows a UI-only success toast on submit and resets dirty state", async () => {
    renderForm();

    const switches = screen.getAllByRole("switch");
    fireEvent.click(switches[0]!);

    fireEvent.submit(screen.getByTestId("preferences-form"));

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledWith(
        "Preferences saved"
      );
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /save preferences/i })
      ).toBeDisabled();
    });
  });

  it("rejects a payload missing a required field via the exported schema", () => {
    const result = notificationPreferencesSchema.safeParse({
      system: true,
      security: true,
      maintenance: true,
      warranty: true,
      inApp: true,
    });
    expect(result.success).toBe(false);
  });

  it("accepts a fully populated boolean payload via the exported schema", () => {
    const result = notificationPreferencesSchema.safeParse(baseDefaults);
    expect(result.success).toBe(true);
  });
});
