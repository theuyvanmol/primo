# PRIMO V11 — liquid glass update

Complete static PRIMO website, with the immersive theme, 27 indexable content/product pages, three non-indexable workspace demo pages and six original sample HTML starters.

## Deploy

Extract this ZIP and upload its contents to a GitHub repository root. Do not upload only the ZIP. The static site needs no npm installation or build command. GitHub Pages can serve the repository root. Vercel can import it using Other, no build command and the root as the output directory.

To preview locally: python3 -m http.server 8000 . Open http://localhost:8000 .

## Try the new journeys

- Open marketplace/ to filter products, open previews, add to the cart and complete a demo order.
- No payment is taken. Prices are sample USD prices.
- Open portal/login/ for Sign in or Create account previews. Sample email: client@example.test or staff@example.test. Sample password: PrimoDemo123!. This is demonstration access, not secure authentication.
- Client demo: review projects, approve sample creative, send a demo message, view files, preview a fictional invoice and see your marketplace sample downloads.
- Staff demo: create fictional projects, add/move tasks and see client decisions/messages saved in this same browser.

Demo state stays in the browser. It is not shared between different people or devices. No real client data, passwords, Google login, payment processing or private storage is connected. The sample downloads are evaluation starters, not final commercial products or paid licences. See MARKETPLACE-PORTAL-NOTES.md for details.

## Set the final SEO domain

Once the production HTTPS URL is known, run:

python3 scripts/build_pages.py --base-url https://your-real-domain.com/
python3 scripts/check_site.py

For a GitHub project site, include its repository path. Commit the updated root HTML pages, folders and assets. The generator also creates a dist/ copy.

## Edit products

Edit scripts/commerce_data.py, then run:

python3 scripts/make_product_samples.py
python3 scripts/build_pages.py
node scripts/check_demo_flows.cjs
python3 scripts/check_site.py

## Existing limits

The contact form opens an email draft to theuy.vanmol@primo-mc.com; direct submission and the final administrator email remain to be configured. The original signup modal and Orbit remain demos. Monument Extended still awaits licensed font files; Inter and Noto Sans Thai are bundled fallbacks. Detail pages are English; the homepage retains its language selector.

Automated code and static checks passed; browser visual testing remains outstanding. The hosted preview remains private. See SEO-DEPLOYMENT.md and MARKETPLACE-PORTAL-NOTES.md before a public or commercial launch.

## Latest visual updates
Animated liquid glass buttons and navigation: frosted surfaces, cool blue reflections, copper highlights, pointer lighting, click ripples and press feedback. Reduced-motion and forced-colour fallbacks are included. The original copper prism helper mascot replaces the old icon. This update applies glass to controls and selected panels; it is not a complete glass redesign of every section.

Source commit: 1e5751b7b14fc1003ea2389b94cf21542b0ed1a8
