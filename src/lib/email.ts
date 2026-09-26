import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = parseInt(process.env.SMTP_PORT || "587");
const smtpUser = process.env.SMTP_USER || "do-not-reply@rnvalves.com";
const smtpPass = process.env.SMTP_PASS || "dzcz rtbq blxl iqly";
const smtpFrom = process.env.SMTP_FROM || "RN Valves & Faucets <do-not-reply@rnvalves.com>";
const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "ecommerce@rnvalves.com";

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export async function sendOrderInvoiceEmail(order: any) {
  try {
    const customerEmail =
      order.customerEmail || order.shippingAddress?.email || "";
    const customerName =
      order.customerName ||
      `${order.shippingAddress?.firstName || ""} ${order.shippingAddress?.lastName || ""}`.trim() ||
      "Valued Customer";

    const items = order.items || [];
    const subtotal = items.reduce(
      (acc: number, item: any) =>
        acc + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );
    const discountAmount = Number(order.discountAmount) || 0;
    const shippingAmount = Number(order.shippingAmount) || 0;
    const totalAmount = Number(order.totalAmount) || subtotal - discountAmount + shippingAmount;

    const itemsHtml = items
      .map(
        (item: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; text-align: left; font-size: 13px; color: #1F2937;">
            <strong>${item.name}</strong>
            ${item.code ? `<div style="font-size: 11px; color: #6B7280;">Code: ${item.code}</div>` : ""}
            ${item.color ? `<div style="font-size: 11px; color: #6B7280;">Finish: ${item.color}</div>` : ""}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; text-align: right; font-size: 13px; color: #1F2937;">
            ₹${Number(item.price).toLocaleString("en-IN")}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; text-align: center; font-size: 13px; color: #1F2937;">
            ${item.quantity}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; text-align: right; font-size: 13px; font-weight: 700; color: #1F2937;">
            ₹${(Number(item.price) * Number(item.quantity)).toLocaleString("en-IN")}
          </td>
        </tr>
      `
      )
      .join("");

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>RN Valves - Order Confirmation #${order.id}</title>
</head>
<body style="font-family: Arial, Helvetica, sans-serif; background-color: #F3F4F6; margin: 0; padding: 20px; color: #1F2937;">
  <div style="max-width: 650px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <!-- Header -->
    <div style="background: #0077B6; padding: 24px; text-align: center; color: #FFFFFF;">
      <h1 style="margin: 0; font-size: 22px; letter-spacing: 1px; font-weight: 800;">RN VALVES & FAUCETS</h1>
      <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Order Invoice & Confirmation • #${order.id}</p>
    </div>

    <!-- Body -->
    <div style="padding: 24px;">
      <p style="font-size: 15px; margin-top: 0;">Dear <strong>${customerName}</strong>,</p>
      <p style="font-size: 13.5px; color: #4B5563; line-height: 1.5;">
        Thank you for choosing RN Valves & Faucets. Your order <strong>#${order.id}</strong> has been successfully received and recorded in our system.
      </p>

      <!-- Order Summary Card -->
      <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #0077B6; text-transform: uppercase;">Order Summary</h3>
        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; color: #6B7280;">Order ID:</td>
            <td style="padding: 4px 0; font-weight: 700; text-align: right;">#${order.id}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #6B7280;">Order Date:</td>
            <td style="padding: 4px 0; text-align: right;">${order.orderDate || new Date().toLocaleDateString("en-IN")}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #6B7280;">Payment Method:</td>
            <td style="padding: 4px 0; font-weight: 700; text-align: right; color: ${order.paymentStatus === "Paid" ? "#10B981" : "#D97706"};">
              ${order.paymentMethod} (${order.paymentStatus === "Paid" ? "PAID" : "PENDING"})
            </td>
          </tr>
          ${
            order.razorpayPaymentId
              ? `
          <tr>
            <td style="padding: 4px 0; color: #6B7280;">Transaction ID:</td>
            <td style="padding: 4px 0; text-align: right; font-family: monospace;">${order.razorpayPaymentId}</td>
          </tr>
          `
              : ""
          }
        </table>
      </div>

      <!-- Shipping Address -->
      <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #0077B6; text-transform: uppercase;">Shipping Destination</h3>
        <p style="margin: 0; font-size: 13px; color: #374151; line-height: 1.5;">
          <strong>${order.shippingAddress?.firstName || customerName} ${order.shippingAddress?.lastName || ""}</strong><br/>
          ${order.shippingAddress?.address || ""}<br/>
          ${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""} - ${order.shippingAddress?.pinCode || ""}<br/>
          Phone: ${order.shippingAddress?.phone || order.customerPhone || "N/A"}
        </p>
      </div>

      <!-- Items Table -->
      <h3 style="margin: 20px 0 10px 0; font-size: 14px; color: #111827;">Ordered Items</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background: #F3F4F6;">
            <th style="padding: 8px 10px; text-align: left; font-size: 12px; color: #4B5563;">Item</th>
            <th style="padding: 8px 10px; text-align: right; font-size: 12px; color: #4B5563;">Price</th>
            <th style="padding: 8px 10px; text-align: center; font-size: 12px; color: #4B5563;">Qty</th>
            <th style="padding: 8px 10px; text-align: right; font-size: 12px; color: #4B5563;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Order Totals -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
        <tr>
          <td style="padding: 6px 0; color: #6B7280;">Subtotal:</td>
          <td style="padding: 6px 0; text-align: right; font-weight: 600;">₹${subtotal.toLocaleString("en-IN")}</td>
        </tr>
        ${
          discountAmount > 0
            ? `
        <tr>
          <td style="padding: 6px 0; color: #10B981;">Discount:</td>
          <td style="padding: 6px 0; text-align: right; color: #10B981; font-weight: 600;">-₹${discountAmount.toLocaleString("en-IN")}</td>
        </tr>
        `
            : ""
        }
        <tr>
          <td style="padding: 6px 0; color: #6B7280;">Shipping & Packaging:</td>
          <td style="padding: 6px 0; text-align: right; font-weight: 600;">${shippingAmount > 0 ? `₹${shippingAmount.toLocaleString("en-IN")}` : "FREE"}</td>
        </tr>
        <tr style="border-top: 2px solid #E5E7EB;">
          <td style="padding: 10px 0; font-size: 16px; font-weight: 800; color: #111827;">Total Paid / Amount Due:</td>
          <td style="padding: 10px 0; text-align: right; font-size: 18px; font-weight: 800; color: #0077B6;">₹${totalAmount.toLocaleString("en-IN")}</td>
        </tr>
      </table>

      <div style="border-top: 1px solid #E5E7EB; padding-top: 16px; font-size: 12px; color: #6B7280; line-height: 1.5;">
        <p style="margin: 0;">If you have any questions or queries regarding this order, please contact our support team at <a href="mailto:ecommerce@rnvalves.com" style="color: #0077B6;">ecommerce@rnvalves.com</a> or call <strong>+91 99990 00000</strong>.</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #F9FAFB; padding: 16px 24px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #E5E7EB;">
      &copy; ${new Date().getFullYear()} RN Valves & Faucets. All rights reserved. • B-7/1, Site-II, Loni Road Industrial Area, Mohan Nagar, Ghaziabad, UP 201007
    </div>
  </div>
</body>
</html>
    `;

    const mailOptions = {
      from: smtpFrom,
      to: customerEmail && customerEmail.includes("@") ? customerEmail : adminEmail,
      cc: customerEmail && customerEmail.includes("@") ? adminEmail : undefined,
      subject: `RN Valves Order Confirmation - #${order.id}`,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Order confirmation email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Error sending order invoice email:", error);
    return { success: false, error: error.message };
  }
}

export async function sendOrderStatusEmail(order: any, newStatus: string) {
  try {
    const customerEmail =
      order.customerEmail || order.shippingAddress?.email || "";
    const customerName =
      order.customerName ||
      `${order.shippingAddress?.firstName || ""} ${order.shippingAddress?.lastName || ""}`.trim() ||
      "Valued Customer";

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>RN Valves - Order Status Updated #${order.id}</title>
</head>
<body style="font-family: Arial, Helvetica, sans-serif; background-color: #F3F4F6; margin: 0; padding: 20px; color: #1F2937;">
  <div style="max-width: 650px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <!-- Header -->
    <div style="background: #0077B6; padding: 24px; text-align: center; color: #FFFFFF;">
      <h1 style="margin: 0; font-size: 22px; letter-spacing: 1px; font-weight: 800;">RN VALVES & FAUCETS</h1>
      <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Order Update Notification • #${order.id}</p>
    </div>

    <!-- Body -->
    <div style="padding: 24px;">
      <p style="font-size: 15px; margin-top: 0;">Dear <strong>${customerName}</strong>,</p>
      <p style="font-size: 13.5px; color: #4B5563; line-height: 1.5;">
        Your order <strong>#${order.id}</strong> status has been updated to:
      </p>

      <div style="text-align: center; margin: 24px 0;">
        <span style="display: inline-block; padding: 10px 24px; background: #0077B6; color: #FFFFFF; font-weight: 800; font-size: 16px; border-radius: 50px; letter-spacing: 1px; text-transform: uppercase;">
          ${newStatus}
        </span>
      </div>

      ${
        order.courierPartner || order.trackingNumber
          ? `
      <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #0077B6; text-transform: uppercase;">Dispatch & Courier Tracking</h3>
        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
          ${order.courierPartner ? `<tr><td style="padding: 4px 0; color: #6B7280;">Transport Partner:</td><td style="padding: 4px 0; font-weight: 700; text-align: right;">${order.courierPartner}</td></tr>` : ""}
          ${order.trackingNumber ? `<tr><td style="padding: 4px 0; color: #6B7280;">Tracking / LR Number:</td><td style="padding: 4px 0; font-weight: 700; text-align: right; font-family: monospace;">${order.trackingNumber}</td></tr>` : ""}
          ${order.dispatchDate ? `<tr><td style="padding: 4px 0; color: #6B7280;">Dispatch Date:</td><td style="padding: 4px 0; text-align: right;">${order.dispatchDate}</td></tr>` : ""}
        </table>
      </div>
      `
          : ""
      }

      <div style="border-top: 1px solid #E5E7EB; padding-top: 16px; font-size: 12px; color: #6B7280; line-height: 1.5;">
        <p style="margin: 0;">For any questions or updates regarding your shipment, please write to <a href="mailto:ecommerce@rnvalves.com" style="color: #0077B6;">ecommerce@rnvalves.com</a>.</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #F9FAFB; padding: 16px 24px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #E5E7EB;">
      &copy; ${new Date().getFullYear()} RN Valves & Faucets. All rights reserved.
    </div>
  </div>
</body>
</html>
    `;

    const mailOptions = {
      from: smtpFrom,
      to: customerEmail && customerEmail.includes("@") ? customerEmail : adminEmail,
      cc: customerEmail && customerEmail.includes("@") ? adminEmail : undefined,
      subject: `RN Valves Order #${order.id} is now ${newStatus}`,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Order status update email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Error sending order status email:", error);
    return { success: false, error: error.message };
  }
}
