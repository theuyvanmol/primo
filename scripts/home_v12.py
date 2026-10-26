"""PRIMO homepage (v14): Curate-style light/dark bands, big light type, scroll motion, plus the laptop 'Enter PRIMO World' intro."""
from html import escape as esc
import pathlib

CARDS=[ # image, title, role
 ('products/velora/city.webp','Velora','Website template'),
 ('off-hours/campaign-v2.webp','Off Hours Club','Apparel brand concept'),
 ('products/auren/architecture.webp','Auren','Website template'),
 ('products/inkvoid/hero.webp','Ink Void','Portfolio template'),
]
SVC={ # image, name, line, tags (copy is the existing, already translated, service copy)
 'digital-marketing':dict(name='Digital Marketing',line='Turn insights into real growth across every digital channel.',tags=['Strategy','Social','Email','Analytics'],cover='off-hours/campaign-v2.webp'),
 'website-development':dict(name='Website Development',line='High-performance websites built for business results.',tags=['Design','Development','Speed','Conversion'],cover='previews/northline/assets/hero.webp'),
 'seo-content':dict(name='SEO & Content',line='Be found. Be chosen. Be ahead.',tags=['SEO','Content','Search','Authority'],cover='primo-global-hero-clean.webp'),
 'paid-advertising':dict(name='Advertising',line='Smarter ads. Bigger opportunities.',tags=['Paid social','Search ads','Creative','Reporting'],cover='photo-1519608487953-e999c86e7455.webp'),
 'ai-automation':dict(name='AI Solutions',line='Innovative AI to unlock your next growth.',tags=['Automation','AI assistants','Workflows','Insights'],cover='photo-1531297484001-80022131f5a1.jpg'),
}
ORDER=['digital-marketing','website-development','seo-content','paid-advertising','ai-automation']
BARS=[38,56,44,72,60,88,70,96,64,80,92,100]
# patchwork cards: label, sub, x%, y%, rotation
PATCH=[('SEO freelancer','Separate brief',4,6,-6),('Ad agency','Separate invoice',52,0,5),('Web developer','Separate login',0,38,4),('Social media freelancer','Separate brief',46,33,-5),('Brand studio','Separate invoice',8,68,-4),('Analytics tool','Separate login',54,66,6)]
EN_SECTION=(pathlib.Path(__file__).with_name('enter_section.html').read_text() if pathlib.Path(__file__).with_name('enter_section.html').exists() else '')

def build(NAV,SERVICES,PROJECTS,client_art,SEO,FAVICONS,ANALYTICS,SCRIPT):
    keep={'Services','Our Work','Process','About'}
    pill=''.join('<a href="%s">%s</a>'%(r,n) for r,n in NAV if n in keep)
    nav=''.join('<a href="%s">%s</a>'%(r,n) for r,n in NAV)
    panel=''.join('<span class="pt" style="--i:%d"><img src="assets/%s" alt="" loading="lazy" decoding="async"><b>%s</b><small>%s</small></span>'%(i,c[0],esc(c[1]),esc(c[2])) for i,c in enumerate(CARDS))
    chips=''.join('<span class="chip">%s%s</span>'%(client_art(p['logo'],''),esc(p['name'])) for p in PROJECTS)*4
    avatars=''.join('<span style="--o:%d"><img src="assets/%s" alt=""></span>'%(k,c[0]) for k,c in enumerate(CARDS))
    svcs=''
    for k,slug in enumerate(ORDER):
        d=SVC[slug]
        tags=''.join('<span>%s</span>'%esc(t) for t in d['tags'])
        svcs+=('<a class="sv rv%s" style="--i:%d" href="services/%s/"><span class="sv-img"><img src="assets/%s" alt="" loading="lazy" decoding="async"></span><span class="sv-no">0%d</span><h3>%s</h3><p>%s</p><span class="sv-tags">%s</span><span class="sv-go">View all ↗</span></a>')%(' inv' if k==0 else '',k%3,slug,d['cover'],k+1,esc(d['name']),esc(d['line']),tags)
    work=''
    for i,p in enumerate(PROJECTS):
        work+=('<a class="wk rv" href="work/%s/"><span class="wk-top"><span class="wk-logo">%s</span><h3>%s</h3><span class="wk-sec">%s</span></span><span class="wk-body"><span class="wk-txt"><small>%s</small><p>%s</p><span class="more">View overview <span>↗</span></span></span><span class="wk-vis" aria-hidden="true">%s</span></span></a>')%(p['slug'],client_art(p['logo'],''),esc(p['name']),esc(p['sector']),'0%d'%(i+1),esc(p['intro']),client_art(p['logo'],''))
    patch=''.join('<span class="pc" style="--x:%d%%;--y:%d%%;--r:%sdeg;--d:%d"><b>%s</b><small>%s</small><i>Extra cost</i></span>'%(x,y,r,k,esc(a),esc(b)) for k,(a,b,x,y,r) in enumerate(PATCH))
    bars=''.join('<span style="--h:%d%%"></span>'%h for h in BARS)
    return (TEMPLATE.replace('__FAV__',FAVICONS).replace('__SEO__',SEO).replace('__ANALYTICS__',ANALYTICS)
        .replace('__NAV__',nav).replace('__PILL__',pill).replace('__ENTER__',EN_SECTION).replace('__PANEL__',panel).replace('__CHIPS__',chips)
        .replace('__AVATARS__',avatars).replace('__SVCS__',svcs).replace('__WORK__',work).replace('__PATCH__',patch).replace('__BARS__',bars))

TEMPLATE='''<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0b0b0c">__FAV____SEO__<link rel="stylesheet" href="assets/inter-display.css"><link rel="stylesheet" href="assets/fonts.css"><link rel="stylesheet" href="assets/thai.css"><link rel="stylesheet" href="assets/home-v12.css">__ANALYTICS__</head>
<body><a class="skip-link" href="#main">Skip to content</a>
<header class="hdr" id="hdr" data-tone="dark"><a class="logo" href="./" aria-label="PRIMO Group home"><img src="assets/favicon-48.png" alt="" width="30" height="30"><span>PRIMO</span></a>
<nav class="pillnav" aria-label="Primary">__PILL__</nav>
<div class="hdr-r"><label class="lang language-picker"><select id="siteLanguage" aria-label="Language / ภาษา / Ngôn ngữ"><option value="en">EN</option><option value="th">TH</option><option value="vi">VN</option></select></label><a class="btn sm" href="contact/">Let's Talk ↗</a><button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu"><span></span><span></span><em>Menu</em></button></div></header>
<nav class="menu" id="menu" aria-label="Main navigation">__NAV__</nav>
<main id="main">
__ENTER__

<section class="hero band light" id="home" data-tone="light"><div class="hero-c">
<span class="chipl rv"><i></i>International Digital Agency</span>
<h1><span class="ln l1"><span>Grow your</span> <span class="swap"><span class="words"><em>brand</em><em>website</em><em>story</em><em>business</em><em>brand</em></span></span></span><span class="ln l3"><span>without borders.</span></span></h1>
<p class="lead rv" style="--i:2">We combine creativity, technology and data to help ambitious brands grow across the world.</p>
<div class="hero-cta rv" style="--i:3"><a class="btn" href="contact/">Get started</a><a class="btn ghost" href="#selected-work">See our work ↓</a></div></div>
<div class="device" id="device"><div class="dev-bar"><i></i><i></i><i></i><span>primo-mc.com</span></div><div class="dev-body"><aside><b>PRIMO</b><span class="on">Overview</span><span>Projects</span><span>Campaigns</span><span>Reports</span></aside><div class="dev-main"><div class="dev-h"><h3>Selected work</h3><small>Concept previews · Marketplace</small></div><div class="pts">__PANEL__</div></div></div></div>
</section>

<section class="band light cols" id="numbers" data-tone="light"><div class="wrap"><div class="tiles"><div class="rv"><span class="no">01</span><b data-count="10">0</b><small>Years of Experience</small></div><div class="rv" style="--i:1"><span class="no">02</span><b data-count="250">0</b><small>Projects Delivered*</small></div><div class="rv" style="--i:2"><span class="no">03</span><b data-count="50">0</b><small>Global Brands*</small></div><div class="rv" style="--i:3"><span class="no">04</span><b data-count="8" data-plain="1">0</b><small>Countries Served*</small></div></div></div>
<p class="marq-label">Trusted by brands across markets</p>
<div class="marq" aria-label="Featured PRIMO client brands"><div class="marq-track">__CHIPS__</div></div></section>

<section class="band dark stop" id="people" data-tone="dark"><div class="wrap stop-g"><div class="stop-l"><span class="eyebrow rv">Why PRIMO</span>
<h2 class="rv">Stop juggling agencies <span class="dim">that almost fit.</span></h2>
<p class="sub rv" style="--i:1">Most growing brands run on a patchwork of freelancers, agencies and tools. We replace it with one team, designed around how you actually grow.</p>
<div class="stop-n rv" style="--i:2"><div><b><span data-a="7" data-b="1">7</span></b><small>Vendors to manage</small></div><div><b><span data-a="7" data-b="1">7</span></b><small>Monthly invoices</small></div><div><b><span data-a="0/7" data-b="1/1">0/7</span></b><small>Accountable</small></div></div>
<div class="toggle rv" style="--i:3" role="tablist"><button class="on" data-mode="patch" role="tab" aria-selected="true">Patchwork</button><button data-mode="one" role="tab" aria-selected="false">With PRIMO</button><i></i></div></div>
<div class="stop-r" id="stopStage" data-mode="patch"><div class="patch">__PATCH__</div><div class="one"><img src="assets/favicon-192.png" alt="" width="48" height="48"><b>PRIMO</b><small>One team. One plan.</small><span>Strategy</span><span>Creative</span><span>Websites</span><span>Ads</span><span>AI</span></div></div></div></section>

<section class="band light" id="services" data-tone="light"><div class="wrap"><div class="shead"><span class="eyebrow rv">What we build</span><h2 class="rv">Five services, <span class="dim">done exceptionally well.</span></h2></div><div class="svgrid">__SVCS__</div></div></section>

<section class="band dark" id="selected-work" data-tone="dark"><div class="wrap"><div class="shead"><span class="eyebrow rv">Selected Work</span><h2 class="rv">Real brands. <span class="dim">Different worlds.</span></h2><p class="sub rv">Explore selected client brands across education, hospitality and lifestyle.</p></div><div class="wks">__WORK__</div><p class="rv" style="margin-top:38px"><a class="btn light" href="work/">Explore all client overviews ↗</a></p></div></section>

<section class="band dark proc" id="why" data-tone="dark"><div class="wrap proc-g"><div class="proc-l"><span class="eyebrow rv">How we work</span><h2 class="rv">Agencies keep you waiting.<br><span class="dim">We move with you.</span></h2><p class="sub rv" style="--i:1">A clear four-step process, so you always know what is happening, what comes next and how we measure success.</p><a class="btn light rv" style="--i:2" href="process/">See our process ↗</a></div>
<ol class="tl" id="tl"><li><span class="dot">01</span><h3>Discover</h3><p>Understand your goals and opportunities.</p></li><li><span class="dot">02</span><h3>Strategise</h3><p>Turn insights into a winning plan.</p></li><li><span class="dot">03</span><h3>Create</h3><p>Design and develop impactful solutions.</p></li><li><span class="dot">04</span><h3>Grow</h3><p>Measure, optimise and scale together.</p></li><u class="rail"><i></i></u></ol></div></section>

<section class="band light cities" id="studios" data-tone="light"><div class="wrap"><div class="shead"><span class="eyebrow rv">Studios</span><h2 class="rv">One team, <span class="dim">three cities.</span></h2><p class="sub rv">Strategy, creative and technology work side by side from Bangkok, Pattaya and Ho Chi Minh City, with every project in your language.</p></div>
<div class="cols3"><div class="rv"><span class="no">01</span><h3>Bangkok.</h3><p>Strategy, brand and client partnerships.</p></div><div class="rv" style="--i:1"><span class="no">02</span><h3>Pattaya.</h3><p>Creative production and campaigns.</p></div><div class="rv" style="--i:2"><span class="no">03</span><h3>Ho Chi Minh City.</h3><p>Websites, technology and automation.</p></div></div><p class="rv" style="margin-top:34px"><a class="lnk" href="about/">Meet PRIMO ↗</a></p></div></section>

<section class="band light orbit-s" id="orbit" data-tone="light"><div class="wrap"><div class="orbit rv"><div><span class="eyebrow">Our Technology</span><h2>Orbit: Your AI-Powered Marketing Partner.</h2><p>Orbit by PRIMO is our AI marketing concept, designed to help brands work smarter, move faster and achieve measurable growth.</p><a class="btn" href="technology/">Discover Orbit ↗</a></div>
<div class="dash" id="dash"><span class="sparkle">+32% ↗</span><div class="dash-top">Campaign Performance · Sample data</div><div class="kpis"><div><b data-count="2.4" data-dec="1" data-suffix="M">0</b><small>Demo Reach</small></div><div><b data-count="86" data-suffix="K">0</b><small>Demo Engagement</small></div><div><b data-count="18" data-prefix="+" data-suffix="%">0</b><small>Demo Conversion</small></div></div><div class="bars" aria-hidden="true">__BARS__</div><small class="note">Illustrative sample figures, not client results.</small></div></div></div></section>

<section class="band light eco-s" id="ecosystem" data-tone="light"><div class="wrap"><div class="shead"><span class="eyebrow rv">More ways to build with PRIMO.</span><h2 class="rv">One group. <span class="dim">Many doors.</span></h2><p class="sub rv">Explore digital products or step inside the client and staff workspace.</p></div>
<div class="eco"><a class="ecard rv" href="hub/"><span class="no">01</span><small>PRIMO / INSIGHTS</small><h3>PRIMO HUB</h3><p>Ideas, insights and practical thinking for brands ready to grow.</p><span class="go">↗</span></a>
<a class="ecard rv" style="--i:1" href="marketplace/"><span class="no">02</span><small>Digital products</small><h3>Marketplace</h3><p>Original website starters, UI ideas and design kits.</p><span class="go">↗</span></a>
<a class="ecard rv" style="--i:2" href="off-hours-club/"><span class="no">03</span><small>OFF THE CLOCK / BY PRIMO</small><h3>OFF HOURS CLUB</h3><p>Your time. Your terms. Discover our first clothing collection.</p><span class="go">↗</span></a>
<a class="ecard rv" style="--i:3" href="portal/login/"><span class="no">04</span><small>Clients &amp; team</small><h3>Portal</h3><p>Projects, approvals, files and invoices in one secure place.</p><span class="go">↗</span></a></div></div></section>

<section class="band dark cta-s" id="contact" data-tone="dark"><div class="wrap"><div class="cta"><span class="eyebrow rv">Let's Work Together</span><h2 class="rv">Ready to Grow Without Borders?</h2><p class="sub rv" style="--i:1">Tell us about your business and let's create what's next — together.</p><div class="cta-row rv" style="--i:2"><a class="btn light" href="contact/">Get in Touch ↗</a><a class="btn ghost" href="mailto:hello@primo-mc.com">hello@primo-mc.com</a></div></div></div></section>
</main>
<footer class="foot band dark" data-tone="dark"><div class="wrap"><div class="foot-top"><a class="logo" href="./"><img src="assets/favicon-48.png" alt="" width="30" height="30"><span>PRIMO GROUP</span></a><nav class="foot-links" aria-label="Footer">__NAV__</nav></div><small>© 2026 PRIMO Group · Interactive concept website. Client names, figures marked * and sample data should be verified before publication.</small></div></footer>
<aside class="fab" id="fab" aria-label="Contact"><img src="assets/favicon-48.png" alt="" width="28" height="28"><span>Have a project in mind?</span><a href="contact/">Get in Touch ↗</a></aside>
<script src="assets/translations.js" defer></script><script src="assets/home-v12.js" defer></script></body></html>'''
