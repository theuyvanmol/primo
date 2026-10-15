# PRIMO portal: setup guide

The portal (`/portal/login/`, `/portal/staff/`, `/portal/client/`) is a real, multi-user workspace.
Data lives in a **Supabase** project (Postgres database + login + private file storage).
This repo only contains the website; nothing sensitive is stored in it.

## What it does

| Area | Staff / admin | Client |
|---|---|---|
| Projects | create, edit, delete, phase + progress | view their own |
| Tasks (kanban) | create, assign, drag between columns | not visible (internal) |
| Approvals | request sign-off, edit | approve or request changes, with comment |
| Files | upload (private, 50 MB), choose client-visible or internal | download files shared with them |
| Invoices | create as Draft, mark Sent/Paid/Overdue | see Sent/Paid/Overdue only, can print |
| Requests | see all client requests, update status | send requests, track status |
| Clients | create companies, invite contacts | – |
| Team (admin only) | change roles, link users to clients, invites | – |

Team chat / messaging is intentionally not included yet.

## One-time setup (about 10 minutes)

1. **Create the project.** Go to supabase.com, sign in, *New project*. Pick a region close to your team
   (Singapore for Thailand/Vietnam) and save the database password somewhere safe.
2. **Create the tables.** In Supabase open *SQL Editor -> New query*, paste the whole of
   `supabase/schema.sql`, click *Run*. Safe to re-run later.
3. **Connect the website.** In Supabase open *Project Settings -> API*. Copy the **Project URL** and the
   **anon / publishable key** into `assets/portal-config.js`. Never paste the `service_role` / secret key.
   Commit and push; Vercel redeploys.
4. **Auth settings** (*Authentication -> Sign In / Providers -> Email*): keep **Confirm email = ON**
   (roles are only granted after an email is confirmed). Under *Authentication -> URL Configuration* set
   **Site URL** to `https://www.primo-mc.com` and add `https://www.primo-mc.com/portal/login/` (and your
   `*.vercel.app` preview URL if you test there) to *Redirect URLs*.
5. **Create the first admin.** Open `/portal/login/`, choose *Create account*, register, click the email link.
   **The first person to confirm an email becomes admin**, so do this yourself straight away.

## How people get access

* **PRIMO staff:** anyone who confirms an email ending `@primo-mc.com` becomes *staff* automatically.
  Other staff can be added from *Team -> Invite someone* (admin only) or by changing their role in *Team*.
* **Clients:** in *Clients*, add the company, then *Invite* the contact's email. They create an account with
  that exact email, confirm it, and are linked to their company automatically.
  Anyone who signs up without an invite lands on a "waiting to be linked" screen and sees nothing.
* **Changing access later:** *Team -> Change access* (admin).

## Security model

* Every table has row-level security. Clients can only ever read rows for their own company; the rules are
  enforced by the database, not by the web page, so hiding a button is not what protects the data.
* Files are in a private bucket and downloaded through short-lived (60 s) signed links.
* Draft invoices, tasks, internal files and client notes are never readable by clients.
* The anon key in `portal-config.js` is public by design. It can do nothing without a signed-in user.
* Emails: Supabase's built-in mailer is rate limited. For production add SMTP (e.g. Resend, Google Workspace)
  under *Authentication -> SMTP Settings*.

## Day to day

* Back up: Supabase dashboard -> *Database -> Backups* (daily on paid plans; export manually on free).
* Free plan pauses a project after a week of no activity; upgrading to Pro avoids that.
* Regenerating pages: `python3 scripts/build_pages.py` (portal markup lives in `scripts/commerce_content.py`).

## Files

* `supabase/schema.sql`: tables, access rules, storage bucket, signup/role triggers
* `assets/portal-config.js`: the two connection values
* `assets/portal-app.js`: the portal application
* `assets/portal.css`: styles
