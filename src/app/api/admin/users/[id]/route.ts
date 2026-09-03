import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const targetUserId = params.id;
    if (!targetUserId) {
      return NextResponse.json(
        { success: false, message: "Target user ID is required." },
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
          message:
            "SUPABASE_SERVICE_ROLE_KEY is not configured in .env.local. Please add the service_role key from your Supabase Project Settings -> API.",
        },
        { status: 503 }
      );
    }

    // 2. Initialize Supabase Admin client with service_role secret key
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

    // 4. Verify admin role using service-role client (bypasses RLS blocks on server)
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

    // 5. Safety: Prevent admin from deleting their own currently logged-in account
    if (callerId === targetUserId) {
      return NextResponse.json(
        { success: false, message: "Safety restriction: You cannot delete your own administrator account." },
        { status: 400 }
      );
    }

    // 6. Delete user permanently from Supabase Auth
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);

    if (deleteAuthError) {
      console.error("[AdminUserDelete] Supabase Auth Delete Error:", deleteAuthError);
      return NextResponse.json(
        { success: false, message: deleteAuthError.message || "Failed to delete user from authentication service." },
        { status: 500 }
      );
    }

    // 7. Ensure profile is cleaned up from public.profiles
    await supabaseAdmin.from("profiles").delete().eq("id", targetUserId);

    return NextResponse.json({
      success: true,
      message: "User account and profile deleted successfully.",
    });
  } catch (err: unknown) {
    console.error("[AdminUserDelete] Unexpected Error:", err);
    const msg = err instanceof Error ? err.message : "An unexpected server error occurred.";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
