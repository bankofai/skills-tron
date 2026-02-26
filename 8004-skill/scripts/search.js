#!/usr/bin/env node

/**
 * ERC-8004 Semantic Search Script
 *
 * Search agents from search-service API (/api/v1/search)
 *
 * Usage examples:
 *   node scripts/search.js --query "ainft" --url https://tn-search-service.bankofai.io --chain-id 3448148188
 *   node scripts/search.js --query "x402" --active true --x402 true
 */

const http = require('http');
const https = require('https');

function parseBoolean(value) {
  if (value === undefined || value === null) return undefined;
  const normalized = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'y'].includes(normalized)) return true;
  if (['false', '0', 'no', 'n'].includes(normalized)) return false;
  return undefined;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    query: '',
    url: process.env.SEARCH_SERVICE_URL || 'https://tn-search-service.bankofai.io',
    chainId: Number(process.env.SEARCH_CHAIN_ID || 3448148188),
    limit: 10,
    active: undefined,
    x402support: undefined,
    minScore: undefined,
    json: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--query' && args[i + 1]) {
      options.query = args[i + 1];
      i++;
    } else if (arg === '--url' && args[i + 1]) {
      options.url = args[i + 1];
      i++;
    } else if (arg === '--chain-id' && args[i + 1]) {
      options.chainId = Number(args[i + 1]);
      i++;
    } else if (arg === '--limit' && args[i + 1]) {
      options.limit = Number(args[i + 1]);
      i++;
    } else if (arg === '--active' && args[i + 1]) {
      options.active = parseBoolean(args[i + 1]);
      i++;
    } else if (arg === '--x402' && args[i + 1]) {
      options.x402support = parseBoolean(args[i + 1]);
      i++;
    } else if (arg === '--min-score' && args[i + 1]) {
      options.minScore = Number(args[i + 1]);
      i++;
    } else if (arg === '--json') {
      options.json = true;
    }
  }

  return options;
}

function postJson(endpoint, payload, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    let parsed;
    try {
      parsed = new URL(endpoint);
    } catch (error) {
      reject(new Error(`Invalid URL: ${endpoint}`));
      return;
    }

    const body = JSON.stringify(payload);
    const client = parsed.protocol === 'https:' ? https : http;

    const req = client.request(
      {
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: parsed.pathname + (parsed.search || ''),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          const statusCode = res.statusCode || 500;
          if (statusCode < 200 || statusCode >= 300) {
            reject(new Error(`HTTP ${statusCode}: ${data}`));
            return;
          }
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error(`Invalid JSON response: ${data}`));
          }
        });
      }
    );

    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`Request timeout after ${timeoutMs}ms`));
    });

    req.on('error', (error) => reject(error));
    req.write(body);
    req.end();
  });
}

function buildSearchPayload(options) {
  const payload = {
    query: options.query,
    limit: options.limit,
    chains: [options.chainId],
  };

  const equals = {};
  if (typeof options.active === 'boolean') {
    equals.active = options.active;
  }
  if (typeof options.x402support === 'boolean') {
    equals.x402support = options.x402support;
  }

  if (Object.keys(equals).length > 0) {
    payload.filters = { equals };
  }

  if (typeof options.minScore === 'number' && !Number.isNaN(options.minScore)) {
    payload.minScore = options.minScore;
  }

  return payload;
}

function printHumanReadable(response) {
  const results = Array.isArray(response.results) ? response.results : [];

  console.log('🔎 Semantic Search Results');
  console.log('');
  console.log(`Query: ${response.query || '(empty)'}`);
  console.log(`Total: ${response.total || 0}`);
  console.log('');

  if (results.length === 0) {
    console.log('No agents found.');
    return;
  }

  for (const item of results) {
    const meta = item.metadata || {};
    console.log(`#${item.rank}  ${item.name || '(no name)'}`);
    console.log(`   Agent: ${item.agentId}`);
    console.log(`   Chain: ${item.chainId}`);
    console.log(`   Score: ${Number(item.score || 0).toFixed(4)}`);
    console.log(`   Active: ${meta.active === undefined ? 'unknown' : String(meta.active)}`);
    console.log(`   X402: ${meta.x402support === undefined ? 'unknown' : String(meta.x402support)}`);
    if (item.description) {
      console.log(`   Desc: ${item.description.slice(0, 120)}`);
    }
    console.log('');
  }
}

async function main() {
  const options = parseArgs();

  if (!options.query) {
    console.log('ERC-8004 Semantic Search');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/search.js --query "ainft" [options]');
    console.log('');
    console.log('Required:');
    console.log('  --query <text>           Natural language query');
    console.log('');
    console.log('Optional:');
    console.log('  --url <url>              Search service base URL (default: https://tn-search-service.bankofai.io)');
    console.log('  --chain-id <id>          Chain ID filter (default: 3448148188)');
    console.log('  --limit <n>              Result limit (default: 10)');
    console.log('  --active <bool>          Filter active true/false');
    console.log('  --x402 <bool>            Filter x402support true/false');
    console.log('  --min-score <num>        Minimum semantic score (0-1)');
    console.log('  --json                   Print raw JSON response');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/search.js --query "payment agent"');
    console.log('  node scripts/search.js --query "x402" --active true --x402 true');
    console.log('  node scripts/search.js --query "ainft" --url https://search.example.com --json');
    process.exit(0);
  }

  if (Number.isNaN(options.chainId)) {
    console.error('❌ Invalid --chain-id value');
    process.exit(1);
  }
  if (Number.isNaN(options.limit) || options.limit <= 0) {
    console.error('❌ Invalid --limit value');
    process.exit(1);
  }

  const endpoint = `${options.url.replace(/\/$/, '')}/api/v1/search`;
  const payload = buildSearchPayload(options);

  try {
    const response = await postJson(endpoint, payload, 45000);

    if (options.json) {
      console.log(JSON.stringify(response, null, 2));
      return;
    }

    printHumanReadable(response);
  } catch (error) {
    console.error('❌ Search failed:', error.message || error);
    process.exit(1);
  }
}

main();
