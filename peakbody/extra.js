(function(){
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var pr=function(id){return data.find(function(p){return p.id===id})};
var img=function(id){return PEAK_ASSETS[id+'-real.jpg']};
var money=function(n){return '£'+n.toFixed(2)};
/* reveal */
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.15,rootMargin:'0px 0px -6% 0px'});
function rv(){$$('.rv:not(.in)').forEach(function(e){io.observe(e)})}
$$('.section-head,.goal,.editorial,.heritage-copy,.newsletter>*').forEach(function(e,i){e.classList.add('rv');e.style.setProperty('--d',(i%3)*.1+'s')});
$$('.sgrid,.wgrid,.stats,.dline').forEach(function(g){$$(':scope>*',g).forEach(function(c,i){if(g.classList.contains('dline'))return;c.classList.add('rv');c.style.setProperty('--d',i*.09+'s')})});
/* spotlight */
var sp=$('.spot');
if(sp){var w=pr('whey');
 $('.spot .price').textContent=money(w.price);
 $('.pack img').src=img('whey');
 $('#spotAdd').onclick=function(){add('whey',w.flavours[0])};
 $('#spotMore').onclick=function(){detail('whey')};
 var st=$('.stage'),pk=$('.pack');
 st.addEventListener('pointermove',function(e){var r=st.getBoundingClientRect();var x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;pk.style.setProperty('--ry',(x*16)+'deg');pk.style.setProperty('--rx',(-y*12)+'deg')});
 st.addEventListener('pointerleave',function(){pk.style.setProperty('--ry','-8deg');pk.style.setProperty('--rx','4deg')});
}
/* stack builder */
var stacks={muscle:[['whey','AFTER TRAINING'],['creatine','DAILY']],fuel:[['preworkout','BEFORE TRAINING'],['creatine','DAILY']],recover:[['recovery','EVENING'],['whey','AFTER TRAINING']]};
var cur='muscle';
function drawStack(){var g=$('#sgrid');if(!g)return;var items=stacks[cur],tot=0;
 g.innerHTML=items.map(function(it){var p=pr(it[0]);tot+=p.price;return '<div class="scard"><span class="role">'+it[1]+'</span><img src="'+img(it[0])+'" alt="'+p.name+'" loading="lazy"><b>'+p.name+'</b><small>'+p.size+' · '+money(p.price)+'</small></div>'}).join('')+'<div class="stot"><div><small>STACK TOTAL</small><div class="big">'+money(tot)+'</div></div><div><button class="sbtn" id="addStack">Add stack to bag →</button></div><small>A simple starting point, not advice. Check each label and speak to a professional if you are unsure.</small></div>';
 $('#addStack').onclick=function(){items.forEach(function(it){add(it[0],pr(it[0]).flavours[0])})};
}
$$('.stabs button').forEach(function(b){b.onclick=function(){cur=b.dataset.s;$$('.stabs button').forEach(function(x){x.classList.toggle('on',x===b)});drawStack()}});
drawStack();
/* day timeline images + buttons */
$$('.dstep').forEach(function(s,i){var id=s.dataset.p;var im=$('img',s);if(im)im.src=img(id);var b=$('button',s);if(b)b.onclick=function(){detail(id)};s.classList.add('rv');s.style.setProperty('--d',i*.12+'s')});
/* counters */
function count(el){var t=+el.dataset.to,d=1600,t0=null;function f(ts){if(!t0)t0=ts;var k=Math.min(1,(ts-t0)/d);k=1-Math.pow(1-k,3);el.textContent=Math.round(t*k);if(k<1)requestAnimationFrame(f)}requestAnimationFrame(f)}
var yrs=$('#yrs');if(yrs)yrs.dataset.to=new Date().getFullYear()-1995;
var cio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){count(e.target);cio.unobserve(e.target)}})},{threshold:.6});
$$('[data-to]').forEach(function(e){cio.observe(e)});
/* scroll: progress bar, parallax text, timeline fill */
var bar=document.createElement('div');bar.id='pgbar';document.body.appendChild(bar);
var dl=$('.dline'),bg=$('.spot-bg'),spEl=$('.spot'),tick=false;
function onS(){tick=false;var h=document.documentElement.scrollHeight-innerHeight;bar.style.transform='scaleX('+(h>0?scrollY/h:0)+')';
 if(dl){var r=dl.getBoundingClientRect();var p=Math.max(0,Math.min(1,(innerHeight*.75-r.top)/r.height));dl.style.setProperty('--p',p.toFixed(3));$$('.dstep',dl).forEach(function(s){var sr=s.getBoundingClientRect();s.classList.toggle('on',sr.top<innerHeight*.75)})}
 if(bg&&spEl){var r2=spEl.getBoundingClientRect();bg.style.setProperty('--py',((r2.top+r2.height/2-innerHeight/2)*-.12).toFixed(1)+'px')}}
addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(onS)}},{passive:true});onS();
rv();
})();
