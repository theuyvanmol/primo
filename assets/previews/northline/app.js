(() => {
 'use strict';
 const $ = (s,root=document) => root.querySelector(s);
 const $$ = (s,root=document) => [...root.querySelectorAll(s)];
 const content = window.NORTHLINE_CONTENT;
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const header = $('.header'), menu = $('.menu-toggle'), mobileNav = $('.mobile-nav');
 let lastFocus = null;
 const syncLock = () => document.body.classList.toggle('locked', !!$('dialog[open]') || mobileNav.classList.contains('open'));
 function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');mobileNav.classList.remove('open');mobileNav.inert=true;syncLock()}
 menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');mobileNav.classList.toggle('open',open);mobileNav.inert=!open;syncLock();if(open)$('a',mobileNav).focus()});
 $$('a',mobileNav).forEach(a=>a.addEventListener('click',closeMenu));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mobileNav.classList.contains('open')){closeMenu();menu.focus()}if(e.key==='Tab'&&mobileNav.classList.contains('open')){const items=[menu,...$$('a,button',mobileNav)],first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
 const mobileBreak=matchMedia('(min-width:761px)');mobileBreak.addEventListener('change',e=>{if(e.matches)closeMenu()});
 const setHeader=()=>header.classList.toggle('fixed',scrollY>90);setHeader();addEventListener('scroll',setHeader,{passive:true});
 const observe=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observe.unobserve(e.target)}}),{threshold:.08});$$('.reveal').forEach(el=>observe.observe(el));
 const contactObserve=new IntersectionObserver(([e])=>$('.contact').classList.toggle('in-view',e.isIntersecting),{threshold:.1});contactObserve.observe($('.contact'));
 const navObserve=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){$$('.desktop-nav a').forEach(a=>a.classList.toggle('current',a.hash==='#'+e.target.id))}}),{rootMargin:'-20% 0px -60% 0px'});$$('main section[id]').forEach(el=>navObserve.observe(el));
 // Native dialogs retain keyboard focus and close with Escape.
 function openDialog(dialog,trigger){lastFocus=trigger||document.activeElement;closeMenu();$$('dialog[open]').forEach(d=>d.close());dialog.showModal();syncLock()}
 $$('dialog').forEach(dialog=>{const close=()=>dialog.close();$('.dialog-close',dialog).addEventListener('click',close);dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close()}});dialog.addEventListener('close',()=>{syncLock();if(!$('dialog[open]')&&lastFocus?.isConnected)lastFocus.focus()})});
 $$('[data-contact]').forEach(button=>button.addEventListener('click',()=>openDialog($('#contact-dialog'),button)));
 $('[data-template]').addEventListener('click',e=>openDialog($('#template-dialog'),e.currentTarget));
 $$('[data-project]').forEach(button=>button.addEventListener('click',()=>{const p=content.projects[Number(button.dataset.project)];$('#project-dialog-img').src=p.image;$('#project-dialog-img').alt=p.alt;$('#project-dialog-title').textContent=p.title;$('#project-dialog-intro').textContent=p.intro;$('#project-dialog-story').textContent=p.story;$('#project-dialog-scope').replaceChildren(...p.scope.map(t=>{const li=document.createElement('li');li.textContent=t;return li}));openDialog($('#project-dialog'),button)}));
 // A single open service keeps the list focused while preserving native details behaviour.
 $$('.service-list details').forEach(detail=>detail.addEventListener('toggle',()=>{if(detail.open)$$('.service-list details').forEach(other=>{if(other!==detail)other.open=false})}));
 const tabs=$$('[data-step]'),panel=$('#process-panel');let active=0;
 function setStep(i,focus=false){active=(i+tabs.length)%tabs.length;const step=content.steps[active];tabs.forEach((tab,j)=>{tab.setAttribute('aria-selected',String(j===active));tab.tabIndex=j===active?0:-1});panel.setAttribute('aria-labelledby',tabs[active].id);$('#step-number').textContent=String(active+1).padStart(2,'0');$('#step-label').textContent=step.label;$('#step-title').textContent=step.title;$('#step-copy').textContent=step.copy;$('#step-list').replaceChildren(...step.items.map(t=>{const li=document.createElement('li');li.textContent=t;return li}));panel.classList.remove('changing');if(!reduced.matches)requestAnimationFrame(()=>panel.classList.add('changing'));if(focus)tabs[active].focus()}
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>setStep(i));tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight'||e.key==='ArrowDown')next=active+1;else if(e.key==='ArrowLeft'||e.key==='ArrowUp')next=active-1;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;if(next!==undefined){e.preventDefault();setStep(next,true)}})});
 // Deliberately local demo. Replace with your form service when publishing for a real agency.
 $('#brief-form').addEventListener('submit',e=>{e.preventDefault();const form=e.currentTarget;if(!form.reportValidity())return;const data=new FormData(form);const brief=['NORTHLINE — PROJECT BRIEF','',...['name','email','focus','timing','brief'].map(key=>key.toUpperCase()+': '+String(data.get(key)||'')),'','Created in a template demo. This file has not been sent.'].join('\n');const blob=new Blob([brief],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='northline-project-brief.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#brief-status').textContent='Your project brief is ready. A text file has been downloaded; nothing has been sent.';form.classList.add('form-sent')});
 $('#year').textContent=new Date().getFullYear();
})();
