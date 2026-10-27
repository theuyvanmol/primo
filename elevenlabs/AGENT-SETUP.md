# PRIMO AI assistant: ElevenLabs setup (English first)

## 1. Create the agent
elevenlabs.io > Agents > Create agent > start from the lead-qualification / sales template (or Blank).
- **Name:** PRIMO Assistant
- **Language:** English (add Thai and Vietnamese later under Languages)
- **Voice:** pick a warm, professional voice. **Mode:** voice and text enabled.
- **LLM:** a fast model (cost and latency matter for voice).
- **First message:** `Hi, I'm PRIMO's assistant. I can explain how we help brands grow and find the right starting point for you. What kind of business are you working on?`

## 2. System prompt (paste in full)
See `system-prompt.md`.

## 3. Knowledge base
Add as text (Knowledge base > Add text) the contents of `knowledge.md`.

## 4. Lead tool (server tool / webhook)
Tools > Add tool > **Webhook** (server tool):
- **Name:** `save_lead`
- **Description:** `Send a qualified lead to the PRIMO team. Call once, after the visitor has agreed to be contacted and given a name and an email or phone number.`
- **Method / URL:** `POST` `https://www.primo-mc.com/api/lead`
- **Header:** `x-primo-secret` = the secret you set as `LEAD_WEBHOOK_SECRET` in Vercel (add it as an ElevenLabs "secret", do not paste it into the prompt)
- **Body parameters** (all strings except marketing_consent boolean): `name` (required), `email`, `phone`, `company`, `website`, `service_interest`, `goals`, `budget`, `timeline`, `market`, `lead_quality` (hot / warm / cold), `marketing_consent` (boolean), `summary`
  - Give each a short description, e.g. `lead_quality`: "hot = clear goal, budget and timeline within 3 months; warm = interested, missing details; cold = just exploring".

## 5. Widget and security
Agent > Widget / Security:
- **Allowlist:** `www.primo-mc.com` and `primo-mc.com` only. Turn **authentication on** so the agent can't be used from other sites.
- Style the widget in the dashboard: dark background (#0b0b0c), accent #e58a5c, avatar = PRIMO logo.
- Enable **text input** and **voice**. Under Privacy/Data, enable the recording notice and set data retention you are happy with.
- **Usage limits:** set a monthly spend cap and a max conversation length (for example 10 minutes) in your ElevenLabs billing/usage settings.

## 6. Connect it to the site
1. In Vercel add `LEAD_WEBHOOK_SECRET` (a long random string) and redeploy.
2. Put the agent ID (public) in `site-config.json` as `elevenlabs_agent_id`, rebuild (`python3 scripts/build_pages.py --base-url https://www.primo-mc.com/`) and push. Until then the widget does not load.
3. Test: open the site, click the assistant, give a fake lead, confirm the email arrives at theuy.vanmol@primo-mc.com.
