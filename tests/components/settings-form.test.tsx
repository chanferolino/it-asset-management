import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const { updateSettingsMock, toastSuccessMock, toastErrorMock } = vi.hoisted(
  () => ({
    updateSettingsMock: vi.fn(),
    toastSuccessMock: vi.fn(),
    toastErrorMock: vi.fn(),
  })
);

vi.mock("@/lib/actions/settings", () => ({
  updateSettings: updateSettingsMock,
}));

vi.mock("sonner", () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}));

import { SettingsForm } from "@/app/(dashboard)/configuration/settings/_components/settings-form";

const baseDefaults = {
  siteName: "IT Asset Management",
  supportEmail: "support@company.com",
  notificationsEnabled: true,
  smtpHost: "",
  smtpFromAddress: "",
};

function renderForm(overrides: Partial<typeof baseDefaults> = {}) {
  return render(
    <SettingsForm defaultValues={{ ...baseDefaults, ...overrides }} />
  );
}

function setInputValue(input: HTMLElement, value: string) {
  fireEvent.change(input, { target: { value } });
}

describe("SettingsForm", () => {
  beforeEach(() => {
    updateSettingsMock.mockReset();
    toastSuccessMock.mockReset();
    toastErrorMock.mockReset();
  });

  it("renders the key fields populated from defaults", () => {
    renderForm({ siteName: "Acme Assets" });

    expect(screen.getByLabelText(/site name/i)).toHaveValue("Acme Assets");
    expect(screen.getByLabelText(/support email/i)).toHaveValue(
      "support@company.com"
    );
  });

  it("disables the submit button until a field is changed", async () => {
    renderForm();

    const button = screen.getByRole("button", { name: /save changes/i });
    expect(button).toBeDisabled();

    setInputValue(screen.getByLabelText(/site name/i), "Updated");

    await waitFor(() => {
      expect(button).toBeEnabled();
    });
  });

  it("submits valid changes and shows a success toast", async () => {
    updateSettingsMock.mockResolvedValue({ success: true });
    renderForm();

    setInputValue(screen.getByLabelText(/site name/i), "Acme Assets");
    fireEvent.submit(screen.getByTestId("settings-form"));

    await waitFor(() => {
      expect(updateSettingsMock).toHaveBeenCalledTimes(1);
    });
    expect(updateSettingsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        siteName: "Acme Assets",
        supportEmail: "support@company.com",
      })
    );
    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledWith("Settings saved");
    });
  });

  it("shows an error toast when the server action reports failure", async () => {
    updateSettingsMock.mockResolvedValue({
      success: false,
      error: "Something went wrong",
    });
    renderForm();

    setInputValue(screen.getByLabelText(/site name/i), "Acme");
    fireEvent.submit(screen.getByTestId("settings-form"));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Something went wrong");
    });
  });

  it("blocks submission and shows a validation message for an invalid email", async () => {
    renderForm();

    setInputValue(
      screen.getByLabelText(/support email/i),
      "not-an-email"
    );
    fireEvent.submit(screen.getByTestId("settings-form"));

    expect(
      await screen.findByText(/valid email address/i)
    ).toBeInTheDocument();
    expect(updateSettingsMock).not.toHaveBeenCalled();
  });
});
