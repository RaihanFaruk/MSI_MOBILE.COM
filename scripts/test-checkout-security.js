/**
 * Automated Checkout Security Verification Script
 * 
 * Verifies two end-to-end security guarantees:
 * 1. Price Tampering Rejection (HTTP 400 + "PRICE_MISMATCH")
 * 2. Stock Race Condition & Concurrency Control (HTTP 409 + "INSUFFICIENT_STOCK")
 * 
 * Run with: node scripts/test-checkout-security.js
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const supabaseUrlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const supabaseAnonMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
const supabaseServiceMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);

const supabaseUrl = supabaseUrlMatch ? supabaseUrlMatch[1].trim() : '';
const supabaseKey = supabaseServiceMatch
  ? supabaseServiceMatch[1].trim()
  : (supabaseAnonMatch ? supabaseAnonMatch[1].trim() : '');

const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_URL = 'http://localhost:3001';

/**
 * Helper to make HTTP POST requests
 */
function postJSON(urlStr, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const postData = JSON.stringify(data);

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(responseBody);
        } catch (e) {
          json = { raw: responseBody };
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: json,
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

async function runSecurityTests() {
  console.log('===============================================================');
  console.log('    CHECKOUT SECURITY VERIFICATION SUITE (LOCAL DEV: 3001)    ');
  console.log('===============================================================\n');

  let test1Passed = false;
  let test2Passed = false;

  // -------------------------------------------------------------------------
  // STEP 0: Inspect Catalog State in Database
  // -------------------------------------------------------------------------
  console.log('[Setup] Inspecting live Supabase catalog...');
  const { data: dbProducts, error: prodErr } = await supabase
    .from('products')
    .select('id, name, price, stock')
    .limit(10);

  const { data: dbVariations, error: varErr } = await supabase
    .from('product_variations')
    .select('id, product_id, color, storage, price, stock')
    .limit(10);

  const hasProducts = dbProducts && dbProducts.length > 0;
  const hasVariations = dbVariations && dbVariations.length > 0;

  console.log(`[Setup] Products in DB: ${dbProducts ? dbProducts.length : 0} found (Error: ${prodErr ? prodErr.message : 'none'})`);
  console.log(`[Setup] Variations in DB: ${dbVariations ? dbVariations.length : 0} found (Error: ${varErr ? varErr.message : 'none'})\n`);

  if (!hasProducts || !hasVariations) {
    console.warn('⚠️ WARNING: Products or Variations table is empty in the database!');
    console.warn('   Please execute supabase/migrations/20260901_products_seed.sql in Supabase SQL editor first.\n');
  }

  const targetProduct = hasProducts
    ? dbProducts[0]
    : { id: 'a0000000-0000-0000-0000-000000000001', name: 'Fallback Product 1', price: 139999, stock: 10 };

  const targetVariation = hasVariations
    ? (dbVariations.find((v) => v.product_id === targetProduct.id) || dbVariations[0])
    : { id: 'b0000000-0000-0000-0000-000000000001', product_id: targetProduct.id, price: targetProduct.price, stock: 10 };

  console.log(`Target Product for Test 1: ID ${targetProduct.id} ("${targetProduct.name}") @ ৳${targetProduct.price}`);
  console.log(`Target Variation for Test 1: ID ${targetVariation.id} (Stock: ${targetVariation.stock})\n`);

  // -------------------------------------------------------------------------
  // TEST 1 — Price Tampering Rejection
  // -------------------------------------------------------------------------
  console.log('---------------------------------------------------------------');
  console.log('TEST 1: Price Tampering Rejection');
  console.log('---------------------------------------------------------------');
  console.log('Goal: Verify server re-fetches authoritative prices and rejects tampered expected_subtotal.');

  // Intentionally tamper the expected price (e.g. half price)
  const realPrice = Number(targetVariation.price || targetProduct.price);
  const tamperedSubtotal = Math.floor(realPrice / 2);

  const tamperedPayload = {
    customer_name: 'Security Test Auditor',
    customer_email: 'audit@test.com',
    customer_phone: '01700000001',
    shipping_address: {
      address: '123 Security Lane',
      district: 'Dhaka',
    },
    items: [
      {
        product_id: targetProduct.id,
        variation_id: targetVariation.id,
        quantity: 1,
      },
    ],
    expected_subtotal: tamperedSubtotal, // INTENTIONALLY TAMPERED
    payment_method: 'COD',
  };

  console.log(`Real Authoritative Price: ৳${realPrice}`);
  console.log(`Tampered Submitted Subtotal: ৳${tamperedSubtotal}`);
  console.log('Sending POST http://localhost:3001/api/checkout ...');

  try {
    const res1 = await postJSON(`${BASE_URL}/api/checkout`, tamperedPayload);
    console.log(`Response Status: HTTP ${res1.status}`);
    console.log('Response Body:', JSON.stringify(res1.body, null, 2));

    if (res1.status === 400 && res1.body.code === 'PRICE_MISMATCH') {
      console.log('\n>>> TEST 1 RESULT: PASS ✅');
      console.log('    Server successfully rejected the tampered price with HTTP 400 and code: "PRICE_MISMATCH".\n');
      test1Passed = true;
    } else {
      console.log('\n>>> TEST 1 RESULT: FAIL ❌');
      console.log(`    Expected HTTP 400 with code "PRICE_MISMATCH".`);
      console.log(`    Received HTTP ${res1.status} with body:`, res1.body);
      console.log('\n');
    }
  } catch (err) {
    console.log('\n>>> TEST 1 RESULT: FAIL ❌');
    console.error('    Network/Connection Error:', err.message);
    console.log('\n');
  }

  // -------------------------------------------------------------------------
  // TEST 2 — Stock Race Condition / Overselling Prevention
  // -------------------------------------------------------------------------
  console.log('---------------------------------------------------------------');
  console.log('TEST 2: Stock Race Condition / Overselling Prevention');
  console.log('---------------------------------------------------------------');
  console.log('Goal: Verify atomic row locks (FOR UPDATE) prevent 2 concurrent buyers from overselling stock of 1.');

  // Find or set a variation with stock = 1
  let raceVariation = hasVariations
    ? (dbVariations.find((v) => v.stock === 1) || dbVariations[0])
    : targetVariation;

  let originalStock = raceVariation.stock;
  let stockWasModified = false;

  try {
    if (raceVariation.stock !== 1) {
      console.log(`Setting stock of variation ${raceVariation.id} to 1 unit...`);
      const { error: updateErr } = await supabase
        .from('product_variations')
        .update({ stock: 1 })
        .eq('id', raceVariation.id);

      if (updateErr) {
        console.warn(`[Note] Update restricted by RLS (${updateErr.message}). Testing with current stock: ${raceVariation.stock}.`);
      } else {
        stockWasModified = true;
        console.log(`Stock successfully set to 1.`);
      }
    } else {
      console.log(`Variation ${raceVariation.id} already has exactly 1 unit of stock.`);
    }

    const racePrice = Number(raceVariation.price || targetProduct.price);

    // Prepare 2 identical simultaneous checkout orders
    const orderPayloadA = {
      customer_name: 'Customer A (Buyer 1)',
      customer_email: 'buyer1@test.com',
      customer_phone: '01700000002',
      shipping_address: { address: 'Plot A, Road 1', district: 'Dhaka' },
      items: [{ product_id: raceVariation.product_id, variation_id: raceVariation.id, quantity: 1 }],
      expected_subtotal: racePrice,
      payment_method: 'COD',
    };

    const orderPayloadB = {
      customer_name: 'Customer B (Buyer 2)',
      customer_email: 'buyer2@test.com',
      customer_phone: '01700000003',
      shipping_address: { address: 'Plot B, Road 2', district: 'Dhaka' },
      items: [{ product_id: raceVariation.product_id, variation_id: raceVariation.id, quantity: 1 }],
      expected_subtotal: racePrice,
      payment_method: 'COD',
    };

    console.log('Firing 2 CONCURRENT checkout requests via Promise.all ...');
    const [resA, resB] = await Promise.all([
      postJSON(`${BASE_URL}/api/checkout`, orderPayloadA),
      postJSON(`${BASE_URL}/api/checkout`, orderPayloadB),
    ]);

    console.log('\nConcurrent Request Results:');
    console.log(`Buyer A Response: HTTP ${resA.status} ->`, JSON.stringify(resA.body));
    console.log(`Buyer B Response: HTTP ${resB.status} ->`, JSON.stringify(resB.body));

    const oneSucceeded = (resA.status === 200 && resA.body.success) || (resB.status === 200 && resB.body.success);
    const oneGot409 = (resA.status === 409 && resA.body.code === 'INSUFFICIENT_STOCK') ||
                      (resB.status === 409 && resB.body.code === 'INSUFFICIENT_STOCK');

    if (oneSucceeded && oneGot409) {
      console.log('\n>>> TEST 2 RESULT: PASS ✅');
      console.log('    Exactly ONE order succeeded, and the competing concurrent request was rejected with HTTP 409 "INSUFFICIENT_STOCK".\n');
      test2Passed = true;
    } else {
      console.log('\n>>> TEST 2 RESULT: FAIL ❌');
      console.log('    Expected: Exactly one HTTP 200 (success) and one HTTP 409 ("INSUFFICIENT_STOCK").');
      console.log(`    Actual Buyer A: HTTP ${resA.status} (${resA.body.code || resA.body.message || 'unknown'})`);
      console.log(`    Actual Buyer B: HTTP ${resB.status} (${resB.body.code || resB.body.message || 'unknown'})`);
      console.log('\n');
    }
  } catch (err) {
    console.log('\n>>> TEST 2 RESULT: FAIL ❌');
    console.error('    Error executing concurrency race test:', err.message);
    console.log('\n');
  } finally {
    // 3. Restore original stock if modified
    if (stockWasModified) {
      console.log(`Restoring original stock (${originalStock}) for variation ${raceVariation.id}...`);
      await supabase
        .from('product_variations')
        .update({ stock: originalStock })
        .eq('id', raceVariation.id);
      console.log('Stock restored.');
    }
  }

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('===============================================================');
  console.log('                      TEST SUMMARY REPORT                      ');
  console.log('===============================================================');
  console.log(`TEST 1 (Price Tampering Rejection):                ${test1Passed ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`TEST 2 (Concurrency / Overselling Prevention):      ${test2Passed ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log('===============================================================\n');

  return { test1Passed, test2Passed };
}

runSecurityTests();
