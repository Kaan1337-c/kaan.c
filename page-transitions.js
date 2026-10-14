(() => {
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let leaving=false,timer=0;
  const reset=()=>{
    clearTimeout(timer);leaving=false;document.documentElement.classList.remove('is-leaving');
  };
  window.addEventListener('pageshow',reset);
  window.addEventListener('focus',reset);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)reset();});
  document.addEventListener('click',event=>{
    if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||motion.matches||leaving)return;
    const link=event.target.closest('a[href]');
    if(!link||link.hasAttribute('download'))return;
    const destination=new URL(link.href,location.href);
    if(!['https:','http:'].includes(destination.protocol))return;
    if(destination.origin===location.origin&&destination.pathname===location.pathname&&destination.search===location.search)return;
    event.preventDefault();leaving=true;
    if(link.target==='_blank'){


      const next=window.open('about:blank','_blank');
      if(next){
        next.opener=null;
        next.document.write('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>C Kaan</title><style>html,body{height:100%;margin:0;background:#090909;color:#ddd}body{display:grid;place-items:center;font:20px monospace;letter-spacing:.25em}span{animation:fade .45s ease both}@keyframes fade{from{opacity:0;filter:blur(8px);transform:translateY(8px)}to{opacity:1;filter:blur(0);transform:translateY(0)}}</style></head><body><span>C KAAN</span></body></html>');
        next.document.close();
        document.documentElement.classList.add('is-leaving');
        timer=setTimeout(()=>{
          if(!next.closed)next.location.replace(destination.href);
          reset();
        },420);
        return;
      }
    }
    document.documentElement.classList.add('is-leaving');
    timer=setTimeout(()=>location.assign(destination.href),420);
  });
})();
