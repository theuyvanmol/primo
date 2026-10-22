(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* header */
const hdr=$('#hdr');const onScroll=()=>hdr.classList.toggle('scrolled',scrollY>20);addEventListener('scroll',onScroll,{passive:true});onScroll();
const toggle=$('.nav-menu-toggle'),nav=$('#primaryNav');
toggle.addEventListener('click',()=>{const o=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',o)});
nav.addEventListener('click',e=>{if(e.target.closest('a')){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false')}});
/* reveal */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.14,rootMargin:'0px 0px -6% 0px'});
$$('.rv').forEach(el=>io.observe(el));
/* triggers: process line, dashboard bars */
const once=(sel)=>{const el=$(sel);if(!el)return;new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){el.classList.add('in');o.disconnect()}},{threshold:.35}).observe(el)};
once('#proc');once('#dash');
/* count up */
function count(el){
 const to=parseFloat(el.dataset.count),dec=+el.dataset.dec||0,pre=el.dataset.prefix||'',suf=el.dataset.suffix||'',plain=el.dataset.plain;
 const fmt=v=>pre+v.toFixed(dec)+suf;
 const addPlus=!suf&&!plain&&!pre;
 const finish=()=>{el.innerHTML=fmt(to)+(addPlus?'<sup>+</sup>':'')};
 if(reduce){finish();return}
 const t0=performance.now(),d=1600;
 (function f(t){const p=Math.min(1,(t-t0)/d),e=1-Math.pow(1-p,4);el.textContent=fmt(to*e);if(p<1)requestAnimationFrame(f);else finish()})(t0);
}
const cio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){count(e.target);cio.unobserve(e.target)}}),{threshold:.6});
$$('[data-count]').forEach(el=>cio.observe(el));
/* tabs */
const tabs=$$('.tab'),panes=$$('.pane');
function pick(i){tabs.forEach((t,k)=>t.setAttribute('aria-selected',k===i));panes.forEach((p,k)=>p.classList.toggle('on',k===i))}
tabs.forEach((t,i)=>{t.addEventListener('click',()=>pick(i));t.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();const n=(i+(e.key==='ArrowDown'?1:-1)+tabs.length)%tabs.length;pick(n);tabs[n].focus()}})});
let auto=setInterval(()=>{const c=tabs.findIndex(t=>t.getAttribute('aria-selected')==='true');pick((c+1)%tabs.length)},6000);
$('.svc')?.addEventListener('pointerdown',()=>clearInterval(auto),{once:true});
/* hero parallax */
const stage=$('#stage');
if(stage&&!reduce&&matchMedia('(hover:hover)').matches){
 const cards=$$('.fcard',stage),img=$('.stage-img',stage);let raf;
 addEventListener('pointermove',e=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{
  const x=(e.clientX/innerWidth-.5),y=(e.clientY/innerHeight-.5);
  cards.forEach(c=>{const d=+c.dataset.depth||12;c.style.translate=(x*d*2.2).toFixed(1)+'px '+(y*d*2.2).toFixed(1)+'px'});
  img.style.transform='translate('+(x*-14).toFixed(1)+'px,'+(y*-10).toFixed(1)+'px)'})},{passive:true});
}
/* language switch (text keys match assets/translations.js) */
const dict=window.PRIMO_TRANSLATIONS||{},picker=$('#siteLanguage');
if(picker){
 const recs=[],attrs=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 while(w.nextNode()){const n=w.currentNode,k=n.nodeValue.trim();if(dict[k]&&!n.parentElement.closest('script,style,select'))recs.push({n,o:n.nodeValue,k})}
 $$('[placeholder],[aria-label],[title],[alt]').forEach(el=>['placeholder','aria-label','title','alt'].forEach(a=>{const o=el.getAttribute(a);if(dict[o])attrs.push({el,a,o})}));
 const t0=document.title;
 const tr=(k,l)=>l==='en'?k:(dict[k]&&dict[k][l])||k;
 const apply=l=>{l=['en','th','vi'].includes(l)?l:'en';picker.value=l;document.documentElement.lang=l;
  recs.forEach(r=>{r.n.nodeValue=r.o.replace(r.k,tr(r.k,l))});attrs.forEach(r=>r.el.setAttribute(r.a,tr(r.o,l)));document.title=tr(t0,l);try{localStorage.setItem('primo-language',l)}catch(e){}};
 picker.addEventListener('change',()=>apply(picker.value));
 let s='en';try{s=localStorage.getItem('primo-language')||'en'}catch(e){}if(s!=='en')apply(s);
}
})();
