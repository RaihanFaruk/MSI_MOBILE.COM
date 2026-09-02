import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { code, subtotal } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ valid: false, message: "Coupon code is required." }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Query active coupon from Supabase
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", cleanCode)
      .eq("is_active", true)
      .single();

    if (error || !coupon) {
      return NextResponse.json({ valid: false, message: "Invalid or expired coupon code." }, { status: 404 });
    }

    // Check expiration
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, message: "This coupon code has expired." }, { status: 400 });
    }

    // Check minimum order amount
    const orderSubtotal = Number(subtotal) || 0;
    if (orderSubtotal < Number(coupon.min_order_amount)) {
      return NextResponse.json(
        {
          valid: false,
          message: `Minimum order amount of ৳${coupon.min_order_amount} required to use this coupon.`,
        },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === "percentage") {
      discountAmount = (orderSubtotal * Number(coupon.discount_value)) / 100;
      if (coupon.max_discount_amount) {
        discountAmount = Math.min(discountAmount, Number(coupon.max_discount_amount));
      }
    } else {
      discountAmount = Math.min(orderSubtotal, Number(coupon.discount_value));
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: Number(coupon.discount_value),
      discount_amount: Math.round(discountAmount),
      message: `Coupon "${coupon.code}" applied successfully!`,
    });
  } catch (err: unknown) {
    console.error("Coupon validation error:", err);
    return NextResponse.json({ valid: false, message: "Server error validating coupon." }, { status: 500 });
  }
}
