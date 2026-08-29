import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, rmSync, existsSync, mkdirSync } from 'node:fs';
import { buildTokens } from './build-tokens.mjs';

describe('build-tokens.mjs', () => {
  let tempDir;

  before(() => {
    tempDir = '/tmp/design-tokens-test';
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }
  });

  after(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should run full build pipeline successfully', async () => {
    // Create a minimal tokens.json for testing
    const tokens = {
      color: { primary: { value: '#047857', type: 'color' } },
      spacing: { 1: { value: '0.25rem', type: 'dimension' } },
      typography: { fontFamilies: { sans: { value: 'system-ui', type: 'string' } }, fontSizes: {}, fontWeights: {}, lineHeights: {} },
      borderRadius: { md: { value: '8px', type: 'dimension' } },
      shadows: { md: { value: '0 4px 6px rgba(0,0,0,0.1)', type: 'string' } },
      zIndex: { modal: { value: '500', type: 'number' } },
      breakpoints: { md: { value: '768px', type: 'dimension' } },
      transitions: { normal: { value: '200ms ease', type: 'duration' } },
      touchTargets: { default: { value: '44px', type: 'dimension' } },
      container: { max: { value: '1280px', type: 'dimension' } },
      tenant: { primary: { value: 'var(--color-primary)', type: 'reference' } },
      darkMode: { bg: { value: '#111827', type: 'color' } },
      highContrast: { border: { value: 'currentColor', type: 'color' } },
      reducedMotion: { normal: { value: '0ms', type: 'duration' } },
      print: { bg: { value: '#ffffff', type: 'color' } },
    };
    
    const tokensPath = `${tempDir}/tokens.json`;
    writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));
    
    // Create mock scripts that just copy tokens.json
    const scriptsDir = `${tempDir}/scripts`;
    mkdirSync(scriptsDir, { recursive: true });
    
    // Mock export-tokens.mjs
    writeFileSync(`${scriptsDir}/export-tokens.mjs`, `
export async function exportTokens(inputPath, outputPath) {
  const { readFileSync, writeFileSync } = await import('node:fs');
  const tokens = JSON.parse(readFileSync(inputPath, 'utf-8'));
  writeFileSync(outputPath, JSON.stringify(tokens, null, 2));
}
`);
    
    // Mock generate-css.mjs
    writeFileSync(`${scriptsDir}/generate-css.mjs`, `
export async function generateCSS(tokens, outputPath) {
  const { writeFileSync } = await import('node:fs');
  let css = ':root {\\n  --color-primary: ' + tokens.color.primary.value + ';\\n}';
  writeFileSync(outputPath, css);
}
`);
    
    // Mock generate-ts.mjs
    writeFileSync(`${scriptsDir}/generate-ts.mjs`, `
export async function generateTS(tokens, outputPath) {
  const { writeFileSync } = await import('node:fs');
  let ts = 'export interface DesignTokens { color: { primary: string; } };\\n';
  ts += 'declare const tokens: DesignTokens;\\nexport default tokens;';
  writeFileSync(outputPath, ts);
}
`);

    // Run build
    const result = await buildTokens({
      tokensPath,
      scriptsDir,
      cssOutputPath: `${tempDir}/design-tokens.css`,
      tsOutputPath: `${tempDir}/tokens.d.ts`,
    });
    
    assert.ok(result.success);
    assert.ok(existsSync(`${tempDir}/design-tokens.css`));
    assert.ok(existsSync(`${tempDir}/tokens.d.ts`));
    
    const css = readFileSync(`${tempDir}/design-tokens.css`, 'utf-8');
    assert.ok(css.includes('--color-primary: #047857'));
    
    const ts = readFileSync(`${tempDir}/tokens.d.ts`, 'utf-8');
    assert.ok(ts.includes('export interface DesignTokens'));
  });

  it('should fail if any script fails', async () => {
    const tokensPath = `${tempDir}/tokens.json`;
    const openPencilExportPath = `${tempDir}/openpencil/export.json`;
    
    // Provide minimal valid tokens structure
    writeFileSync(tokensPath, JSON.stringify({
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
      tenant: {},
      darkMode: {},
      highContrast: {},
      reducedMotion: {},
      print: {},
    }, null, 2));
    
    // Create OpenPencil export to trigger export-tokens step
    mkdirSync(`${tempDir}/openpencil`, { recursive: true });
    writeFileSync(openPencilExportPath, JSON.stringify({ tokens: {} }, null, 2));
    
    const scriptsDir = `${tempDir}/scripts`;
    mkdirSync(scriptsDir, { recursive: true });
    
    // Mock script that throws
    writeFileSync(`${scriptsDir}/export-tokens.mjs`, `
export async function exportTokens(inputPath, outputPath) {
  throw new Error('Export failed');
}
`);
    writeFileSync(`${scriptsDir}/generate-css.mjs`, `
export async function generateCSS(tokens, outputPath) {
  const { writeFileSync } = await import('node:fs');
  writeFileSync(outputPath, ':root { --color-primary: ' + tokens.color.primary.value + '; }');
}
`);
    writeFileSync(`${scriptsDir}/generate-ts.mjs`, `
export async function generateTS(tokens, outputPath) {
  const { writeFileSync } = await import('node:fs');
  writeFileSync(outputPath, 'export interface DesignTokens { color: { primary: string; } }\\ndeclare const tokens: DesignTokens;\\nexport default tokens;');
}
`);

    try {
      await buildTokens({
        tokensPath,
        scriptsDir,
        cssOutputPath: `${tempDir}/design-tokens.css`,
        tsOutputPath: `${tempDir}/tokens.d.ts`,
      });
      assert.fail('Should have thrown');
    } catch (error) {
      assert.ok(error.message.includes('Export failed'));
    }
  });

  it('should log success and failure clearly', async () => {
    // Use a fresh temp dir for this test
    const testTempDir = '/tmp/design-tokens-test-logs';
    if (existsSync(testTempDir)) {
      rmSync(testTempDir, { recursive: true, force: true });
    }
    mkdirSync(testTempDir, { recursive: true });
    mkdirSync(`${testTempDir}/scripts`, { recursive: true });
    
    const tokensPath = `${testTempDir}/tokens.json`;
    writeFileSync(tokensPath, JSON.stringify({ 
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
      tenant: {},
      darkMode: {},
      highContrast: {},
      reducedMotion: {},
      print: {},
    }, null, 2));
    
    const scriptsDir = `${testTempDir}/scripts`;
    
    writeFileSync(`${scriptsDir}/export-tokens.mjs`, `
export async function exportTokens(inputPath, outputPath) {
  const { readFileSync, writeFileSync } = await import('node:fs');
  const tokens = JSON.parse(readFileSync(inputPath, 'utf-8'));
  writeFileSync(outputPath, JSON.stringify(tokens, null, 2));
}
`);
    writeFileSync(`${scriptsDir}/generate-css.mjs`, `
export async function generateCSS(tokens, outputPath) {
  const { writeFileSync } = await import('node:fs');
  writeFileSync(outputPath, ':root { --color-primary: ' + tokens.color.primary.value + '; }');
}
`);
    writeFileSync(`${scriptsDir}/generate-ts.mjs`, `
export async function generateTS(tokens, outputPath) {
  const { writeFileSync } = await import('node:fs');
  writeFileSync(outputPath, 'export interface DesignTokens { color: { primary: string; } }\\ndeclare const tokens: DesignTokens;\\nexport default tokens;');
}
`);

    const logs = [];
    const originalLog = console.log;
    console.log = (...args) => logs.push(args.join(' '));
    
    try {
      const result = await buildTokens({
        tokensPath,
        scriptsDir,
        cssOutputPath: `${testTempDir}/design-tokens.css`,
        tsOutputPath: `${testTempDir}/tokens.d.ts`,
      });
      
      console.log = originalLog;
      
      assert.ok(result.success);
      assert.ok(logs.some(l => l.includes('✓') || l.includes('Success') || l.includes('success')));
    } finally {
      console.log = originalLog;
      rmSync(testTempDir, { recursive: true, force: true });
    }
  });
});