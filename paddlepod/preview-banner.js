(()=>{
var css='#pvb{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap;padding:10px 16px calc(10px + env(safe-area-inset-bottom));background:#111;color:#f4f0e7;font:500 13px/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;text-align:center;box-shadow:0 -6px 24px #0006}#pvb b{background:#d9b45a;color:#111;border-radius:99px;padding:3px 10px;font-size:11px;letter-spacing:.08em;text-transform:uppercase}#pvb a{color:#d9b45a;text-decoration:underline}body{padding-bottom:64px!important}@media(max-width:600px){#pvb{font-size:11.5px;gap:8px;flex-wrap:nowrap;padding:7px 10px calc(7px + env(safe-area-inset-bottom));text-align:left}#pvb b{font-size:10px;padding:2px 8px;flex:none}#pvb .l{display:none}body{padding-bottom:46px!important}}';
var s=document.createElement('style');s.textContent=css;document.head.appendChild(s);
var d=document.createElement('div');d.id='pvb';d.setAttribute('role','note');
d.innerHTML='<b>Preview</b><span>Demo preview only, not the final product<span class="l">. Concept by <a href="https://www.primo-mc.com/" rel="noopener">PRIMO Group</a>; details and content are subject to change</span>.</span>';
document.body.appendChild(d);
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;var id=a.getAttribute('href').slice(1);if(!id)return;var el=document.getElementById(id);if(el){e.preventDefault();el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});history.replaceState(null,'',location.pathname+location.search+'#'+id)}});

if(matchMedia('(max-width:700px)').matches){var fix=function(root){(root||document).querySelectorAll('body *').forEach(function(e){if(e.children.length||!e.textContent.trim())return;var f=parseFloat(getComputedStyle(e).fontSize);if(f&&f<10.5)e.style.fontSize='10.5px'})};
var run=function(){fix();setTimeout(fix,1500)};if(document.readyState==='complete')run();else addEventListener('load',run);}
})();
