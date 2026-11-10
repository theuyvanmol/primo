(function(){
var QUARTZ='Engineered quartz offers a consistent look with a wide choice of colours and patterns. Explore samples with our team to find the right finish.';
var GRANITE='Natural granite has individual variation in every slab. Visit the showroom to explore the stone and select the character that suits your space.';
var NOTE='Images show separate projects. View physical samples to confirm colour and finish.';
var H=[
 ['.chapter',0,52,46,'Quartz · Island','Quartz island worktop',QUARTZ],
 ['.chapter',1,44,58,'Quartz · Upstand','Worktop and upstand, one material','A full-height upstand in the same stone as the worktop gives a seamless, easy-to-clean finish around the tap and sink.'],
 ['.chapter',2,66,52,'Showroom','See it in person','Full-size samples and finished displays, so you can judge colour and veining in real light. '+NOTE],
 ['.collection .visual',0,48,56,'Quartz','Quartz',QUARTZ],
 ['.collection .visual',1,38,38,'Granite','Granite',GRANITE],
 ['.project-grid .visual',0,42,42,'Replacement worktops','New worktops, existing units','Transform your kitchen while keeping your existing units. We template, make and fit the new stone.'],
 ['.project-grid .visual',1,44,30,'Bathroom · Vanity','Vanity tops and bespoke pieces','Made-to-measure vanity tops, furniture and special projects, in matching stone.'],
 ['.project-grid .visual',2,50,58,'Bathroom · Marble effect','Marble, from floor to vanity','Matching tops, upstands and wall panels for a calm, continuous look. '+NOTE]
];
var open=null;
function close(){if(!open)return;var e=open;open=null;e.classList.remove('open');e.style.width='';e.style.height='';e.style.marginTop='';if(e._o){e.style.left=e._o[0];e.style.right=e._o[1]}e.querySelector('.hs-btn').setAttribute('aria-expanded','false')}
function build(host,x,y,tag,title,text){
 var c=document.createElement('div');c.className='hs';
 var big=x>52;
 c.style[big?'right':'left']=(big?100-x:x)+'%';c.style.top=y+'%';
 c.innerHTML='<button class="hs-btn" type="button" aria-expanded="false" aria-label="More about '+title+'"><span></span></button><div class="hs-card"><small>'+tag+'</small><b>'+title+'</b><p>'+text+'</p><a href="#enquiry">Ask about this finish ↗</a></div>';
 var btn=c.querySelector('.hs-btn'),card=c.querySelector('.hs-card');
 btn.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();
  if(open===c){close();return}
  close();var hr=host.getBoundingClientRect();
  var w=Math.min(300,hr.width-32);card.style.width=w+'px';
  var r0=c.getBoundingClientRect();c._o=[c.style.left,c.style.right];var nl=Math.max(12,Math.min(r0.left-hr.left,hr.width-12-w));c.style.left=nl+'px';c.style.right='auto';
  c.classList.add('open');open=c;btn.setAttribute('aria-expanded','true');
  c.style.width=w+'px';c.style.height=(card.offsetHeight+0)+'px';
  var cr=c.getBoundingClientRect();
  var over=cr.bottom-hr.bottom+16;if(over>0)c.style.marginTop=(-over)+'px';else c.style.marginTop='';
 });
 card.addEventListener('click',function(ev){ev.stopPropagation();if(ev.target.tagName==='A'){close()}});
 c.addEventListener('click',function(ev){ev.stopPropagation()});
 host.appendChild(c);
}
function init(){
 H.forEach(function(h){var list=document.querySelectorAll(h[0]);var host=list[h[1]];if(!host)return;
  if(getComputedStyle(host).position==='static')host.style.position='relative';
  build(host,h[2],h[3],h[4],h[5],h[6]);});
 document.addEventListener('click',close);
 document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
