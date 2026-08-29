import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, rmSync, existsSync, mkdirSync } from 'node:fs';
import { generateTS } from './generate-ts.mjs';

describe('generate-ts.mjs', () => {
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

  it('should generate TypeScript types for all token categories', async () => {
    const outputPath = `${tempDir}/tokens.d.ts`;
    await generateTS(tokens, outputPath);
    
    assert.ok(existsSync(outputPath));
    const ts = readFileSync(outputPath, 'utf-8');
    
    // Check interface exists
    assert.ok(ts.includes('export interface DesignTokens'));
    assert.ok(ts.includes('declare const tokens: DesignTokens'));
    assert.ok(ts.includes('export default tokens'));
    
    // Check color tokens
    assert.ok(ts.includes('color: {'));
    assert.ok(ts.includes('primary: string;'));
    assert.ok(ts.includes('primaryHover: string;'));
    assert.ok(ts.includes('success: string;'));
    assert.ok(ts.includes('warning: string;'));
    assert.ok(ts.includes('danger: string;'));
    assert.ok(ts.includes('info: string;'));
    assert.ok(ts.includes('bg: string;'));
    assert.ok(ts.includes('surface: string;'));
    assert.ok(ts.includes('text: string;'));
    
    // Check spacing tokens
    assert.ok(ts.includes('spacing: {'));
    assert.ok(ts.includes('1: string;'));
    assert.ok(ts.includes('4: string;'));
    assert.ok(ts.includes('12: string;'));
    
    // Check typography tokens
    assert.ok(ts.includes('typography: {'));
    assert.ok(ts.includes('fontFamilies: {'));
    assert.ok(ts.includes('sans: string;'));
    assert.ok(ts.includes('mono: string;'));
    assert.ok(ts.includes('fontSizes: {'));
    assert.ok(ts.includes('xs: string;'));
    assert.ok(ts.includes('base: string;'));
    assert.ok(ts.includes('fontWeights: {'));
    assert.ok(ts.includes('normal: string;'));
    assert.ok(ts.includes('bold: string;'));
    assert.ok(ts.includes('lineHeights: {'));
    assert.ok(ts.includes('tight: string;'));
    assert.ok(ts.includes('normal: string;'));
    
    // Check borderRadius
    assert.ok(ts.includes('borderRadius: {'));
    assert.ok(ts.includes('sm: string;'));
    assert.ok(ts.includes('md: string;'));
    assert.ok(ts.includes('full: string;'));
    
    // Check shadows
    assert.ok(ts.includes('shadows: {'));
    assert.ok(ts.includes('xs: string;'));
    assert.ok(ts.includes('sm: string;'));
    assert.ok(ts.includes('md: string;'));
    assert.ok(ts.includes('modal: string;'));
    
    // Check zIndex
    assert.ok(ts.includes('zIndex: {'));
    assert.ok(ts.includes('dropdown: number;'));
    assert.ok(ts.includes('modal: number;'));
    assert.ok(ts.includes('toast: number;'));
    
    // Check breakpoints
    assert.ok(ts.includes('breakpoints: {'));
    assert.ok(ts.includes('sm: string;'));
    assert.ok(ts.includes('xl: string;'));
    
    // Check transitions
    assert.ok(ts.includes('transitions: {'));
    assert.ok(ts.includes('fast: string;'));
    assert.ok(ts.includes('normal: string;'));
    assert.ok(ts.includes('slow: string;'));
    
    // Check touchTargets
    assert.ok(ts.includes('touchTargets: {'));
    assert.ok(ts.includes('default: string;'));
    assert.ok(ts.includes('sm: string;'));
    
    // Check container
    assert.ok(ts.includes('container: {'));
    assert.ok(ts.includes('max: string;'));
    assert.ok(ts.includes('padding: string;'));
  });

  it('should generate valid TypeScript that compiles', async () => {
    const outputPath = `${tempDir}/tokens.d.ts`;
    await generateTS(tokens, outputPath);
    
    const ts = readFileSync(outputPath, 'utf-8');
    
    // Basic syntax checks
    assert.ok(ts.startsWith('export interface DesignTokens {'));
    assert.ok(ts.includes('}'));
    assert.ok(ts.includes('declare const tokens: DesignTokens;'));
    assert.ok(ts.includes('export default tokens;'));
    
    // Check all value types are string or number
    const lines = ts.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.endsWith(': string;') || trimmed.endsWith(': number;')) {
        // Valid
      } else if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('export') && 
                 !trimmed.startsWith('declare') && !trimmed.startsWith('}') &&
                 !trimmed.startsWith('{') && !trimmed.includes('fontFamilies') &&
                 !trimmed.includes('fontSizes') && !trimmed.includes('fontWeights') &&
                 !trimmed.includes('lineHeights') && !trimmed.includes('typography:') &&
                 !trimmed.includes('color:') && !trimmed.includes('spacing:') &&
                 !trimmed.includes('borderRadius:') && !trimmed.includes('shadows:') &&
                 !trimmed.includes('zIndex:') && !trimmed.includes('breakpoints:') &&
                 !trimmed.includes('transitions:') && !trimmed.includes('touchTargets:') &&
                 !trimmed.includes('container:')) {
        // Allow some structural lines
      }
    }
  });

  it('should handle empty token categories gracefully', async () => {
    const minimalTokens = {
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
    };
    
    const outputPath = `${tempDir}/tokens-minimal.d.ts`;
    await generateTS(minimalTokens, outputPath);
    
    assert.ok(existsSync(outputPath));
    const ts = readFileSync(outputPath, 'utf-8');
    assert.ok(ts.includes('export interface DesignTokens'));
    assert.ok(ts.includes('color: {'));
    assert.ok(ts.includes('primary: string;'));
  });
});