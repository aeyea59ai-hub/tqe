#!/usr/bin/env node
/**
 * Determinism guard — no fabricated numbers on a decision path.
 *
 * The product contract requires that missing, stale, malformed or contradictory
 * data yields an explicit non-actionable result, never an invented number.
 * `Math.random()` must therefore never appear in a price, indicator, derivative,
 * risk, sizing or paper-accounting path.
 *
 * The C+ prototype was imported with pre-existing violations. Rather than
 * disable the check until they are all fixed, known violations are pinned in
 * `scripts/determinism-baseline.json`. The guard then enforces two things:
 *
 *   1. Any *new* violation fails immediately.
 *   2. Any baseline entry that no longer exists fails too, so the baseline can
 *      only ever shrink. Phase 5 drives it to zero.
 *
 * Exit 0 = clean, exit 1 = new violation or stale baseline.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve(process.argv[2] ?? 'app');
const BASELINE_PATH = path.resolve('scripts/determinism-baseline.json');

const SCAN_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const SKIP_DIRECTORIES = new Set(['node_modules', 'dist', 'build', 'coverage', '.git']);

/** Test fixtures and mock-provider surfaces are exempt by path. */
const EXEMPT_PATH_PATTERNS = [/(^|\/)test\//, /\.test\.tsx?$/, /(^|\/)__tests__\//];

const VIOLATION_PATTERN = /Math\s*\.\s*random\s*\(/;

/** A line may opt out only by naming this token, keeping exemptions greppable. */
const ALLOW_TOKEN = 'determinism-allow';

function collectFiles(dir, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRECTORIES.has(entry.name)) continue;
      collectFiles(full, out);
    } else if (SCAN_EXTENSIONS.has(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function loadBaseline() {
  if (!fs.existsSync(BASELINE_PATH)) return { files: {} };
  const parsed = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
  return { files: parsed.files ?? {} };
}

function main() {
  if (!fs.existsSync(ROOT)) {
    console.error(`[DETERMINISM] scan root not found: ${ROOT}`);
    process.exit(1);
  }

  const baseline = loadBaseline();
  const observed = {};

  for (const file of collectFiles(ROOT)) {
    const rel = toPosix(path.relative(process.cwd(), file));
    if (EXEMPT_PATH_PATTERNS.some((p) => p.test(rel))) continue;

    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    let count = 0;
    for (const line of lines) {
      if (line.includes(ALLOW_TOKEN)) continue;
      if (VIOLATION_PATTERN.test(line)) count += 1;
    }
    if (count > 0) observed[rel] = count;
  }

  const newViolations = [];
  const increased = [];
  const stale = [];

  for (const [file, count] of Object.entries(observed)) {
    const allowed = baseline.files[file];
    if (allowed === undefined) newViolations.push({ file, count });
    else if (count > allowed) increased.push({ file, count, allowed });
  }

  for (const [file, allowed] of Object.entries(baseline.files)) {
    const count = observed[file] ?? 0;
    if (count < allowed) stale.push({ file, count, allowed });
  }

  const observedTotal = Object.values(observed).reduce((a, b) => a + b, 0);
  const baselineTotal = Object.values(baseline.files).reduce((a, b) => a + b, 0);
  console.log(
    `[DETERMINISM] ${observedTotal} Math.random() call site(s) on non-test paths; baseline allows ${baselineTotal}.`,
  );

  let failed = false;

  if (newViolations.length > 0 || increased.length > 0) {
    failed = true;
    console.error('[DETERMINISM] FAIL — fabricated values introduced on a decision path:');
    for (const v of newViolations) console.error(`  ${v.file}: ${v.count} new call site(s)`);
    for (const v of increased) {
      console.error(`  ${v.file}: ${v.count} call site(s), baseline allows ${v.allowed}`);
    }
    console.error('\nMissing or stale data must produce an explicit non-actionable state,');
    console.error('not an invented number. See docs/adr/0005-fabricated-data-policy.md.');
  }

  if (stale.length > 0) {
    failed = true;
    console.error('[DETERMINISM] FAIL — the baseline is stale and must be tightened:');
    for (const v of stale) {
      console.error(`  ${v.file}: now ${v.count} call site(s), baseline still allows ${v.allowed}`);
    }
    console.error('\nThe baseline may only shrink. Update scripts/determinism-baseline.json.');
  }

  if (failed) process.exit(1);

  if (baselineTotal === 0) {
    console.log('[DETERMINISM] PASS — no fabricated values on any decision path.');
  } else {
    console.log(
      `[DETERMINISM] PASS (with ${baselineTotal} baselined pre-existing violation(s) pending Phase 5).`,
    );
  }
}

main();
