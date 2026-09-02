/**
 * Supabase Data Migration & Seed Script for MSI MOBILE.COM
 * Run with: node scripts/seed-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hlvndzpauxrqczeiwger.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_-Sf75QRdx7IpYx8L2tPzVA_dNYssoyo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMigration() {
  console.log('--- Checking Supabase Tables & Connection ---');
  try {
    const { data: categories, error: catErr } = await supabase.from('categories').select('id, name, slug');
    if (catErr) {
      console.error('Categories Error:', catErr.message);
    } else {
      console.log(`✅ Categories present: ${categories?.length || 0} items`);
    }

    const { data: products, error: prodErr } = await supabase.from('products').select('id, name, price, stock');
    if (prodErr) {
      console.error('Products Error:', prodErr.message);
    } else {
      console.log(`✅ Products present: ${products?.length || 0} items`);
    }

    const { data: variations, error: varErr } = await supabase.from('product_variations').select('id, color, storage, stock');
    if (varErr) {
      console.error('Variations Error:', varErr.message);
    } else {
      console.log(`✅ Product Variations present: ${variations?.length || 0} items`);
    }
  } catch (err) {
    console.error('Check Migration Exception:', err);
  }
}

checkMigration();
