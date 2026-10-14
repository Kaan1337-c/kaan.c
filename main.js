(() => {
  const sections=[...document.querySelectorAll('main > section[id]')];
  const links=[...document.querySelectorAll('.header nav a[href^="#"]')];
  if(!sections.length||!links.length)return;
  document.body.classList.add('js-enhanced');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const atmosphere=document.createElement('div');
  atmosphere.className='section-atmosphere';
  atmosphere.setAttribute('aria-hidden','true');
  ['home','skills','projects','contact'].forEach(theme=>{
    const light=document.createElement('span');
    light.className='section-atmosphere__light section-atmosphere__light--'+theme;
    atmosphere.append(light);
  });
  const veil=document.createElement('span');
  veil.className='section-atmosphere__veil';
  atmosphere.append(veil);
  document.body.append(atmosphere);
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting)entry.target.classList.add('is-visible');
    });
  },{threshold:.18});
  sections.forEach(section=>observer.observe(section));
  let ticking=false,scrollFrame=0;
  function updateActive(){
    ticking=false;
    const anchor=innerHeight*.44;
    const frames=sections.map(section=>({section,rect:section.getBoundingClientRect()}));
    const current=(frames.find(({rect})=>rect.top<=anchor&&rect.bottom>anchor)||frames.reduce((best,item)=>{
      const distance=Math.min(Math.abs(item.rect.top-anchor),Math.abs(item.rect.bottom-anchor));
      const bestDistance=Math.min(Math.abs(best.rect.top-anchor),Math.abs(best.rect.bottom-anchor));
      return distance<bestDistance?item:best;
    },frames[0])).section;
    frames.forEach(({section,rect})=>{
      const overlap=Math.max(0,Math.min(rect.bottom,innerHeight)-Math.max(rect.top,0));
      const presence=reduce.matches?1:Math.min(1,overlap/Math.min(rect.height,innerHeight));
      section.style.setProperty('--scene-presence',(.16+presence*.84).toFixed(3));
    });

    const passage=reduce.matches?0:frames.slice(1).reduce((strength,{rect})=>{
      const proximity=Math.max(0,1-Math.abs(rect.top-innerHeight*.5)/(innerHeight*.52));
      return Math.max(strength,proximity*proximity);
    },0);
    atmosphere.style.setProperty('--section-mix',passage.toFixed(3));
    document.body.dataset.sectionTheme=current.id;
    const active='#'+(current.dataset.nav||current.id);
    links.forEach(link=>{
      const on=link.hash===active;
      link.classList.toggle('active',on);
      if(on)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
    });
  }
  addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(updateActive);}},{passive:true});
  addEventListener('resize',updateActive);
  updateActive();
  function stopScroll(){
    cancelAnimationFrame(scrollFrame);
    scrollFrame=0;
    document.documentElement.classList.remove('is-section-scrolling');
  }
  document.addEventListener('click',event=>{
    if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    const link=event.target.closest('a[href^="#"]');
    const target=link&&sections.find(section=>'#'+section.id===link.hash);
    if(!target)return;
    target.classList.add('is-visible');
    if(reduce.matches)return;
    event.preventDefault();
    stopScroll();
    const start=scrollY;
    const end=Math.min(Math.max(0,start+target.getBoundingClientRect().top),document.documentElement.scrollHeight-innerHeight);
    const distance=end-start;
    const duration=Math.min(1900,1500+Math.abs(distance)*.12);
    const begun=performance.now();
    document.documentElement.classList.add('is-section-scrolling');
    function travel(now){
      const progress=Math.min(1,(now-begun)/duration);
      const eased=(1-Math.cos(Math.PI*progress))/2;
      scrollTo({top:start+distance*eased,behavior:'auto'});
      if(progress<1){scrollFrame=requestAnimationFrame(travel);return;}
      stopScroll();
      if(location.hash!==link.hash)history.pushState(null,'',link.hash);
      if(event.detail===0){
        target.setAttribute('tabindex','-1');
        target.focus({preventScroll:true});
      }
    }
    scrollFrame=requestAnimationFrame(travel);
  });
  addEventListener('wheel',stopScroll,{passive:true});
  addEventListener('touchstart',stopScroll,{passive:true});
  addEventListener('pointerdown',stopScroll,{passive:true});
  addEventListener('keydown',event=>{
    if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End','Escape',' '].includes(event.key))stopScroll();
  });
  addEventListener('pagehide',stopScroll);
  reduce.addEventListener('change',()=>{
    stopScroll();
    sections.forEach(section=>section.classList.add('is-visible'));
    updateActive();
  });
})();
