# PRIMO Group V11 — GitHub deployment package

This is the latest immersive PRIMO V11 website: animated PRIMO branding, client logo marquee, PRIMO HUB / OUR WORK panels, lifestyle editorial section, copper light network and contact registration demo.

## Run locally

From this folder run:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. No npm installation or build step is required.

## Upload to GitHub

1. Extract this ZIP.
2. Create a GitHub repository.
3. Upload index.html, the complete assets folder, .nojekyll and README.md to the repository root. Upload the extracted contents, not the ZIP itself.
4. Commit the files.

## Deploy with GitHub Pages

In the repository, open Settings → Pages. Under Build and deployment choose Deploy from a branch, choose main and / (root), then Save. GitHub will display the published URL when deployment completes. All website asset paths are relative, including the images inside inline SVG logos.

## Deploy with Vercel from GitHub

Import the repository in Vercel. Choose Other as the framework preset, leave the build command empty and use the repository root as the output directory (.). No environment variables are required for this static demo.

## Important current behaviour

- Registration/sign-in is a visual demo. It does not create accounts, send email or SMS, or connect to Google. Phone verification demo code: 123456.
- The contact form opens an email draft addressed to hello@primo-mc.com; update this address in index.html before using another recipient. No administrator notification backend is configured.
- PRIMO HUB contains expandable introductory guides; Orbit dashboard contains sample data.
- Monument Extended is configured as the preferred font family, but its font files have not been supplied. Inter is bundled as the fallback; Noto Sans Thai supplies Thai glyphs. Provide licensed Monument Extended font files to complete that change.
- Animation supports reduced-motion preferences; the canvas network is disabled on small screens and pauses when hidden/off-screen.
- Original source images/logos and locally downloaded font files are included. No Sites-specific editor widget, hosting project identity, credentials, repository history or deployment archive is included.
- Static asset paths, anchor targets, package integrity and JavaScript syntax were checked. Browser visual testing remains outstanding.

## Files

index.html — main page and original interactions
assets/ — all CSS, JavaScript, fonts, photos, logos
.nojekyll — tells GitHub Pages to serve the static files directly

The original hosted V10 website is unchanged. This portable package can be deployed independently.
