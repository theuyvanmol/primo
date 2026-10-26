"""PRIMO homepage (v15): Fastwork x Curate. Flying hero cards, Orbit app demo, sticky showcase, sticky notes, animated service/work visuals."""
from html import escape as esc
import pathlib,sys
sys.path.insert(0,str(pathlib.Path(__file__).parent))
from orbit_ui import orbit_ui

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
# flying hero cards: x% , y% , rotation, fly-out dx, dy, extra rotation
POS=[(2,10,-6,-520,-60,-14),(14,2,4,-380,-220,10),(3,46,5,-560,40,-12),(15,40,-4,-300,180,8),
     (80,6,5,520,-80,12),(70,16,-5,360,-200,-10),(82,48,-4,560,60,12),(70,52,6,300,200,-8)]
NOTES=[('#b3efbd',-4,'I use 3 different agencies for ads, SEO and the website.'),('#d3bdff',2,'The campaign report arrived three weeks late.'),
       ('#ffafa3',-2,'Nobody can tell me what the budget actually did.'),('#ffe299',4,'Every agency needs the same brief again.'),
       ('#b3f4ef',-3,'How do I know the website will convert?'),('#cfd8d3',-8,'Another quotation to wait for…'),('#d3bdff',7,'I hate surprise invoices…')]

def fcard(i,c):
    img,t,role,f=c;x,y,r,dx,dy,rr=POS[i]
    return ('<span class="fc" style="--x:%d%%;--y:%d%%;--r:%d;--dx:%d;--dy:%d;--rr:%d;--i:%d"><span class="fc-img"><img src="assets/%s" alt="" loading="eager" decoding="async"></span><span class="fc-t"><span class="fc-av"><img src="assets/%s" alt="" style="object-position:%s"></span><b>%s</b><small>%s</small></span></span>')%(x,y,r,dx,dy,rr,i,img,img,f,esc(t),esc(role))

def svc_vis(slug):
    if slug=='digital-marketing':
        return ('<span class="dg hub"><i class="core">PRIMO</i><i class="n n1">Social</i><i class="n n2">Email</i><i class="n n3">Search</i><i class="n n4">Ads</i><i class="n n5">Data</i>'
                '<svg viewBox="0 0 300 180" aria-hidden="true"><path d="M150 90 L48 36"/><path d="M150 90 L252 36"/><path d="M150 90 L40 138"/><path d="M150 90 L262 138"/><path d="M150 90 L150 18"/></svg></span>')
    if slug=='website-development':
        return ('<span class="dg web"><span class="wb"><i></i><i></i><i></i></span><span class="wh"></span><span class="wl l1"></span><span class="wl l2"></span><span class="wc"><i></i><i></i><i></i></span><span class="wbtn"></span></span>')
    if slug=='seo-content':
        return ('<span class="dg seo"><span class="sq"><em>best marketing agency</em></span><span class="sr r1"><b>#1</b>primo-mc.com</span><span class="sr r2"><b>#2</b>agency-two.com</span><span class="sr r3"><b>#3</b>agency-three.com</span></span>')
    if slug=='paid-advertising':
        return ('<span class="dg ads"><span class="ad a1"><i></i><b></b></span><span class="ad a2"><i></i><b></b></span><span class="ad a3"><i></i><b></b><em>ROAS 4.2x</em></span></span>')
    return ('<span class="dg ai"><span class="st s1"><u></u>New enquiry received</span><span class="st s2"><u></u>Added to CRM</span><span class="st s3"><u></u>Reply drafted by AI</span><span class="st s4"><u></u>Team notified</span></span>')

def wk_vis(i,logo):
    k=i%4
    if k==0:
        return '<span class="wv fun"><span class="fs"><b>Enquiry</b><i></i></span><span class="fs"><b>Trial class</b><i></i></span><span class="fs"><b>Enrolled</b><i></i></span><span class="fav"><u></u><u></u><u></u></span></span>'
    if k==1:
        return '<span class="wv diary"><b>Friday · Tables</b>'+''.join('<i style="--d:%d"></i>'%n for n in range(12))+'</span>'
    if k==2:
        return '<span class="wv book"><span class="bk b1"><b>Custom sleeve</b><small>Booked</small></span><span class="bk b2"><b>Aftercare kit</b><small>Paid</small></span><span class="bk b3"><b>Consultation</b><small>Confirmed</small></span></span>'
    return '<span class="wv trip"><i class="t1"></i><i class="t2"></i><i class="t3"></i><i class="t4"></i><u></u><b>Stay</b><b>Play</b><b>Dine</b><b>Return</b></span>'

def build(NAV,SERVICES,PROJECTS,client_art,SEO,FAVICONS,ANALYTICS,SCRIPT):
    keep={'Services','Our Work','Process','About'}
    pill=''.join('<a href="%s">%s</a>'%(r,n) for r,n in NAV if n in keep)
    nav=''.join('<a href="%s">%s</a>'%(r,n) for r,n in NAV)
    fl=''.join(fcard(i,c) for i,c in enumerate(CARDS))
    chips=''.join('<span class="chip">%s%s</span>'%(client_art(p['logo'],''),esc(p['name'])) for p in PROJECTS)*4
    avatars=''.join('<span style="--o:%d"><img src="assets/%s" alt=""></span>'%(k,c[0]) for k,c in enumerate([CARDS[0],CARDS[1],CARDS[3],CARDS[4],CARDS[6]]))
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
    svcs=''
    for k,slug in enumerate(ORDER):
        d=SVC[slug]
        tags=''.join('<span>%s</span>'%esc(t) for t in d['tags'])
        svcs+=('<a class="sv rv%s" style="--i:%d" href="services/%s/"><span class="sv-img">%s</span><span class="sv-no">0%d</span><h3>%s</h3><p>%s</p><span class="sv-tags">%s</span><span class="sv-go">View all ↗</span></a>')%(' inv' if k==0 else '',k%3,slug,svc_vis(slug),k+1,esc(d['name']),esc(d['line']),tags)
    work=''
    for i,p in enumerate(PROJECTS):
        work+=('<a class="wk rv" href="work/%s/"><span class="wk-top"><span class="wk-logo%s">%s</span><h3>%s</h3><span class="wk-sec">%s</span></span><span class="wk-body"><span class="wk-txt"><small>%s</small><p>%s</p><span class="more">View overview <span>↗</span></span></span><span class="wk-vis" aria-hidden="true">%s</span></span></a>')%(p['slug'],' dk' if p['logo']=='geisha-asia' else '',client_art(p['logo'],''),esc(p['name']),esc(p['sector']),'0%d'%(i+1),esc(p['intro']),wk_vis(i,p['logo']))
    notes=''.join('<span class="nt" style="--c:%s;--r:%d;--n:%d"><span>%s</span></span>'%(c,r,i,esc(t)) for i,(c,r,t) in enumerate(NOTES))
    patch=''.join('<span class="pc" style="--x:%d%%;--y:%d%%;--r:%sdeg;--d:%d"><b>%s</b><small>%s</small><i>Extra cost</i></span>'%(x,y,r,k,esc(a),esc(b)) for k,(a,b,x,y,r) in enumerate([('SEO freelancer','Separate brief',4,6,-6),('Ad agency','Separate invoice',52,0,5),('Web developer','Separate login',0,38,4),('Social media freelancer','Separate brief',46,33,-5),('Brand studio','Separate invoice',8,68,-4),('Analytics tool','Separate login',54,66,6)]))
    return (TEMPLATE.replace('__FAV__',FAVICONS).replace('__SEO__',SEO).replace('__ANALYTICS__',ANALYTICS)
        .replace('__NAV__',nav).replace('__PILL__',pill).replace('__ENTER__',EN_SECTION).replace('__FLY__',fl).replace('__CHIPS__',chips)
        .replace('__AVATARS__',avatars).replace('__SIDE__',side).replace('__PANES__',panes).replace('__SVCS__',svcs).replace('__WORK__',work)
        .replace('__NOTES__',notes).replace('__PATCH__',patch).replace('__ORBIT_HERO__',orbit_ui(False)).replace('__ORBIT_SEC__',orbit_ui(True)))

EN_SECTION=(pathlib.Path(__file__).with_name('enter_section.html').read_text() if pathlib.Path(__file__).with_name('enter_section.html').exists() else '')

TEMPLATE=pathlib.Path(__file__).with_name('home_template.html').read_text()
