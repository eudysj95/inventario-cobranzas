import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, rmSync, existsSync, mkdirSync } from 'node:fs';
import { generateCSS } from './generate-css.mjs';

describe('generate-css.mjs', () => {
  let tempDir;
  let tokens;

  before(() => {
    tempDir = '/tmp/design-tokens-test';
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }
    
    // Load the actual tokens.json as test fixture
    tokens = JSON.parse(readFileSync('/home/eudysj95/IA/Nexo/design-system/tokens.json', 'utf-8'));
  });

  after(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should generate CSS custom properties for all base tokens', async () => {
    const outputPath = `${tempDir}/design-tokens.css`;
    await generateCSS(tokens, outputPath);
    
    assert.ok(existsSync(outputPath));
    const css = readFileSync(outputPath, 'utf-8');
    
    // Check :root block exists
    assert.ok(css.includes(':root {'));
    
    // Check color tokens
    assert.ok(css.includes('--color-primary: #16a34a;'));
    assert.ok(css.includes('--color-primary-hover: #15803d;'));
    assert.ok(css.includes('--color-success: #2e7d32;'));
    assert.ok(css.includes('--color-warning: #f9a825;'));
    assert.ok(css.includes('--color-danger: #d32f2f;'));
    assert.ok(css.includes('--color-info: #1565c0;'));
    assert.ok(css.includes('--color-bg: #fafafa;'));
    assert.ok(css.includes('--color-surface: #ffffff;'));
    assert.ok(css.includes('--color-text: #212121;'));
    
    // Check typography tokens
    assert.ok(css.includes('--font-sans: system-ui'));
    assert.ok(css.includes('--font-mono: ui-monospace'));
    assert.ok(css.includes('--text-xs: 0.6875rem;'));
    assert.ok(css.includes('--text-base: 0.9375rem;'));
    assert.ok(css.includes('--font-weight-normal: 400;'));
    assert.ok(css.includes('--line-height-normal: 1.5;'));
    
    // Check spacing tokens
    assert.ok(css.includes('--space-1: 0.25rem;'));
    assert.ok(css.includes('--space-4: 1rem;'));
    assert.ok(css.includes('--space-12: 3rem;'));
    
    // Check border radius
    assert.ok(css.includes('--radius-sm: 4px;'));
    assert.ok(css.includes('--radius-md: 8px;'));
    assert.ok(css.includes('--radius-full: 999px;'));
    
    // Check shadows
    assert.ok(css.includes('--shadow-xs: 0 1px 2px rgba(0,0,0,0.03);'));
    assert.ok(css.includes('--shadow-md: 0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.03);'));
    assert.ok(css.includes('--shadow-modal: 0 25px 50px rgba(0,0,0,0.15);'));
    
    // Check z-index
    assert.ok(css.includes('--z-dropdown: 100;'));
    assert.ok(css.includes('--z-modal: 500;'));
    assert.ok(css.includes('--z-toast: 800;'));
    
    // Check breakpoints
    assert.ok(css.includes('--bp-sm: 640px;'));
    assert.ok(css.includes('--bp-xl: 1280px;'));
    
    // Check transitions
    assert.ok(css.includes('--transition-fast: 120ms ease;'));
    assert.ok(css.includes('--transition-normal: 200ms ease;'));
    
    // Check touch targets
    assert.ok(css.includes('--touch-target: 44px;'));
    assert.ok(css.includes('--touch-target-sm: 36px;'));
    
    // Check container
    assert.ok(css.includes('--container-max: 1280px;'));
    assert.ok(css.includes('--container-padding: var(--space-4);'));
  });

  it('should generate tenant override variables in :root', async () => {
    const outputPath = `${tempDir}/design-tokens.css`;
    await generateCSS(tokens, outputPath);
    
    const css = readFileSync(outputPath, 'utf-8');
    
    // Check tenant override variables (in first :root block)
    assert.ok(css.includes('--tenant-primary: var(--color-primary);'));
    assert.ok(css.includes('--tenant-primary-hover: var(--color-primary-hover);'));
    assert.ok(css.includes('--tenant-bg: var(--color-bg);'));
    assert.ok(css.includes('--tenant-font: var(--font-sans);'));
    assert.ok(css.includes("--tenant-name: 'Nexo';"));
    assert.ok(css.includes('--tenant-logo: none;'));
  });

  it('should generate second :root block for runtime tenant application', async () => {
    const outputPath = `${tempDir}/design-tokens.css`;
    await generateCSS(tokens, outputPath);
    
    const css = readFileSync(outputPath, 'utf-8');
    
    // Check second :root block for runtime overrides
    assert.ok(css.includes('--color-primary: var(--tenant-primary);'));
    assert.ok(css.includes('--color-primary-hover: var(--tenant-primary-hover);'));
    assert.ok(css.includes('--color-bg: var(--tenant-bg);'));
    assert.ok(css.includes('--font-sans: var(--tenant-font);'));
  });

  it('should generate dark mode media query', async () => {
    const outputPath = `${tempDir}/design-tokens.css`;
    await generateCSS(tokens, outputPath);
    
    const css = readFileSync(outputPath, 'utf-8');
    
    assert.ok(css.includes('@media (prefers-color-scheme: dark)'));
    assert.ok(css.includes(':root:not([data-theme="light"])'));
    assert.ok(css.includes('--color-bg: #111827;'));
    assert.ok(css.includes('--color-surface: #1f2937;'));
    assert.ok(css.includes('--color-text: #f3f4f6;'));
    assert.ok(css.includes('--shadow-xs: 0 1px 2px rgba(0,0,0,0.2);'));
    assert.ok(css.includes('--shadow-modal: 0 25px 50px rgba(0,0,0,0.6);'));
  });

  it('should generate high contrast media query', async () => {
    const outputPath = `${tempDir}/design-tokens.css`;
    await generateCSS(tokens, outputPath);
    
    const css = readFileSync(outputPath, 'utf-8');
    
    assert.ok(css.includes('@media (prefers-contrast: high)'));
    assert.ok(css.includes('--color-border: currentColor;'));
    assert.ok(css.includes('--color-border-strong: currentColor;'));
    assert.ok(css.includes('--shadow-sm: none;'));
    assert.ok(css.includes('--shadow-md: none;'));
    assert.ok(css.includes('--shadow-lg: none;'));
  });

  it('should generate reduced motion media query', async () => {
    const outputPath = `${tempDir}/design-tokens.css`;
    await generateCSS(tokens, outputPath);
    
    const css = readFileSync(outputPath, 'utf-8');
    
    assert.ok(css.includes('@media (prefers-reduced-motion: reduce)'));
    assert.ok(css.includes('--transition-fast: 0ms;'));
    assert.ok(css.includes('--transition-normal: 0ms;'));
    assert.ok(css.includes('--transition-slow: 0ms;'));
  });

  it('should generate print media query', async () => {
    const outputPath = `${tempDir}/design-tokens.css`;
    await generateCSS(tokens, outputPath);
    
    const css = readFileSync(outputPath, 'utf-8');
    
    assert.ok(css.includes('@media print'));
    assert.ok(css.includes('--color-bg: #ffffff;'));
    assert.ok(css.includes('--color-surface: #ffffff;'));
    assert.ok(css.includes('--color-text: #000000;'));
    assert.ok(css.includes('--shadow-sm: none;'));
    assert.ok(css.includes('--shadow-modal: none;'));
  });

  it('should generate byte-for-byte compatible CSS with current design-tokens.css', async () => {
    const outputPath = `${tempDir}/design-tokens.css`;
    await generateCSS(tokens, outputPath);
    
    const generated = readFileSync(outputPath, 'utf-8');
    const original = readFileSync('/home/eudysj95/IA/Nexo/client/src/styles/design-tokens.css', 'utf-8');
    
    // Normalize whitespace for comparison
    const normalize = (str) => str.replace(/\s+/g, ' ').trim();
    
    assert.equal(normalize(generated), normalize(original));
  });
});