/**
 * Export tokens from OpenPencil format to normalized tokens.json
 * Reads OpenPencil export (JSON) and outputs normalized design-system/tokens.json
 */

import { readFileSync, writeFileSync } from 'node:fs';

const REQUIRED_CATEGORIES = [
  'color',
  'spacing',
  'typography',
  'borderRadius',
  'shadows',
  'zIndex',
  'breakpoints',
  'transitions',
  'touchTargets',
  'container',
];

const REQUIRED_TYPOGRAPHY = [
  'fontFamilies',
  'fontSizes',
  'fontWeights',
  'lineHeights',
];

const MODES = ['dark', 'highContrast', 'reducedMotion', 'print'];

function camelCase(str) {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function normalizeTokenKey(key) {
  // Remove common prefixes and camelCase
  return key
    .replace(/^(color|space|radius|shadow|z|bp|transition|touch-target|container|font|text|line-height)-/, '')
    .replace(/^(font-weight|font-family)-/, '')
    .replace(/^font-/, '')
    .replace(/^text-/, '')
    .replace(/^line-height-/, '')
    .replace(/^touch-target-/, '')
    .replace(/^container-/, '')
    .replace(/^tenant-/, '');
}

function normalizeCategory(category, tokens) {
  const normalized = {};
  for (const [key, value] of Object.entries(tokens)) {
    let normKey;
    if (category === 'touchTargets') {
      // Special handling: touch-target -> default, touch-target-sm -> sm
      const stripped = key.replace('touch-target-', '').replace('touch-target', 'default');
      normKey = camelCase(stripped) || 'default';
    } else {
      normKey = camelCase(normalizeTokenKey(key));
    }
    normalized[normKey] = value;
  }
  return normalized;
}

function normalizeTypography(typography) {
  const normalized = {
    fontFamilies: {},
    fontSizes: {},
    fontWeights: {},
    lineHeights: {},
  };

  if (typography.fontFamilies) {
    for (const [key, value] of Object.entries(typography.fontFamilies)) {
      normalized.fontFamilies[camelCase(key)] = value;
    }
  }
  if (typography.fontSizes) {
    for (const [key, value] of Object.entries(typography.fontSizes)) {
      normalized.fontSizes[camelCase(key)] = value;
    }
  }
  if (typography.fontWeights) {
    for (const [key, value] of Object.entries(typography.fontWeights)) {
      normalized.fontWeights[camelCase(key)] = value;
    }
  }
  if (typography.lineHeights) {
    for (const [key, value] of Object.entries(typography.lineHeights)) {
      normalized.lineHeights[camelCase(key)] = value;
    }
  }

  return normalized;
}

function normalizeModes(modes) {
  const normalized = {
    darkMode: {},
    highContrast: {},
    reducedMotion: {},
    print: {},
  };

  for (const mode of MODES) {
    const modeData = modes[mode] || {};
    const targetKey = mode === 'dark' ? 'darkMode' : 
                      mode === 'highContrast' ? 'highContrast' :
                      mode === 'reducedMotion' ? 'reducedMotion' : 'print';
    
    for (const [category, tokens] of Object.entries(modeData)) {
      if (category === 'color') {
        for (const [key, value] of Object.entries(tokens)) {
          normalized[targetKey][camelCase(key.replace('color-', ''))] = value;
        }
      } else if (category === 'shadows') {
        for (const [key, value] of Object.entries(tokens)) {
          const fullCamel = camelCase(key);
          const normKey = fullCamel.replace('shadow', 'shadow');
          normalized[targetKey][normKey] = value;
        }
      } else if (category === 'transitions') {
        for (const [key, value] of Object.entries(tokens)) {
          const fullCamel = camelCase(key);
          const normKey = fullCamel.replace('transition', 'transition');
          normalized[targetKey][normKey] = value;
        }
      } else if (category === 'typography') {
        // Handle typography in modes if needed
        normalized[targetKey] = { ...normalized[targetKey], ...normalizeTypography(tokens) };
      }
    }
  }

  return normalized;
}

export async function exportTokens(inputPath, outputPath) {
  const content = readFileSync(inputPath, 'utf-8');
  const exportData = JSON.parse(content);

  // Validate required categories
  if (!exportData.tokens) {
    throw new Error('OpenPencil export must have a "tokens" object');
  }

  for (const category of REQUIRED_CATEGORIES) {
    if (!exportData.tokens[category]) {
      throw new Error(`Missing required token category: ${category}`);
    }
  }

  // Validate typography subcategories
  if (!exportData.tokens.typography) {
    throw new Error('Missing required token category: typography');
  }
  for (const subcat of REQUIRED_TYPOGRAPHY) {
    if (!exportData.tokens.typography[subcat]) {
      throw new Error(`Missing required typography subcategory: ${subcat}`);
    }
  }

  // Normalize base tokens
  const normalized = {
    color: normalizeCategory('color', exportData.tokens.color),
    spacing: normalizeCategory('spacing', exportData.tokens.spacing),
    typography: normalizeTypography(exportData.tokens.typography),
    borderRadius: normalizeCategory('borderRadius', exportData.tokens.borderRadius),
    shadows: normalizeCategory('shadows', exportData.tokens.shadows),
    zIndex: normalizeCategory('zIndex', exportData.tokens.zIndex),
    breakpoints: normalizeCategory('breakpoints', exportData.tokens.breakpoints),
    transitions: normalizeCategory('transitions', exportData.tokens.transitions),
    touchTargets: normalizeCategory('touchTargets', exportData.tokens.touchTargets),
    container: normalizeCategory('container', exportData.tokens.container),
    tenant: exportData.tokens.tenant || {},
  };

  // Normalize modes
  const modes = normalizeModes(exportData.modes || {});
  Object.assign(normalized, modes);

  // Write output
  writeFileSync(outputPath, JSON.stringify(normalized, null, 2));
}