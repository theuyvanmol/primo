"""PRIMO homepage (v13, dark): portfolio-card hero, sticky service showcase, scroll blur-in motion."""
from html import escape as esc

CARDS=[ # image, title, role, avatar focus
 ('products/velora/city.webp','Velora','Website template · Marketplace','60% 50%'),
 ('off-hours/campaign-v2.webp','Off Hours Club','Apparel brand concept','70% 40%'),
 ('products/auren/architecture.webp','Auren','Website template · Marketplace','55% 40%'),
 ('products/inkvoid/hero.webp','Ink Void','Portfolio template · Marketplace','50% 25%'),
 ('previews/northline/assets/hero.webp','Northline','Website template · Marketplace','60% 55%'),
 ('primo-global-hero-clean.webp','Global brand world','Concept imagery','35% 45%'),
 ('off-hours/after-hours-v2.webp','After Hours Tee','Off Hours Club · Apparel','50% 40%'),
 ('previews/northline/assets/vessel.webp','Northline Care','Lifestyle brand concept','45% 45%'),
]
SVC={
 'digital-marketing':dict(name='Digital Marketing',line='Turn insights into real growth across every digital channel.',tags=['Strategy','Social','Email','Analytics'],cover='off-hours/campaign-v2.webp',grid=['off-hours/collection.webp','off-hours/essentials.webp','off-hours/after-hours-v2.webp','products/velora/city.webp'],items=[('Campaign strategy','Goals, audience and channel plan'),('Social & content','Creative that fits each platform'),('Reporting','Clear numbers tied to goals')]),
 'website-development':dict(name='Website Development',line='High-performance websites built for business results.',tags=['Design','Development','Speed','Conversion'],cover='previews/northline/assets/hero.webp',grid=['products/auren/architecture.webp','previews/northline/assets/form.webp','products/inkvoid/hero.webp','previews/northline/assets/vessel.webp'],items=[('Design & build','Fast, accessible, on-brand'),('E-commerce','Stores that are simple to run'),('Care & growth','Updates, speed and tracking')]),
 'seo-content':dict(name='SEO & Content',line='Be found. Be chosen. Be ahead.',tags=['SEO','Content','Search','Authority'],cover='primo-global-hero-clean.webp',grid=['photo-1497366811353-6870744d04b2.jpg','photo-1519389950473-47ba0277781c.jpg','photo-1499951360447-b19be8fe80f5.webp','photo-1552664730-d307ca884978.jpg'],items=[('Search strategy','Keywords that match real intent'),('Content that ranks','Pages and articles worth reading'),('Technical SEO','Structure search engines can trust')]),
 'paid-advertising':dict(name='Advertising',line='Smarter ads. Bigger opportunities.',tags=['Paid social','Search ads','Creative','Reporting'],cover='photo-1519608487953-e999c86e7455.webp',grid=['photo-1529139574466-a303027c1d8b.webp','off-hours/essentials.webp','photo-1519608487953-e999c86e7455.webp','off-hours/campaign-v2.webp'],items=[('Paid social','Meta, TikTok and more'),('Search & display','Reach people who are looking'),('Optimisation','Test, learn and scale')]),
 'ai-automation':dict(name='AI Solutions',line='Innovative AI to unlock your next growth.',tags=['Automation','AI assistants','Workflows','Insights'],cover='photo-1531297484001-80022131f5a1.jpg',grid=['photo-1531297484001-80022131f5a1.jpg','photo-1558655146-9f40138edfeb.webp','primo-global-hero-clean.webp','photo-1499951360447-b19be8fe80f5.webp'],items=[('Marketing automation','Less manual work, faster follow-up'),('AI assistants','Helpful, on-brand and supervised'),('Insight dashboards','See what is working at a glance')]),
}
ORDER=['digital-marketing','website-development','seo-content','paid-advertising','ai-automation']
BARS=[38,56,44,72,60,88,70,96,64,80,92,100]

def card(i,c,strip=False):
    img,t,role,f=c
    return ('<a class="pc" style="--i:%d" href="marketplace/" tabindex="-1" aria-hidden="true"><span class="pc-img"><img src="assets/%s" alt="" loading="%s" decoding="async"></span><span class="pc-av"><img src="assets/%s" alt="" style="object-position:%s"></span><span class="pc-t"><b>%s</b><small>%s</small></span></a>')%(i,img,'lazy' if strip else 'eager',img,f,esc(t),esc(role))

def build(NAV,SERVICES,PROJECTS,client_art,SEO,FAVICONS,ANALYTICS,SCRIPT):
    nav=''.join('<a href="%s">%s</a>'%(r,n) for r,n in NAV)
    left=''.join(card(i,c) for i,c in enumerate(CARDS[:4]))
    right=''.join(card(i+4,c) for i,c in enumerate(CARDS[4:]))
    strip=''.join(card(i,c,True) for i,c in enumerate(CARDS))*2
    chips=''.join('<span class="chip">%s%s</span>'%(client_art(p['logo'],''),esc(p['name'])) for p in PROJECTS)*4
    caps=['Brand strategy','Websites','SEO & content','Paid advertising','AI automation','Social media','Analytics','Creative direction','E-commerce','Marketing technology']
    capchips=''.join('<span class="chip t">%s</span>'%esc(c) for c in caps)*2
    names={s['slug']:s for s in SERVICES}
    side='';panes=''
    for k,slug in enumerate(ORDER):
        d=SVC[slug]
        side+='<button class="sl" data-i="%d" aria-selected="%s">%s</button>'%(k,'true' if k==0 else 'false',esc(d['name']))
        grid=''.join('<span class="m m%d"><img src="assets/%s" alt="" loading="lazy" decoding="async"></span>'%(j,g) for j,g in enumerate(d['grid']))
        items=''.join('<div class="si"><span class="si-i">%s</span><span><b>%s</b><small>%s</small></span></div>'%('0%d'%(j+1),esc(a),esc(b)) for j,(a,b) in enumerate(d['items']))
        tags=''.join('<span>%s</span>'%esc(t) for t in d['tags'])
        stats=''.join('<div><b>%s</b><small>%s</small></div>'%(a,b) for a,b in [('Bangkok','Studio'),('Pattaya','Studio'),('Ho Chi Minh','Studio'),('EN · TH · VN','Languages')])
        panes+=('<div class="sp%s" data-i="%d"><div class="sp-top"><div class="sp-id"><span class="sp-av"><img src="assets/favicon-192.png" alt=""><i></i></span><div><h3>%s</h3><p class="handle">@primo.mc · PRIMO Group</p><p class="desc">%s</p><div class="stats4">%s</div></div></div><div class="sp-cover"><img src="assets/%s" alt="" loading="lazy" decoding="async"><div class="sp-tags">%s</div></div></div>'
                '<div class="sp-tabs"><a class="on" href="#selected-work">Work</a><a href="services/%s/">Services</a><a href="#why">Process</a><a href="about/">About</a></div>'
                '<div class="sp-body"><div class="masonry">%s</div><div class="sp-list"><div class="sp-lh"><span>What you get</span><a href="services/%s/">View all ↗</a></div>%s</div></div></div>')%(' on' if k==0 else '',k,esc(d['name']),esc(d['line']),stats,d['cover'],tags,slug,grid,slug,items)
    work=''
    for i,p in enumerate(PROJECTS):
        work+='<a class="wcard rv" style="--i:%d" href="work/%s/"><div class="wcover"><span class="big">%s</span></div><div class="wbody"><small>%s</small><h3>%s</h3><p>%s</p><span class="more">View overview <span>↗</span></span></div></a>'%(i,p['slug'],client_art(p['logo'],''),esc(p['sector']),esc(p['name']),esc(p['intro']))
    bars=''.join('<span style="--h:%d%%"></span>'%h for h in BARS)
    avatars=''.join('<span style="--o:%d"><img src="assets/%s" alt=""></span>'%(k,c[0]) for k,c in enumerate([CARDS[0],CARDS[1],CARDS[3],CARDS[4],CARDS[6]]))
    return TEMPLATE.replace('__FAV__',FAVICONS).replace('__SEO__',SEO).replace('__ANALYTICS__',ANALYTICS).replace('__NAV__',nav).replace('__LEFT__',left).replace('__RIGHT__',right).replace('__STRIP__',strip).replace('__CHIPS__',chips).replace('__CAPS__',capchips).replace('__SIDE__',side).replace('__PANES__',panes).replace('__WORK__',work).replace('__BARS__',bars).replace('__AVATARS__',avatars)

TEMPLATE='''<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0d0c0b">__FAV____SEO__<link rel="stylesheet" href="assets/fonts.css"><link rel="stylesheet" href="assets/thai.css"><link rel="stylesheet" href="assets/home-v12.css">__ANALYTICS__</head>
<body><a class="skip-link" href="#main">Skip to content</a>
<header class="hdr" id="hdr"><a class="logo" href="./" aria-label="PRIMO Group home"><img src="assets/favicon-48.png" alt="" width="30" height="30"><span>PRIMO</span></a>
<div class="hdr-r"><label class="lang language-picker"><select id="siteLanguage" aria-label="Language / ภาษา / Ngôn ngữ"><option value="en">EN</option><option value="th">TH</option><option value="vi">VN</option></select></label><a class="btn sm" href="contact/">Let's Talk ↗</a><button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu"><span></span><span></span><em>Menu</em></button></div></header>
<nav class="menu" id="menu" aria-label="Main navigation">__NAV__</nav>
<main id="main">
<section class="hero" id="home"><div class="cards cl" aria-hidden="true">__LEFT__</div><div class="cards cr" aria-hidden="true">__RIGHT__</div>
<div class="hero-c"><span class="pill"><i></i>International Digital Agency</span>
<h1><span class="l1">Grow your</span><span class="swap"><span class="words"><em>brand</em><em>website</em><em>story</em><em>business</em><em>brand</em></span><svg class="und" viewBox="0 0 220 14" preserveAspectRatio="none" aria-hidden="true"><path d="M3 9c40-8 84-8 120-4s64 3 94-1"/></svg></span><span class="l3">without borders.</span></h1>
<p class="lead">We combine creativity, technology and data to help ambitious brands grow across the world.</p>
<div class="tiles"><div><b data-count="10">0</b><small>Years of Experience</small></div><div><b data-count="250">0</b><small>Projects Delivered*</small></div><div><b data-count="50">0</b><small>Global Brands*</small></div><div><b data-count="8" data-plain="1">0</b><small>Countries Served*</small></div></div>
<a class="btn" href="contact/">Get started</a></div>
<div class="strip" aria-hidden="true"><div class="strip-t">__STRIP__</div></div>
<a class="down" href="#people">Scroll down<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 6 6 6 6-6M6 13l6 6 6-6"/></svg></a></section>

<section class="sec center" id="people"><div class="wrap narrow"><h2 class="rv">Growth is built by <span class="stack">__AVATARS__</span> people.</h2><p class="sub rv" style="--i:1">Tools don't build brands. Strategy, taste and trust do. That's why a partner who understands your market matters more than ever.</p></div></section>

<section class="show" id="services"><div class="show-in"><div class="wrap show-g"><div class="side" role="tablist" aria-label="Services">__SIDE__</div><div class="card" id="showCard">__PANES__</div></div></div></section>

<p class="marq-label">Trusted by brands across markets</p>
<div class="marq" aria-label="Featured PRIMO client brands"><div class="marq-track">__CHIPS__</div></div>

<section class="sec" id="selected-work"><div class="wrap"><div class="head rv"><div><span class="eyebrow">Selected Work</span><h2>Real brands. Different worlds.</h2></div><p>Explore selected client brands across education, hospitality and lifestyle.</p></div><div class="work">__WORK__</div><p class="rv" style="margin-top:34px;text-align:center"><a class="btn ghost" href="work/">Explore all client overviews ↗</a></p></div></section>

<section class="sec why" id="why"><div class="wrap">
<h2 class="center-h rv">Agencies keep you waiting.<br><b>We move with you.</b></h2>
<div class="row rv"><div class="vis cities" id="cities"><svg viewBox="0 0 360 220" aria-hidden="true"><path class="arc" d="M60 150 C 130 40, 230 40, 300 120"/><path class="arc a2" d="M60 150 C 140 190, 240 190, 300 120" /><circle class="n" cx="60" cy="150" r="9"/><circle class="n" cx="180" cy="62" r="9"/><circle class="n" cx="300" cy="120" r="9"/><circle class="p" cx="60" cy="150" r="9"/><circle class="p" cx="180" cy="62" r="9"/><circle class="p" cx="300" cy="120" r="9"/></svg><span class="c1">Bangkok</span><span class="c2">Pattaya</span><span class="c3">Ho Chi Minh City</span></div>
<div class="txt"><h3>One team, <em>three cities.</em></h3><p>Strategy, creative and technology work side by side from Bangkok, Pattaya and Ho Chi Minh City, with every project in your language.</p><a class="lnk" href="about/">Meet PRIMO ↗</a></div></div>
<div class="row rv rev"><div class="vis proc" id="proc"><div class="pr"><i></i><b>Discover</b><span>Understand your goals and opportunities.</span></div><div class="pr"><i></i><b>Strategise</b><span>Turn insights into a winning plan.</span></div><div class="pr"><i></i><b>Create</b><span>Design and develop impactful solutions.</span></div><div class="pr"><i></i><b>Grow</b><span>Measure, optimise and scale together.</span></div><div class="bar"><u></u></div></div>
<div class="txt"><h3>From insight <em>to impact.</em></h3><p>A clear four-step process, so you always know what is happening, what comes next and how we measure success.</p><a class="lnk" href="process/">See our process ↗</a></div></div>
</div></section>

<div class="marq rev" aria-hidden="true"><div class="marq-track">__CAPS__</div></div>

<section class="sec" id="orbit"><div class="wrap"><div class="orbit rv"><div style="position:relative"><span class="eyebrow">Our Technology</span><h2>Orbit: Your AI-Powered Marketing Partner.</h2><p>Orbit by PRIMO is our AI marketing concept, designed to help brands work smarter, move faster and achieve measurable growth.</p><a class="btn" href="technology/">Discover Orbit ↗</a></div>
<div class="dash" id="dash"><span class="sparkle">+32% ↗</span><div class="dash-top">Campaign Performance · Sample data</div><div class="kpis"><div><b data-count="2.4" data-dec="1" data-suffix="M">0</b><small>Demo Reach</small></div><div><b data-count="86" data-suffix="K">0</b><small>Demo Engagement</small></div><div><b data-count="18" data-prefix="+" data-suffix="%">0</b><small>Demo Conversion</small></div></div><div class="bars" aria-hidden="true">__BARS__</div><small class="note">Illustrative sample figures, not client results.</small></div></div></div></section>

<section class="sec" id="ecosystem"><div class="wrap"><div class="head rv"><div><span class="eyebrow">More ways to build with PRIMO.</span><h2>One group. Many doors.</h2></div><p>Explore digital products or step inside the client and staff workspace.</p></div>
<div class="eco"><a class="ecard rv" href="hub/"><div><small>PRIMO / INSIGHTS</small><h3>PRIMO HUB</h3><p>Ideas, insights and practical thinking for brands ready to grow.</p></div><span class="go">↗</span></a>
<a class="ecard rv" style="--i:1" href="marketplace/"><div><small>Digital products</small><h3>Marketplace</h3><p>Original website starters, UI ideas and design kits.</p></div><span class="go">↗</span></a>
<a class="ecard rv" style="--i:2" href="off-hours-club/"><div><small>OFF THE CLOCK / BY PRIMO</small><h3>OFF HOURS CLUB</h3><p>Your time. Your terms. Discover our first clothing collection.</p></div><span class="go">↗</span></a>
<a class="ecard rv" style="--i:3" href="portal/login/"><div><small>Clients &amp; team</small><h3>Portal</h3><p>Projects, approvals, files and invoices in one secure place.</p></div><span class="go">↗</span></a></div></div></section>

<section class="sec" id="contact"><div class="wrap"><div class="cta rv"><span class="eyebrow">Let's Work Together</span><h2>Ready to Grow Without Borders?</h2><p>Tell us about your business and let's create what's next — together.</p><div class="cta-row"><a class="btn" href="contact/">Get in Touch ↗</a><a class="btn ghost" href="mailto:hello@primo-mc.com">hello@primo-mc.com</a></div></div></div></section>
</main>
<footer class="foot"><div class="wrap"><div class="foot-top"><a class="logo" href="./"><img src="assets/favicon-48.png" alt="" width="30" height="30"><span>PRIMO GROUP</span></a><nav class="foot-links" aria-label="Footer">__NAV__</nav></div><small>© 2026 PRIMO Group · Interactive concept website. Client names, figures marked * and sample data should be verified before publication.</small></div></footer>
<script src="assets/translations.js" defer></script><script src="assets/home-v12.js" defer></script></body></html>'''
