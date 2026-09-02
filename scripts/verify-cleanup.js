/**
 * Post-Cleanup Verification Script
 * Run with: node scripts/verify-cleanup.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.resolve(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const supabaseKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyState() {
  console.log('====================================================');
  console.log('       POST-CLEANUP PRODUCTION READINESS CHECK       ');
  console.log('====================================================\n');

  // Check Desert Titanium 1TB stock
  const { data: vData } = await supabase
    .from('product_variations')
    .select('id, color, storage, stock')
    .eq('id', 'b0000000-0000-0000-0000-000000000006')
    .maybeSingle();

  console.log('Desert Titanium 1TB Variation:');
  console.log('  ID:    ', vData?.id);
  console.log('  Model: ', `${vData?.color} (${vData?.storage})`);
  console.log('  Stock: ', vData?.stock !== undefined ? `${vData.stock} units` : 'Not found');
  console.log('  Status:', vData?.stock === 8 ? 'RESTORED TO 8 ✅' : (vData?.stock === 0 ? 'CURRENTLY 0 (Needs Dashboard SQL run) ⚠️' : `${vData?.stock} units`));

  // Check overall counts
  const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
  const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
  const { count: varCount } = await supabase.from('product_variations').select('*', { count: 'exact', head: true });
  const { count: revCount } = await supabase.from('reviews').select('*', { count: 'exact', head: true });

  console.log('\nCatalog Live Counts:');
  console.log('--------------------');
  console.log('  Products:           ', prodCount);
  console.log('  Categories:         ', catCount);
  console.log('  Product Variations: ', varCount);
  console.log('  Reviews:            ', revCount);
  console.log('====================================================\n');
}

verifyState();
