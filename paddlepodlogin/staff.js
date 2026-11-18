/* PaddlePod staff workspace: venue timetable (prototype, sample data) */
(function(){
const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],DAYF=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const MON0=new Date(2026,10,2),TODAY={w:0,d:2,m:16*60+40};
const STAGES=[['babies','Nemo Babies','#5BC0EB',8,'9 to 18 months'],['toddlers','Nemo Toddlers','#1FA8A0',8,'2 years'],['pre','Nemo Pre-school','#8CC63F',8,'3 to 4 years'],
 ['s1','Stage 1','#F7C531',6,'5 years'],['s2','Stage 2','#F59E2B',6,'6 years'],['s3','Stage 3','#EE6C3A',6,'6 years'],['s4','Stage 4','#E04B5A',6,'7 years'],
 ['s5','Stage 5','#C74FA0',8,'8 years'],['s6','Stage 6','#8A5BD6',8,'9 years'],['s7','Stage 7','#4F6BDB',8,'10 years'],['s8','Stage 8','#25306B',8,'11 years']];
const ST=Object.fromEntries(STAGES.map(s=>[s[0],{k:s[0],name:s[1],c:s[2],cap:s[3],age:s[4]}]));
const POOLS=[{id:'kw1',v:'Killingworth',n:'Main pool'},{id:'kw2',v:'Killingworth',n:'Teaching pool'},{id:'sm1',v:'Shiremoor',n:'Main pool'}];
const TEACH=['Jake Robson','Hannah Reid','Owen Scott','Priya Nair','Ellie Marsh'];
const FN='Olivia Alfie Mia Isla Ben Zara Leo Jack Ruby Freddie Harry Grace Oscar Lily Noah Ava Theo Ella Arthur Freya Ivy Max Poppy Finn Evie Sonny Maya Rory Willow Archie Daisy Elsie Jacob Millie Harvey Amelie Reggie Rosie Teddy Hallie Kai Nina Eli Ada Joel Cleo Sam Tilly'.split(' ');
const LN='Thompson Price Bennett Walsh Khan Ellis Young Lowe Ford Hill Moore Shaw Cole Reed Scott Nair Marsh Grant Hall Patel Clarke Wood Bell Fox Gray Hunt Lane Page Ross West'.split(' ');
const hs=s=>{let h=1779033703^s.length;for(let i=0;i<s.length;i++){h=Math.imul(h^s.charCodeAt(i),3432918353);h=h<<13|h>>>19}return h>>>0};
const rngF=seed=>{let a=hs(seed);return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
const hm=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
const tm=t=>{const[a,b]=t.split(':').map(Number);return a*60+b};
const dateOf=(w,d)=>{const x=new Date(MON0);x.setDate(x.getDate()+w*7+d);return x};
const fmt=(x,o)=>x.toLocaleDateString('en-GB',o);
const CACHE={};
function classesFor(w){
  if(CACHE[w])return CACHE[w];
  const out=[];
  for(let d=0;d<7;d++)POOLS.forEach((p,pi)=>{
    let slots=[];
    if(d<5){if(p.id!=='kw1')['09:30','10:15'].forEach(t=>slots.push([t,1]));['16:00','16:45','17:30','18:15'].forEach(t=>slots.push([t,0]))}
    else if(d===5)['08:30','09:15','10:00','10:45','11:30','12:15'].forEach((t,i)=>slots.push([t,(i<2&&p.id!=='kw1')?1:0]));
    else if(p.id!=='sm1')['09:00','09:45','10:30','11:15'].forEach((t,i)=>slots.push([t,i<1?1:0]));
    slots.forEach(([t,early],si)=>{
      const id=`w${w}-${d}-${p.id}-${si}`,r=rngF(id);
      const keys=early?['babies','toddlers','pre']:['s1','s2','s3','s4','s5','s6','s7','s8'];
      const st=ST[keys[Math.floor(r()*keys.length)]];
      let n,x=r();n=x<.24?st.cap:x<.36?1+Math.floor(r()*2):Math.max(2,st.cap-1-Math.floor(r()*3));
      const teacher=TEACH[Math.floor(r()*TEACH.length)];
      const past=w<0||(w===0&&(d<TODAY.d||(d===TODAY.d&&tm(t)+45<TODAY.m)));
      const used=new Set(),mk=()=>{let nm;do{nm=FN[Math.floor(r()*FN.length)]+' '+LN[Math.floor(r()*LN.length)]}while(used.has(nm));used.add(nm);return nm};
      const sw=[];for(let i=0;i<n;i++){const a=r();sw.push({n:mk(),age:st.k==='babies'?(9+Math.floor(r()*9))+' months':st.k==='toddlers'?'2 years':st.k==='pre'?(3+Math.floor(r()*2))+' years':(parseInt(st.name.slice(-1))+4)+' years',tag:a<.08?'Trial':a<.14?'New':'',att:past?(r()<.1?'absent':'present'):null})}
      const wait=n===st.cap?Math.floor(r()*3):0,wl=[];for(let i=0;i<wait;i++)wl.push(mk());
      out.push({id,w,d,pool:p.id,v:p.v,pn:p.n,t:tm(t),dur:45,st:st.k,cap:st.cap,teacher,sw,wl,cover:false,cancelled:false,done:past});
    });
  });
  if(w===0){out.forEach(c=>{if(c.d===3&&c.pool==='sm1'&&c.t<12*60){c.teacher='Hannah Reid';c.cover=true}});}
  return CACHE[w]=out;
}
const all=()=>{const a=[];for(let w=-1;w<=3;w++)a.push(...classesFor(w));return a};
const findC=id=>all().find(c=>c.id===id);
const TT=window.TT={w:0,view:'day',d:TODAY.d,venues:{Killingworth:true,Shiremoor:true},stages:{},teacher:'All',spaces:false,q:'',sel:null};
const esc2=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ini=n=>n.split(' ').map(x=>x[0]).join('').slice(0,2);
const space=c=>c.cap-c.sw.length;
function visible(arr){
  const q=TT.q.trim().toLowerCase(),sg=Object.keys(TT.stages).filter(k=>TT.stages[k]);
  return arr.filter(c=>TT.venues[c.v]&&(!sg.length||sg.includes(c.st))&&(TT.teacher==='All'||c.teacher===TT.teacher)&&(!TT.spaces||(space(c)>0&&!c.cancelled)));
}
const hit=c=>{const q=TT.q.trim().toLowerCase();return q&&c.sw.some(s=>s.n.toLowerCase().includes(q))};
let inN=false;function block(c,style=''){
  const s=ST[c.st],sp=space(c),n=c.sw.length,cls=['cb',c.cover&&!c.cancelled?'cover':'',c.cancelled?'cancelled':'',TT.sel===c.id?'sel':'',c.done?'done':'',TT.q.trim()?(hit(c)?'hit':'dim'):''].join(' ');
  const cc=n>=c.cap?'full':(sp<=1&&n>0?'low':'');
  return `<button class="${cls}" style="--c:${s.c};${style}" data-a="ttOpen" data-id="${c.id}" aria-label="${s.name}, ${hm(c.t)}, ${c.v}, ${n} of ${c.cap} booked">
    <span class="t1"><span>${TT.view==="week"&&!inN?hm(c.t):hm(c.t)+"–"+hm(c.t+c.dur)}</span><span class="cnt2 ${cc}">${n}/${c.cap}</span></span>
    <span class="nm">${s.name}</span><span class="tc">${c.v==='Killingworth'?'KW':'SM'} · ${c.pn} · ${esc2(c.teacher)}</span><span class="mp"><i style="width:${Math.round(n/c.cap*100)}%"></i></span></button>`;
}
function kpis(list){
  const cl=list.filter(c=>!c.cancelled),b=cl.reduce((a,c)=>a+c.sw.length,0),cap=cl.reduce((a,c)=>a+c.cap,0),fill=cap?Math.round(b/cap*100):0;
  const full=cl.filter(c=>space(c)<=0).length,cov=cl.filter(c=>c.cover).length;
  return `<div class="kpi"><span>Classes</span><b>${cl.length}</b><em>${full} full</em></div>
  <div class="kpi"><span>Swimmers booked</span><b>${b}<small style="font-size:16px;color:var(--muted)"> / ${cap}</small></b><div class="bar"><i style="width:${fill}%"></i></div></div>
  <div class="kpi"><span>Spaces left</span><b>${cap-b}</b><em>${fill}% full</em></div>
  <div class="kpi"><span>Waiting list</span><b>${cl.reduce((a,c)=>a+c.wl.length,0)}</b><span>swimmers</span></div>
  <div class="kpi"><span>Need cover</span><b style="color:${cov?'var(--red)':'var(--navy)'}">${cov}</b><span>${cov?'assign a teacher':'all covered'}</span></div>`;
}
function dayGrid(){
  const lanes=POOLS.filter(p=>TT.venues[p.v]),all1=classesFor(TT.w).filter(c=>c.d===TT.d),list=visible(all1),PX=1.75,BRK=38;
  if(!lanes.length)return '<div class="card empty2">Choose at least one venue to see classes.</div>';
  const ts=all1.map(c=>[c.t,c.t+c.dur]).sort((x,y)=>x[0]-y[0]),segs=[];
  ts.forEach(([a,b])=>{a=Math.floor((a-20)/30)*30;b=Math.ceil((b+20)/30)*30;const l=segs[segs.length-1];if(l&&a-l[1]<=90)l[1]=Math.max(l[1],b);else segs.push([a,b])});
  let off=0;segs.forEach((g,i)=>{g.push(off);off+=(g[1]-g[0])*PX+(i<segs.length-1?BRK:0)});
  const H=off,Y=m=>{for(const g of segs)if(m>=g[0]&&m<=g[1])return g[2]+(m-g[0])*PX;return null};
  const isT=TT.w===TODAY.w&&TT.d===TODAY.d,ny=isT?Y(TODAY.m):null;
  const lines=[];segs.forEach((g,i)=>{for(let m=g[0];m<=g[1];m+=30)lines.push(m)});
  const col=p=>`<div class="dg-c" style="height:${H}px">${lines.map(m=>`<div class="hl" style="top:${Y(m)}px"></div>`).join('')}${segs.slice(0,-1).map((g,i)=>`<div class="brk" style="top:${g[2]+(g[1]-g[0])*PX}px;height:${BRK}px"></div>`).join('')}${list.filter(c=>c.pool===p.id).map(c=>block(c,`top:${Y(c.t)+2}px;height:${c.dur*PX-4}px`)).join('')}${ny!==null?`<div class="nowl" style="top:${ny}px"></div>`:''}</div>`;
  return `<div class="dg" id="dg"><div class="dg-in" style="--n:${lanes.length}"><div class="dg-h corner"></div>${lanes.map(p=>`<div class="dg-h">${p.v}<small>${p.n} · ${list.filter(c=>c.pool===p.id).length} classes</small></div>`).join('')}
  <div class="dg-t" style="height:${H}px">${lines.filter(m=>m%60===0).map(m=>`<span style="top:${Y(m)}px">${hm(m)}</span>`).join('')}${segs.slice(0,-1).map(g=>`<span class="bk" style="top:${g[2]+(g[1]-g[0])*PX+BRK/2}px">break</span>`).join('')}</div>${lanes.map(col).join('')}</div></div>`;
}
function weekGrid(){
  const list=visible(classesFor(TT.w));
  return `<div class="wk">${DAYS.map((D,d)=>{const cs=list.filter(c=>c.d===d).sort((a,b)=>a.t-b.t||a.pool.localeCompare(b.pool)),t=TT.w===TODAY.w&&d===TODAY.d;
    return `<div class="wk-d ${t?'today':''}"><h4>${DAYF[d]}<span>${fmt(dateOf(TT.w,d),{day:'numeric',month:'short'})} · ${cs.length}</span></h4>${cs.map(c=>block(c)).join('')||'<div class="empty2">No classes match</div>'}</div>`}).join('')}</div>`;
}
const rangeList=()=>TT.view==='day'?classesFor(TT.w).filter(c=>c.d===TT.d):classesFor(TT.w);
function paint(){
  const k=document.getElementById('ttKpi'),g=document.getElementById('ttGrid');if(!k||!g)return;
  k.innerHTML=kpis(visible(rangeList()));g.innerHTML=TT.view==='day'?dayGrid():weekGrid();
  const hc=document.getElementById('ttHits');if(hc){const q=TT.q.trim();hc.textContent=q?`${visible(rangeList()).filter(hit).length} classes with “${q}”`:''}
}
function toolbar(){
  const cnt=v=>visible(classesFor(TT.w)).filter(c=>c.v===v).length;
  const wkS=dateOf(TT.w,0),wkE=dateOf(TT.w,6);
  const teachers=['All',...TEACH];
  return `<div class="tt-bar">
  <div class="tt-row"><span class="lbl2">Venues</span>
    ${['Killingworth','Shiremoor'].map(v=>`<button class="chip ${TT.venues[v]?'on':''}" data-a="ttVenue" data-v="${v}" aria-pressed="${!!TT.venues[v]}"><span class="bx">${TT.venues[v]?'✓':''}</span>${v}<span class="n">${classesFor(TT.w).filter(c=>c.v===v).length}</span></button>`).join('')}
    <span class="grow"></span>
    <div class="seg"><button class="${TT.view==='day'?'on':''}" data-a="ttView" data-v="day">Day</button><button class="${TT.view==='week'?'on':''}" data-a="ttView" data-v="week">Week</button></div>
    <button class="btn navy sm" data-a="ttBook">${ico('plus',16)} Book a swimmer</button></div>
  <div class="tt-row"><div class="tt-nav"><button class="ib2" data-a="ttWeek" data-n="-1" aria-label="Previous week">${ico('back',16)}</button>
    <span class="tt-date">${fmt(wkS,{day:'numeric',month:'short'})} – ${fmt(wkE,{day:'numeric',month:'short',year:'numeric'})}</span>
    <button class="ib2" data-a="ttWeek" data-n="1" aria-label="Next week"><span style="display:grid;transform:scaleX(-1)">${ico('back',16)}</span></button></div>
    <button class="btn ghost sm" data-a="ttToday">Today</button><span class="grow"></span>
    <select data-tt="teacher" aria-label="Teacher">${teachers.map(t=>`<option ${t===TT.teacher?'selected':''}>${t}</option>`).join('')}</select>
    <button class="chip ${TT.spaces?'on':''}" data-a="ttSpaces" aria-pressed="${TT.spaces}"><span class="bx">${TT.spaces?'✓':''}</span>Spaces only</button>
    <input type="search" data-tt="q" placeholder="Find a swimmer" value="${esc2(TT.q)}" aria-label="Find a swimmer"></div>
  ${TT.view==='day'?`<div class="tt-days">${DAYS.map((D,d)=>`<button class="dpill ${d===TT.d?'on':''} ${TT.w===TODAY.w&&d===TODAY.d?'today':''}" data-a="ttDay" data-d="${d}"><span>${D}</span><b>${dateOf(TT.w,d).getDate()}</b><span>${visible(classesFor(TT.w).filter(c=>c.d===d)).length} classes</span></button>`).join('')}</div>`:''}
  <div class="tt-row"><span class="lbl2">Stage</span>${STAGES.map(s=>{const on=TT.stages[s[0]],any=Object.values(TT.stages).some(Boolean);return `<button class="sg ${on?'on':''} ${any&&!on?'off':''}" style="--c:${s[2]}" data-a="ttStage" data-k="${s[0]}" aria-pressed="${!!on}"><i></i>${s[1].replace('Nemo ','')}</button>`}).join('')}
    ${Object.values(TT.stages).some(Boolean)?'<button class="btn link" data-a="ttStage" data-k="">Clear</button>':''}<span class="tt-help" id="ttHits"></span></div></div>`;
}
window.VIEWS_TT=function(){
  return {eb:'Admin · Killingworth and Shiremoor',h:'Venue timetable',sub:'Every class, swimmer and space across both venues. Hover a class to see who is booked, click it to manage it.',
  body:`${toolbar()}<div class="kpis tt" id="ttKpi"></div><div id="ttGrid"></div><div class="tt-help">${ico('info',15)} Colour shows the stage. The number is swimmers booked out of places. Amber means one space left, dark means full.</div><div id="ttDrawer">${drawer()}</div>`};
};
function drawer(){
  const c=TT.sel&&findC(TT.sel);if(!c)return '';
  const s=ST[c.st],n=c.sw.length,sp=space(c),pr=c.sw.filter(x=>x.att==='present').length;
  return `<div class="drw-s" data-a="ttClose"></div><aside class="drw" style="--c:${s.c}" role="dialog" aria-label="Manage ${s.name}">
  <div class="dh"><button class="x" data-a="ttClose" aria-label="Close">${ico('x',18)}</button><div class="eb" style="font:600 12px var(--display);letter-spacing:1px;text-transform:uppercase;color:var(--ink)">${DAYF[c.d]} ${fmt(dateOf(c.w,c.d),{day:'numeric',month:'long'})}</div><h2>${s.name}</h2>
    <p>${hm(c.t)}–${hm(c.t+c.dur)} · ${c.v}, ${c.pn} · ${s.age}</p></div>
  <div class="db">
    <div class="big"><b>${n}/${c.cap}</b><div class="prog"><i style="width:${n/c.cap*100}%;background:${s.c}"></i></div>${sp<=0?pill('Full','navy'):pill(sp+(sp>1?' spaces':' space'),sp===1?'amber':'green')}</div>
    ${c.cancelled?`<div class="alert t-red" style="padding:10px 14px;border-radius:12px;background:var(--red-bg);color:var(--red)"><b>This class is cancelled.</b> Parents have been told.</div>`:''}
    <div><h4>Teacher ${c.cover?pill('Cover needed','red'):''}</h4><div class="hrow" style="flex-wrap:nowrap"><select data-tt="cover" data-id="${c.id}" style="flex:1" aria-label="Teacher">${TEACH.map(t=>`<option ${t===c.teacher?'selected':''}>${t}</option>`).join('')}</select>${c.cover?`<span class="sub">${esc2(c.teacher)} is off</span>`:''}</div></div>
    <div><h4>Swimmers <span style="text-transform:none;letter-spacing:0;font:500 12.5px var(--body)">${pr} of ${n} marked present</span></h4>
      ${c.sw.map((x,i)=>`<div class="sw-r"><span class="a">${ini(x.n)}</span><span class="nm">${esc2(x.n)} ${x.tag?pill(x.tag,'blue'):''}<small>${x.age}</small></span>
        <button class="mini ${x.att==='present'?'on-p':''}" data-a="ttAtt" data-i="${i}" data-s="present" aria-pressed="${x.att==='present'}">Present</button><button class="mini ${x.att==='absent'?'on-a':''}" data-a="ttAtt" data-i="${i}" data-s="absent" aria-pressed="${x.att==='absent'}">Absent</button>
        <button class="mini ic" data-a="ttMove" data-i="${i}" aria-label="Move ${esc2(x.n)} to another class" title="Move">${ico('arrow',14)}</button><button class="mini ic" data-a="ttRemove" data-i="${i}" aria-label="Remove ${esc2(x.n)}" title="Remove">${ico('x',14)}</button></div>`).join('')||'<div class="empty2">No swimmers booked yet.</div>'}
      <div class="hrow" style="margin-top:12px;flex-wrap:nowrap"><input type="text" id="ttAddN" list="ttNames" placeholder="${sp>0?'Add a swimmer by name':'Add to the waiting list'}" style="flex:1;min-width:0" aria-label="Swimmer name"><datalist id="ttNames">${['Mia Price','Ruby Walsh','Isla Bennett','Zara Khan','Freddie Walsh','Alfie Thompson','Olivia Thompson','Jack Ellis'].map(x=>`<option value="${x}">`).join('')}</datalist><button class="btn sm navy" data-a="ttAdd">${sp>0?'Add':'Join list'}</button></div></div>
    ${c.wl.length?`<div><h4>Waiting list ${pill(c.wl.length,'amber')}</h4>${c.wl.map((x,i)=>`<div class="sw-r"><span class="a">${ini(x)}</span><span class="nm">${esc2(x)}<small>Position ${i+1}</small></span>${sp>0&&i===0?`<button class="btn sm" data-a="ttOffer">Offer space</button>`:''}</div>`).join('')}</div>`:''}
    <div class="dact"><button class="btn ghost sm" data-a="ttMsg">${ico('mail',16)} Message parents</button><button class="btn ghost sm" data-a="ttReg">${ico('check',16)} ${c.done?'Register done':'Complete register'}</button></div>
  </div>
  <div class="df"><button class="btn red sm" data-a="ttCancel">${c.cancelled?'Reinstate class':'Cancel class'}</button><span style="flex:1"></span><button class="btn navy sm" data-a="ttClose">Done</button></div></aside>`;
}
const refresh=(full)=>{if(full){render()}else{paint()}const d=document.getElementById('ttDrawer');if(d)d.innerHTML=drawer()};
const cur=()=>findC(TT.sel);
const logA=(t,w)=>{try{logIt(ME(),'Classes',w)}catch(e){}};
Object.assign(ACT,{
  ttVenue(d){TT.venues[d.v]=!TT.venues[d.v];refresh(1)},
  ttView(d){TT.view=d.v;refresh(1)},
  ttDay(d){TT.d=+d.d;refresh(1)},
  ttWeek(d){TT.w=Math.max(-1,Math.min(3,TT.w+ +d.n));refresh(1)},
  ttToday(){TT.w=TODAY.w;TT.d=TODAY.d;refresh(1)},
  ttSpaces(){TT.spaces=!TT.spaces;refresh(1)},
  ttStage(d){if(!d.k)TT.stages={};else TT.stages[d.k]=!TT.stages[d.k];refresh(1)},
  ttOpen(d){TT.sel=d.id;hidePop();refresh(1)},
  ttClose(){TT.sel=null;refresh(1)},
  ttAtt(d){const c=cur(),s=c.sw[+d.i];s.att=s.att===d.s?null:d.s;logA('',`${s.n} marked ${s.att||'not recorded'} in ${ST[c.st].name}`);refresh(1)},
  ttRemove(d){const c=cur(),s=c.sw.splice(+d.i,1)[0];logA('',`Removed ${s.n} from ${ST[c.st].name}, ${DAYS[c.d]} ${hm(c.t)}`);toast(`${s.n} removed. ${c.wl.length?'The next swimmer on the waiting list can be offered the space.':'The space is open to book.'}`);refresh(1)},
  ttOffer(){const c=cur(),n=c.wl.shift();c.sw.push({n,age:'',tag:'New',att:null});toast(`Space offered to ${n}. They are now booked in.`);refresh(1)},
  ttAdd(){const c=cur(),el=document.getElementById('ttAddN'),n=(el.value||'').trim();if(!n){toast('Type a swimmer name first.');return}
    if(space(c)>0){c.sw.push({n,age:'',tag:'New',att:null});toast(`${n} booked into ${ST[c.st].name}.`)}else{c.wl.push(n);toast(`${n} added to the waiting list.`)}logA('',`Booked ${n} into ${ST[c.st].name}, ${DAYS[c.d]} ${hm(c.t)}`);refresh(1)},
  ttMove(d){const c=cur(),s=c.sw[+d.i],opts=classesFor(c.w).filter(x=>x.id!==c.id&&x.st===c.st&&space(x)>0&&!x.cancelled);
    modal(`Move ${esc2(s.n)}`,`<p class="sub" style="margin:0">Other ${ST[c.st].name} classes this week with a space.</p><div class="form">${opts.map((x,i)=>`<label class="opt"><input type="radio" name="mvC" value="${x.id}" ${i?'':'checked'}><span class="grow"><b style="color:var(--navy);font-family:var(--display)">${DAYF[x.d]} ${hm(x.t)}</b><span class="sub" style="display:block">${x.v}, ${x.pn} · ${space(x)} space${space(x)>1?'s':''}</span></span></label>`).join('')||'<div class="empty">No other class with a space this week.</div>'}</div>`,
    opts.length?`<button class="btn navy" data-a="ttMoveGo" data-i="${d.i}">Move and tell parent</button><button class="btn ghost" data-a="close">Cancel</button>`:`<button class="btn ghost" data-a="close">Close</button>`)},
  ttMoveGo(d){const c=cur(),r=document.querySelector('input[name=mvC]:checked');if(!r)return;const to=findC(r.value),s=c.sw.splice(+d.i,1)[0];to.sw.push(s);close();logA('',`Moved ${s.n} to ${DAYS[to.d]} ${hm(to.t)}`);toast(`${s.n} moved to ${DAYF[to.d]} ${hm(to.t)}. Parent emailed.`);refresh(1)},
  ttMsg(){const c=cur();modal('Message parents',`<div class="form"><p class="sub" style="margin:0">To ${c.sw.length} parents in ${ST[c.st].name}, ${DAYF[c.d]} ${hm(c.t)}.</p><label class="f">Message<textarea id="ttMsgT">Hi, a quick note about this week's ${ST[c.st].name} lesson.</textarea></label></div>`,`<button class="btn navy" data-a="ttMsgGo">Send</button><button class="btn ghost" data-a="close">Cancel</button>`)},
  ttMsgGo(){const c=cur();close();toast(`Message sent to ${c.sw.length} parents.`)},
  ttReg(){const c=cur();c.done=!c.done;logA('',`Register ${c.done?'completed':'reopened'} for ${ST[c.st].name}`);toast(c.done?'Register marked complete.':'Register reopened.');refresh(1)},
  ttCancel(){const c=cur();if(c.cancelled){c.cancelled=false;toast('Class reinstated.');refresh(1);return}
    modal('Cancel this class?',`<p style="margin:0">${ST[c.st].name}, ${DAYF[c.d]} ${hm(c.t)} at ${c.v}. We will email ${c.sw.length} parents and offer a make-up lesson.</p>`,`<button class="btn red" data-a="ttCancelGo">Cancel class and tell parents</button><button class="btn ghost" data-a="close">Keep class</button>`)},
  ttCancelGo(){const c=cur();c.cancelled=true;close();logA('',`Cancelled ${ST[c.st].name}, ${DAYS[c.d]} ${hm(c.t)}`);toast(`Class cancelled. ${c.sw.length} parents emailed.`);refresh(1)},
  ttBook(){const opts=visible(classesFor(TT.w)).filter(c=>space(c)>0&&!c.cancelled).sort((a,b)=>a.d-b.d||a.t-b.t).slice(0,60);
    modal('Book a swimmer',`<div class="form"><label class="f">Swimmer<input type="text" id="bkN" placeholder="For example: Mia Price"></label><label class="f">Class<select id="bkC">${opts.map(c=>`<option value="${c.id}">${DAYS[c.d]} ${hm(c.t)} · ${ST[c.st].name} · ${c.v} · ${space(c)} left</option>`).join('')}</select></label></div>`,`<button class="btn navy" data-a="ttBookGo">Book</button><button class="btn ghost" data-a="close">Cancel</button>`)},
  ttBookGo(){const n=(document.getElementById('bkN').value||'').trim()||'New swimmer',c=findC(document.getElementById('bkC').value);c.sw.push({n,age:'',tag:'New',att:null});close();logA('',`Booked ${n} into ${ST[c.st].name}`);toast(`${n} booked into ${ST[c.st].name}, ${DAYF[c.d]} ${hm(c.t)}.`);TT.w=c.w;TT.d=c.d;TT.sel=c.id;refresh(1)}
});
document.addEventListener('change',e=>{const el=e.target;if(!el.dataset||!el.dataset.tt)return;
  if(el.dataset.tt==='teacher'){TT.teacher=el.value;refresh(1)}
  if(el.dataset.tt==='cover'){const c=findC(el.dataset.id);c.teacher=el.value;c.cover=false;logA('',`${el.value} assigned to cover ${ST[c.st].name}`);toast(`${el.value} assigned. Cover sorted.`);refresh(1)}});
document.addEventListener('input',e=>{const el=e.target;if(el.dataset&&el.dataset.tt==='q'){TT.q=el.value;paint()}
  if(el.id==='gq'){}});
document.addEventListener('keydown',e=>{if(e.target.id==='gq'&&e.key==='Enter'){TT.q=e.target.value;S.view='timetable';render()}if(e.key==='Escape'&&TT.sel){TT.sel=null;if(S.view==='timetable')refresh(1)}});

/* hover pop-up */
const pop=document.createElement('div');pop.className='ttpop';pop.hidden=true;document.body.appendChild(pop);
function hidePop(){pop.hidden=true}
function showPop(c,x,y){
  const s=ST[c.st],n=c.sw.length,sp=space(c);pop.style.setProperty('--c',s.c);pop.dataset.dk=['s7','s8','s6'].includes(c.st)?'1':'';
  pop.innerHTML=`<div class="ph1"><b>${s.name}</b><span>${DAYF[c.d]} ${hm(c.t)}–${hm(c.t+c.dur)} · ${c.v}, ${c.pn}</span></div><div class="bd"><div class="cap"><b>${n}/${c.cap}</b><div class="prog"><i style="width:${n/c.cap*100}%;background:${s.c}"></i></div><span>${sp<=0?'Full':sp+' left'}</span></div>
  <ol>${c.sw.map(w=>`<li><span class="a">${ini(w.n)}</span>${esc2(w.n)}${w.tag?` <small style="margin-left:4px">${w.tag}</small>`:''}<small>${w.att==='present'?'Present':w.att==='absent'?'Absent':w.age}</small></li>`).join('')||'<li style="color:var(--muted)">No swimmers booked yet</li>'}</ol>
  <div class="ft">${esc2(c.teacher)}${c.cover?' · <b style="color:var(--red)">cover needed</b>':''}${c.wl.length?` · ${c.wl.length} on waiting list`:''}<br>Click to manage this class</div></div>`;
  pop.hidden=false;const w=pop.offsetWidth,h=pop.offsetHeight;
  let L=x+18;if(L+w>innerWidth-8)L=x-w-18;pop.style.left=Math.max(8,L)+'px';pop.style.top=Math.max(8,Math.min(innerHeight-h-8,y-20))+'px';
}
document.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||S.view!=='timetable'||TT.sel){if(!pop.hidden)hidePop();return}
  const b=e.target.closest&&e.target.closest('.cb');if(!b){hidePop();return}const c=findC(b.dataset.id);if(c)showPop(c,e.clientX,e.clientY)});
window.addEventListener('scroll',hidePop,{passive:true});document.addEventListener('pointerleave',hidePop,true);

/* shell: nav, dashboard card, staff layout */
I.grid='M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z';
A.timetable=window.VIEWS_TT;
[NAV.admin,NAV.super].forEach(nv=>{if(!nv.some(n=>n[0]==='timetable'))nv.splice(1,0,['timetable','Venue timetable','grid',()=>classesFor(0).filter(c=>c.cover).length])});
TABS.admin=['dash','timetable','inbox','cust'];SHORT.timetable='Timetable';
const _dash=A.dash;
A.dash=function(){const v=_dash(),now=classesFor(0).filter(c=>c.d===TODAY.d&&c.t+c.dur>=TODAY.m&&!c.cancelled).sort((a,b)=>a.t-b.t).slice(0,4);
  inN=true;v.body=`<div class="card"><div class="ch"><div><h3>Next classes today</h3><span class="sub">Wednesday 4 November · both venues</span></div><button class="btn sm navy" data-a="go" data-v="timetable">${ico('cal',16)} Open venue timetable</button></div><div class="nxt">${now.map(c=>block(c)).join('')}</div></div>`+v.body;inN=false;return v};
const _r=render;
render=function(sc){_r(sc);
  const staff=S.role!=='parent';document.body.classList.toggle('staff',staff);
  const sh=document.querySelector('.shell');if(sh&&sh.parentElement)sh.parentElement.classList.add('shellwrap');
  const hd=document.querySelector('.site .wrap');if(hd&&!document.getElementById('gq')){const g=document.createElement('label');g.className='gsearch';g.innerHTML=`<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="gq" type="search" placeholder="Search swimmers, parents, classes" aria-label="Search">`;hd.insertBefore(g,hd.querySelector('.hdr-act'))}
  if(staff){const m=document.getElementById('main'),b=document.getElementById('band');
    if(m&&b&&!m.querySelector('.ph'))m.insertAdjacentHTML('afterbegin',`<div class="ph"><div>${b.innerHTML.replace(/<svg[\s\S]*?<\/svg>/g,'')}</div></div>`);
    const sd=document.getElementById('side');if(sd&&!sd.querySelector('.sb-logo')){sd.insertAdjacentHTML('afterbegin','<div class="sb-logo">PaddleP<i>o</i>d<small>Staff workspace</small></div>');sd.insertAdjacentHTML('beforeend',`<div class="sb-foot"><b>${ME()}</b><span>${{super:'Super admin',admin:'Admin',teacher:'Teacher'}[S.role]}</span><span>Killingworth · Shiremoor</span></div>`)}
    if(S.view==='timetable')paint();}
};
const _fh=window.__h0||'';
try{if(!_fh||_fh==='#'){S.role='admin';S.view='timetable'}else{const h=_fh.slice(1).split('-');if(VIEWS[h[0]]&&VIEWS[h[0]][h[1]]){S.role=h[0];S.view=h[1]}}}catch(e){}
render();
})();
