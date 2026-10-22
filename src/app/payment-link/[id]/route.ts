import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import { getOrderSearchQuery } from "@/lib/orderUtils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const cleanParam = decodeURIComponent(id).trim();
    const withoutPlink = cleanParam.replace(/^plink_/i, "");

    // Lookup order by id, legacyId, pay_link_id, or razorpayOrderId
    const searchQuery = {
      $or: [
        ...(getOrderSearchQuery(cleanParam).$or || [getOrderSearchQuery(cleanParam)]),
        { pay_link_id: cleanParam },
        { pay_link_id: `plink_${withoutPlink}` },
        { pay_link_id: `order_${withoutPlink}` },
        { razorpayOrderId: cleanParam },
        { razorpayOrderId: `order_${withoutPlink}` },
        { razorpayPaymentId: cleanParam },
      ],
    };

    const order: any = await Order.findOne(searchQuery).lean();
    if (!order) {
      return new Response("Payment Link Not Found", { status: 404 });
    }

    // If order has a real rzp.io short URL on razorpay.com, redirect directly to it
    if (order.pay_link_url && order.pay_link_url.includes("rzp.io")) {
      return Response.redirect(order.pay_link_url, 302);
    }

    // Enrich with Payment collection if available
    const numericId =
      order.legacyId || parseInt(String(order.id || "").replace(/\D/g, ""), 10) || null;
    const paymentRecord: any = numericId
      ? await Payment.findOne({ orderId: numericId }).lean()
      : null;

    if (paymentRecord?.shortUrl && paymentRecord.shortUrl.includes("rzp.io")) {
      return Response.redirect(paymentRecord.shortUrl, 302);
    }

    const rawLinkId = String(
      order.pay_link_id || order.razorpayOrderId || paymentRecord?.payLinkId || order.id
    ).replace(/^(plink_|order_)/i, "");
    const rawOrderId = String(order.razorpayOrderId || rawLinkId).replace(/^order_/i, "");
    const rawPayId = String(
      order.razorpayPaymentId ||
        (order.payment_key?.startsWith("pay_") ? order.payment_key : "") ||
        rawLinkId
    ).replace(/^pay_/i, "");

    const amountPaise = Math.round(Number(order.totalAmount || 0) * 100);
    const isPaid = order.paymentStatus === "Paid" || paymentRecord?.status === "paid";
    const orderNumber =
      order.legacyId || String(order.id || "").replace(/\D/g, "") || order.id;
    const uuid = order.uuid || "5c44a68e-71ba-46fd-af67-0a534289f7ae";
    const descriptionStr = `${uuid}-${orderNumber}`;
    const createdUnix = order.createdAt
      ? Math.floor(new Date(order.createdAt).getTime() / 1000)
      : Math.floor(Date.now() / 1000);

    const rzpData = {
      is_test_mode: false,
      merchant: {
        billing_label: "RN FAUCETS PRIVATE LIMITED",
        brand_color: "#9D1D27",
        country_code: "IN",
        logo_url: "",
        logo_large_size_url: "",
        name: "RN FAUCETS PRIVATE LIMITED",
        support_email: "enquiry@rnvalves.com",
        support_mobile: "",
        policy_url: "",
      },
      merchant_id: "PAsT4rLhTlvpWS",
      payment_link: {
        id: rawLinkId,
        order_id: rawOrderId,
        amount: amountPaise,
        amount_paid: isPaid ? amountPaise : 0,
        first_min_partial_amount: 0,
        currency: "INR",
        status: isPaid ? "paid" : "created",
        description: descriptionStr,
        reference_id: uuid,
        accept_partial: false,
        mode: "live",
        expire_by: 0,
        long_url: `https://razorpay.com/payment-link/plink_${rawLinkId}`,
        payment_plan: false,
        allow_full_payment: false,
        customer: {
          name: "",
          contact: "",
          email: "",
        },
        payments: isPaid
          ? [
              {
                payment_id: rawPayId,
                amount: amountPaise,
                id: rawPayId,
                created_at: createdUnix,
                updated_at: createdUnix,
              },
            ]
          : [],
      },
      options: {
        checkout: {
          name: "",
          description: "",
          first_payment_min_amount: "Minimum Amount Due",
          prefill: {
            select_partial: "0",
            select_full: "0",
            card: [],
          },
          method: {
            card: "1",
            netbanking: "1",
            wallet: "1",
            upi: "1",
            emi: "1",
            upi_intent: "0",
            qr: "1",
          },
          features: {
            cardsaving: "1",
          },
          readonly: {
            contact: "0",
            email: "0",
            name: "0",
          },
          hidden: {
            contact: "0",
            email: "0",
          },
          theme: {
            hide_topbar: "0",
            image_padding: "1",
            image_frame: "1",
            close_button: "0",
            close_method_back: "0",
            debit_card: "0",
          },
          modal: {
            confirm_close: "0",
            escape: "1",
            animation: "1",
            backdropclose: "0",
            handleback: "1",
            select_partial: "0",
          },
          partial_payment: {
            min_amount_label: "Minimum first amount",
            partial_amount_label: "Make payment in parts",
            partial_amount_description: "Pay some now and the remaining later",
            full_amount_label: "Pay in full",
          },
          config: [],
        },
        order: {
          bank_account: [],
        },
        hosted_page: {
          footer: {
            razorpay_branding: "1",
            security_branding: "1",
          },
          label: {
            receipt: "RECEIPT",
            description: "PAYMENT FOR",
            amount_payable: "AMOUNT PAYABLE",
            amount_paid: "AMOUNT PAID",
            partial_amount_due: "DUE",
            partial_amount_paid: "PAID",
            expire_by: "EXPIRE BY",
            expired_on: "EXPIRED ON",
          },
          show_preferences: {
            issued_to: "1",
            show_customer_name: "0",
            is_redirect_true: "",
          },
          enable_embedded_checkout: "0",
          show_expire_countdown: false,
          title: "",
        },
      },
      currency_symbol: "INR",
      callback_url: "",
      callback_method: "",
      org: {
        branding: {
          show_rzp_logo: false,
          branding_logo:
            "https://rzp-1415-prod-dashboard-activation.s3.ap-south-1.amazonaws.com/org_MEqtvsdqB84o2N/payment_apps_logo/phpcbCmaK",
          security_branding_logo:
            "https://cdn.razorpay.com/static/assets/pay_methods_branding.png",
          product_domain_name: "razorpay.com/payment-links",
          product_domain_link: "https://razorpay.com/payment-links",
        },
      },
      report_link_url: `https://razorpay.com/support/payments/report-merchant/?e=${encodeURIComponent(
        Buffer.from(`plink_${rawLinkId}`).toString("base64")
      )}&s=aG9zdGVk`,
      show_terms_and_condition: false,
      is_sign_present_in_payment_description: false,
      pl_initiated_from: "",
      custom_fields: null,
      hide_and_pass_dummy_email_in_checkout: false,
      checkout_frame_url_enabled: false,
      checkout_frame_url: "",
    };

    const html = `<!DOCTYPE html>
<html>
    <head>
        <title>
            RN FAUCETS PRIVATE LIMITED - Payment Link - ${rawLinkId}
        </title>

        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta charset="utf-8">
        <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
        <meta name="viewport" content="user-scalable=no,width=device-width,initial-scale=1,maximum-scale=1">

        <meta name="description" content="Payment of INR ${Number(order.totalAmount || 0).toFixed(2)} requested by RN FAUCETS PRIVATE LIMITED for ${descriptionStr}">
        <meta name="robots" content="noindex" />

        <link href="https://fonts.googleapis.com/css?family=Lato:300,400,600" rel="stylesheet" type="text/css" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet" type="text/css" />
        <style>
          @font-face {
            font-family: 'Tasa';
            font-display: swap;
            src: url('https://cdn.razorpay.com/static/assets/common/checkout/tasa-orbiter.woff2') format('woff2');
            font-weight: 600;
            font-style: normal;
          }
        </style>
        <link rel="icon" href="https://razorpay.com/favicon.png" type="image/x-icon" />

        <link href="https://cdn.razorpay.com/static/payment-links/bundle.css" rel="stylesheet" type="text/css" />

        <script>
            window.Razorpay = {
                config: {
                    region: "IN",
                    order_id: "order_${rawOrderId}",
                }
            };
        </script>

        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <script src="https://cdn.razorpay.com/static/assets/color.js" async></script>

        <script>
            function renderApp() {
                if(window.RZP && window.RZP.hasOwnProperty("renderApp")) {
                     var data = ${JSON.stringify(rzpData)};
                     var requestParams = {};
                     data.requestParams = requestParams;
                     window.RZP.renderApp('app-container', data);
                }
            }
        </script>

        <script src="https://cdn.razorpay.com/static/payment-links/bundle.js" onload="renderApp()" defer></script>
    </head>

    <body>
        <div id="app-container"></div>
    </body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("GET /payment-link/[id] error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
