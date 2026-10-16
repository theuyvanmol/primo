/* Decorative effects only. No storage, dependencies or tracking. */
(() => {
 'use strict';
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
 const overlay = document.createElement('section');
 overlay.className = 'aurora-intro';
 overlay.hidden = true;
 overlay.setAttribute('aria-label','NORTHLINE introduction');
 overlay.innerHTML = '<div class="aurora-sky" aria-hidden="true"></div><div class="aurora-curtain" aria-hidden="true"></div><div class="aurora-curtain second" aria-hidden="true"></div><div class="intro-vignette" aria-hidden="true"></div><div class="intro-brand"><svg class="intro-mark" viewBox="0 0 28 28" aria-hidden="true"><path d="M4 23V5h5l10 18h5V5M4 5l20 18"/></svg><span class="intro-name">NORTHLINE</span><span class="intro-tagline">INDEPENDENT THINKING. CONSIDERED DESIGN.</span></div><span class="intro-caption">A DIFFERENT PERSPECTIVE</span><button class="intro-skip">Skip intro</button>';
 document.body.append(overlay);
 const skip = overlay.querySelector('.intro-skip');
 let introTimer=0, closeTimer=0, guardTimer=0, playing=false, replaying=false, focusBefore=null;
 const previousInert = new Map();
 function restorePage(){
  previousInert.forEach((value,node)=>node.inert=value);previousInert.clear();
  document.body.classList.remove('intro-playing');
 }
 function endIntro(immediate=false){
  if(!playing)return;
  clearTimeout(introTimer);clearTimeout(closeTimer);clearTimeout(guardTimer);
  restorePage();overlay.classList.add('exiting');
  const hide=()=>{const hadFocus=overlay.contains(document.activeElement);overlay.hidden=true;playing=false;overlay.inert=true;const target=replaying?focusBefore:document.querySelector('.header .wordmark');if((replaying||hadFocus)&&target?.isConnected)target.focus({preventScroll:true});document.dispatchEvent(new Event('northline:intro-ended'))};
  if(immediate||reduced.matches)hide();else closeTimer=setTimeout(hide,850);
 }
 function playIntro(replay=false){
  if(playing||reduced.matches)return;
  playing=true;replaying=replay;focusBefore=document.activeElement;
  const menu=document.querySelector('.menu-toggle');if(menu?.getAttribute('aria-expanded')==='true')menu.click();
  if(replay){window.scrollTo({top:0,behavior:'instant'});document.querySelector('.header')?.classList.remove('fixed')}
  document.body.classList.add('intro-playing');
  document.querySelectorAll('header,main,footer,.mobile-nav,.skip-link').forEach(node=>{previousInert.set(node,node.inert);node.inert=true});
  overlay.classList.remove('exiting');overlay.hidden=false;overlay.inert=false;
  // Recreate just the decorative layer to reliably restart CSS animations.
  for(const node of [...overlay.querySelectorAll('.aurora-curtain,.intro-brand')])node.replaceWith(node.cloneNode(true));
  if(replay)skip.focus({preventScroll:true});
  introTimer=setTimeout(()=>endIntro(),3000);
  // Always release the page, even if animation events are unavailable.
  guardTimer=setTimeout(()=>endIntro(true),5000);
 }
 skip.addEventListener('click',()=>endIntro());
 overlay.addEventListener('keydown',event=>{if(event.key==='Escape')endIntro()});
 document.querySelectorAll('.wordmark').forEach(logo=>{logo.setAttribute('aria-label','NORTHLINE — home and replay introduction');logo.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;if(!reduced.matches){event.preventDefault();playIntro(true)}})});
 reduced.addEventListener('change',()=>{if(reduced.matches)endIntro(true)});
 if(location.hash===''||location.hash==='#home')playIntro();
 // Fine-pointer image depth. Pointer reads are captured once; writes share one RAF.
 document.querySelectorAll('.work-image,.studio-image').forEach(frame=>{
  let rect=null,raf=0,x=.5,y=.5;
  const paint=()=>{raf=0;frame.style.setProperty('--light-x',(x*100).toFixed(1)+'%');frame.style.setProperty('--light-y',(y*100).toFixed(1)+'%');frame.style.setProperty('--image-x',((x-.5)*-10).toFixed(1)+'px');frame.style.setProperty('--image-y',((y-.5)*-8).toFixed(1)+'px')};
  frame.addEventListener('pointerenter',()=>{if(!finePointer.matches||reduced.matches)return;rect=frame.getBoundingClientRect();frame.classList.add('image-active')},{passive:true});
  frame.addEventListener('pointermove',event=>{if(!rect||!finePointer.matches||reduced.matches)return;x=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));y=Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height));if(!raf)raf=requestAnimationFrame(paint)},{passive:true});
  frame.addEventListener('pointerleave',()=>{rect=null;x=y=.5;if(raf)cancelAnimationFrame(raf);paint();frame.classList.remove('image-active')},{passive:true});
 });
 // Low-density shooting stars only run over visible background photographs.
 const scenes=[];let frameId=0,lastTime=0;
 const random=(a,b)=>a+Math.random()*(b-a);
 for(const section of document.querySelectorAll('.hero,.contact')){
  const canvas=document.createElement('canvas');canvas.className='meteor-canvas';canvas.setAttribute('aria-hidden','true');section.append(canvas);
  const ctx=canvas.getContext('2d',{alpha:true});if(!ctx){canvas.remove();continue}
  const scene={section,canvas,ctx,width:0,height:0,visible:false,meteors:[],until:random(.6,1.8)};
  scenes.push(scene);
 }
 const sizeScene=scene=>{const r=scene.section.getBoundingClientRect();const scale=Math.min(devicePixelRatio||1,innerWidth<761?1.25:1.6);scene.width=r.width;scene.height=r.height;scene.canvas.width=Math.round(r.width*scale);scene.canvas.height=Math.round(r.height*scale);scene.ctx.setTransform(scale,0,0,scale,0,0);scene.meteors=[]};
 scenes.forEach(sizeScene);
 function wanted(){return !reduced.matches&&!document.hidden&&!document.body.classList.contains('intro-playing')&&scenes.some(s=>s.visible)}
 function sync(){if(wanted()&&!frameId){lastTime=0;frameId=requestAnimationFrame(tick)}else if(!wanted()){cancelAnimationFrame(frameId);frameId=0;lastTime=0;scenes.forEach(s=>s.ctx.clearRect(0,0,s.width,s.height))}}
 function spawn(s){const life=random(1.6,2.3);s.meteors.push({age:0,life,x:random(-.1,.7)*s.width,y:random(.04,.3)*s.height,travel:Math.min(s.width*.48,570),length:Math.min(s.width*.18,145)})}
 function tick(time){
  frameId=0;if(!wanted()){lastTime=0;return}
  const dt=lastTime?Math.min((time-lastTime)/1000,.045):0;lastTime=time;
  for(const s of scenes){if(!s.visible)continue;const c=s.ctx;c.clearRect(0,0,s.width,s.height);s.until-=dt;
   if(s.until<=0&&s.meteors.length<2){spawn(s);s.until=innerWidth<761?random(4.5,7):random(3,5.5)}
   for(const m of s.meteors){m.age+=dt;const p=m.age/m.life;if(p>=1)continue;const fade=Math.pow(Math.sin(Math.PI*p),1.25)*.72;const x=m.x+p*m.travel,y=m.y+p*m.travel*.36;const tailX=x-m.length,tailY=y-m.length*.36;
    const g=c.createLinearGradient(tailX,tailY,x,y);g.addColorStop(0,'rgba(90,155,225,0)');g.addColorStop(.65,'rgba(125,190,255,'+(fade*.4)+')');g.addColorStop(1,'rgba(225,244,255,'+fade+')');
    c.strokeStyle=g;c.lineCap='round';c.lineWidth=1.15;c.shadowColor='rgba(110,175,255,.55)';c.shadowBlur=7;c.beginPath();c.moveTo(tailX,tailY);c.lineTo(x,y);c.stroke();c.shadowBlur=0;
   }
   s.meteors=s.meteors.filter(m=>m.age<m.life);
  }
  frameId=requestAnimationFrame(tick);
 }
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){const s=scenes.find(item=>item.section===entry.target);if(s)s.visible=entry.isIntersecting}sync()},{threshold:0});
 scenes.forEach(s=>observer.observe(s.section));
 const resize=new ResizeObserver(entries=>{for(const entry of entries){const s=scenes.find(item=>item.section===entry.target);if(s)sizeScene(s)}sync()});scenes.forEach(s=>resize.observe(s.section));
 document.addEventListener('northline:intro-ended',sync);
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)endIntro(true);sync()});reduced.addEventListener('change',sync);
})();
