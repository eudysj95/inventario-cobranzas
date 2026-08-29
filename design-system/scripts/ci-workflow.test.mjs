import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, rmSync, existsSync, mkdirSync } from 'node:fs';

describe('CI workflow: design-tokens.yml', () => {
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

  it('should exist at .github/workflows/design-tokens.yml', () => {
    const workflowPath = '/home/eudysj95/IA/Nexo/.github/workflows/design-tokens.yml';
    assert.ok(existsSync(workflowPath), 'Workflow file should exist');
  });

  it('should have correct workflow structure', () => {
    const workflowPath = '/home/eudysj95/IA/Nexo/.github/workflows/design-tokens.yml';
    const content = readFileSync(workflowPath, 'utf-8');
    
    // Check workflow name
    assert.ok(content.includes('name: Design Tokens Sync'));
    
    // Check triggers
    assert.ok(content.includes('on:'));
    assert.ok(content.includes('pull_request:'));
    assert.ok(content.includes('paths:'));
    assert.ok(content.includes("'design-system/**'"));
    assert.ok(content.includes("'client/src/styles/design-tokens.css'"));
    
    // Check job
    assert.ok(content.includes('jobs:'));
    assert.ok(content.includes('verify-tokens:'));
    assert.ok(content.includes('runs-on: ubuntu-latest'));
    
    // Check steps
    assert.ok(content.includes('uses: actions/checkout@v4'));
    assert.ok(content.includes('uses: oven-sh/setup-bun@v1'));
    assert.ok(content.includes('cd design-system && bun install && bun run build-tokens'));
    assert.ok(content.includes('git diff --exit-code'));
    assert.ok(content.includes('client/src/styles/design-tokens.css'));
    assert.ok(content.includes('design-system/tokens.json'));
    assert.ok(content.includes('design-system/tokens.d.ts'));
  });

  it('should use bun for package management', () => {
    const workflowPath = '/home/eudysj95/IA/Nexo/.github/workflows/design-tokens.yml';
    const content = readFileSync(workflowPath, 'utf-8');
    
    assert.ok(content.includes('oven-sh/setup-bun@v1'));
    assert.ok(content.includes('bun install'));
    assert.ok(content.includes('bun run build-tokens'));
  });
});