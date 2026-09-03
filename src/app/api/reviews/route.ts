import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product_id, rating, comment, user_name, user_id } = body;

    // Validation
    if (!product_id || typeof product_id !== "string") {
      return NextResponse.json(
        { success: false, message: "Invalid or missing product ID." },
        { status: 400 }
      );
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be an integer between 1 and 5 stars." },
        { status: 400 }
      );
    }

    const cleanComment = typeof comment === "string" ? comment.trim() : "";
    if (!cleanComment || cleanComment.length < 5) {
      return NextResponse.json(
        { success: false, message: "Review comment must be at least 5 characters long." },
        { status: 400 }
      );
    }

    if (cleanComment.length > 1000) {
      return NextResponse.json(
        { success: false, message: "Review comment cannot exceed 1,000 characters." },
        { status: 400 }
      );
    }

    // Insert Review
    const { data: newReview, error: insertErr } = await supabase
      .from("reviews")
      .insert([
        {
          product_id,
          user_id: user_id || null,
          user_name: user_name || "Verified Customer",
          rating: numRating,
          comment: cleanComment,
          is_approved: true,
        },
      ])
      .select("*")
      .single();

    if (insertErr) {
      console.error("Review insertion error:", insertErr);
      return NextResponse.json(
        { success: false, message: insertErr.message || "Failed to submit review." },
        { status: 500 }
      );
    }

    // Update product average rating & review count
    try {
      const { data: allReviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("product_id", product_id);

      if (allReviews && allReviews.length > 0) {
        const totalRating = allReviews.reduce((sum, r) => sum + Number(r.rating || 5), 0);
        const avgRating = parseFloat((totalRating / allReviews.length).toFixed(1));

        await supabase
          .from("products")
          .update({
            rating: avgRating,
            reviews_count: allReviews.length,
          })
          .eq("id", product_id);
      }
    } catch (metricErr) {
      console.warn("Product review metrics update note:", metricErr);
    }

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully!",
      review: {
        id: newReview?.id || Date.now(),
        product_id,
        user_name: user_name || "Verified Customer",
        rating: numRating,
        comment: cleanComment,
        created_at: newReview?.created_at || new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    console.error("API reviews handler error:", err);
    return NextResponse.json(
      { success: false, message: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
