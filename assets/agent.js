/* PRIMO AI assistant (ElevenLabs Agents widget). Loads only when an agent id is configured, after the page is idle. */
(()=>{const me=document.currentScript,id=me&&me.dataset.agent;if(!id||document.querySelector('elevenlabs-convai'))return;
let done=false;const load=()=>{if(done)return;done=true;
 const el=document.createElement('elevenlabs-convai');el.setAttribute('agent-id',id);el.setAttribute('variant','compact');el.setAttribute('action-text','Talk to PRIMO');el.setAttribute('start-call-text','Start voice chat');el.setAttribute('end-call-text','End chat');document.body.appendChild(el);
 const s=document.createElement('script');s.src='https://unpkg.com/@elevenlabs/convai-widget-embed';s.async=true;s.type='text/javascript';s.onerror=()=>el.remove();document.body.appendChild(s)};
['pointerdown','keydown','scroll','touchstart'].forEach(e=>addEventListener(e,load,{once:true,passive:true}));
(window.requestIdleCallback||setTimeout)(()=>setTimeout(load,4000),{timeout:6000})})();
