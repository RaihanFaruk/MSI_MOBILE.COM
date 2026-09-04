const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync(path.resolve('.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function runDataAudit() {
  console.log("=== RUNNING SUPABASE DATA INTEGRITY AUDIT ===");

  // 1. Fetch all products & categories
  const { data: categories } = await supabase.from('categories').select('*');
  const { data: products, error: prodErr } = await supabase.from('products').select('*');

  if (prodErr) {
    console.error("Failed to query products:", prodErr);
    return;
  }

  console.log(`Total Categories in DB: ${categories?.length || 0}`);
  console.log(`Total Products in DB: ${products?.length || 0}`);

  const categoryIds = new Set((categories || []).map(c => String(c.id)));

  // 2. Check discount_price >= price
  const badDiscountProducts = products.filter(p => {
    if (p.discount_price !== null && p.discount_price !== undefined) {
      return Number(p.discount_price) >= Number(p.price);
    }
    return false;
  });

  console.log(`\n1. Bad Discount Products (discount_price >= price): ${badDiscountProducts.length}`);
  badDiscountProducts.forEach(p => {
    console.log(`  - [ID: ${p.id}] "${p.name}" | Price: ৳${p.price} | Discount Price: ৳${p.discount_price}`);
  });

  // 3. Check orphan or null category_id
  const orphanCategoryProducts = products.filter(p => {
    if (!p.category_id) return true;
    return !categoryIds.has(String(p.category_id));
  });

  console.log(`\n2. Products with Missing or Orphan category_id: ${orphanCategoryProducts.length}`);
  orphanCategoryProducts.forEach(p => {
    console.log(`  - [ID: ${p.id}] "${p.name}" | category_id: ${p.category_id}`);
  });

  // 4. Check duplicate slugs
  const slugCounts = {};
  products.forEach(p => {
    const slug = p.slug || 'NO_SLUG';
    slugCounts[slug] = (slugCounts[slug] || 0) + 1;
  });

  const duplicateSlugs = Object.entries(slugCounts).filter(([s, count]) => count > 1);
  console.log(`\n3. Duplicate Slugs: ${duplicateSlugs.length}`);
  duplicateSlugs.forEach(([slug, count]) => {
    console.log(`  - Slug "${slug}" appears ${count} times`);
  });

  // 5. Check products without images or empty images array
  const emptyImageProducts = products.filter(p => !p.images || p.images.length === 0);
  console.log(`\n4. Products with Empty/Null Images: ${emptyImageProducts.length}`);
  emptyImageProducts.forEach(p => {
    console.log(`  - [ID: ${p.id}] "${p.name}"`);
  });

  // 6. Check stock = 0
  const outOfStockProducts = products.filter(p => Number(p.stock) <= 0);
  console.log(`\n5. Out-of-Stock Products (stock <= 0): ${outOfStockProducts.length}`);
  outOfStockProducts.forEach(p => {
    console.log(`  - [ID: ${p.id}] "${p.name}" | Stock: ${p.stock}`);
  });

  console.log("\n=== AUDIT COMPLETE ===");
}

runDataAudit();
