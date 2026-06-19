type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: EmailPayload) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;

  if (host && port) {
    const nodemailer = await import("nodemailer");
    const transport = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: false,
    });
    await transport.sendMail({
      from: process.env.SMTP_FROM ?? "noreply@eshop.local",
      to,
      subject,
      html,
    });
    return;
  }

  console.log("[email]", { to, subject, html: html.slice(0, 200) });
}

export function orderConfirmationEmail(order: {
  number: string;
  total: number;
  items: { name: string; quantity: number; total: number }[];
}) {
  const itemsHtml = order.items
    .map(
      (i) =>
        `<tr><td>${i.name} ×${i.quantity}</td><td>€${i.total.toFixed(2)}</td></tr>`
    )
    .join("");

  return `
    <h2>Ordine confermato — ${order.number}</h2>
    <p>Grazie per il tuo acquisto!</p>
    <table>${itemsHtml}</table>
    <p><strong>Totale: €${order.total.toFixed(2)}</strong></p>
  `;
}
