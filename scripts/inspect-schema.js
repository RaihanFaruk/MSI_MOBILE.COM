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

async function inspect() {
  console.log("=== Inspecting Coupons Table ===");
  const { data: coupons, error: cErr } = await supabase.from('coupons').select('*').limit(2);
  console.log("Coupons:", coupons, "Error:", cErr);

  console.log("\n=== Inspecting Profiles Table ===");
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*').limit(5);
  console.log("Profiles:", profiles, "Error:", pErr);

  console.log("\n=== Inspecting Reviews Table ===");
  const { data: reviews, error: rErr } = await supabase.from('reviews').select('*').limit(2);
  console.log("Reviews:", reviews, "Error:", rErr);
}

inspect();
