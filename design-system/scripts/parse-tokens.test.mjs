import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseTokensFromCSS } from './parse-tokens.mjs';

describe('parse-tokens.mjs', () => {
  let cssContent;

  before(() => {
    cssContent = readFileSync('/home/eudysj95/IA/Nexo/client/src/styles/design-tokens.css', 'utf-8');
  });

  it('should parse all color tokens from :root', () => {
    const tokens = parseTokensFromCSS(cssContent);
    
    assert.ok(tokens.color);
    assert.equal(tokens.color.primary.value, '#047857');
    assert.equal(tokens.color.primary.type, 'color');
    assert.equal(tokens.color.primaryHover.value, '#065f46');
    assert.equal(tokens.color.success.value, '#2e7d32');
    assert.equal(tokens.color.warning.value, '#f9a825');
    assert.equal(tokens.color.danger.value, '#d32f2f');
    assert.equal(tokens.color.info.value, '#1565c0');
    assert.equal(tokens.color.bg.value, '#fafafa');
    assert.equal(tokens.color.surface.value, '#ffffff');
    assert.equal(tokens.color.text.value, '#212121');
    assert.equal(tokens.color.textSecondary.value, '#757575');
    assert.equal(tokens.color.textMuted.value, '#9e9e9e');
    assert.equal(tokens.color.textInverse.value, '#ffffff');
  });

  it('should parse typography tokens', () => {
    const tokens = parseTokensFromCSS(cssContent);
    
    assert.ok(tokens.typography);
    assert.ok(tokens.typography.fontFamilies);
    assert.equal(tokens.typography.fontFamilies.sans.value, 'system-ui, -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, \'Helvetica Neue\', Arial, sans-serif');
    assert.equal(tokens.typography.fontFamilies.mono.value, 'ui-monospace, SFMono-Regular, \'SF Mono\', Menlo, Consolas, monospace');
    
    assert.ok(tokens.typography.fontSizes);
    assert.equal(tokens.typography.fontSizes.xs.value, '0.6875rem');
    assert.equal(tokens.typography.fontSizes.sm.value, '0.8125rem');
    assert.equal(tokens.typography.fontSizes.base.value, '0.9375rem');
    assert.equal(tokens.typography.fontSizes.lg.value, '1.0625rem');
    assert.equal(tokens.typography.fontSizes.xl.value, '1.25rem');
    assert.equal(tokens.typography.fontSizes['2xl'].value, '1.5rem');
    assert.equal(tokens.typography.fontSizes['3xl'].value, '1.875rem');
    
    assert.ok(tokens.typography.fontWeights);
    assert.equal(tokens.typography.fontWeights.normal.value, '400');
    assert.equal(tokens.typography.fontWeights.medium.value, '500');
    assert.equal(tokens.typography.fontWeights.semibold.value, '600');
    assert.equal(tokens.typography.fontWeights.bold.value, '700');
    
    assert.ok(tokens.typography.lineHeights);
    assert.equal(tokens.typography.lineHeights.tight.value, '1.2');
    assert.equal(tokens.typography.lineHeights.normal.value, '1.5');
    assert.equal(tokens.typography.lineHeights.relaxed.value, '1.6');
  });

  it('should parse spacing tokens', () => {
    const tokens = parseTokensFromCSS(cssContent);
    
    assert.ok(tokens.spacing);
    assert.equal(tokens.spacing['1'].value, '0.25rem');
    assert.equal(tokens.spacing['2'].value, '0.5rem');
    assert.equal(tokens.spacing['3'].value, '0.75rem');
    assert.equal(tokens.spacing['4'].value, '1rem');
    assert.equal(tokens.spacing['5'].value, '1.25rem');
    assert.equal(tokens.spacing['6'].value, '1.5rem');
    assert.equal(tokens.spacing['8'].value, '2rem');
    assert.equal(tokens.spacing['10'].value, '2.5rem');
    assert.equal(tokens.spacing['12'].value, '3rem');
    assert.ok(tokens.spacing['1'].type === 'dimension' || tokens.spacing['1'].type === 'spacing');
  });

  it('should parse borderRadius tokens', () => {
    const tokens = parseTokensFromCSS(cssContent);
    
    assert.ok(tokens.borderRadius);
    assert.equal(tokens.borderRadius.sm.value, '4px');
    assert.equal(tokens.borderRadius.md.value, '8px');
    assert.equal(tokens.borderRadius.lg.value, '12px');
    assert.equal(tokens.borderRadius.xl.value, '16px');
    assert.equal(tokens.borderRadius.full.value, '999px');
  });

  it('should parse shadows tokens', () => {
    const tokens = parseTokensFromCSS(cssContent);
    
    assert.ok(tokens.shadows);
    assert.equal(tokens.shadows.xs.value, '0 1px 2px rgba(0,0,0,0.03)');
    assert.equal(tokens.shadows.sm.value, '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04)');
    assert.equal(tokens.shadows.md.value, '0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.03)');
    assert.equal(tokens.shadows.lg.value, '0 10px 15px rgba(0,0,0,0.06), 0 4px 6px rgba(0,0,0,0.04)');
    assert.equal(tokens.shadows.xl.value, '0 20px 25px rgba(0,0,0,0.08), 0 10px 10px rgba(0,0,0,0.03)');
    assert.equal(tokens.shadows.modal.value, '0 25px 50px rgba(0,0,0,0.15)');
  });

  it('should parse zIndex tokens', () => {
    const tokens = parseTokensFromCSS(cssContent);
    
    assert.ok(tokens.zIndex);
    assert.equal(tokens.zIndex.dropdown.value, '100');
    assert.equal(tokens.zIndex.sticky.value, '200');
    assert.equal(tokens.zIndex.fixed.value, '300');
    assert.equal(tokens.zIndex.modalBackdrop.value, '400');
    assert.equal(tokens.zIndex.modal.value, '500');
    assert.equal(tokens.zIndex.popover.value, '600');
    assert.equal(tokens.zIndex.tooltip.value, '700');
    assert.equal(tokens.zIndex.toast.value, '800');
  });

  it('should parse breakpoints tokens', () => {
    const tokens = parseTokensFromCSS(cssContent);
    
    assert.ok(tokens.breakpoints);
    assert.equal(tokens.breakpoints.sm.value, '640px');
    assert.equal(tokens.breakpoints.md.value, '768px');
    assert.equal(tokens.breakpoints.lg.value, '1024px');
    assert.equal(tokens.breakpoints.xl.value, '1280px');
    assert.equal(tokens.breakpoints['2xl'].value, '1536px');
  });

  it('should parse transitions tokens', () => {
    const tokens = parseTokensFromCSS(cssContent);
    
    assert.ok(tokens.transitions);
    assert.equal(tokens.transitions.fast.value, '120ms ease');
    assert.equal(tokens.transitions.normal.value, '200ms ease');
    assert.equal(tokens.transitions.slow.value, '300ms ease');
  });

  it('should parse touchTargets tokens', () => {
    const tokens = parseTokensFromCSS(cssContent);
    
    assert.ok(tokens.touchTargets);
    assert.equal(tokens.touchTargets.default.value, '44px');
    assert.equal(tokens.touchTargets.sm.value, '36px');
  });

  it('should parse container tokens', () => {
    const tokens = parseTokensFromCSS(cssContent);
    
    assert.ok(tokens.container);
    assert.equal(tokens.container.max.value, '1280px');
    assert.equal(tokens.container.padding.value, 'var(--space-4)');
  });

  it('should parse tenant override tokens', () => {
    const tokens = parseTokensFromCSS(cssContent);
    
    assert.ok(tokens.tenant);
    assert.equal(tokens.tenant.primary.value, 'var(--color-primary)');
    assert.equal(tokens.tenant.primaryHover.value, 'var(--color-primary-hover)');
    assert.equal(tokens.tenant.primaryLight.value, 'var(--color-primary-light)');
    assert.equal(tokens.tenant.primaryText.value, 'var(--color-primary-text)');
    assert.equal(tokens.tenant.bg.value, 'var(--color-bg)');
    assert.equal(tokens.tenant.surface.value, 'var(--color-surface)');
    assert.equal(tokens.tenant.font.value, 'var(--font-sans)');
    assert.equal(tokens.tenant.name.value, '\'Nexo\'');
    assert.equal(tokens.tenant.logo.value, 'none');
  });

  it('should parse dark mode tokens', () => {
    const tokens = parseTokensFromCSS(cssContent);
    
    assert.ok(tokens.darkMode);
    assert.equal(tokens.darkMode.bg.value, '#111827');
    assert.equal(tokens.darkMode.surface.value, '#1f2937');
    assert.equal(tokens.darkMode.surfaceHover.value, '#374151');
    assert.equal(tokens.darkMode.border.value, '#374151');
    assert.equal(tokens.darkMode.borderStrong.value, '#4b5563');
    assert.equal(tokens.darkMode.text.value, '#f3f4f6');
    assert.equal(tokens.darkMode.textSecondary.value, '#9ca3af');
    assert.equal(tokens.darkMode.textMuted.value, '#6b7280');
    assert.equal(tokens.darkMode.primaryLight.value, '#064e3b');
    assert.equal(tokens.darkMode.successLight.value, '#14532d');
    assert.equal(tokens.darkMode.warningLight.value, '#713f12');
    assert.equal(tokens.darkMode.dangerLight.value, '#7f1d1d');
    assert.equal(tokens.darkMode.infoLight.value, '#1e3a5f');
  });

  it('should parse high contrast tokens', () => {
    const tokens = parseTokensFromCSS(cssContent);
    
    assert.ok(tokens.highContrast);
    assert.equal(tokens.highContrast.border.value, 'currentColor');
    assert.equal(tokens.highContrast.borderStrong.value, 'currentColor');
    assert.equal(tokens.highContrast.shadowSm.value, 'none');
    assert.equal(tokens.highContrast.shadowMd.value, 'none');
    assert.equal(tokens.highContrast.shadowLg.value, 'none');
  });

  it('should parse reduced motion tokens', () => {
    const tokens = parseTokensFromCSS(cssContent);
    
    assert.ok(tokens.reducedMotion);
    assert.equal(tokens.reducedMotion.transitionFast.value, '0ms');
    assert.equal(tokens.reducedMotion.transitionNormal.value, '0ms');
    assert.equal(tokens.reducedMotion.transitionSlow.value, '0ms');
  });

  it('should parse print tokens', () => {
    const tokens = parseTokensFromCSS(cssContent);
    
    assert.ok(tokens.print);
    assert.equal(tokens.print.bg.value, '#ffffff');
    assert.equal(tokens.print.surface.value, '#ffffff');
    assert.equal(tokens.print.text.value, '#000000');
    assert.equal(tokens.print.shadowSm.value, 'none');
    assert.equal(tokens.print.shadowMd.value, 'none');
    assert.equal(tokens.print.shadowLg.value, 'none');
    assert.equal(tokens.print.shadowXl.value, 'none');
    assert.equal(tokens.print.shadowModal.value, 'none');
  });
});