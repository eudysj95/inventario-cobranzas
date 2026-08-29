import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, rmSync, existsSync, mkdirSync } from 'node:fs';

describe('package.json scripts', () => {
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

  it('should have design-system/package.json with build-tokens script', () => {
    const pkgPath = '/home/eudysj95/IA/Nexo/design-system/package.json';
    assert.ok(existsSync(pkgPath), 'design-system/package.json should exist');
    
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    assert.ok(pkg.scripts);
    assert.ok(pkg.scripts['build-tokens']);
    assert.ok(pkg.scripts['build-tokens'].includes('build-tokens.mjs'));
  });

  it('should have root package.json with design:build script', () => {
    const pkgPath = '/home/eudysj95/IA/Nexo/package.json';
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    
    assert.ok(pkg.scripts);
    assert.ok(pkg.scripts['design:build']);
    assert.ok(pkg.scripts['design:build'].includes('design-system'));
    assert.ok(pkg.scripts['design:build'].includes('build-tokens'));
  });

  it('should use bun in design-system package.json', () => {
    const pkgPath = '/home/eudysj95/IA/Nexo/design-system/package.json';
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    
    // Should use bun or node (both work, but bun is preferred per project)
    assert.ok(pkg.scripts['build-tokens'].includes('node') || pkg.scripts['build-tokens'].includes('bun'));
  });
});