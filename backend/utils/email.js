const { Resend } = require('resend');

let resendClient = null;
function getResend() {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set');
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

function escapeHtml(value) {
  if (value === undefined || value === null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderResultsEmail({ brand, contact, result }) {
  const { primaryColor, accentColor, name: brandName } = brand;
  const firstName = escapeHtml(contact.firstName);
  const overallScore = result.overallScore.toFixed(1);
  const maturityName = escapeHtml(result.maturity.name);
  const maturityHeadline = escapeHtml(result.maturity.headline);
  const maturityDescription = escapeHtml(result.maturity.description);
  const recommendation = escapeHtml(result.maturity.recommendation);

  const domainRows = result.domains
    .map((d) => {
      const pct = Math.round(((d.score - 1) / 4) * 100);
      return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#111827;">${escapeHtml(d.name)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;width:100px;">${escapeHtml(d.maturity)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#111827;width:80px;text-align:right;font-weight:600;">${d.score.toFixed(1)} / 5</td>
        </tr>
        <tr>
          <td colspan="3" style="padding:0 12px 14px;border-bottom:1px solid #e5e7eb;">
            <div style="background:#f3f4f6;border-radius:6px;height:8px;overflow:hidden;">
              <div style="background:${primaryColor};height:8px;width:${pct}%;"></div>
            </div>
          </td>
        </tr>`;
    })
    .join('');

  const weakest = result.insights.weakest
    .map((d) => `<li style="margin-bottom:6px;">${escapeHtml(d.name)} — ${d.score.toFixed(1)} / 5</li>`)
    .join('');
  const strongest = result.insights.strongest
    .map((d) => `<li style="margin-bottom:6px;">${escapeHtml(d.name)} — ${d.score.toFixed(1)} / 5</li>`)
    .join('');

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <tr><td style="background:${primaryColor};padding:32px 32px 28px;color:#ffffff;">
          <div style="font-size:13px;letter-spacing:1.5px;text-transform:uppercase;opacity:0.85;">${escapeHtml(brandName)}</div>
          <h1 style="margin:6px 0 0;font-size:22px;line-height:1.3;font-weight:600;">Your Workforce Planning Readiness Results</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Hi ${firstName},</p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">Thank you for completing the AI-Enabled Healthcare Workforce Planning Readiness Assessment. Here's your tailored summary.</p>

          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:24px;margin-bottom:24px;text-align:center;">
            <div style="font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Overall Score</div>
            <div style="font-size:44px;font-weight:700;color:${primaryColor};line-height:1;">${overallScore} <span style="font-size:18px;color:#9ca3af;font-weight:500;">/ 5</span></div>
            <div style="margin-top:14px;display:inline-block;padding:6px 14px;border-radius:999px;background:${accentColor};color:#ffffff;font-size:13px;font-weight:600;letter-spacing:0.5px;">${maturityName}</div>
            <p style="margin:18px 0 0;font-size:15px;color:#111827;font-weight:600;">${maturityHeadline}</p>
            <p style="margin:8px 0 0;font-size:14px;color:#4b5563;line-height:1.5;">${maturityDescription}</p>
          </div>

          <h2 style="margin:0 0 12px;font-size:16px;color:#111827;">Domain breakdown</h2>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;">${domainRows}</table>

          <h2 style="margin:0 0 8px;font-size:16px;color:#111827;">Recommended next step</h2>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#374151;">${recommendation}</p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr>
              <td width="48%" style="vertical-align:top;background:#fef3c7;border-radius:8px;padding:16px;">
                <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#92400e;margin-bottom:8px;font-weight:600;">Focus areas</div>
                <ul style="margin:0;padding-left:18px;font-size:13px;color:#78350f;line-height:1.5;">${weakest}</ul>
              </td>
              <td width="4%"></td>
              <td width="48%" style="vertical-align:top;background:#d1fae5;border-radius:8px;padding:16px;">
                <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#065f46;margin-bottom:8px;font-weight:600;">Strengths</div>
                <ul style="margin:0;padding-left:18px;font-size:13px;color:#064e3b;line-height:1.5;">${strongest}</ul>
              </td>
            </tr>
          </table>

          <p style="margin:32px 0 0;font-size:14px;line-height:1.6;color:#374151;">A specialist from ${escapeHtml(brandName)} will reach out shortly to walk you through your results and discuss tailored next steps.</p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;line-height:1.5;">
          You received this email because you completed the readiness assessment for ${escapeHtml(brandName)}.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function renderLeadNotificationEmail({ brand, contact, result }) {
  const domainList = result.domains
    .map((d) => `<li>${escapeHtml(d.name)}: <strong>${d.score.toFixed(1)} / 5</strong> (${escapeHtml(d.maturity)})</li>`)
    .join('');

  const contactRows = Object.entries(contact)
    .filter(([, v]) => v)
    .map(
      ([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-size:13px;text-transform:capitalize;">${escapeHtml(k)}</td><td style="padding:4px 0;font-size:13px;color:#111827;">${escapeHtml(v)}</td></tr>`
    )
    .join('');

  return `<!doctype html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;padding:24px;background:#f8fafc;">
  <h2 style="margin:0 0 16px;">New lead — ${escapeHtml(brand.name)}</h2>
  <p style="margin:0 0 20px;font-size:14px;color:#374151;">Overall score: <strong>${result.overallScore.toFixed(1)} / 5</strong> — <strong>${escapeHtml(result.maturity.name)}</strong></p>
  <h3 style="margin:0 0 8px;font-size:14px;">Contact</h3>
  <table style="margin-bottom:20px;border-collapse:collapse;">${contactRows}</table>
  <h3 style="margin:0 0 8px;font-size:14px;">Domain scores</h3>
  <ul style="margin:0 0 20px;padding-left:20px;font-size:13px;line-height:1.6;">${domainList}</ul>
  <p style="font-size:12px;color:#6b7280;">Submitted via ${escapeHtml(brand.id)} brand on ${new Date().toISOString()}</p>
</body></html>`;
}

async function sendResultEmails({ brand, contact, result }) {
  const resend = getResend();
  const fromAddress = `${brand.emailFromName || process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`;

  const sends = [];

  sends.push(
    resend.emails.send({
      from: fromAddress,
      to: contact.email,
      subject: brand.emailSubject || 'Your Workforce Planning Readiness Results',
      html: renderResultsEmail({ brand, contact, result })
    })
  );

  const salesEmail = brand.salesEmail || process.env.LEAD_NOTIFICATION_EMAIL;
  if (salesEmail) {
    sends.push(
      resend.emails.send({
        from: fromAddress,
        to: salesEmail,
        subject: `New lead — ${brand.name} — ${contact.firstName} ${contact.lastName} (${result.maturity.name})`,
        html: renderLeadNotificationEmail({ brand, contact, result })
      })
    );
  }

  const settled = await Promise.allSettled(sends);
  settled.forEach((s, i) => {
    const target = i === 0 ? 'recipient' : 'lead-notification';
    if (s.status === 'rejected') {
      console.error(`[email] ${target} send rejected:`, s.reason?.message || s.reason);
    } else if (s.value?.error) {
      console.error(`[email] ${target} send returned error:`, s.value.error);
    } else {
      console.log(`[email] ${target} sent`, s.value?.data?.id || '');
    }
  });
  return settled;
}

module.exports = { sendResultEmails, renderResultsEmail, renderLeadNotificationEmail };
