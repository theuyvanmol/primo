/* PaddlePod staff workspace: venue timetable (prototype, sample data) */
(function(){
const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],DAYF=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const MON0=new Date(2026,10,2),TODAY={w:0,d:2,m:16*60+40};
const STAGES=[['b1','Baby 0-9 months','#8FD0F0',6,'0 to 9 months','baby'],['b2','Baby 9-18 months','#5BB5E6',6,'9 to 18 months','baby'],['t1','Toddler 18-30 months','#5CCBB5',6,'18 to 30 months','tod'],['t2','Toddler 30-36 months','#2FA896',6,'30 to 36 months','tod'],
 ['nr','Nemo 3+ Red','#EF6B6B',6,'3+ years','nemo'],['no','Nemo 3+ Orange','#F5A04A',6,'3+ years','nemo'],['ny','Nemo 3+ Yellow','#F2CB4D',6,'3+ years','nemo'],['ng','Nemo 3+ Green','#7BC06A',6,'3+ years','nemo'],['nb','Nemo 3+ Blue','#5F8FE0',6,'3+ years','nemo'],
 ['s1','Stage 1','#F7D26B',6,'5 years','s14'],['s2','Stage 2','#F6B45A',6,'6 years','s14'],['s3','Stage 3','#F39A6B',6,'6 years','s14'],['s4','Stage 4','#EC7F8E',6,'7 years','s14'],
 ['s5','Stage 5','#D880B8',8,'8 years','s57'],['s6','Stage 6','#B58AE0',8,'9 years','s57'],['s7','Stage 7','#8C93E8',8,'10 years','s57'],
 ['s8','Stage 8','#6C86C9',8,'11 years','s810'],['s9','Stage 9','#4F6BA8',8,'11 years','s810'],['s10','Stage 10','#3A4F86',8,'12 years','s810'],
 ['pc','Pre-Comp (Stages 9 and 10)','#2D3E6E',10,'12+ years','adv'],['sf','Junior SwimFit','#6B7F95',8,'11+ years','adv'],['pv','Private','#A7B3BF',1,'1 to 1','pv']];
const FAM=[['baby','Baby'],['tod','Toddler'],['nemo','Nemo 3+'],['s14','Stages 1-4'],['s57','Stages 5-7'],['s810','Stages 8-10'],['adv','Pre-Comp & SwimFit'],['pv','Private']];
const ST=Object.fromEntries(STAGES.map(s=>[s[0],{k:s[0],name:s[1],c:s[2],cap:s[3],age:s[4],fam:s[5]}]));
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
    if(d<5){if(p.id!=='kw1')['09:15','09:45','10:15','10:45'].forEach(t=>slots.push([t,1]));['15:45','16:15','16:45','17:15','17:45','18:15'].forEach(t=>slots.push([t,0]));if(p.id==='kw1'&&[2,3].includes(d))slots.push(['19:00',2])}
    else if(d===5)['08:45','09:15','09:45','10:15','10:45','11:15','11:45','12:15'].forEach((t,i)=>slots.push([t,(i<3&&p.id!=='kw1')?1:0]));
    else if(p.id!=='sm1')['09:00','09:30','10:00','10:30','11:00','11:30','12:00'].forEach((t,i)=>slots.push([t,i<2&&p.id==='kw2'?1:0]));
    slots.forEach(([t,kind],si)=>{
      const id=`w${w}-${d}-${p.id}-${si}`,r=rngF(id);
      const keys=kind===1?['b1','b2','t1','t2','nr','no','ny','ng','nb']:kind===2?['sf','pc']:['s1','s2','s3','s4','s5','s6','s7','s8','s9','s10','pv','s3','s4','s5','s6','s7'];
      const st=ST[keys[Math.floor(r()*keys.length)]];
      let n,x=r();n=st.cap===1?(r()<.7?1:0):x<.24?st.cap:x<.36?1+Math.floor(r()*2):Math.max(2,st.cap-1-Math.floor(r()*3));
      const teacher=TEACH[Math.floor(r()*TEACH.length)];
      const past=w<0||(w===0&&(d<TODAY.d||(d===TODAY.d&&tm(t)+30<TODAY.m)));
      const used=new Set(),mk=()=>{let nm;do{nm=FN[Math.floor(r()*FN.length)]+' '+LN[Math.floor(r()*LN.length)]}while(used.has(nm));used.add(nm);return nm};
      const ageOf=()=>st.fam==='baby'?(st.k==='b1'?(3+Math.floor(r()*6))+' months':(9+Math.floor(r()*9))+' months'):st.fam==='tod'?(2+Math.floor(r()*2))+' years':st.fam==='nemo'?(3+Math.floor(r()*2))+' years':st.k==='pv'?'':(parseInt(st.k.slice(1))||9)+4+' years';
      const sw=[];for(let i=0;i<n;i++){const a=r();sw.push({n:mk(),age:ageOf(),tag:a<.08?'Trial':a<.14?'New':'',att:past?(r()<.1?'absent':'present'):null})}
      const wait=n===st.cap&&st.cap>1?Math.floor(r()*3):0,wl=[];for(let i=0;i<wait;i++)wl.push(mk());
      out.push({id,w,d,pool:p.id,v:p.v,pn:p.n,t:tm(t),dur:30,st:st.k,cap:st.cap,teacher,sw,wl,cover:false,cancelled:false,done:past});
    });
  });
  if(w===0){out.forEach(c=>{if(c.d===3&&c.pool==='sm1'&&c.t<12*60){c.teacher='Hannah Reid';c.cover=true}});}
  return CACHE[w]=out;
}
const all=()=>{const a=[];for(let w=-1;w<=3;w++)a.push(...classesFor(w));return a};
const findC=id=>all().find(c=>c.id===id);
const TT=window.TT={draft:false,sort:{k:'day',d:1},fo:false,sheet:false,exp:null,w:0,view:'day',d:TODAY.d,venues:{Killingworth:true,Shiremoor:true},mv:'cal',stages:{},teacher:'All',spaces:false,q:'',sel:null};
const isTT=()=>S.view==='timetable'||S.view==='planner';
const esc2=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ini=n=>n.split(' ').map(x=>x[0]).join('').slice(0,2);
const space=c=>c.cap-c.sw.length;
const dirty=c=>!!(c._o||c._new||c._del);
const dirtyList=window.dirtyList=()=>all().filter(dirty);
function visible(arr){
  const sg=Object.keys(TT.stages).filter(k=>TT.stages[k]);
  return arr.filter(c=>(TT.draft||!c._del)&&TT.venues[c.v]&&(!sg.length||sg.includes(ST[c.st].fam))&&(TT.teacher==='All'||c.teacher===TT.teacher)&&(!TT.spaces||(space(c)>0&&!c.cancelled)));
}
const hit=c=>{const q=TT.q.trim().toLowerCase();return q&&c.sw.some(s=>s.n.toLowerCase().includes(q))};
let GRID=null,inN=false;function block(c,style=''){
  const s=ST[c.st],sp=space(c),n=c.sw.length,cls=['cb',c.cover&&!c.cancelled?'cover':'',c.cancelled||c._del?'cancelled':'',dirty(c)&&TT.draft?'draft':'',TT.sel===c.id?'sel':'',c.done?'done':'',TT.q.trim()?(hit(c)?'hit':'dim'):''].join(' ');
  const cc=n>=c.cap?'full':(sp<=1&&n>0?'low':'');
  return `<button class="${cls}" style="--c:${s.c};${style}" data-a="ttOpen" data-id="${c.id}" aria-label="${s.name}, ${hm(c.t)}, ${c.v}, ${n} of ${c.cap} booked">
    <span class="t1"><span>${(TT.view==="week"&&!inN)||isM()?hm(c.t):hm(c.t)+"–"+hm(c.t+c.dur)}</span><span class="cnt2 ${cc}">${n}/${c.cap}</span></span>${dirty(c)&&TT.draft?`<span class="dtag">${c._new?"New":c._del?"Removed":"Moved"}</span>`:""}
    <span class="nm">${s.name}</span><span class="tc">${c.v==='Killingworth'?'KW':'SM'} · ${c.pn} · ${esc2(c.teacher)}</span><span class="mp"><i style="width:${Math.round(n/c.cap*100)}%"></i></span></button>`;
}
function kpis(list){
  const cl=list.filter(c=>!c.cancelled&&!c._del),b=cl.reduce((a,c)=>a+c.sw.length,0),cap=cl.reduce((a,c)=>a+c.cap,0),fill=cap?Math.round(b/cap*100):0;
  const full=cl.filter(c=>space(c)<=0).length,cov=cl.filter(c=>c.cover).length;
  return `<span><b>${cl.length}</b> classes${full?` <em>${full} full</em>`:''}</span><span><b>${b}</b>/${cap} booked</span><span><b>${cap-b}</b> spaces left</span><span class="fl"><i><u style="width:${fill}%"></u></i><b>${fill}%</b> full</span>${cov?`<span class="cv"><b>${cov}</b> need cover</span>`:''}`;
}
function dayGrid(){
  const lanes=POOLS.filter(p=>TT.venues[p.v]),all1=classesFor(TT.w).filter(c=>c.d===TT.d),list=visible(all1),PX=2.5,BRK=38;
  if(!lanes.length)return '<div class="card empty2">Choose at least one venue to see classes.</div>';
  const ts=all1.map(c=>[c.t,c.t+c.dur]).sort((x,y)=>x[0]-y[0]),segs=[];
  ts.forEach(([a,b])=>{a=Math.floor((a-(isM()?8:20))/30)*30;b=Math.ceil((b+(isM()?8:20))/30)*30;const l=segs[segs.length-1];if(l&&a-l[1]<=90)l[1]=Math.max(l[1],b);else segs.push([a,b])});
  let off=0;segs.forEach((g,i)=>{g.push(off);off+=(g[1]-g[0])*PX+(i<segs.length-1?BRK:0)});
  GRID={segs,PX};const H=off,Y=m=>{for(const g of segs)if(m>=g[0]&&m<=g[1])return g[2]+(m-g[0])*PX;return null};
  const isT=TT.w===TODAY.w&&TT.d===TODAY.d,ny=isT?Y(TODAY.m):null;
  const lines=[];segs.forEach((g,i)=>{for(let m=g[0];m<=g[1];m+=30)lines.push(m)});
  const col=p=>`<div class="dg-c" data-pool="${p.id}" style="height:${H}px">${lines.map(m=>`<div class="hl" style="top:${Y(m)}px"></div>`).join('')}${segs.slice(0,-1).map((g,i)=>`<div class="brk" style="top:${g[2]+(g[1]-g[0])*PX}px;height:${BRK}px"></div>`).join('')}${list.filter(c=>c.pool===p.id).map(c=>block(c,`top:${Y(c.t)+2}px;height:${c.dur*PX-4}px`)).join('')}${ny!==null?`<div class="nowl" style="top:${ny}px"></div>`:''}</div>`;
  return `<div class="dg ${TT.draft?"dr":""}" id="dg"><div class="dg-in" style="--n:${lanes.length}"><div class="dg-h corner"></div>${lanes.map(p=>`<div class="dg-h">${p.v}<small>${p.n} · ${list.filter(c=>c.pool===p.id).length} classes</small></div>`).join('')}
  <div class="dg-t" style="height:${H}px">${lines.filter(m=>m%60===0).map(m=>`<span style="top:${Y(m)}px">${hm(m)}</span>`).join('')}${segs.slice(0,-1).map(g=>`<span class="bk" style="top:${g[2]+(g[1]-g[0])*PX+BRK/2}px">break</span>`).join('')}</div>${lanes.map(col).join('')}</div></div>`;
}
const isM=()=>window.matchMedia('(max-width:900px)').matches;
function agenda(){
  const list=visible(classesFor(TT.w).filter(c=>c.d===TT.d)).sort((x,y)=>x.t-y.t||x.pool.localeCompare(y.pool));
  if(!list.length)return '<div class="card empty2">No classes match your filters on this day.<br><button class="btn link" data-a="ttStage" data-k="">Clear filters</button></div>';
  let h='',last=-1;
  list.forEach(c=>{const s=ST[c.st],n=c.sw.length,pc=Math.round(n/c.cap*100),open=TT.exp===c.id,hr=Math.floor(c.t/60);
    if(hr!==last){h+=`<div class="ag-h">${String(hr).padStart(2,'0')}:00</div>`;last=hr}
    h+=`<article class="ag ${open?'open':''} ${c.cancelled?'cancelled':''}" style="--c:${s.c}"><button class="ag-m" data-a="ttExp" data-id="${c.id}" aria-expanded="${open}"><span class="ag-t"><b>${hm(c.t)}</b><small>${c.dur} min</small></span>
      <span class="ag-b"><b>${s.name}</b><small>${c.v} · ${c.pn}</small><small>${esc2(c.teacher)}${c.cover?' · <em>cover needed</em>':''}</small></span>
      <span class="ring" style="--p:${pc}"><b>${n}/${c.cap}</b></span></button>
      ${open?`<div class="ag-x">${c.sw.map(w=>`<span class="sc"><i>${ini(w.n)}</i>${esc2(w.n.split(' ')[0])}${w.att==='absent'?' <u>absent</u>':''}</span>`).join('')||'<span class="sub">No swimmers yet</span>'}${c.wl.length?`<span class="sc wl">+${c.wl.length} waiting</span>`:''}<button class="btn navy sm" data-a="ttOpen" data-id="${c.id}">Manage class</button></div>`:''}</article>`});
  return h;
}
const SHORT_ST={b1:'Baby',b2:'Baby',t1:'Tod',t2:'Tod',nr:'Red',no:'Orange',ny:'Yellow',ng:'Green',nb:'Blue',pc:'Pre-Comp',sf:'SwimFit',pv:'Private'};
const shortSt=k=>SHORT_ST[k]||k.toUpperCase();
function mc(c){const s=ST[c.st],n=c.sw.length,cls=['mc',n>=c.cap?'full':'',c.cancelled?'cancelled':'',c.cover?'cov':'',TT.sel===c.id?'sel':'',TT.q.trim()?(hit(c)?'hit':'dim'):''].join(' ');
  return `<button class="${cls}" style="--c:${s.c}" data-a="ttOpen" data-id="${c.id}" aria-label="${s.name}, ${hm(c.t)}, ${c.v}, ${n} of ${c.cap} booked"><i>${c.v[0]}</i><span>${hm(c.t)}</span><em>${shortSt(c.st)}</em><b>${n}/${c.cap}</b></button>`}
function weekTiles(){
  const base=classesFor(TT.w),list=visible(base),hrs=[...new Set(base.map(c=>Math.floor(c.t/60)))].sort((a,b)=>a-b);
  return `<div class="wg ${TT.draft?"dr":""}"><div class="wg-in"><div class="wg-h"></div>${DAYF.map((D,d)=>{const t=TT.w===TODAY.w&&d===TODAY.d,k=list.filter(c=>c.d===d).length;return `<div class="wg-h ${t?'today':''}"><b>${DAYS[d]}</b> ${dateOf(TT.w,d).getDate()}<small>${k} classes</small></div>`}).join('')}
  ${hrs.map(h=>`<div class="wg-t">${String(h).padStart(2,'0')}:00</div>${DAYS.map((D,d)=>{const cs=list.filter(c=>c.d===d&&Math.floor(c.t/60)===h).sort((a,b)=>a.t-b.t);return `<div class="wg-c ${TT.w===TODAY.w&&d===TODAY.d?'today':''}">${cs.map(mc).join('')}</div>`}).join('')}`).join('')}</div></div>`;
}
function weekGrid(){
  const lanes=POOLS.filter(p=>TT.venues[p.v]);if(!lanes.length)return '<div class="card empty2">Choose at least one venue to see classes.</div>';
  const base=classesFor(TT.w),list=visible(base),PX=2.3,BRK=34;
  const ts=base.map(c=>[c.t,c.t+c.dur]).sort((x,y)=>x[0]-y[0]),segs=[];
  ts.forEach(([a,b])=>{a=Math.floor((a-20)/30)*30;b=Math.ceil((b+20)/30)*30;const l=segs[segs.length-1];if(l&&a-l[1]<=90)l[1]=Math.max(l[1],b);else segs.push([a,b])});
  let off=0;segs.forEach((g,i)=>{g.push(off);off+=(g[1]-g[0])*PX+(i<segs.length-1?BRK:0)});
  const H=off,Y=m=>{for(const g of segs)if(m>=g[0]&&m<=g[1])return g[2]+(m-g[0])*PX;return null};
  const lines=[];segs.forEach(g=>{for(let m=g[0];m<=g[1];m+=30)lines.push(m)});
  const hl=lines.map(m=>`<div class="hl" style="top:${Y(m)}px"></div>`).join('')+segs.slice(0,-1).map(g=>`<div class="brk" style="top:${g[2]+(g[1]-g[0])*PX}px;height:${BRK}px"></div>`).join('');
  const n=lanes.length;
  const heads=DAYF.map((D,d)=>{const t=TT.w===TODAY.w&&d===TODAY.d,k=list.filter(c=>c.d===d&&!c.cancelled).length;return `<div class="w2-h ${t?'today':''}" style="grid-column:span ${n}"><button data-a="ttDay" data-d="${d}"><b>${DAYS[d]} ${dateOf(TT.w,d).getDate()}</b><small>${k} classes${t?' · today':''}</small></button><div class="w2-l">${lanes.map(p=>`<span>${p.v[0]} ${p.n.split(' ')[0]}</span>`).join('')}</div></div>`}).join('');
  const cols=DAYF.map((D,d)=>lanes.map((p,i)=>`<div class="w2-c ${i===0?'first':''} ${TT.w===TODAY.w&&d===TODAY.d?'today':''}" style="height:${H}px">${hl}${list.filter(c=>c.d===d&&c.pool===p.id).map(c=>block(c,`top:${Y(c.t)+2}px;height:${c.dur*PX-4}px`).replace(/<span class="nm">[^<]*<\/span>/,`<span class="nm">${shortSt(c.st)}</span>`)).join('')}</div>`).join('')).join('');
  return `<div class="w2 ${TT.draft?'dr':''}"><div class="w2-in" style="--n:${n}"><div class="w2-h corner"></div>${heads}<div class="w2-t" style="height:${H}px">${lines.filter(m=>m%60===0).map(m=>`<span style="top:${Y(m)}px">${hm(m)}</span>`).join('')}${segs.slice(0,-1).map(g=>`<span class="bk" style="top:${g[2]+(g[1]-g[0])*PX+BRK/2}px">break</span>`).join('')}</div>${cols}</div></div>`;
}
function listView(){
  const k=TT.sort.k,dir=TT.sort.d,key={day:c=>c.d*2000+c.t,time:c=>c.t*10+c.d,venue:c=>c.v+c.pn,stage:c=>STAGES.findIndex(x=>x[0]===c.st),teacher:c=>c.teacher,booked:c=>c.sw.length,spaces:c=>space(c)}[k]||(c=>c.d*2000+c.t);
  const rows=visible(classesFor(TT.w)).slice().sort((a,b)=>{const x=key(a),y=key(b);return(x>y?1:x<y?-1:0)*dir});
  const th=(l,kk)=>`<th><button data-a="ttSort" data-k="${kk}">${l}${TT.sort.k===kk?(TT.sort.d>0?' ▲':' ▼'):''}</button></th>`;
  return `<div class="lv ${TT.draft?'dr':''}"><div class="lv-bar"><span>${rows.length} classes · week of ${fmt(dateOf(TT.w,0),{day:'numeric',month:'short'})}</span><button class="btn ghost sm" data-a="ttCsv">Download for Excel (CSV)</button></div><div class="lv-s"><table><thead><tr>${th('Day','day')}${th('Time','time')}${th('Venue','venue')}${th('Stage','stage')}${th('Teacher','teacher')}${th('Booked','booked')}${th('Spaces','spaces')}<th>Waiting</th><th>Status</th></tr></thead><tbody>
  ${rows.map(c=>{const s=ST[c.st],n=c.sw.length;return `<tr class="${dirty(c)&&TT.draft?'draft':''}" data-a="ttOpen" data-id="${c.id}" tabindex="0"><td>${DAYS[c.d]} ${dateOf(c.w,c.d).getDate()}</td><td><b>${hm(c.t)}</b></td><td>${c.v}<small>${c.pn}</small></td><td><span class="sdot" style="background:${s.c}"></span>${s.name}</td><td>${esc2(c.teacher)}</td><td><span class="cnt2 ${n>=c.cap?'full':space(c)===1?'low':''}">${n}/${c.cap}</span></td><td>${space(c)}</td><td>${c.wl.length||''}</td><td>${c._del?pill('Removed','red'):c._new?pill('New','blue'):dirty(c)&&TT.draft?pill('Moved','amber'):c.cancelled?pill('Cancelled','red'):c.cover?pill('Cover needed','red'):c.done?pill('Done','green'):''}</td></tr>`}).join('')}</tbody></table></div></div>`;
}
const csvEsc=v=>'"'+String(v).replace(/"/g,'""')+'"';
const rangeList=()=>TT.view==='day'||isM()?classesFor(TT.w).filter(c=>c.d===TT.d):classesFor(TT.w);
function paint(){
  const k=document.getElementById('ttKpi'),g=document.getElementById('ttGrid');if(!k||!g)return;
  k.innerHTML=kpis(visible(rangeList()));g.innerHTML=isM()?(TT.mv==='cal'?dayGrid():agenda()):TT.view==='list'?listView():TT.view==='day'?dayGrid():weekGrid();
  const hc=document.getElementById('ttHits');if(hc){const q=TT.q.trim();hc.textContent=q?`${visible(rangeList()).filter(hit).length} classes with “${q}”`:''}
}
const actF=()=>Object.values(TT.stages).filter(Boolean).length+(TT.teacher!=='All'?1:0)+(TT.spaces?1:0)+(TT.q.trim()?1:0);
function stageChips(){const any=Object.values(TT.stages).some(Boolean);return FAM.map(f=>{const on=TT.stages[f[0]];return `<button class="sg ${on?'on':''} ${any&&!on?'off':''}" data-a="ttStage" data-k="${f[0]}" aria-pressed="${!!on}"><span class="dots">${STAGES.filter(x=>x[5]===f[0]).slice(0,5).map(x=>`<i style="background:${x[2]}"></i>`).join('')}</span>${f[1]}</button>`}).join('')}
function filterFields(){return `<div class="ff"><label>Stage<div class="chips">${stageChips()}</div></label>
  <label>Teacher<select data-tt="teacher">${['All',...TEACH].map(t=>`<option ${t===TT.teacher?'selected':''}>${t}</option>`).join('')}</select></label>
  <label>Swimmer<input type="search" data-tt="q" placeholder="Find a swimmer" value="${esc2(TT.q)}"></label>
  <button class="chip ${TT.spaces?'on':''}" data-a="ttSpaces" aria-pressed="${TT.spaces}"><span class="bx">${TT.spaces?'✓':''}</span>Only classes with spaces</button></div>`}
function banner(){const d=dirtyList(),mv=d.filter(c=>c._o&&!c._new&&!c._del).length,nw=d.filter(c=>c._new).length,rm=d.filter(c=>c._del).length,aff=affected(d);
  return `<div class="dbar"><div class="dtx"><b>Sandbox</b> <span>Nothing here is live until you publish. ${d.length?`${d.length} change${d.length>1?'s':''}${mv?` · ${mv} moved`:''}${nw?` · ${nw} new`:''}${rm?` · ${rm} removed`:''}${aff?` · ${aff} swimmers affected`:''}`:(isM()?(TT.mv==='cal'?'Press and hold a class, then drag it to a new time, pool or day.':'Tap a class to move it.'):'Drag classes to move them, or click one to edit it.')}</span></div>
  <div class="dbt"><button class="btn ghost sm" data-a="ttAddClass">${ico('plus',16)} Add class</button>${d.length?`<button class="btn ghost sm" data-a="ttDiscard">Discard</button><button class="btn sm" data-a="ttReview">Review and publish</button>`:''}</div></div>`}
function affected(d){return d.filter(c=>c._o&&(c._o.d!==c.d||c._o.t!==c.t||c._o.pool!==c.pool)||c._del).reduce((a,c)=>a+c.sw.length,0)}
function tryMove(c,to,commit){
  const p=POOLS.find(x=>x.id===(to.pool||c.pool)),d=to.d!=null?to.d:c.d,t=to.t!=null?to.t:c.t,teacher=to.teacher||c.teacher;
  if(t<480||t+c.dur>1200)return{ok:false,msg:'Classes have to sit between 08:00 and 20:00.'};
  const others=classesFor(c.w).filter(x=>x!==c&&!x._del&&!x.cancelled);
  const pc=others.find(x=>x.d===d&&x.pool===p.id&&x.t<t+c.dur&&t<x.t+x.dur);
  if(pc)return{ok:false,msg:`${p.v} ${p.n} is already in use at ${hm(pc.t)}.`};
  const tcl=others.find(x=>x.d===d&&x.teacher===teacher&&x.t<t+c.dur&&t<x.t+x.dur);
  if(commit){if(!c._o)c._o={d:c.d,t:c.t,pool:c.pool,v:c.v,pn:c.pn,teacher:c.teacher};Object.assign(c,{d,t,pool:p.id,v:p.v,pn:p.n,teacher});
    if(c._o.d===c.d&&c._o.t===c.t&&c._o.pool===c.pool&&c._o.teacher===c.teacher&&!c._new)delete c._o}
  return{ok:true,warn:tcl?`${teacher} is also teaching at ${hm(tcl.t)}.`:''};
}
function revert(c){if(c._o){Object.assign(c,c._o);delete c._o}c._del=false}
function toolbar(){
  const wkS=dateOf(TT.w,0),wkE=dateOf(TT.w,6),n=actF();
  return `<div class="tt-bar">
  <div class="tt-rows"><div class="tt-r1"><h2 class="tt-title">${S.view==='planner'?'Class planner':'Venue timetable'}</h2>
    <div class="tt-nav"><button class="ib2" data-a="ttWeek" data-n="-1" aria-label="Previous week">${ico('back',16)}</button>
    <span class="tt-date">${fmt(wkS,{day:'numeric',month:'short'})} – ${fmt(wkE,{day:'numeric',month:'short'})}</span>
    <button class="ib2" data-a="ttWeek" data-n="1" aria-label="Next week"><span style="display:grid;transform:scaleX(-1)">${ico('back',16)}</span></button></div>
    <button class="btn ghost sm" data-a="ttToday">Today</button><span class="grow"></span>
    <div class="seg mode"><button class="${TT.draft?'':'on'}" data-a="ttMode" data-m="live">Live</button><button class="${TT.draft?'on sb':''}" data-a="ttMode" data-m="draft">Sandbox</button></div>
    <button class="btn navy sm dsk" data-a="ttBook">${ico('plus',16)} Book a swimmer</button></div>
  <div class="tt-r2"><div class="vchips">${['Killingworth','Shiremoor'].map(v=>`<button class="chip ${TT.venues[v]?'on':''}" data-a="ttVenue" data-v="${v}" aria-pressed="${!!TT.venues[v]}"><span class="bx">${TT.venues[v]?'✓':''}</span>${v}</button>`).join('')}</div><span class="grow"></span>
    <div class="seg vm"><button class="${TT.mv==='cal'?'on':''}" data-a="ttMv" data-v="cal">Calendar</button><button class="${TT.mv==='list'?'on':''}" data-a="ttMv" data-v="list">List</button></div>
    <div class="seg dsk"><button class="${TT.view==='day'?'on':''}" data-a="ttView" data-v="day">Day</button><button class="${TT.view==='week'?'on':''}" data-a="ttView" data-v="week">Week</button><button class="${TT.view==='list'?'on':''}" data-a="ttView" data-v="list">List</button></div>
    <button class="chip fbtn" data-a="ttFilters">${ico('sliders',16)} Filters${n?`<span class="nb">${n}</span>`:''}</button></div></div>
  ${TT.draft?banner():''}
  ${TT.view==='day'||isM()?`<div class="tt-days" id="ttDays">${DAYS.map((D,d)=>`<button class="dpill ${d===TT.d?'on':''} ${TT.w===TODAY.w&&d===TODAY.d?'today':''}" data-a="ttDay" data-d="${d}"><span>${D}</span><b>${dateOf(TT.w,d).getDate()}</b><span>${visible(classesFor(TT.w).filter(c=>c.d===d)).length}</span></button>`).join('')}</div>`:''}
  <div class="fpanel" ${TT.fo?'':'hidden'} id="fpanel">${TT.fo?filterFields():''}</div></div>`;
}
window.VIEWS_TT=function(){if(S.view==='planner'&&TT._v!=='planner')TT.draft=true;if(S.view==='timetable'&&TT._v==='planner'&&!dirtyList().length)TT.draft=false;TT._v=S.view;
  return {eb:'Admin · Killingworth and Shiremoor',h:'Venue timetable',sub:'Every class, swimmer and space across both venues. Hover a class to see who is booked, click it to manage it.',
  body:`${toolbar()}<div class="ks" id="ttKpi"></div><div id="ttGrid"></div><div class="tt-help">${ico('info',15)} Colour shows the stage. The number is swimmers booked out of places. Amber means one space left, dark means full.</div><button class="fab" data-a="ttBook" aria-label="Book a swimmer">${ico('plus',24)}</button><div id="ttDrawer">${drawer()}</div>`};
};
function editPanel(c){const slots=[];for(let m=480;m<=1170;m+=15)slots.push(m);
  return `<div class="dpanel"><h4>Edit in sandbox ${dirty(c)?pill(c._new?'New':c._del?'Removed':'Changed','amber'):''}</h4>${c._o?`<p class="sub" style="margin:0 0 8px">Was ${DAYS[c._o.d]} ${hm(c._o.t)}, ${c._o.v} ${c._o.pn}${c._o.teacher!==c.teacher?', '+esc2(c._o.teacher):''}</p>`:''}
  <div class="eg"><label>Day<select id="edDay">${DAYF.map((D,i)=>`<option value="${i}" ${i===c.d?'selected':''}>${D} ${dateOf(c.w,i).getDate()}</option>`).join('')}</select></label><label>Start<select id="edTime">${slots.map(m=>`<option value="${m}" ${m===c.t?'selected':''}>${hm(m)}</option>`).join('')}</select></label>
  <label>Pool<select id="edPool">${POOLS.map(p=>`<option value="${p.id}" ${p.id===c.pool?'selected':''}>${p.v} · ${p.n}</option>`).join('')}</select></label><label>Teacher<select id="edTeacher">${TEACH.map(t=>`<option ${t===c.teacher?'selected':''}>${t}</option>`).join('')}</select></label></div>
  ${c.sw.length?`<p class="sub" style="margin:8px 0 0">${c.sw.length} swimmers will be told if you publish a change to day, time or pool.</p>`:''}
  <div class="hrow" style="margin-top:10px"><button class="btn sm navy" data-a="ttApply">Apply</button>${dirty(c)?`<button class="btn sm ghost" data-a="ttRevert">Undo</button>`:''}<button class="btn sm red" data-a="ttDel">${c._del?'Keep class':'Remove class'}</button></div></div>`}
function drawer(){
  const c=TT.sel&&findC(TT.sel);if(!c)return '';
  const s=ST[c.st],n=c.sw.length,sp=space(c),pr=c.sw.filter(x=>x.att==='present').length;
  return `<div class="drw-s" data-a="ttClose"></div><aside class="drw" style="--c:${s.c}" role="dialog" aria-label="Manage ${s.name}">
  <div class="dh"><button class="x" data-a="ttClose" aria-label="Close">${ico('x',18)}</button><div class="eb" style="font:600 12px var(--display);letter-spacing:1px;text-transform:uppercase;color:var(--ink)">${DAYF[c.d]} ${fmt(dateOf(c.w,c.d),{day:'numeric',month:'long'})}</div><h2>${s.name}</h2>
    <p>${hm(c.t)}–${hm(c.t+c.dur)} · ${c.v}, ${c.pn} · ${s.age}</p></div>
  <div class="db">
    <button class="btn navy cpbtn" data-a="cpOpen">Open class page and edit details</button>
    <div class="big"><b>${n}/${c.cap}</b><div class="prog"><i style="width:${n/c.cap*100}%;background:${s.c}"></i></div>${sp<=0?pill('Full','navy'):pill(sp+(sp>1?' spaces':' space'),sp===1?'amber':'green')}</div>
    ${TT.draft?editPanel(c):''}
    ${c.cancelled?`<div class="alert t-red" style="padding:10px 14px;border-radius:12px;background:var(--red-bg);color:var(--red)"><b>This class is cancelled.</b> Parents have been told.</div>`:''}
    <div><h4>Teacher ${c.cover?pill('Cover needed','red'):''}</h4><div class="hrow" style="flex-wrap:nowrap"><select data-tt="cover" data-id="${c.id}" style="flex:1" aria-label="Teacher">${TEACH.map(t=>`<option ${t===c.teacher?'selected':''}>${t}</option>`).join('')}</select>${c.cover?`<span class="sub">${esc2(c.teacher)} is off</span>`:''}</div></div>
    <div><h4>Swimmers <span style="text-transform:none;letter-spacing:0;font:500 12.5px var(--body)">${pr} of ${n} marked present</span></h4>
      ${c.sw.map((x,i)=>`<div class="sw-r"><span class="a">${ini(x.n)}</span><span class="nm">${esc2(x.n)} ${x.tag?pill(x.tag,'blue'):''}<small>${x.age}</small></span>
        <span class="att"><button class="mini ${x.att==='present'?'on-p':''}" data-a="ttAtt" data-i="${i}" data-s="present" aria-pressed="${x.att==='present'}">Present</button><button class="mini ${x.att==='absent'?'on-a':''}" data-a="ttAtt" data-i="${i}" data-s="absent" aria-pressed="${x.att==='absent'}">Absent</button></span><span class="acts">
        <button class="mini ic" data-a="ttMove" data-i="${i}" aria-label="Move ${esc2(x.n)} to another class" title="Move">${ico('arrow',14)}</button><button class="mini ic" data-a="ttRemove" data-i="${i}" aria-label="Remove ${esc2(x.n)}" title="Remove">${ico('x',14)}</button></span></div>`).join('')||'<div class="empty2">No swimmers booked yet.</div>'}
      <div class="hrow" style="margin-top:12px;flex-wrap:nowrap"><input type="text" id="ttAddN" list="ttNames" placeholder="${sp>0?'Add a swimmer by name':'Add to the waiting list'}" style="flex:1;min-width:0" aria-label="Swimmer name"><datalist id="ttNames">${['Mia Price','Ruby Walsh','Isla Bennett','Zara Khan','Freddie Walsh','Alfie Thompson','Olivia Thompson','Jack Ellis'].map(x=>`<option value="${x}">`).join('')}</datalist><button class="btn sm navy" data-a="ttAdd">${sp>0?'Add':'Join list'}</button></div></div>
    ${c.wl.length?`<div><h4>Waiting list ${pill(c.wl.length,'amber')}</h4>${c.wl.map((x,i)=>`<div class="sw-r"><span class="a">${ini(x)}</span><span class="nm">${esc2(x)}<small>Position ${i+1}</small></span>${sp>0&&i===0?`<button class="btn sm" data-a="ttOffer">Offer space</button>`:''}</div>`).join('')}</div>`:''}
    <div class="dact"><button class="btn ghost sm" data-a="ttMsg">${ico('mail',16)} Message parents</button><button class="btn ghost sm" data-a="ttReg">${ico('check',16)} ${c.done?'Register done':'Complete register'}</button></div>
  </div>
  <div class="df"><button class="btn red sm" data-a="ttCancel">${c.cancelled?'Reinstate class':'Cancel class'}</button><span style="flex:1"></span><button class="btn navy sm" data-a="ttClose">Done</button></div></aside>`;
}
function openSheet(){modal('Filters',filterFields(),`<button class="btn navy" data-a="ttSheetDone">Show classes</button><button class="btn ghost" data-a="ttStage" data-k="">Clear all</button>`)}
const refresh=(full)=>{if(full){render();if(TT.sheet&&(document.querySelector('#modal .modal')||{getAttribute(){}}).getAttribute('aria-label')==='Filters')openSheet()}else{paint()}const d=document.getElementById('ttDrawer');if(d)d.innerHTML=drawer()};
const cur=()=>findC(TT.sel);
const logA=(t,w)=>{try{logIt(ME(),'Classes',w)}catch(e){}};
Object.assign(ACT,{
  ttMv(d){TT.mv=d.v;refresh(1)},
  ttMode(d){if(d.m==='draft'){TT.draft=true;refresh(1);return}
    if(dirtyList().length){modal('Unpublished changes',`<p style="margin:0">You have ${dirtyList().length} changes that are not live yet.</p>`,`<button class="btn" data-a="ttReview">Review and publish</button><button class="btn ghost" data-a="ttDiscardGo" data-live="1">Discard and go live</button><button class="btn link" data-a="close">Keep editing</button>`);return}
    TT.draft=false;refresh(1)},
  ttSort(d){TT.sort=TT.sort.k===d.k?{k:d.k,d:-TT.sort.d}:{k:d.k,d:1};paint()},
  ttCsv(){const rows=visible(classesFor(TT.w)).sort((a,b)=>a.d*2000+a.t-b.d*2000-b.t),h=['Day','Date','Start','End','Venue','Pool','Stage','Teacher','Booked','Capacity','Spaces','Waiting list','Status'];
    const out=[h].concat(rows.map(c=>[DAYF[c.d],fmt(dateOf(c.w,c.d),{day:'numeric',month:'short',year:'numeric'}),hm(c.t),hm(c.t+c.dur),c.v,c.pn,ST[c.st].name,c.teacher,c.sw.length,c.cap,space(c),c.wl.length,c._del?'Removed':c.cancelled?'Cancelled':c.cover?'Cover needed':'Live']));
    const blob=new Blob(['\ufeff'+out.map(r=>r.map(csvEsc).join(',')).join('\r\n')],{type:'text/csv'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`paddlepod-classes-${fmt(dateOf(TT.w,0),{day:'numeric',month:'short'}).replace(' ','-')}.csv`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);toast('Spreadsheet downloaded.')},
  ttApply(){const c=cur(),r=tryMove(c,{d:+document.getElementById('edDay').value,t:+document.getElementById('edTime').value,pool:document.getElementById('edPool').value,teacher:document.getElementById('edTeacher').value},true);
    if(!r.ok){toast(r.msg);return}toast(r.warn?'Moved. Heads up: '+r.warn:'Change saved in the sandbox.');refresh(1)},
  ttRevert(){const c=cur();revert(c);toast('Change undone.');refresh(1)},
  ttDel(){const c=cur();if(c._new){CACHE[c.w]=CACHE[c.w].filter(x=>x!==c);TT.sel=null;toast('New class removed.')}else{c._del=!c._del;toast(c._del?'Class removed in the sandbox. It stays live until you publish.':'Class kept.')}refresh(1)},
  ttDiscard(){modal('Discard all sandbox changes?',`<p style="margin:0">${dirtyList().length} changes will be thrown away. The live timetable is not affected.</p>`,`<button class="btn red" data-a="ttDiscardGo">Discard changes</button><button class="btn ghost" data-a="close">Keep editing</button>`)},
  ttDiscardGo(d){dirtyList().forEach(c=>{if(c._new)CACHE[c.w]=CACHE[c.w].filter(x=>x!==c);else revert(c)});TT.sel=null;close();if(d.live)TT.draft=false;toast('Sandbox cleared.');refresh(1)},
  ttReview(){const dl=dirtyList(),aff=affected(dl);
    const line=c=>{const s=ST[c.st].name;if(c._new)return `<b>New</b> · ${s} · ${DAYF[c.d]} ${hm(c.t)} · ${c.v}, ${c.pn} · ${esc2(c.teacher)}`;if(c._del)return `<b>Removed</b> · ${s} · ${DAYF[c._o?c._o.d:c.d]} ${hm(c._o?c._o.t:c.t)} · ${c.sw.length} swimmers to rebook`;
      const o=c._o,parts=[];if(o.d!==c.d||o.t!==c.t||o.pool!==c.pool)parts.push(`${DAYS[o.d]} ${hm(o.t)} ${o.v} ${o.pn.replace(' pool','')} → ${DAYS[c.d]} ${hm(c.t)} ${c.v} ${c.pn.replace(' pool','')}`);if(o.teacher!==c.teacher)parts.push(`${esc2(o.teacher)} → ${esc2(c.teacher)}`);return `<b>${s}</b> · ${parts.join(' · ')}`};
    modal('Review and publish',`<div class="rv">${dl.map(c=>`<div class="rv-r" style="--c:${ST[c.st].c}">${line(c)}</div>`).join('')}</div><p class="sub" style="margin:0">${aff} swimmers are in classes that change.</p><label class="opt"><input type="checkbox" id="pbMail" checked><span class="grow"><b style="color:var(--navy)">Email the parents affected</b><span class="sub" style="display:block">Each parent gets the new day, time and venue.</span></span></label>`,`<button class="btn navy" data-a="ttPublish">Publish ${dl.length} change${dl.length>1?'s':''}</button><button class="btn ghost" data-a="close">Back to sandbox</button>`)},
  ttPublish(){const m=document.getElementById('pbMail'),mail=m&&m.checked,dl=dirtyList(),aff=affected(dl);
    dl.forEach(c=>{if(c._del)CACHE[c.w]=CACHE[c.w].filter(x=>x!==c);else{delete c._o;delete c._new}});try{logIt(ME(),'Classes',`Published ${dl.length} timetable changes from the sandbox`)}catch(e){}
    close();TT.draft=false;TT.sel=null;toast(`Published ${dl.length} changes. ${mail?aff+' parents emailed.':'No emails sent.'}`);refresh(1)},
  ttAddClass(){modal('Add a class to the sandbox',`<div class="form"><label class="f">Stage<select id="acS">${STAGES.map(s=>`<option value="${s[0]}">${s[1]}</option>`).join('')}</select></label><div class="two"><label class="f">Day<select id="acD">${DAYF.map((D,i)=>`<option value="${i}" ${i===TT.d?'selected':''}>${D}</option>`).join('')}</select></label><label class="f">Start<select id="acT">${(()=>{let o='';for(let m=480;m<=1170;m+=15)o+=`<option value="${m}" ${m===1005?'selected':''}>${hm(m)}</option>`;return o})()}</select></label></div><div class="two"><label class="f">Pool<select id="acP">${POOLS.map(p=>`<option value="${p.id}">${p.v} · ${p.n}</option>`).join('')}</select></label><label class="f">Teacher<select id="acH">${TEACH.map(t=>`<option>${t}</option>`).join('')}</select></label></div></div>`,`<button class="btn navy" data-a="ttAddGo">Add to sandbox</button><button class="btn ghost" data-a="close">Cancel</button>`)},
  ttAddGo(){const st=ST[document.getElementById('acS').value],p=POOLS.find(x=>x.id===document.getElementById('acP').value),c={id:'new'+Date.now(),w:TT.w,d:+document.getElementById('acD').value,pool:p.id,v:p.v,pn:p.n,t:+document.getElementById('acT').value,dur:30,st:st.k,cap:st.cap,teacher:document.getElementById('acH').value,sw:[],wl:[],cover:false,cancelled:false,done:false,_new:true};
    const r=tryMove(Object.assign({},c,{id:'tmp'}),{},false);const clash=classesFor(TT.w).find(x=>!x._del&&x.d===c.d&&x.pool===c.pool&&x.t<c.t+30&&c.t<x.t+x.dur);
    if(clash){toast(`${p.v} ${p.n} is already in use at ${hm(clash.t)}.`);return}
    classesFor(TT.w).push(c);close();TT.d=c.d;TT.sel=c.id;toast('Class added to the sandbox.');refresh(1)},
  ttVenue(d){TT.venues[d.v]=!TT.venues[d.v];refresh(1)},
  ttView(d){TT.view=d.v;refresh(1)},
  ttDay(d){TT.d=+d.d;refresh(1)},
  ttWeek(d){TT.w=Math.max(-1,Math.min(3,TT.w+ +d.n));refresh(1)},
  ttToday(){TT.w=TODAY.w;TT.d=TODAY.d;refresh(1)},
  ttSpaces(){TT.spaces=!TT.spaces;refresh(1)},
  ttStage(d){if(!d.k){TT.stages={};TT.teacher='All';TT.spaces=false;TT.q=''}else TT.stages[d.k]=!TT.stages[d.k];refresh(1)},
  ttFilters(){if(isM()){TT.sheet=true;openSheet()}else{TT.fo=!TT.fo;refresh(1)}},
  ttExp(d){TT.exp=TT.exp===d.id?null:d.id;paint()},
  ttOpen(d){TT.sel=d.id;hidePop();refresh(1)},
  ttClose(){TT.sel=null;refresh(1)},
  ttSheetDone(){TT.sheet=false;close();refresh(1)},
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
document.addEventListener('keydown',e=>{if(e.target.id==='gq'&&e.key==='Enter'){TT.q=e.target.value;S.view='timetable';render()}if(e.key==='Escape'&&TT.sel){TT.sel=null;if(isTT())refresh(1)}});

let _m=isM();matchMedia('(max-width:900px)').addEventListener('change',()=>{if(_m!==isM()){_m=isM();if(isTT())render()}});
/* drag and drop in the sandbox */
let drag=null,ghost=null,ind=null,justDragged=false;
const invY=(y)=>{if(!GRID)return null;for(const g of GRID.segs){const top=g[2],h=(g[1]-g[0])*GRID.PX;if(y>=top-8&&y<=top+h+8)return g[0]+Math.max(0,Math.min(h,y-top))/GRID.PX}return null};
const snap=m=>Math.round(m/15)*15;
function dropTarget(e){
  const els=document.elementsFromPoint(e.clientX,e.clientY);
  const pill=els.find(x=>x.classList&&x.classList.contains('dpill'));if(pill)return{d:+pill.dataset.d,el:pill};
  const col=els.find(x=>x.classList&&x.classList.contains('dg-c'));if(!col)return null;
  const r=col.getBoundingClientRect(),m=invY(e.clientY-drag.off-r.top);if(m==null)return null;return{pool:col.dataset.pool,t:snap(m),el:col,r};
}
function dragLift(){hidePop();ghost=drag.b.cloneNode(true);ghost.className+=' ghost';ghost.style.cssText=`position:fixed;left:0;top:0;width:${drag.w}px;height:${drag.h}px;z-index:97;pointer-events:none;opacity:.92;transform:none`;document.body.appendChild(ghost);drag.b.classList.add('lift')}
function dragUpdate(x,y){ghost.style.left=(x-drag.w/2)+'px';ghost.style.top=(y-drag.off)+'px';
  const c=findC(drag.id),t=dropTarget({clientX:x,clientY:y});document.querySelectorAll('.dpill.drop').forEach(q=>q.classList.remove('drop'));if(ind){ind.remove();ind=null}
  if(!t)return;
  if(t.el.classList.contains('dpill')){const r=tryMove(c,{d:t.d},false);t.el.classList.add('drop');t.el.dataset.ok=r.ok?'1':'0';return}
  const r=tryMove(c,{pool:t.pool,t:t.t},false);ind=document.createElement('div');ind.className='dind '+(r.ok?(r.warn?'warn':'ok'):'bad');
  const y0=GRID.segs.find(g=>t.t>=g[0]&&t.t<=g[1]);ind.style.top=((y0?y0[2]+(t.t-y0[0])*GRID.PX:0)+2)+'px';ind.style.height=(c.dur*GRID.PX-4)+'px';ind.innerHTML=`<span>${hm(t.t)}–${hm(t.t+c.dur)}${r.ok?'':' · '+r.msg}</span>`;t.el.appendChild(ind)}
function dragEnd(x,y,cancel){const d=drag;drag=null;if(!d||!d.on)return;justDragged=true;setTimeout(()=>justDragged=false,350);
  if(ghost){ghost.remove();ghost=null}if(ind){ind.remove();ind=null}document.querySelectorAll('.dpill.drop').forEach(q=>q.classList.remove('drop'));d.b.classList.remove('lift');document.body.classList.remove('dragging');
  if(cancel)return;drag=d;const c=findC(d.id),t=dropTarget({clientX:x,clientY:y});drag=null;if(!t)return;
  const to=t.el.classList.contains('dpill')?{d:t.d}:{pool:t.pool,t:t.t};const r=tryMove(c,to,true);
  if(!r.ok){toast(r.msg);return}if(t.d!=null)TT.d=t.d;toast(r.warn?'Moved in the sandbox. Heads up: '+r.warn:'Moved in the sandbox. It is not live yet.');refresh(1)}
document.addEventListener('pointerdown',e=>{if(!TT.draft||isM()||e.button!==0||!isTT())return;const b=e.target.closest&&e.target.closest('.cb');if(!b||!b.closest('#dg'))return;const r=b.getBoundingClientRect();drag={id:b.dataset.id,x:e.clientX,y:e.clientY,on:false,b,off:e.clientY-r.top,w:r.width,h:r.height}});
document.addEventListener('pointermove',e=>{if(!drag||drag.touch)return;if(!drag.on){if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<6)return;drag.on=true;dragLift()}dragUpdate(e.clientX,e.clientY)});
document.addEventListener('pointerup',e=>{if(!drag||drag.touch)return;dragEnd(e.clientX,e.clientY)});
document.addEventListener('click',e=>{if(justDragged){e.stopPropagation();e.preventDefault()}},true);
document.addEventListener('pointercancel',()=>{if(drag&&!drag.touch)dragEnd(0,0,true)});
/* touch: press and hold a class, then drag it. Scrolling still works when you just swipe. */
let tmr=0,raf=0,lx=0,ly=0;
function auto(){if(!drag||!drag.on){raf=0;return}const H=innerHeight;let v=0;if(ly>76&&ly<150)v=-Math.min(16,(150-ly)/5);else if(ly>H-190)v=Math.min(16,(ly-(H-190))/5);if(v){scrollBy(0,v);dragUpdate(lx,ly)}raf=requestAnimationFrame(auto)}
document.addEventListener('touchstart',e=>{if(!isM()||!isTT()||TT.mv!=='cal'||e.touches.length!==1||drag)return;const b=e.target.closest&&e.target.closest('.cb');if(!b||!b.closest('#dg'))return;
  const t=e.touches[0],r=b.getBoundingClientRect();drag={id:b.dataset.id,x:t.clientX,y:t.clientY,on:false,touch:true,b,off:t.clientY-r.top,w:r.width,h:r.height};lx=t.clientX;ly=t.clientY;clearTimeout(tmr);
  tmr=setTimeout(()=>{if(!drag||!drag.touch||drag.on)return;if(!TT.draft){drag=null;toast('Switch to Sandbox to move classes around.');return}drag.on=true;document.body.classList.add('dragging');dragLift();try{navigator.vibrate&&navigator.vibrate(14)}catch(_){}dragUpdate(lx,ly);if(!raf)raf=requestAnimationFrame(auto)},340)},{passive:true});
document.addEventListener('touchmove',e=>{if(!drag||!drag.touch)return;const t=e.touches[0];lx=t.clientX;ly=t.clientY;if(!drag.on){if(Math.hypot(lx-drag.x,ly-drag.y)>9){clearTimeout(tmr);drag=null}return}e.preventDefault();dragUpdate(lx,ly)},{passive:false});
document.addEventListener('touchend',e=>{clearTimeout(tmr);if(!drag||!drag.touch)return;if(!drag.on){drag=null;return}e.preventDefault();const t=e.changedTouches[0];dragEnd(t.clientX,t.clientY)},{passive:false});
document.addEventListener('touchcancel',()=>{clearTimeout(tmr);if(drag&&drag.touch)dragEnd(0,0,true)});
document.addEventListener('contextmenu',e=>{if(isM()&&e.target.closest&&e.target.closest('#dg .cb'))e.preventDefault()});

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
  const b=e.target.closest&&e.target.closest('.cb,.mc');if(!b){hidePop();return}const c=findC(b.dataset.id);if(c)showPop(c,e.clientX,e.clientY)});
window.addEventListener('scroll',hidePop,{passive:true});document.addEventListener('pointerleave',hidePop,true);

/* shell: nav, dashboard card, staff layout */
I.grid='M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z';
A.timetable=window.VIEWS_TT;A.planner=window.VIEWS_TT;SHORT.planner='Planner';
[NAV.admin,NAV.super].forEach(nv=>{if(!nv.some(n=>n[0]==='timetable')){nv.splice(1,0,['timetable','Venue timetable','grid',()=>classesFor(0).filter(c=>c.cover).length]);nv.splice(2,0,['planner','Class planner','sliders'])}});
TABS.admin=['dash','timetable','inbox','cust'];SHORT.timetable='Timetable';

/* ---- team board (Trello-style) ---- */
S.taskV=S.taskV||'board';
const COLS=['To do','In progress','Done'],PEOPLE=['Phil','Emma Clarke','Becky Hall','Sam Patel'];
const tTog=()=>`<div class="tv"><div class="seg"><button class="${S.taskV==='board'?'on':''}" data-a="taskV" data-v="board">Board</button><button class="${S.taskV==='list'?'on':''}" data-a="taskV" data-v="list">List</button></div></div>`;
const _tasks=A.tasks;
A.tasks=function(){
  if(S.taskV==='list'){const v=_tasks();v.body=tTog()+v.body;return v}
  const mine=S.taskF==='mine',list=S.tasks.filter(t=>!mine||t.who===ME());
  const card=t=>`<article class="bc ${t.due==='Overdue'?'od':''}" draggable="true" data-id="${t.id}" data-a="bcOpen" tabindex="0"><div class="bc-t">${t.pri?`<span class="pill t-${t.pri==='High'?'red':t.pri==='Medium'?'amber':'grey'}">${t.pri}</span>`:''}</div><b>${esc2(t.t)}</b>
    <div class="bc-m"><span class="av" title="${esc2(t.who)}">${ini(t.who)}</span><span class="${t.due==='Overdue'||t.due==='Today'?'due':''}">${esc2(t.due)}</span>${t.c.length?`<span>💬 ${t.c.length}</span>`:''}<span class="bc-mv"><button data-a="bcMove" data-id="${t.id}" data-n="-1" aria-label="Move left">‹</button><button data-a="bcMove" data-id="${t.id}" data-n="1" aria-label="Move right">›</button></span></div></article>`;
  const notes=(S.team||[]).slice(-4).reverse();
  return {eb:'Tasks',h:'Team board',sub:'Live tasks and notes for the whole team.',body:`<div class="btop"><div class="bfil"><div class="seg"><button class="${mine?'':'on'}" data-a="taskF" data-f="all">Everyone</button><button class="${mine?'on':''}" data-a="taskF" data-f="mine">My cards</button></div></div>${tTog()}</div>
  <div class="board">${COLS.map(c=>{const cs=list.filter(t=>(t.st||'To do')===c);return `<section class="bcol" data-col="${c}"><header><h3>${c}</h3><span class="pill t-grey">${cs.length}</span></header><div class="bcs">${cs.map(card).join('')||'<div class="empty2">Nothing here</div>'}</div>
    <input class="badd" data-col="${c}" type="text" placeholder="+ Add a card" aria-label="Add a card to ${c}"></section>`}).join('')}</div>
  <div class="card nts"><div class="ch"><h3>Team notes</h3><span class="sub">Pass a quick note to everyone</span></div>${notes.map(n=>`<div class="row"><span class="av">${ini(n.who)}</span><div class="grow"><b>${esc2(n.who)}</b> <span class="sub">${esc2(n.d)}</span><div>${esc2(n.t)}</div></div></div>`).join('')}
    <div class="hrow" style="flex-wrap:nowrap;margin-top:8px"><input type="text" id="tnT" placeholder="Write a note for the team" aria-label="Team note"><button class="btn sm navy" data-a="tnPost">Post</button></div></div>`};
};
Object.assign(ACT,{
  taskV(d){S.taskV=d.v;render()},
  tnPost(){const el=document.getElementById('tnT'),v=(el.value||'').trim();if(!v)return;S.team.push({who:ME(),t:v,d:'Just now'});render();toast('Note shared with the team.')},
  bcMove(d,el,e){e.stopPropagation();const t=S.tasks.find(x=>x.id==d.id),i=Math.max(0,Math.min(2,COLS.indexOf(t.st||'To do')+ +d.n));t.st=COLS[i];render()},
  bcOpen(d,el,e){if(e&&e.target.closest('.bc-mv'))return;const t=S.tasks.find(x=>x.id==d.id);
    modal(esc2(t.t),`<div class="form"><div class="two"><label class="f">Assigned to<select id="bcW">${PEOPLE.map(p=>`<option ${p===t.who?'selected':''}>${p}</option>`).join('')}</select></label><label class="f">Status<select id="bcS">${COLS.map(c=>`<option ${c===t.st?'selected':''}>${c}</option>`).join('')}</select></label></div>
      <div class="two"><label class="f">Priority<select id="bcP">${['High','Medium','Low'].map(p=>`<option ${p===t.pri?'selected':''}>${p}</option>`).join('')}</select></label><label class="f">Due<input type="text" id="bcD" value="${esc2(t.due)}"></label></div>
      <div><span class="f" style="font:600 14px var(--display);color:var(--navy)">Comments</span>${t.c.map(c=>`<div style="margin-top:8px"><b>${esc2(c[0])}</b> <span class="sub">${esc2(c[2])}</span><div>${esc2(c[1])}</div></div>`).join('')||'<div class="sub" style="margin-top:6px">No comments yet.</div>'}</div>
      <div class="hrow" style="flex-wrap:nowrap"><input type="text" id="bcC" placeholder="Add a comment" aria-label="Add a comment"></div></div>`,`<button class="btn navy" data-a="bcSave" data-id="${t.id}">Save</button><button class="btn ghost" data-a="close">Close</button>`)},
  bcSave(d){const t=S.tasks.find(x=>x.id==d.id),c=(document.getElementById('bcC').value||'').trim();t.who=document.getElementById('bcW').value;t.st=document.getElementById('bcS').value;t.pri=document.getElementById('bcP').value;t.due=document.getElementById('bcD').value||'No date';if(c)t.c.push([ME(),c,'Just now']);close();render();toast('Card updated.')}
});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.classList&&e.target.classList.contains('badd')){const v=e.target.value.trim();if(!v)return;S.tasks.unshift({id:Date.now(),t:v,who:ME(),pri:'Medium',due:'No date',st:e.target.dataset.col,c:[]});render();toast('Card added.')}});
document.addEventListener('dragstart',e=>{const c=e.target.closest&&e.target.closest('.bc');if(c){e.dataTransfer.setData('text/plain',c.dataset.id);e.dataTransfer.effectAllowed='move';c.classList.add('lift')}});
document.addEventListener('dragend',e=>{document.querySelectorAll('.bc.lift,.bcol.over').forEach(x=>x.classList.remove('lift','over'))});
document.addEventListener('dragover',e=>{const c=e.target.closest&&e.target.closest('.bcol');if(c){e.preventDefault();document.querySelectorAll('.bcol.over').forEach(x=>x!==c&&x.classList.remove('over'));c.classList.add('over')}});
document.addEventListener('drop',e=>{const c=e.target.closest&&e.target.closest('.bcol');if(!c)return;e.preventDefault();const id=e.dataTransfer.getData('text/plain'),t=S.tasks.find(x=>x.id==id);if(t&&t.st!==c.dataset.col){t.st=c.dataset.col;render();toast(`Moved to ${c.dataset.col}.`)}});
const _dash=A.dash;
A.dash=function(){const v=_dash(),now=classesFor(0).filter(c=>c.d===TODAY.d&&c.t+c.dur>=TODAY.m&&!c.cancelled).sort((a,b)=>a.t-b.t).slice(0,4);
  const td=classesFor(0).filter(c=>c.d===TODAY.d&&!c.cancelled),tb=td.reduce((a,c)=>a+c.sw.length,0),tc=td.reduce((a,c)=>a+c.cap,0),wk=classesFor(0).filter(c=>!c.cancelled),wsp=wk.reduce((a,c)=>a+space(c),0),cv=wk.filter(c=>c.cover).length;
  const stats=`<div class="dstats"><button data-a="go" data-v="timetable"><span>Classes today</span><b>${td.length}</b><em>${td.filter(c=>c.t+c.dur<TODAY.m).length} done</em></button><button data-a="go" data-v="timetable"><span>Swimmers today</span><b>${tb}</b><em>of ${tc} places</em></button><button data-a="go" data-v="timetable"><span>Spaces to fill this week</span><b>${wsp}</b><em>across both venues</em></button><button data-a="go" data-v="staff" class="${cv?'warn':''}"><span>Classes needing cover</span><b>${cv}</b><em>${cv?'assign a teacher':'all covered'}</em></button></div>`;
  inN=true;v.body=stats+`<div class="card"><div class="ch"><div><h3>Next classes today</h3><span class="sub">Wednesday 4 November · both venues</span></div><button class="btn sm navy" data-a="go" data-v="timetable">${ico('cal',16)} Open venue timetable</button></div><div class="nxt">${now.map(c=>block(c)).join('')}</div></div>`+v.body;inN=false;return v};
const _r=render;
render=function(sc){_r(sc);
  const staff=S.role!=='parent';document.body.classList.toggle('staff',staff);
  const sh=document.querySelector('.shell');if(sh&&sh.parentElement)sh.parentElement.classList.add('shellwrap');
  const hd=document.querySelector('.site .wrap');if(hd&&!document.getElementById('gq')){const g=document.createElement('label');g.className='gsearch';g.innerHTML=`<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="gq" type="search" placeholder="Search swimmers, parents, classes" aria-label="Search">`;hd.insertBefore(g,hd.querySelector('.hdr-act'))}
  if(staff){const m=document.getElementById('main'),b=document.getElementById('band');
    if(m&&b&&!m.querySelector('.ph'))m.insertAdjacentHTML('afterbegin',`<div class="ph"><div>${b.innerHTML.replace(/<svg[\s\S]*?<\/svg>/g,'')}</div></div>`);
    const sd=document.getElementById('side');if(sd&&!sd.querySelector('.sb-logo')){sd.insertAdjacentHTML('afterbegin','<div class="sb-logo">PaddleP<i>o</i>d<small>Staff workspace</small></div>');sd.insertAdjacentHTML('beforeend',`<div class="sb-foot"><b>${ME()}</b><span>${{super:'Super admin',admin:'Admin',teacher:'Teacher'}[S.role]}</span><span>Killingworth · Shiremoor</span></div>`)}
    if(isTT())paint();}
  if(staff){const sd=document.getElementById('side');if(sd&&!sd.querySelector('.sb-g')){const grp={dash:'Today',inbox:'People',tasks:'Run the business',today:'Today'};[...sd.querySelectorAll('button[data-v]')].forEach(bt=>{const g=grp[bt.dataset.v];if(g)bt.insertAdjacentHTML('beforebegin',`<div class="sb-g">${g}</div>`)})}}
};

/* ---- full class page: edit details, image, description, term attendance ---- */
const LIB=[['cls2.jpg','Parent and baby'],['cls5.jpg','Toddler and parent'],['cls4.jpg','Junior with goggles'],['cls7.jpg','Junior lessons']];
const DESC={baby:'A gentle first splash. Parent and baby lessons in warm water with songs, gentle movement and lots of cuddles. Builds water confidence and a lovely bond.',tod:'Fun, play-based lessons for toddlers with a grown-up in the water. We build confidence, kicking and floating through songs and games.',nemo:'Our Nemo programme for the 3 and over group. Short, friendly lessons that build water confidence, kicking and the first strokes.',s14:'Small groups working on the core skills: floating, kicking, breathing and your first strokes, with a teacher in the water or on the side.',s57:'Stroke development. Front crawl, back crawl and breaststroke technique, with swimming for longer distances.',s810:'Confident swimmers refine their technique, build stamina and work toward the top badges.',adv:'Stronger swimmers building speed, stamina and technique in a coached session.',pv:'A one to one lesson with a teacher, built around the swimmer.'};
const defImg=c=>({baby:'cls2.jpg',tod:'cls5.jpg',nemo:'cls5.jpg',s14:'cls4.jpg'}[ST[c.st].fam]||'cls7.jpg');
const NAMES_PRICE=c=>ST[c.st].fam==='pv'?30:['baby','tod','nemo'].includes(ST[c.st].fam)?13.2:12.5;
function xOf(c){if(c.x)return c.x;const r=rngF('x'+c.id);c.x={title:`${c.v} PaddlePod ${DAYF[c.d]} ${hm(c.t)}`,desc:DESC[ST[c.st].fam],img:null,price:NAMES_PRICE(c),status:'In progress',term:'September to December 2026',start:'2026-08-31',end:'2026-12-14',att:{},mk:{},extra:[],r:Math.round(r()*1000)};return c.x}
const sessDates=c=>{const base=new Date(2026,7,31),out=[];for(let k=0;k<15;k++){const d=new Date(base);d.setDate(d.getDate()+k*7+c.d);out.push(d)}(xOf(c).extra||[]).forEach(e=>out.push(new Date(e+'T12:00:00')));return out};
const attOf=(c,sw,k,d)=>{const x=xOf(c),key=sw.n+'|'+k;if(key in x.att)return x.att[key];const past=d<new Date(2026,10,4,12);return past?hs(key+c.id)%9!==0:false};
let cpEdit=false;
function cpHTML(c){
  const x=xOf(c),s=ST[c.st],img=x.img||('/paddlepodlogin/assets/'+defImg(c)),ds=sessDates(c),n=c.sw.length,sess=ds.length;
  const T=(v)=>esc2(v);const slots=[];for(let m=480;m<=1170;m+=15)slots.push(m);
  const row=(ic,v)=>`<div class="cp-r">${ico(ic,18)}<span>${v}</span></div>`;
  const view=`<h3>${T(x.term)}</h3>${pill(x.status,x.status==='In progress'?'green':x.status==='Draft'?'grey':x.status==='Cancelled'?'red':'amber')}
    ${row('clock',`${DAYF[c.d]}, ${hm(c.t)} to ${hm(c.t+c.dur)}`)}${row('cal',`${fmt(new Date(x.start+'T12:00:00'),{day:'numeric',month:'short',year:'numeric'})} to ${fmt(new Date(x.end+'T12:00:00'),{day:'numeric',month:'short',year:'numeric'})}`)}${row('user',T(c.teacher))}${row('swim',T(s.name))}${row('users',`${n} / ${c.cap}`)}${row('pound',`£${(+x.price).toFixed(2)} / £${(x.price*sess).toFixed(2)}`)}${row('info',`${T(c.v)}, ${T(c.pn)}`)}
    <div class="cp-r">${ico('arrow',18)}<a class="cp-l" href="#" data-a="cpCopy">paddlepod.co.uk/book/class/${c.id.replace(/[^a-z0-9]/gi,'')}</a><button class="btn sm ghost" data-a="cpCopy">Copy link</button></div>`;
  const edit=`<div class="cp-f"><label>Class name<input type="text" id="cpT" value="${T(x.title)}"></label>
    <div class="two"><label>Stage<select id="cpS">${STAGES.map(t=>`<option value="${t[0]}" ${t[0]===c.st?'selected':''}>${t[1]}</option>`).join('')}</select></label><label>Status<select id="cpSt">${['In progress','Draft','Full','Cancelled'].map(t=>`<option ${t===x.status?'selected':''}>${t}</option>`).join('')}</select></label></div>
    <div class="two"><label>Day<select id="cpD">${DAYF.map((D,i)=>`<option value="${i}" ${i===c.d?'selected':''}>${D}</option>`).join('')}</select></label><label>Start<select id="cpTm">${slots.map(m=>`<option value="${m}" ${m===c.t?'selected':''}>${hm(m)}</option>`).join('')}</select></label></div>
    <div class="two"><label>Pool<select id="cpP">${POOLS.map(p=>`<option value="${p.id}" ${p.id===c.pool?'selected':''}>${p.v} · ${p.n}</option>`).join('')}</select></label><label>Teacher<select id="cpH">${TEACH.map(t=>`<option ${t===c.teacher?'selected':''}>${t}</option>`).join('')}</select></label></div>
    <div class="two"><label>Places<input type="number" id="cpC" min="${Math.max(1,n)}" value="${c.cap}"></label><label>Price per lesson (£)<input type="number" id="cpPr" step="0.10" min="0" value="${(+x.price).toFixed(2)}"></label></div>
    <label>Term<input type="text" id="cpTerm" value="${T(x.term)}"></label>
    <div class="two"><label>First lesson<input type="date" id="cpDs" value="${x.start}"></label><label>Last lesson<input type="date" id="cpDe" value="${x.end}"></label></div></div>`;
  const attHead=ds.map((d,k)=>`<th class="${d<new Date(2026,10,4,12)?'':'fut'}">${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}${k>=15?' <small>extra</small>':''}</th>`).join('');
  const attRows=c.sw.map((w,i)=>`<tr><th class="nm"><b>${T(w.n)}</b><small>${T(w.age)}${w.tag?' · '+w.tag:''}</small></th>${ds.map((d,k)=>{const on=attOf(c,w,k,d),mk=x.mk[w.n+'|'+k];return `<td><label class="ck"><input type="checkbox" data-a="cpAtt" data-i="${i}" data-k="${k}" ${on?'checked':''} aria-label="${T(w.n)} ${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}"><span></span></label>${on?'':`<button class="mkb ${mk?'on':''}" data-a="cpMk" data-i="${i}" data-k="${k}" title="Make-up lesson" aria-label="Make-up lesson">⇄</button>`}</td>`}).join('')}</tr>`).join('');
  const tot=ds.map((d,k)=>`<td>${c.sw.filter(w=>attOf(c,w,k,d)).length}/${n}</td>`).join('');
  return `<div class="cp-in"><header class="cp-h"><button class="btn ghost sm" data-a="cpClose">${ico('back',16)} Back to timetable</button><div class="grow"></div>${cpEdit?`<button class="btn ghost sm" data-a="cpEdit" data-m="0">Cancel</button><button class="btn navy sm" data-a="cpSave">Save changes</button>`:`<button class="btn ghost sm" data-a="cpEdit" data-m="1">${ico('brush',16)} Edit class</button>`}</header>
   <h1 class="cp-t" style="--c:${s.c}">${T(x.title)}</h1>
   <div class="cp-g"><section class="card cp-d">${cpEdit?edit:view}</section>
    <section class="card cp-i"><div class="cp-img" style="--c:${s.c}"><img src="${img}" alt="${T(s.name)}">${cpEdit?`<div class="cp-ib"><label class="btn sm navy">Upload a photo<input type="file" accept="image/*" data-cp="img" hidden></label>${x.img?`<button class="btn sm ghost" data-a="cpImgRm">Use default</button>`:''}</div>`:''}</div>
     ${cpEdit?`<div class="lib">${LIB.map(l=>`<button class="${x.img&&x.img.endsWith(l[0])?'on':''}" data-a="cpImg" data-f="${l[0]}" title="${l[1]}"><img src="/paddlepodlogin/assets/${l[0]}" alt="${l[1]}"></button>`).join('')}</div>`:''}
     <div class="cp-v"><a class="cp-l" href="#">${T(c.v==='Killingworth'?'PaddlePod Killingworth':'PaddlePod Shiremoor')}</a></div>${row('info',c.v==='Killingworth'?'Silverbirch Drive, Newcastle upon Tyne, NE12 5AB':'Shiremoor, Newcastle upon Tyne')}
     <h4>Lesson description</h4>${cpEdit?`<textarea id="cpDsc" rows="5">${T(x.desc)}</textarea><p class="sub">Parents see this on the booking page.</p>`:`<p class="cp-p">${T(x.desc)}</p>`}</section></div>
   <section class="cp-a"><div class="ch"><h2>Attendance</h2><button class="btn ghost sm" data-a="cpAddSess">${ico('plus',16)} Add session to schedule</button></div>
    <div class="att-w"><table class="att-t"><thead><tr><th class="nm"></th>${attHead}</tr></thead><tbody>${attRows||`<tr><td class="empty2">No swimmers booked yet.</td></tr>`}</tbody><tfoot><tr><th class="nm">Present</th>${tot}</tr></tfoot></table></div></section></div>`;
}
function cpMount(){let el=document.getElementById('cpage');if(!el){el=document.createElement('div');el.id='cpage';el.className='cpage';document.body.appendChild(el);document.body.classList.add('cp-open')}return el}
function cpRender(){const c=findC(TT.cp);if(!c)return;const el=cpMount(),top=el.scrollTop;el.innerHTML=cpHTML(c);el.scrollTop=top}
function cpPic(){const c=findC(TT.cp),x=xOf(c),im=document.querySelector('.cp-img img');if(im)im.src=x.img||('/paddlepodlogin/assets/'+defImg(c));document.querySelectorAll('.lib button').forEach(b=>b.classList.toggle('on',!!x.img&&x.img.endsWith(b.dataset.f)));const ib=document.querySelector('.cp-ib');if(ib){const r=ib.querySelector('[data-a=cpImgRm]');if(x.img&&!r){ib.insertAdjacentHTML('beforeend','<button class="btn sm ghost" data-a="cpImgRm">Use default</button>')}else if(!x.img&&r)r.remove()}}
Object.assign(ACT,{
  ttDay(d){TT.d=+d.d;TT.view='day';refresh()},
  cpOpen(){TT.cp=TT.sel;TT.sel=null;cpEdit=false;refresh(1);cpRender();document.getElementById('cpage').scrollTop=0},
  cpClose(){TT.cp=null;cpEdit=false;const el=document.getElementById('cpage');if(el)el.remove();document.body.classList.remove('cp-open');refresh(1)},
  cpEdit(d){cpEdit=d.m==='1';cpRender()},
  cpAtt(d,el){const c=findC(TT.cp),w=c.sw[+d.i];xOf(c).att[w.n+'|'+d.k]=el.checked;const ds=sessDates(c);cpRender()},
  cpMk(d){const c=findC(TT.cp),w=c.sw[+d.i],x=xOf(c),k=w.n+'|'+d.k;x.mk[k]=!x.mk[k];toast(x.mk[k]?'Make-up lesson marked. The parent will be offered a new slot.':'Make-up removed.');cpRender()},
  cpCopy(d,el,e){const c=findC(TT.cp),url='https://www.paddlepod.co.uk/book/class/'+c.id.replace(/[^a-z0-9]/gi,'');try{navigator.clipboard.writeText(url)}catch(_){}toast('Booking link copied.')},
  cpImg(d){const c=findC(TT.cp);xOf(c).img='/paddlepodlogin/assets/'+d.f;cpPic()},
  cpImgRm(){xOf(findC(TT.cp)).img=null;cpPic()},
  cpAddSess(){const c=findC(TT.cp);modal('Add a session',`<div class="form"><label class="f">Date<input type="date" id="cpNs" value="2026-12-21"></label><p class="sub" style="margin:0">Swimmers in this class are booked in automatically and their parents are told.</p></div>`,`<button class="btn navy" data-a="cpAddGo">Add session</button><button class="btn ghost" data-a="close">Cancel</button>`)},
  cpAddGo(){const v=document.getElementById('cpNs').value;if(!v){toast('Pick a date.');return}const c=findC(TT.cp);xOf(c).extra.push(v);close();toast('Session added to the schedule.');cpRender()},
  cpSave(){const c=findC(TT.cp),x=xOf(c),g=i=>document.getElementById(i).value;
    const cap=parseInt(g('cpC'))||c.cap;if(cap<c.sw.length){toast(`This class already has ${c.sw.length} swimmers booked, so it needs at least ${c.sw.length} places.`);return}
    const r=tryMove(c,{d:+g('cpD'),t:+g('cpTm'),pool:g('cpP'),teacher:g('cpH')},true);if(!r.ok){toast(r.msg);return}
    if(!TT.draft)delete c._o;
    c.cap=cap;c.st=g('cpS');x.title=g('cpT')||x.title;x.status=g('cpSt');x.price=parseFloat(g('cpPr'))||0;x.term=g('cpTerm');x.start=g('cpDs');x.end=g('cpDe');x.desc=g('cpDsc');c.cover=false;
    try{logIt(ME(),'Classes',`Edited details of ${x.title}`)}catch(e){}cpEdit=false;toast(r.warn?'Saved. Heads up: '+r.warn:'Class saved.');cpRender()}
});
document.addEventListener('change',e=>{const el=e.target;if(!el.dataset||el.dataset.cp!=='img'||!el.files||!el.files[0])return;const rd=new FileReader();rd.onload=()=>{const im=new Image();im.onload=()=>{const sc=Math.min(1,1000/im.width),cv=document.createElement('canvas');cv.width=im.width*sc;cv.height=im.height*sc;cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);xOf(findC(TT.cp)).img=cv.toDataURL('image/jpeg',.82);cpPic();toast('Photo updated.')};im.src=rd.result};rd.readAsDataURL(el.files[0])});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&TT.cp&&!document.querySelector('#modal .modal'))ACT.cpClose()});

const _fh=window.__h0||'';
try{if(!_fh||_fh==='#'){S.role='admin';S.view='timetable'}else{const h=_fh.slice(1).split('-');if(VIEWS[h[0]]&&VIEWS[h[0]][h[1]]){S.role=h[0];S.view=h[1]}}}catch(e){}
render();
})();
