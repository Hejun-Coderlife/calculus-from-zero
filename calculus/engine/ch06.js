/* 第6章渲染器 + 专属动画（原生 JS）。读 window.CH6，渲染 Hero + 8 屏。
   文案/数据来自 data/ch06.js；本文件只负责渲染与动画，不含正文字符串。 */
(function(){
'use strict';
var CH=window.CH6; if(!CH) return;
var RM = (typeof matchMedia!=='undefined') && matchMedia('(prefers-reduced-motion:reduce)').matches;
var C={ ink:'#1d1d1f', soft:'#57575c', faint:'#86868b', blue:'#0071e3', amber:'#c8860a',
        gray:'#cfcfd4', ramp:'#d9c39a', copper:'#b06a3a', copperHi:'#cf8a52' };

/* ---------- 小工具 ---------- */
function h(tag,cls,html){ var e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e; }
function trim(x,dp){ return (+(+x).toFixed(dp)).toString(); }
function calc(g){ var st=3-g, sp=st*st, dist=9-sp, avg=6-g; return {gap:g, startT:st, startPos:sp, dist:dist, avg:avg}; }
function fmtGap(g){ return String(g); }                 // 3 / 0.5 / 0.001
function fmtDist(d){ return trim(d,6); }                // ≤6 位、去尾 0
function fmtAvg(a){ return trim(a,3); }                 // 3 / 5.5 / 5.999

/* ---------- 共享弯道场景（继承第5章的弯道，跨章视觉连续）----------
   轨道 = ch05 crvScene 的 U 形弯道；球沿左半下坡滚动，走过的弧长 = 距离(格)。
   距离 0..9 → 弯道参数 p 0..0.5（下坡到谷底 = 第3秒）。               */
function RampFig(canvas, h0){
  var st={ gap:3, ballPos:9, dimGray:true, showWindow:true };
  function dpr(){ return Math.min(window.devicePixelRatio||1,2); }
  function draw(){
    var cssW=canvas.clientWidth||600, cssH=h0||340, r=dpr();
    canvas.width=cssW*r; canvas.height=cssH*r; canvas.style.height=cssH+'px';
    var ctx=canvas.getContext('2d'); ctx.setTransform(r,0,0,r,0,0); ctx.clearRect(0,0,cssW,cssH);
    var W=cssW,H=cssH, groundY=H-56;
    // 地面（继承 ch05）
    ctx.fillStyle='#eceef2'; ctx.fillRect(0,groundY,W,H-groundY);
    ctx.strokeStyle='#d3d6db'; ctx.lineWidth=1; ctx.beginPath();ctx.moveTo(0,groundY+.5);ctx.lineTo(W,groundY+.5);ctx.stroke();
    // 弯道几何（继承 ch05 crvScene）
    var X0=54,X1=W-54,topY=38,botY=groundY-28;
    function cx(p){ return X0+(X1-X0)*p; }
    function cy(p){ return topY+(botY-topY)*(1-Math.pow(2*p-1,2)); }
    function pd(d){ var p=d/18; return [cx(p),cy(p)]; }         // 距离 d 格 → 弯道点
    // 全弯道（棕，继承 ch05 配色）
    ctx.strokeStyle='#b98a52'; ctx.lineWidth=11; ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.beginPath(); for(var i=0;i<=90;i++){ var p=i/90; i?ctx.lineTo(cx(p),cy(p)):ctx.moveTo(cx(p),cy(p)); } ctx.stroke();
    ctx.strokeStyle='rgba(120,85,45,.4)'; ctx.lineWidth=1.3;
    ctx.beginPath(); for(var j=0;j<=90;j++){ var q=j/90; j?ctx.lineTo(cx(q),cy(q)-5):ctx.moveTo(cx(q),cy(q)-5); } ctx.stroke();
    var g=st.gap, m=calc(g);
    function arc(d0,d1,color,wid){ ctx.strokeStyle=color; ctx.lineWidth=wid; ctx.lineCap='round';
      ctx.beginPath(); var n=48; for(var k=0;k<=n;k++){ var d=d0+(d1-d0)*k/n, pp=d/18; k?ctx.lineTo(cx(pp),cy(pp)):ctx.moveTo(cx(pp),cy(pp)); } ctx.stroke(); }
    if(st.dimGray) arc(0, m.startPos, '#cfcfd4', 11);            // 已发生（浅灰）
    if(st.showWindow) arc(m.startPos, (st.fillTo!=null?st.fillTo:9), C.blue, 11);  // 观察窗口（蓝，fillTo 用于滚动时逐渐高亮）
    ctx.lineCap='butt';
    // 起点方块
    if(st.showWindow){ var Ps=pd(m.startPos); ctx.save();ctx.translate(Ps[0],Ps[1]);ctx.fillStyle=C.blue;ctx.fillRect(-6,-6,12,12);ctx.restore(); }
    // 第3秒：深色实心圆（谷底）
    var P9=pd(9); ctx.fillStyle=C.ink; ctx.beginPath();ctx.arc(P9[0],P9[1],8,0,7);ctx.fill();
    ctx.fillStyle=C.soft; ctx.font='600 12px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top'; ctx.fillText('第3秒',P9[0],P9[1]+12);
    // 起点 0 格 / 第3秒 9 格（体现距离，gated）
    if(st.showGrid){
      var P0=pd(0);
      ctx.fillStyle=C.soft; ctx.font='700 12px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='bottom'; ctx.fillText('0 格',P0[0],P0[1]-11);
      ctx.fillStyle=C.blue; ctx.textAlign='left'; ctx.textBaseline='middle'; ctx.fillText('9 格',P9[0]+13,P9[1]);
    }
    // 银色小球（继承 ch05 弯道的球）
    var Pb=pd(st.ballPos), by=Pb[1]-9;
    var bg=ctx.createRadialGradient(Pb[0]-3,by-3,1,Pb[0],by,10);
    bg.addColorStop(0,'#fafafc'); bg.addColorStop(1,'#b8b8c0');
    ctx.fillStyle=bg; ctx.strokeStyle='rgba(0,0,0,.14)'; ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(Pb[0],by,10,0,7);ctx.fill();ctx.stroke();
    // 时间轴 0..3 + 窗口括号
    var y=H-26, ax0=X0, ax1=X1;
    ctx.strokeStyle='rgba(0,0,0,.18)'; ctx.lineWidth=1.4; ctx.beginPath();ctx.moveTo(ax0,y);ctx.lineTo(ax1,y);ctx.stroke();
    function tx(t){ return ax0+(ax1-ax0)*(t/3); }
    ctx.fillStyle=C.faint; ctx.font='11px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
    [0,1,2,3].forEach(function(t){ ctx.strokeStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.moveTo(tx(t),y-3);ctx.lineTo(tx(t),y+3);ctx.stroke(); ctx.fillText(t+'秒',tx(t),y+5); });
    ctx.strokeStyle=C.ink; ctx.lineWidth=2; ctx.beginPath();ctx.moveTo(tx(3),y-8);ctx.lineTo(tx(3),y+8);ctx.stroke();
    if(st.showWindow){
      ctx.strokeStyle=C.blue; ctx.lineWidth=2.4;
      ctx.beginPath(); ctx.moveTo(tx(m.startT),y-10); ctx.lineTo(tx(m.startT),y-3); ctx.lineTo(tx(3),y-3); ctx.lineTo(tx(3),y-10); ctx.stroke();
      ctx.fillStyle=C.blue; ctx.font='700 11px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='bottom'; ctx.fillText(fmtGap(g)+'秒',(tx(m.startT)+tx(3))/2,y-12);
    }
  }
  return { draw:draw, st:st, set:function(o){ for(var k in o) st[k]=o[k]; draw(); } };
}

/* ---------- 面板骨架 ---------- */
function panel(id){ var s=h('section','panel'); s.id=id; var w=h('div','wrap'); s.appendChild(w); s._w=w; return s; }
function copyBlock(body){ var c=h('div','copy reveal'); (body||[]).forEach(function(p){ c.appendChild(h('p',p.bold?'bold':null,p.t)); }); return c; }

/* ---------- Hero ---------- */
function buildHero(){
  var s=h('section','panel'); s.id='hero'; s.style.justifyContent='flex-start';
  var api=(typeof window!=='undefined'&&window.CH6Hero)?window.CH6Hero(s):null;
  s._activate=function(){ if(api&&api.activate)api.activate(); };
  s._deactivate=function(){ if(api&&api.deactivate)api.deactivate(); };
  return s;
}

/* ---------- 承接（s1） ---------- */
function buildRecap(sc){
  var s=panel(sc.id), w=s._w;
  w.appendChild(h('div','kicker reveal',sc.kicker));
  w.appendChild(h('div','q reveal',sc.heading));
  w.appendChild(copyBlock(sc.body));
  var fig=h('div','fig reveal'); var cv=h('canvas'); fig.appendChild(cv); w.appendChild(fig);
  if(sc.hint) w.appendChild(h('div','hintline reveal',sc.hint));
  var f=RampFig(cv,300); f.set({gap:3, ballPos:9, showWindow:false, dimGray:false});
  s._activate=function(){ f.draw(); };
  return s;
}

/* ---------- 尝试屏 ----------
   有 dataLines（第2屏）：球从 0 格滚到 9 格、轨道逐渐高亮、依次显示三个数据、再出印章、标 0/9 格。
   无 dataLines（第3屏及后续）：保持原样（静态 + 通用读数 + 印章）。          */
function buildAttempt(sc){
  var s=panel(sc.id), w=s._w;
  w.appendChild(h('div','kicker reveal',sc.kicker));
  w.appendChild(h('div','q reveal',sc.heading));
  w.appendChild(copyBlock(sc.body));
  var fig=h('div','fig reveal'); var cv=h('canvas'); fig.appendChild(cv); w.appendChild(fig);
  var read=h('div','readout reveal',''); w.appendChild(read);
  var stampWrap=h('div','stamps reveal');
  var stampEls=(sc.stamps||[]).map(function(t){ var e=h('span','stamp',t); stampWrap.appendChild(e); return e; });
  w.appendChild(stampWrap);
  if(sc.button){ var b=h('div','btnrow reveal'); var btn=h('button','btn',sc.button.text); b.appendChild(btn); w.appendChild(b);
    btn.addEventListener('click',function(){ var nx=s.nextElementSibling; if(nx)nx.scrollIntoView({behavior:RM?'auto':'smooth'}); }); }
  var f=RampFig(cv,300); var m=calc(sc.gap);
  var grid=!!sc.dataLines;
  var dataEls=[];
  if(grid){ sc.dataLines.forEach(function(t,i){ if(i) read.appendChild(h('span',null,'　·　'));
    var sp=h('span', i===sc.dataLines.length-1?'bl':null, t); sp.style.opacity='0'; sp.style.transition='opacity .45s'; read.appendChild(sp); dataEls.push(sp); }); }
  var done=false, raf=null, timers=[];
  function later(fn,ms){ timers.push(setTimeout(fn,ms)); }
  function revealData(cb){ if(RM){ dataEls.forEach(function(e){e.style.opacity='1';}); cb&&cb(); return; }
    dataEls.forEach(function(e,i){ later(function(){ e.style.opacity='1'; if(i===dataEls.length-1)cb&&cb(); }, 300+i*450); }); }
  function stampsOn(){ if(RM){ stampEls.forEach(function(e){e.classList.add('on');}); return; }
    stampEls.forEach(function(e,i){ later(function(){e.classList.add('on');}, 300+i*450); }); }
  s._activate=function(){
    if(done){ f.set({gap:sc.gap, ballPos:9, showWindow:true, dimGray:true, showGrid:grid, fillTo:null}); return; }
    done=true;
    if(!grid){                                   // 第3屏及后续：原样
      f.set({gap:sc.gap, ballPos:9, showWindow:true, dimGray:true});
      read.innerHTML='时间 <b>'+fmtGap(sc.gap)+'</b> 秒　·　经过距离 <b>'+fmtDist(m.dist)+'</b> 格　·　平均每秒 <b class="bl">'+fmtAvg(m.avg)+'</b> 格';
      if(RM){ stampEls.forEach(function(e){e.classList.add('on');}); return; }
      stampEls.forEach(function(e,i){ setTimeout(function(){e.classList.add('on');}, 500+i*450); }); return;
    }
    // 第2屏：球 0→9 格滚动 + 逐渐高亮 + 依次数据 + 印章
    if(RM){ f.set({gap:3, ballPos:9, showWindow:true, dimGray:true, showGrid:true, fillTo:null}); revealData(stampsOn); return; }
    f.set({gap:3, ballPos:0, showWindow:true, dimGray:true, showGrid:true, fillTo:0});
    var t0=null;
    function step(now){ if(t0==null)t0=now; var k=Math.min(1,(now-t0)/1300), bp=(3*k)*(3*k);
      f.set({gap:3, ballPos:bp, showWindow:true, dimGray:true, showGrid:true, fillTo:bp});
      if(k<1) raf=requestAnimationFrame(step); else { f.set({fillTo:null}); revealData(stampsOn); } }
    raf=requestAnimationFrame(step);
  };
  s._deactivate=function(){ if(raf){cancelAnimationFrame(raf);raf=null;} timers.forEach(clearTimeout); timers=[]; };
  return s;
}

/* ---------- 连续缩短（s4） ---------- */
function buildAttemptSeq(sc){
  var s=panel(sc.id), w=s._w;
  w.appendChild(h('div','kicker reveal',sc.kicker));
  w.appendChild(h('div','q reveal',sc.heading));
  w.appendChild(copyBlock(sc.body));
  var fig=h('div','fig reveal'); var cv=h('canvas'); fig.appendChild(cv); w.appendChild(fig);
  var read=h('div','readout reveal',''); w.appendChild(read);
  var recWrap=h('div','reclist reveal'); var recEls=(sc.records||[]).map(function(t){ var e=h('div',null,t); recWrap.appendChild(e); return e; }); w.appendChild(recWrap);
  if(sc.button){ var b=h('div','btnrow reveal'); var btn=h('button','btn',sc.button.text); b.appendChild(btn); w.appendChild(b);
    btn.addEventListener('click',function(){ var nx=s.nextElementSibling; if(nx)nx.scrollIntoView({behavior:RM?'auto':'smooth'}); }); }
  var f=RampFig(cv,300);
  function show(i){ var g=sc.seq[i], m=calc(g); f.set({gap:g, ballPos:9, showWindow:true, dimGray:true});
    read.innerHTML='从第 '+trim(m.startT,1)+' 秒到第 3 秒　·　'+fmtGap(g)+' 秒　·　经过 '+fmtDist(m.dist)+' 格　·　平均每秒 <b class="bl">'+fmtAvg(m.avg)+'</b> 格';
    for(var k=0;k<recEls.length;k++) recEls[k].classList.toggle('on', k<=i); }
  var timer=null, started=false;
  s._activate=function(){
    if(started){ show(sc.seq.length-1); return; } started=true;
    if(RM){ show(sc.seq.length-1); return; }
    var i=0; show(0);
    timer=setInterval(function(){ i++; if(i>=sc.seq.length){ clearInterval(timer); timer=null; return; } show(i); }, 1400);
  };
  s._deactivate=function(){ if(timer){clearInterval(timer);timer=null;} };
  return s;
}

/* ---------- 核心互动（s5） ---------- */
var USER_TRIED=false;
function buildInteractive(sc){
  var s=panel(sc.id), w=s._w;
  w.appendChild(h('div','kicker reveal',sc.kicker));
  w.appendChild(h('div','q reveal',sc.heading));
  w.appendChild(copyBlock(sc.body));
  var fig=h('div','fig reveal'); var cv=h('canvas'); fig.appendChild(cv); w.appendChild(fig);
  var read=h('div','readout reveal',''); w.appendChild(read);
  var ctrl=h('div','ctrl reveal');
  ctrl.appendChild(h('span','ctrllabel',sc.sliderHint));
  var sl=h('input'); sl.type='range'; sl.min=0; sl.max=CH.model.stops.length-1; sl.value=0; sl.step=1;
  sl.setAttribute('aria-label',sc.sliderHint); ctrl.appendChild(sl);
  var slLabel=h('span','ctrllabel',''); ctrl.appendChild(slLabel); w.appendChild(ctrl);
  var brow=h('div','btnrow reveal');
  var autoBtn=h('button','btn',sc.autoBtn), resetBtn=h('button','btn',sc.resetBtn);
  brow.appendChild(autoBtn); brow.appendChild(resetBtn); w.appendChild(brow);
  // 记录板
  var rec=h('div','records reveal');
  rec.appendChild(h('div','rtitle',sc.recordTitle));
  var tbl=h('table'); var thead=h('tr'); thead.appendChild(h('th',null,sc.recordCols[0])); thead.appendChild(h('th',null,sc.recordCols[1])); tbl.appendChild(thead);
  var rowEls=CH.model.stops.map(function(g){ var m=calc(g); var tr=h('tr'); tr.appendChild(h('td',null,fmtGap(g)+'秒')); tr.appendChild(h('td',null,fmtAvg(m.avg)+'格')); tbl.appendChild(tr); return tr; });
  rec.appendChild(tbl); rec.appendChild(h('div','rfoot',sc.recordFoot)); w.appendChild(rec);

  var f=RampFig(cv,340);
  function update(idx){
    var g=CH.model.stops[idx], m=calc(g);
    f.set({gap:g, ballPos:9, showWindow:true, dimGray:true});
    slLabel.textContent=sc.sliderLabels[idx];
    read.innerHTML='时间 <b>'+fmtGap(g)+'</b> 秒　·　经过距离 <b>'+fmtDist(m.dist)+'</b> 格　·　平均每秒 <b class="bl">'+fmtAvg(m.avg)+'</b> 格';
    rowEls.forEach(function(tr,k){ tr.classList.toggle('hot', k===idx); });
  }
  var auto=null;
  function stopAuto(){ if(auto){clearInterval(auto);auto=null;} autoBtn.textContent=sc.autoBtn; }
  sl.addEventListener('input',function(){ USER_TRIED=true; stopAuto(); update(+sl.value); });
  autoBtn.addEventListener('click',function(){
    if(auto){ // 暂停
      clearInterval(auto); auto=null; autoBtn.textContent=sc.resumeBtn; return;
    }
    if(autoBtn.textContent===sc.resumeBtn){ /* 继续 */ }
    USER_TRIED=true; autoBtn.textContent=sc.pauseBtn;
    auto=setInterval(function(){
      var v=+sl.value; if(v>=CH.model.stops.length-1){ stopAuto(); return; }
      sl.value=v+1; update(v+1);
    }, 900);
  });
  resetBtn.addEventListener('click',function(){ stopAuto(); sl.value=0; update(0); });
  s._activate=function(){ update(+sl.value); };   // 首次不自动播放
  s._deactivate=function(){ stopAuto(); };
  return s;
}

/* ---------- 发现困难（s6） ---------- */
function buildDifficulty(sc){
  var s=panel(sc.id), w=s._w;
  w.appendChild(h('div','kicker reveal',sc.kicker));
  w.appendChild(h('div','q reveal',sc.heading));
  var gate=h('div','btnrow reveal'); var gbtn=h('button','btn',sc.gateBtn); gate.appendChild(gbtn); w.appendChild(gate);
  var content=h('div','wrap'); content.style.gap='16px'; content.style.display='none'; content.style.padding='0';
  content.appendChild(copyBlock(sc.body));
  var fig=h('div','fig reveal'); var cv=h('canvas'); fig.appendChild(cv); content.appendChild(fig);
  content.appendChild(h('div','qcard reveal',sc.questionCard));
  w.appendChild(content);
  gbtn.addEventListener('click',function(){ var el=document.getElementById('s5'); if(el)el.scrollIntoView({behavior:RM?'auto':'smooth'}); });

  // 逼近动画（2 → 2.9 → 2.99 → 2.999）
  var approxSteps=[2,2.9,2.99,2.999], hot=false;
  function dpr(){ return Math.min(window.devicePixelRatio||1,2); }
  function drawApprox(startT){
    var cssW=cv.clientWidth||600, cssH=260, r=dpr();
    cv.width=cssW*r; cv.height=cssH*r; cv.style.height=cssH+'px';
    var ctx=cv.getContext('2d'); ctx.setTransform(r,0,0,r,0,0); ctx.clearRect(0,0,cssW,cssH);
    var W=cssW,H=cssH, x0=60,x1=W-90,y=H/2;
    ctx.strokeStyle='rgba(0,0,0,.18)';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x1+40,y);ctx.stroke();
    function tx(t){ return x0+(x1-x0)*((t-1.8)/(3-1.8)); }
    // 蓝色窗口
    ctx.strokeStyle=C.blue;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(tx(startT),y);ctx.lineTo(tx(3),y);ctx.stroke();
    // 起点方块
    ctx.fillStyle=C.blue;ctx.fillRect(tx(startT)-6,y-6,12,12);
    ctx.fillStyle=C.soft;ctx.font='600 12px sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';
    ctx.fillText('第'+trim(startT,3)+'秒',tx(startT),y-12);
    // 第3秒深色圆
    ctx.fillStyle=C.ink;ctx.beginPath();ctx.arc(tx(3),y,8,0,7);ctx.fill();
    ctx.font='700 12px sans-serif';ctx.textBaseline='top';ctx.fillText('第3秒',tx(3),y+12);
    // 细界线 + 文案
    ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(tx(3)-2,y-24);ctx.lineTo(tx(3)-2,y+24);ctx.stroke();
    ctx.fillStyle=C.blue;ctx.font='600 11px sans-serif';ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText(sc.gateLine,tx(3)-6,y-30);
    // 完全重合（灰、不可点）
    var fx=tx(3)+30;
    ctx.fillStyle=hot?'#a33':'#b8b8be';ctx.font='700 12px sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText('● '+sc.forbidLabel,fx,y);
    if(hot){ ctx.fillStyle=C.soft;ctx.font='11px sans-serif';ctx.textBaseline='top';
      wrapText(ctx,sc.forbidHover,fx,y+10,W-fx-6,14); }
  }
  function wrapText(ctx,t,x,y,maxw,lh){ var line='',yy=y; for(var i=0;i<t.length;i++){ var test=line+t[i]; if(ctx.measureText(test).width>maxw){ ctx.fillText(line,x,yy); line=t[i]; yy+=lh; } else line=test; } ctx.fillText(line,x,yy); }
  cv.addEventListener('mousemove',function(e){ var rct=cv.getBoundingClientRect(); var fx=cv.clientWidth*0; // 近似：右侧 40% 视为悬停区
      hot = (e.clientX-rct.left) > cv.clientWidth*0.72; drawApprox(2.999); });
  cv.addEventListener('mouseleave',function(){ hot=false; drawApprox(2.999); });

  var timer=null, ran=false;
  s._activate=function(){
    if(!USER_TRIED){ gate.style.display=''; content.style.display='none'; return; }
    gate.style.display='none'; content.style.display='flex';
    if(ran){ drawApprox(2.999); return; } ran=true;
    if(RM){ drawApprox(2.999); return; }
    var i=0; drawApprox(approxSteps[0]);
    timer=setInterval(function(){ i++; if(i>=approxSteps.length){ clearInterval(timer);timer=null; return; } drawApprox(approxSteps[i]); },1000);
  };
  s._deactivate=function(){ if(timer){clearInterval(timer);timer=null;} };
  return s;
}

/* ---------- 历史三卡（s7） ---------- */
function buildHistory(sc){
  var s=panel(sc.id), w=s._w;
  w.appendChild(h('div','kicker hist reveal',sc.kicker));
  w.appendChild(h('div','q reveal',sc.heading));
  var wrap=h('div','histcards reveal');
  sc.cards.forEach(function(c){ var card=h('div','hcard'); card.appendChild(h('div','htag',c.tag));
    c.body.forEach(function(p){ card.appendChild(h('p',null,p)); }); wrap.appendChild(card); });
  w.appendChild(wrap);
  return s;
}

/* ---------- 结尾（s8） ---------- */
function buildEnding(sc){
  var s=panel(sc.id), w=s._w;
  w.appendChild(h('div','kicker reveal',sc.kicker));
  w.appendChild(h('div','q reveal',sc.heading));
  w.appendChild(copyBlock(sc.body));
  var fig=h('div','fig reveal'); var cv=h('canvas'); fig.appendChild(cv); w.appendChild(fig);
  var qm=h('div','qmark reveal','?'); w.appendChild(qm);
  var brow=h('div','btnrow reveal');
  var nb=h('a','nextbtn',CH.nav.next.text); nb.href=CH.nav.next.href;
  var bb=h('a','subbtn',CH.nav.back.text); bb.href=CH.nav.back.href;
  brow.appendChild(nb); brow.appendChild(bb); w.appendChild(brow);
  function dpr(){ return Math.min(window.devicePixelRatio||1,2); }
  var raf=null, t0=null, inView=false;
  function draw(now){
    var cssW=cv.clientWidth||600, cssH=200, r=dpr();
    cv.width=cssW*r; cv.height=cssH*r; cv.style.height=cssH+'px';
    var ctx=cv.getContext('2d'); ctx.setTransform(r,0,0,r,0,0); ctx.clearRect(0,0,cssW,cssH);
    var W=cssW,H=cssH,x0=W*0.28,x1=W*0.72,y=H/2;
    if(t0==null)t0=now||0; var ph=RM?0:((now-t0)/700);
    var pulse=RM?1:(0.65+0.35*Math.abs(Math.sin(ph)));
    ctx.strokeStyle=C.blue; ctx.lineWidth=6*pulse+2; ctx.globalAlpha=0.5+0.5*pulse;
    ctx.beginPath();ctx.moveTo(x1-26,y);ctx.lineTo(x1,y);ctx.stroke(); ctx.globalAlpha=1;
    ctx.fillStyle=C.blue;ctx.fillRect(x1-26-6,y-6,12,12);         // 起点方块(2.999)
    ctx.fillStyle=C.ink;ctx.beginPath();ctx.arc(x1,y,8,0,7);ctx.fill();  // 第3秒
    ctx.fillStyle=C.soft;ctx.font='600 12px sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
    ctx.fillText('第2.999秒',x1-26,y+12); ctx.fillStyle=C.ink;ctx.fillText('第3秒',x1,y+12);
    if(!RM && inView) raf=requestAnimationFrame(draw);
  }
  s._activate=function(){ inView=true; if(raf)cancelAnimationFrame(raf); t0=null; if(RM){draw(0);} else raf=requestAnimationFrame(draw); };
  s._deactivate=function(){ inView=false; if(raf){cancelAnimationFrame(raf);raf=null;} };
  return s;
}

function buildShrink(sc){   // 第2屏：缩小逼近6（左弯道 + 右档位面板），委托 CH6Shrink
  var s=h('section','panel'); s.id=sc.id; s.style.justifyContent='flex-start';
  var api=(typeof window!=='undefined'&&window.CH6Shrink)?window.CH6Shrink(s,sc):null;
  s._activate=function(){ if(api&&api.activate)api.activate(); };
  s._deactivate=function(){ if(api&&api.deactivate)api.deactivate(); };
  return s;
}
function buildFormula(sc){   // 第3屏：速查表 + 历史，委托 CH6Formula
  var s=h('section','panel'); s.id=sc.id; s.style.justifyContent='flex-start';
  var w=h('div','fwrapF'); s.appendChild(w);
  var api=(typeof window!=='undefined'&&window.CH6Formula)?window.CH6Formula(w,sc):null;
  s._activate=function(){ if(api&&api.activate)api.activate(); };
  s._deactivate=function(){ if(api&&api.deactivate)api.deactivate(); };
  return s;
}
function buildTrack(sc){    // 第4屏：S 形变速轨道（引子），委托 CH6Track
  var s=h('section','panel'); s.id=sc.id; s.style.justifyContent='flex-start';
  var w=h('div','trackwrap'); s.appendChild(w);
  var api=(typeof window!=='undefined'&&window.CH6Track)?window.CH6Track(w,sc):null;
  s._activate=function(){ if(api&&api.activate)api.activate(); };
  s._deactivate=function(){ if(api&&api.deactivate)api.deactivate(); };
  return s;
}
var DISPATCH={ recap:buildRecap, attempt:buildAttempt, attemptSeq:buildAttemptSeq, shrink:buildShrink, formula:buildFormula,
  track:buildTrack, interactive:buildInteractive, difficulty:buildDifficulty, none:buildHistory, ending:buildEnding };

/* ---------- 组装 + reveal + 激活/停用 ---------- */
function render(){
  document.title=CH.pageTitle;
  var body=document.body;
  var home=h('a','homelink',CH.nav.home.text); home.href=CH.nav.home.href; body.appendChild(home);
  var prev=h('a','prevbtn',CH.nav.prev.text); prev.href=CH.nav.prev.href; body.appendChild(prev);
  var app=document.getElementById('app')||body;
  var sections=[];
  var heroSec=buildHero(); app.appendChild(heroSec); sections.push(heroSec);
  CH.scenes.forEach(function(sc){ var b=(DISPATCH[sc.anim]||buildRecap)(sc); app.appendChild(b); sections.push(b); });

  // reveal + 激活
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(en){ en.forEach(function(e){ if(e.isIntersecting) e.target.classList.add('in'); }); },{threshold:.12});
    document.querySelectorAll('.reveal').forEach(function(e){ io.observe(e); });
    var aio=new IntersectionObserver(function(en){ en.forEach(function(e){
        var sec=e.target; if(e.isIntersecting){ if(sec._activate)sec._activate(); } else { if(sec._deactivate)sec._deactivate(); }
      }); },{threshold:.35});
    sections.forEach(function(sec){ if(sec) aio.observe(sec); });
  } else {
    document.querySelectorAll('.reveal').forEach(function(e){ e.classList.add('in'); });
    sections.forEach(function(sec){ if(sec&&sec._activate)sec._activate(); });
  }
  window.addEventListener('resize',function(){ sections.forEach(function(sec){ if(sec&&sec._activate&&sec.classList.contains('panel')) sec._activate(); }); });
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',render); else render();
})();
