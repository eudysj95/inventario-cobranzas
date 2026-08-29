/**
 * Generate TypeScript types from tokens.json
 * Reads design-system/tokens.json and outputs design-system/tokens.d.ts
 */

import { writeFileSync } from 'node:fs';

function generateTS(tokens, outputPath) {
  let ts = `export interface DesignTokens {
  color: {
`;

  // Color tokens
  for (const [key, token] of Object.entries(tokens.color)) {
    ts += `    ${key}: string;\n`;
  }
  ts += `  };\n  spacing: {\n`;
  
  // Spacing tokens
  for (const [key, token] of Object.entries(tokens.spacing)) {
    ts += `    ${key}: string;\n`;
  }
  ts += `  };\n  typography: {\n`;
  
  // Typography tokens
  ts += `    fontFamilies: {\n`;
  for (const [key, token] of Object.entries(tokens.typography.fontFamilies)) {
    ts += `      ${key}: string;\n`;
    }
  ts += `    };\n    fontSizes: {\n`;
  for (const [key, token] of Object.entries(tokens.typography.fontSizes)) {
    ts += `      ${key}: string;\n`;
    }
  ts += `    };\n    fontWeights: {\n`;
  for (const [key, token] of Object.entries(tokens.typography.fontWeights)) {
    ts += `      ${key}: string;\n`;
    }
  ts += `    };\n    lineHeights: {\n`;
  for (const [key, token] of Object.entries(tokens.typography.lineHeights)) {
    ts += `      ${key}: string;\n`;
    }
  ts += `    };\n  };\n  borderRadius: {\n`;
  
  // Border radius
  for (const [key, token] of Object.entries(tokens.borderRadius)) {
    ts += `    ${key}: string;\n`;
  }
  ts += `  };\n  shadows: {\n`;
  
  // Shadows
  for (const [key, token] of Object.entries(tokens.shadows)) {
    ts += `    ${key}: string;\n`;
  }
  ts += `  };\n  zIndex: {\n`;
  
  // Z-index
  for (const [key, token] of Object.entries(tokens.zIndex)) {
    ts += `    ${key}: number;\n`;
  }
  ts += `  };\n  breakpoints: {\n`;
  
  // Breakpoints
  for (const [key, token] of Object.entries(tokens.breakpoints)) {
    ts += `    ${key}: string;\n`;
  }
  ts += `  };\n  transitions: {\n`;
  
  // Transitions
  for (const [key, token] of Object.entries(tokens.transitions)) {
    ts += `    ${key}: string;\n`;
  }
  ts += `  };\n  touchTargets: {\n`;
  
  // Touch targets
  for (const [key, token] of Object.entries(tokens.touchTargets)) {
    ts += `    ${key}: string;\n`;
  }
  ts += `  };\n  container: {\n`;
  
  // Container
  for (const [key, token] of Object.entries(tokens.container)) {
    ts += `    ${key}: string;\n`;
  }
  ts += `  };\n};\n\n`;
  
  ts += `declare const tokens: DesignTokens;\nexport default tokens;\n`;
  
  writeFileSync(outputPath, ts);
}

export { generateTS };