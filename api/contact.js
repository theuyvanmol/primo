/* PRIMO contact endpoint (Vercel serverless function).
   Required environment variables (Vercel > Project > Settings > Environment Variables):
     RESEND_API_KEY   API key from https://resend.com (sends the email)
     RECAPTCHA_SECRET Google reCAPTCHA v2 ("I'm not a robot") secret key
   Optional:
     CONTACT_TO       recipient (default theuy.vanmol@primo-mc.com)
     CONTACT_FROM     verified sender, e.g. "PRIMO Website <website@primo-mc.com>"
     ALLOWED_ORIGINS  extra comma-separated origins allowed to post
*/
'use strict';
const TO = process.env.CONTACT_TO || 'theuy.vanmol@primo-mc.com';
const FROM = process.env.CONTACT_FROM || 'PRIMO Website <onboarding@resend.dev>';
const ORIGINS = ['https://www.primo-mc.com', 'https://primo-mc.com']
  .concat((process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean));
const HOSTS = ORIGINS.map(o => { try { return new URL(o).hostname; } catch (e) { return ''; } });
const SERVICES = ['A connected marketing plan', 'Website design and development', 'SEO and content', 'Paid advertising', 'AI and automation', 'Something else'];
const EMAIL = /^[A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
const hits = new Map(); // best-effort per-instance rate limit

const clean = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
const oneLine = (v, max) => clean(v, max).replace(/[\r\n\u2028\u2029]+/g, ' ');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function send(res, code, body) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(body));
}
function limited(ip) {
  const now = Date.now(), win = 10 * 60 * 1000, list = (hits.get(ip) || []).filter(t => now - t < win);
  list.push(now); hits.set(ip, list);
  if (hits.size > 5000) for (const k of hits.keys()) { if (!hits.get(k).some(t => now - t < win)) hits.delete(k); }
  return list.length > 5;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(res, 405, { ok: false, error: 'method_not_allowed' }); }
  const origin = req.headers.origin;
  if (origin && !ORIGINS.includes(origin)) return send(res, 403, { ok: false, error: 'forbidden' });
  if (!/^application\/json/i.test(req.headers['content-type'] || '')) return send(res, 415, { ok: false, error: 'unsupported_type' });
  if (!process.env.RESEND_API_KEY || !process.env.RECAPTCHA_SECRET) return send(res, 503, { ok: false, error: 'not_configured' });

  let b = req.body;
  if (typeof b === 'string') { if (b.length > 20000) return send(res, 413, { ok: false, error: 'too_large' }); try { b = JSON.parse(b); } catch (e) { b = null; } }
  if (!b || typeof b !== 'object' || Array.isArray(b)) return send(res, 400, { ok: false, error: 'invalid' });

  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  if (limited(ip)) return send(res, 429, { ok: false, error: 'rate_limited' });

  if (b.website) return send(res, 200, { ok: true }); // honeypot: pretend success to bots

  const name = oneLine(b.name, 120), email = oneLine(b.email, 254), company = oneLine(b.company, 160);
  const service = SERVICES.includes(b.service) ? b.service : 'Something else';
  const message = clean(b.message, 5000);
  const marketing = b.marketing === true || b.marketing === 'on' || b.marketing === 'true';
  const token = clean(b.recaptcha, 4096);
  if (!name || !EMAIL.test(email) || message.length < 10) return send(res, 400, { ok: false, error: 'invalid' });
  if (!token) return send(res, 400, { ok: false, error: 'captcha_required' });

  try {
    const form = new URLSearchParams({ secret: process.env.RECAPTCHA_SECRET, response: token });
    if (ip) form.set('remoteip', ip);
    const vr = await fetch('https://www.google.com/recaptcha/api/siteverify', { method: 'POST', body: form, signal: AbortSignal.timeout(8000) });
    const vj = await vr.json();
    if (!vj.success || (vj.hostname && !HOSTS.includes(vj.hostname))) return send(res, 400, { ok: false, error: 'captcha_failed' });
  } catch (e) { return send(res, 502, { ok: false, error: 'captcha_unavailable' }); }

  const when = new Date().toISOString();
  const text = ['New enquiry from primo-mc.com', '', 'Name: ' + name, 'Email: ' + email, 'Company: ' + (company || '-'), 'Interested in: ' + service,
    'Agreed to marketing emails: ' + (marketing ? 'YES (opted in ' + when + ')' : 'No'), '', 'Message:', message].join('\n');
  const html = '<h2>New enquiry from primo-mc.com</h2><table cellpadding="6" style="border-collapse:collapse;font:15px/1.5 Arial,sans-serif">' +
    [['Name', name], ['Email', email], ['Company', company || '-'], ['Interested in', service], ['Marketing emails', marketing ? 'YES, opted in ' + when : 'No']]
      .map(r => '<tr><td style="color:#666">' + r[0] + '</td><td><strong>' + esc(r[1]) + '</strong></td></tr>').join('') +
    '</table><h3>Message</h3><p style="white-space:pre-wrap;font:15px/1.6 Arial,sans-serif">' + esc(message) + '</p>';
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', signal: AbortSignal.timeout(10000),
      headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [TO], reply_to: email, subject: 'PRIMO enquiry: ' + (company || name).slice(0, 80), text, html })
    });
    if (!r.ok) { console.error('resend_failed', r.status); return send(res, 502, { ok: false, error: 'send_failed' }); }
  } catch (e) { console.error('resend_error'); return send(res, 502, { ok: false, error: 'send_failed' }); }
  return send(res, 200, { ok: true });
};
