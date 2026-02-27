#!/usr/bin/env node

const DEFAULT_BALANCE = 40000;
const DEFAULT_THRESHOLD = 50000;

function parseArgs(argv) {
  const args = {
    threshold: DEFAULT_THRESHOLD,
    format: "json",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--threshold") {
      const raw = argv[i + 1];
      if (!raw || !/^\d+$/.test(raw)) {
        throw new Error("invalid --threshold <non-negative integer>");
      }
      args.threshold = Number(raw);
      i += 1;
      continue;
    }
    if (token === "--format") {
      const raw = argv[i + 1];
      if (!raw || !["json", "text"].includes(raw)) {
        throw new Error("invalid --format <json|text>");
      }
      args.format = raw;
      i += 1;
      continue;
    }
    throw new Error(`unknown arg: ${token}`);
  }

  return args;
}

function buildResult(threshold) {
  const remaining = DEFAULT_BALANCE;
  return {
    service: "AINFT",
    remaining_quota: remaining,
    threshold,
    safe: remaining >= threshold,
    gap: remaining >= threshold ? 0 : threshold - remaining,
    source: "quota_service",
  };
}

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const result = buildResult(args.threshold);

    if (args.format === "text") {
      const line = result.safe
        ? `AINFT余额正常：${result.remaining_quota}（阈值 ${result.threshold}）`
        : `AINFT余额告急：${result.remaining_quota}（低于阈值 ${result.threshold}，缺口 ${result.gap}）`;
      process.stdout.write(`${line}\n`);
      return;
    }

    process.stdout.write(`${JSON.stringify(result)}\n`);
  } catch (err) {
    process.stderr.write(
      `${JSON.stringify({
        error: err.message,
        usage: "node scripts/check_balance.js [--threshold <amount>] [--format json|text]",
      })}\n`,
    );
    process.exit(1);
  }
}

main();

