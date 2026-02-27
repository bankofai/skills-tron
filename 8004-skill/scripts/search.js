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

function parseChainSelection(value) {
  if (value === undefined || value === null) return undefined;
  const raw = String(value).trim();
  if (!raw) return undefined;
  if (raw.toLowerCase() === 'all') return 'all';
  const ids = raw
    .split(',')
    .map((v) => Number(v.trim()))
    .filter((n) => !Number.isNaN(n));
  if (ids.length === 0) return undefined;
  return Array.from(new Set(ids));
}

function parseArgs() {
  const args = process.argv.slice(2);
  const envChains = parseChainSelection(process.env.SEARCH_CHAINS);
  const envChainId = process.env.SEARCH_CHAIN_ID ? Number(process.env.SEARCH_CHAIN_ID) : undefined;

  const options = {
    query: '',
    url: process.env.SEARCH_SERVICE_URL || 'https://tn-search-service.bankofai.io',
    chains: envChains || (Number.isFinite(envChainId) ? [envChainId] : undefined),
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
      const single = Number(args[i + 1]);
      options.chains = Number.isNaN(single) ? undefined : [single];
      i++;
    } else if (arg === '--chains' && args[i + 1]) {
      options.chains = parseChainSelection(args[i + 1]);
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
  };

  if (options.chains !== undefined) {
    payload.chains = options.chains;
  }

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

function trimText(value, max = 180) {
  if (!value) return '';
  const text = String(value).replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3)}...`;
}

function asStringArray(value) {
  return Array.isArray(value) ? value.map((v) => String(v)).filter(Boolean) : [];
}

function formatUri(uri) {
  if (!uri) return '';
  const value = String(uri);
  if (value.startsWith('data:')) {
    return '[data-uri omitted]';
  }
  return trimText(value, 160);
}

function inferUseCases(item) {
  const meta = item.metadata || {};
  const tags = asStringArray(meta.tags).map((t) => t.toLowerCase());
  const capabilities = asStringArray(meta.capabilities).map((c) => c.toLowerCase());
  const corpus = [item.name, item.description, tags.join(' '), capabilities.join(' ')]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const useCases = [];
  const hasAny = (words) => words.some((w) => corpus.includes(w));

  if (hasAny(['x402', 'payment', 'payee', 'merchant', 'recharge'])) {
    useCases.push('Payment / x402 settlement');
  }
  if (hasAny(['swap', 'dex', 'market', 'trade', 'router'])) {
    useCases.push('Trading / swap execution');
  }
  if (hasAny(['mcp', 'tool', 'prompt', 'agent card'])) {
    useCases.push('MCP tool agent integration');
  }
  if (hasAny(['reputation', 'validation', 'registry', 'trust'])) {
    useCases.push('Reputation / validation workflow');
  }
  if (hasAny(['chat', 'assistant', 'nlp', 'text'])) {
    useCases.push('General conversational assistant');
  }

  if (useCases.length === 0) {
    useCases.push('General-purpose ERC-8004 agent');
  }

  return useCases.slice(0, 3);
}

function printHumanReadable(response) {
  const results = Array.isArray(response.results) ? response.results : [];

  console.log('Semantic Search Results');
  console.log('=======================');
  console.log(`Query: ${response.query || '(empty)'}`);
  console.log(`Total: ${response.total || 0}`);
  console.log('');

  if (results.length === 0) {
    console.log('No agents found.');
    return;
  }

  for (const item of results) {
    const meta = item.metadata || {};
    const tags = asStringArray(meta.tags);
    const capabilities = asStringArray(meta.capabilities);
    const supportedTrusts = asStringArray(meta.supportedTrusts);
    const inputModes = asStringArray(meta.defaultInputModes);
    const outputModes = asStringArray(meta.defaultOutputModes);
    const useCases = inferUseCases(item);
    const image = meta.image || meta.avatar || '';
    const a2a = meta.a2aEndpoint || meta.a2a_endpoint || '';
    const mcp = meta.mcpEndpoint || meta.mcp_endpoint || '';
    const wallet = meta.agentWallet || meta.agent_wallet || '';
    const status = meta.active === true ? 'Active' : (meta.active === false ? 'Inactive' : 'Unknown');
    const x402 = meta.x402support === true ? 'Yes' : (meta.x402support === false ? 'No' : 'Unknown');

    console.log(`[#${item.rank}] ${item.name || '(no name)'}  (score ${Number(item.score || 0).toFixed(4)})`);
    console.log(`  Agent ID: ${item.agentId}`);
    console.log(`  Chain ID: ${item.chainId}`);
    console.log(`  Status: ${status} | x402: ${x402}`);
    if (trimText(item.description, 220)) {
      console.log(`  What this agent does: ${trimText(item.description, 220)}`);
    }
    console.log(`  Best use cases: ${useCases.join(' ; ')}`);
    if (supportedTrusts.length > 0) {
      console.log(`  Trust model: ${supportedTrusts.join(', ')}`);
    }
    if (inputModes.length > 0 || outputModes.length > 0) {
      console.log(
        `  IO modes: in[${inputModes.join(', ') || '-'}] -> out[${outputModes.join(', ') || '-'}]`
      );
    }
    if (tags.length > 0) {
      console.log(`  Tags: ${tags.join(', ')}`);
    }
    if (capabilities.length > 0) {
      console.log(`  Capabilities: ${capabilities.join(', ')}`);
    }
    if (mcp) {
      console.log(`  MCP endpoint: ${mcp}${meta.mcpVersion ? ` (v${meta.mcpVersion})` : ''}`);
    }
    if (a2a) {
      console.log(`  A2A endpoint: ${a2a}${meta.a2aVersion ? ` (v${meta.a2aVersion})` : ''}`);
    }
    if (wallet) {
      console.log(`  Agent wallet: ${wallet}`);
    }
    if (meta.agentURI) {
      console.log(`  Agent URI: ${formatUri(meta.agentURI)}`);
    }
    if (image) {
      console.log(`  Image: ${image}`);
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
    console.log('  --chain-id <id>          Single chain filter (e.g. 56 or 3448148188)');
    console.log('  --chains <ids|all>       Multi-chain filter, e.g. "56,3448148188" or "all"');
    console.log('  --limit <n>              Result limit (default: 10)');
    console.log('  --active <bool>          Filter active true/false');
    console.log('  --x402 <bool>            Filter x402support true/false');
    console.log('  --min-score <num>        Minimum semantic score (0-1)');
    console.log('  --json                   Print raw JSON response');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/search.js --query "payment agent"');
    console.log('  node scripts/search.js --query "x402 a2a" --chains "56,3448148188"');
    console.log('  node scripts/search.js --query "x402" --active true --x402 true');
    console.log('  node scripts/search.js --query "ainft" --url https://search.example.com --json');
    process.exit(0);
  }

  if (Array.isArray(options.chains)) {
    if (options.chains.length === 0 || options.chains.some((v) => Number.isNaN(v))) {
      console.error('❌ Invalid --chain-id/--chains value');
      process.exit(1);
    }
  } else if (options.chains !== undefined && options.chains !== 'all') {
    console.error('❌ Invalid --chains value (use comma-separated IDs or "all")');
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
