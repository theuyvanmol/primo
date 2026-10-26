(()=>{const root=document.body;if(!root.classList.contains('curate'))return;
const p=location.pathname.replace(/[^/]*$/,'');const depth=(document.querySelector('a.logo')||{}).getAttribute?document.querySelector('a.logo').getAttribute('href'):'/';
const base=depth.replace(/index\.html$/,'');const f=document.createElement('aside');f.className='cfab';f.setAttribute('aria-label','Contact');
f.innerHTML='<img src="'+base+'assets/favicon-48.png" alt="" width="28" height="28"><span>Have a project in mind?</span><a href="'+base+'contact/">Get in Touch ↗</a>';document.body.appendChild(f);
const contact=/\/contact\/?$/.test(location.pathname);let t=false;
const upd=()=>{t=false;f.classList.toggle('show',!contact&&scrollY>innerHeight*.6)};
addEventListener('scroll',()=>{if(!t){t=true;requestAnimationFrame(upd)}},{passive:true});upd();
})();
