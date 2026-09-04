/**
 * Payment Gateway Integration for MSI MOBILE.COM
 * 
 * Supports:
 * - SSLCommerz (Credit/Debit Cards, bKash, Nagad, Rocket, Upay, Internet Banking)
 * - Sandbox & Live Production Modes
 */

export interface PaymentInitiationPayload {
  order_id: string;
  order_number: string;
  amount: number;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  shipping_address: string;
  district?: string;
  payment_method: string;
}

export interface PaymentGatewayResponse {
  success: boolean;
  gateway_url?: string;
  session_key?: string;
  message?: string;
}

/**
 * Initiate online payment transaction via SSLCommerz
 */
export async function initiateOnlinePayment(
  payload: PaymentInitiationPayload
): Promise<PaymentGatewayResponse> {
  const isLive = process.env.SSLCOMMERZ_IS_LIVE === "true";
  const storeId = process.env.SSLCOMMERZ_STORE_ID || "";
  const storePasswd = process.env.SSLCOMMERZ_STORE_PASSWORD || "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://msi-mobile-com.vercel.app";

  if (!storeId || !storePasswd) {
    return {
      success: false,
      message: "Payment gateway credentials are not configured in environment variables.",
    };
  }

  const gatewayUrl = isLive
    ? "https://securepay.sslcommerz.com/gwprocess/v4/api.php"
    : "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";

  const district = payload.district || "Dhaka";
  const address = payload.shipping_address || "Dhaka, Bangladesh";
  const email = payload.customer_email || "customer@msimobile.com.bd";

  const sslData = new URLSearchParams({
    store_id: storeId,
    store_passwd: storePasswd,
    total_amount: payload.amount.toString(),
    currency: "BDT",
    tran_id: payload.order_number,
    success_url: `${siteUrl}/api/payment/callback?status=success&order_id=${payload.order_id}`,
    fail_url: `${siteUrl}/api/payment/callback?status=fail&order_id=${payload.order_id}`,
    cancel_url: `${siteUrl}/api/payment/callback?status=cancel&order_id=${payload.order_id}`,
    ipn_url: `${siteUrl}/api/payment/callback?status=ipn&order_id=${payload.order_id}`,
    shipping_method: "Courier",
    product_name: `Order ${payload.order_number}`,
    product_category: "Electronics",
    product_profile: "general",
    cus_name: payload.customer_name,
    cus_email: email,
    cus_add1: address,
    cus_city: district,
    cus_postcode: "1000",
    cus_country: "Bangladesh",
    cus_phone: payload.customer_phone,
    ship_name: payload.customer_name,
    ship_add1: address,
    ship_city: district,
    ship_postcode: "1000",
    ship_country: "Bangladesh",
  });

  try {
    const res = await fetch(gatewayUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: sslData.toString(),
    });

    const result = await res.json();

    if (result.status === "SUCCESS" && result.GatewayPageURL) {
      return {
        success: true,
        gateway_url: result.GatewayPageURL,
        session_key: result.sessionkey,
      };
    } else {
      console.error("[SSLCommerz] Initiation failed:", result);
      return {
        success: false,
        message: result.failedreason || "Failed to initialize payment gateway.",
      };
    }
  } catch (err: unknown) {
    console.error("[SSLCommerz] Connection error:", err);
    const msg = err instanceof Error ? err.message : "Payment gateway connection error.";
    return { success: false, message: msg };
  }
}
