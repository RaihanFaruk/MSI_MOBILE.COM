import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, payment_status, tracking_note } = body;

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

    // 5. Fetch existing order to check current tracking_updates
    const { data: existingOrder, error: fetchOrderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchOrderError || !existingOrder) {
      return NextResponse.json(
        { success: false, message: `Order #${orderId} not found.` },
        { status: 404 }
      );
    }

    // 6. Prepare update payload
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updatePayload.status = status;
    }

    if (payment_status) {
      updatePayload.payment_status = payment_status;
    }

    // If status changed or note provided, append to tracking_updates
    if (status || tracking_note) {
      const currentUpdates = Array.isArray(existingOrder.tracking_updates)
        ? existingOrder.tracking_updates
        : [];

      const newEntry = {
        status: status || existingOrder.status,
        message: tracking_note || `Order status updated to ${status || existingOrder.status}`,
        timestamp: new Date().toISOString(),
        updated_by: "Administrator",
      };

      updatePayload.tracking_updates = [...currentUpdates, newEntry];
    }

    // 7. Perform update securely
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from("orders")
      .update(updatePayload)
      .eq("id", orderId)
      .select()
      .single();

    if (updateError) {
      console.error("[AdminOrderUpdate] Database error:", updateError);
      return NextResponse.json(
        { success: false, message: updateError.message || "Failed to update order." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Order #${orderId} successfully updated.`,
      order: updatedOrder,
    });
  } catch (err: unknown) {
    console.error("[AdminOrderUpdate] Unexpected error:", err);
    const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
