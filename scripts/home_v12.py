"""PRIMO homepage (v12): marketplace-style layout with scroll motion. Called from build_pages.py."""
from html import escape as esc

SVC_COPY={
 'digital-marketing':('Digital Marketing','Turn insights into real growth across every digital channel.','◫',['Strategy','Social','Email','Analytics']),
 'website-development':('Website Development','High-performance websites built for business results.','⌘',['Design','Development','Speed','Conversion']),
 'seo-content':('SEO & Content','Be found. Be chosen. Be ahead.','⌕',['SEO','Content','Search','Authority']),
 'paid-advertising':('Advertising','Smarter ads. Bigger opportunities.','↗',['Paid social','Search ads','Creative','Reporting']),
 'ai-automation':('AI Solutions','Innovative AI to unlock your next growth.','✧',['Automation','AI assistants','Workflows','Insights']),
}
BARS=[38,56,44,72,60,88,70,96]

def build(NAV,SERVICES,PROJECTS,client_art,SEO,FAVICONS,ANALYTICS,SCRIPT):
    nav=''.join('<a href="'+r+'">'+n+'</a>' for r,n in NAV)
    foot=''.join('<a href="'+r+'">'+n+'</a>' for r,n in NAV)
    def art(logo):return client_art(logo,'')
    float_cards=''
    for i,p in enumerate(PROJECTS[:4],1):
        float_cards+='<a class="fcard fc%d" href="work/%s/" data-depth="%d"><span class="av">%s</span><span><b>%s</b><small>%s</small></span><span class="dot"></span></a>'%(i,p['slug'],10+i*6,art(p['logo']),esc(p['name'].split(' & ')[0]),esc(p['sector']))
    chips=''.join('<span class="chip">%s%s</span>'%(art(p['logo']),esc(p['name'])) for p in PROJECTS)
    chips=chips*4
    caps=['Brand strategy','Websites','SEO & content','Paid advertising','AI automation','Social media','Analytics','Creative direction','E-commerce','Marketing technology']
    tagchips=''.join('<span class="chip t">%s</span>'%esc(c) for c in caps)*2
    tabs='';panes=''
    for i,s in enumerate(SERVICES):
        name,line,icon,tags=SVC_COPY.get(s['slug'],(s['name'],'',  '◆',[]))
        on=i==0
        tabs+='<button class="tab" role="tab" id="t%d" aria-selected="%s" aria-controls="p%d" data-i="%d"><i>%s</i>%s<small>0%d</small></button>'%(i,'true' if on else 'false',i,i,icon,esc(name),i+1)
        bars=''.join('<b style="--h:%d%%;animation-delay:%dms"></b>'%(h,k*70) for k,h in enumerate(BARS))
        panes+='<div class="pane%s" role="tabpanel" id="p%d" aria-labelledby="t%d"><h3>%s</h3><p>%s</p><div class="tags">%s</div><a class="btn" href="services/%s/">Learn more ↗</a><div class="mini" aria-hidden="true">%s</div></div>'%(' on' if on else '',i,i,esc(name),esc(line),''.join('<span>%s</span>'%esc(t) for t in tags),s['slug'],bars)
    work=''
    for p in PROJECTS:
        work+='<a class="wcard rv" href="work/%s/"><div class="wcover"><span class="big">%s</span><span class="wlogo">%s</span></div><div class="wbody"><small>%s</small><h3>%s</h3><p>%s</p><span class="more">View overview <span>↗</span></span></div></a>'%(p['slug'],art(p['logo']),art(p['logo']),esc(p['sector']),esc(p['name']),esc(p['intro']))
    bars=''.join('<span style="--h:%d%%"></span>'%h for h in BARS+[64,80,92,100])
    return f'''<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f6f0e7">{FAVICONS}{SEO}<link rel="stylesheet" href="assets/fonts.css"><link rel="stylesheet" href="assets/thai.css"><link rel="stylesheet" href="assets/home-v12.css">{ANALYTICS}</head>
<body><a class="skip-link" href="#main">Skip to content</a>
<header class="hdr" id="hdr"><div class="hdr-in"><a class="logo" href="./" aria-label="PRIMO Group home"><img src="assets/favicon-48.png" alt="" width="30" height="30"><span>PRIMO</span></a><nav class="navlinks" id="primaryNav" aria-label="Main navigation">{nav}</nav><label class="lang language-picker"><select id="siteLanguage" aria-label="Language / ภาษา / Ngôn ngữ"><option value="en">EN</option><option value="th">TH</option><option value="vi">VN</option></select></label><a class="btn sm" href="contact/">Contact Us ↗</a><button class="nav-menu-toggle" type="button" aria-expanded="false" aria-controls="primaryNav">Menu</button></div></header>
<main id="main">
<section class="hero" id="home"><div class="wrap hero-grid"><div>
<span class="pill"><i></i>International Digital Agency</span>
<h1><span class="ln"><span>Growth</span></span><span class="ln"><span>Without</span></span><span class="ln"><span><em>Borders.</em></span></span></h1>
<p class="lead">We combine creativity, technology and data to help ambitious brands grow across the world.</p>
<div class="cta-row"><a class="btn" href="contact/">Let's Talk ↗</a><a class="btn ghost" href="work/">Explore Our Work</a></div>
<div class="scroll-cue"><span></span>Scroll to explore</div></div>
<div class="stage" id="stage"><div class="stage-img"><img src="assets/primo-global-hero-clean.webp" alt="Connected global brand imagery" width="1431" height="1099" fetchpriority="high"></div>{float_cards}<div class="badge"><span>BANGKOK · PATTAYA · HO CHI MINH</span></div></div></div>
<div class="wrap"><div class="stats" id="stats">
<div class="stat rv"><b data-count="10">0</b><span>Years of Experience</span></div>
<div class="stat rv" style="--i:1"><b data-count="250">0</b><span>Projects Delivered*</span></div>
<div class="stat rv" style="--i:2"><b data-count="50">0</b><span>Global Brands*</span></div>
<div class="stat rv" style="--i:3"><b data-count="8" data-plain="1">0</b><span>Countries Served*</span></div></div></div></section>

<p class="marq-label">Trusted by brands across markets</p>
<div class="marq" aria-label="Featured PRIMO client brands"><div class="marq-track">{chips}</div></div>

<section class="sec" id="services"><div class="wrap"><div class="sec-head rv"><div><span class="eyebrow">What We Do</span><h2>Digital Growth for a Borderless World.</h2></div><p>PRIMO Group is a full-service digital agency helping brands grow through strategy, creativity, technology and data — across any market, anywhere in the world.</p></div>
<div class="svc rv"><div class="tabs" role="tablist" aria-label="Services">{tabs}</div><div class="panel">{panes}</div></div></div></section>

<div class="marq rev" aria-hidden="true"><div class="marq-track">{tagchips}</div></div>

<section class="sec" id="selected-work"><div class="wrap"><div class="sec-head rv"><div><span class="eyebrow">Selected Work</span><h2>Real brands. Different worlds.</h2></div><p>Explore selected client brands across education, hospitality and lifestyle.</p></div>
<div class="work">{work}</div><p class="rv" style="margin-top:34px;text-align:center"><a class="btn ghost" href="work/">Explore all client overviews ↗</a></p></div></section>

<section class="sec" id="process"><div class="wrap"><div class="sec-head rv"><div><span class="eyebrow">Our Process</span><h2>From Insight to Impact.</h2></div></div>
<div class="proc rv" id="proc"><div class="line"><i></i></div>
<div class="step"><div class="n">01</div><h3>Discover</h3><p>Understand your goals and opportunities.</p></div>
<div class="step"><div class="n">02</div><h3>Strategise</h3><p>Turn insights into a winning plan.</p></div>
<div class="step"><div class="n">03</div><h3>Create</h3><p>Design and develop impactful solutions.</p></div>
<div class="step"><div class="n">04</div><h3>Grow</h3><p>Measure, optimise and scale together.</p></div></div></div></section>

<section class="sec" id="orbit" style="padding-top:20px"><div class="wrap"><div class="orbit rv"><div style="position:relative"><span class="eyebrow">Our Technology</span><h2>Orbit: Your AI-Powered Marketing Partner.</h2><p>Orbit by PRIMO is our AI marketing concept, designed to help brands work smarter, move faster and achieve measurable growth.</p><a class="btn light" href="technology/">Discover Orbit ↗</a></div>
<div class="dash" id="dash"><span class="sparkle">+32% ↗</span><div class="dash-top"><span>Campaign Performance · Sample data</span></div><div class="kpis"><div><b data-count="2.4" data-dec="1" data-suffix="M">0</b><small>Demo Reach</small></div><div><b data-count="86" data-suffix="K">0</b><small>Demo Engagement</small></div><div><b data-count="18" data-prefix="+" data-suffix="%">0</b><small>Demo Conversion</small></div></div><div class="bars" aria-hidden="true">{bars}</div><small class="note">Illustrative sample figures, not client results.</small></div></div></div></section>

<section class="sec" style="padding-top:20px" id="ecosystem"><div class="wrap"><div class="sec-head rv"><div><span class="eyebrow">More ways to build with PRIMO.</span><h2>One group. Many doors.</h2></div><p>Explore digital products or step inside the client and staff workspace.</p></div>
<div class="eco"><a class="ecard e1 rv" href="hub/"><div><small>PRIMO / INSIGHTS</small><h3>PRIMO HUB</h3><p>Ideas, insights and practical thinking for brands ready to grow.</p></div><span class="go">↗</span></a>
<a class="ecard e2 rv" style="--i:1" href="marketplace/"><div><small>Digital products</small><h3>Marketplace</h3><p>Original website starters, UI ideas and design kits.</p></div><span class="go">↗</span></a>
<a class="ecard e3 rv" style="--i:2" href="off-hours-club/"><div><small>OFF THE CLOCK / BY PRIMO</small><h3>OFF HOURS CLUB</h3><p>Your time. Your terms. Discover our first clothing collection.</p></div><span class="go">↗</span></a>
<a class="ecard e4 rv" style="--i:3" href="portal/login/"><div><small>Clients &amp; team</small><h3>Portal</h3><p>Projects, approvals, files and invoices in one secure place.</p></div><span class="go">↗</span></a></div></div></section>

<section class="sec" style="padding-top:20px" id="contact"><div class="wrap"><div class="cta rv"><span class="eyebrow">Let's Work Together</span><h2>Ready to Grow Without Borders?</h2><p>Tell us about your business and let's create what's next — together.</p><div class="cta-row"><a class="btn light" href="contact/">Get in Touch ↗</a><a class="btn ghost" style="color:#fff;border-color:#fff" href="mailto:hello@primo-mc.com">hello@primo-mc.com</a></div></div></div></section>
</main>
<footer class="foot"><div class="wrap"><div class="foot-top"><a class="logo" href="./"><img src="assets/favicon-48.png" alt="" width="30" height="30"><span>PRIMO GROUP</span></a><nav class="foot-links" aria-label="Footer">{foot}</nav></div><small>© 2026 PRIMO Group · Interactive concept website. Client names, figures marked * and sample data should be verified before publication.</small></div></footer>
<script src="assets/translations.js" defer></script><script src="assets/home-v12.js" defer></script>
<script>{SCRIPT}</script></body></html>'''
