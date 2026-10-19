(() => {
  const canvases=[...document.querySelectorAll('.ambient-scene')];
  if(!canvases.length)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const scenes=canvases.map((canvas,index)=>({canvas,ctx:canvas.getContext('2d'),type:canvas.dataset.scene,index,w:0,h:0,visible:false}));
  const villageImage=new Image();
  villageImage.src='assets/night-japanese-village.webp';
  let villageSource=null;
  villageImage.onload=()=>{
    const layer=document.createElement('canvas');layer.width=villageImage.naturalWidth;layer.height=villageImage.naturalHeight;
    const ink=layer.getContext('2d');ink.filter='grayscale(1) contrast(1.13) brightness(.82)';
    ink.drawImage(villageImage,0,0);villageSource=layer;
    scenes.filter(s=>s.type==='village').forEach(s=>render(s,performance.now()/1000));
  };
  const stroke=(c,points,color,width=1)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.stroke();};
  const poly=(c,points,fill,outline)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(outline){c.strokeStyle=outline;c.lineWidth=1;c.stroke();}};
  const rect=(c,x,y,w,h,fill)=>{c.fillStyle=fill;c.fillRect(x,y,w,h);};
  function resize(s){
    const r=s.canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,innerWidth<768?1:1.25);
    s.w=r.width;s.h=r.height;s.canvas.width=Math.max(1,Math.round(r.width*dpr));s.canvas.height=Math.max(1,Math.round(r.height*dpr));
    s.ctx.setTransform(dpr,0,0,dpr,0,0);render(s,0);
  }
  function pagoda(c,x,ground,scale,light){
    const w=124*scale,h=165*scale;
    rect(c,x-w*.41,ground-h*.72,w*.82,h*.72,'#31393c');
    for(let level=0;level<3;level++){
      const y=ground-h*(.70+level*.24),rw=w*(.64-level*.1);
      poly(c,[[x-rw,y+10*scale],[x-rw*.73,y],[x,y-13*scale],[x+rw*.73,y],[x+rw,y+10*scale],[x+rw*.55,y+7*scale],[x-rw*.55,y+7*scale]],'#151a1d','#a9b5b8');
      rect(c,x-rw*.43,y+7*scale,rw*.86,18*scale,'#3a4548');
      rect(c,x-rw*.15,y+10*scale,rw*.3,10*scale,light?'#c4c8c7':'#687477');
    }
    stroke(c,[[x,ground-h*1.22],[x,ground-h*1.42]],'#b1bdc0',scale);
  }
  function house(c,x,ground,scale,light){
    const w=150*scale,h=90*scale;
    rect(c,x-w*.43,ground-h*.72,w*.86,h*.72,'#313a3d');
    poly(c,[[x-w*.58,ground-h*.69],[x-w*.48,ground-h],[x,ground-h*1.2],[x+w*.48,ground-h],[x+w*.58,ground-h*.69],[x+w*.42,ground-h*.74],[x-w*.42,ground-h*.74]],'#111719','#9ca8aa');
    rect(c,x-w*.18,ground-h*.5,w*.36,h*.48,'#141b1e');
    for(const side of [-1,1]){
      const wx=x+side*w*.31;
      rect(c,wx-w*.075,ground-h*.5,w*.15,h*.29,light?'#b6b6af':'#667476');
      stroke(c,[[wx,ground-h*.5],[wx,ground-h*.21]],'#1a2022',scale);
    }
    stroke(c,[[x-w*.51,ground-h*.72],[x+w*.51,ground-h*.72]],'#d2d4d1',1);
  }
  function villager(c,x,y,scale,t,phase){
    const step=Math.sin(t*5+phase),h=34*scale;
    c.fillStyle='#d5dbda';c.beginPath();c.arc(x,y-h*.86,3.3*scale,0,Math.PI*2);c.fill();
    poly(c,[[x-5*scale,y-h*.72],[x+5*scale,y-h*.72],[x+7*scale,y-h*.25],[x-7*scale,y-h*.25]],'#879497');
    stroke(c,[[x-3*scale,y-h*.27],[x-4*scale+step*3*scale,y]],'#a6b4b6',2*scale);
    stroke(c,[[x+3*scale,y-h*.27],[x+4*scale-step*3*scale,y]],'#a6b4b6',2*scale);
    stroke(c,[[x-5*scale,y-h*.66],[x-9*scale-step*2*scale,y-h*.36]],'#a6b4b6',2*scale);
    stroke(c,[[x+5*scale,y-h*.66],[x+9*scale+step*2*scale,y-h*.36]],'#a6b4b6',2*scale);
  }
  function walkingSilhouette(c,x,y,scale,t,phase){
    const step=Math.sin(t*3.2+phase)*2*scale,body=18*scale;
    c.fillStyle='#101010';c.beginPath();c.ellipse(x,y-body*.92,2.9*scale,3.3*scale,0,0,Math.PI*2);c.fill();
    poly(c,[[x-3*scale,y-body*.76],[x+3*scale,y-body*.76],[x+5*scale,y-body*.18],[x-5*scale,y-body*.18]],'#111');
    stroke(c,[[x-2*scale,y-body*.2],[x-3*scale+step,y]],'#121212',2*scale);
    stroke(c,[[x+2*scale,y-body*.2],[x+3*scale-step,y]],'#121212',2*scale);
  }
  function village(s,t){
    const {ctx:c,w,h}=s,vp=[w*.52,h*.63],horizon=h*.68;
    if(villageSource){
      rect(c,0,0,w,h,'#050505');
      const scale=Math.max(w/villageSource.width,h/villageSource.height)*1.075;
      const iw=villageSource.width*scale,ih=villageSource.height*scale;
      const drift=Math.sin(t*.12+s.index*.9)*w*.012;
      c.drawImage(villageSource,(w-iw)/2+drift,(h-ih)/2+Math.sin(t*.09)*h*.007,iw,ih);
      const shade=c.createLinearGradient(0,0,0,h);shade.addColorStop(0,'#0008');shade.addColorStop(.53,'#0005');shade.addColorStop(1,'#000a');rect(c,0,0,w,h,shade);
      const mistX=(t*9)%(w*1.8)-w*.4;
      const mist=c.createRadialGradient(mistX,h*.57,0,mistX,h*.57,w*.42);
      mist.addColorStop(0,'#ffffff10');mist.addColorStop(1,'#ffffff00');rect(c,0,h*.4,w,h*.43,mist);
      for(let i=0;i<5;i++){
        const travel=((t*(.006+i*.0015)+i*.21+s.index*.14)%1+1)%1;
        const x=w*(.33+travel*.38),y=h*(.72+travel*.13),size=.43+travel*.5;
        walkingSilhouette(c,x,y,size,t,i*2.4);
      }
      return;
    }
    const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#0b0e10');sky.addColorStop(.65,'#1b2326');sky.addColorStop(1,'#0b0f10');rect(c,0,0,w,h,sky);
    c.fillStyle='#8e9a9b';c.beginPath();c.arc(w*.81,h*.22,Math.min(w,h)*.064,0,Math.PI*2);c.fill();
    for(let layer=0;layer<3;layer++){
      const y=h*(.56+layer*.065),shade=['#323d40','#273135','#192327'][layer];
      poly(c,[[0,h],[0,y],[w*.15,y-h*.16],[w*.30,y-h*.035],[w*.45,y-h*.18],[w*.65,y-h*.04],[w*.82,y-h*.17],[w,y-h*.06],[w,h]],shade);
    }
    poly(c,[[0,h],[w,h],[vp[0]+w*.085,horizon],[vp[0]-w*.085,horizon]],'#283034','#7c898c');
    for(let i=-4;i<=4;i++)stroke(c,[[vp[0]+i*w*.015,horizon],[vp[0]+i*w*.13,h]],'#a6afb037',1);
    for(let i=1;i<8;i++){
      const depth=i/8,y=horizon+(h-horizon)*depth*depth;
      stroke(c,[[vp[0]-w*.085-w*.42*depth,y],[vp[0]+w*.085+w*.42*depth,y]],'#c7d0ce44',1);
    }
    for(let i=0;i<5;i++){
      const depth=(i+1)/5,ground=horizon+(h-horizon)*depth*depth,scale=.27+depth*.78;
      const spread=w*(.11+depth*.38);
      house(c,vp[0]-spread,ground,scale,i%2===0);
      if(i%2)pagoda(c,vp[0]+spread,ground,scale*.8,true);else house(c,vp[0]+spread,ground,scale,i%3===0);
    }
    for(let i=0;i<5;i++){
      const progress=((t*(.018+i*.004)+i*.21+s.index*.08)%1+1)%1;
      const depth=.24+progress*.72,ground=horizon+(h-horizon)*depth*depth;
      villager(c,vp[0]+Math.sin(i*8.4)*w*.12*depth,ground,.36+depth*.85,t,i*2.8);
    }

    for(let i=0;i<3;i++){
      const x=((w*(.10+i*.35)+t*(i%2?-8:9))%(w+80)+w+80)%(w+80)-40;
      villager(c,x,h*(.91+i*.012),.95+i*.12,t,i*3.4);
    }
    for(let i=0;i<32;i++){
      const x=((i*79.7+t*(8+i%5)*.8)%(w+30))-15,y=(i*113.3+t*(7+i%4))%(h+20);
      rect(c,x+Math.sin(t+i)*7,y,2+(i%3),1.5,'#b7c2bf');
    }
  }
  function gardenLeaf(c,x,y,length,angle,shade){
    c.save();c.translate(x,y);c.rotate(angle);c.fillStyle=shade;
    c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(length*.42,-length*.17,length,0);
    c.quadraticCurveTo(length*.39,length*.12,0,0);c.fill();c.restore();
  }
  function gardenBamboo(c,x,base,height,lean,t,seed,near){
    const tip=x+lean+Math.sin(t*.24+seed)*height*.012,top=base-height,width=near?5.5:2.4;
    c.save();c.lineCap='round';
    c.beginPath();c.moveTo(x,base);c.bezierCurveTo(x+lean*.12,base-height*.35,tip-lean*.15,top+height*.17,tip,top);
    c.strokeStyle=near?'#080808':'#191919';c.lineWidth=width;c.stroke();
    c.strokeStyle=near?'#515151':'#3b3b3b';c.lineWidth=.6;
    c.beginPath();c.moveTo(x+width*.25,base);c.quadraticCurveTo(x+lean*.4,base-height*.42,tip,top);c.stroke();
    for(let j=1;j<9;j++){
      const p=j/9,bx=x+(tip-x)*p,by=base-height*p;
      stroke(c,[[bx-width*.8,by],[bx+width*.8,by]],near?'#4b4b4b':'#323232',.9);
      if(j<3||j%2===0)continue;
      const side=(j+seed)%2?-1:1,reach=height*(near?.14:.10),bend=Math.sin(t*.32+seed+j)*.045;
      c.beginPath();c.moveTo(bx,by);c.quadraticCurveTo(bx+side*reach*.45,by-reach*.36,bx+side*reach,by-reach*.53);
      c.strokeStyle=near?'#292929':'#242424';c.lineWidth=near?1.1:.7;c.stroke();
      for(let k=1;k<8;k++){
        const f=k/8,lx=bx+side*reach*f,ly=by-reach*(.64*f-.11*f*f);
        gardenLeaf(c,lx,ly,reach*(.31+(k%3)*.045),side>0?-.75+bend:Math.PI+.75+bend,near?'#363636':'#2d2d2d');
        gardenLeaf(c,lx,ly,reach*(.28+(k%2)*.07),side>0?.49+bend:Math.PI-.49+bend,near?'#202020':'#212121');
      }
    }
    c.restore();
  }
  function gardenTorii(c,x,y,scale){
    c.save();c.translate(x,y);c.scale(scale,scale);

    poly(c,[[-75,0],[-65,0],[-57,-177],[-68,-177]],'#111','#414141');
    poly(c,[[65,0],[75,0],[68,-177],[57,-177]],'#111','#414141');
    poly(c,[[-98,-177],[-95,-169],[95,-169],[98,-177],[71,-175],[0,-171],[-71,-175]],'#2b2b2b');
    c.beginPath();c.moveTo(-110,-189);c.quadraticCurveTo(0,-174,110,-189);c.lineTo(106,-179);
    c.quadraticCurveTo(0,-164,-106,-179);c.closePath();c.fillStyle='#0a0a0a';c.fill();
    c.beginPath();c.moveTo(-110,-189);c.quadraticCurveTo(0,-174,110,-189);c.strokeStyle='#686868';c.lineWidth=1.2;c.stroke();
    poly(c,[[-91,-137],[-91,-130],[91,-130],[91,-137]],'#292929','#464646');
    poly(c,[[-4,-172],[4,-172],[4,-130],[-4,-130]],'#171717');
    rect(c,-9,-169,18,25,'#161616');c.strokeStyle='#515151';c.lineWidth=.7;c.strokeRect(-9,-169,18,25);
    stroke(c,[[-68,-164],[-69,-22]],'#777',.5);stroke(c,[[69,-164],[71,-22]],'#777',.5);
    c.beginPath();c.moveTo(-57,-126);c.quadraticCurveTo(0,-105,57,-126);c.strokeStyle='#6b6b6b';c.lineWidth=1.2;c.stroke();
    for(let i=-2;i<=2;i++){
      const px=i*19,py=-116+Math.abs(i)*2;
      poly(c,[[px,py],[px+3,py+4],[px-1,py+7],[px+2,py+11],[px-2,py+15],[px-4,py+11],[px-1,py+7],[px-4,py+4]],'#858585');
    }
    poly(c,[[-82,2],[-58,2],[-55,8],[-85,8]],'#292929');poly(c,[[58,2],[82,2],[85,8],[55,8]],'#292929');
    c.restore();
  }
  function gardenLantern(c,x,y,size,t){
    c.save();c.translate(x,y);c.scale(size,size);
    const glow=c.createRadialGradient(0,-40,2,0,-40,70);
    glow.addColorStop(0,`rgba(205,205,205,${.12+Math.sin(t*.7)*.012})`);glow.addColorStop(1,'#ffffff00');
    rect(c,-70,-110,140,140,glow);
    poly(c,[[-21,0],[-17,-7],[17,-7],[21,0]],'#3c3c3c');poly(c,[[-10,-7],[-7,-31],[7,-31],[10,-7]],'#242424','#424242');
    poly(c,[[-18,-31],[-16,-35],[16,-35],[18,-31]],'#555');
    rect(c,-12,-53,24,18,'#141414');rect(c,-7,-50,14,12,'#9b9b9b');
    stroke(c,[[0,-50],[0,-38]],'#323232',1.5);stroke(c,[[-7,-44],[7,-44]],'#3a3a3a',1);
    c.beginPath();c.moveTo(-26,-53);c.quadraticCurveTo(-14,-55,0,-68);c.quadraticCurveTo(14,-55,26,-53);
    c.lineTo(21,-49);c.quadraticCurveTo(0,-54,-21,-49);c.closePath();c.fillStyle='#242424';c.fill();
    stroke(c,[[-26,-53],[-16,-55],[0,-68],[16,-55],[26,-53]],'#606060',.6);
    c.fillStyle='#4a4a4a';c.beginPath();c.ellipse(0,-69,3,4,0,0,Math.PI*2);c.fill();c.restore();
  }
  function gardenRandom(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
  function gardenMoon(c,x,y,r){
    const random=gardenRandom(893),halo=c.createRadialGradient(x,y,r*.4,x,y,r*4.4);
    halo.addColorStop(0,'#d8d8d81d');halo.addColorStop(.35,'#aaaaaa08');halo.addColorStop(1,'#ffffff00');rect(c,x-r*4.4,y-r*4.4,r*8.8,r*8.8,halo);
    c.save();c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.clip();
    const face=c.createRadialGradient(x-r*.36,y-r*.38,0,x+r*.15,y+r*.1,r*1.4);
    face.addColorStop(0,'#c2c2c2');face.addColorStop(.58,'#898989');face.addColorStop(1,'#3a3a3a');rect(c,x-r,y-r,r*2,r*2,face);
    for(let i=0;i<51;i++){
      const angle=random()*Math.PI*2,d=Math.sqrt(random())*r,px=x+Math.cos(angle)*d,py=y+Math.sin(angle)*d,cr=r*(.018+random()*.15);
      const crater=c.createRadialGradient(px-cr*.3,py-cr*.3,0,px,py,cr);
      crater.addColorStop(0,'#28282839');crater.addColorStop(.7,'#47474725');crater.addColorStop(1,'#dddddd12');
      c.fillStyle=crater;c.beginPath();c.ellipse(px,py,cr,cr*(.68+random()*.3),random(),0,Math.PI*2);c.fill();
    }
    for(let i=0;i<350;i++)rect(c,x-r+random()*r*2,y-r+random()*r*2,random()*1.2+.3,.4,i%2?'#ffffff17':'#00000013');
    c.restore();
  }
  function gardenCedar(c,x,ground,height,shade,seed){
    const random=gardenRandom(seed),width=height*.16;
    rect(c,x-height*.009,ground-height,height*.018,height,shade);
    for(let j=0;j<12;j++){
      const p=j/12,y=ground-height+height*p,reach=width*(.12+p*.92)*(random()*.23+.83);
      poly(c,[[x,y-height*.08],[x-reach*.47,y+height*.025],[x-reach,y+height*.11],[x-reach*.35,y+height*.075],[x,y+height*.09],[x+reach*.4,y+height*.07],[x+reach,y+height*.11],[x+reach*.4,y+height*.018]],shade);
    }
  }
  function gardenPavilion(c,x,ground,size){
    c.save();c.translate(x,ground);c.scale(size,size);
    poly(c,[[-98,0],[98,0],[104,9],[-104,9]],'#272727','#4a4a4a');
    rect(c,-81,-93,162,93,'#131313');
    for(let i=-3;i<=3;i++){
      rect(c,i*23-9,-77,18,58,i%2?'#393939':'#272727');
      for(let j=0;j<5;j++)stroke(c,[[i*23-9,-74+j*10],[i*23+9,-74+j*10]],'#111',1);
      stroke(c,[[i*23,-77],[i*23,-19]],'#101010',1.5);
    }
    for(let i=-1;i<=1;i++)poly(c,[[i*75-4,0],[i*75+4,0],[i*75+3,-104],[i*75-3,-104]],'#0b0b0b','#525252');
    rect(c,-90,-21,180,5,'#292929');rect(c,-92,-102,184,10,'#2d2d2d');
    c.beginPath();c.moveTo(-126,-99);c.quadraticCurveTo(-81,-106,-39,-148);c.quadraticCurveTo(0,-160,39,-148);
    c.quadraticCurveTo(81,-106,126,-99);c.lineTo(119,-90);c.quadraticCurveTo(0,-100,-119,-90);c.closePath();c.fillStyle='#090909';c.fill();
    c.beginPath();c.moveTo(-126,-99);c.quadraticCurveTo(-81,-106,-39,-148);c.quadraticCurveTo(0,-160,39,-148);c.quadraticCurveTo(81,-106,126,-99);c.strokeStyle='#767676';c.lineWidth=1;c.stroke();
    for(let i=-8;i<=8;i++){
      const px=i*12,y=-148+Math.abs(i)*5.6;
      stroke(c,[[px*.42,-151+Math.abs(i)*.8],[px*.74,y-12],[px*1.22,-99]],i%2?'#323232':'#222',.65);
    }
    stroke(c,[[-41,-149],[0,-159],[41,-149]],'#888',1.5);
    for(let i=0;i<3;i++)stroke(c,[[-97,-98+i*3],[97,-98+i*3]],'#424242',.6);

    for(let i=-8;i<=8;i++)stroke(c,[[i*11,-20],[i*11,-2]],'#565656',.7);
    stroke(c,[[-101,-20],[101,-20]],'#7a7a7a',1.3);stroke(c,[[-102,-2],[102,-2]],'#3a3a3a',2);
    c.restore();
  }
  function gardenStone(c,x,y,rx,ry,seed,shade){
    const random=gardenRandom(seed),points=[];
    for(let i=0;i<8;i++){const angle=i/8*Math.PI*2;points.push([x+Math.cos(angle)*rx*(.86+random()*.18),y+Math.sin(angle)*ry*(.8+random()*.23)]);}
    poly(c,points,shade,'#505050');
    c.save();c.beginPath();points.forEach(([px,py],i)=>i?c.lineTo(px,py):c.moveTo(px,py));c.closePath();c.clip();
    for(let i=0;i<15;i++){const px=x+(random()*2-1)*rx,py=y+(random()*2-1)*ry;stroke(c,[[px,py],[px+rx*(random()*.17+.025),py-ry*.1]],i%3?'#ffffff10':'#00000038',.6);}
    stroke(c,[[x-rx*.83,y-ry*.23],[x-rx*.3,y-ry*.7],[x+rx*.34,y-ry*.7],[x+rx*.8,y-ry*.32]],'#919191',.65);c.restore();
  }
  function gardenBridge(c,x,y,width,height){
    const left=x-width*.5,right=x+width*.5;
    c.save();
    c.beginPath();c.moveTo(left,y);c.quadraticCurveTo(x,y-height*1.35,right,y);c.lineTo(right,y+height*.21);
    c.quadraticCurveTo(x,y-height*.91,left,y+height*.21);c.closePath();c.fillStyle='#181818';c.fill();
    c.beginPath();c.moveTo(left,y);c.quadraticCurveTo(x,y-height*1.35,right,y);c.strokeStyle='#7a7a7a';c.lineWidth=1.5;c.stroke();
    c.beginPath();c.moveTo(left,y+height*.21);c.quadraticCurveTo(x,y-height*.91,right,y+height*.21);c.strokeStyle='#3e3e3e';c.lineWidth=1;c.stroke();
    for(let i=0;i<=18;i++){
      const p=i/18,px=left+width*p,arch=4*p*(1-p),py=y-height*.67*arch;
      stroke(c,[[px,py],[px,py+height*.2]],'#4d4d4d',.8);
      if(i%2===0){
        stroke(c,[[px,py-height*.52],[px,py+height*.04]],'#5e5e5e',2.3);
        c.beginPath();c.arc(px,py-height*.55,1.8,0,Math.PI*2);c.fillStyle='#929292';c.fill();
      }
    }
    for(const offset of [.45,.65]){
      c.beginPath();c.moveTo(left,y-height*offset);c.quadraticCurveTo(x,y-height*(1.35+offset),right,y-height*offset);c.strokeStyle=offset>.5?'#a0a0a0':'#4e4e4e';c.lineWidth=offset>.5?2:1.5;c.stroke();
    }
    c.restore();
  }
  function gardenPine(c,x,y,length,seed){
    const random=gardenRandom(seed);
    c.save();c.translate(x,y);

    c.beginPath();c.moveTo(-length*.14,length*.58);c.bezierCurveTo(-length*.1,length*.19,length*.29,length*.16,length*.87,-length*.1);
    c.strokeStyle='#070707';c.lineWidth=length*.043;c.lineCap='round';c.stroke();
    c.beginPath();c.moveTo(-length*.13,length*.58);c.bezierCurveTo(-length*.09,length*.2,length*.29,length*.17,length*.87,-length*.1);
    c.strokeStyle='#444';c.lineWidth=1.1;c.stroke();
    for(let i=0;i<9;i++){
      const p=i/9,bx=length*(.04+p*.79),by=length*(.23-p*.34),reach=length*(.06+random()*.09),direction=i%2?-1:1;
      stroke(c,[[bx,by],[bx+reach*.25,by+direction*reach*.33],[bx+reach,by+direction*reach*.5]],'#0b0b0b',length*(.009-.005*p));
      for(let j=0;j<8;j++){
        const cx=bx+reach*(.1+j*.16),cy=by+direction*reach*(.23+j*.045);
        for(let k=0;k<14;k++){
          const angle=-Math.PI+random()*Math.PI*2,len=length*(.012+random()*.032);
          stroke(c,[[cx,cy],[cx+Math.cos(angle)*len,cy+Math.sin(angle)*len*.48]],j%3?'#292929':'#454545',.7);
        }
      }
    }
    c.restore();
  }
  function gardenMaple(c,x,y,size,angle,shade){
    c.save();c.translate(x,y);c.rotate(angle);c.fillStyle=shade;c.beginPath();
    c.moveTo(0,size*.62);c.lineTo(-size*.16,size*.18);c.lineTo(-size*.59,size*.25);c.lineTo(-size*.4,-size*.03);c.lineTo(-size*.79,-size*.35);
    c.lineTo(-size*.3,-size*.24);c.lineTo(-size*.32,-size*.72);c.lineTo(-size*.1,-size*.42);c.lineTo(0,-size);
    c.lineTo(size*.17,-size*.4);c.lineTo(size*.43,-size*.7);c.lineTo(size*.36,-size*.22);c.lineTo(size*.79,-size*.35);
    c.lineTo(size*.43,size*.03);c.lineTo(size*.54,size*.29);c.lineTo(size*.15,size*.18);c.closePath();c.fill();
    stroke(c,[[0,size*.5],[0,-size*.72]],'#b0b0b023',.4);c.restore();
  }
  function buildGarden(s){
    const layer=document.createElement('canvas'),w=s.w,h=s.h,random=gardenRandom(419);
    layer.width=Math.ceil(w*1.25);layer.height=Math.ceil(h*1.25);
    const c=layer.getContext('2d');c.scale(1.25,1.25);
    const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#080808');sky.addColorStop(.47,'#252525');sky.addColorStop(1,'#080808');rect(c,0,0,w,h,sky);
    const mx=w*.69,my=h*.16,mr=Math.min(w,h)*.062;gardenMoon(c,mx,my,mr);

    for(let j=0;j<4;j++){
      c.beginPath();c.moveTo(0,h);
      for(let i=0;i<=48;i++){
        const x=i*w/48,y=h*(.37+j*.065)+Math.sin(i*.25+j*.8)*h*.064+Math.sin(i*.61+j)*h*.018;
        c.lineTo(x,y);
      }
      c.lineTo(w,h);c.closePath();c.fillStyle=['#363636','#292929','#1d1d1d','#121212'][j];c.fill();
      for(let i=0;i<38;i++){
        const x=(i/37+random()*.013)*w,base=h*(.43+j*.09)+Math.sin(i*.28)*h*.024;
        gardenCedar(c,x,base,h*(.065+random()*.13),['#303030','#242424','#191919','#101010'][j],i+j*83);
      }
      const band=c.createLinearGradient(0,h*(.4+j*.08),0,h*(.55+j*.08));band.addColorStop(0,'#eeeeee00');band.addColorStop(.5,'#e5e5e50b');band.addColorStop(1,'#eeeeee00');rect(c,0,h*(.4+j*.08),w,h*.15,band);
    }

    gardenPavilion(c,w*.94,h*.36,Math.min(w*.0016,h*.0026));
    const water=c.createLinearGradient(0,h*.7,0,h);water.addColorStop(0,'#262626');water.addColorStop(.45,'#121212');water.addColorStop(1,'#090909');
    c.beginPath();c.moveTo(0,h*.81);c.bezierCurveTo(w*.14,h*.74,w*.31,h*.91,w*.55,h*.77);c.bezierCurveTo(w*.77,h*.68,w*.9,h*.76,w,h*.7);c.lineTo(w,h);c.lineTo(0,h);c.closePath();c.fillStyle=water;c.fill();

    poly(c,[[0,h*.75],[w*.12,h*.74],[w*.34,h*.82],[w*.45,h],[0,h]],'#141414');
    for(let i=0;i<160;i++){
      const y=h*(.78+random()*.24),x=random()*w*(.11+(y/h-.78)*1.2);
      stroke(c,[[x,y],[x+w*(.015+random()*.035),y-h*.005]],i%5?'#ffffff0c':'#ffffff24',.6);
    }
    for(let i=0;i<27;i++){
      const p=i/26,x=w*(.03+p*.38),y=h*(.81+p*p*.2),size=.4+p;
      gardenStone(c,x,y,w*.015*size,h*.012*size,39+i,'#2a2a2a');
    }
    for(let i=0;i<11;i++){
      const p=i/10,x=w*(.23+p*.27)+Math.sin(i*.67)*w*.018,y=h*(.99-p*.23),rx=w*(.039-p*.027),ry=h*(.016-p*.01);
      gardenStone(c,x,y,rx,ry,221+i,i%3?'#3b3b3b':'#454545');
    }
    const gateScale=Math.min(w*.00067,h*.001),gx=w*.51,gy=h*.756;
    gardenTorii(c,gx,gy,gateScale);
    const bx=w*.75,by=h*.913,bw=w*.34,bh=Math.min(h*.11,w*.09);
    c.save();c.globalAlpha=.16;c.translate(0,by+bh*.1);c.scale(1,-.55);c.translate(0,-by);gardenBridge(c,bx,by,bw,bh);c.restore();
    gardenBridge(c,bx,by,bw,bh);
    gardenLantern(c,w*.075,h*.86,Math.min(w,h)*.0036,0);
    gardenLantern(c,w*.94,h*.94,Math.min(w,h)*.0026,0);
    gardenLantern(c,w*.515,h*.76,Math.min(w,h)*.00105,0);
    for(let i=0;i<22;i++){
      const x=w*(.86+random()*.17),y=h*(.96+random()*.055);gardenStone(c,x,y,w*(.012+random()*.022),h*(.006+random()*.015),633+i,'#191919');
    }
    for(let i=0;i<95;i++){
      const side=i%2?-1:1,x=side<0?w*(.005+(i%9)*.014):w*(.92+(i%7)*.016),y=h*(.86+(i%13)*.012),reach=13+(i%11)*3;
      c.beginPath();c.moveTo(x,y+8);c.quadraticCurveTo(x+Math.sin(i)*9,y-reach*.4,x+Math.sin(i*.7)*19,y-reach);c.strokeStyle=i%4?'#101010':'#494949';c.lineWidth=.7;c.stroke();
    }

    gardenPine(c,-w*.025,h*.052,w*.52,73);
    c.save();c.translate(w,h*.11);c.scale(-1,1);gardenPine(c,-w*.025,0,w*.28,35);c.restore();
    c.beginPath();c.moveTo(-w*.03,h*.5);c.bezierCurveTo(w*.04,h*.29,w*.07,h*.16,w*.23,h*.1);c.strokeStyle='#090909';c.lineWidth=Math.min(w,h)*.016;c.stroke();
    for(let i=0;i<47;i++){
      const p=i/46,x=w*(.012+p*.19)+Math.sin(i*1.41)*w*.02,y=h*(.32-p*.19)+Math.cos(i*2.1)*h*.026;
      gardenMaple(c,x,y,Math.min(w,h)*(.008+random()*.009),random()*2-1,i%4?'#272727':'#535353');
    }
    const vignette=c.createRadialGradient(w*.52,h*.65,h*.25,w*.52,h*.65,Math.max(w,h)*.72);
    vignette.addColorStop(0,'#00000000');vignette.addColorStop(1,'#00000087');rect(c,0,0,w,h,vignette);
    s.gardenLayer=layer;
  }
  function garden(s,t){
    const {ctx:c,w,h}=s;
    if(!s.gardenLayer||s.gardenWidth!==w||s.gardenHeight!==h){buildGarden(s);s.gardenWidth=w;s.gardenHeight=h;}
    c.drawImage(s.gardenLayer,0,0,w,h);

    for(let i=0;i<3;i++){
      const x=w*(.1+i*.39+Math.sin(t*(.024+i*.006)+i)*.16),y=h*(.16+i*.287),rx=w*(.23+i*.025),ry=h*(.035+i*.006);
      c.save();c.translate(x,y);c.scale(1,ry/rx);const fog=c.createRadialGradient(0,0,0,0,0,rx);
      fog.addColorStop(0,i?'#dddddd10':'#09090955');fog.addColorStop(.65,i?'#dddddd04':'#09090920');fog.addColorStop(1,'#ffffff00');rect(c,-rx,-rx,rx*2,rx*2,fog);c.restore();
    }
    for(let i=0;i<50;i++){
      const y=h*(.79+(i%17)*.013),x=w*(.39+((i*137.13)%59)/100)+Math.sin(t*.3+i*3.17)*w*.006,len=w*(.009+(i%7)*.006);
      if(x<w*.44&&y<h*.94)continue;
      c.beginPath();c.moveTo(x-len,y);c.quadraticCurveTo(x,y+Math.sin(t*.43+i)*1.1,x+len,y);c.strokeStyle=i%4?'#9a9a9a14':'#c0c0c027';c.lineWidth=.6;c.stroke();
    }
    for(let i=0;i<21;i++){
      const phase=(t*.11+i*.271)%1,x=w*(.45+((i*17.91)%51)/100),y=h*(.82+(i%8)*.023),radius=(2+phase*18)*(1+(y/h-.75)*2);
      c.beginPath();c.ellipse(x,y,radius,radius*.16,0,0,Math.PI*2);c.strokeStyle=`rgba(172,172,172,${(1-phase)*.12})`;c.lineWidth=.65;c.stroke();
    }

    for(let i=0;i<20;i++){
      const y=h*(.765+i*.012),length=w*(.012+i*.0019)*(1+Math.sin(t*.32+i*1.2)*.22),x=w*.69+Math.sin(i*2.2+t*.21)*w*.012;
      stroke(c,[[x-length,y],[x+length,y]],`rgba(206,206,206,${.035+(20-i)*.0025})`,.75);
    }
    for(let i=0;i<23;i++){
      const y=(i*73.7+t*(68+(i%7)*7))%(h+80)-40,x=(i*137.9-t*6)%(w+40)+20;
      stroke(c,[[x,y],[x-2,y+11+(i%4)*2]],i%3?'#ffffff09':'#ffffff15',.6);
    }
    for(let i=0;i<4;i++){
      const left=i<2,x=left?w*(-.021+(i%2)*.031):w*(1.02-(i%2)*.028),height=h*(.58+(i%2)*.13),lean=(left?1:-1)*w*.034;
      gardenBamboo(c,x,h*1.06,height,lean,t,i,true);
    }
    for(let i=0;i<6;i++){
      const progress=(t*(.021+i*.0011)+i*.173)%1,x=w*(.03+progress*.31)+Math.sin(t*.42+i)*w*.023,y=h*(.11+progress*.89);
      c.save();c.globalAlpha=.25+.23*Math.sin(progress*Math.PI);gardenMaple(c,x,y,Math.min(w,h)*.009,t*.2+i,'#9c9c9c');c.restore();
    }
  }
  function rack(c,x,y,w,h,side,depth,t,index){
    const skew=side*w*.17;
    poly(c,[[x,y],[x+w,y],[x+w+skew,y-h*.045],[x+skew,y-h*.045]],'#202020','#555');
    poly(c,[[x+w,y],[x+w+skew,y-h*.045],[x+w+skew,y+h*.955],[x+w,y+h]],'#080808','#373737');
    rect(c,x,y,w,h,'#101010');
    c.strokeStyle='#777';c.lineWidth=Math.max(.6,depth*1.2);c.strokeRect(x,y,w,h);
    rect(c,x+w*.045,y+h*.026,w*.91,h*.024,'#333');
    for(let row=0;row<8;row++){
      const ry=y+h*(.085+row*.106),rh=h*.073;
      rect(c,x+w*.085,ry,w*.83,rh,'#202020');
      stroke(c,[[x+w*.085,ry],[x+w*.915,ry]],'#555',.6);
      for(let slot=0;slot<5;slot++)rect(c,x+w*(.12+slot*.105),ry+rh*.25,w*.065,Math.max(1,rh*.12),'#080808');
      for(let led=0;led<2;led++){
        const power=.25+.75*(.5+.5*Math.sin(t*(1.8+row*.08)+index*2+row*1.9+led*2.6));
        c.globalAlpha=power;
        rect(c,x+w*(.75+led*.085),ry+rh*.3,Math.max(1,w*.025),Math.max(1,rh*.22),'#fff');
      }
      c.globalAlpha=1;
    }

    c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
    const scan=y+((t*.085+index*.137)%1)*h,band=h*.1;
    const light=c.createLinearGradient(0,scan-band,0,scan+band);
    light.addColorStop(0,'#ffffff00');light.addColorStop(.5,'#ffffff16');light.addColorStop(1,'#ffffff00');
    rect(c,x,scan-band,w,band*2,light);stroke(c,[[x,scan],[x+w,scan]],'#ffffff32',.7);c.restore();
    rect(c,x+w*.45,y+h*.95,w*.1,h*.007,'#a0a0a0');
  }
  function networkWall(c,w,h,t){
    const left=w*.18,right=w*.82,top=h*.095,bottom=h*.29;

    const nodes=Array.from({length:12},(_,i)=>[left+(right-left)*(i%4)/3,top+(bottom-top)*Math.floor(i/4)/2]);
    c.save();c.globalAlpha=.55;
    for(let i=0;i<8;i++){
      const a=nodes[i],b=nodes[i+4],bend=(a[1]+b[1])*.5;
      stroke(c,[a,[a[0],bend],[b[0],bend],b],'#555',.7);
      const phase=(t*.16+i*.13)%1,py=a[1]+(b[1]-a[1])*phase;
      rect(c,a[0]-1,py-3,2,6,'#d8d8d8');
    }
    for(let i=0;i<3;i++){
      const a=nodes[4+i],b=nodes[5+i];stroke(c,[a,b],'#6b6b6b',.8);
      const phase=(t*.1+i*.31)%1;rect(c,a[0]+(b[0]-a[0])*phase-2,a[1]-1,4,2,'#fff');
    }
    nodes.forEach(([x,y],i)=>{
      rect(c,x-4,y-4,8,8,'#0b0b0b');c.strokeStyle='#a3a3a3';c.lineWidth=.7;c.strokeRect(x-4,y-4,8,8);
      if(i%3===0)rect(c,x-1,y-1,2,2,'#e8e8e8');
    });
    c.restore();
  }
  function securityTraffic(c,w,h,vx,vy,t){
    const gateDepth=.47,gateY=vy+(h-vy)*gateDepth;
    const point=(lane,depth)=>[vx+lane*w*.38*depth,vy+(h-vy)*depth];

    for(let lane=-2;lane<=2;lane++){
      const far=point(lane,.1),near=point(lane,1.1);
      stroke(c,[far,near],'#ffffff1b',.8);
      const gate=point(lane,gateDepth);
      stroke(c,[[gate[0]-5,gateY-3],[gate[0]+5,gateY-3]],'#b8b8b8',1);
    }
    const gateWidth=w*.38*gateDepth*2.5;
    c.save();c.globalAlpha=.5;
    stroke(c,[[vx-gateWidth,gateY],[vx+gateWidth,gateY]],'#aaa',.7);
    c.setLineDash([2,7]);stroke(c,[[vx-gateWidth,gateY-14],[vx+gateWidth,gateY-14]],'#777',.6);c.setLineDash([]);
    const sweep=((t*.15)%1)*2-1;
    stroke(c,[[vx+sweep*gateWidth,gateY-14],[vx+sweep*gateWidth,gateY]],'#fff',1.2);c.restore();
    for(let i=0;i<20;i++){
      const lane=(i%5)-2,progress=(t*(.12+(i%3)*.013)+i*.137)%1;
      const blocked=i%4===0||i%7===0,stop=1-gateDepth;
      if(blocked&&progress>stop){
        const fade=1-(progress-stop)/.19;
        if(fade<=0)continue;
        const [x,y]=point(lane,gateDepth),spread=(1-fade)*9;
        c.save();c.globalAlpha=fade*.8;
        stroke(c,[[x-3-spread,y-3-spread],[x+3+spread,y+3+spread]],'#dedede',1);
        stroke(c,[[x+3+spread,y-3-spread],[x-3-spread,y+3+spread]],'#dedede',1);c.restore();continue;
      }
      const depth=1-progress,[x,y]=point(lane,depth),trail=point(lane,Math.min(1.1,depth+.028));
      c.save();c.globalAlpha=.35+depth*.6;
      if(blocked){c.strokeStyle='#dedede';c.lineWidth=1;c.strokeRect(x-2.5,y-2.5,5,5);}
      else{stroke(c,[[x,y],trail],'#fff',Math.max(1,depth*2));}
      c.restore();
    }
  }
  function datacenter(s,t){
    const {ctx:c,w,h}=s,vx=w*.5,vy=h*.39;
    rect(c,0,0,w,h,'#030303');
    const rear=c.createRadialGradient(vx,vy,0,vx,vy,w*.55);
    rear.addColorStop(0,'#1b1b1b');rear.addColorStop(1,'#030303');rect(c,0,0,w,h,rear);
    poly(c,[[0,h],[w,h],[vx,vy]],'#0c0c0c');
    for(let i=0;i<=8;i++){
      stroke(c,[[vx,vy],[w*i/8,h]],'#ffffff16',.7);
      if(i%2===0)stroke(c,[[vx,vy],[w*i/8,0]],'#ffffff0f',.7);
    }
    for(let i=1;i<=7;i++){
      const d=(i/7)**2,bottom=vy+(h-vy)*d;
      stroke(c,[[0,bottom],[w,bottom]],'#ffffff13',.7);
    }
    networkWall(c,w,h,t);
    securityTraffic(c,w,h,vx,vy,t);
    const count=w<650?5:7;
    for(let i=0;i<count;i++){
      const depth=(i+1)/count,scale=.1+depth*.95,y=vy-h*.25*scale;
      const rw=w*.095*scale,rh=h*.78*scale;
      rack(c,vx-w*(.1+depth*.5),y,rw,rh,-1,depth,t,i);
      rack(c,vx+w*(.1+depth*.42),y,rw,rh,1,depth,t,i+count);
    }
    const shade=c.createLinearGradient(0,0,0,h);
    shade.addColorStop(0,'#0009');shade.addColorStop(.3,'#0002');shade.addColorStop(.7,'#0001');shade.addColorStop(1,'#0006');rect(c,0,0,w,h,shade);
  }
  function render(s,t){if(!s.w||!s.h)return;s.ctx.clearRect(0,0,s.w,s.h);if(s.type==='datacenter')datacenter(s,t);else if(s.type==='garden')garden(s,t);else village(s,t);}
  let frame=0,last=0;
  function tick(now){frame=requestAnimationFrame(tick);if(reduce.matches||window.portfolioMotionPaused||document.hidden||document.documentElement.classList.contains('intro-active')||now-last<50)return;last=now;scenes.forEach(s=>{if(s.visible)render(s,now/1000);});}
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{const s=scenes.find(item=>item.canvas===entry.target);if(s){s.visible=entry.isIntersecting;render(s,performance.now()/1000);}}),{threshold:.05});
  scenes.forEach(s=>{new ResizeObserver(()=>resize(s)).observe(s.canvas);observer.observe(s.canvas);resize(s);});
  document.addEventListener('portfolio:motion',()=>{last=0;});
  reduce.addEventListener('change',()=>scenes.forEach(s=>render(s,0)));
  frame=requestAnimationFrame(tick);
  addEventListener('pagehide',()=>cancelAnimationFrame(frame),{once:true});
})();
