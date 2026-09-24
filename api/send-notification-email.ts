// Vercel Serverless Function (Node.js runtime) — NOT part of the client bundle.
// Only this file, running server-side, ever sees RESEND_API_KEY or
// SUPABASE_SERVICE_ROLE_KEY. Neither is ever imported by src/, and neither
// uses a VITE_ prefix, so Vite cannot accidentally bundle them into the
// browser build even by mistake.
//
// This endpoint is called ONLY by a Postgres trigger (via pg_net) whenever a
// row is inserted into notification_events with channel='email'. It is not,
// and must never become, a general "send an email" API:
//   - The caller must present the exact shared secret stored in Supabase
//     Vault (x-webhook-secret header) or the request is rejected outright.
//   - The recipient email address is looked up server-side from the orders
//     table using the trusted order_id — it is never taken from the request
//     body. A caller cannot make this endpoint email an arbitrary address.
//   - The notification_events row is atomically claimed (status transitions
//     not_configured -> processing in one conditional UPDATE) before sending,
//     so retried/duplicate webhook deliveries cannot send the same email twice.

const RESEND_API_URL = "https://api.resend.com/emails"

function supabaseAdminRequest(path, init) {
  const url = `${process.env.VITE_SUPABASE_URL}${path}`
  return fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: init?.headers?.Prefer || "return=representation",
      ...(init?.headers || {}),
    },
  })
}

const EVENT_COPY = {
  ORDER_PLACED: { subject: (n) => `Order ${n} placed`, headline: "Thanks for your order!", body: "We've received your order and will confirm it shortly." },
  ORDER_CONFIRMED: { subject: (n) => `Order ${n} confirmed`, headline: "Your order is confirmed", body: "We're getting your order ready." },
  ORDER_PROCESSING: { subject: (n) => `Order ${n} is being processed`, headline: "Your order is being processed", body: "We're preparing your items." },
  ORDER_PACKED: { subject: (n) => `Order ${n} has been packed`, headline: "Your order is packed", body: "Your order is packed and ready for pickup by the courier." },
  ORDER_SHIPPED: { subject: (n) => `Order ${n} has shipped`, headline: "Your order is on its way", body: "Your order has been handed to the courier." },
  ORDER_OUT_FOR_DELIVERY: { subject: (n) => `Order ${n} is out for delivery`, headline: "Out for delivery", body: "Your order will arrive soon." },
  ORDER_DELIVERED: { subject: (n) => `Order ${n} delivered`, headline: "Delivered!", body: "Your order has been delivered. Thanks for shopping with us." },
  ORDER_CANCELLED: { subject: (n) => `Order ${n} cancelled`, headline: "Order cancelled", body: "Your order has been cancelled." },
  PAYMENT_SUCCESS: { subject: (n) => `Payment received for order ${n}`, headline: "Payment received", body: "We've confirmed payment for your order." },
  PAYMENT_FAILED: { subject: (n) => `Payment issue with order ${n}`, headline: "Payment not completed", body: "We couldn't confirm payment for this order. Please contact us if you believe this is a mistake." },
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]))
}

function renderEmailHtml({ businessName, headline, body, order, supportEmail, supportPhone, trackingUrl }) {
  // All order-derived values are escaped before interpolation — order.customer_name,
  // notes, etc. are user-supplied at checkout and must not be trusted as raw HTML.
  const itemsHtml = (order.items || [])
    .map((i) => `<tr><td style="padding:6px 0;">${escapeHtml(i.name)} × ${escapeHtml(i.quantity)}</td><td style="text-align:right;">Rs. ${Number(i.price * i.quantity).toLocaleString()}</td></tr>`)
    .join("")
  return `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#0F172A;">
    <h2 style="color:#2B8EF0;">${escapeHtml(businessName)}</h2>
    <h3>${escapeHtml(headline)}</h3>
    <p>${escapeHtml(body)}</p>
    <p style="font-size:13px;color:#64748B;">Order <strong>${escapeHtml(order.order_number)}</strong> · Status: <strong>${escapeHtml(order.status)}</strong></p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">${itemsHtml}</table>
    <p style="font-weight:bold;">Total: Rs. ${Number(order.total).toLocaleString()}</p>
    ${trackingUrl ? `<p><a href="${trackingUrl}" style="color:#2B8EF0;">Track your order</a></p>` : ""}
    <hr style="border:none;border-top:1px solid #E2E8F0;margin:24px 0;" />
    <p style="font-size:12px;color:#94A3B8;">
      Need help? Contact us${supportEmail ? ` at ${escapeHtml(supportEmail)}` : ""}${supportPhone ? ` or ${escapeHtml(supportPhone)}` : ""}.
    </p>
  </div>`
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false })
    return
  }

  // 1. Verify this call genuinely came from our own database trigger.
  const providedSecret = req.headers["x-webhook-secret"]
  if (!process.env.NOTIFICATION_WEBHOOK_SECRET || providedSecret !== process.env.NOTIFICATION_WEBHOOK_SECRET) {
    // Deliberately generic — never confirm/deny which part of the check failed.
    res.status(401).json({ ok: false })
    return
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.RESEND_API_KEY) {
    // Not fully configured yet — fail closed, don't leak which var is missing.
    res.status(503).json({ ok: false })
    return
  }

  const { notification_id, order_id } = req.body || {}
  if (!notification_id || !order_id) {
    res.status(400).json({ ok: false })
    return
  }

  try {
    // 2. Atomically claim this notification row so a retried/duplicate webhook
    //    delivery can never result in the same email being sent twice.
    const claimRes = await supabaseAdminRequest(
      `/rest/v1/notification_events?id=eq.${notification_id}&status=eq.not_configured`,
      { method: "PATCH", body: JSON.stringify({ status: "processing" }) }
    )
    const claimed = await claimRes.json()
    if (!Array.isArray(claimed) || claimed.length === 0) {
      // Already claimed/sent by a previous delivery of this same webhook, or the
      // event_type/channel changed underneath us. Nothing to do — not an error.
      res.status(200).json({ ok: true, skipped: "already_processed" })
      return
    }
    const notification = claimed[0]

    // 3. Look up the order + its email server-side. The recipient is NEVER
    //    taken from the request body — only from this trusted lookup.
    const orderRes = await supabaseAdminRequest(`/rest/v1/orders?id=eq.${order_id}&select=*,order_items(*)`, { method: "GET" })
    const orders = await orderRes.json()
    const order = Array.isArray(orders) ? orders[0] : null

    if (!order || !order.email) {
      await supabaseAdminRequest(`/rest/v1/notification_events?id=eq.${notification_id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "skipped", error: "No email address on this order" }),
      })
      res.status(200).json({ ok: true, skipped: "no_email" })
      return
    }

    const settingsRes = await supabaseAdminRequest(`/rest/v1/site_settings?id=eq.1&select=business_name,email,phone`, { method: "GET" })
    const settingsRows = await settingsRes.json()
    const settings = Array.isArray(settingsRows) ? settingsRows[0] : {}

    const copy = EVENT_COPY[notification.event_type] || { subject: (n) => `Update on order ${n}`, headline: "Order update", body: "There's an update on your order." }
    const businessName = settings?.business_name || "MA Communication"
    const siteUrl = process.env.VITE_SITE_URL || "https://ma-comunication.vercel.app"
    const trackingUrl = `${siteUrl}/track-order/${encodeURIComponent(order.order_number)}`

    const html = renderEmailHtml({
      businessName,
      headline: copy.headline,
      body: copy.body,
      order,
      supportEmail: settings?.email,
      supportPhone: settings?.phone,
      trackingUrl,
    })

    // 4. Send via Resend. from_email must come from a domain verified in
    //    Resend — see RESEND_FROM_EMAIL in .env.example.
    const fromAddress = process.env.RESEND_FROM_EMAIL || `${businessName} <onboarding@resend.dev>`
    const resendRes = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: order.email,
        subject: copy.subject(order.order_number),
        html,
      }),
    })

    if (!resendRes.ok) {
      const errText = await resendRes.text().catch(() => "")
      await supabaseAdminRequest(`/rest/v1/notification_events?id=eq.${notification_id}`, {
        method: "PATCH",
        // Truncate — never store/return unbounded provider internals.
        body: JSON.stringify({ status: "failed", error: `Resend error (status ${resendRes.status})` }),
      })
      // Log full detail server-side only (Vercel function logs), not in the DB or response.
      console.error("Resend send failed:", resendRes.status, errText.slice(0, 500))
      res.status(200).json({ ok: false }) // 200 so pg_net doesn't treat this as a transport failure
      return
    }

    await supabaseAdminRequest(`/rest/v1/notification_events?id=eq.${notification_id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "sent", sent_at: new Date().toISOString() }),
    })

    res.status(200).json({ ok: true })
  } catch (err) {
    console.error("send-notification-email error:", err)
    // Never return the actual error message/stack to the caller.
    res.status(500).json({ ok: false })
  }
}
