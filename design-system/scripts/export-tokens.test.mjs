import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, rmSync, existsSync, mkdirSync } from 'node:fs';
import { exportTokens } from './export-tokens.mjs';
import { parseTokensFromCSS } from './parse-tokens.mjs';

describe('export-tokens.mjs', () => {
  let tempDir;
  let originalTokens;

  before(() => {
    // Read current tokens as baseline
    const css = readFileSync('/home/eudysj95/IA/Nexo/client/src/styles/design-tokens.css', 'utf-8');
    originalTokens = parseTokensFromCSS(css);
    tempDir = '/tmp/design-tokens-test';
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }
  });

  after(() => {
    // Cleanup
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should export tokens from OpenPencil JSON format', async () => {
    // Create a mock OpenPencil export
    const openPencilExport = {
      name: 'Nexo Design System',
      tokens: {
        color: {
          primary: { value: '#047857', type: 'color' },
          primaryHover: { value: '#065f46', type: 'color' },
        },
        spacing: {
          1: { value: '0.25rem', type: 'dimension' },
          2: { value: '0.5rem', type: 'dimension' },
        },
        typography: {
          fontFamilies: {
            sans: { value: 'system-ui, sans-serif', type: 'string' },
          },
          fontSizes: {
            base: { value: '1rem', type: 'dimension' },
          },
          fontWeights: {
            normal: { value: '400', type: 'number' },
          },
          lineHeights: {
            normal: { value: '1.5', type: 'number' },
          },
        },
        borderRadius: {
          md: { value: '8px', type: 'dimension' },
        },
        shadows: {
          md: { value: '0 4px 6px rgba(0,0,0,0.1)', type: 'string' },
        },
        zIndex: {
          modal: { value: '500', type: 'number' },
        },
        breakpoints: {
          md: { value: '768px', type: 'dimension' },
        },
        transitions: {
          normal: { value: '200ms ease', type: 'duration' },
        },
        touchTargets: {
          default: { value: '44px', type: 'dimension' },
        },
        container: {
          max: { value: '1280px', type: 'dimension' },
        },
      },
      modes: {
        dark: {
          color: {
            bg: { value: '#111827', type: 'color' },
            surface: { value: '#1f2937', type: 'color' },
          },
        },
        highContrast: {
          color: {
            border: { value: 'currentColor', type: 'color' },
          },
        },
        reducedMotion: {
          transitions: {
            normal: { value: '0ms', type: 'duration' },
          },
        },
        print: {
          color: {
            bg: { value: '#ffffff', type: 'color' },
          },
        },
      },
    };

    const exportPath = `${tempDir}/openpencil-export.json`;
    writeFileSync(exportPath, JSON.stringify(openPencilExport, null, 2));

    const outputPath = `${tempDir}/tokens.json`;
    await exportTokens(exportPath, outputPath);

    // Verify output exists and has correct structure
    assert.ok(existsSync(outputPath));
    const exported = JSON.parse(readFileSync(outputPath, 'utf-8'));
    
    assert.ok(exported.color);
    assert.equal(exported.color.primary.value, '#047857');
    assert.ok(exported.spacing);
    assert.equal(exported.spacing['1'].value, '0.25rem');
    assert.ok(exported.typography);
    assert.ok(exported.typography.fontFamilies);
    assert.ok(exported.darkMode);
    assert.equal(exported.darkMode.bg.value, '#111827');
    assert.ok(exported.highContrast);
    assert.ok(exported.reducedMotion);
    assert.ok(exported.print);
  });

  it('should handle missing modes gracefully', async () => {
    const minimalExport = {
      name: 'Minimal',
      tokens: {
        color: { primary: { value: '#000', type: 'color' } },
        spacing: { 1: { value: '0.25rem', type: 'dimension' } },
        typography: { fontFamilies: {}, fontSizes: {}, fontWeights: {}, lineHeights: {} },
        borderRadius: {},
        shadows: {},
        zIndex: {},
        breakpoints: {},
        transitions: {},
        touchTargets: {},
        container: {},
      },
      modes: {},
    };

    const exportPath = `${tempDir}/minimal-export.json`;
    writeFileSync(exportPath, JSON.stringify(minimalExport, null, 2));

    const outputPath = `${tempDir}/tokens-minimal.json`;
    await exportTokens(exportPath, outputPath);

    assert.ok(existsSync(outputPath));
    const exported = JSON.parse(readFileSync(outputPath, 'utf-8'));
    assert.ok(exported.color);
    assert.ok(exported.darkMode);
    assert.ok(exported.highContrast);
    assert.ok(exported.reducedMotion);
    assert.ok(exported.print);
    // Modes should exist but be empty objects
    assert.deepEqual(exported.darkMode, {});
    assert.deepEqual(exported.highContrast, {});
    assert.deepEqual(exported.reducedMotion, {});
    assert.deepEqual(exported.print, {});
  });

  it('should normalize token structure to match expected format', async () => {
    // Test that the export normalizes keys to camelCase
    const exportWithDashes = {
      name: 'Test',
      tokens: {
        color: { 'primary-color': { value: '#000', type: 'color' } },
        spacing: { 'space-1': { value: '0.25rem', type: 'dimension' } },
        typography: { fontFamilies: {}, fontSizes: {}, fontWeights: {}, lineHeights: {} },
        borderRadius: { 'radius-md': { value: '8px', type: 'dimension' } },
        shadows: { 'shadow-md': { value: '0 4px 6px rgba(0,0,0,0.1)', type: 'string' } },
        zIndex: { 'z-modal': { value: '500', type: 'number' } },
        breakpoints: { 'bp-md': { value: '768px', type: 'dimension' } },
        transitions: { 'transition-normal': { value: '200ms ease', type: 'duration' } },
        touchTargets: { 'touch-target': { value: '44px', type: 'dimension' } },
        container: { 'container-max': { value: '1280px', type: 'dimension' } },
      },
      modes: {},
    };

    const exportPath = `${tempDir}/dashed-export.json`;
    writeFileSync(exportPath, JSON.stringify(exportWithDashes, null, 2));

    const outputPath = `${tempDir}/tokens-normalized.json`;
    await exportTokens(exportPath, outputPath);

    const exported = JSON.parse(readFileSync(outputPath, 'utf-8'));
    // Keys should be camelCased
    assert.ok(exported.color.primaryColor);
    assert.ok(exported.spacing['1']);
    assert.ok(exported.borderRadius.md);
    assert.ok(exported.shadows.md);
    assert.ok(exported.zIndex.modal);
    assert.ok(exported.breakpoints.md);
    assert.ok(exported.transitions.normal);
    assert.ok(exported.touchTargets.default);
    assert.ok(exported.container.max);
  });

  it('should validate required token categories exist', async () => {
    const incompleteExport = {
      name: 'Incomplete',
      tokens: {
        color: { primary: { value: '#000', type: 'color' } },
        // missing other categories
      },
      modes: {},
    };

    const exportPath = `${tempDir}/incomplete-export.json`;
    writeFileSync(exportPath, JSON.stringify(incompleteExport, null, 2));

    const outputPath = `${tempDir}/tokens-incomplete.json`;
    
    await assert.rejects(
      exportTokens(exportPath, outputPath),
      /Missing required token category/
    );
  });
});