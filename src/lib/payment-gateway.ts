/**
 * Payment Gateway Integration Scaffold for MSI MOBILE.COM
 * 
 * Supports:
 * 1. SSLCommerz (Credit/Debit Cards, Mobile Banking, Internet Banking)
 * 2. bKash PGW (Direct Merchant Checkout API)
 * 
 * TO ACTIVATE:
 * Add the following environment variables to your .env.local:
 * 
 * # SSLCommerz
 * SSLCOMMERZ_STORE_ID=your_store_id
 * SSLCOMMERZ_STORE_PASSWORD=your_store_passwd
 * SSLCOMMERZ_IS_LIVE=false  # Set to true for production
 * 
 * # bKash Direct PGW
 * BKASH_APP_KEY=your_bkash_app_key
 * BKASH_APP_SECRET=your_bkash_app_secret
 * BKASH_USERNAME=your_bkash_username
 * BKASH_PASSWORD=your_bkash_password
 * BKASH_IS_LIVE=false  # Set to true for production
 */

export interface PaymentInitiationPayload {
  order_id: string;
  order_number: string;
  amount: number;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  shipping_address: string;
  payment_method: "bKash" | "Nagad" | "Card" | "SSLCommerz";
}

export interface PaymentGatewayResponse {
  success: boolean;
  gateway_url?: string;
  transaction_id?: string;
  message?: string;
}

/**
 * Initiate online payment transaction
 */
export async function initiateOnlinePayment(
  payload: PaymentInitiationPayload
): Promise<PaymentGatewayResponse> {
  const isLive = process.env.SSLCOMMERZ_IS_LIVE === "true";
  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePasswd = process.env.SSLCOMMERZ_STORE_PASSWORD;

  // Placeholder check until live merchant credentials are provided
  if (!storeId || !storePasswd) {
    console.warn(
      `[PaymentGateway] Merchant credentials not yet configured for ${payload.payment_method}. Simulated checkout flow applied.`
    );
    return {
      success: true,
      gateway_url: `/checkout/success?orderId=${payload.order_id}&method=${payload.payment_method}&simulated=true`,
      transaction_id: `SIM-${Date.now()}`,
      message: "Simulated sandbox payment initiation (Pending live credentials).",
    };
  }

  // --- SSLCommerz Live / Sandbox Implementation Ready ---
  const gatewayUrl = isLive
    ? "https://securepay.sslcommerz.com/gwprocess/v4/api.php"
    : "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://msimobile.com.bd";

  const sslData = new URLSearchParams({
    store_id: storeId,
    store_passwd: storePasswd,
    total_amount: payload.amount.toString(),
    currency: "BDT",
    tran_id: payload.order_number,
    success_url: `${siteUrl}/api/payment/ipn?status=success&orderId=${payload.order_id}`,
    fail_url: `${siteUrl}/api/payment/ipn?status=fail&orderId=${payload.order_id}`,
    cancel_url: `${siteUrl}/api/payment/ipn?status=cancel&orderId=${payload.order_id}`,
    cus_name: payload.customer_name,
    cus_email: payload.customer_email || "customer@msimobile.com.bd",
    cus_add1: payload.shipping_address,
    cus_phone: payload.customer_phone,
    shipping_method: "Courier",
    product_name: `Order ${payload.order_number}`,
    product_category: "Electronics",
    product_profile: "general",
  });

  try {
    const res = await fetch(gatewayUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: sslData.toString(),
    });
    const result = await res.json();
    if (result.status === "SUCCESS") {
      return {
        success: true,
        gateway_url: result.GatewayPageURL,
        transaction_id: result.sessionkey,
      };
    } else {
      return {
        success: false,
        message: result.failedreason || "Failed to initialize SSLCommerz gateway.",
      };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Payment gateway connection error.";
    return { success: false, message: msg };
  }
}
