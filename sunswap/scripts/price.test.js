#!/usr/bin/env node

/**
 * Basic runtime test for scripts/price.js
 *
 * This test:
 * 1. Resolves TRX address from common_tokens.json (mainnet)
 * 2. Calls open.sun.io price API via getTokenPriceUSD
 * 3. Asserts the returned price is a positive number
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

const { getTokenAddress, getTokenPriceUSD } = require('./price');

async function testTrxPriceMainnet() {
  const tokensPath = path.join(__dirname, '../resources/common_tokens.json');
  const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

  const trxAddress = tokens.mainnet.TRX.address;
  assert.ok(trxAddress, 'TRX address should exist in mainnet token list');

  const { priceUSD, lastUpdated } = await getTokenPriceUSD(trxAddress);

  assert.ok(typeof priceUSD === 'number', 'priceUSD should be a number');
  assert.ok(priceUSD > 0, 'priceUSD should be > 0');
  assert.ok(lastUpdated, 'lastUpdated should be defined');
}

async function testSymbolResolution() {
  const addrMainnet = getTokenAddress('TRX', 'mainnet');
  const addrNile = getTokenAddress('TRX', 'nile');

  assert.ok(addrMainnet && addrNile, 'TRX address should be resolvable on both networks');
}

async function run() {
  try {
    console.error('Running price.js tests...');

    await testTrxPriceMainnet();
    console.error('✅ TRX price (mainnet) test passed');

    await testSymbolResolution();
    console.error('✅ Symbol resolution test passed');

    console.error('All price.js tests passed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  run();
}

