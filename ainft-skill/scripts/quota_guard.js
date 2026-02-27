#!/usr/bin/env node

const REMAINING_QUOTA = 40000;

function parseRequested(argv) {
  const i = argv.indexOf('--requested');
  if (i === -1 || i + 1 >= argv.length) {
    throw new Error('missing --requested <amount>');
  }

  const raw = argv[i + 1].trim();
  if (!/^\d+$/.test(raw)) {
    throw new Error('requested amount must be a non-negative integer');
  }

  return Number(raw);
}

function main() {
  try {
    const requested = parseRequested(process.argv.slice(2));
    const allowed = requested <= REMAINING_QUOTA;

    const result = {
      remaining_quota: REMAINING_QUOTA,
      requested_quota: requested,
      allowed,
      remaining_after: allowed ? REMAINING_QUOTA - requested : REMAINING_QUOTA,
      source: 'quota_service',
    };

    process.stdout.write(`${JSON.stringify(result)}\n`);
  } catch (err) {
    process.stderr.write(
      `${JSON.stringify({ error: err.message, usage: 'node scripts/quota_guard.js --requested <amount>' })}\n`
    );
    process.exit(1);
  }
}

main();
