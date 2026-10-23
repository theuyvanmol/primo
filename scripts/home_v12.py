"""PRIMO homepage (v14): editorial serif, framed motion hero, scroll-opening laptop, sticky geometric section."""
from html import escape as esc

SERVICES_COPY=[
 ('digital-marketing','Digital Marketing','Turn insights into real growth across every digital channel.'),
 ('website-development','Website Development','High-performance websites built for business results.'),
 ('seo-content','SEO & Content','Be found. Be chosen. Be ahead.'),
 ('paid-advertising','Advertising','Smarter ads. Bigger opportunities.'),
 ('ai-automation','AI Solutions','Innovative AI to unlock your next growth.'),
]
# geometric tile art: (col,row,shape,classes,rot1,rot2)
TILES=[(1,0,'quarter','a',90,180),(2,0,'circle','a',0,90),(3,0,'bowtie','c',90,0),
 (0,1,'tri','a',90,180),(1,1,'dots','c',0,90),(2,1,'half','b',180,90),(3,1,'sqsq','b',90,0),(4,1,'leaf','a',90,180),
 (0,2,'circle','b',0,0),(1,2,'stairs','a',90,180),(2,2,'circle2','b',0,90),(3,2,'circle','c',0,0),(4,2,'bowtie','a',90,0),
 (1,3,'tri','c',180,90),(2,3,'quarter','b',90,180),(3,3,'tri','a',0,90)]
def shape(kind,cls):
    f='class="f%s"'%cls
    return {
     'quarter':'<path %s d="M0 72V0A72 72 0 0 1 72 72Z"/>'%f,
     'circle':'<circle %s cx="36" cy="36" r="27"/>'%f,
     'circle2':'<circle %s cx="36" cy="36" r="30"/><circle class="fc" cx="36" cy="36" r="4"/>'%f,
     'bowtie':'<path %s d="M0 0H72L36 36 72 72H0L36 36Z"/>'%f,
     'tri':'<path %s d="M0 0V72H72Z"/>'%f,
     'dots':'<g %s><circle cx="20" cy="20" r="9"/><circle cx="52" cy="20" r="9"/><circle cx="20" cy="52" r="9"/><circle cx="52" cy="52" r="9"/></g>'%f,
     'half':'<path %s d="M0 36A36 36 0 0 1 72 36V72H0Z"/>'%f,
     'sqsq':'<rect class="fc" x="8" y="8" width="56" height="56"/><rect %s x="20" y="20" width="32" height="32"/>'%f,
     'leaf':'<path %s d="M0 72Q4 4 72 0Q68 68 0 72Z"/>'%f,
     'stairs':'<path %s d="M0 72V48H24V24H48V0H72V72Z"/>'%f,
    }[kind]
def art(prefix=''):
    out='<svg class="art" viewBox="0 0 360 288" role="img" aria-label="Abstract geometric artwork">'
    out+='<rect width="360" height="288" fill="none"/>'
    for c,r,k,cl,r1,r2 in TILES:
        out+='<g class="t" style="--x:%dpx;--y:%dpx;--r1:%ddeg;--r2:%ddeg"><rect class="bg" width="72" height="72"/>%s</g>'%(c*72,r*72,r1,r2,shape(k,cl))
    return out+'</svg>'

def build(NAV,SERVICES,PROJECTS,client_art,SEO,FAVICONS,ANALYTICS,SCRIPT):
    L=NAV[:5];R=NAV[5:-1];P=NAV[-1]
    navL=''.join('<a href="%s">%s</a>'%(r,n) for r,n in L)
    navR=''.join('<a href="%s">%s</a>'%(r,n) for r,n in R)
    menu=''.join('<a href="%s">%s</a>'%(r,n) for r,n in NAV)
    foot=menu
    cards=''
    for i,(slug,name,line) in enumerate(SERVICES_COPY):
        cards+='<a class="sc%s" style="--n:%d" href="services/%s/"><small>0%d</small><b>%s</b><span>%s</span></a>'%(' wide' if i==4 else '',i,slug,i+1,esc(name),esc(line))
    rows=''
    for i,p in enumerate(PROJECTS):
        rows+='<a class="wr rv" style="--i:%d" href="work/%s/"><span class="wn">0%d</span><span class="wt">%s</span><span class="ws">%s</span><span class="wl">%s</span><span class="wa">↗</span></a>'%(i,p['slug'],i+1,esc(p['name']),esc(p['sector']),client_art(p['logo'],''),)
    return TEMPLATE.replace('__FAV__',FAVICONS).replace('__SEO__',SEO).replace('__ANALYTICS__',ANALYTICS).replace('__NAVL__',navL).replace('__NAVR__',navR).replace('__PORTAL__','<a class="portal" href="%s">%s</a>'%P).replace('__MENU__',menu).replace('__FOOT__',foot).replace('__CARDS__',cards).replace('__ROWS__',rows).replace('__ART__',art()).replace('__ART2__',art())

TEMPLATE='''<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f5f5f5">__FAV____SEO__<link rel="stylesheet" href="assets/fonts.css"><link rel="stylesheet" href="assets/inter.css"><link rel="stylesheet" href="assets/lora.css"><link rel="stylesheet" href="assets/thai.css"><link rel="stylesheet" href="assets/home-v12.css">__ANALYTICS__</head>
<body><a class="skip-link" href="#main">Skip to content</a>
<header class="hdr" id="hdr"><nav class="hl" aria-label="Primary">__NAVL__</nav><a class="logo" href="./" aria-label="PRIMO Group home"><img src="assets/favicon-48.png" alt="" width="28" height="28"><span>PRIMO</span></a><div class="hr"><nav aria-label="Secondary">__NAVR__</nav><label class="lang language-picker"><select id="siteLanguage" aria-label="Language / ภาษา / Ngôn ngữ"><option value="en">EN</option><option value="th">TH</option><option value="vi">VN</option></select></label>__PORTAL__</div><button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu">Menu</button></header>
<nav class="menu" id="menu" aria-label="Main navigation">__MENU__</nav>
<main id="main">
<section class="hero" id="home"><div class="frame"><canvas id="silk" aria-hidden="true"></canvas><div class="grid3" aria-hidden="true"></div>
<div class="hero-t"><span class="eyebrow">International Digital Agency</span><h1>Growth<br>without borders.</h1><p>We combine creativity, technology and data to help ambitious brands grow across the world.</p><div class="hero-cta"><a class="btn" href="contact/">Let's Talk ↗</a><a class="btn ghost" href="work/">Explore Our Work</a></div></div>
<div class="hero-s"><div><b data-count="10">0</b><small>Years of Experience</small></div><div><b data-count="250">0</b><small>Projects Delivered*</small></div><div><b data-count="50">0</b><small>Global Brands*</small></div><div><b data-count="8" data-plain="1">0</b><small>Countries Served*</small></div></div></div></section>

<section class="lap-sec" id="services"><div class="lap-stage" id="lapStage"><div class="dots" aria-hidden="true"></div>
<svg class="orbits" viewBox="0 0 1000 1000" aria-hidden="true"><g class="o1"><circle cx="500" cy="500" r="470"/><circle class="dot" cx="500" cy="30" r="4"/><circle class="ring" cx="170" cy="168" r="14"/></g><g class="o2"><circle cx="500" cy="500" r="360"/><circle class="dot" cx="860" cy="500" r="4"/><rect class="sq" x="132" y="470" width="30" height="30" rx="4"/></g><g class="o3"><circle cx="500" cy="500" r="250"/><circle class="dot" cx="500" cy="750" r="4"/></g></svg>
<span class="fl f1" aria-hidden="true"></span><span class="fl f2" aria-hidden="true"></span><span class="fl f3" aria-hidden="true"></span>
<div class="lap-g"><div class="lap-l"><span class="eyebrow">PRIMO Group · Services</span><h2>Digital growth for a borderless world.</h2><p class="lede">Specialising in strategy, websites and AI.</p><div class="scs">__CARDS__</div></div>
<div class="lap-r"><div class="persp"><div class="shadow"></div><div class="lap" id="lap"><div class="deck"><div class="kb"></div><div class="pad"></div></div><div class="lid"><div class="cover"></div><div class="screen"><div class="scr-art">__ART2__</div><div class="scr-t"><i>PRIMO / SERVICES</i><b>Strategy, creativity and technology in one place.</b><u></u><u></u><u></u></div></div></div></div></div></div></div></div></section>

<section class="ai" id="orbit"><div class="ai-stage" id="aiStage"><div class="ai-g"><div class="ai-art" data-step="0" id="aiArt">__ART__</div>
<div class="ai-t"><span class="eyebrow">Our Technology · Orbit</span><h2>Your AI-powered marketing partner.</h2><p>Orbit by PRIMO is our AI marketing concept, designed to help brands work smarter, move faster and achieve measurable growth.</p>
<div class="steps" id="aiSteps"><button class="st on" data-i="0"><b>Plan smarter</b><span>Turn audience and campaign insights into a clear plan, so every channel works toward the same goal.</span></button><button class="st" data-i="1"><b>Create faster</b><span>Draft, adapt and schedule content with assistants that stay on-brand and under your supervision.</span></button><button class="st" data-i="2"><b>See it all in one place</b><span>Your campaigns and your numbers on one dashboard, so you always know where things stand.</span></button></div>
<a class="btn light" href="technology/">Discover Orbit ↗</a><small class="note">Concept shown with illustrative data.</small></div></div></div></section>

<section class="work" id="selected-work"><div class="wrap"><div class="sh rv"><span class="eyebrow">Selected Work</span><h2>Real brands. Different worlds.</h2><p>Explore selected client brands across education, hospitality and lifestyle.</p></div><div class="wl-list">__ROWS__</div><p class="rv" style="margin-top:40px"><a class="btn ghost dk" href="work/">Explore all client overviews ↗</a></p></div></section>

<section class="proc" id="process"><div class="wrap"><div class="sh rv"><span class="eyebrow">Our Process</span><h2>From insight to impact.</h2></div><div class="steps4" id="steps4"><div class="line"><i></i></div>
<div class="s4 rv"><b>01</b><h3>Discover</h3><p>Understand your goals and opportunities.</p></div><div class="s4 rv" style="--i:1"><b>02</b><h3>Strategise</h3><p>Turn insights into a winning plan.</p></div><div class="s4 rv" style="--i:2"><b>03</b><h3>Create</h3><p>Design and develop impactful solutions.</p></div><div class="s4 rv" style="--i:3"><b>04</b><h3>Grow</h3><p>Measure, optimise and scale together.</p></div></div></div></section>

<section class="eco" id="ecosystem"><div class="wrap"><div class="sh rv"><span class="eyebrow">More ways to build with PRIMO.</span><h2>One group. Many doors.</h2></div>
<a class="er rv" href="hub/"><small>PRIMO / INSIGHTS</small><b>PRIMO HUB</b><span>Ideas, insights and practical thinking for brands ready to grow.</span><i>↗</i></a>
<a class="er rv" href="marketplace/"><small>Digital products</small><b>Marketplace</b><span>Original website starters, UI ideas and design kits.</span><i>↗</i></a>
<a class="er rv" href="off-hours-club/"><small>OFF THE CLOCK / BY PRIMO</small><b>OFF HOURS CLUB</b><span>Your time. Your terms. Discover our first clothing collection.</span><i>↗</i></a>
<a class="er rv" href="portal/login/"><small>Clients &amp; team</small><b>Portal</b><span>Projects, approvals, files and invoices in one secure place.</span><i>↗</i></a></div></section>

<section class="cta" id="contact"><div class="wrap"><span class="eyebrow">Let's Work Together</span><h2 class="rv">Ready to grow without borders?</h2><p class="rv" style="--i:1">Tell us about your business and let's create what's next — together.</p><div class="hero-cta rv" style="--i:2"><a class="btn" href="contact/">Get in Touch ↗</a><a class="btn ghost" href="mailto:hello@primo-mc.com">hello@primo-mc.com</a></div></div></section>
</main>
<footer class="foot"><div class="wrap"><div class="foot-top"><a class="logo" href="./"><img src="assets/favicon-48.png" alt="" width="28" height="28"><span>PRIMO GROUP</span></a><nav class="foot-links" aria-label="Footer">__FOOT__</nav></div><small>© 2026 PRIMO Group · Interactive concept website. Client names, figures marked * and sample data should be verified before publication.</small></div></footer>
<script src="assets/translations.js" defer></script><script src="assets/home-v12.js" defer></script></body></html>'''
