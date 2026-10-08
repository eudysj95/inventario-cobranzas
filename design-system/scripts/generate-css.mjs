/**
 * Generate CSS custom properties from tokens.json
 * Reads design-system/tokens.json and outputs client/src/styles/design-tokens.css
 */

import { writeFileSync } from 'node:fs';

function generateCSS(tokens, outputPath) {
  const c = tokens.color;
  const t = tokens.typography;
  const s = tokens.spacing;
  const b = tokens.borderRadius;
  const sh = tokens.shadows;
  const tr = tokens.transitions;
  const z = tokens.zIndex;
  const bp = tokens.breakpoints;
  const tt = tokens.touchTargets;
  const cn = tokens.container;
  const tn = tokens.tenant;
  const dm = tokens.darkMode || {};
  const hc = tokens.highContrast || {};
  const rm = tokens.reducedMotion || {};
  const pr = tokens.print || {};

  let css = `/* Nexo — Design Tokens
   Single source of truth for color, spacing, typography, shadows, radius, transitions.
   Tenant overrides are injected at runtime via /api/config (see App.jsx). */

:root {
  /* === SEMANTIC COLOR SYSTEM ===
     No brand-specific hues — only universal meaning. */

  /* Primary = Main actions, links, focus, active nav */
  --color-primary: ${c.primary.value};
  --color-primary-hover: ${c.primaryHover.value};
  --color-primary-light: ${c.primaryLight.value};
  --color-primary-text: ${c.primaryText.value};

  /* Success = Confirmed, paid, available, OK */
  --color-success: ${c.success.value};
  --color-success-hover: ${c.successHover.value};
  --color-success-light: ${c.successLight.value};
  --color-success-text: ${c.successText.value};

  /* Warning = Pending, attention, apartado, due soon */
  --color-warning: ${c.warning.value};
  --color-warning-hover: ${c.warningHover.value};
  --color-warning-light: ${c.warningLight.value};
  --color-warning-text: ${c.warningText.value};

  /* Danger = Error, overdue, cancelled, delete, critical stock */
  --color-danger: ${c.danger.value};
  --color-danger-hover: ${c.dangerHover.value};
  --color-danger-light: ${c.dangerLight.value};
  --color-danger-text: ${c.dangerText.value};

  /* Info = Neutral info, credit, available */
  --color-info: ${c.info.value};
  --color-info-hover: ${c.infoHover.value};
  --color-info-light: ${c.infoLight.value};
  --color-info-text: ${c.infoText.value};

  /* === NEUTRALS === */
  --color-bg: ${c.bg.value};
  --color-surface: ${c.surface.value};
  --color-surface-hover: ${c.surfaceHover.value};
  --color-border: ${c.border.value};
  --color-border-strong: ${c.borderStrong.value};
  --color-text: ${c.text.value};
  --color-text-secondary: ${c.textSecondary.value};
  --color-text-muted: ${c.textMuted.value};
  --color-text-inverse: ${c.textInverse.value};

  /* === TYPOGRAPHY === */
  --font-sans: ${t.fontFamilies.sans.value};
  --font-mono: ${t.fontFamilies.mono.value};
  --text-xs: ${t.fontSizes.xs.value};
  --text-sm: ${t.fontSizes.sm.value};
  --text-base: ${t.fontSizes.base.value};
  --text-lg: ${t.fontSizes.lg.value};
  --text-xl: ${t.fontSizes.xl.value};
  --text-2xl: ${t.fontSizes['2xl'].value};
  --text-3xl: ${t.fontSizes['3xl'].value};
  --font-weight-normal: ${t.fontWeights.normal.value};
  --font-weight-medium: ${t.fontWeights.medium.value};
  --font-weight-semibold: ${t.fontWeights.semibold.value};
  --font-weight-bold: ${t.fontWeights.bold.value};
  --line-height-tight: ${t.lineHeights.tight.value};
  --line-height-normal: ${t.lineHeights.normal.value};
  --line-height-relaxed: ${t.lineHeights.relaxed.value};

  /* === SPACING SCALE (4px base) === */
  --space-1: ${s['1'].value};
  --space-2: ${s['2'].value};
  --space-3: ${s['3'].value};
  --space-4: ${s['4'].value};
  --space-5: ${s['5'].value};
  --space-6: ${s['6'].value};
  --space-8: ${s['8'].value};
  --space-10: ${s['10'].value};
  --space-12: ${s['12'].value};

  /* === RADIUS === */
  --radius-sm: ${b.sm.value};
  --radius-md: ${b.md.value};
  --radius-lg: ${b.lg.value};
  --radius-xl: ${b.xl.value};
  --radius-full: ${b.full.value};

  /* === SHADOWS === */
  --shadow-xs: ${sh.xs.value};
  --shadow-sm: ${sh.sm.value};
  --shadow-md: ${sh.md.value};
  --shadow-lg: ${sh.lg.value};
  --shadow-xl: ${sh.xl.value};
  --shadow-modal: ${sh.modal.value};

  /* === TRANSITIONS === */
  --transition-fast: ${tr.fast.value};
  --transition-normal: ${tr.normal.value};
  --transition-slow: ${tr.slow.value};

  /* === Z-INDEX SCALE === */
  --z-dropdown: ${z.dropdown.value};
  --z-sticky: ${z.sticky.value};
  --z-fixed: ${z.fixed.value};
  --z-modal-backdrop: ${z.modalBackdrop.value};
  --z-modal: ${z.modal.value};
  --z-popover: ${z.popover.value};
  --z-tooltip: ${z.tooltip.value};
  --z-toast: ${z.toast.value};

  /* === BREAKPOINTS === */
  --bp-sm: ${bp.sm.value};
  --bp-md: ${bp.md.value};
  --bp-lg: ${bp.lg.value};
  --bp-xl: ${bp.xl.value};
  --bp-2xl: ${bp['2xl'].value};

  /* === TOUCH TARGETS (WCAG 2.5.5) === */
  --touch-target: ${tt.default.value};
  --touch-target-sm: ${tt.sm.value};

  /* === CONTAINER === */
  --container-max: ${cn.max.value};
  --container-padding: ${cn.padding.value};

 /* === TENANT OVERRIDES (injected at runtime via /api/config) === */
  --tenant-primary: ${tn.primary.value};
  --tenant-primary-hover: ${tn.primaryHover.value};
  --tenant-primary-light: ${tn.primaryLight.value};
  --tenant-primary-text: ${tn.primaryText.value};
  --tenant-bg: ${tn.bg.value};
  --tenant-surface: ${tn.surface.value};
  --tenant-font: ${tn.font.value};
  --tenant-name: ${tn.name.value};
  --tenant-logo: ${tn.logo.value};
}

`;

  // Second :root block for runtime tenant application
  css += `/* Tenant runtime values — applied via inline style on :root in App.jsx */
:root {
  --color-primary: var(--tenant-primary);
  --color-primary-hover: var(--tenant-primary-hover);
  --color-primary-light: var(--tenant-primary-light);
  --color-primary-text: var(--tenant-primary-text);
  --color-bg: var(--tenant-bg);
  --color-surface: var(--tenant-surface);
  --font-sans: var(--tenant-font);
}
`;

  // Dark mode — DESACTIVADO temporalmente (solo light mode)
  // if (Object.keys(dm).length > 0) {
  //   css += `
  // /* Dark mode — opt-in via data-theme="dark" on <html> */
  // @media (prefers-color-scheme: dark) {
  //   :root:not([data-theme="light"]) {
  //     --color-bg: ${dm.bg?.value || '#111827'};
  //     --color-surface: ${dm.surface?.value || '#1f2937'};
  //     --color-surface-hover: ${dm.surfaceHover?.value || '#374151'};
  //     --color-border: ${dm.border?.value || '#374151'};
  //     --color-border-strong: ${dm.borderStrong?.value || '#4b5563'};
  //     --color-text: ${dm.text?.value || '#f3f4f6'};
  //     --color-text-secondary: ${dm.textSecondary?.value || '#9ca3af'};
  //     --color-text-muted: ${dm.textMuted?.value || '#6b7280'};
  //     --color-primary-light: ${dm.primaryLight?.value || '#064e3b'};
  //     --color-success-light: ${dm.successLight?.value || '#14532d'};
  //     --color-warning-light: ${dm.warningLight?.value || '#713f12'};
  //     --color-danger-light: ${dm.dangerLight?.value || '#7f1d1d'};
  //     --color-info-light: ${dm.infoLight?.value || '#1e3a5f'};
  //     --shadow-xs: ${dm.shadowXs?.value || '0 1px 2px rgba(0,0,0,0.2)'};
  //     --shadow-sm: ${dm.shadowSm?.value || '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)'};
  //     --shadow-md: ${dm.shadowMd?.value || '0 4px 6px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)'};
  //     --shadow-lg: ${dm.shadowLg?.value || '0 10px 15px rgba(0,0,0,0.4), 0 4px 6px rgba(0,0,0,0.2)'};
  //     --shadow-xl: ${dm.shadowXl?.value || '0 20px 25px rgba(0,0,0,0.5), 0 10px 10px rgba(0,0,0,0.3)'};
  //     --shadow-modal: ${dm.shadowModal?.value || '0 25px 50px rgba(0,0,0,0.6)'};
  //   }
  // }
  // `;
  // }

  // High contrast
  if (Object.keys(hc).length > 0) {
    css += `
/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --color-border: ${hc.border?.value || 'currentColor'};
    --color-border-strong: ${hc.borderStrong?.value || 'currentColor'};
    --shadow-sm: ${hc.shadowSm?.value || 'none'};
    --shadow-md: ${hc.shadowMd?.value || 'none'};
    --shadow-lg: ${hc.shadowLg?.value || 'none'};
  }
}
`;
  }

  // Reduced motion
  if (Object.keys(rm).length > 0) {
    css += `
/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  :root {
    --transition-fast: ${rm.transitionFast?.value || '0ms'};
    --transition-normal: ${rm.transitionNormal?.value || '0ms'};
    --transition-slow: ${rm.transitionSlow?.value || '0ms'};
  }
}
`;
  }

  // Print
  if (Object.keys(pr).length > 0) {
    css += `
/* Print styles */
@media print {
  :root {
    --color-bg: ${pr.bg?.value || '#ffffff'};
    --color-surface: ${pr.surface?.value || '#ffffff'};
    --color-text: ${pr.text?.value || '#000000'};
    --shadow-sm: ${pr.shadowSm?.value || 'none'};
    --shadow-md: ${pr.shadowMd?.value || 'none'};
    --shadow-lg: ${pr.shadowLg?.value || 'none'};
    --shadow-xl: ${pr.shadowXl?.value || 'none'};
    --shadow-modal: ${pr.shadowModal?.value || 'none'};
  }
}
`;
  }

  writeFileSync(outputPath, css);
}

export { generateCSS };