const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync(path.resolve('.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      const client = url.startsWith('https') ? https : http;
      const req = client.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
        resolve({ url, status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400 });
      });
      req.on('error', (err) => resolve({ url, status: 0, error: err.message, ok: false }));
      req.on('timeout', () => { req.destroy(); resolve({ url, status: 408, ok: false }); });
      req.end();
    } catch (e) {
      resolve({ url, status: 0, error: e.message, ok: false });
    }
  });
}

async function testImages() {
  console.log("=== CHECKING PRODUCT IMAGE URL ACCESSIBILITY ===");
  const { data: products } = await supabase.from('products').select('id, name, images');

  let totalImages = 0;
  let brokenImages = [];

  for (const p of products || []) {
    const images = Array.isArray(p.images) ? p.images : [];
    for (const imgUrl of images) {
      totalImages++;
      const result = await checkUrl(imgUrl);
      if (!result.ok) {
        brokenImages.push({ productId: p.id, productName: p.name, url: imgUrl, status: result.status });
        console.log(`❌ [BROKEN] ${p.name} -> ${imgUrl} (Status: ${result.status})`);
      } else {
        console.log(`✅ [OK] ${p.name.slice(0, 30)}... (${result.status})`);
      }
    }
  }

  console.log(`\nTotal Images Checked: ${totalImages}`);
  console.log(`Broken Images: ${brokenImages.length}`);
}

testImages();
