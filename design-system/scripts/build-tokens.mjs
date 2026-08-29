/**
 * Orchestrator build script for design tokens
 * Runs: export-tokens → generate-css → generate-ts
 * Exits non-zero on any failure (when run as CLI)
 * Throws on failure (when imported as module)
 */

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isMain = import.meta.url === `file://${process.argv[1]}`;

async function runScript(scriptPath, label, ...args) {
  try {
    const script = await import(scriptPath);
    const funcName = Object.keys(script).find(k => typeof script[k] === 'function');
    if (!funcName) {
      throw new Error(`No exported function found in ${scriptPath}`);
    }
    await script[funcName](...args);
    console.log(`✓ ${label}`);
    return { success: true };
  } catch (error) {
    console.error(`✗ ${label}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

function handleFailure(step, error) {
  console.error(`\n❌ Build failed at ${step} step`);
  if (isMain) {
    process.exit(1);
  } else {
    throw new Error(`Build failed at ${step}: ${error}`);
  }
}

export async function buildTokens(options = {}) {
  const {
    tokensPath = resolve(__dirname, '../tokens.json'),
    scriptsDir = __dirname,
    cssOutputPath = resolve(__dirname, '../../client/src/styles/design-tokens.css'),
    tsOutputPath = resolve(__dirname, '../tokens.d.ts'),
    openPencilExportPath = resolve(scriptsDir, '../openpencil/export.json'),
  } = options;

  console.log('🔨 Building design tokens...\n');

  // Step 1: export-tokens (if OpenPencil export exists)
  const { existsSync } = await import('node:fs');
  
  if (existsSync(openPencilExportPath)) {
    console.log('📥 Step 1: Exporting tokens from OpenPencil...');
    const result = await runScript(
      resolve(scriptsDir, 'export-tokens.mjs'),
      'Export tokens',
      openPencilExportPath,
      tokensPath
    );
    if (!result.success) {
      handleFailure('export-tokens', result.error);
    }
  } else {
    console.log('⏭️  Step 1: Skipping export-tokens (no OpenPencil export found)');
  }

  // Load tokens for subsequent steps
  const { readFileSync } = await import('node:fs');
  let tokens;
  try {
    tokens = JSON.parse(readFileSync(tokensPath, 'utf-8'));
  } catch (error) {
    handleFailure('read tokens.json', error.message);
  }

  // Step 2: generate-css
  console.log('\n🎨 Step 2: Generating CSS...');
  const cssResult = await runScript(
    resolve(scriptsDir, 'generate-css.mjs'),
    'Generate CSS',
    tokens,
    cssOutputPath
  );
  if (!cssResult.success) {
    handleFailure('generate-css', cssResult.error);
  }

  // Step 3: generate-ts
  console.log('\n📝 Step 3: Generating TypeScript types...');
  const tsResult = await runScript(
    resolve(scriptsDir, 'generate-ts.mjs'),
    'Generate TypeScript',
    tokens,
    tsOutputPath
  );
  if (!tsResult.success) {
    handleFailure('generate-ts', tsResult.error);
  }

  console.log('\n✅ Design tokens build completed successfully!');
  console.log(`   Tokens: ${tokensPath}`);
  console.log(`   CSS:    ${cssOutputPath}`);
  console.log(`   Types:  ${tsOutputPath}`);

  return { success: true };
}

// CLI entry point
if (isMain) {
  await buildTokens().catch(() => {}); // Error already handled in handleFailure
}

export { runScript };