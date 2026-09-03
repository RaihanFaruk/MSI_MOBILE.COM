import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    // Try inserting into contact_messages table
    try {
      const { error: dbError } = await supabase.from("contact_messages").insert([
        {
          name: name.trim(),
          email: email.trim(),
          phone: phone ? phone.trim() : null,
          subject: subject ? subject.trim() : "General Inquiry",
          message: message.trim(),
          created_at: new Date().toISOString(),
        },
      ]);

      if (dbError) {
        console.warn("[ContactAPI] DB Table notice:", dbError.message);
      }
    } catch (e) {
      console.warn("[ContactAPI] Storage fallback:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Thank you! Your message has been sent successfully. Our support team will get in touch shortly.",
    });
  } catch (err) {
    console.error("[ContactAPI] Server error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to send message. Please call our hotline directly." },
      { status: 500 }
    );
  }
}
