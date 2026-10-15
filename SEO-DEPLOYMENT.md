# PRIMO V11: SEO and launch notes

## What is implemented

- 27 distinct indexable HTML pages: the existing 20-page website, a marketplace and six digital product pages. Three additional portal demo pages use noindex and are excluded from the sitemap.
- Content is present in the delivered HTML, not dependent on client-side rendering.
- Unique titles, descriptions, canonical URLs and social share metadata.
- One H1 per page, with bold H1 styling and descriptive heading structure.
- Organization, WebSite and WebPage JSON-LD, with BreadcrumbList on content pages, Service on service detail pages and Article on Hub posts.
- Ordinary crawlable internal links, relevant service/article connections and page breadcrumbs.
- XML sitemap, robots.txt, a custom noindex 404 page, image alternative text and lazy loading for non-hero article imagery.
- Mobile layouts, keyboard navigation, skip links, visible focus states and reduced-motion support.
- Homepage portfolio cards now link to named client overviews rather than showing illustrative performance figures.

## Before the final domain launches

The current canonical base is the separate PRIMO V11 preview origin. Once the final deployment URL is known, extract the package and run:

```sh
python3 scripts/build_pages.py --base-url https://your-final-domain.example/
python3 scripts/check_site.py
```

Replace that example with the actual HTTPS domain. For a GitHub project site, include its repository path, for example https://username.github.io/repository/ . The generator updates canonical URLs, metadata, structured data, sitemap and robots.txt. Upload the resulting root HTML pages, route folders and assets. No Node build is required. A dist/ copy is also generated if your hosting uses a dedicated output directory.

Do not serve the same website from several indexable domains indefinitely. Choose the production origin and redirect alternative domains where the host supports it. The current Sites preview remains private, so it is not publicly crawlable; this package does not change its access settings.

When the production site is public, verify domain ownership in Google Search Console and submit sitemap.xml. Metadata and a sitemap improve the site's foundations but do not guarantee indexing or ranking.

## Content and functionality boundaries

- New detail pages are in English. The existing homepage language switcher remains; no separate Thai/Vietnamese URL set or hreflang claims are added.
- Client pages are qualitative overviews. No invented testimonials, review ratings, street addresses or numerical results are included.
- The Contact page prepares an email draft for hello@primo-mc.com. It does not send a server-side message. The administrator email and live form backend still need final setup if direct submission is wanted.
- The sign-up interface remains a demo: Google is not connected, no SMS is sent, no accounts are created. Phone demo code is 123456.
- Orbit remains a concept using sample data.
- Monument Extended is configured as the preferred font but awaits licensed font binaries. Inter and Noto Sans Thai are bundled as fallbacks.
- All supplied client logos, animated PRIMO branding, homepage Hub section and immersive theme are preserved.

## Checks completed

The static audit checks every HTML page for H1 count, metadata, duplicate IDs, valid JSON-LD, local links, fragments, asset references and sitemap coverage. JavaScript syntax checks were run for the new page interactions and updated membership component. Browser visual and end-to-end testing were unavailable in the authoring environment.

## SEO reference

Google Search Central: https://developers.google.com/search/docs/fundamentals/seo-starter-guide

## Marketplace and portal extension

See MARKETPLACE-PORTAL-NOTES.md. Marketplace prices are illustrative and no Product/Offer price claims are included in the structured data. The product concepts use CreativeWork markup. Portal pages are noindex, which is not an authentication or security mechanism.
