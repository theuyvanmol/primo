(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
/* menu */
const btn=$('.menu-btn'),menu=$('#menu');
$$('a',menu).forEach((a,i)=>a.style.setProperty('--k',i*45));
const setMenu=o=>{menu.classList.toggle('open',o);btn.setAttribute('aria-expanded',o);btn.textContent=o?'Close':'Menu';document.body.style.overflow=o?'hidden':''};
btn.addEventListener('click',()=>setMenu(btn.getAttribute('aria-expanded')!=='true'));
menu.addEventListener('click',e=>{if(e.target.closest('a'))setMenu(false)});
addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
/* reveal */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
$$('.rv').forEach(el=>io.observe(el));
const once=(sel)=>{const el=$(sel);if(el)new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){el.classList.add('in');o.disconnect()}},{threshold:.3}).observe(el)};once('#steps4');
/* count up */
function count(el){const to=+el.dataset.count,plain=el.dataset.plain;const done=()=>{el.innerHTML=to+(plain?'':'<sup style="font-size:.5em">+</sup>')};
 if(reduce){done();return}const t0=performance.now();(function f(t){const p=clamp((t-t0)/1600);el.textContent=Math.round(to*(1-Math.pow(1-p,4)));p<1?requestAnimationFrame(f):done()})(t0)}
$$('[data-count]').forEach(el=>setTimeout(()=>count(el),900));
/* silk canvas: layered soft blobs, blurred by CSS */
const cv=$('#silk');
if(cv&&!reduce){
 const ctx=cv.getContext('2d');let W,H,t=0,vis=true,mx=.5,my=.5,tx=.5,ty=.5;
 const size=()=>{W=cv.width=Math.max(320,cv.clientWidth>>1);H=cv.height=Math.max(200,cv.clientHeight>>1)};size();addEventListener('resize',size);
 const B=[[.2,.3,.55,'#9aa7ff'],[.7,.6,.5,'#c98a62'],[.45,.8,.6,'#4a5390'],[.85,.2,.45,'#d8c7b0'],[.1,.85,.5,'#1a1c33'],[.55,.15,.4,'#7f8cff']];
 new IntersectionObserver(es=>vis=es[0].isIntersecting).observe(cv);
 addEventListener('pointermove',e=>{tx=e.clientX/innerWidth;ty=e.clientY/innerHeight},{passive:true});
 let last=0;(function frame(now){requestAnimationFrame(frame);if(!vis||now-last<33)return;last=now;t+=.008;mx+=(tx-mx)*.04;my+=(ty-my)*.04;
  ctx.globalCompositeOperation='source-over';ctx.fillStyle='#0a0a12';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='lighter';
  B.forEach((b,i)=>{const x=(b[0]+Math.sin(t*(1+i*.23)+i*2)*.22+(mx-.5)*.12*(i%3))*W,y=(b[1]+Math.cos(t*(.8+i*.19)+i)*.2+(my-.5)*.1*(i%2))*H,r=b[2]*Math.max(W,H)*(.8+.15*Math.sin(t*1.3+i));
   const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,b[3]+'cc');g.addColorStop(1,b[3]+'00');ctx.fillStyle=g;ctx.fillRect(0,0,W,H)});
 })(0);
}else if(cv){cv.style.background='radial-gradient(circle at 30% 40%,#6f7bd9,transparent 55%),radial-gradient(circle at 70% 70%,#c98a62,transparent 50%),#0a0a12'}
/* laptop scroll scene */
const stage=$('#lapStage'),sec=$('.lap-sec'),cards=$$('.sc'),mobile=matchMedia('(max-width:960px)');
function lap(){
 if(mobile.matches){stage.style.setProperty('--open',1);stage.style.setProperty('--p',.4);cards.forEach(c=>c.style.setProperty('--k',1));return}
 const r=sec.getBoundingClientRect(),span=sec.offsetHeight-innerHeight,p=clamp(-r.top/span);
 const ease=x=>1-Math.pow(1-x,3);
 stage.style.setProperty('--p',p.toFixed(4));
 stage.style.setProperty('--open',ease(clamp((p-.02)/.45)).toFixed(4));
 cards.forEach((c,i)=>c.style.setProperty('--k',ease(clamp((p-.2-i*.07)/.2)).toFixed(3)));
}
/* AI sticky steps */
const ai=$('.ai'),art=$('#aiArt'),st=$$('.st');let cur=-1;
function step(i){if(i===cur)return;cur=i;art.dataset.step=i;st.forEach((s,k)=>s.classList.toggle('on',k===i))}
st.forEach((s,i)=>s.addEventListener('click',()=>{if(!mobile.matches){const top=scrollY+ai.getBoundingClientRect().top,span=ai.offsetHeight-innerHeight;scrollTo({top:top+span*(i+.5)/st.length,behavior:'smooth'})}else step(i)}));
function aiScroll(){if(mobile.matches)return;const r=ai.getBoundingClientRect(),span=ai.offsetHeight-innerHeight,p=clamp(-r.top/span);step(Math.min(st.length-1,Math.floor(p*st.length)))}
let ticking=false;const onScroll=()=>{if(!ticking){ticking=true;requestAnimationFrame(()=>{ticking=false;lap();aiScroll()})}};
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);lap();aiScroll();step(0);
if(mobile.matches){let n=setInterval(()=>step((cur+1)%st.length),5000);$('#aiSteps').addEventListener('pointerdown',()=>clearInterval(n),{once:true})}
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
