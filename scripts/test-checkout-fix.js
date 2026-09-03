const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync(path.resolve('.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log("=== Testing create_order_atomic RPC Fix ===");

  // 1. Fetch a product without variation and a product with variation
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('id, name, price, stock')
    .limit(2);

  if (pErr || !products || products.length === 0) {
    console.error("Failed to fetch products:", pErr);
    process.exit(1);
  }

  const baseProduct = products[0];
  console.log(`Testing with base product (No variation): "${baseProduct.name}" (ID: ${baseProduct.id})`);

  // 2. Call create_order_atomic RPC with item having variation_id = null
  const testPayload = {
    p_user_id: null,
    p_customer_name: "Test Checkout Bot",
    p_customer_email: "testbot@msimobile.com.bd",
    p_customer_phone: "01700000000",
    p_shipping_address: {
      address: "House 12, Road 5, Dhanmondi",
      district: "Dhaka",
    },
    p_items: [
      {
        product_id: baseProduct.id,
        variation_id: null,
        quantity: 1,
        client_unit_price: baseProduct.price,
      }
    ],
    p_payment_method: "COD",
    p_coupon_code: null,
  };

  console.log("Invoking create_order_atomic with variation_id = null...");
  const { data: rpcResult, error: rpcErr } = await supabase.rpc('create_order_atomic', testPayload);

  if (rpcErr) {
    console.error("\n❌ RPC Error Returned:", rpcErr.message);
    if (rpcErr.message.includes("is not assigned yet")) {
      console.error("CRITICAL: The database still has the old unassigned record function. Please apply the migration in Supabase SQL Editor.");
    }
  } else {
    console.log("\n✅ Order created successfully without any 'v_variation_row' error!");
    console.log("Order Result:", JSON.stringify(rpcResult, null, 2));

    // Cleanup the test order
    if (rpcResult?.order_id) {
      console.log(`Cleaning up test order ID: ${rpcResult.order_id}...`);
      await supabase.from('orders').delete().eq('id', rpcResult.order_id);
      // Restore base product stock
      await supabase.from('products').update({ stock: baseProduct.stock }).eq('id', baseProduct.id);
      console.log("Test order cleaned up and stock restored.");
    }
  }
}

runTest();
