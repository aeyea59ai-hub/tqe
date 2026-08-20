#!/usr/bin/env node
/**
 * TC-SEC-001 — Forbidden trading surface scan.
 *
 * Signal Desk is a paper-trading research workstation. The product contract
 * states that no live-order, signed-request, private-key, withdrawal or
 * transfer surface may exist anywhere in the source. This check automates that
 * assertion so it is enforced on every push rather than asserted in prose.
 *
 * Exit 0 = clean, exit 1 = a forbidden surface was found.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve(process.argv[2] ?? 'app');

const SCAN_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const SKIP_DIRECTORIES = new Set(['node_modules', 'dist', 'build', 'coverage', '.git']);

/**
 * Each rule names the exact forbidden capability. Patterns target call sites and
 * endpoint paths, not vocabulary: the words "order" and "position" are legitimate
 * throughout a paper-trading engine.
 */
const RULES = [
  {
    id: 'LIVE-ORDER-PLACEMENT',
    description: 'Live exchange order placement endpoint',
    pattern: /\/(fapi|api|dapi)\/v\d+\/(order|batchOrders|allOpenOrders|countdownCancelAll)\b/,
  },
  {
    id: 'LIVE-ORDER-METHOD',
    description: 'Exchange client order-mutation call',
    pattern:
      /\.(createOrder|create_order|placeOrder|place_order|submitOrder|submit_order|newOrder|new_order|cancelOrder|cancel_order|editOrder|edit_order|createMarketOrder|createLimitOrder)\s*\(/,
  },
  {
    id: 'SIGNED-REQUEST',
    description: 'Signed/authenticated exchange request construction',
    pattern: /\b(signature\s*=\s*|createHmac\s*\(\s*['"]sha256['"]\s*\)?[\s\S]{0,80}(secretKey|apiSecret|api_secret))/,
  },
  {
    id: 'EXCHANGE-API-SECRET',
    description: 'Exchange API secret / private key material',
    pattern: /\b(BINANCE_API_SECRET|BINANCE_SECRET_KEY|EXCHANGE_API_SECRET|apiSecret|api_secret|privateKey|private_key|PRIVATE_KEY|mnemonic|seedPhrase|seed_phrase)\b/,
  },
  {
    id: 'WITHDRAWAL-TRANSFER',
    description: 'Withdrawal or asset transfer surface',
    pattern:
      /(\/sapi\/v\d+\/(capital\/withdraw|asset\/transfer|futures\/transfer))|\.(withdraw|createWithdrawal|transferAsset|universalTransfer)\s*\(/,
  },
  {
    id: 'LEVERAGE-MARGIN-MUTATION',
    description: 'Live leverage or margin-type mutation',
    pattern: /\/(fapi)\/v\d+\/(leverage|marginType|positionMargin)\b/,
  },
];

/**
 * A line may opt out only by naming this token, which makes every exemption
 * greppable and reviewable.
 */
const ALLOW_TOKEN = 'tc-sec-001-allow';

function collectFiles(dir, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.github') continue;
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

function main() {
  if (!fs.existsSync(ROOT)) {
    console.error(`[TC-SEC-001] scan root not found: ${ROOT}`);
    process.exit(1);
  }

  const files = collectFiles(ROOT);
  const findings = [];

  for (const file of files) {
    // This checker necessarily contains the forbidden patterns as data.
    if (path.resolve(file) === path.resolve(new URL(import.meta.url).pathname)) continue;

    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, index) => {
      if (line.includes(ALLOW_TOKEN)) return;
      for (const rule of RULES) {
        if (rule.pattern.test(line)) {
          findings.push({
            file: path.relative(process.cwd(), file),
            line: index + 1,
            rule,
            text: line.trim().slice(0, 160),
          });
        }
      }
    });
  }

  console.log(`[TC-SEC-001] scanned ${files.length} source files under ${path.relative(process.cwd(), ROOT) || '.'}`);

  if (findings.length > 0) {
    console.error(`[TC-SEC-001] FAIL — ${findings.length} forbidden trading surface(s) found:`);
    for (const f of findings) {
      console.error(`  ${f.file}:${f.line}  [${f.rule.id}] ${f.rule.description}`);
      console.error(`      ${f.text}`);
    }
    console.error('\nSignal Desk is paper-trading only. Remove the surface, or if this is a');
    console.error(`false positive annotate the line with "${ALLOW_TOKEN}" and justify it in review.`);
    process.exit(1);
  }

  console.log('[TC-SEC-001] PASS — no live-order, signed-request, private-key, withdrawal or transfer surface.');
}

main();
