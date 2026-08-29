import type { Preview, Decorator } from "@storybook/react";
import React, { useEffect } from "react";
import "../src/styles/design-tokens.css";
import "../src/styles/utilities.css";

// Dark mode decorator
export const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme || "light";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div data-theme={theme} className="min-h-screen">
      <Story />
    </div>
  );
};

// RTL decorator
export const withRTL: Decorator = (Story, context) => {
  const isRTL = context.globals.rtl || false;

  useEffect(() => {
    document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
  }, [isRTL]);

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <Story />
    </div>
  );
};

// Combined decorator
export const decorators = [withTheme, withRTL];

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#fafafa" },
        { name: "dark", value: "#111827" },
        { name: "white", value: "#ffffff" },
      ],
    },
    a11y: {
      config: {
        rules: [
          { id: "color-contrast", enabled: true },
        ],
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
    ...decorators,
  ],
  globalTypes: {
    theme: {
      description: "Global theme for components",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: ["light", "dark"],
        dynamicTitle: true,
      },
    },
    rtl: {
      description: "Right-to-left direction",
      defaultValue: false,
      toolbar: {
        title: "RTL",
        icon: "mirror",
        items: [
          { value: false, title: "LTR" },
          { value: true, title: "RTL" },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;