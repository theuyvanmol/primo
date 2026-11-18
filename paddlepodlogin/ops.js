/* PaddlePod ops: Cafe & POS, Accounts (Xero), Texts, What this replaces. Prototype, sample data. */
(function(){
const E=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const gbp=n=>'£'+(+n).toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2});
const gbp0=n=>'£'+Math.round(+n).toLocaleString('en-GB');
const O=S.ops={cafeV:'Both venues',smsTab:'inbox',smsSel:'t1',smsMob:false,bkTab:'xero'};
/* ---------- data ---------- */
S.cafe={orders:[
 {id:1048,src:'App',who:'Sarah T',v:'Killingworth',items:['Latte ×1','Cheese toastie ×1','Kids juice ×2'],total:11.50,st:'new',t:'16:42'},
 {id:1047,src:'Till',who:'Table 3',v:'Killingworth',items:['Cappuccino ×2','Cookie ×2'],total:10.40,st:'new',t:'16:40'},
 {id:1046,src:'App',who:'Mark E',v:'Shiremoor',items:['Hot chocolate ×2','Bacon roll ×1'],total:10.20,st:'prep',t:'16:36'},
 {id:1045,src:'App',who:'Aisha K',v:'Shiremoor',items:['Latte ×1','Fruit pot ×1'],total:5.60,st:'prep',t:'16:31'},
 {id:1044,src:'Till',who:'Counter',v:'Killingworth',items:['Kids juice ×3','Cookie ×1'],total:6.30,st:'ready',t:'16:22'},
 {id:1043,src:'App',who:'Daniel P',v:'Shiremoor',items:['Americano ×1','Toastie ×1'],total:7.30,st:'ready',t:'16:18'},
 {id:1042,src:'App',who:'Laura B',v:'Killingworth',items:['Latte ×2'],total:6.80,st:'done',t:'16:05'}],
 menu:[['Latte',3.40,1],['Cappuccino',3.40,1],['Americano',2.80,1],['Hot chocolate',3.00,1],['Cheese toastie',4.50,1],['Bacon roll',4.20,0],['Kids juice',1.50,1],['Cookie',1.80,1],['Fruit pot',2.20,1]]};
S.sms={t:[
 {id:'t1',who:'Sarah Thompson',sw:'Olivia · Stage 4',unread:1,m:[['in','Hi, Olivia is poorly so will miss tonight. Can she make it up?','16:05']]},
 {id:'t2',who:'Daniel Price',sw:'Mia · Stage 5',unread:1,m:[['out','Hi Daniel, your payment of £68 did not go through. You can update it in your account.','Mon 09:10'],['in','Thanks, I will sort it tonight','15:48']]},
 {id:'t3',who:'Tom Walsh',sw:'Freddie and Ruby',unread:0,m:[['in','Running 10 mins late for the 17:15','Yesterday'],['out','No problem Tom, see you soon.','Yesterday']]},
 {id:'t4',who:'Aisha Khan',sw:'Zara · Nemo Toddlers',unread:0,m:[['out','Reminder: Zara swims tomorrow at 09:15, Shiremoor. Bring a swim nappy.','Tue 18:00']]},
 {id:'t5',who:'Laura Bennett',sw:'Isla · Stage 3',unread:0,m:[['in','Can we move Isla to Saturdays from January?','Mon 12:30'],['out','Of course. I will add it to the spring timetable for you.','Mon 12:41']]}],
 sent:[['Stage 4 · Sat 09:30','Class moved to 10:00 this week. See you then!','6 parents','Mon 15:02'],['Parents with failed payments','A quick reminder that your payment did not go through…','6 parents','Mon 09:10'],['Shiremoor','The pool is closed on 18 Nov. We will rebook every lesson.','342 parents','Fri 14:30']]};
const mk=(k,l,c,n,rep,note)=>({k,l,c,n:n||'',rep,note:note||''});
S.cost=[mk('do','DoDays booking system',0,'',true,'35p for each active booking'),mk('dp','Deputy (rotas, timesheets, payroll)',280,'',true),mk('ol','Outlook hosted email',100,'',true),mk('ac','ActiveCampaign (marketing)',50,'',true),mk('dj','Dojo POS and cafe app (per venue, about £50)',100,'',false,'Commission based, so the saving is optional'),mk('mb','MessageBird (texts)',0,'',true,'Enter your monthly cost'),mk('xr','Xero accounting',0,'',false,'Stays. We export to it.'),mk('ex','Excel and Trello',0,'',true,'Free today, but time spent')];
O.bookings=1214;
/* ---------- cafe ---------- */
const CST=[['new','New'],['prep','Preparing'],['ready','Ready'],['done','Collected']];
A.cafe=function(){
  const v=O.cafeV,ord=S.cafe.orders.filter(o=>v==='Both venues'||o.v===v),sales=ord.reduce((a,o)=>a+o.total,0);
  const card=o=>`<article class="oc ${o.src==='App'?'app':''}"><div class="oc-h"><b>#${o.id}</b><span class="pill t-${o.src==='App'?'blue':'grey'}">${o.src==='App'?'App order':'Till'}</span><span class="sub">${o.t}</span></div><div class="oc-w">${E(o.who)} <span class="sub">· ${o.v}</span></div><ul>${o.items.map(i=>`<li>${E(i)}</li>`).join('')}</ul>
    <div class="oc-f"><b>${gbp(o.total)}</b>${o.st!=='done'?`<button class="btn sm ${o.st==='ready'?'navy':''}" data-a="cafeNext" data-id="${o.id}">${{new:'Start',prep:'Mark ready',ready:'Collected'}[o.st]}</button>`:'<span class="pill t-green">Done</span>'}</div></article>`;
  const top=[['Latte',38],['Cheese toastie',24],['Kids juice',22],['Cappuccino',19],['Cookie',17]];
  return {eb:'Cafe and POS',h:'Cafe and orders',sub:'Orders from the app and the till, per venue.',body:`
  <div class="ops-top"><div class="seg">${['Both venues','Killingworth','Shiremoor'].map(x=>`<button class="${v===x?'on':''}" data-a="cafeV" data-v="${x}">${x}</button>`).join('')}</div><span class="pill t-green">Dojo connected · synced 2 min ago</span></div>
  <div class="ops-k"><div><span>Sales today</span><b>${gbp(sales+214.6)}</b></div><div><span>Orders</span><b>${ord.length+31}</b></div><div><span>Average order</span><b>${gbp((sales+214.6)/(ord.length+31))}</b></div><div><span>Ordered from the app</span><b>68%</b></div></div>
  <div class="oboard">${CST.map(c=>{const cs=ord.filter(o=>o.st===c[0]);return `<section class="ocol"><header><h3>${c[1]}</h3><span class="pill t-grey">${cs.length}</span></header>${cs.map(card).join('')||'<div class="empty2">No orders</div>'}</section>`}).join('')}</div>
  <div class="grid g2"><div class="card"><div class="ch"><h3>Menu</h3><span class="sub">Switch an item off when it runs out</span></div>${S.cafe.menu.map((m,i)=>`<div class="row"><div class="grow"><b>${m[0]}</b><div class="sub">${gbp(m[1])}</div></div><label class="tgl"><input type="checkbox" data-a="cafeMenu" data-i="${i}" ${m[2]?'checked':''} aria-label="${m[0]} available"><span></span></label></div>`).join('')}</div>
   <div class="card"><div class="ch"><h3>Best sellers today</h3></div>${top.map(t=>`<div class="hbar"><span>${t[0]}</span><div class="prog"><i style="width:${t[1]/38*100}%;background:var(--teal)"></i></div><b class="num" style="color:var(--navy)">${t[1]}</b></div>`).join('')}
   <p class="note" style="margin-top:12px">${ico('info',16)} Parents can order from their phone during the lesson. The drink is ready when the lesson ends. Dojo handles card payments, so the till and this screen stay in step.</p></div></div>`};
};
Object.assign(ACT,{
 cafeV(d){O.cafeV=d.v;render()},
 cafeNext(d){const o=S.cafe.orders.find(x=>x.id==d.id),i=CST.findIndex(c=>c[0]===o.st);o.st=CST[Math.min(3,i+1)][0];render();toast(o.st==='ready'?`Order #${o.id} is ready. ${o.src==='App'?E(o.who)+' has been told.':''}`:`Order #${o.id} updated.`)},
 cafeMenu(d,el){S.cafe.menu[+d.i][2]=el.checked?1:0;toast(`${S.cafe.menu[+d.i][0]} ${el.checked?'back on the menu':'switched off in the app and on the till'}.`)}
});
/* ---------- accounts / xero ---------- */
const INV=()=>{const rows=[['Sarah Thompson','sarah@example.com','Nemo Juniors Stage 4, monthly',51.5],['Sarah Thompson','sarah@example.com','Nemo Toddlers, monthly',49],['Daniel Price','daniel@example.com','Juniors Stage 5, monthly',68],['Laura Bennett','laura@example.com','Juniors Stage 3, monthly',51.5],['Tom Walsh','tom@example.com','Juniors Stage 2 (2 swimmers), monthly',103],['Aisha Khan','aisha@example.com','Nemo Pre-school, monthly',54],['Mark Ellis','mark@example.com','Juniors Stage 6, monthly',51.5],['Chris Young','chris@example.com','Juniors Stage 1, monthly',51.5],['Gemma Lowe','gemma@example.com','Christmas crash course',45]];return rows.map((r,i)=>({no:'INV-'+(1200+i),c:r[0],e:r[1],d:r[2],a:r[3],code:/course/.test(r[2])?'201':'200',date:'01/11/2026',due:'08/11/2026'}))};
A.books=function(){
  const inv=INV(),tot=inv.reduce((a,i)=>a+i.a,0),T=O.bkTab;
  const tabs=[['xero','Xero'],['stripe','Stripe payouts']];
  const map=[['Lessons and Direct Debit','200','Sales: Lessons'],['Courses and events','201','Sales: Courses'],['Cafe sales (from Dojo)','202','Sales: Cafe'],['Refunds and credits','205','Refunds'],['Stripe fees','404','Bank fees']];
  const pay=[['Mon 2 Nov','£3,842.10','74 payments','Matched'],['Fri 30 Oct','£1,206.55','31 payments','Matched'],['Wed 28 Oct','£518.40','12 payments','Needs review'],['Mon 26 Oct','£4,011.25','81 payments','Matched']];
  return {eb:'Accounts',h:'Accounts and Xero',sub:'Send invoices and payments to Xero without retyping them.',body:`
  <div class="utabs">${tabs.map(x=>`<button class="${T===x[0]?'on':''}" data-a="bkTab" data-t="${x[0]}">${x[1]}</button>`).join('')}</div>
  ${T==='xero'?`<div class="card"><div class="ch"><div><h3>Xero</h3><span class="sub">PaddlePod Ltd · last sync today 07:00</span></div><span class="pill t-green">Connected</span></div>
    <div class="hrow"><button class="btn navy" data-a="toast" data-m="Synced with Xero. 9 invoices and 4 payments sent.">Sync now</button><button class="btn ghost" data-a="xeroCsv">Download invoices for Xero (CSV)</button></div></div>
  <div class="grid g2"><div class="card"><div class="ch"><h3>Ready to send</h3><span class="sub">November so far</span></div><div class="ops-k" style="margin:0"><div><span>Invoices</span><b>${inv.length}</b></div><div><span>Value</span><b>${gbp(tot)}</b></div></div><div class="tbl"><table class="rt"><thead><tr><th>Invoice</th><th>Customer</th><th class="num">Amount</th></tr></thead><tbody>${inv.map(i=>`<tr><td><b>${i.no}</b></td><td>${E(i.c)}<div class="sub">${E(i.d)}</div></td><td class="num">${gbp(i.a)}</td></tr>`).join('')}</tbody></table></div></div>
  <div class="card"><div class="ch"><h3>Account codes</h3><span class="sub">Where each kind of income goes in Xero</span></div>${map.map(m=>`<div class="row"><div class="grow"><b>${m[0]}</b><div class="sub">${m[2]}</div></div><span class="pill t-blue">${m[1]}</span></div>`).join('')}<p class="note" style="margin-top:12px">${ico('info',16)} Your accountant can change these codes once. After that every export uses them.</p></div></div>`
  :`<div class="card"><div class="ch"><div><h3>Stripe</h3><span class="sub">Card and Direct Debit payments</span></div><span class="pill t-green">Connected</span></div><div class="tbl"><table class="rt"><thead><tr><th>Payout date</th><th class="num">Amount</th><th>Payments</th><th>Xero match</th></tr></thead><tbody>${pay.map(p=>`<tr><td><b>${p[0]}</b></td><td class="num">${p[1]}</td><td>${p[2]}</td><td>${p[3]==='Matched'?pill('Matched','green'):`<button class="btn sm" data-a="toast" data-m="Opening the payout to match it.">Review</button>`}</td></tr>`).join('')}</tbody></table></div>
  <p class="note" style="margin-top:12px">${ico('info',16)} Each Stripe payout is matched to the invoices it paid, so the bank feed in Xero reconciles in one click.</p></div>`}`};
};
Object.assign(ACT,{bkTab(d){O.bkTab=d.t;render()},
 xeroCsv(){const h=['*ContactName','EmailAddress','*InvoiceNumber','*InvoiceDate','*DueDate','Description','*Quantity','*UnitAmount','*AccountCode','*TaxType','Currency'],rows=INV().map(i=>[i.c,i.e,i.no,i.date,i.due,i.d,1,i.a.toFixed(2),i.code,'No VAT','GBP']),csv=[h].concat(rows).map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['﻿'+csv],{type:'text/csv'}));a.download='paddlepod-xero-invoices-nov-2026.csv';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);toast('Xero invoice file downloaded.')}});
/* ---------- texts ---------- */
const segs=n=>Math.max(1,Math.ceil(n/160));
const sb=()=>{const b=document.querySelector('.st-b');if(b)b.scrollTop=b.scrollHeight};
A.sms=function(){
  setTimeout(sb,30);
  const T=O.smsTab,th=S.sms.t,cur=th.find(x=>x.id===O.smsSel)||th[0];
  const tabs=[['inbox','Inbox'],['send','Send a text'],['sent','Sent']],un=th.filter(t=>t.unread).length;
  const list=`<div class="sl">${th.map(t=>`<button class="sli ${t.id===cur.id?'on':''}" data-a="smsOpen" data-id="${t.id}"><span class="av">${ini(t.who)}</span><span class="grow"><b>${E(t.who)}</b><small>${E(t.m[t.m.length-1][1])}</small></span><span class="smm"><em>${E(t.m[t.m.length-1][2])}</em>${t.unread?'<i class="ud"></i>':''}</span></button>`).join('')}</div>`;
  const thread=`<div class="smt"><div class="st-h"><button class="mbk" data-a="smsBack" aria-label="Back to messages">${ico('back',18)}</button><span class="av">${ini(cur.who)}</span><div class="grow"><b>${E(cur.who)}</b><small>${E(cur.sw)}</small></div></div><div class="st-b">${cur.m.map(m=>`<div class="bub ${m[0]}">${E(m[1])}<small>${m[2]}</small></div>`).join('')}</div>
   <div class="st-q">${['Thanks, see you then!','Yes, we can make that up. I will send options.','Please call us on 0191 000 0000'].map(q=>`<button class="chip" data-a="smsQuick" data-q="${E(q)}">${E(q)}</button>`).join('')}</div>
   <div class="st-f"><input type="text" id="smsR" placeholder="Reply by text" aria-label="Reply"><button class="btn navy sm" data-a="smsSend">Send</button></div></div>`;
  return {eb:'Texts',h:'Texts',sub:'Two-way texts with parents. Replies land here.',body:`<div class="utabs">${tabs.map(x=>`<button class="${T===x[0]?'on':''}" data-a="smsTab" data-t="${x[0]}">${x[1]}${x[0]==='inbox'&&un?` <span class="nb">${un}</span>`:''}</button>`).join('')}</div>
  ${T==='inbox'?`<div class="smsw ${O.smsMob?'thr':''}">${list}${thread}</div>`:T==='send'?`<div class="card"><div class="form"><label class="f">Send to<select id="sdA"><option>Juniors Stage 4 · Sat 09:30 (6 parents)</option><option>Everyone at Shiremoor (342 parents)</option><option>Parents with failed payments (6 parents)</option><option>Classes needing cover (23 parents)</option></select></label>
   <label class="f">Message<textarea id="sdM" rows="4" placeholder="Hi {parent_name}, …"></textarea></label><div class="sub" id="sdC">0 characters · 1 text per parent</div>
   <div class="hrow">${['{parent_name}','{swimmer_name}','{class}'].map(t=>`<button class="chip" data-a="smsTag" data-t="${t}">${t}</button>`).join('')}</div><div class="hrow"><button class="btn navy" data-a="smsGo">Send text</button></div></div></div>`
   :`<div class="card">${S.sms.sent.map(s=>`<div class="row"><div class="grow"><b>${E(s[0])}</b> <span class="sub">${s[2]}</span><div>${E(s[1])}</div></div><span class="sub">${s[3]}</span></div>`).join('')}</div>`}`};
};
Object.assign(ACT,{smsTab(d){O.smsTab=d.t;render()},smsOpen(d){O.smsSel=d.id;O.smsMob=true;const t=S.sms.t.find(x=>x.id===d.id);t.unread=0;render()},smsBack(){O.smsMob=false;render()},
 smsQuick(d){const i=document.getElementById('smsR');i.value=d.q;i.focus()},
 smsSend(){const i=document.getElementById('smsR'),v=i.value.trim();if(!v)return;S.sms.t.find(x=>x.id===O.smsSel).m.push(['out',v,'Just now']);render();toast('Text sent.');setTimeout(()=>{const n=document.getElementById('smsR');if(n&&matchMedia('(min-width:801px)').matches)n.focus()},40)},
 smsTag(d){const m=document.getElementById('sdM');m.value+=d.t;m.dispatchEvent(new Event('input',{bubbles:true}));m.focus()},
 smsGo(){const m=document.getElementById('sdM'),v=m.value.trim();if(!v){toast('Write a message first.');return}const a=document.getElementById('sdA').value;S.sms.sent.unshift([a.replace(/ \(.*/,''),v,(a.match(/\((\d+)/)||[0,'?'])[1]+' parents','Just now']);O.smsTab='sent';render();toast('Text sent.')}});
document.addEventListener('input',e=>{if(e.target.id==='sdM'){const n=e.target.value.length;document.getElementById('sdC').textContent=`${n} characters · ${segs(n)} text${segs(n)>1?'s':''} per parent`}
 if(e.target.dataset&&e.target.dataset.cost!=null){const r=S.cost[+e.target.dataset.cost];r.c=Math.max(0,parseFloat(e.target.value)||0);costTot()}});
document.addEventListener('keydown',e=>{if(e.target.id==='smsR'&&e.key==='Enter')ACT.smsSend()});
/* ---------- what this replaces ---------- */
const rowCost=r=>r.k==='do'?0.35*O.bookings:r.c;
function costTot(){const el=document.getElementById('costTot');if(!el)return;const cur=S.cost.reduce((a,r)=>a+rowCost(r),0),sv=S.cost.filter(r=>r.rep).reduce((a,r)=>a+rowCost(r),0);
 el.innerHTML=`<div><span>Paid today</span><b>${gbp0(cur)}<small>/month</small></b></div><div><span>Replaced by PaddlePod</span><b>${gbp0(sv)}<small>/month</small></b></div><div class="sv"><span>Saved a year</span><b>${gbp0(sv*12)}</b></div>`;
 S.cost.forEach((r,i)=>{const b=document.getElementById('cb'+i);if(b)b.textContent=gbp(rowCost(r))})}
A.costs=function(){
  setTimeout(costTot,0);
  return {eb:'Business case',h:'What this replaces',sub:'Everything you pay for today next to what PaddlePod would take over. Edit the numbers to match your invoices.',body:`
  <div class="ops-tot" id="costTot"></div>
  <div class="card"><div class="ch"><h3>Monthly costs</h3><span class="sub">Tick what PaddlePod would replace</span></div>
  ${S.cost.map((r,i)=>`<div class="cr"><label class="tgl"><input type="checkbox" data-a="costRep" data-i="${i}" ${r.rep?'checked':''} aria-label="Replace ${E(r.l)}"><span></span></label><div class="grow"><b>${E(r.l)}</b><div class="sub">${E(r.note)}</div></div>
   ${r.k==='do'?`<label class="cin"><span>Active bookings</span><input type="number" min="0" value="${O.bookings}" data-a="costB" aria-label="Active bookings"></label><b class="num" id="cb${i}"></b>`:`<label class="cin"><span>£ a month</span><input type="number" min="0" step="1" value="${r.c}" data-cost="${i}" aria-label="Monthly cost of ${E(r.l)}"></label><b class="num" id="cb${i}"></b>`}</div>`).join('')}
  <p class="note" style="margin-top:12px">${ico('info',16)} Figures come from the brief. DoDays is 35p per active booking each month, so the booking count is editable (1,214 is sample data). Dojo is left unticked because it is commission based. Xero stays.</p></div>`};
};
Object.assign(ACT,{costRep(d,el){S.cost[+d.i].rep=el.checked;costTot()}});
document.addEventListener('input',e=>{if(e.target.dataset&&e.target.dataset.a==='costB'){O.bookings=Math.max(0,parseInt(e.target.value)||0);costTot()}});
/* ---------- nav ---------- */
const ins=(nv,after,item)=>{const i=nv.findIndex(n=>n[0]===after);nv.splice(i<0?nv.length:i+1,0,item)};
ins(NAV.super,'email',['sms','Texts','chat',()=>S.sms.t.filter(t=>t.unread).length]);ins(NAV.admin,'email',['sms','Texts','chat',()=>S.sms.t.filter(t=>t.unread).length]);
ins(NAV.super,'staff',['cafe','Cafe and POS','gift']);ins(NAV.admin,'staff',['cafe','Cafe and POS','gift']);
ins(NAV.super,'pay',['books','Accounts and Xero','pound']);ins(NAV.super,'reports',['costs','What this replaces','chart']);
BLOCK_ADMIN.push('books','costs');SHORT.sms='Texts';SHORT.cafe='Cafe';
S.view==='x';
const h=window.__h0||'';if(h){const p=h.slice(1).split('-');if(VIEWS[p[0]]&&VIEWS[p[0]][p[1]]){S.role=p[0];S.view=p[1]}}
render();
})();
