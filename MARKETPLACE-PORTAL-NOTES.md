# PRIMO marketplace and workspace demonstration

## Included

- Marketplace with six original product concepts: STUDIO agency, STAY hospitality, INK artist portfolio, ORBIT dashboard UI, TABLE restaurant and LAUNCH brand UI kit.
- Product categories, search, sorting, per-product detail URLs, actual self-contained HTML sample previews and evaluation ZIP downloads.
- Browser-local cart, sample USD prices, checkout preview and demo-order completion. No payment or payment details are collected.
- Completed demo orders appear in the client workspace Downloads view.
- Client workspace: overview, own fictional projects, approvals, files, illustrative invoices, messages and downloads.
- Staff workspace: overview, projects, fictional clients, task board, client requests and messages. Tasks can be moved by drag-and-drop or accessible select controls.
- Client decisions and demo messages are visible across the client/staff views in the same browser. This is not multi-user server synchronisation.
- Explicit demo-role entry, no real passwords or OAuth. The role selector is not access control.
- Browser storage fallback: when storage is blocked the demo remains usable for the current page session, but changes cannot persist after navigating away.

## Routes

/marketplace/
/marketplace/studio-agency/
/marketplace/stay-hospitality/
/marketplace/ink-portfolio/
/marketplace/orbit-dashboard/
/marketplace/table-restaurant/
/marketplace/brand-launch-kit/
/portal/login/
/portal/client/
/portal/staff/

## Before commercial launch

The following are not connected or finalised: real customer authentication, server-enforced client/staff roles, private file storage, a shared database, live messages, payment processing, email receipts, order fulfilment entitlement, taxes, commercial product licences or real invoices. No real client information should be entered into this public-file demo. Portal pages use noindex and are excluded from the sitemap, but those measures are not security.

Sample prices are in USD and can be changed in scripts/commerce_data.py. The sample ZIPs are internal evaluation starters, not final paid products. They do not include Figma files, production integrations, third-party photography or client artwork.

The original service/contact form remains an email-draft workflow. The existing registration interface and Orbit dashboard remain demonstrations. Monument Extended still needs licensed font files.

## Updating the collection

Edit scripts/commerce_data.py, then run:

```sh
python3 scripts/make_product_samples.py
python3 scripts/build_pages.py
node scripts/check_demo_flows.cjs
python3 scripts/check_site.py
```

The shared browser data model is assets/workspace-state.js. Marketplace and portal interfaces use assets/marketplace.js and assets/portal.js. Sample data is deliberately fictional. Production authentication and permissions must be implemented on a server before replacing it with real records.

## Validation

Automated checks cover cart totals, invalid and duplicate items, demo checkout, download availability, browser persistence, blocked storage fallback, client approvals, messages, task movement and project creation. Static validation checks all internal references and sitemap coverage. Browser visual testing remains outstanding.

## Login and assistant update
The portal now includes Sign in and Create account preview modes, client/staff selection, password visibility and recovery messaging. Sample accounts are client@example.test or staff@example.test with PrimoDemo123!. Password values are cleared before entering and never persisted or transmitted. Registration is a fictional client preview; staff registration is disabled. Google and recovery explain their unconnected state. The homepage membership Sign in action opens the portal login. This is still browser-only demonstration access, not server authentication.
The helper uses a new original generated copper prism character instead of the previous white blob icon.
