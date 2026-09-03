/**
 * Transactional Email Service for MSI MOBILE.COM
 * Provider: Brevo (Sendinblue) Transactional API (v3)
 */

export interface OrderEmailData {
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  total_amount: number;
  payment_method: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

/**
 * Generate a responsive branded HTML email template for order confirmations
 */
export function generateOrderConfirmationHtml(data: OrderEmailData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b; font-size: 14px;">
          <strong>${item.name}</strong> × ${item.quantity}
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: bold; text-align: right; font-size: 14px;">
          ৳${(item.price * item.quantity).toLocaleString()}
        </td>
      </tr>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation - MSI MOBILE</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 28px 32px; text-align: center;">
              <span style="background-color: #2563eb; color: #ffffff; font-weight: 900; font-size: 20px; padding: 4px 10px; border-radius: 6px; letter-spacing: 1px;">MSI</span>
              <span style="color: #ffffff; font-weight: 800; font-size: 20px; margin-left: 6px;">MOBILE.COM</span>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">অর্ডার নিশ্চিতকরণ (Order Confirmed)!</h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                প্রিয় <strong>${data.customer_name}</strong>, MSI MOBILE.COM-এ আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে। নিচে আপনার অর্ডারের বিবরণ দেওয়া হলো:
              </p>
              
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
                <p style="margin: 4px 0; color: #64748b; font-size: 13px;">অর্ডার নম্বর: <strong style="color: #0f172a;">${data.order_number}</strong></p>
                <p style="margin: 4px 0; color: #64748b; font-size: 13px;">পেমেন্ট মেথড: <strong style="color: #0f172a;">${data.payment_method}</strong></p>
                <p style="margin: 4px 0; color: #64748b; font-size: 13px;">ডেলিভারি ঠিকানা: <strong style="color: #0f172a;">${data.shipping_address}</strong></p>
              </div>

              <h3 style="color: #0f172a; font-size: 16px; margin-bottom: 12px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">অর্ডারের আইটেমসমূহ</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
                <tr>
                  <td style="padding: 14px 0; color: #0f172a; font-weight: bold; font-size: 16px;">সর্বমোট (Total Amount):</td>
                  <td style="padding: 14px 0; color: #2563eb; font-weight: 900; text-align: right; font-size: 18px;">৳${data.total_amount.toLocaleString()}</td>
                </tr>
              </table>

              <div style="margin-top: 28px; text-align: center;">
                <a href="https://msi-mobile-com.vercel.app/orders/${data.order_number}/track" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; padding: 12px 24px; border-radius: 10px;">
                  লাইভ পার্সেল ট্র্যাক করুন
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
              <p style="margin: 0;">সাহায্যের জন্য কল করুন: <strong>+880 1999-MSIMOB</strong> | moyazzembintelamiya@gmail.com</p>
              <p style="margin: 6px 0 0 0;">© ${new Date().getFullYear()} MSI MOBILE.COM Bangladesh.</p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

/**
 * Sends order confirmation email via Brevo (Sendinblue) Transactional API
 */
export async function sendOrderConfirmationEmail(
  data: OrderEmailData
): Promise<{ success: boolean; message: string }> {
  // 1. Recipient validation guard
  if (!data.customer_email || !data.customer_email.includes("@")) {
    console.error(
      `[BrevoEmailService] Invalid or missing customer email for Order ${data.order_number}: "${data.customer_email}"`
    );
    return {
      success: false,
      message: "Customer email is missing or invalid.",
    };
  }

  const brevoApiKey = process.env.BREVO_API_KEY;

  if (!brevoApiKey) {
    console.log(
      `[BrevoEmailService] BREVO_API_KEY not configured. Simulated confirmation email for Order ${data.order_number} to ${data.customer_email}.`
    );
    return {
      success: true,
      message: "Simulated email dispatch (Pending BREVO_API_KEY).",
    };
  }

  // 2. Parse sender details from EMAIL_FROM (e.g. "MSI MOBILE <moyazzembintelamiya@gmail.com>")
  const fromEnv = process.env.EMAIL_FROM || "MSI MOBILE <moyazzembintelamiya@gmail.com>";
  const fromMatch = fromEnv.match(/(.*)<(.*)>/);
  const senderName = fromMatch ? fromMatch[1].trim() : "MSI MOBILE";
  const senderEmail = fromMatch ? fromMatch[2].trim() : "moyazzembintelamiya@gmail.com";
  const recipientEmail = data.customer_email.trim();

  // 3. Dispatch via Brevo SMTP API v3
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": brevoApiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email: recipientEmail,
            name: data.customer_name || "Customer",
          },
        ],
        subject: `Order Confirmed: ${data.order_number} — MSI MOBILE.COM`,
        htmlContent: generateOrderConfirmationHtml(data),
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      console.error(
        `[BrevoEmailService] Brevo delivery rejected for Order ${data.order_number} to ${recipientEmail}. ` +
          `Status: ${res.status}. Reason: ${result.message || JSON.stringify(result)}`
      );
      return {
        success: false,
        message: result.message || "Failed to send email via Brevo.",
      };
    }

    console.log(
      `[BrevoEmailService] Order confirmation email successfully dispatched to ${recipientEmail} (Message ID: ${result.messageId}).`
    );
    return { success: true, message: "Confirmation email sent successfully via Brevo!" };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to connect to Brevo email service.";
    console.error(`[BrevoEmailService] Unexpected error sending email via Brevo:`, err);
    return { success: false, message: msg };
  }
}
