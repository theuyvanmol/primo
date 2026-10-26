(()=>{'use strict';
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease=t=>1-Math.pow(1-t,4);
function fmt(el,v){const d=el.dataset,to=+d.to;const dec=(d.to.split('.')[1]||'').length;let s=dec?v.toFixed(dec):Math.round(v).toString();if(to>=1000)s=Math.round(v).toLocaleString('en-US');el.firstElementChild.textContent=(d.pre||'')+s+(d.suf||'')}
function countTo(el,to,ms,from=0){if(reduce){el.dataset.cur=to;fmt(el,to);return}const t0=performance.now();(function f(t){const p=Math.min(1,(t-t0)/ms);const v=from+(to-from)*ease(p);el.dataset.cur=v;fmt(el,v);if(p<1)requestAnimationFrame(f)})(t0)}
function init(root){
 const ui=root.querySelector('.ui'),inner=root.querySelector('.ou-in');
 const fit=()=>{const w=root.clientWidth;if(w)root.style.setProperty('--s',(w/1240).toFixed(4))};fit();new ResizeObserver(fit).observe(root);
 const cols=[...root.querySelectorAll('.uoc')],hot=root.querySelector('.oj.hot'),bars=[...root.querySelectorAll('.ubars i')];
 bars.forEach((b,i)=>b.style.setProperty('--k',i));
 const nums=[...root.querySelectorAll('.obig')];
 const STAGES=[{p:10,l:'New'},{p:36,l:'Strategist'},{p:70,l:'Media buyer'},{p:100,l:'Done'}];
 let stage=0,started=false,timer=null,visible=false,cycle=0;
 const setCounts=()=>cols.forEach(c=>c.querySelector('.cnt').textContent=c.querySelectorAll('.oj').length);
 const setHot=()=>{const s=STAGES[stage];hot.querySelector('.ob i').style.width=s.p+'%';hot.querySelector('.op').textContent=s.l;hot.querySelector('.om span:first-child').textContent='CMP-2294'};
 function flip(fn){const sc=parseFloat(getComputedStyle(root).getPropertyValue('--s'))||1;const els=[...root.querySelectorAll('.oj')];const first=new Map(els.map(e=>[e,e.getBoundingClientRect()]));fn();els.forEach(e=>{const f=first.get(e),l=e.getBoundingClientRect();const dx=(f.left-l.left)/sc,dy=(f.top-l.top)/sc;if(Math.abs(dx)+Math.abs(dy)>.5){e.style.transition='none';e.style.transform='translate('+dx+'px,'+dy+'px)';e.getBoundingClientRect();e.style.transition='transform .85s cubic-bezier(.2,.7,.2,1)';e.style.transform='none';setTimeout(()=>{e.style.transition='';e.style.transform=''},900)}})}
 const move=to=>{flip(()=>{cols[to].querySelector('.och').after(hot);setCounts()})};
 function bump(){ /* a finished campaign ticks the numbers */
  cycle++;const a=nums[0],b=nums[1],lead=nums[4];
  countTo(a,(+a.dataset.cur||48)+1,900,+a.dataset.cur||48);countTo(b,(+b.dataset.cur||23)+(cycle%2?2:-1),900,+b.dataset.cur||23);
  if(lead){const cur=+lead.dataset.cur||312,nv=cur+4+(cycle%3);countTo(lead,nv,900,cur);const last=bars[bars.length-1];last.style.height=Math.min(100,100)+'%';
   bars.slice(0,-1).forEach((x,i)=>{const base=parseFloat(x.style.getPropertyValue('--h'));x.style.setProperty('--h',Math.max(30,Math.min(96,base+((cycle+i)%3-1)*4))+'%')})}
 }
 function step(){
  if(!visible)return;
  if(stage<3){stage++;setHot();move(stage)}
  else{ /* done: fade out, restart in Brief */
   hot.classList.add('leave');
   setTimeout(()=>{hot.classList.remove('leave');stage=0;hot.style.animation='none';flip(()=>{cols[0].querySelector('.och').after(hot);setCounts()});setHot();hot.classList.remove('enter');void hot.offsetWidth;hot.classList.add('enter');bump();setTimeout(()=>hot.classList.remove('enter'),900)},650)}
 }
 const start=()=>{if(started)return;started=true;root.classList.add('in');
  nums.forEach((n,i)=>{const to=+n.dataset.to;setTimeout(()=>countTo(n,to,1700),300+i*120)});
  if(!reduce)timer=setInterval(step,2700)};
 if(reduce){root.classList.add('static');nums.forEach(n=>{n.dataset.cur=n.dataset.to;fmt(n,+n.dataset.to)});setHot();return}
 setHot();
 new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible)start()},{threshold:.35}).observe(root);
 /* interactive: sidebar highlight + title swap */
 if(root.classList.contains('ou-int')){const items=[...root.querySelectorAll('.uon')],h=root.querySelector('.uh'),sub=root.querySelector('.usub');const T=[['Overview','Every campaign, in one place'],['Campaigns','Brief to launch, tracked live'],['Calendar','Posts and ads, scheduled for you'],['Audience','Who is engaging, and where'],['Content','Drafts, approvals and assets'],['Reports','Results, without the spreadsheet']];
  items.forEach((it,i)=>it.addEventListener('click',()=>{items.forEach(x=>x.classList.toggle('is-active',x===it));h.textContent=T[i][0];sub.textContent=T[i][1];ui.classList.remove('flash');void ui.offsetWidth;ui.classList.add('flash')}))}
}
document.querySelectorAll('[data-orbit]').forEach(init);
/* hero frame tilt */
const fr=document.querySelector('.od-frame');
if(fr&&!reduce){const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));const upd=()=>{const r=fr.getBoundingClientRect();fr.style.setProperty('--t',(1-Math.pow(1-clamp((innerHeight*.95-r.top)/(innerHeight*.7)),2)).toFixed(3))};let tk=false;addEventListener('scroll',()=>{if(!tk){tk=true;requestAnimationFrame(()=>{tk=false;upd()})}},{passive:true});addEventListener('resize',upd);upd()}
else if(fr)fr.style.setProperty('--t',1);
})();
