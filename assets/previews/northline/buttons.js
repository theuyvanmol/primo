/* Progressive decoration: native actions, labels and keyboard behaviour stay intact. */
(() => {
 'use strict';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const fine=matchMedia('(hover: hover) and (pointer: fine)');
 const controls=[...document.querySelectorAll('button:not(.menu-toggle):not(.work-card)')];
 const timers=new WeakMap();
 function enabled(button){return !button.disabled&&button.getAttribute('aria-disabled')!=='true'}
 function pulse(button,surface,x,y){
  if(!enabled(button))return;
  clearTimeout(timers.get(button));button.classList.remove('fx-clicked');
  requestAnimationFrame(()=>{if(!button.isConnected)return;button.classList.add('fx-clicked');timers.set(button,setTimeout(()=>button.classList.remove('fx-clicked'),800))});
  if(reduced.matches)return;
  // Limit active ripples during repeated taps and remove each node after its animation.
  while(surface.childElementCount>=3)surface.firstElementChild.remove();
  const rect=button.getBoundingClientRect(),diameter=Math.max(rect.width,rect.height)*2.2;
  const ripple=document.createElement('span');ripple.className='fx-ripple';ripple.style.width=ripple.style.height=diameter+'px';ripple.style.left=x+'px';ripple.style.top=y+'px';surface.append(ripple);
  const remove=()=>ripple.remove();ripple.addEventListener('animationend',remove,{once:true});setTimeout(remove,850);
 }
 for(const button of controls){
  button.classList.add('fx-button');
  const surface=document.createElement('span'),edge=document.createElement('span');surface.className='fx-surface';edge.className='fx-edge';surface.setAttribute('aria-hidden','true');edge.setAttribute('aria-hidden','true');button.append(surface,edge);
  let rect=null,raf=0,px=.5,py=.5,pointerPulse=false;
  const paint=()=>{raf=0;button.style.setProperty('--fx-x',(px*100).toFixed(1)+'%');button.style.setProperty('--fx-y',(py*100).toFixed(1)+'%')};
  button.addEventListener('pointerenter',()=>{if(fine.matches)rect=button.getBoundingClientRect()},{passive:true});
  button.addEventListener('pointermove',event=>{if(!rect||!fine.matches||reduced.matches)return;px=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));py=Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height));if(!raf)raf=requestAnimationFrame(paint)},{passive:true});
  const release=()=>button.classList.remove('fx-pressed');
  button.addEventListener('pointerleave',()=>{rect=null;px=py=.5;if(raf)cancelAnimationFrame(raf);paint();release()},{passive:true});
  button.addEventListener('pointerdown',event=>{if(!enabled(button)||event.button!==0||!event.isPrimary)return;const r=button.getBoundingClientRect();button.classList.add('fx-pressed');pointerPulse=true;pulse(button,surface,event.clientX-r.left,event.clientY-r.top)},{passive:true});
  button.addEventListener('pointerup',release,{passive:true});button.addEventListener('pointercancel',()=>{release();pointerPulse=false},{passive:true});button.addEventListener('blur',release);
  button.addEventListener('keydown',event=>{if((event.key===' '||event.key==='Enter')&&!event.repeat&&enabled(button)){pointerPulse=false;button.classList.add('fx-pressed')}});
  button.addEventListener('keyup',release);
  // Capture paints before existing click handlers open dialogs or replace content.
  button.addEventListener('click',event=>{if(!enabled(button))return;if(event.detail===0||!pointerPulse){const r=button.getBoundingClientRect();pulse(button,surface,r.width/2,r.height/2)}pointerPulse=false;release()},{capture:true});
 }
 window.addEventListener('blur',()=>controls.forEach(button=>button.classList.remove('fx-pressed')));
})();
