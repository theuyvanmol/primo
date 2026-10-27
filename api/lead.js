/* Lead capture endpoint for the PRIMO AI assistant (ElevenLabs Agents server tool).
   Called server-to-server by ElevenLabs, never by browsers.
   Required env: LEAD_WEBHOOK_SECRET (shared with the ElevenLabs tool header), RESEND_API_KEY
   Optional env: CONTACT_TO, CONTACT_FROM
*/
'use strict';
const crypto = require('crypto');
const TO = process.env.CONTACT_TO || 'theuy.vanmol@primo-mc.com';
const FROM = process.env.CONTACT_FROM || 'PRIMO Website <onboarding@resend.dev>';
const EMAIL = /^[A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
const hits = new Map();
const clean = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
const one = (v, max) => clean(v, max).replace(/[\r\n\u2028\u2029]+/g, ' ');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function send(res, code, body) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}
function same(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(res, 405, { ok: false, error: 'method_not_allowed' }); }
  const secret = process.env.LEAD_WEBHOOK_SECRET;
  if (!secret || !process.env.RESEND_API_KEY) return send(res, 503, { ok: false, error: 'not_configured' });
  if (!same(req.headers['x-primo-secret'] || '', secret)) return send(res, 401, { ok: false, error: 'unauthorized' });
  const now = Date.now(), win = 10 * 60 * 1000, list = (hits.get('all') || []).filter(t => now - t < win);
  list.push(now); hits.set('all', list);
  if (list.length > 60) return send(res, 429, { ok: false, error: 'rate_limited' });
  let b = req.body;
  if (typeof b === 'string') { if (b.length > 20000) return send(res, 413, { ok: false, error: 'too_large' }); try { b = JSON.parse(b); } catch (e) { b = null; } }
  if (!b || typeof b !== 'object' || Array.isArray(b)) return send(res, 400, { ok: false, error: 'invalid' });
  const name = one(b.name, 120), email = one(b.email, 254), phone = one(b.phone, 40), company = one(b.company, 160), website = one(b.website, 200);
  if (!name || (!EMAIL.test(email) && phone.length < 6)) return send(res, 400, { ok: false, error: 'need_name_and_contact' });
  const f = {
    'Name': name, 'Email': EMAIL.test(email) ? email : '-', 'Phone / WhatsApp / LINE': phone || '-', 'Company': company || '-', 'Website': website || '-',
    'Service interest': one(b.service_interest, 200) || '-', 'Goals': clean(b.goals, 1200) || '-', 'Budget': one(b.budget, 120) || '-', 'Timeline': one(b.timeline, 120) || '-',
    'Market / country': one(b.market, 120) || '-', 'Lead quality': one(b.lead_quality, 40) || '-',
    'Marketing emails OK': (b.marketing_consent === true || b.marketing_consent === 'true') ? 'YES (said yes in chat ' + new Date().toISOString() + ')' : 'No'
  };
  const summary = clean(b.summary, 3000) || '-';
  const text = 'New lead from the PRIMO AI assistant\n\n' + Object.entries(f).map(([k, v]) => k + ': ' + v).join('\n') + '\n\nConversation summary:\n' + summary;
  const html = '<h2>New lead from the PRIMO AI assistant</h2><table cellpadding="6" style="border-collapse:collapse;font:15px/1.5 Arial,sans-serif">' +
    Object.entries(f).map(([k, v]) => '<tr><td style="color:#666">' + esc(k) + '</td><td><strong>' + esc(v) + '</strong></td></tr>').join('') +
    '</table><h3>Conversation summary</h3><p style="white-space:pre-wrap;font:15px/1.6 Arial,sans-serif">' + esc(summary) + '</p>';
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', signal: AbortSignal.timeout(10000),
      headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ from: FROM, to: [TO], subject: 'AI lead: ' + (company || name).slice(0, 80) + (f['Lead quality'] !== '-' ? ' [' + f['Lead quality'] + ']' : ''), text, html }, EMAIL.test(email) ? { reply_to: email } : {}))
    });
    if (!r.ok) { console.error('resend_failed', r.status); return send(res, 502, { ok: false, error: 'send_failed' }); }
  } catch (e) { console.error('resend_error'); return send(res, 502, { ok: false, error: 'send_failed' }); }
  return send(res, 200, { ok: true, message: 'Lead sent to the PRIMO team.' });
};
