import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import LoginPage from "./LoginPage";
import { ToastProvider } from "../../components/ui/Toast";
import { ThemeProvider } from "../../hooks/useTheme";
import "../../styles/design-tokens.css";
import "../../styles/utilities.css";

const meta: Meta<typeof LoginPage> = {
  title: "Auth/LoginPage",
  component: LoginPage,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <BrowserRouter>
          <ThemeProvider>
            <ToastProvider>
              <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
                <Story />
              </div>
            </ToastProvider>
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LoginPage>;

export const Default: Story = {
  name: "Default",
};

export const Loading: Story = {
  name: "Loading",
  parameters: {
    mockData: {
      logIn: vi.fn(() => new Promise(() => {})), // Never resolves
    },
  },
};

export const Error: Story = {
  name: "Error",
  play: async ({ canvasElement }) => {
    const { fireEvent, waitFor, screen } = await import("@testing-library/react");
    const canvas = { getByLabelText: (text: string) => screen.getByLabelText(text), getByRole: (opts: any) => screen.getByRole(opts) };
    fireEvent.change(canvas.getByLabelText(/usuario/i), { target: { value: "admin" } });
    fireEvent.change(canvas.getByLabelText(/contraseña/i), { target: { value: "wrong" } });
    fireEvent.click(canvas.getByRole("button", { name: /ingresar/i }));
    await waitFor(() => {
      expect(screen.getByText("Error de autenticación")).toBeInTheDocument();
    });
  },
};

export const DarkMode: Story = {
  name: "Dark Mode",
  decorators: [
    (Story) => (
      <div data-theme="dark" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <Story />
      </div>
    ),
  ],
};

export const WithTenantBranding: Story = {
  name: "With Tenant Branding",
  parameters: {
    mockData: {
      config: {
        businessName: "Mi Empresa",
        primaryColor: "#1e40af",
        primaryColorHover: "#1e3a8a",
        logoUrl: "/custom-logo.png",
        whatsappNumber: "+5491123456789",
      },
    },
  },
};