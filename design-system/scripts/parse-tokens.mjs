/**
 * Parse CSS custom properties from design-tokens.css into structured tokens JSON
 * Handles :root, @media queries for dark mode, high contrast, reduced motion, print
 */

function parseTokensFromCSS(cssContent) {
  const tokens = {
    color: {},
    spacing: {},
    typography: {
      fontFamilies: {},
      fontSizes: {},
      fontWeights: {},
      lineHeights: {}
    },
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
    print: {}
  };

  // Extract all CSS custom properties with their context (media query)
  const rootProps = extractRootProperties(cssContent);
  
  // Process first :root block as base tokens (canonical values) + tenant definitions
  processBaseRootProperties(rootProps.base, tokens);
  
  // Process second :root block as tenant runtime overrides (skip - they reference tenant vars)
  // processTenantRootProperties(rootProps.tenant, tokens);
  
  // Process media query properties
  processMediaProperties(rootProps.media, tokens);

  return tokens;
}

function extractRootProperties(cssContent) {
  const result = {
    base: {},
    tenant: {},
    media: {}
  };

  // Remove comments
  const cleaned = cssContent.replace(/\/\*[\s\S]*?\*\//g, '');

  // Find all @media blocks using a proper brace-matching approach
  const mediaBlocks = findMediaBlocks(cleaned);
  
  for (const { query, content } of mediaBlocks) {
    // Extract properties from media query content (which may have nested :root blocks)
    const props = extractPropertiesFromBlock(content);
    result.media[query.trim()] = props;
  }

  // Extract base :root properties (outside media queries)
  // Get content before first @media
  const firstMediaIndex = cleaned.indexOf('@media');
  const baseContent = firstMediaIndex > 0 ? cleaned.substring(0, firstMediaIndex) : cleaned;
  
  // Find :root blocks in base content
  const rootBlocks = findRootBlocks(baseContent);
  
  // First :root block = base tokens (canonical values) + tenant definitions
  if (rootBlocks.length > 0) {
    result.base = extractPropertiesFromBlock(rootBlocks[0]);
  }
  
  // Second :root block = tenant runtime overrides (references to tenant vars)
  if (rootBlocks.length > 1) {
    result.tenant = extractPropertiesFromBlock(rootBlocks[1]);
  }

  return result;
}

function findMediaBlocks(css) {
  const blocks = [];
  let pos = 0;
  
  while (true) {
    const mediaIndex = css.indexOf('@media', pos);
    if (mediaIndex === -1) break;
    
    // Find the opening brace of the @media block
    const braceIndex = css.indexOf('{', mediaIndex);
    if (braceIndex === -1) break;
    
    // Extract the media query
    const query = css.substring(mediaIndex + 6, braceIndex).trim();
    
    // Find matching closing brace
    let braceCount = 1;
    let contentStart = braceIndex + 1;
    let i = contentStart;
    
    while (i < css.length && braceCount > 0) {
      if (css[i] === '{') braceCount++;
      else if (css[i] === '}') braceCount--;
      i++;
    }
    
    const content = css.substring(contentStart, i - 1);
    blocks.push({ query, content });
    
    pos = i;
  }
  
  return blocks;
}

function findRootBlocks(css) {
  const blocks = [];
  let pos = 0;
  
  while (true) {
    const rootIndex = css.indexOf(':root', pos);
    if (rootIndex === -1) break;
    
    // Find the opening brace
    const braceIndex = css.indexOf('{', rootIndex);
    if (braceIndex === -1) break;
    
    // Find matching closing brace
    let braceCount = 1;
    let contentStart = braceIndex + 1;
    let i = contentStart;
    
    while (i < css.length && braceCount > 0) {
      if (css[i] === '{') braceCount++;
      else if (css[i] === '}') braceCount--;
      i++;
    }
    
    const content = css.substring(contentStart, i - 1);
    blocks.push(content);
    
    pos = i;
  }
  
  return blocks;
}

function extractPropertiesFromBlock(blockContent) {
  const props = {};
  // Match CSS custom properties: --name: value;
  const propRegex = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let match;
  
  while ((match = propRegex.exec(blockContent)) !== null) {
    const name = match[1];
    const value = match[2].trim();
    props[name] = value;
  }
  
  return props;
}

function processBaseRootProperties(props, tokens) {
  for (const [name, value] of Object.entries(props)) {
    const tokenName = name.replace('--', '');
    const token = { value, type: inferType(name, value) };
    
    // Categorize by prefix
    if (tokenName.startsWith('color-')) {
      tokens.color[camelCase(tokenName.replace('color-', ''))] = token;
    } else if (tokenName.startsWith('font-')) {
      if (tokenName.includes('family') || tokenName === 'font-sans' || tokenName === 'font-mono') {
        const key = tokenName.replace('font-', '').replace('sans', 'sans').replace('mono', 'mono');
        tokens.typography.fontFamilies[camelCase(key)] = token;
      } else if (tokenName.startsWith('font-weight-')) {
        tokens.typography.fontWeights[camelCase(tokenName.replace('font-weight-', ''))] = token;
      }
    } else if (tokenName.startsWith('text-')) {
      tokens.typography.fontSizes[camelCase(tokenName.replace('text-', ''))] = token;
    } else if (tokenName.startsWith('line-height-')) {
      tokens.typography.lineHeights[camelCase(tokenName.replace('line-height-', ''))] = token;
    } else if (tokenName.startsWith('space-')) {
      tokens.spacing[tokenName.replace('space-', '')] = token;
    } else if (tokenName.startsWith('radius-')) {
      tokens.borderRadius[camelCase(tokenName.replace('radius-', ''))] = token;
    } else if (tokenName.startsWith('shadow-')) {
      tokens.shadows[camelCase(tokenName.replace('shadow-', ''))] = token;
    } else if (tokenName.startsWith('z-')) {
      tokens.zIndex[camelCase(tokenName.replace('z-', ''))] = token;
    } else if (tokenName.startsWith('bp-')) {
      tokens.breakpoints[camelCase(tokenName.replace('bp-', ''))] = token;
    } else if (tokenName.startsWith('transition-')) {
      tokens.transitions[camelCase(tokenName.replace('transition-', ''))] = token;
    } else if (tokenName.startsWith('touch-target')) {
      const key = tokenName.replace('touch-target-', '').replace('touch-target', 'default');
      tokens.touchTargets[camelCase(key) || 'default'] = token;
    } else if (tokenName.startsWith('container-')) {
      tokens.container[camelCase(tokenName.replace('container-', ''))] = token;
    } else if (tokenName.startsWith('tenant-')) {
      // Tenant definitions are in the first :root block
      tokens.tenant[camelCase(tokenName.replace('tenant-', ''))] = token;
    }
  }
}

function processMediaProperties(mediaProps, tokens) {
  for (const [mediaQuery, props] of Object.entries(mediaProps)) {
    if (mediaQuery.includes('prefers-color-scheme: dark')) {
      processDarkModeProps(props, tokens);
    } else if (mediaQuery.includes('prefers-contrast: high')) {
      processHighContrastProps(props, tokens);
    } else if (mediaQuery.includes('prefers-reduced-motion: reduce')) {
      processReducedMotionProps(props, tokens);
    } else if (mediaQuery.includes('print')) {
      processPrintProps(props, tokens);
    }
  }
}

function processDarkModeProps(props, tokens) {
  for (const [name, value] of Object.entries(props)) {
    const tokenName = name.replace('--', '');
    const token = { value, type: inferType(name, value) };
    
    if (tokenName.startsWith('color-')) {
      tokens.darkMode[camelCase(tokenName.replace('color-', ''))] = token;
    } else if (tokenName.startsWith('shadow-')) {
      tokens.darkMode[camelCase(tokenName.replace('shadow-', ''))] = token;
    }
  }
}

function processHighContrastProps(props, tokens) {
  for (const [name, value] of Object.entries(props)) {
    const tokenName = name.replace('--', '');
    const token = { value, type: inferType(name, value) };
    
    if (tokenName.startsWith('color-')) {
      tokens.highContrast[camelCase(tokenName.replace('color-', ''))] = token;
    } else if (tokenName.startsWith('shadow-')) {
      // Map shadow-sm to shadowSm, shadow-md to shadowMd, etc.
      // First camelCase the full token name, then strip shadow prefix
      const fullCamel = camelCase(tokenName);
      const key = fullCamel.replace('shadow', 'shadow');
      tokens.highContrast[key] = token;
    }
  }
}

function processReducedMotionProps(props, tokens) {
  for (const [name, value] of Object.entries(props)) {
    const tokenName = name.replace('--', '');
    const token = { value, type: inferType(name, value) };
    
    if (tokenName.startsWith('transition-')) {
      // Map transition-fast to transitionFast, etc.
      const fullCamel = camelCase(tokenName);
      const key = fullCamel.replace('transition', 'transition');
      tokens.reducedMotion[key] = token;
    }
  }
}

function processPrintProps(props, tokens) {
  for (const [name, value] of Object.entries(props)) {
    const tokenName = name.replace('--', '');
    const token = { value, type: inferType(name, value) };
    
    if (tokenName.startsWith('color-')) {
      tokens.print[camelCase(tokenName.replace('color-', ''))] = token;
    } else if (tokenName.startsWith('shadow-')) {
      // Map shadow-sm to shadowSm, etc.
      const fullCamel = camelCase(tokenName);
      const key = fullCamel.replace('shadow', 'shadow');
      tokens.print[key] = token;
    }
  }
}

function inferType(name, value) {
  if (name.includes('color') || value.startsWith('#') || value.startsWith('rgb') || value.startsWith('rgba')) {
    return 'color';
  }
  if (value.match(/^[\d.]+(px|rem|em|%|vh|vw)$/)) {
    return 'dimension';
  }
  if (value.match(/^[\d.]+$/)) {
    return 'number';
  }
  if (value.startsWith('var(')) {
    return 'reference';
  }
  // Check for duration: ends with ms or s (not just contains)
  if (value.match(/[\d.]+(ms|s)$/)) {
    return 'duration';
  }
  if (value.includes('ease') || value.includes('linear')) {
    return 'transition';
  }
  return 'string';
}

function camelCase(str) {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

export { parseTokensFromCSS };