export async function notifyAdminOrderPaid(opts: { publicId: string }) {
  const webhookUrl = process.env.ADMIN_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        event: "order.paid",
        orderPublicId: opts.publicId,
        adminUrl: `/admin`,
        orderAdminUrl: `/admin#order-${opts.publicId}`,
      }),
    });
  } catch {
    // Best-effort notification; ignore failures.
  }
}
