export interface DesignTokens {
  color: {
    primary: string;
    primaryHover: string;
    primaryLight: string;
    primaryText: string;
    success: string;
    successHover: string;
    successLight: string;
    successText: string;
    warning: string;
    warningHover: string;
    warningLight: string;
    warningText: string;
    danger: string;
    dangerHover: string;
    dangerLight: string;
    dangerText: string;
    info: string;
    infoHover: string;
    infoLight: string;
    infoText: string;
    bg: string;
    surface: string;
    surfaceHover: string;
    border: string;
    borderStrong: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    textInverse: string;
  };
  spacing: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
    8: string;
    10: string;
    12: string;
  };
  typography: {
    fontFamilies: {
      sans: string;
      mono: string;
    };
    fontSizes: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      2xl: string;
      3xl: string;
    };
    fontWeights: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
    lineHeights: {
      tight: string;
      normal: string;
      relaxed: string;
    };
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    modal: string;
  };
  zIndex: {
    dropdown: number;
    sticky: number;
    fixed: number;
    modalBackdrop: number;
    modal: number;
    popover: number;
    tooltip: number;
    toast: number;
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    2xl: string;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
  touchTargets: {
    default: string;
    sm: string;
  };
  container: {
    max: string;
    padding: string;
  };
};

declare const tokens: DesignTokens;
export default tokens;
