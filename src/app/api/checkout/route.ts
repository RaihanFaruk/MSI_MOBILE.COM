import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface CheckoutItemPayload {
  product_id: number;
  variation_id?: number | null;
  quantity: number;
  client_unit_price?: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      user_id,
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      items,
      expected_subtotal,
      payment_method,
      coupon_code,
    } = body;

    // 1. Basic validation
    if (!customer_name || typeof customer_name !== "string" || !customer_name.trim()) {
      return NextResponse.json(
        { success: false, message: "Customer name is required." },
        { status: 400 }
      );
    }

    if (!customer_phone || typeof customer_phone !== "string" || !customer_phone.trim()) {
      return NextResponse.json(
        { success: false, message: "Active phone number is required." },
        { status: 400 }
      );
    }

    if (!shipping_address || !shipping_address.address || !shipping_address.district) {
      return NextResponse.json(
        { success: false, message: "Complete delivery address and district are required." },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Your shopping cart is empty." },
        { status: 400 }
      );
    }

    // 2. Server-side price integrity verification (Anti-tampering)
    // Extract product IDs and variation IDs to fetch authoritative prices (supports UUID and numeric IDs)
    const productIds = Array.from(
      new Set(items.map((it: CheckoutItemPayload) => String(it.product_id).trim()).filter(Boolean))
    );
    const variationIds = Array.from(
      new Set(
        items
          .map((it: CheckoutItemPayload) => (it.variation_id ? String(it.variation_id).trim() : null))
          .filter((vId): vId is string => vId !== null && vId !== "" && vId !== "null" && vId !== "std")
      )
    );

    if (productIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid product IDs in cart." },
        { status: 400 }
      );
    }

    // Query products
    const { data: dbProducts, error: prodErr } = await supabase
      .from("products")
      .select("id, name, price, stock")
      .in("id", productIds);

    if (prodErr || !dbProducts || dbProducts.length === 0) {
      return NextResponse.json(
        { success: false, message: "Could not retrieve authoritative product pricing from database." },
        { status: 400 }
      );
    }

    // Query variations if any
    let dbVariations: { id: string | number; product_id: string | number; price: number | null; stock: number }[] = [];
    if (variationIds.length > 0) {
      const { data: vData } = await supabase
        .from("product_variations")
        .select("id, product_id, price, stock")
        .in("id", variationIds);
      if (vData) {
        dbVariations = vData as { id: string | number; product_id: string | number; price: number | null; stock: number }[];
      }
    }

    // Calculate server authoritative subtotal
    let serverSubtotal = 0;
    for (const item of items as CheckoutItemPayload[]) {
      const pId = String(item.product_id);
      const vId = item.variation_id ? String(item.variation_id) : null;
      const qty = Number(item.quantity) || 1;

      const product = dbProducts.find((p) => String(p.id) === pId);
      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product ID ${pId} not found in database.` },
          { status: 400 }
        );
      }

      let unitPrice = Number(product.price);
      if (vId && vId !== "null" && vId !== "std") {
        const variation = dbVariations.find((v) => String(v.id) === vId && String(v.product_id) === pId);
        if (variation && variation.price !== null && variation.price !== undefined) {
          unitPrice = Number(variation.price);
        }
      }

      serverSubtotal += unitPrice * qty;
    }

    // Anti-tampering check: verify client expected subtotal if submitted
    if (typeof expected_subtotal === "number" && !isNaN(expected_subtotal)) {
      const tolerance = 1.0; // ৳1 rounding tolerance
      if (Math.abs(serverSubtotal - expected_subtotal) > tolerance) {
        return NextResponse.json(
          {
            success: false,
            code: "PRICE_MISMATCH",
            message: `Price mismatch detected: Catalog prices have updated (Current subtotal: ৳${serverSubtotal.toLocaleString()}). Please refresh your cart.`,
          },
          { status: 400 }
        );
      }
    }

    // 3. Call the Atomic Order Creation PostgreSQL RPC function
    // This acquires row locks (SELECT ... FOR UPDATE), verifies live stock,
    // atomically decrements stock, computes verified totals and writes order ledger.
    const { data: rpcResult, error: rpcError } = await supabase.rpc("create_order_atomic", {
      p_user_id: user_id || null,
      p_customer_name: customer_name.trim(),
      p_customer_email: customer_email ? customer_email.trim() : null,
      p_customer_phone: customer_phone.trim(),
      p_shipping_address: shipping_address,
      p_items: items,
      p_payment_method: payment_method || "COD",
      p_coupon_code: coupon_code ? coupon_code.trim().toUpperCase() : null,
    });

    if (rpcError) {
      console.error("Atomic Order Creation RPC Error:", rpcError);
      const errMsg = rpcError.message || "Failed to process order.";

      // Concurrency / Insufficient stock check -> HTTP 409 Conflict
      if (errMsg.includes("ERR_INSUFFICIENT_STOCK") || errMsg.toLowerCase().includes("insufficient stock")) {
        return NextResponse.json(
          {
            success: false,
            code: "INSUFFICIENT_STOCK",
            message: errMsg.replace("ERR_INSUFFICIENT_STOCK: ", "") || "Selected item is out of stock.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: errMsg,
        },
        { status: 400 }
      );
    }

    // If user is logged in and requested address save, update their profile
    if (user_id && shipping_address) {
      try {
        await supabase
          .from("profiles")
          .update({
            phone: customer_phone.trim(),
            address: shipping_address.address,
            district: shipping_address.district,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user_id);
      } catch (e) {
        console.log("Profile address auto-save note:", e);
      }
    }

    return NextResponse.json({
      success: true,
      order_id: rpcResult.order_id,
      order_summary: rpcResult,
      payment_method: payment_method || "COD",
      message: "Order placed successfully!",
    });
  } catch (err: unknown) {
    console.error("Server Checkout Error:", err);
    const msg = err instanceof Error ? err.message : "Internal server checkout error.";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
