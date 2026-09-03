const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.resolve('.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const store_id = env.SSLCOMMERZ_STORE_ID || "testbox";
const store_passwd = env.SSLCOMMERZ_STORE_PASSWORD || "qwerty";
const siteUrl = env.NEXT_PUBLIC_SITE_URL || "https://msi-mobile-com.vercel.app";

async function testSSLCommerz() {
  console.log("=== Testing SSLCommerz Sandbox Session Initiation ===");
  console.log("Store ID:", store_id);

  const tran_id = "MSI-TEST-" + Date.now();
  const params = new URLSearchParams({
    store_id: store_id,
    store_passwd: store_passwd,
    total_amount: "1500",
    currency: "BDT",
    tran_id: tran_id,
    success_url: `${siteUrl}/api/payment/callback?status=success&tran_id=${tran_id}`,
    fail_url: `${siteUrl}/api/payment/callback?status=fail&tran_id=${tran_id}`,
    cancel_url: `${siteUrl}/api/payment/callback?status=cancel&tran_id=${tran_id}`,
    ipn_url: `${siteUrl}/api/payment/ipn`,
    shipping_method: "Courier",
    product_name: "Test Order Item",
    product_category: "Electronics",
    product_profile: "general",
    cus_name: "Test Customer",
    cus_email: "test@example.com",
    cus_add1: "Dhanmondi 27",
    cus_city: "Dhaka",
    cus_postcode: "1205",
    cus_country: "Bangladesh",
    cus_phone: "01700000000",
    ship_name: "Test Customer",
    ship_add1: "Dhanmondi 27",
    ship_city: "Dhaka",
    ship_postcode: "1205",
    ship_country: "Bangladesh",
  });

  try {
    const res = await fetch("https://sandbox.sslcommerz.com/gwprocess/v4/api.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await res.json();
    console.log("SSLCommerz API Response Status:", data.status);
    console.log("Session Key:", data.sessionkey);
    console.log("Gateway Page URL:", data.GatewayPageURL);

    if (data.status === "SUCCESS") {
      console.log("\n✅ SSLCommerz Sandbox Session created successfully!");
      console.log("Customer Payment Redirection URL:", data.GatewayPageURL);
    } else {
      console.error("\n❌ SSLCommerz initialization failed:", data.failedreason || data);
    }
  } catch (err) {
    console.error("Network error connecting to SSLCommerz:", err);
  }
}

testSSLCommerz();
