import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(request: Request) {
  return handlePaymentCallback(request);
}

export async function GET(request: Request) {
  return handlePaymentCallback(request);
}

async function handlePaymentCallback(request: Request) {
  const url = new URL(request.url);
  const searchStatus = url.searchParams.get("status");
  const queryOrderId = url.searchParams.get("order_id");

  const postData: Record<string, string> = {};
  if (request.headers.get("content-type")?.includes("application/x-www-form-urlencoded")) {
    try {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        postData[key] = value.toString();
      });
    } catch {
      // Ignore formData parsing error
    }
  }

  const status = postData.status || searchStatus || "UNKNOWN";
  const tran_id = postData.tran_id || url.searchParams.get("tran_id") || "";
  const orderId = queryOrderId || postData.value_a || "";
  const bankTranId = postData.bank_tran_id || postData.val_id || "";
  const cardType = postData.card_type || postData.card_brand || "Online Payment";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || url.origin;

  // 1. Success Condition (SSLCommerz returns VALID or VALIDATED)
  if (status === "VALID" || status === "VALIDATED" || status === "success") {
    try {
      // Fetch order by id or tran_id
      let query = supabase.from("orders").select("*");
      if (orderId) {
        query = query.eq("id", orderId);
      } else if (tran_id) {
        query = query.eq("order_number", tran_id);
      }

      const { data: orderData, error: fetchErr } = await query.single();

      if (!fetchErr && orderData) {
        // Update order payment status
        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            status: "confirmed",
            payment_method: cardType || "SSLCommerz",
          })
          .eq("id", orderData.id);

        // Send order confirmation email asynchronously
        if (orderData.customer_email) {
          sendOrderConfirmationEmail({
            order_number: orderData.order_number,
            customer_name: orderData.customer_name,
            customer_email: orderData.customer_email,
            customer_phone: orderData.customer_phone,
            shipping_address:
              typeof orderData.shipping_address === "object"
                ? `${orderData.shipping_address.address}, ${orderData.shipping_address.district}`
                : String(orderData.shipping_address),
            total_amount: orderData.total_amount,
            payment_method: `${cardType} (Tx: ${bankTranId || "Verified"})`,
            items: (orderData.items || []).map((it: { name?: string; product_name?: string; quantity?: number; price?: number; unit_price?: number }) => ({
              name: it.name || it.product_name || "Device Item",
              quantity: it.quantity || 1,
              price: it.price ?? it.unit_price ?? 0,
            })),
          }).catch((e) => console.error("[EmailCallback] Send note:", e));
        }

        return NextResponse.redirect(
          `${siteUrl}/checkout/success?orderId=${orderData.id}&tran_id=${tran_id}&paid=true`,
          { status: 303 }
        );
      }
    } catch (err) {
      console.error("[PaymentCallback] Processing error:", err);
    }

    return NextResponse.redirect(`${siteUrl}/checkout/success?tran_id=${tran_id}&paid=true`, {
      status: 303,
    });
  }

  // 2. Cancellation or Failure
  return NextResponse.redirect(
    `${siteUrl}/checkout?error=payment_${status.toLowerCase()}&orderId=${orderId}`,
    { status: 303 }
  );
}
