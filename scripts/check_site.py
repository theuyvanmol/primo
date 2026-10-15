from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,re,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1];SITE=ROOT/'dist'
class Page(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.refs=[];self.metas={};self.canon=[];self.h1=0;self.schema=[];self.inschema=False;self.buf='';self.title='';self.intitle=False;self.images=[]
 def handle_starttag(self,t,a):
  d=dict(a)
  if d.get('id'):self.ids.append(d['id'])
  if t=='h1':self.h1+=1
  if t=='meta':self.metas.setdefault(d.get('name') or d.get('property'),[]).append(d.get('content',''))
  if t=='link' and d.get('rel')=='canonical':self.canon.append(d.get('href'))
  if t=='img':self.images.append(d)
  if t=='script' and d.get('type')=='application/ld+json':self.inschema=True;self.buf=''
  if t=='title':self.intitle=True
  for k in ['src','href']:
   if d.get(k):self.refs.append(d[k])
 def handle_endtag(self,t):
  if t=='script' and self.inschema:self.schema.append(json.loads(self.buf));self.inschema=False
  if t=='title':self.intitle=False
 def handle_data(self,x):
  if self.inschema:self.buf+=x
  if self.intitle:self.title+=x
pages={};errors=[];linkcount=0
for f in SITE.rglob('*.html'):
 p=Page();p.feed(f.read_text());pages[f.resolve()]=p
 if p.h1!=1:errors.append(f'{f.relative_to(SITE)}: {p.h1} H1 elements')
 if len(p.ids)!=len(set(p.ids)):errors.append(f'{f.relative_to(SITE)}: duplicate IDs')
 if f.name!='404.html' and 'previews' not in f.parts:
  if len(p.canon)!=1:errors.append(f'{f}: canonical count')
  if len(p.metas.get('description',[]))!=1:errors.append(f'{f}: missing/duplicate description')
  if not p.schema:errors.append(f'{f}: missing structured data')
  if not p.title:errors.append(f'{f}: missing title')
 for img in p.images:
  if 'alt' not in img:errors.append(f'{f}: image missing alt')
for f,p in pages.items():
 for ref in p.refs:
  u=urlsplit(ref)
  if u.scheme or u.netloc:continue
  if u.path.startswith('/'):target=SITE/u.path.lstrip('/')
  else:target=f.parent/unquote(u.path)
  if target.is_dir():target=target/'index.html'
  if not u.path:target=f
  target=target.resolve();linkcount+=1
  if not target.is_file():errors.append(f'{f.relative_to(SITE)}: missing {ref}');continue
  if u.fragment and target in pages and unquote(u.fragment) not in pages[target].ids:errors.append(f'{f.relative_to(SITE)}: missing fragment {ref}')
# CSS file asset references must also resolve, including preserved inline stylesheet backgrounds.
for f in SITE.rglob('*.css'):
 for ref in re.findall(r'url\([\"\']?([^\)\"\']+)',f.read_text()):
  if ref.startswith(('data:','#','%23','http')):continue
  if not (f.parent/unquote(ref)).is_file():errors.append(f'{f.relative_to(SITE)}: missing CSS resource {ref}')
manifest=json.loads((SITE/'seo-page-manifest.json').read_text());ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
xml=ET.parse(SITE/'sitemap.xml');locs=[n.text for n in xml.findall('s:url/s:loc',ns)];assert len(locs)==sum(v.get('indexable',True) for v in manifest)
assert len(locs)==len(set(locs));titles=[p.title for f,p in pages.items() if f.name!='404.html'];assert len(titles)==len(set(titles))
report={'html_pages':len(pages),'indexable_pages':sum(v.get('indexable',True) for v in manifest),'checked_local_references':linkcount,'sitemap_urls':len(locs),'errors':errors,'visual_qa':'Browser visual testing unavailable.','metadata_lengths':[{'page':str(f.relative_to(SITE)),'title':len(p.title),'description':len(p.metas.get('description',[''])[0])} for f,p in pages.items() if f.name!='404.html']}
(ROOT/'seo-check-report.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k!='metadata_lengths'},indent=2));raise SystemExit(bool(errors))
