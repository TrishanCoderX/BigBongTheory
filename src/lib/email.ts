import { Resend } from "resend";

interface BookingConfirmationInput {
  to: string;
  name: string;
  eventName: string;
  eventDate: string;
  eventVenue: string;
  tierLabel: string;
  ticketId: string;
  amount: number;
}

// Every one of these fields can originate from user input (booking name) or
// admin input (event details) — never interpolate them into HTML without
// escaping, or a booking name like "<script>..." ends up live in the email.
function escapeHtml(value: string | number): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function confirmationHtml(raw: BookingConfirmationInput): string {
  const input = {
    name: escapeHtml(raw.name),
    eventName: escapeHtml(raw.eventName),
    eventDate: escapeHtml(raw.eventDate),
    eventVenue: escapeHtml(raw.eventVenue),
    tierLabel: escapeHtml(raw.tierLabel),
    ticketId: escapeHtml(raw.ticketId),
    amount: escapeHtml(raw.amount),
  };
  return `
  <div style="background:#08080B;padding:40px 20px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#F3F0E7;color:#08080B;">
      <div style="background:#08080B;color:#CBF23F;padding:20px 28px;font-size:11px;letter-spacing:2px;text-transform:uppercase;">
        Big Bong Theory &mdash; Official Event Pass
      </div>
      <div style="padding:28px;">
        <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#FF4D2E;margin-bottom:8px;">
          Payment confirmed
        </div>
        <h1 style="font-size:28px;text-transform:uppercase;margin:0 0 20px;line-height:1.1;">
          You&rsquo;re in.
        </h1>
        <p style="font-size:15px;line-height:1.6;margin:0 0 24px;">
          Hey ${input.name}, your pass for <strong>${input.eventName}</strong> is confirmed. Keep this
          ticket ID handy &mdash; it&rsquo;s what gets scanned at the gate.
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr>
            <td style="padding:10px 0;border-top:1px solid rgba(8,8,11,0.15);color:rgba(8,8,11,0.55);text-transform:uppercase;letter-spacing:1px;font-size:10px;">Ticket ID</td>
            <td style="padding:10px 0;border-top:1px solid rgba(8,8,11,0.15);text-align:right;font-weight:bold;">${input.ticketId}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-top:1px solid rgba(8,8,11,0.15);color:rgba(8,8,11,0.55);text-transform:uppercase;letter-spacing:1px;font-size:10px;">Category</td>
            <td style="padding:10px 0;border-top:1px solid rgba(8,8,11,0.15);text-align:right;">${input.tierLabel}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-top:1px solid rgba(8,8,11,0.15);color:rgba(8,8,11,0.55);text-transform:uppercase;letter-spacing:1px;font-size:10px;">Date</td>
            <td style="padding:10px 0;border-top:1px solid rgba(8,8,11,0.15);text-align:right;">${input.eventDate}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-top:1px solid rgba(8,8,11,0.15);color:rgba(8,8,11,0.55);text-transform:uppercase;letter-spacing:1px;font-size:10px;">Venue</td>
            <td style="padding:10px 0;border-top:1px solid rgba(8,8,11,0.15);text-align:right;">${input.eventVenue}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-top:1px solid rgba(8,8,11,0.15);color:rgba(8,8,11,0.55);text-transform:uppercase;letter-spacing:1px;font-size:10px;">Amount paid</td>
            <td style="padding:10px 0;border-top:1px solid rgba(8,8,11,0.15);text-align:right;">₹${input.amount}</td>
          </tr>
        </table>
        <p style="font-size:11px;line-height:1.6;margin:24px 0 0;color:rgba(8,8,11,0.5);">
          Screenshots work. Honesty doesn&rsquo;t. See you there.
        </p>
      </div>
    </div>
  </div>`;
}

/**
 * Best-effort booking confirmation email — never throws. A booking is
 * considered successful once the registration row exists in the database;
 * email delivery is a nice-to-have on top, not something that should fail
 * the purchase if the email provider is unreachable or unconfigured.
 */
export async function sendBookingConfirmation(input: BookingConfirmationInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping booking confirmation email.");
    return;
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "Big Bong Theory <onboarding@resend.dev>",
      to: input.to,
      subject: `Your pass for ${input.eventName} — ${input.ticketId}`,
      html: confirmationHtml(input),
    });
  } catch (err) {
    console.error("[email] Failed to send booking confirmation:", err);
  }
}

interface JoinConfirmationInput {
  to: string;
  name: string;
}

function joinConfirmationHtml(raw: JoinConfirmationInput): string {
  const name = escapeHtml(raw.name);
  return `
  <div style="background:#08080B;padding:40px 20px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#F3F0E7;color:#08080B;">
      <div style="background:#08080B;color:#CBF23F;padding:20px 28px;font-size:11px;letter-spacing:2px;text-transform:uppercase;">
        Big Bong Theory &mdash; Membership Application
      </div>
      <div style="padding:28px;">
        <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#FF4D2E;margin-bottom:8px;">
          Application received
        </div>
        <h1 style="font-size:28px;text-transform:uppercase;margin:0 0 20px;line-height:1.1;">
          Noise logged.
        </h1>
        <p style="font-size:15px;line-height:1.6;margin:0 0 8px;">
          Hey ${name}, we&rsquo;ve got your application. We read every single one — if your dangerous
          idea is as interesting as it sounds, someone from BBT will reply within a few days.
        </p>
      </div>
    </div>
  </div>`;
}

/**
 * Best-effort join-application confirmation email — never throws, mirrors
 * sendBookingConfirmation. The application is considered received once the
 * database row exists; this is a nice-to-have on top.
 */
export async function sendJoinConfirmation(input: JoinConfirmationInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping join confirmation email.");
    return;
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "Big Bong Theory <onboarding@resend.dev>",
      to: input.to,
      subject: "We got your application — Big Bong Theory",
      html: joinConfirmationHtml(input),
    });
  } catch (err) {
    console.error("[email] Failed to send join confirmation:", err);
  }
}

interface SponsorConfirmationInput {
  to: string;
  brandName: string;
  contactName: string;
}

function sponsorConfirmationHtml(raw: SponsorConfirmationInput): string {
  const brandName = escapeHtml(raw.brandName);
  const contactName = escapeHtml(raw.contactName);
  return `
  <div style="background:#08080B;padding:40px 20px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#F3F0E7;color:#08080B;">
      <div style="background:#08080B;color:#CBF23F;padding:20px 28px;font-size:11px;letter-spacing:2px;text-transform:uppercase;">
        Big Bong Theory &mdash; Sponsorship Inquiry
      </div>
      <div style="padding:28px;">
        <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#FF4D2E;margin-bottom:8px;">
          Inquiry received
        </div>
        <h1 style="font-size:28px;text-transform:uppercase;margin:0 0 20px;line-height:1.1;">
          On the wall soon.
        </h1>
        <p style="font-size:15px;line-height:1.6;margin:0 0 8px;">
          Hey ${contactName}, we&rsquo;ve got ${brandName}&rsquo;s sponsorship inquiry. Someone from BBT
          will reach out within a few days to talk details.
        </p>
      </div>
    </div>
  </div>`;
}

/**
 * Best-effort sponsor-inquiry confirmation email — never throws, mirrors
 * sendJoinConfirmation. The inquiry is considered received once the
 * database row exists; this is a nice-to-have on top.
 */
export async function sendSponsorConfirmation(input: SponsorConfirmationInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping sponsor confirmation email.");
    return;
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "Big Bong Theory <onboarding@resend.dev>",
      to: input.to,
      subject: "We got your sponsorship inquiry — Big Bong Theory",
      html: sponsorConfirmationHtml(input),
    });
  } catch (err) {
    console.error("[email] Failed to send sponsor confirmation:", err);
  }
}
