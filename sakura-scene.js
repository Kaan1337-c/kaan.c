(() => {
  const canvas = document.getElementById('sakura-scene');
  const nameTag = document.getElementById('coder-name');
  if (!canvas) return;
  let ctx = canvas.getContext('2d', {alpha:false});
  const mainContext=ctx;
  const greeting=document.getElementById('visitor-terminal');
  let foliageBack=null,foliageFront=null;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let paused=motion.matches, visible=true, width=1, height=1, elapsed=0, last=0, frame=0;
  let stars=[], petals=[], grass=[];
  const seeded = seed => () => {seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const rand=seeded(92);
  const sprite=new Image();
  const naturalTree=new Image();naturalTree.src='assets/natural-sakura.png';naturalTree.onload=()=>draw(elapsed);
  const spriteFrames=[];
  let characterRig=null;
  sprite.src='assets/mono-yawn-24.png';
  const headOutline=[[.28,.02],[.67,.02],[.78,.23],[.75,.37],[.66,.405],[.615,.435],[.53,.435],[.48,.38],[.31,.37],[.28,.24]];
  const handOutline=[[.43,.55],[.50,.55],[.525,.56],[.57,.58],[.58,.61],[.56,.63],[.52,.615],[.495,.61],[.48,.63],[.46,.63],[.455,.615],[.44,.62],[.425,.61],[.44,.59]];
  const yawnHandOutline=[[99,100],[97,94],[98,85],[101,78],[105,72],[109,67],[112,65],[115,66],[113,70],[119,65],[122,64],[124,66],[124,68],[121,71],[125,68],[127,69],[127,71],[125,74],[127,73],[128,76],[124,82],[124,85],[118,89],[115,95],[111,102],[106,105],[102,104]];
  const laptopOutline=[[.10,.43],[.35,.45],[.428,.651],[.20,.63]];
  function rigPath(context,points,w,h){
    context.beginPath();points.forEach(([x,y],i)=>i?context.lineTo(x*w,y*h):context.moveTo(x*w,y*h));context.closePath();
  }
  sprite.onload=()=>{


    const fw=Math.round(sprite.naturalWidth/6),fh=Math.round(sprite.naturalHeight/4);
    const rawFrames=[];
    for(let i=0;i<1;i++){
      const part=document.createElement('canvas');part.width=Math.round(fw);part.height=Math.round(fh);
      const pc=part.getContext('2d',{willReadFrequently:true});
      pc.drawImage(sprite,(i%6)*fw,Math.floor(i/6)*fh,fw,fh,0,0,part.width,part.height);
      const pixels=pc.getImageData(0,0,part.width,part.height),data=pixels.data;
      const labels=new Int32Array(part.width*part.height),queue=new Int32Array(labels.length);
      let id=0,biggest=0,biggestSize=0;
      for(let p=0;p<labels.length;p++){
        if(labels[p]||data[p*4+3]<32)continue;
        id++;let read=0,write=1;queue[0]=p;labels[p]=id;
        while(read<write){
          const at=queue[read++],x=at%part.width,y=Math.floor(at/part.width);
          for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
            const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=part.width||ny>=part.height)continue;
            const n=ny*part.width+nx;if(!labels[n]&&data[n*4+3]>=32){labels[n]=id;queue[write++]=n;}
          }
        }
        if(write>biggestSize){biggest=id;biggestSize=write;}
      }


      for(let p=0;p<labels.length;p++){
        if(labels[p]===biggest)continue;
        let edge=false;
        if(!labels[p]){
          const x=p%part.width,y=Math.floor(p/part.width);
          for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
            const nx=x+dx,ny=y+dy;if(nx>=0&&ny>=0&&nx<part.width&&ny<part.height&&labels[ny*part.width+nx]===biggest)edge=true;
          }
        }
        if(!edge)data[p*4+3]=0;
      }


      for(let y=0;y<part.height;y++)for(let x=0;x<part.width;x++){
        const p=(y*part.width+x)*4+3;
        if(x<part.width*.055&&y<part.height*.78)data[p]=0;
        if(x>part.width*.95&&y<part.height*.84)data[p]*=Math.max(0,(part.width-1-x)/(part.width*.05));
      }
      pc.putImageData(pixels,0,0);rawFrames.push(part);
    }
    const source=rawFrames[0];spriteFrames.push(source);
    const makePart=(points,image=source)=>{
      const layer=document.createElement('canvas');layer.width=fw;layer.height=fh;
      const c=layer.getContext('2d');rigPath(c,points,fw,fh);c.clip();c.drawImage(image,0,0);return layer;
    };
    const body=document.createElement('canvas');body.width=fw;body.height=fh;
    const c=body.getContext('2d');c.drawImage(source,0,0);


    const backHandPatch=document.createElement('canvas');backHandPatch.width=fw;backHandPatch.height=fh;
    const patch=backHandPatch.getContext('2d');
    rigPath(patch,[[94/fw,146/fh],[111/fw,145/fh],[120/fw,151/fh],[118/fw,157/fh],[100/fw,159/fh],[93/fw,154/fh]],fw,fh);patch.clip();
    patch.drawImage(source,95,134,25,12,93,145,29,15);
    c.globalCompositeOperation='destination-out';


    for(const points of [headOutline,handOutline]){rigPath(c,points,fw,fh);c.fill();}
    const peak=document.createElement('canvas');peak.width=fw;peak.height=fh;

    const peakY=Math.round(sprite.naturalHeight*2/4),peakBottom=Math.round(sprite.naturalHeight*3/4);
    peak.getContext('2d').drawImage(sprite,0,peakY,fw,peakBottom-peakY,0,0,fw,fh);
    characterRig={body,backHandPatch,head:makePart(headOutline),hand:makePart(handOutline),
      yawnHand:makePart(yawnHandOutline.map(([x,y])=>[x/fw,y/fh]),peak),laptop:makePart(laptopOutline),w:fw,h:fh};
    draw(elapsed);
  };
  const flowerDetails=Array.from({length:580},()=>({x:rand()*2-1,y:rand()*2-1,s:1.5+rand()*2.5,c:Math.floor(rand()*4)}));
  const clouds=[
    [.87,.16,.14,.095,1],[.76,.22,.14,.10,2],[.94,.26,.12,.085,3],
    [.67,.30,.13,.085,4],[.56,.35,.12,.074,5],[.46,.39,.10,.065,6],
    [.38,.36,.08,.06,7],[.79,.33,.10,.07,8],[.89,.34,.11,.065,9],
    [.67,.39,.10,.07,10],[.58,.41,.085,.055,11],[.93,.13,.08,.06,12]
  ];
  function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));}
  function polygon(points,color){ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();}
  function line(points,color,thickness){ctx.strokeStyle=color;ctx.lineWidth=thickness;ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
  function resize(){
    const box=canvas.getBoundingClientRect();
    width=Math.ceil(box.width);height=Math.ceil(box.height);canvas.width=width;canvas.height=height;
    ctx.imageSmoothingEnabled=false;
    const r=seeded(418);
    stars=Array.from({length:35},()=>({x:r()*width,y:r()*height*.65,p:r()*6.28}));
    petals=Array.from({length:70},()=>({x:r()*width,y:r()*height,s:2+r()*4,p:r()*6.28}));
    grass=Array.from({length:140},()=>({x:r()*width,y:height*(.95+r()*.05),p:r()}));
    for(const front of [false,true]){
      const layer=document.createElement('canvas');layer.width=width;layer.height=height;
      ctx=layer.getContext('2d');canopy(treeSpace(0),0,front);
      if(front)foliageFront=layer;else foliageBack=layer;
    }
    ctx=mainContext;draw(elapsed);
  }
  function sky(t){
    const bg=ctx.createLinearGradient(0,0,0,height);bg.addColorStop(0,'#0b0b0b');bg.addColorStop(.6,'#1a1a1a');bg.addColorStop(1,'#2c2c2c');ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);
    stars.forEach(s=>rect(s.x,s.y,1,1,Math.sin(t*.5+s.p)>.7?'#c4c4c4':'#696969'));
    const mx=width*.72,my=height*.18,mr=height*.046;
    for(let y=-mr;y<mr;y++){const half=Math.floor(Math.sqrt(mr*mr-y*y));rect(mx-half,my+y,half*2,1,'#bebebe');}
    for(let i=0;i<3;i++){
      const pts=[[0,height]];for(let j=0;j<=14;j++)pts.push([width*j/14,height*(.65+i*.065-Math.abs(Math.sin(j*.65+i))*.065)]);pts.push([width,height]);polygon(pts,['#1e1e1e','#242424','#1e1e1e'][i]);
    }
    rect(0,height*.84,width,height*.16,'#101010');
    for(let i=0;i<14;i++){rect(width*(.38+Math.sin(i*2.3)*.19)+Math.sin(t+i)*2,height*(.86+i*.006),6+(i%4)*5,1,i%3?'#3c3c3c':'#757575');}
    polygon([[0,height*.96],[width*.6,height*.96],[width*.68,height*.92],[width,height*.91],[width,height],[0,height]],'#151515');
    grass.forEach(g=>rect(g.x,g.y,g.p>.7?2:1,1,g.p>.8?'#868686':'#282828'));
  }
  function treeSpace(t){
    const mobile=canvas.clientWidth<650;
    const x=v=>width*(mobile?(v-.36)*1.6:v);
    const y=v=>height*v;
    const wind=Math.sin(t*.65)*height*.004;
    const points=list=>list.map(([a,b])=>[x(a)+wind*Math.max(0,.8-b),y(b)]);
    return {x,y,wind,points,mobile};
  }
  function bloom(x,y,rx,ry,color){
    ctx.fillStyle=color;
    for(let i=0;i<5;i++){
      const a=i*Math.PI*.4;
      ctx.beginPath();ctx.ellipse(x+Math.cos(a)*rx*.45,y+Math.sin(a)*ry*.45,rx*.53,ry*.48,a,0,Math.PI*2);ctx.fill();
    }
  }
  function canopy(g,t,front){
    const shadow=['#313131','#515151','#6c6c6c','#7e7e7e'];
    const light=['#b3b3b3','#c6c6c6','#939393','#e7e7e7'];
    for(const [cx,cy,rx,ry,phase] of clouds){
      const wind=Math.sin(t*.65+phase*.2)*height*.003;
      const px=g.x(cx)+wind,py=g.y(cy)+Math.sin(t*.75+phase)*.7;
      const rw=width*rx*(g.mobile?1.6:1),rh=height*ry;
      if(!front){
        const edge=[];
        for(let i=0;i<24;i++){
          const angle=i*Math.PI/12,radius=.85+Math.sin(i*2.4+phase)*.08;
          edge.push([px+Math.cos(angle)*rw*radius,py+Math.sin(angle)*rh*radius]);
        }
        const shade=ctx.createRadialGradient(px-rw*.2,py-rh*.4,0,px,py,Math.max(rw,rh));
        shade.addColorStop(0,'#9a9a9a');shade.addColorStop(.55,shadow[phase%4]);shade.addColorStop(1,'#272727');
        polygon(edge,shade);
        for(let j=0;j<6;j++){
          const a=j*.8+phase,endX=px+Math.cos(a)*rw*.78,endY=py+Math.sin(a)*rh*.68;
          line([[px,py+rh*.5],[px+(endX-px)*.4,py+(endY-py)*.6],[endX,endY]],'#464646',height*.0016);
        }
      }
      for(let i=0;i<flowerDetails.length;i++){
        const f=flowerDetails[i];if(f.x*f.x+f.y*f.y>1)continue;
        const fx=px+f.x*rw,fy=py+f.y*rh,rr=f.s*height*.00165;
        if(!front){
          bloom(fx,fy+rr*.9,rr*1.6,rr*1.1,shadow[(f.c+phase)%4]);
          bloom(fx,fy,rr*1.5,rr*.95,light[(f.c+phase)%4]);
          if(i%19===0){ctx.fillStyle='#4f4f4f';ctx.beginPath();ctx.ellipse(fx+rr,fy+rr*1.5,rr*.65,rr*.3,-.7,0,Math.PI*2);ctx.fill();}
        }else{
          if(i%4===0)bloom(fx,fy,rr*1.2,rr*.65,light[(f.c+phase+1)%4]);
          ctx.fillStyle='#7f7f7f';ctx.beginPath();ctx.arc(fx,fy,Math.max(.35,rr*.15),0,Math.PI*2);ctx.fill();
          if(i%17===0&&f.y>.1){
            const drop=height*(.015+(i%5)*.006);
            for(let j=0;j<drop;j+=3)bloom(fx+Math.sin(t*.8+phase+j*.12)*1.2,fy+j,1.1,1.8,j%4?'#c3c3c3':'#808080');
          }
        }
      }
    }
  }
  function ribbon(g,coords,widths,color){
    const knots=g.points(coords),samples=[];
    for(let i=0;i<knots.length-1;i++){
      const a=knots[Math.max(0,i-1)],b=knots[i],c=knots[i+1],d=knots[Math.min(knots.length-1,i+2)];
      for(let k=0;k<14;k++){
        const t=k/14,t2=t*t,t3=t2*t;
        const q=axis=>.5*((2*b[axis])+(-a[axis]+c[axis])*t+(2*a[axis]-5*b[axis]+4*c[axis]-d[axis])*t2+(-a[axis]+3*b[axis]-3*c[axis]+d[axis])*t3);
        samples.push({x:q(0),y:q(1),w:(widths[i]*(1-t)+widths[i+1]*t)*height*1.35});
      }
    }
    samples.push({x:knots.at(-1)[0],y:knots.at(-1)[1],w:widths.at(-1)*height*1.35});
    samples.forEach((p,i)=>{const a=samples[Math.max(0,i-1)],b=samples[Math.min(samples.length-1,i+1)],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;p.nx=-dy/len;p.ny=dx/len;});
    const bark=ctx.createLinearGradient(knots[0][0]-height*.06,knots[0][1],knots.at(-1)[0]+height*.04,knots.at(-1)[1]);
    bark.addColorStop(0,'#181818');bark.addColorStop(.3,'#3c3c3c');bark.addColorStop(.55,color);bark.addColorStop(.75,'#4b4b4b');bark.addColorStop(1,'#232323');
    polygon([...samples.map(p=>[p.x+p.nx*p.w/2,p.y+p.ny*p.w/2]),...samples.toReversed().map(p=>[p.x-p.nx*p.w/2,p.y-p.ny*p.w/2])],bark);
    for(let i=2;i<samples.length-3;i+=5){
      const run=samples.slice(i,i+3).map(p=>[p.x+p.nx*p.w*.32,p.y+p.ny*p.w*.32]);
      line(run,'#6c6c6c',Math.max(.5,height*.0009));
      const grain=samples.slice(i,i+5).map((p,k)=>[p.x+p.nx*p.w*(-.12+Math.sin(k+i)*.04),p.y+p.ny*p.w*(-.12)]);
      line(grain,'#191919',Math.max(.5,height*.0008));
    }
  }

  function trunk(g){

    ribbon(g,[[.87,.955],[.85,.88],[.86,.81],[.84,.75],[.79,.70],[.77,.63],[.78,.57],[.80,.51],[.78,.45],[.75,.40],[.77,.34],[.83,.31]],
      [.105,.09,.078,.087,.087,.075,.06,.05,.043,.036,.026,.016],'#262626');
    ribbon(g,[[.78,.57],[.86,.52],[.89,.45],[.89,.40],[.86,.34],[.83,.31]],
      [.054,.04,.031,.028,.023,.014],'#262626');
    ribbon(g,[[.76,.40],[.70,.36],[.63,.36],[.56,.40],[.48,.405],[.41,.38],[.35,.33]],
      [.038,.031,.022,.016,.011,.007,.002],'#2f2f2f');
    ribbon(g,[[.70,.36],[.67,.31],[.64,.25],[.60,.24]],[.018,.012,.007,.002],'#2f2f2f');
    ribbon(g,[[.80,.34],[.78,.27],[.80,.20],[.85,.15]],[.025,.018,.011,.003],'#2f2f2f');
    ribbon(g,[[.83,.31],[.89,.28],[.94,.22],[.99,.19]],[.023,.014,.008,.002],'#2f2f2f');
    ribbon(g,[[.63,.36],[.56,.32],[.51,.29]],[.013,.007,.002],'#2f2f2f');
    for(let i=0;i<6;i++){
      const end=.74+i*.043;
      ribbon(g,[[.86,.90],[.83+(i-2)*.01,.945],[end,.978]],[.021,.015,.002],i%2?'#2f2f2f':'#262626');
    }
  }
  function figureBox(){
    const mobile=canvas.clientWidth<650;
    const h=mobile?Math.min(width*.80,height*.68):Math.min(height*.53,width*.38);
    const w=h*(spriteFrames.length?spriteFrames[0].width/spriteFrames[0].height:8/9);
    const center=width*(mobile?.68:.79);
    return {x:center-w/2,y:height*.972-h,w,h};
  }
  function poseState(t){
    const phase=t%4.4,blink=phase>3.1&&phase<3.28?Math.sin((phase-3.1)/.18*Math.PI):0;
    const smooth=v=>{const x=Math.max(0,Math.min(1,v));return x*x*x*(x*(x*6-15)+10);};
    const cycle=t%18,raise=smooth((cycle-3.8)/1.55),lower=smooth((cycle-6.6)/1.65),yawn=raise*(1-lower);
    return {angle:Math.sin(t*.72)*.022+Math.sin(t*.23)*.006+yawn*.14,lift:Math.sin(t*1.15)*.8-yawn*.5,
      handAngle:Math.sin(t*6.5)*.012*(1-yawn),handLift:Math.sin(t*9.4)*.28*(1-yawn),
      blink:Math.max(blink,yawn),yawn,arm:smooth((yawn-.06)/.94),armOpacity:smooth(yawn/.06),
      action:yawn>.015?'yawn':blink>.1?'blink':'typing'};
  }
  function drawYawnArm(rig,state){
    if(state.armOpacity===0)return;
    ctx.save();ctx.globalAlpha=state.armOpacity;
    const p=state.arm,cos=Math.cos(state.angle),sin=Math.sin(state.angle);
    const mouthX=rig.w*.59+(121-rig.w*.59)*cos-(95-rig.h*.42)*sin;
    const mouthY=rig.h*.42+(121-rig.w*.59)*sin+(95-rig.h*.42)*cos+state.lift;
    const target={x:mouthX-13,y:mouthY+25},q=1-p;
    const wrist={x:q*q*116+2*q*p*100+p*p*target.x,y:q*q*153+2*q*p*126+p*p*target.y};
    const elbow={x:101+p*2,y:148-p*3};
    const dx=wrist.x-elbow.x,dy=wrist.y-elbow.y,length=Math.hypot(dx,dy)||1,nx=-dy/length,ny=dx/length;
    const sleeve=ctx.createLinearGradient(elbow.x-nx*6,elbow.y-ny*6,elbow.x+nx*6,elbow.y+ny*6);
    sleeve.addColorStop(0,'#111');sleeve.addColorStop(.48,'#2b2b2b');sleeve.addColorStop(1,'#141414');
    polygon([[elbow.x+nx*6.2,elbow.y+ny*6.2],[wrist.x+nx*4.5,wrist.y+ny*4.5],
      [wrist.x-nx*4.5,wrist.y-ny*4.5],[elbow.x-nx*6.2,elbow.y-ny*6.2]],sleeve);
    line([[elbow.x+nx*4.7,elbow.y+ny*4.7],[wrist.x+nx*3.5,wrist.y+ny*3.5]],'#5a5a5a',.65);
    line([[wrist.x-nx*4.5,wrist.y-ny*4.5],[wrist.x+nx*4.5,wrist.y+ny*4.5]],'#0b0b0b',2.5);
    const handScale=.5+.22*p;
    ctx.save();ctx.translate(wrist.x,wrist.y);ctx.rotate(-1.9*(1-p));ctx.scale(handScale,handScale);ctx.translate(-105,-101);
    ctx.drawImage(rig.yawnHand,0,0);ctx.restore();ctx.restore();
  }
  function drawYawnMouth(amount){
    const open=Math.max(0,Math.min(1,(amount-.08)/.92));
    if(open===0)return;
    const x=121.4,y=95.2,rx=1.6+open*1.05,ry=.35+open*2.8;
    const outline=()=>{
      ctx.beginPath();ctx.moveTo(x-rx,y-ry*.2);
      ctx.bezierCurveTo(x-rx*.9,y-ry*.95,x+rx*.65,y-ry,x+rx,y-ry*.18);
      ctx.bezierCurveTo(x+rx*.95,y+ry*.85,x-rx*.8,y+ry*1.05,x-rx,y-ry*.2);ctx.closePath();
    };
    ctx.save();
    const inside=ctx.createLinearGradient(0,y-ry,0,y+ry);
    inside.addColorStop(0,'#4b4b4b');inside.addColorStop(.62,'#646464');inside.addColorStop(1,'#7c7c7c');
    outline();ctx.fillStyle=inside;ctx.fill();ctx.strokeStyle='#919191';ctx.lineWidth=.55;ctx.stroke();
    ctx.save();outline();ctx.clip();


    ctx.fillStyle='#d3d3d3';ctx.beginPath();ctx.moveTo(x-rx*.85,y-ry*.55);
    ctx.quadraticCurveTo(x,y-ry*.75,x+rx*.85,y-ry*.5);ctx.lineTo(x+rx*.7,y-ry*.22);
    ctx.quadraticCurveTo(x,y-ry*.35,x-rx*.7,y-ry*.2);ctx.closePath();ctx.fill();
    ctx.fillStyle='#9c9c9c';ctx.beginPath();ctx.ellipse(x+rx*.1,y+ry*.64,rx*.69,ry*.26,-.1,0,Math.PI*2);ctx.fill();ctx.restore();
    ctx.strokeStyle='#b0b0b0';ctx.lineWidth=.4;ctx.beginPath();
    ctx.moveTo(x-rx*.55,y+ry*.92);ctx.quadraticCurveTo(x,y+ry*1.08,x+rx*.48,y+ry*.92);ctx.stroke();ctx.restore();
  }
  function positionSceneUI(b,t,state){
    const rig=characterRig,dx=rig.w*(.51-.59),dy=rig.h*(.075-.42),cos=Math.cos(state.angle),sin=Math.sin(state.angle);
    const headX=b.x+(rig.w*.59+dx*cos-dy*sin)*b.w/rig.w;
    const headY=b.y+(rig.h*.42+dx*sin+dy*cos+state.lift)*b.h/rig.h;
    const mobile=canvas.clientWidth<650;
    if(nameTag){
      nameTag.style.left='0px';nameTag.style.top='0px';
      nameTag.style.transform=`translate(${headX}px,${canvas.offsetTop+headY-12}px) translate(-50%,-100%)`;
    }
    if(greeting){
      const chatWidth=mobile?Math.min(210,width-32):Math.min(330,width*.30);
      greeting.style.width=`${chatWidth}px`;
      const chatHeight=greeting.offsetHeight||154;

      const laptopX=b.x+b.w*.25;
      const left=Math.max(16,Math.min(width-chatWidth-16,laptopX-chatWidth*(mobile?.85:.90)));
      greeting.style.left=`${left}px`;
      greeting.style.setProperty('--pointer-x',`${Math.max(16,Math.min(chatWidth-16,laptopX-left))}px`);
      const laptopTop=canvas.offsetTop+b.y+b.h*.43;
      greeting.style.top=`${Math.max(mobile?canvas.offsetTop+5:95,laptopTop-chatHeight-19)}px`;
    }
  }
  function coder(g,t){
    if(!characterRig)return;
    const b=figureBox(),state=poseState(t);
    if(canvas.dataset.characterAction!==state.action)canvas.dataset.characterAction=state.action;
    canvas.dataset.characterPose=state.yawn>.015?'rig-yawn':'rig-typing';
    canvas.dataset.yawnProgress=state.yawn.toFixed(3);
    ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    const rig=characterRig;ctx.translate(b.x,b.y);ctx.scale(b.w/rig.w,b.h/rig.h);
    ctx.drawImage(rig.body,0,0);
    if(state.armOpacity>0){ctx.save();ctx.globalAlpha=state.armOpacity;ctx.drawImage(rig.backHandPatch,0,0);ctx.restore();}
    ctx.save();ctx.translate(rig.w*.59,rig.h*.42+state.lift);ctx.rotate(state.angle);ctx.translate(-rig.w*.59,-rig.h*.42);
    ctx.drawImage(rig.head,0,0);
    drawYawnMouth(state.yawn);
    if(state.blink>0){
      ctx.globalAlpha=state.blink;ctx.strokeStyle='#343434';ctx.lineWidth=1.4;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(rig.w*.532,rig.h*.313);ctx.lineTo(rig.w*.556,rig.h*.316);ctx.stroke();
    }
    ctx.restore();
    drawYawnArm(rig,state);


    ctx.drawImage(rig.laptop,0,0);
    ctx.save();ctx.translate(rig.w*.58,rig.h*.60+state.handLift);ctx.rotate(state.handAngle);ctx.translate(-rig.w*.58,-rig.h*.60);
    ctx.drawImage(rig.hand,0,0);ctx.restore();
    ctx.restore();ctx.imageSmoothingEnabled=false;
    positionSceneUI(b,t,state);
  }
  function draw(t){
    sky(t);const g=treeSpace(t);
    if(naturalTree.complete&&naturalTree.naturalWidth){
      const tw=width*(g.mobile?2.1:1.05),th=tw*naturalTree.naturalHeight/naturalTree.naturalWidth;
      const rootX=width*(g.mobile?.91:.87),rootY=height*.985;
      ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
      ctx.translate(rootX,rootY);ctx.rotate(Math.sin(t*.55)*.018+Math.sin(t*1.3)*.003);
      ctx.filter='grayscale(1) brightness(.58) contrast(1.12)';
      ctx.drawImage(naturalTree,-tw*.85,-th,tw,th);ctx.restore();
    }else{
      if(foliageBack)ctx.drawImage(foliageBack,g.wind*.4,Math.sin(t*.75)*.8);
      trunk(g);
      if(foliageFront)ctx.drawImage(foliageFront,g.wind*.45,Math.sin(t*.75)*.9);
    }
    coder(g,t);
    petals.forEach((p,i)=>{
      const x=(p.x-t*p.s*3+Math.sin(t*.55+p.p)*22+width*100)%width,y=(p.y+t*p.s*2.4)%height;
      ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t+p.p)*1.2+t*.35);
      ctx.fillStyle=i%3?'#b7b7b7':'#e3e3e3';ctx.beginPath();ctx.ellipse(0,0,Math.max(.6,p.s*.4),Math.max(.3,Math.abs(Math.cos(t+p.p))*p.s*.22),0,0,Math.PI*2);ctx.fill();ctx.restore();
    });
  }
  function tick(now){frame=requestAnimationFrame(tick);if(document.documentElement.classList.contains('intro-active')){last=0;return;}if(paused||!visible||document.hidden||now-last<1000/60-.75)return;elapsed+=last?Math.min((now-last)/1000,.05):0;last=now;draw(elapsed);}
  document.addEventListener('portfolio:ready',()=>{last=0;});
  motion.addEventListener('change',()=>{paused=motion.matches;last=0;draw(elapsed);});
  document.addEventListener('visibilitychange',()=>{last=0;});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;last=0;}).observe(canvas);
  new ResizeObserver(resize).observe(canvas);
  resize();frame=requestAnimationFrame(tick);
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);frame=0;});
  window.addEventListener('pageshow',event=>{if(event.persisted&&!frame){last=0;frame=requestAnimationFrame(tick);}});
})();
