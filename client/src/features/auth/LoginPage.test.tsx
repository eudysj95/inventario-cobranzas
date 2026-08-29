import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import LoginPage from "./LoginPage";
import { ToastProvider } from "../../components/ui/Toast";
import { ThemeProvider } from "../../hooks/useTheme";

// Mock the auth and config APIs
const mockLogIn = vi.fn();

vi.mock("../../api/auth", async () => {
  const actual = await vi.importActual("../../api/auth");
  return {
    ...actual,
    GENERIC_LOGIN_ERROR: "Usuario o contraseña incorrectos.",
    useCurrentUser: () => ({
      status: "success",
      data: null,
    }),
    useAuthActions: () => ({
      logIn: mockLogIn,
    }),
  };
});

vi.mock("../../api/config", () => ({
  DEFAULT_CONFIG: {
    businessName: "Nexo",
    currencySymbol: "$",
    currencyLocale: "es-AR",
  },
  useConfig: () => ({
    data: {
      businessName: "Nexo Test",
      primaryColor: "#047857",
      primaryColorHover: "#065f46",
      logoUrl: "/logo-nexo.png",
      whatsappNumber: "+5491123456789",
    },
    isError: false,
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

function renderLoginPage(options = {}) {
  const { theme = "light", ...rest } = options;
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <ToastProvider>
            <div data-theme={theme}>
              <LoginPage {...rest} />
            </div>
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("Rendering", () => {
    it("renders login form with username/email and password fields", () => {
      renderLoginPage();

      expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /ingresar/i })).toBeInTheDocument();
    });

    it("renders tenant branding (logo and business name)", () => {
      renderLoginPage();

      expect(screen.getByAltText("Nexo Test")).toBeInTheDocument();
      expect(screen.getByText("Nexo Test")).toBeInTheDocument();
    });

    it("renders WhatsAppHub inline variant for support link", () => {
      renderLoginPage();

      expect(screen.getByTestId("whatsapp-inline")).toBeInTheDocument();
    });

    it("renders skip link for accessibility", () => {
      renderLoginPage();

      expect(screen.getByText("Saltar al contenido principal")).toBeInTheDocument();
    });

    it("renders in dark mode when data-theme=dark", () => {
      renderLoginPage({ theme: "dark" });

      const wrapper = screen.getByTestId("login-card").closest('[data-theme]');
      expect(wrapper).toHaveAttribute("data-theme", "dark");
    });
  });

  describe("Form Submission", () => {
    it("disables submit button when fields are empty", () => {
      renderLoginPage();

      const submitButton = screen.getByRole("button", { name: /ingresar/i });
      expect(submitButton).toBeDisabled();
    });

    it("enables submit button when both fields are filled", () => {
      renderLoginPage();

      fireEvent.change(screen.getByLabelText(/usuario/i), { target: { value: "admin" } });
      fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: "password123" } });

      const submitButton = screen.getByRole("button", { name: /ingresar/i });
      expect(submitButton).not.toBeDisabled();
    });

    it("shows loading state during submission", async () => {
      mockLogIn.mockResolvedValueOnce({ user: { id: 1, username: "admin" } });

      renderLoginPage();

      fireEvent.change(screen.getByLabelText(/usuario/i), { target: { value: "admin" } });
      fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: "password123" } });

      fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));

      // Button should show loading state (aria-busy and spinner)
      const submitButton = screen.getByRole("button", { name: /ingresar/i });
      expect(submitButton).toHaveAttribute("aria-busy", "true");
      expect(submitButton).toHaveAttribute("aria-disabled", "true");
      expect(screen.getByTestId("login-card").querySelector(".spinner")).toBeInTheDocument();
    });

    it("shows error toast on invalid credentials", async () => {
      mockLogIn.mockRejectedValueOnce(new Error("Usuario o contraseña incorrectos."));

      renderLoginPage();

      fireEvent.change(screen.getByLabelText(/usuario/i), { target: { value: "admin" } });
      fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: "wrong" } });
      fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));

      await waitFor(() => {
        // Check for the toast (rendered in portal)
        expect(screen.getByText("Error de autenticación")).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes on form fields", () => {
      renderLoginPage();

      const usernameInput = screen.getByLabelText(/usuario/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);

      expect(usernameInput).toHaveAttribute("required");
      expect(usernameInput).toHaveAttribute("autocomplete", "username");
      expect(passwordInput).toHaveAttribute("required");
      expect(passwordInput).toHaveAttribute("autocomplete", "current-password");
    });

    it("associates error message with inputs via aria-describedby", async () => {
      mockLogIn.mockRejectedValueOnce(new Error("Usuario o contraseña incorrectos."));

      renderLoginPage();

      fireEvent.change(screen.getByLabelText(/usuario/i), { target: { value: "admin" } });
      fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: "wrong" } });
      fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));

      await waitFor(() => {
        // The input should have aria-describedby pointing to an error element
        // (FormField adds its own error ID for field-level errors)
        expect(screen.getByLabelText(/usuario/i)).toHaveAttribute("aria-describedby");
      });
    });

    it("manages focus correctly on error", async () => {
      mockLogIn.mockRejectedValueOnce(new Error("Usuario o contraseña incorrectos."));

      renderLoginPage();

      fireEvent.change(screen.getByLabelText(/usuario/i), { target: { value: "admin" } });
      fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: "wrong" } });
      fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/usuario/i)).toHaveFocus();
      });
    });
  });

  describe("Responsive Layout", () => {
    it("renders card with max-width constraint on desktop", () => {
      renderLoginPage();

      const card = screen.getByTestId("login-card");
      expect(card).toHaveClass("max-w-[380px]");
    });
  });
});