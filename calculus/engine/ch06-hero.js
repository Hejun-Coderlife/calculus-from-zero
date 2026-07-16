/* 第6章 · 第1屏：可缩放的互动实验（SVG 弯道 + 弧长分格 + 7 状态）
   弯道用与 ch05 相同的数学重建为 SVG <path>，以支持 getTotalLength/getPointAtLength。
   仅负责渲染/交互；全部文字与数据来自 window.CH6.hero。 */
(function(){
'use strict';
if(typeof window==='undefined') return;
var NS='http://www.w3.org/2000/svg';
function E(t,c,x){ var e=document.createElement(t); if(c)e.className=c; if(x!=null)e.innerHTML=x; return e; }
function S(t,a){ var e=document.createElementNS(NS,t); if(a)for(var k in a)e.setAttribute(k,a[k]); return e; }
function calc(g){ var st=3-g; return { gap:g, startPos:st*st, startT:st }; }

/* 弯道几何（userspace）——与 ch05 crvScene 同形 */
var VW=1000, VH=560, X0=70, X1=930, TOPY=70, BOTY=470;
function cxp(p){ return X0+(X1-X0)*p; }
function cyp(p){ return TOPY+(BOTY-TOPY)*(1-Math.pow(2*p-1,2)); }
function pathD(p0,p1){ var d=''; for(var i=0;i<=80;i++){ var p=p0+(p1-p0)*i/80; d+=(i?'L':'M')+cxp(p).toFixed(2)+' '+cyp(p).toFixed(2)+' '; } return d; }
function niceStep(x){ if(x<=0)return 1; var e=Math.pow(10,Math.floor(Math.log10(x))); var f=x/e; var n=f>=5?5:(f>=2?2:1); return n*e; }

window.CH6Hero=function(mount){
  var H=(window.CH6&&window.CH6.hero)||{};
  var RM=(typeof matchMedia!=='undefined')&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  var states=H.states||[]; var idx=0;

  /* ---- 头部文字 ---- */
  mount.appendChild(E('div','kicker reveal',H.label));
  mount.appendChild(E('div','q reveal',H.title));
  var sub=E('div','sub reveal',(H.subtitle||[]).join('<br>')); mount.appendChild(sub);
  // 颜色语义（时间蓝 / 距离绿 / 速度靛），数据卡与图中文字统一
  var CT='#0071e3', CD='#17a34a', CS='#5e5ce6';

  /* ---- 主面板：左列(数据卡 + 发现卡) + 大图 ---- */
  var panel=E('div','heropanel reveal'); mount.appendChild(panel);
  var leftCol=E('div','leftcol'); panel.appendChild(leftCol);
  var dataCard=E('div','side datacard'); leftCol.appendChild(dataCard);
  var findCard=E('div','side findcard'); leftCol.appendChild(findCard);
  var figWrap=E('div','figcol'); panel.appendChild(figWrap);

  /* ---- SVG ---- */
  var svg=S('svg',{viewBox:'0 0 '+VW+' '+VH, class:'herosvg'}); svg.setAttribute('preserveAspectRatio','xMidYMid meet');
  figWrap.appendChild(svg);
  svg.appendChild(S('rect',{x:0,y:500,width:VW,height:VH-500,fill:'#eceef2'}));
  var futurePath=S('path',{d:pathD(0.5,1),fill:'none',stroke:'#b98a52','stroke-width':11,'stroke-linecap':'round',opacity:0.22}); svg.appendChild(futurePath);
  var track=S('path',{d:pathD(0,0.5),fill:'none',stroke:'#b98a52','stroke-width':11,'stroke-linecap':'round'}); svg.appendChild(track);
  var gTicks=S('g'); svg.appendChild(gTicks);
  var win=S('path',{d:'',fill:'none',stroke:CD,'stroke-width':11,'stroke-linecap':'round',opacity:0.9}); svg.appendChild(win);   // 距离段=绿
  var seg=S('text',{'font-size':16,fill:CD,'font-weight':700,'text-anchor':'middle'}); svg.appendChild(seg);                    // 本段走了X格=绿
  var startSq=S('rect',{width:16,height:16,fill:CD,rx:2}); svg.appendChild(startSq);
  var ring=S('circle',{r:11,fill:'none',stroke:'#1d1d1f','stroke-width':3}); svg.appendChild(ring);
  var ringLbl=S('text',{'font-size':15,fill:CT,'font-weight':700,'text-anchor':'start'}); svg.appendChild(ringLbl);            // 第3秒=时间蓝
  var ringLbl2=S('text',{'font-size':13,fill:CD,'font-weight':700,'text-anchor':'start'}); svg.appendChild(ringLbl2);         // 第9格=距离绿
  var ball=S('circle',{r:11,fill:'#c9c9d2',stroke:'rgba(0,0,0,.18)','stroke-width':1}); svg.appendChild(ball);
  var warn=S('text',{'font-size':18,fill:'#c8860a','font-weight':700,'text-anchor':'middle'}); svg.appendChild(warn);

  var L=0; try{ L=track.getTotalLength()||0; }catch(e){ L=0; }
  function posAt(d){ // 距离 d 格 → 轨道点
    if(L>0){ try{ var pt=track.getPointAtLength(Math.max(0,Math.min(9,d))/9*L); return {x:pt.x,y:pt.y}; }catch(e){} }
    var p=Math.max(0,Math.min(0.5, d/18)); return {x:cxp(p),y:cyp(p)};   // 兜底：用参数式
  }
  function normalAt(d){ var a=posAt(d-0.02),b=posAt(d+0.02); var dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1; return {x:-dy/l,y:dx/l}; }

  /* ---- 时间轴（窗口 + 总览） ---- */
  var tl=E('div','timeaxis reveal'); figWrap.appendChild(tl);
  var tlSvg=S('svg',{viewBox:'0 0 1000 90', class:'tlsvg'}); tl.appendChild(tlSvg);

  /* ---- 控制器 ---- */
  var controls=E('div','controls reveal');   /* 稍后挂到左列、播放按钮下方 */
  var granRow=E('div','granrow');
  var granBtns=states.map(function(s,i){ var b=E('button','granbtn',s.gran); b.addEventListener('click',function(){ go(i); }); granRow.appendChild(b); return b; });
  controls.appendChild(granRow);
  var pm=E('div','pmrow');
  var minus=E('button','btn','－ 缩小'), plus=E('button','btn','＋ 放大'), reset=E('button','btn',H.resetBtn);
  minus.addEventListener('click',function(){ go(Math.max(0,idx-1)); });
  plus.addEventListener('click',function(){ go(Math.min(states.length-1,idx+1)); });
  reset.addEventListener('click',function(){ go(0); });
  pm.appendChild(minus); pm.appendChild(plus); pm.appendChild(reset);
  controls.appendChild(pm);

  /* ---- 播放这一小段（放在左列两卡下方，醒目色）---- */
  var playRow=E('div','btnrow playrow'); var playBtn=E('button','btn playbtn',H.playBtn); playRow.appendChild(playBtn); leftCol.appendChild(playRow);
  leftCol.appendChild(controls);   /* 档位/±/重置 放在播放按钮下面 */

  /* ---- 底部悬念 ---- */
  var bottom=E('div','herobottom'); (H.bottom||[]).forEach(function(t){ bottom.appendChild(E('p',null,t)); });
  var cont=E('a','nextbtn',H.continueBtn); cont.setAttribute('href','#s1'); bottom.appendChild(cont); mount.appendChild(bottom);
  cont.addEventListener('click',function(ev){ ev.preventDefault(); var el=document.getElementById('s1'); if(el)el.scrollIntoView({behavior:RM?'auto':'smooth'}); });

  /* ---- viewBox 动画 ---- */
  var curVB=[0,0,VW,VH], vbRAF=null;
  function targetVB(m){
    var b=posAt(9), a=posAt(m.startPos);
    var spanX=Math.abs(b.x-a.x), spanY=Math.abs(b.y-a.y);
    var w=Math.max(spanX*2.4, spanY*2.4*(VW/VH), 150);
    var h=w*(VH/VW);
    return [b.x-w/2, b.y-h/2, w, h];
  }
  function setVB(v){ svg.setAttribute('viewBox', v.map(function(n){return n.toFixed(1);}).join(' ')); curVB=v; }
  function animVB(to){ if(RM){ setVB(to); return; } if(vbRAF)cancelAnimationFrame(vbRAF); var from=curVB.slice(),t0=null;
    function st(now){ if(t0==null)t0=now; var k=Math.min(1,(now-t0)/420); var e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
      setVB(from.map(function(f,i){return f+(to[i]-f)*e;})); if(k<1)vbRAF=requestAnimationFrame(st); } vbRAF=requestAnimationFrame(st); }

  /* ---- 刻度 ---- */
  function drawTicks(m,k){        // k = 屏幕不变缩放因子（viewBox宽/VW）
    while(gTicks.firstChild) gTicks.removeChild(gTicks.firstChild);
    if(m.gap===0) return;
    var span=9-m.startPos, step=niceStep(span/6), minor=step/5;
    var lo=Math.max(0, Math.floor(m.startPos/step)*step), cnt=0;
    for(var d=lo; d<=9+1e-9; d+=minor){
      var isMaj=Math.abs(d/step-Math.round(d/step))<1e-6;
      var pt=posAt(d), nn=normalAt(d), len=(isMaj?12:6)*k;
      gTicks.appendChild(S('line',{x1:pt.x-nn.x*len,y1:pt.y-nn.y*len,x2:pt.x+nn.x*len,y2:pt.y+nn.y*len,stroke:'rgba(0,0,0,.4)','stroke-width':(isMaj?1.6:1)*k}));
      if(isMaj){ var lx=pt.x+nn.x*(len+10*k), ly=pt.y+nn.y*(len+10*k);
        var lbl=(step>=1?String(Math.round(d)):String(+d.toFixed(6)));
        gTicks.appendChild(S('text',{x:lx,y:ly,'font-size':12.5*k,fill:CD,'text-anchor':'middle','dominant-baseline':'middle'})).textContent=lbl+'格'; cnt++; }
    }
  }

  /* ---- 时间轴渲染 ---- */
  function drawTimeAxis(m){
    while(tlSvg.firstChild) tlSvg.removeChild(tlSvg.firstChild);
    var x0=60,x1=760,y=34; function tx(t){ return x0+(x1-x0)*(t/3); }
    tlSvg.appendChild(S('line',{x1:x0,y1:y,x2:x1,y2:y,stroke:'rgba(0,0,0,.2)','stroke-width':1.5}));
    [0,1,2,3].forEach(function(t){ tlSvg.appendChild(S('line',{x1:tx(t),y1:y-4,x2:tx(t),y2:y+4,stroke:'rgba(0,0,0,.2)'}));
      var tt=S('text',{x:tx(t),y:y+20,'font-size':13,fill:'#86868b','text-anchor':'middle'}); tt.textContent=t+'秒'; tlSvg.appendChild(tt); });
    // 观察窗口
    tlSvg.appendChild(S('rect',{x:tx(m.startT),y:y-6,width:Math.max(1,tx(3)-tx(m.startT)),height:12,fill:'#0071e3',opacity:0.28}));
    var a=S('text',{x:tx(m.startT),y:y-12,'font-size':12,fill:'#0071e3','font-weight':700,'text-anchor':'middle'}); a.textContent=(3-m.gap).toFixed(m.gap<0.1?4:(m.gap<1?3:3))+'秒'; tlSvg.appendChild(a);
    var e=S('text',{x:tx(3),y:y-12,'font-size':12,fill:'#1d1d1f','font-weight':700,'text-anchor':'middle'}); e.textContent='3秒'; tlSvg.appendChild(e);
    // 总览
    var oy=68; tlSvg.appendChild(S('line',{x1:x0,y1:oy,x2:x1,y2:oy,stroke:'rgba(0,0,0,.14)','stroke-width':1}));
    tlSvg.appendChild(S('rect',{x:tx(m.startT),y:oy-5,width:Math.max(1,tx(3)-tx(m.startT)),height:10,fill:'#0071e3',opacity:0.16}));
    var ov=S('text',{x:x1+8,y:oy+4,'font-size':11,fill:'#b0b0b6','text-anchor':'start'}); ov.textContent='总览 0–3秒'; tlSvg.appendChild(ov);
  }

  /* ---- 卡片 ---- */
  function colorFor(key){ if(key.indexOf('时间')>=0)return CT; if(key.indexOf('速度')>=0)return CS;
    if(key.indexOf('距离')>=0||key.indexOf('位置')>=0||key.indexOf('格')>=0)return CD; return CT; }
  function renderCards(s){
    dataCard.innerHTML=''; dataCard.appendChild(E('div','cardhd',H.dataTitle));
    dataCard.appendChild(E('div','cardsub',s.title));
    (s.data||[]).forEach(function(row){ var r=E('div','drow'); r.appendChild(E('span','dk',row[0]));
      var v=E('span','dv',row[1]); v.style.color=colorFor(row[0]); r.appendChild(v); dataCard.appendChild(r); });
    findCard.innerHTML=''; findCard.appendChild(E('div','cardhd',H.findTitle));
    var f=s.find; (Array.isArray(f)?f:[f]).forEach(function(t){ findCard.appendChild(E('p','findp',t)); });
  }

  /* ---- 正文（主标题下方随状态变化：放在数据卡下方的说明区）---- */
  var bodyBox=E('div','herobody reveal'); figWrap.appendChild(bodyBox);
  function colorize(t){   // 只给数值上色，不改文字：速度靛 / 距离绿 / 时间蓝
    return t.replace(/(每秒走[0-9.]+格)|(第?[0-9.]+格)|(第?[0-9.]+秒)/g, function(m,sp,ds,tm){
      var c = sp?CS : (ds?CD : CT);
      return '<span style="color:'+c+';font-weight:600">'+m+'</span>';
    });
  }
  function renderBody(s){ bodyBox.innerHTML=''; (s.body||[]).forEach(function(t){ bodyBox.appendChild(E('p',null,colorize(t))); }); }

  /* ---- 小球播放 ---- */
  var playRAF=null, curK=1;
  function placeBall(d){ var pt=posAt(d); ball.setAttribute('cx',pt.x); ball.setAttribute('cy',pt.y-11*curK); }
  function playSeg(){ var m=calc(states[idx].gap); if(m.gap===0){ placeBall(9); return; }
    if(playRAF)cancelAnimationFrame(playRAF); playBtn.textContent=H.replayBtn;
    if(RM){ placeBall(9); return; }
    var startT=3-m.gap, t0=null;
    function st(now){ if(t0==null)t0=now; var k=Math.min(1,(now-t0)/1100); var tt=startT+(3-startT)*k; placeBall(tt*tt);
      if(k<1)playRAF=requestAnimationFrame(st); } playRAF=requestAnimationFrame(st); }
  playBtn.addEventListener('click',playSeg);

  /* ---- 切状态 ---- */
  function go(i){ if(i<0||i>=states.length)return; idx=i; render(); }
  function render(){
    var s=states[idx], m=calc(s.gap);
    var vb=targetVB(m); curK=vb[2]/VW;               // 屏幕不变缩放因子
    var k=curK;
    granBtns.forEach(function(b,i){ b.classList.toggle('on',i===idx); });
    // 所有图元尺寸随缩放反向 → 屏幕上恒定
    track.setAttribute('stroke-width',11*k); futurePath.setAttribute('stroke-width',11*k); win.setAttribute('stroke-width',11*k);
    ring.setAttribute('r',11*k); ring.setAttribute('stroke-width',3*k);
    ball.setAttribute('r',11*k); ball.setAttribute('stroke-width',1*k);
    startSq.setAttribute('width',16*k); startSq.setAttribute('height',16*k); startSq.setAttribute('rx',2.5*k);
    // 窗口高亮 + 起点 + 段标注
    if(m.gap===0){ win.setAttribute('d',''); startSq.setAttribute('opacity','0'); seg.setAttribute('opacity','0'); }
    else{ var d='',n=44; for(var i=0;i<=n;i++){ var dd=m.startPos+(9-m.startPos)*i/n, pt=posAt(dd); d+=(i?'L':'M')+pt.x.toFixed(2)+' '+pt.y.toFixed(2)+' '; }
      win.setAttribute('d',d); win.setAttribute('opacity','0.9');
      var sp=posAt(m.startPos); startSq.setAttribute('x',sp.x-8*k); startSq.setAttribute('y',sp.y-8*k); startSq.setAttribute('opacity','1');
      var mid=posAt((m.startPos+9)/2), mn=normalAt((m.startPos+9)/2);
      seg.setAttribute('x',mid.x+mn.x*34*k); seg.setAttribute('y',mid.y+mn.y*34*k); seg.setAttribute('font-size',15*k); seg.setAttribute('opacity','1'); seg.textContent=s.seg||''; }
    // 第3秒目标环 + 标签
    var b9=posAt(9); ring.setAttribute('cx',b9.x); ring.setAttribute('cy',b9.y);
    ringLbl.setAttribute('x',b9.x+16*k); ringLbl.setAttribute('y',b9.y-3*k); ringLbl.setAttribute('font-size',15*k); ringLbl.textContent='第3秒';
    ringLbl2.setAttribute('x',b9.x+16*k); ringLbl2.setAttribute('y',b9.y+14*k); ringLbl2.setAttribute('font-size',13*k); ringLbl2.textContent='第9格';
    placeBall(m.startPos); if(m.gap===0) placeBall(9);
    playBtn.textContent=H.playBtn;
    if(s.warn){ warn.setAttribute('x',b9.x); warn.setAttribute('y',b9.y-46*k); warn.setAttribute('font-size',16*k); warn.setAttribute('opacity','1'); warn.textContent=s.warn; }
    else warn.setAttribute('opacity','0');
    drawTicks(m,k); drawTimeAxis(m); renderCards(s); renderBody(s);
    animVB(vb);
    if(s.terminal) bottom.classList.add('show');
  }

  /* ---- 滚轮切换已按用户要求移除；仅保留档位按钮 / ± / 捏合 ---- */
  var lastWheel=0;
  // 手机双指捏合
  var pinchD=0;
  figWrap.addEventListener('touchmove',function(ev){ if(ev.touches.length!==2)return; ev.preventDefault();
    var d=Math.hypot(ev.touches[0].clientX-ev.touches[1].clientX, ev.touches[0].clientY-ev.touches[1].clientY);
    if(pinchD){ if(Date.now()-lastWheel>250){ if(d>pinchD*1.15){ lastWheel=Date.now(); go(Math.min(states.length-1,idx+1)); pinchD=d; } else if(d<pinchD*0.87){ lastWheel=Date.now(); go(Math.max(0,idx-1)); pinchD=d; } } } else pinchD=d;
  }, {passive:false});
  figWrap.addEventListener('touchend',function(){ pinchD=0; });

  var started=false;
  return {
    activate:function(){ if(!started){ started=true; go(0); } else render(); },
    deactivate:function(){ if(vbRAF)cancelAnimationFrame(vbRAF); if(playRAF)cancelAnimationFrame(playRAF); }
  };
};
})();
