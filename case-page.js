(() => {
 const root=document.body;
 const nav=document.querySelector('.header nav');
 const links=[...nav.querySelectorAll('a[href^="#"]')];
 const sections=[...document.querySelectorAll('main>section[id]')];
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const indicator=document.createElement('span');indicator.className='nav-current';indicator.setAttribute('aria-hidden','true');nav.prepend(indicator);
 function position(){const selected=links.find(link=>link.hasAttribute('aria-current'));if(!selected)return;indicator.style.setProperty('--nav-x',selected.offsetLeft+'px');indicator.style.setProperty('--nav-y',selected.offsetTop+'px');indicator.style.setProperty('--nav-width',selected.offsetWidth+'px');indicator.style.setProperty('--nav-height',selected.offsetHeight+'px');indicator.style.opacity='1';requestAnimationFrame(()=>indicator.classList.add('is-ready'));}
 function activate(id){sections.forEach(section=>section.classList.toggle('is-current',section.id===id));links.forEach(link=>{const on=link.hash==='#'+id;link.classList.toggle('active',on);if(on)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});position();}
 const sectionObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)activate(entry.target.id);}),{rootMargin:'-18% 0px -65% 0px',threshold:0});sections.forEach(section=>sectionObserver.observe(section));
 root.classList.add('case-enhanced');
 const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}}),{threshold:.1});
 document.querySelectorAll('[data-case-reveal]').forEach(element=>{const siblings=[...element.parentElement.children].filter(child=>child.hasAttribute('data-case-reveal'));element.style.setProperty('--reveal-delay',(Math.min(siblings.indexOf(element),3)*.12)+'s');if(reduced.matches)element.classList.add('is-visible');else revealObserver.observe(element);});
 document.addEventListener('focusin',event=>event.target.closest('[data-case-reveal]')?.classList.add('is-visible'));
 reduced.addEventListener('change',()=>{if(reduced.matches)document.querySelectorAll('[data-case-reveal]').forEach(element=>element.classList.add('is-visible'));});
 let scrollFrame=0;
 function stopScroll(){cancelAnimationFrame(scrollFrame);scrollFrame=0;document.documentElement.classList.remove('is-case-scrolling');}
 document.addEventListener('click',event=>{
  if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey)return;
  const link=event.target.closest('a[href^="#"]'),target=link&&sections.find(section=>'#'+section.id===link.hash);if(!target)return;
  event.preventDefault();stopScroll();
  const from=scrollY,to=Math.min(Math.max(0,target.offsetTop-96),document.documentElement.scrollHeight-innerHeight),distance=to-from;
  const duration=reduced.matches?0:Math.min(1250,820+Math.abs(distance)*.1),start=performance.now();
  document.documentElement.classList.add('is-case-scrolling');
  function finish(){stopScroll();if(location.hash!==link.hash)history.pushState(null,'',link.hash);if(event.detail===0){target.tabIndex=-1;target.focus({preventScroll:true});}}
  if(!duration||Math.abs(distance)<2){scrollTo(0,to);finish();return;}
  function move(now){const progress=Math.min(1,(now-start)/duration),ease=progress<.5?4*progress**3:1-(-2*progress+2)**3/2;scrollTo(0,from+distance*ease);if(progress<1)scrollFrame=requestAnimationFrame(move);else finish();}
  scrollFrame=requestAnimationFrame(move);
 });
 addEventListener('wheel',stopScroll,{passive:true});addEventListener('touchstart',stopScroll,{passive:true});addEventListener('pointerdown',stopScroll,{passive:true});addEventListener('keydown',event=>{if(['Escape','PageUp','PageDown','ArrowUp','ArrowDown','Home','End',' '].includes(event.key))stopScroll();});addEventListener('pagehide',stopScroll);
 addEventListener('resize',()=>{stopScroll();position();},{passive:true});document.fonts.ready.then(position);
 activate(sections.some(section=>'#'+section.id===location.hash)?location.hash.slice(1):'overview');
})();
