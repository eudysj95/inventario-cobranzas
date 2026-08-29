/**
 * Generate CSS custom properties from tokens.json
 * Reads design-system/tokens.json and outputs client/src/styles/design-tokens.css
 */

import { writeFileSync } from 'node:fs';

function generateCSS(tokens, outputPath) {
  let css = `/* Nexo — Design Tokens
   Single source of truth for color, spacing, typography, shadows, radius, transitions.
   Tenant overrides are injected at runtime via /api/config (see App.jsx). */

:root {
`;

  // Color tokens
  css += `  /* === SEMANTIC COLOR SYSTEM ===
     No brand-specific hues — only universal meaning. */

  /* Primary = Main actions, links, focus, active nav */
  ${formatColorToken(tokens.color, 'primary')}
  ${formatColorToken(tokens.color, 'primaryHover')}
  ${formatColorToken(tokens.color, 'primaryLight')}
  ${formatColorToken(tokens.color, 'primaryText')}

  /* Success = Confirmed, paid, available, OK */
  ${formatColorToken(tokens.color, 'success')}
  ${formatColorToken(tokens.color, 'successHover')}
  ${formatColorToken(tokens.color, 'successLight')}
  ${formatColorToken(tokens.color, 'successText')}

  /* Warning = Pending, attention, apartado, due soon */
  ${formatColorToken(tokens.color, 'warning')}
  ${formatColorToken(tokens.color, 'warningHover')}
  ${formatColorToken(tokens.color, 'warningLight')}
  ${formatColorToken(tokens.color, 'warningText')}

  /* Danger = Error, overdue, cancelled, delete, critical stock */
  ${formatColorToken(tokens.color, 'danger')}
  ${formatColorToken(tokens.color, 'dangerHover')}
  ${formatColorToken(tokens.color, 'dangerLight')}
  ${formatColorToken(tokens.color, 'dangerText')}

  /* Info = Neutral info, credit, available */
  ${formatColorToken(tokens.color, 'info')}
  ${formatColorToken(tokens.color, 'infoHover')}
  ${formatColorToken(tokens.color, 'infoLight')}
  ${formatColorToken(tokens.color, 'infoText')}

  /* === NEUTRALS === */
  ${formatColorToken(tokens.color, 'bg')}
  ${formatColorToken(tokens.color, 'surface')}
  ${formatColorToken(tokens.color, 'surfaceHover')}
  ${formatColorToken(tokens.color, 'border')}
  ${formatColorToken(tokens.color, 'borderStrong')}
  ${formatColorToken(tokens.color, 'text')}
  ${formatColorToken(tokens.color, 'textSecondary')}
  ${formatColorToken(tokens.color, 'textMuted')}
  ${formatColorToken(tokens.color, 'textInverse')}

  /* === TYPOGRAPHY === */
  ${formatToken(tokens.typography.fontFamilies, 'sans', 'font-sans')}
  ${formatToken(tokens.typography.fontFamilies, 'mono', 'font-mono')}
  ${formatToken(tokens.typography.fontSizes, 'xs', 'text-xs')}
  ${formatToken(tokens.typography.fontSizes, 'sm', 'text-sm')}
  ${formatToken(tokens.typography.fontSizes, 'base', 'text-base')}
  ${formatToken(tokens.typography.fontSizes, 'lg', 'text-lg')}
  ${formatToken(tokens.typography.fontSizes, 'xl', 'text-xl')}
  ${formatToken(tokens.typography.fontSizes, '2xl', 'text-2xl')}
  ${formatToken(tokens.typography.fontSizes, '3xl', 'text-3xl')}
  ${formatToken(tokens.typography.fontWeights, 'normal', 'font-weight-normal')}
  ${formatToken(tokens.typography.fontWeights, 'medium', 'font-weight-medium')}
  ${formatToken(tokens.typography.fontWeights, 'semibold', 'font-weight-semibold')}
  ${formatToken(tokens.typography.fontWeights, 'bold', 'font-weight-bold')}
  ${formatToken(tokens.typography.lineHeights, 'tight', 'line-height-tight')}
  ${formatToken(tokens.typography.lineHeights, 'normal', 'line-height-normal')}
  ${formatToken(tokens.typography.lineHeights, 'relaxed', 'line-height-relaxed')}

  /* === SPACING SCALE (4px base) === */
  ${formatToken(tokens.spacing, '1', 'space-1')}
  ${formatToken(tokens.spacing, '2', 'space-2')}
  ${formatToken(tokens.spacing, '3', 'space-3')}
  ${formatToken(tokens.spacing, '4', 'space-4')}
  ${formatToken(tokens.spacing, '5', 'space-5')}
  ${formatToken(tokens.spacing, '6', 'space-6')}
  ${formatToken(tokens.spacing, '8', 'space-8')}
  ${formatToken(tokens.spacing, '10', 'space-10')}
  ${formatToken(tokens.spacing, '12', 'space-12')}

  /* === RADIUS === */
  ${formatToken(tokens.borderRadius, 'sm', 'radius-sm')}
  ${formatToken(tokens.borderRadius, 'md', 'radius-md')}
  ${formatToken(tokens.borderRadius, 'lg', 'radius-lg')}
  ${formatToken(tokens.borderRadius, 'xl', 'radius-xl')}
  ${formatToken(tokens.borderRadius, 'full', 'radius-full')}

  /* === SHADOWS === */
  ${formatToken(tokens.shadows, 'xs', 'shadow-xs')}
  ${formatToken(tokens.shadows, 'sm', 'shadow-sm')}
  ${formatToken(tokens.shadows, 'md', 'shadow-md')}
  ${formatToken(tokens.shadows, 'lg', 'shadow-lg')}
  ${formatToken(tokens.shadows, 'xl', 'shadow-xl')}
  ${formatToken(tokens.shadows, 'modal', 'shadow-modal')}

  /* === TRANSITIONS === */
  ${formatToken(tokens.transitions, 'fast', 'transition-fast')}
  ${formatToken(tokens.transitions, 'normal', 'transition-normal')}
  ${formatToken(tokens.transitions, 'slow', 'transition-slow')}

  /* === Z-INDEX SCALE === */
  ${formatToken(tokens.zIndex, 'dropdown', 'z-dropdown')}
  ${formatToken(tokens.zIndex, 'sticky', 'z-sticky')}
  ${formatToken(tokens.zIndex, 'fixed', 'z-fixed')}
  ${formatToken(tokens.zIndex, 'modalBackdrop', 'z-modal-backdrop')}
  ${formatToken(tokens.zIndex, 'modal', 'z-modal')}
  ${formatToken(tokens.zIndex, 'popover', 'z-popover')}
  ${formatToken(tokens.zIndex, 'tooltip', 'z-tooltip')}
  ${formatToken(tokens.zIndex, 'toast', 'z-toast')}

  /* === BREAKPOINTS === */
  ${formatToken(tokens.breakpoints, 'sm', 'bp-sm')}
  ${formatToken(tokens.breakpoints, 'md', 'bp-md')}
  ${formatToken(tokens.breakpoints, 'lg', 'bp-lg')}
  ${formatToken(tokens.breakpoints, 'xl', 'bp-xl')}
  ${formatToken(tokens.breakpoints, '2xl', 'bp-2xl')}

  /* === TOUCH TARGETS (WCAG 2.5.5) === */
  ${formatToken(tokens.touchTargets, 'default', 'touch-target')}
  ${formatToken(tokens.touchTargets, 'sm', 'touch-target-sm')}

  /* === CONTAINER === */
  ${formatToken(tokens.container, 'max', 'container-max')}
  ${formatToken(tokens.container, 'padding', 'container-padding')}

/* === TENANT OVERRIDES (injected at runtime via /api/config) === */
  ${formatToken(tokens.tenant, 'primary', 'tenant-primary')}
  ${formatToken(tokens.tenant, 'primaryHover', 'tenant-primary-hover')}
  ${formatToken(tokens.tenant, 'primaryLight', 'tenant-primary-light')}
  ${formatToken(tokens.tenant, 'primaryText', 'tenant-primary-text')}
  ${formatToken(tokens.tenant, 'bg', 'tenant-bg')}
  ${formatToken(tokens.tenant, 'surface', 'tenant-surface')}
  ${formatToken(tokens.tenant, 'font', 'tenant-font')}
  ${formatToken(tokens.tenant, 'name', 'tenant-name')}
  ${formatToken(tokens.tenant, 'logo', 'tenant-logo')}
}

`;

  // Second :root block for runtime tenant application
  // This maps color-* variables to tenant-* variables
  css += `/* Tenant runtime values — applied via inline style on :root in App.jsx */
:root {
  ${formatRuntimeTenantToken(tokens.tenant, 'primary', 'color-primary')}
  ${formatRuntimeTenantToken(tokens.tenant, 'primaryHover', 'color-primary-hover')}
  ${formatRuntimeTenantToken(tokens.tenant, 'primaryLight', 'color-primary-light')}
  ${formatRuntimeTenantToken(tokens.tenant, 'primaryText', 'color-primary-text')}
  ${formatRuntimeTenantToken(tokens.tenant, 'bg', 'color-bg')}
  ${formatRuntimeTenantToken(tokens.tenant, 'surface', 'color-surface')}
  ${formatRuntimeTenantToken(tokens.tenant, 'font', 'font-sans')}
}
`;

  // Dark mode
  if (tokens.darkMode && Object.keys(tokens.darkMode).length > 0) {
    css += `
/* Dark mode — opt-in via data-theme="dark" on <html> */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${formatDarkModeBlock(tokens.darkMode)}
  }
}
`;
  }

  // High contrast
  if (tokens.highContrast && Object.keys(tokens.highContrast).length > 0) {
    css += `
/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
${formatHighContrastBlock(tokens.highContrast)}
  }
}
`;
  }

  // Reduced motion
  if (tokens.reducedMotion && Object.keys(tokens.reducedMotion).length > 0) {
    css += `
/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  :root {
${formatReducedMotionBlock(tokens.reducedMotion)}
  }
}
`;
  }

  // Print
  if (tokens.print && Object.keys(tokens.print).length > 0) {
    css += `
/* Print styles */
@media print {
  :root {
${formatPrintBlock(tokens.print)}
  }
}
`;
  }

  writeFileSync(outputPath, css);
}

function formatColorToken(category, key) {
  const token = category[key];
  if (!token) return '';
  
  // Convert camelCase to kebab-case with color- prefix
  const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
  const value = token.value;
  return `  --color-${cssVarName}: ${value};\n`;
}

function formatToken(category, key, cssName) {
  const token = category[key];
  if (!token) return '';
  
  const value = token.value;
  return `  --${cssName}: ${value};\n`;
}

function formatRuntimeTenantToken(tenantTokens, key, cssName) {
  // The tenant token value is like "var(--color-primary)" 
  // We need to generate "--color-primary: var(--tenant-primary);"
  // The tenant key in camelCase (e.g., 'primary') becomes 'tenant-primary' in kebab-case
  const tenantVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
  return `  --${cssName}: var(--tenant-${tenantVarName});\n`;
}

function toKebabCase(str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

function formatDarkModeBlock(modeTokens) {
  let css = '';
  for (const [key, token] of Object.entries(modeTokens)) {
    let cssVarName;
    // Dark mode shadow keys are xs, sm, md, lg, xl, modal (no 'shadow' prefix)
    if (['xs', 'sm', 'md', 'lg', 'xl', 'modal'].includes(key)) {
      cssVarName = 'shadow-' + key;
    } else {
      // color tokens: bg -> color-bg, primaryLight -> color-primary-light, etc.
      cssVarName = 'color-' + toKebabCase(key);
    }
    css += `    --${cssVarName}: ${token.value};\n`;
  }
  return css;
}

function formatHighContrastBlock(modeTokens) {
  let css = '';
  for (const [key, token] of Object.entries(modeTokens)) {
    let cssVarName;
    // High contrast keys: border, borderStrong, shadowSm, shadowMd, shadowLg
    // Convert full key to kebab-case, then add appropriate prefix
    if (key.startsWith('shadow')) {
      cssVarName = toKebabCase(key);
    } else if (key.startsWith('border')) {
      cssVarName = 'color-' + toKebabCase(key);
    } else {
      cssVarName = 'color-' + toKebabCase(key);
    }
    css += `    --${cssVarName}: ${token.value};\n`;
  }
  return css;
}

function formatReducedMotionBlock(modeTokens) {
  let css = '';
  for (const [key, token] of Object.entries(modeTokens)) {
    // Reduced motion keys: transitionFast, transitionNormal, transitionSlow
    // Convert full key to kebab-case
    const cssVarName = toKebabCase(key);
    css += `    --${cssVarName}: ${token.value};\n`;
  }
  return css;
}

function formatPrintBlock(modeTokens) {
  let css = '';
  for (const [key, token] of Object.entries(modeTokens)) {
    let cssVarName;
    // Print keys: bg, surface, text, shadowSm, shadowMd, shadowLg, shadowXl, shadowModal
    if (key.startsWith('shadow')) {
      cssVarName = toKebabCase(key);
    } else {
      cssVarName = 'color-' + toKebabCase(key);
    }
    css += `    --${cssVarName}: ${token.value};\n`;
  }
  return css;
}

export { generateCSS };