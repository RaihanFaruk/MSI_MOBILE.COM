const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.resolve('.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const RESEND_API_KEY = env.RESEND_API_KEY;
const EMAIL_FROM = env.EMAIL_FROM || "MSI MOBILE <onboarding@resend.dev>";

async function testSendEmail() {
  console.log("=== Testing Resend Transactional Email ===");
  console.log("Using From:", EMAIL_FROM);
  console.log("API Key Prefix:", RESEND_API_KEY.slice(0, 10) + "...");

  // Send to delivered@resend.dev (Resend guaranteed test sink) and account test
  const testPayload = {
    from: EMAIL_FROM,
    to: ["delivered@resend.dev"],
    subject: "MSI MOBILE — Order Confirmation Test (MSI-20260903-8821)",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #2563eb;">MSI MOBILE.COM</h2>
        <h3>অর্ডার নিশ্চিতকরণ (Order Confirmed)!</h3>
        <p>প্রিয় কাস্টমার, আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।</p>
        <p><strong>অর্ডার নম্বর:</strong> MSI-20260903-8821</p>
        <p><strong>আইটেম:</strong> Samsung Galaxy S24 Ultra 5G × 1</p>
        <p><strong>সর্বমোট:</strong> ৳145,060</p>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
        <p style="color: #64748b; font-size: 12px;">© 2026 MSI MOBILE.COM Bangladesh</p>
      </div>
    `,
  };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(testPayload),
    });

    const data = await res.json();
    console.log("Resend HTTP Status:", res.status);
    console.log("Resend Response:", data);

    if (res.ok && data.id) {
      console.log("\n✅ Email sent successfully! Message ID:", data.id);
    } else {
      console.error("\n❌ Email failed:", data);
    }
  } catch (err) {
    console.error("Network error sending email:", err);
  }
}

testSendEmail();
