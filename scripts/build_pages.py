#!/usr/bin/env python3
"""Generate PRIMO's static content pages and SEO files. No third-party packages required."""
from pathlib import Path
from datetime import date
from html import escape as esc
import argparse,json,re,shutil,hashlib
from urllib.parse import urlparse
from site_content import SERVICES,PROJECTS,ARTICLES
ROOT=Path(__file__).resolve().parents[1]
CONFIG=ROOT/'site-config.json'
def lazy_images(html):
 n=[0]
 def f(m):
  n[0]+=1;tag=m.group(0)
  if n[0]<=1 or 'loading=' in tag or 'hero' in tag or '\\"' in tag:return tag
  return tag[:-1].rstrip('/')+' loading="lazy" decoding="async">'
 return re.sub(r'<img\b[^>]*>',f,html)
def stamp_assets(html):
 html=lazy_images(html)
 def stamp(m):
  asset=m.group(2);local=ROOT/asset[asset.index('assets/'):]
  if not local.is_file():return m.group(0)
  return m.group(1)+'="'+asset+'?v='+hashlib.sha256(local.read_bytes()).hexdigest()[:10]+'"'
 return re.sub(r'(href|src)="([^"?]*assets/[^"?]+\.(?:css|js))(?:\?[^" ]*)?"',stamp,html)

parser=argparse.ArgumentParser();parser.add_argument('--base-url');args=parser.parse_args()
config=json.loads(CONFIG.read_text()) if CONFIG.exists() else {'base_url':'https://primo-group-v11-recovered.vanmol7.chatgpt.site/','name':'PRIMO Group','email':'theuy.vanmol@primo-mc.com'}
if args.base_url:
 u=urlparse(args.base_url)
 if u.scheme!='https' or not u.netloc or u.query or u.fragment:raise SystemExit('Use an HTTPS base URL without a query or fragment.')
 config['base_url']=args.base_url.rstrip('/')+'/'
CONFIG.write_text(json.dumps(config,indent=2)+'\n')
BASE=config['base_url'];TODAY=date.today().isoformat();SM={v['slug']:v for v in SERVICES}
LEGACY=ROOT/'scripts'/'home_legacy.html'
V12=(ROOT/'scripts'/'home_v12.py').exists()
home=(LEGACY if (V12 and LEGACY.exists()) else ROOT/'index.html').read_text()
# Capture original styles once; URLs are relative to the shared assets directory.
styles='\n'.join(re.findall(r'<style[^>]*>(.*?)</style>',home,re.S));styles=styles.replace("url('assets/","url('").replace('url("assets/','url("')
(ROOT/'assets/site-base.css').write_text(styles)
FAVICONS='<link rel="icon" href="/assets/favicon.ico" sizes="any"><link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png"><link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16.png"><link rel="icon" type="image/png" sizes="192x192" href="/assets/favicon-192.png"><link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">'
def AGENT_TAG(prefix,path):
 if not config.get('elevenlabs_agent_id') or path.startswith('portal'):return ''
 return '<script src="'+prefix+'assets/agent.js" data-agent="'+esc(config['elevenlabs_agent_id'],quote=True)+'" defer></script>'

ANALYTICS='<script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments);};</script><script defer src="/_vercel/insights/script.js"></script>'
SUPABASE_CDN='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js'
NAV=[('services/','Services'),('work/','Our Work'),('hub/','PRIMO HUB'),('marketplace/','Marketplace'),('off-hours-club/','OFF HOURS CLUB'),('technology/','Technology'),('process/','Process'),('about/','About'),('contact/','Contact'),('portal/login/','Portal')]
header=re.search(r'<header\b.*?</header>',home,re.S).group()
footer=re.search(r'<footer\b.*?</footer>',home,re.S).group()
member=re.search(r'<dialog class="member-dialog".*?</dialog>',home,re.S).group()
# Make member triggering independent of the old anchor-only navigation.
mjs=ROOT/'assets/member-demo.js';ms=mjs.read_text();ms=ms.replace("document.querySelector('header.nav .navright a[href=\"#contact\"]')","document.querySelector('[data-member-trigger]')");mjs.write_text(ms)

def pref(path):return '../'*len([x for x in path.split('/') if x])
def link(prefix,route):return prefix+route if route else (prefix or './')
def paragraph(text):return '<p>'+esc(text)+'</p>'
def prose(sections):return ''.join('<h2>'+esc(t)+'</h2>'+paragraph(v) for t,v in sections)
def breadcrumb(path,label):
 parts=[('Home','')]
 if path.startswith('services/') and path!='services/':parts.append(('Services','services/'))
 if path.startswith('work/') and path!='work/':parts.append(('Our Work','work/'))
 if path.startswith('hub/') and path!='hub/':parts.append(('PRIMO Hub','hub/'))
 parts.append((label,path));prefix=pref(path)
 visible='<nav aria-label="Breadcrumb"><ol class="page-breadcrumbs">'+''.join('<li>'+('<a href="'+link(prefix,r)+'">'+esc(n)+'</a>' if i<len(parts)-1 else '<span aria-current="page">'+esc(n)+'</span>')+('</li><li aria-hidden="true">/</li>' if i<len(parts)-1 else '</li>') for i,(n,r) in enumerate(parts))+'</ol></nav>'
 structured={'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':i+1,'name':n,'item':BASE+r} for i,(n,r) in enumerate(parts)]}
 return visible,structured

def navigation(path):
 prefix=pref(path);h=header
 h=re.sub(r'<button class="logo replay-logo"[^>]*>(.*?)</button>',lambda m:'<a class="logo replay-logo" href="'+link(prefix,'')+'" aria-label="PRIMO Group home">'+m[1]+'</a>',h,count=1,flags=re.S)
 h=re.sub(r'<nav class="navlinks".*?</nav>','<nav class="navlinks" id="primaryNav" aria-label="Main navigation">'+''.join('<a href="'+link(prefix,r)+'"'+(' aria-current="page"' if path==r or (r in ['services/','hub/','work/'] and path.startswith(r)) else '')+'>'+n+'</a>' for r,n in NAV)+'</nav>',h,count=1,flags=re.S)
 h=re.sub(r'<label class="lang language-picker">.*?</label>','',h,count=1,flags=re.S)
 h=h.replace('href="#contact"','href="'+link(prefix,'contact/')+'"').replace('href="contact/"','href="'+link(prefix,'contact/')+'"').replace(' data-member-trigger','')
 h=h.replace('href="assets/','href="'+prefix+'assets/').replace('src="assets/','src="'+prefix+'assets/')
 return h

def foot(path):
 prefix=pref(path);f=footer
 f=re.sub(r'<div class="footlinks">.*?</div>','<div class="footlinks">'+''.join('<a href="'+link(prefix,r)+'">'+n+'</a>' for r,n in NAV)+'</div>',f,count=1,flags=re.S)
 f=f.replace('href="#home"','href="'+link(prefix,'')+'"').replace('href="assets/','href="'+prefix+'assets/').replace('src="assets/','src="'+prefix+'assets/')
 f=f.replace('© 2026 PRIMO Group · Interactive concept','© 2026 PRIMO Group')
 return f+'<div class="page-foot"><div class="wrap"><span>Strategy. Creativity. Technology.</span><span>Thailand · Vietnam · International projects</span></div></div>'

def cta(prefix,title='Ready to move your brand forward?'):
 return '<section class="page-bottom-cta"><div class="wrap"><div><h2>'+esc(title)+'</h2><p>Tell us what you are building and where you want to go next.</p></div><a class="page-cta" href="'+link(prefix,'contact/')+'">Let’s talk <span aria-hidden="true">↗</span></a></div></section>'

def section(title,body,light=False,kicker=''):
 return '<section class="page-section'+(' light' if light else '')+'"><div class="wrap">'+('<div class="page-kicker">'+esc(kicker)+'</div>' if kicker else '')+'<h2>'+esc(title)+'</h2>'+body+'</div></section>'

def service_cards(prefix,items=SERVICES):
 return '<div class="page-grid">'+''.join('<article class="page-card page-reveal"><div class="page-card-number">PRIMO / '+str(i+1).zfill(2)+'</div><h3>'+esc(v['name'])+'</h3>'+paragraph(v['intro'])+'<a class="page-card-link" href="'+link(prefix,'services/'+v['slug']+'/')+'">Explore '+esc(v['name'])+' <span aria-hidden="true">↗</span></a></article>' for i,v in enumerate(items))+'</div>'

def faq(items):return '<div class="page-faq">'+''.join('<details><summary>'+esc(q)+'</summary>'+paragraph(a)+'</details>' for q,a in items)+'</div>'

def client_art(slug,prefix):
 m=json.loads((ROOT/'assets/clients/logos.json').read_text())[slug];x,y,w,h=m['box']
 return f'<svg class="page-client-art" viewBox="{x} {y} {w} {h}" role="img" aria-label="{esc(m["label"],quote=True)}"><image width="{m["width"]}" height="{m["height"]}" href="{prefix}assets/clients/{m["file"]}"/></svg>'

def project_cards(prefix,items=PROJECTS):
 return '<div class="page-grid two">'+''.join('<article class="page-card page-reveal"><div class="page-card-number">'+esc(v['sector'].upper())+'</div>'+client_art(v['logo'],prefix)+'<h3>'+esc(v['name'])+'</h3>'+paragraph(v['intro'])+'<a class="page-card-link" href="'+link(prefix,'work/'+v['slug']+'/')+'">Explore the client overview <span aria-hidden="true">↗</span></a></article>' for v in items)+'</div>'

def article_cards(prefix,items=ARTICLES):
 return '<div class="page-grid">'+''.join('<article class="page-card page-reveal" data-topic="'+a['topic']+'"><figure><img src="'+prefix+'assets/'+a['image']+'" alt="'+{'strategy':'Team planning a marketing strategy','websites':'A desk with a laptop and creative materials','insights':'A team reviewing work together'}[a['topic']]+'" width="800" height="533" loading="lazy"></figure><div class="page-card-number">'+a['topic'].upper()+'</div><h3>'+esc(a['title'])+'</h3>'+paragraph(a['intro'])+'<a class="page-card-link" href="'+link(prefix,'hub/'+a['slug']+'/')+'">Read the guide <span aria-hidden="true">↗</span></a></article>' for a in items)+'</div>'

PAGES=[]
def page(path,title,description,h1,intro,body,image='primo-global-hero-clean.png',kicker='PRIMO GROUP',extra=None,label=None):
 PAGES.append(dict(path=path,title=title,description=description,h1=h1,intro=intro,body=body,image=image,kicker=kicker,extra=extra or {},label=label or h1))

page('services/','Digital Marketing, Web Design & SEO Services | PRIMO Group','Explore PRIMO Group services: digital marketing, website development, SEO, Google and Meta advertising, and AI workflow planning in Thailand and Vietnam.','Connected services. Clearer growth.','Strategy, creative and technology work best when they share a direction. Explore the services that connect your brand with the next stage of growth.',
 section('One connected plan', '<div class="page-columns"><p class="page-lead">Build a marketing system around the way your audience discovers, understands and chooses your brand.</p><div class="page-prose">'+paragraph('A brand can have good content, advertising and a website without those parts working together. PRIMO brings them into the same conversation. We begin with the business objective and the customer journey, then identify which services will make the most useful difference.')+paragraph('The starting point can be focused: a clearer website, a content plan, a campaign or a reporting workflow. The wider view helps make that investment fit the next stage rather than creating another isolated task.')+'</div></div>',True)+section('Explore our services',service_cards('../'))+section('How we scope the work', '<div class="page-list">'+''.join('<div class="page-list-item"><span>'+n+'</span><div><h3>'+t+'</h3>'+paragraph(d)+'</div></div>' for n,t,d in [('01','Understand the objective','We clarify the audience, business goal, current constraints and what the team can support.'),('02','Prioritise the right combination','We choose services around the customer journey rather than assuming every brand needs the same package.'),('03','Agree the deliverables and review','The scope defines what will be produced, who approves it and how the team will assess progress.')])+'</div>')+cta('../'),kicker='STRATEGY / CREATIVE / TECHNOLOGY',label='Services')

for v in SERVICES:
 path='services/'+v['slug']+'/';prefix=pref(path)
 content=section(v['lead'],'<div class="page-prose">'+prose(v['sections'])+'</div>',True)+section('What the scope can include','<div class="page-columns"><div>'+paragraph(v['fit'])+'</div><ul class="page-checklist">'+''.join('<li>'+esc(x)+'</li>' for x in v['deliverables'])+'</ul></div>')+section('Questions before we begin',faq(v['faq']))+section('Connect the next part of the journey',service_cards(prefix,[x for x in SERVICES if x['slug']!=v['slug']][:2]))+cta(prefix)
 page(path,v['title'],v['description'],v['name'],v['intro'],content,image=v['image'],kicker='PRIMO SERVICES',extra={'service':True},label=v['name'])

page('work/','Our Work: Education, Hospitality & Lifestyle Brands | PRIMO','Explore PRIMO client overviews across education, hospitality, tattoo culture and destinations, including British Learning Centre, Geisha and KONG.','Different worlds. One creative approach.','Explore selected client brands and the marketing perspectives that connect strategy, creativity and digital experience.',section('Selected client overviews',project_cards('../'))+section('Built around the brand’s world','<div class="page-columns"><p class="page-lead">A learning centre, a restaurant and a lifestyle product need different stories.</p><div class="page-prose">'+paragraph('What they share is the need for a clear connection between the brand and the customer’s next decision. We look at the audience, the experience being offered and the information that helps someone act.')+paragraph('Our work brings content, design, websites and campaigns into that context. Explore the client overviews to see how those priorities change across education, dining, destinations and tattoo culture.')+'</div></div>',True)+section('Explore the service behind the experience',service_cards('../',SERVICES[:3]))+cta('../'),image='photo-1529139574466-a303027c1d8b.jpg',kicker='SELECTED CLIENT BRANDS',label='Our Work')
for v in PROJECTS:
 path='work/'+v['slug']+'/';prefix=pref(path)
 content=section(v['name'],'<div class="page-columns"><div>'+client_art(v['logo'],prefix)+'<div class="page-kicker">'+esc(v['sector'])+'</div></div><div class="page-prose">'+prose(v['paragraphs'])+'</div></div>')+section('The priorities behind the experience','<ul class="page-checklist">'+''.join('<li>'+esc(t)+'</li>' for t in v['priorities'])+'</ul>',True)+section('Relevant PRIMO services',service_cards(prefix,[SM[k] for k in v['services']]))+cta(prefix,'Build a clearer experience for your brand.')
 page(path,v['name']+' — Client Overview | PRIMO Group','Explore PRIMO’s '+v['sector'].lower()+' marketing perspective for '+v['name']+', connecting brand storytelling, useful content and digital journeys.',v['name'],v['intro'],content,image={'Education':'photo-1519389950473-47ba0277781c.jpg','Restaurants & hospitality':'photo-1497366811353-6870744d04b2.jpg','Lifestyle & tattoo culture':'photo-1558655146-9f40138edfeb.jpg','Resort & golf hospitality':'photo-1571896349842-33c89424de2d.jpg'}[v['sector']],kicker=v['sector'].upper(),label=v['name'])

filters='<div class="hub-filter" hidden aria-label="Filter Hub articles">'+''.join('<button type="button" data-hub-filter="'+k+'" aria-pressed="'+('true' if k=='all' else 'false')+'">'+v+'</button>' for k,v in [('all','All insights'),('strategy','Strategy'),('websites','Websites'),('insights','Reporting')])+'</div><p class="page-contact-note" id="hubResults" role="status" aria-live="polite"></p>'
page('hub/','PRIMO Hub: Marketing Strategy, Websites & Insights','Read practical PRIMO Hub guides on brand strategy, website enquiry journeys and marketing reporting for lifestyle, hospitality and service businesses.','Ideas with somewhere to go.','Practical thinking on strategy, websites and marketing. Written to help you ask better questions and make the next decision clearer.',section('Explore the latest guides',filters+article_cards('../'))+section('From an idea to a useful next step','<div class="page-columns"><p class="page-lead">Good advice should change what you do next.</p><div class="page-prose">'+paragraph('The PRIMO Hub brings together short, practical guides for teams building a stronger brand and digital presence. Each article begins with a question a business can use, then connects it with the decisions behind the marketing work.')+paragraph('Use the guides to prepare a brief, review an existing website or bring more clarity to a reporting conversation. When you need to turn the thinking into a project, our services connect the strategy with the creative and technical work.')+'</div></div>',True)+cta('../','Turn the next idea into a stronger experience.'),image='photo-1519389950473-47ba0277781c.jpg',kicker='PRIMO HUB / INSIGHTS',label='PRIMO Hub')
for a in ARTICLES:
 path='hub/'+a['slug']+'/';prefix=pref(path)
 body='<section class="page-section"><div class="wrap"><article class="page-article"><div class="article-meta"><span>By PRIMO Group</span><time datetime="'+TODAY+'">'+TODAY+'</time><span>'+a['topic'].title()+'</span></div>'+prose(a['sections'])+'<h2>Put the thinking into practice</h2>'+paragraph('Explore the related PRIMO service to see how the approach can become a practical project scope.')+'<a class="page-cta" href="'+link(prefix,'services/'+a['related']+'/')+'">'+esc(SM[a['related']]['name'])+' ↗</a></article></div></section>'+section('Keep exploring',article_cards(prefix,[x for x in ARTICLES if x['slug']!=a['slug']]))+cta(prefix)
 page(path,a['seo'],a['description'],a['title'],a['intro'],body,image=a['image'],kicker='PRIMO HUB / '+a['topic'].upper(),extra={'article':True},label=a['title'])

page('technology/','Marketing Technology & Orbit AI Concept | PRIMO Group','Explore PRIMO’s approach to marketing technology, analytics and automation, plus the Orbit AI platform concept and its current demo capabilities.','Technology with a human purpose.','Connect the tools, information and workflows that help your team do better work. Start with the problem, then design the system around it.',section('Meet Orbit','<div class="page-columns"><div><div class="page-kicker">ORBIT / BY PRIMO</div><h3>A more connected view of marketing.</h3>'+paragraph('Orbit is PRIMO’s marketing-platform concept: an environment for bringing tasks, reporting and team workflows closer together.')+'</div><div class="page-prose">'+paragraph('The interface shown on this website uses sample data. It is a conversation starter for the working environment a team might need, rather than a live connection to social, advertising or commerce accounts.')+paragraph('A production setup needs defined data sources, access, integrations and human responsibilities. Those choices belong in a real implementation scope, with testing before the team relies on the workflow.')+'</div></div>',True)+section('Where technology earns its place','<div class="page-grid">'+''.join('<article class="page-card page-reveal"><h3>'+t+'</h3>'+paragraph(d)+'</article>' for t,d in [('Reporting','Bring the right information together so the team can understand activity, context and the next action.'),('Workflow','Make repeated tasks easier to follow, with clear ownership and visible handovers between people and tools.'),('Content support','Use technology to support research, planning and drafts while keeping context, judgement and approval with people.')])+'</div>')+section('A practical path to an integration','<div class="page-prose">'+paragraph('We start by mapping the current process and identifying the points where information is duplicated, delayed or lost. The next step is a bounded pilot with a clear owner and an output the team can evaluate.')+paragraph('Useful technology should be maintainable. We consider how permissions, review, documentation and exception handling fit the workflow. The aim is a system that the team can understand and improve, not a hidden process that only its creator can operate.')+'</div>')+section('Explore AI and automation',service_cards('../',[SM['ai-automation']]))+cta('../','Find the workflow worth improving first.'),image='photo-1531297484001-80022131f5a1.jpg',kicker='TECHNOLOGY / ORBIT',label='Technology')

steps=[('01','Discover','Understand what the business needs before choosing what to make.','We begin with the audience, the offer and the current experience. We look at the existing website, content, campaigns and customer journey to understand what is already working and where the gaps are. The outcome is a shared brief with a clear objective, useful constraints and the questions the project needs to answer.'),('02','Strategise','Turn the findings into a practical direction.','We define the message, priorities and role of each touchpoint. This might include the site structure, a content direction, a campaign plan or a workflow map. The strategy connects the creative work with the intended customer action. Deliverables, approvals and a review rhythm are agreed so the team understands how the project will move.'),('03','Create','Make the brand and the journey work together.','Design, content and development take shape around the agreed direction. We review the work as an experience rather than separate outputs: the ad should fit the landing page, the website should support the message and the content should help the audience understand the offer. Feedback is organised around the brief and the decisions that matter.'),('04','Grow','Use the work, learn from it and improve what comes next.','After launch, the focus moves to observation and refinement. We review agreed measures, collect useful feedback and identify the next priority. A campaign may need new creative, a website may need a clearer page or a workflow may need a better handover. Growth comes from a repeatable cycle of useful action and informed review.')]
page('process/','Our Process: Discover, Strategise, Create & Grow | PRIMO','See how PRIMO connects discovery, strategy, creative production and ongoing improvement for marketing, website and digital transformation projects.','From insight to impact.','A clear process gives ambitious ideas a practical route into the world. Here is how we connect the brief, the work and the learning that follows.',section('Four stages. One shared direction.','<div class="page-list">'+''.join('<article class="page-list-item page-reveal"><span>'+n+'</span><div><h3>'+t+'</h3><p class="page-lead">'+lead+'</p>'+paragraph(d)+'</div></article>' for n,t,lead,d in steps)+'</div>')+section('What makes collaboration work','<div class="page-columns"><p class="page-lead">Clear decisions are as important as creative ideas.</p><div class="page-prose">'+paragraph('We agree who contributes, who approves and which information is needed at each stage. A useful brief, a shared source of feedback and a realistic review rhythm help keep the work moving.')+paragraph('The scope can be focused or ongoing. What matters is that the team understands the next decision, the reason behind it and the responsibilities on both sides. That creates room for a stronger creative result without losing the practical details.')+'</div></div>',True)+cta('../','Bring us the challenge you want to solve.'),image='photo-1552664730-d307ca884978.jpg',kicker='OUR PROCESS',label='Process')

page('about/','About PRIMO Group: Lifestyle & Digital Marketing Agency','Meet PRIMO Group, connecting strategy, creativity and technology for lifestyle, hospitality and service brands across Thailand, Vietnam and international projects.','Made for culture. Built for growth.','PRIMO Group connects strategy, creativity and technology for brands with ambition. We bring a lifestyle perspective to the practical work of digital growth.',section('A creative view of a connected world','<div class="page-columns"><p class="page-lead">The way people discover a brand is connected to the way they live.</p><div class="page-prose">'+paragraph('A restaurant is an occasion. A resort is an experience. A learning service is a decision a family cares about. A lifestyle product belongs to a wider culture. We begin with that context, then connect it with the messaging, content and digital experience the audience needs.')+paragraph('PRIMO brings together marketing strategy, content, websites, search, advertising and technology planning. The goal is a coherent experience: recognisable enough to earn attention and clear enough to help someone take the next step.')+'</div></div>',True)+section('Rooted in the region. Open to the world.','<div class="page-columns"><div><div class="page-region"><strong>Bangkok</strong><span>Thailand</span></div><div class="page-region"><strong>Pattaya</strong><span>Thailand</span></div><div class="page-region"><strong>Ho Chi Minh City</strong><span>Vietnam</span></div></div><div class="page-prose">'+paragraph('Our working perspective connects Thailand and Vietnam with international client projects. That regional context informs how we think about language, audience expectations and the practical differences between markets.')+paragraph('English, Thai and Vietnamese content planning can support those journeys. We choose the language and channel mix around the intended audience, rather than assuming that one message should be repeated everywhere.')+'</div></div>')+section('What we value in the work','<div class="page-grid">'+''.join('<article class="page-card page-reveal"><h3>'+t+'</h3>'+paragraph(d)+'</article>' for t,d in [('Clarity','A strong idea should be understandable. We make the offer, the journey and the next action clear.'),('Character','Brand identity should be recognisable in the details: the image, the language, the movement and the feeling.'),('Connection','Creative, media and technology should work towards the same business objective instead of competing for attention.')])+'</div>')+cta('../'),kicker='ABOUT PRIMO GROUP',label='About')

contact_form='''<form class="page-contact-form" id="pageContactForm" method="post" action="/api/contact" novalidate data-sitekey="__RECAPTCHA_KEY__"><label>Your name<input name="name" required autocomplete="name" maxlength="120"></label><label>Business email<input type="email" name="email" required autocomplete="email" maxlength="254"></label><label>Company<input name="company" autocomplete="organization" maxlength="160"></label><label>What would you like to discuss?<select name="service"><option>A connected marketing plan</option><option>Website design and development</option><option>SEO and content</option><option>Paid advertising</option><option>AI and automation</option><option>Something else</option></select></label><label>Tell us about your project<textarea name="message" required minlength="10" maxlength="5000"></textarea></label><div class="hp" aria-hidden="true"><label>Leave this field empty<input name="website" tabindex="-1" autocomplete="off"></label></div><label class="page-check"><input type="checkbox" name="marketing" value="yes"><span>I agree to receive marketing emails from PRIMO Group, such as news, offers and insights. I can unsubscribe at any time.</span></label><div class="page-captcha" id="contactCaptcha"></div><button class="page-cta" type="submit">Send your enquiry ↗</button><p class="page-contact-note">Your message is sent securely to the PRIMO team. We only use your details to reply to your enquiry, and to send marketing emails if you tick the box above.</p><p class="page-contact-note" role="status" aria-live="polite" id="contactFormStatus"></p></form>'''
contact_form=contact_form.replace('__RECAPTCHA_KEY__',config.get('recaptcha_site_key',''))
page('contact/','Contact PRIMO Group | Discuss Your Marketing or Website Project','Contact PRIMO Group about digital marketing, website development, SEO, advertising and creative projects in Thailand, Vietnam and international markets.','Let’s make the next move.','Tell us about your brand, the challenge and where you want to go. A useful first conversation starts with the context.',section('Start with your project','<div class="page-columns"><div><div class="page-prose">'+paragraph('Share what you are building, who you want to reach and what needs to change. If you already have a website, brief or campaign, include the relevant link in your message.')+paragraph('You do not need every answer before getting in touch. A clear description of the business and the decision ahead is enough to begin.')+'<p><a href="mailto:theuy.vanmol@primo-mc.com">theuy.vanmol@primo-mc.com ↗</a></p></div><div class="page-region"><strong>Thailand & Vietnam</strong><span>Bangkok · Pattaya · Ho Chi Minh City</span></div></div>'+contact_form+'</div>')+section('What helps us understand the brief','<div class="page-grid">'+''.join('<article class="page-card"><h3>'+t+'</h3>'+paragraph(d)+'</article>' for t,d in [('The objective','What would you like the marketing or website to help the business achieve?'),('The audience','Who are you trying to reach, and which markets or languages matter?'),('The context','What already exists, what is changing and when does the work need to be ready?')])+'</div>',True)+section('Explore the member experience','<div class="page-prose">'+paragraph('You can preview the PRIMO member interface using Google, email or phone options. This is a demonstration: no account is created and no email or SMS is sent.')+'<button class="page-secondary" type="button" data-member-trigger>Preview sign-up ↗</button></div>'),image='photo-1497366811353-6870744d04b2.jpg',kicker='CONTACT / NEW PROJECTS',extra={'contact':True},label='Contact')

from commerce_content import register_commerce
commerce_cart_dialog=register_commerce(globals())
from off_hours_content import register_off_hours
register_off_hours(globals())

# Page-specific metadata is written into the HTML rather than injected by JavaScript.
def metadata(path,title,description,image,extra=None):
 url=BASE+path;extra=extra or {};org={'@type':'Organization','@id':BASE+'#organization','name':'PRIMO Group','alternateName':'PRIMO-MC','url':BASE,'logo':BASE+'assets/brand/black.webp','email':config['email'],'contactPoint':{'@type':'ContactPoint','contactType':'customer service','email':config['email'],'availableLanguage':['English','Thai','Vietnamese']},'areaServed':[{'@type':'Country','name':'Thailand'},{'@type':'Country','name':'Vietnam'}]}
 web={'@type':'WebPage','@id':url+'#webpage','url':url,'name':title,'description':description,'inLanguage':'en','isPartOf':{'@id':BASE+'#website'},'about':{'@id':BASE+'#organization'}}
 graph=[org,{'@type':'WebSite','@id':BASE+'#website','name':'PRIMO Group','url':BASE,'publisher':{'@id':BASE+'#organization'}},web]
 if path:graph.append(breadcrumb(path,extra.get('label',title))[1])
 if extra.get('product'):
  product=extra['product'];graph.append({'@type':'CreativeWork','name':product['name'],'description':product['description'],'genre':product['category'],'url':url,'creator':{'@id':BASE+'#organization'},'isAccessibleForFree':True})
 if extra.get('service'):graph.append({'@type':'Service','@id':url+'#service','name':extra.get('label',title),'description':description,'provider':{'@id':BASE+'#organization'},'url':url,'areaServed':[{'@type':'Country','name':'Thailand'},{'@type':'Country','name':'Vietnam'}]})
 if extra.get('article'):graph.append({'@type':'Article','@id':url+'#article','headline':extra.get('label',title),'description':description,'datePublished':TODAY,'dateModified':TODAY,'author':{'@type':'Organization','name':'PRIMO Group','url':BASE},'publisher':{'@id':BASE+'#organization'},'mainEntityOfPage':{'@id':url+'#webpage'},'image':[BASE+'assets/'+image]})
 return '<title>'+esc(title)+'</title><meta name="description" content="'+esc(description,quote=True)+'"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="'+esc(url,quote=True)+'"><meta property="og:type" content="'+('article' if extra.get('article') else 'website')+'"><meta property="og:site_name" content="PRIMO Group"><meta property="og:locale" content="en_GB"><meta property="og:title" content="'+esc(title,quote=True)+'"><meta property="og:description" content="'+esc(description,quote=True)+'"><meta property="og:url" content="'+esc(url,quote=True)+'"><meta property="og:image" content="'+BASE+'assets/'+image+'"><meta property="og:image:alt" content="PRIMO Group — strategy, creativity and technology"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="'+esc(title,quote=True)+'"><meta name="twitter:description" content="'+esc(description,quote=True)+'"><meta name="twitter:image" content="'+BASE+'assets/'+image+'"><script type="application/ld+json">'+json.dumps({'@context':'https://schema.org','@graph':graph},ensure_ascii=False).replace('</','<\\/')+'</script>'

manifest=[]
for v in PAGES:
 path=v['path'];prefix=pref(path);crumb,_=breadcrumb(path,v['label']);ex={**v['extra'],'label':v['label']}
 hero='<section class="page-hero"><div class="wrap">'+crumb+'<div class="page-hero-layout"><div><p class="page-kicker">'+esc(v['kicker'])+'</p><h1>'+esc(v['h1'])+'</h1><p class="page-intro">'+esc(v['intro'])+'</p>'+(('<div class="page-buttons"><a class="page-cta" href="'+link(prefix,'contact/')+'">Discuss your project ↗</a><a class="page-secondary" href="'+link(prefix,'services/')+'">Explore services</a></div>') if path not in ['contact/','services/'] else '')+'</div><div class="page-hero-image"><img src="'+prefix+'assets/'+v['image']+'" alt="'+{'primo-global-hero-clean.png':'Connected globe above a city skyline','photo-1519389950473-47ba0277781c.jpg':'A team collaborating around a table','photo-1529139574466-a303027c1d8b.jpg':'Editorial fashion and lifestyle photography','photo-1571896349842-33c89424de2d.jpg':'Resort hospitality setting','photo-1497366811353-6870744d04b2.jpg':'A contemporary creative working space','photo-1499951360447-b19be8fe80f5.jpg':'A desk with a laptop and creative materials','photo-1552664730-d307ca884978.jpg':'A group discussing a project','photo-1558655146-9f40138edfeb.jpg':'Creative design materials','photo-1531297484001-80022131f5a1.jpg':'A laptop in a technology workspace'}.get(v['image'],'PRIMO creative and digital experience')+'" width="1000" height="1050" fetchpriority="high"><span class="page-image-caption">PRIMO / STRATEGY · CREATIVE · TECHNOLOGY</span></div></div></div></section>'
 if v['extra'].get('visual'):hero=re.sub(r'<div class="page-hero-image">.*?</div>','<div class="page-hero-image">'+v['extra']['visual']+'</div>',hero,count=1,flags=re.S)
 if v['extra'].get('compact'):hero='<section class="portal-banner"><div class="wrap">'+crumb+'<div class="page-kicker">'+esc(v['kicker'])+'</div><h1>'+esc(v['h1'])+'</h1><p>'+esc(v['intro'])+'</p></div></section>'
 if v['extra'].get('ohc'):hero=''
 head='<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#11110f">'+FAVICONS+metadata(path,v['title'],v['description'],v['image'],ex)+''.join('<link rel="stylesheet" href="'+prefix+'assets/'+file+'">' for file in ['fonts.css','inter.css','thai.css','site-base.css','member-demo.css','primo-hub.css','immersive.css','pages.css','commerce.css','portal.css','liquid-glass.css'])
 if not v['extra'].get('ohc') and not path.startswith('portal'):head+='<link rel="stylesheet" href="'+prefix+'assets/inter-display.css"><link rel="stylesheet" href="'+prefix+'assets/curate.css">'
 if v['extra'].get('ohc'):head+='<link rel="stylesheet" href="'+prefix+'assets/off-hours.css">'
 if v['extra'].get('private'):head=head.replace('content="index,follow,max-image-preview:large"','content="noindex,follow"')
 # Generated pages use actual page routes and work without JS for content/navigation.
 doc='<!doctype html><html lang="en-GB"><head>'+head+ANALYTICS+'</head><body class="page-shell'+(' ohc-page' if v['extra'].get('ohc') else (' curate' if not path.startswith('portal') else ''))+'"><a class="skip-link" href="#main">Skip to content</a><div id="pageProgress" aria-hidden="true"></div>'+navigation(path)+'<main id="main">'+hero+v['body']+'</main>'+foot(path)
 if v['extra'].get('contact'):doc+=member.replace('href="assets/','href="'+prefix+'assets/').replace('src="assets/','src="'+prefix+'assets/')+'<script src="'+prefix+'assets/member-demo.js" defer></script>'
 if v['extra'].get('commerce'):doc+=commerce_cart_dialog(prefix)
 if v['extra'].get('commerce') or v['extra'].get('portal'):
  if v['extra'].get('portal'):doc+='<script src="'+SUPABASE_CDN+'" defer></script>'+''.join('<script src="'+prefix+'assets/'+f+'" defer></script>' for f in ['portal-config.js','portal-app.js'])
  else:doc+=''.join('<script src="'+prefix+'assets/'+f+'" defer></script>' for f in ['catalogue.js','workspace-state.js','marketplace.js'])
 if v['extra'].get('ohc'):doc+='<script src="'+prefix+'assets/off-hours.js" defer></script>'
 doc+='<script src="'+prefix+'assets/pages.js" defer></script><script src="'+prefix+'assets/liquid-glass.js" defer></script>'+('' if v['extra'].get('ohc') or path.startswith('portal') else '<script src="'+prefix+'assets/curate.js" defer></script>')+AGENT_TAG(prefix,path)+'</body></html>'
 dest=ROOT/path/'index.html';dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(stamp_assets(doc))
 manifest.append({'path':path,'title':v['title'],'description':v['description'],'h1':v['h1'],'indexable':not v['extra'].get('private',False),'type':'article' if v['extra'].get('article') else 'service' if v['extra'].get('service') else 'page'})

# Homepage routing: preserve section anchors for in-page calls to action, but give tabs real pages.
newnav='<nav class="navlinks" id="primaryNav" aria-label="Main navigation">'+''.join('<a href="'+r+'">'+n+'</a>' for r,n in NAV)+'</nav>'
home=re.sub(r'<nav class="navlinks".*?</nav>',newnav,home,count=1,flags=re.S)
home=home.replace('<a class="btn" href="#contact">Contact Us ↗</a>','<a class="btn" href="contact/" data-member-trigger>Contact Us ↗</a>')
home=home.replace('<a class="btn" href="contact/">Contact Us ↗</a>','<a class="btn" href="contact/" data-member-trigger>Contact Us ↗</a>')
# Wire service cards without relying on JS.
service_section=re.search(r'<section[^>]*id="services".*?</section>',home,re.S)
if service_section:
 part=service_section.group();i=iter(SERVICES)
 part=re.sub(r'<a href="[^"]+" class="service glass reveal">',lambda m:'<a href="services/'+next(i)['slug']+'/" class="service glass reveal">',part)
 home=home[:service_section.start()]+part+home[service_section.end():]
# Full Hub route, with the existing dialog kept in the source as a backwards-compatible component.
home=re.sub(r'<button class="primo-split-link"[^>]*id="openPrimoHub"[^>]*>(.*?)</button>',r'<a class="primo-split-link" href="hub/">\1</a>',home,flags=re.S)
home=home.replace('class="primo-split-link" href="#work"','class="primo-split-link" href="work/"')
home=home.replace('<a href="#work">Discover our work','<a href="work/">Discover our work')
# Replace illustrative portfolio numbers with linked, named client entries.
work=re.search(r'<section[^>]*id="work".*?</section>',home,re.S)
if work:
 cards=''
 for i,v in enumerate(PROJECTS[:3]):
  cards+='<a class="workcard'+(' small' if i else '')+'" href="work/'+v['slug']+'/"><span class="pill">'+esc(v['sector'].upper())+'</span>'+client_art(v['logo'],'')+'<h3>'+esc(v['name'])+' ↗</h3><p>'+esc(v['intro'])+'</p></a>'
 replacement='<section id="work" class="section dark"><div class="wrap"><div class="sectionhead reveal"><div><div class="eyebrow">Selected Work</div><h2>Real brands.<br><span class="serif">Different worlds.</span></h2></div><p>Explore selected client brands across education, hospitality and lifestyle.</p></div><div class="workgrid">'+cards+'</div><p style="margin-top:28px"><a class="primo-split-link" href="work/">Explore all client overviews ↗</a></p></div></section>'
 home=home[:work.start()]+replacement+home[work.end():]
# Remove the browser-save comment and add a clean page-specific SEO block.
home=re.sub(r'<!-- saved from url=.*?-->','',home)
home=re.sub(r'<!-- PRIMO SEO START -->.*?<!-- PRIMO SEO END -->','',home,flags=re.S)
home=re.sub(r'<title>.*?</title>','',home,count=1,flags=re.S)
home=home.replace('</head>','<!-- PRIMO SEO START -->'+metadata('','PRIMO Group | Lifestyle & Digital Marketing Agency','PRIMO Group connects strategy, creative content, websites, SEO and advertising for lifestyle, hospitality and service brands in Thailand, Vietnam and beyond.','primo-global-hero-clean.png')+'<!-- PRIMO SEO END --></head>')
# Footer links go to full pages. Keep the language switcher and existing home interactions.
f=re.search(r'<footer\b.*?</footer>',home,re.S)
if f:
 changed=re.sub(r'<div class="footlinks">.*?</div>','<div class="footlinks">'+''.join('<a href="'+r+'">'+n+'</a>' for r,n in NAV)+'</div>',f.group(),count=1,flags=re.S)
 home=home[:f.start()]+changed+home[f.end():]
# Include styles for the new named portfolio cards without changing their animation hooks.
home=home.replace('</head>','<style id="portfolio-page-links">#work .workcard{background-image:radial-gradient(ellipse at 30% 0%,#81603a55,transparent 65%),linear-gradient(145deg,#26251e,#10110f)!important}#work .workcard .page-client-art{display:block;width:180px;height:85px;margin:25px 0}#work .workcard p{font-size:12px;line-height:1.7;color:#c8bba8;max-width:500px}</style></head>') if 'id="portfolio-page-links"' not in home else home
if 'assets/commerce.css' not in home:home=home.replace('</head>','<link rel="stylesheet" href="assets/commerce.css"></head>')
if 'id="primoDigitalWorld"' not in home:
 strip='<section class="commerce-entry-strip" id="primoDigitalWorld" aria-label="PRIMO digital products and workspace"><div class="wrap"><p><strong>More ways to build with PRIMO.</strong>Explore digital products or step inside the client and staff workspace.</p><div class="commerce-entry-actions"><a href="marketplace/">Explore marketplace ↗</a><a href="portal/login/">Client &amp; staff portal ↗</a></div></div></section>'
 home=home.replace('<section class="primo-split"',strip+'<section class="primo-split"',1)
if 'favicon.ico' not in home:home=home.replace('</title>','</title>'+FAVICONS,1) if '</title>' in home else home.replace('<head>','<head>'+FAVICONS,1)
if '_vercel/insights' not in home:home=home.replace('</head>',ANALYTICS+'</head>',1)
if V12:
 import home_v12
 seo=re.search(r'<!-- PRIMO SEO START -->.*?<!-- PRIMO SEO END -->',home,re.S).group(0)
 home=home_v12.build(NAV,SERVICES,PROJECTS,client_art,seo,FAVICONS,ANALYTICS,'')
 home=home.replace('</body>',AGENT_TAG('','')+'</body>',1)
(ROOT/'index.html').write_text(stamp_assets(home))
# Static infrastructure.
urls=[BASE]+[BASE+v['path'] for v in PAGES if not v['extra'].get('private')]
(ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join('  <url><loc>'+esc(u)+'</loc><lastmod>'+TODAY+'</lastmod></url>\n' for u in urls)+'</urlset>\n')
(ROOT/'robots.txt').write_text('User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /portal/\nDisallow: /preview/\n\nSitemap: '+BASE+'sitemap.xml\n')
(ROOT/'.nojekyll').write_text('')
(ROOT/'404.html').write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">'+FAVICONS+'<title>Page not found | PRIMO Group</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#11110f;color:#f3e4cf;font:18px system-ui}main{padding:32px;max-width:650px}h1{font-size:64px}a{color:#e5bb85}</style>'+ANALYTICS+'</head><body><main><h1>Page not found.</h1><p>This page may have moved. Explore PRIMO from the homepage.</p><a href="'+BASE+'">Back to PRIMO ↗</a></main></body></html>')
(ROOT/'seo-page-manifest.json').write_text(json.dumps([{'path':'','title':'PRIMO Group | Lifestyle & Digital Marketing Agency','type':'homepage'}]+manifest,ensure_ascii=False,indent=2)+'\n')
# Publish only site assets and static pages; source tools remain in the Git repository.
dist=ROOT/'dist';dist.mkdir(exist_ok=True)
for path in ['index.html','404.html','sitemap.xml','robots.txt','.nojekyll','seo-page-manifest.json']:
 shutil.copy2(ROOT/path,dist/path)
shutil.copytree(ROOT/'assets',dist/'assets',dirs_exist_ok=True)
for v in PAGES:shutil.copytree(ROOT/v['path'],dist/v['path'],dirs_exist_ok=True)
print(json.dumps({'generated_pages':len(PAGES),'total_indexable_pages':len(urls),'base_url':BASE,'services':len(SERVICES),'client_overviews':len(PROJECTS),'hub_articles':len(ARTICLES)}))
