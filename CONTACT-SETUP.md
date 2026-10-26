# Contact form setup (2 minutes)

The form posts to `/api/contact` (Vercel serverless function) and emails theuy.vanmol@primo-mc.com.

1. **Resend** (sends the email): create a free account at https://resend.com, make an API key.
   For best delivery, verify the domain primo-mc.com in Resend and set `CONTACT_FROM` to e.g. `PRIMO Website <website@primo-mc.com>`.
   Until then the default sender `onboarding@resend.dev` only delivers to the email you registered Resend with.
2. **reCAPTCHA**: https://www.google.com/recaptcha/admin -> create a **v2 "I'm not a robot" checkbox** key for `www.primo-mc.com` and `primo-mc.com`.
3. In Vercel > Project > Settings > Environment Variables add (Production):
   - `RESEND_API_KEY` = your Resend key
   - `RECAPTCHA_SECRET` = the reCAPTCHA **secret** key
   - optional `CONTACT_TO`, `CONTACT_FROM`
4. Put the reCAPTCHA **site** key in `site-config.json` (`recaptcha_site_key`), then run
   `python3 scripts/build_pages.py --base-url https://www.primo-mc.com/` and push.
5. Redeploy. Until steps 1-4 are done the form shows a friendly "unavailable, email us" message.

Marketing consent is an optional, unticked checkbox (required by GDPR/PDPA); the email to you states YES/No with a timestamp.
