import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderIds, status, payment_status } = body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "orderIds must be a non-empty array." },
        { status: 400 }
      );
    }

    if (!status && !payment_status) {
      return NextResponse.json(
        { success: false, message: "Either status or payment_status must be provided." },
        { status: 400 }
      );
    }

    // 1. Check for SUPABASE_SERVICE_ROLE_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json(
        {
          success: false,
          code: "MISSING_SERVICE_ROLE_KEY",
          message: "SUPABASE_SERVICE_ROLE_KEY is not configured in environment.",
        },
        { status: 503 }
      );
    }

    // 2. Initialize Supabase Admin client
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 3. Extract and verify requester's Bearer JWT session token
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Missing authentication token." },
        { status: 401 }
      );
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid or expired administrator session." },
        { status: 401 }
      );
    }

    const callerId = userData.user.id;

    // 4. Verify admin role in profiles table
    const { data: callerProfile, error: profError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", callerId)
      .single();

    if (profError || callerProfile?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Administrator permissions required." },
        { status: 403 }
      );
    }

    // The database function locks and updates every selected order in one transaction.
    const { data: updatedCount, error: updateError } = await supabaseAdmin.rpc(
      "admin_bulk_update_orders",
      {
        p_order_ids: orderIds,
        p_status: status || null,
        p_payment_status: payment_status || null,
      }
    );

    if (updateError) {
      console.error("[AdminBulkOrderUpdate] Atomic update error:", updateError);
      return NextResponse.json(
        { success: false, message: updateError.message || "Bulk update failed." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: Number(updatedCount || 0),
      message: `Successfully updated ${Number(updatedCount || 0)} order(s).`,
    });
  } catch (err: unknown) {
    console.error("[AdminBulkOrderUpdate] Unexpected error:", err);
    const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
