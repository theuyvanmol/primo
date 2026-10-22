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
/* hero cards: scroll drift + pointer parallax */
const cards=$$('.cards .pc'),hero=$('#home');
if(cards.length&&!reduce){
 const speeds=cards.map((_,i)=>[.10,.18,.06,.14][i%4]);
 let y=0,tick=false;
 const upd=()=>{tick=false;cards.forEach((c,i)=>c.style.setProperty('--py',(-y*speeds[i]).toFixed(1)+'px'))};
 addEventListener('scroll',()=>{y=Math.min(scrollY,innerHeight*1.2);if(!tick){tick=true;requestAnimationFrame(upd)}},{passive:true});
 if(matchMedia('(hover:hover)').matches){
  hero.addEventListener('pointermove',e=>{const x=e.clientX/innerWidth-.5,yy=e.clientY/innerHeight-.5;cards.forEach((c,i)=>{const d=8+(i%4)*5;c.style.setProperty('--mx',(x*d).toFixed(1)+'px');c.style.setProperty('--my',(yy*d).toFixed(1)+'px')})},{passive:true});
 }
}
/* services showcase: scroll-driven on desktop, click on small screens */
const sl=$$('.sl'),sp=$$('.sp'),show=$('#services');
let cur=0;const pick=i=>{if(i===cur&&sp[i].classList.contains('on'))return;cur=i;sl.forEach((b,k)=>b.setAttribute('aria-selected',k===i));sp.forEach((p,k)=>p.classList.toggle('on',k===i))};
sl.forEach((b,i)=>b.addEventListener('click',()=>{
 if(matchMedia('(min-width:961px)').matches){const r=show.getBoundingClientRect(),top=scrollY+r.top,span=show.offsetHeight-innerHeight;scrollTo({top:top+span*(i+.5)/sl.length,behavior:'smooth'})}else pick(i)}));
const desk=matchMedia('(min-width:961px)');
function onShow(){if(!desk.matches)return;const r=show.getBoundingClientRect(),span=show.offsetHeight-innerHeight;const p=Math.min(.999,Math.max(0,-r.top/span));pick(Math.floor(p*sl.length))}
addEventListener('scroll',onShow,{passive:true});addEventListener('resize',onShow);onShow();
if(!desk.matches){let n=setInterval(()=>pick((cur+1)%sl.length),6500);$('.side')?.addEventListener('pointerdown',()=>clearInterval(n),{once:true})}
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
})();
