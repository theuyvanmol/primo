/* PRIMO AI assistant (ElevenLabs Agents widget). Loads only when an agent id is configured, after the page is idle. */
(()=>{const me=document.currentScript,id=me&&me.dataset.agent;if(!id||document.querySelector('elevenlabs-convai'))return;
let done=false;const load=()=>{if(done)return;done=true;
 const el=document.createElement('elevenlabs-convai');el.setAttribute('agent-id',id);el.setAttribute('variant','compact');el.setAttribute('action-text','Talk to PRIMO');el.setAttribute('start-call-text','Start voice chat');el.setAttribute('end-call-text','End chat');document.body.appendChild(el);document.documentElement.classList.add('has-agent');
 const s=document.createElement('script');s.src='https://elevenlabs.io/convai-widget/index.js';s.async=true;s.type='text/javascript';s.onerror=()=>{el.remove();document.documentElement.classList.remove('has-agent')};document.body.appendChild(s)};
/* load after the page and intro settle, never during the first scroll */
const go=()=>(window.requestIdleCallback||setTimeout)(()=>setTimeout(load,innerWidth<900?9000:5000),{timeout:12000});
if(document.readyState==='complete')go();else addEventListener('load',go,{once:true})})()
