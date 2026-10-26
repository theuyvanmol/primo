(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* menu overlay */
const btn=$('.menu-btn'),menu=$('#menu');
const setMenu=o=>{menu.classList.toggle('open',o);btn.setAttribute('aria-expanded',o);document.body.style.overflow=o?'hidden':''};
btn.addEventListener('click',()=>setMenu(btn.getAttribute('aria-expanded')!=='true'));
menu.addEventListener('click',e=>{if(e.target.closest('a'))setMenu(false)});
addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
/* blur-in reveal */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15,rootMargin:'0px 0px -6% 0px'});
$$('.rv').forEach(el=>io.observe(el));
const once=sel=>{const el=$(sel);if(!el)return;new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){el.classList.add('in');o.disconnect()}},{threshold:.35}).observe(el)};
once('#proc');once('#dash');
/* count up */
function count(el){
 const to=parseFloat(el.dataset.count),dec=+el.dataset.dec||0,pre=el.dataset.prefix||'',suf=el.dataset.suffix||'',plain=el.dataset.plain;
 const fmt=v=>pre+v.toFixed(dec)+suf,plus=!suf&&!plain&&!pre;
 const done=()=>{el.innerHTML=fmt(to)+(plus?'<sup>+</sup>':'')};
 if(reduce){done();return}
 const t0=performance.now();(function f(t){const p=Math.min(1,(t-t0)/1700),e=1-Math.pow(1-p,4);el.textContent=fmt(to*e);p<1?requestAnimationFrame(f):done()})(t0);
}
const cio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const d=e.target.closest('.tiles')?900:0;setTimeout(()=>count(e.target),d);cio.unobserve(e.target)}}),{threshold:.6});
$$('[data-count]').forEach(el=>cio.observe(el));
/* language switch (keys match assets/translations.js) */
const dict=window.PRIMO_TRANSLATIONS||{},picker=$('#siteLanguage');
if(picker){
 const recs=[],attrs=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 while(w.nextNode()){const n=w.currentNode,k=n.nodeValue.trim();if(dict[k]&&!n.parentElement.closest('script,style,select'))recs.push({n,o:n.nodeValue,k})}
 $$('[placeholder],[aria-label],[title],[alt]').forEach(el=>['placeholder','aria-label','title','alt'].forEach(a=>{const o=el.getAttribute(a);if(dict[o])attrs.push({el,a,o})}));
 const t0=document.title,tr=(k,l)=>l==='en'?k:(dict[k]&&dict[k][l])||k;
 const apply=l=>{l=['en','th','vi'].includes(l)?l:'en';picker.value=l;document.documentElement.lang=l;recs.forEach(r=>{r.n.nodeValue=r.o.replace(r.k,tr(r.k,l))});attrs.forEach(r=>r.el.setAttribute(r.a,tr(r.o,l)));document.title=tr(t0,l);try{localStorage.setItem('primo-language',l)}catch(e){}};
 picker.addEventListener('change',()=>apply(picker.value));
 let s='en';try{s=localStorage.getItem('primo-language')||'en'}catch(e){}if(s!=='en')apply(s);
}

const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
/* Enter PRIMO World: lid opens, camera zooms into the screen */
const enGl=$('.en-glow'),en=$('#enter'),enS=$('#enStage'),enLap=$('#enLap'),enCap=$('#enCap'),enLid=enLap&&$('.lid',enLap),enSh=enS&&$('.en-shadow',enS);
function enter(){
 if(!en||reduce)return;
 const r=en.getBoundingClientRect(),span=en.offsetHeight-innerHeight,p=clamp(-r.top/span);
 const e3=x=>1-Math.pow(1-x,3),e2=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
 const open=e3(clamp((p-.03)/.34)),z=e2(clamp((p-.42)/.5));
 const vw=innerWidth,vh=innerHeight;
 const s0=Math.min(1.05,vw/760),s1=(vw<vh?vw/582:Math.max(vw/582,vh/362))*1.04,s=s0*Math.pow(s1/s0,z);
 const th=108*open,zr=-40*(1-z),al=60+12*z,rad=Math.PI/180;
 /* screen centre in laptop space, to bring it to the middle of the view */
 const ly=-190+190*Math.cos(th*rad),lz=190*Math.sin(th*rad)+1;
 const y1=ly*Math.cos(zr*rad),x1=-ly*Math.sin(zr*rad);
 const Y=y1*Math.cos(al*rad)-lz*Math.sin(al*rad),Z=y1*Math.sin(al*rad)+lz*Math.cos(al*rad);
 enLap.style.transform='translate3d('+(-x1*s*z)+'px,'+(-Y*s*z+(1-z)*vh*.08)+'px,'+(-Z*s*z)+'px) scale('+s+') rotateX('+al+'deg) rotateZ('+zr+'deg)';
 enLid.style.transform='translateZ(1px) rotateX('+th+'deg)';
 enSh.style.opacity=1-z;enGl.style.opacity=1-z;enLap.style.setProperty('--f',clamp((z-.7)/.3).toFixed(3));
 enCap.style.opacity=1-clamp((p-.1)/.16);enCap.style.transform='translateY('+(-p*60)+'px)';
}
let enTick=false;const enOn=()=>{if(!enTick){enTick=true;requestAnimationFrame(()=>{enTick=false;enter()})}};addEventListener('scroll',enOn,{passive:true});addEventListener('resize',enOn);enter();


/* ---- Curate-style motion ---- */
const hdr=$('#hdr'),bands=$$('[data-tone]').filter(e=>e!==hdr),fab=$('#fab'),contactS=$('#contact');
function tone(){let t='dark';for(const b of bands){const r=b.getBoundingClientRect();if(r.top<=36&&r.bottom>36){t=b.dataset.tone;break}}if(hdr.dataset.tone!==t)hdr.dataset.tone=t;
 const e=en?en.getBoundingClientRect().bottom:0,c=contactS?contactS.getBoundingClientRect().top:1e9;fab.classList.toggle('show',e<innerHeight*.35&&c>innerHeight*.5)}
const heroEl=$('#home');new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){heroEl.classList.add('in');o.disconnect()}},{threshold:.2}).observe(heroEl);
/* rotating bold word */
const sw=$('.swap'),words=sw&&$('.words',sw),ems=words?$$('em',words):[];let wi=0,wOn=false;
const setW=i=>{words.style.transform='translateY('+(-i*1.04)+'em)';sw.style.width=ems[i].offsetWidth+'px'};
if(ems.length){(document.fonts?document.fonts.ready:Promise.resolve()).then(()=>setW(0));
 new IntersectionObserver(es=>{wOn=es[0].isIntersecting}).observe(sw);
 if(!reduce)setInterval(()=>{if(!wOn||document.hidden)return;wi++;words.style.transition='';setW(wi);if(wi===ems.length-1)setTimeout(()=>{words.style.transition='none';sw.style.transition='none';wi=0;setW(0);requestAnimationFrame(()=>{words.style.transition='';sw.style.transition=''})},950)},2700);
 $('#siteLanguage')?.addEventListener('change',()=>setTimeout(()=>setW(wi),60));addEventListener('resize',()=>setW(wi))}
/* patchwork -> one team */
const stage=$('#stopStage'),tg=$('.toggle'),tb=tg?$$('button',tg):[],thumb=tg&&$('i',tg),nums=$$('.stop-n [data-a]');let touched=false;
function setMode(m){if(!stage)return;stage.dataset.mode=m;tb.forEach(b=>{const on=b.dataset.mode===m;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)});const b=tb.find(b=>b.dataset.mode===m);thumb.style.setProperty('--x',(b.offsetLeft-4)+'px');thumb.style.setProperty('--w',b.offsetWidth+'px');nums.forEach(n=>{n.textContent=m==='one'?n.dataset.b:n.dataset.a})}
tb.forEach(b=>b.addEventListener('click',()=>{touched=true;setMode(b.dataset.mode)}));
if(stage){(document.fonts?document.fonts.ready:Promise.resolve()).then(()=>setMode('patch'));addEventListener('resize',()=>setMode(stage.dataset.mode));
 new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){o.disconnect();setTimeout(()=>{if(!touched)setMode('one')},reduce?0:2600)}},{threshold:.6}).observe(stage)}

/* hero: cards fly outward, text blurs out (Fastwork) */
const heroC=$('#heroC');
function flyP(){if(!heroEl||reduce)return;const r=heroEl.getBoundingClientRect(),hp=clamp((-r.top)/(innerHeight*.8));heroEl.style.setProperty('--hp',hp.toFixed(3))}
/* sticky notes fall in */
const painS=$('#pain'),notes=$$('.nt'),panel=$('#why');
function painP(){if(!painS||reduce)return;const r=painS.getBoundingClientRect(),span=painS.offsetHeight-innerHeight,p=clamp(-r.top/span);const e=x=>1-Math.pow(1-x,3);notes.forEach((n,i)=>n.style.setProperty('--k',e(clamp((p-.03-i*.055)/.13)).toFixed(3)))}
if(reduce)notes.forEach(n=>n.style.setProperty('--k',1));
if(panel)new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){panel.classList.add('in');o.disconnect()}},{threshold:.2}).observe(panel);
/* 7 handoffs -> 0 */
const hand=$('#hand');
if(hand){const z=$('.zero',hand);new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){o.disconnect();hand.classList.add('in');if(reduce){z.textContent='0';return}const t0=performance.now();(function f(t){const p=clamp((t-t0-500)/1700);z.textContent=Math.round(7*(1-(1-Math.pow(1-p,3))));if(p<1)requestAnimationFrame(f)})(t0)}},{threshold:.5}).observe(hand)}
/* sticky service showcase */
const sl=$$('.sl'),sp=$$('.sp'),show=$('#services-show');let cur=0;
const pick=i=>{if(i===cur&&sp[i].classList.contains('on'))return;cur=i;sl.forEach((b,k)=>b.setAttribute('aria-selected',k===i));sp.forEach((p,k)=>p.classList.toggle('on',k===i))};
const desk=matchMedia('(min-width:901px)');
sl.forEach((b,i)=>b.addEventListener('click',()=>{if(desk.matches){const r=show.getBoundingClientRect(),top=scrollY+r.top,span=show.offsetHeight-innerHeight;scrollTo({top:top+span*(i+.5)/sl.length,behavior:'smooth'})}else pick(i)}));
function showP(){if(!show||!desk.matches)return;const r=show.getBoundingClientRect(),span=show.offsetHeight-innerHeight,p=Math.min(.999,Math.max(0,-r.top/span));pick(Math.floor(p*sl.length))}
/* process timeline */
const tl=$('#tl'),lis=tl?$$('li',tl):[];
function tlp(){if(!tl)return;const r=tl.getBoundingClientRect();tl.style.setProperty('--tp',clamp((innerHeight*.62-r.top)/r.height).toFixed(3));lis.forEach(li=>li.classList.toggle('on',li.getBoundingClientRect().top<innerHeight*.62))}
let cTick=false;const cOn=()=>{if(!cTick){cTick=true;requestAnimationFrame(()=>{cTick=false;tone();flyP();painP();tlp();showP()})}};
addEventListener('scroll',cOn,{passive:true});addEventListener('resize',cOn);cOn();
})();
