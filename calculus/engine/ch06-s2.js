/* 第6章 · 第2屏：缩小观察区间，看平均速度逼近 6（左弯道局部放大 + 右档位面板）
   延续第1屏的弯道；仅渲染/交互，文字数据全来自 scene。 */
(function(){
'use strict';
if(typeof window==='undefined') return;
var NS='http://www.w3.org/2000/svg';
function E(t,c,x){ var e=document.createElement(t); if(c)e.className=c; if(x!=null)e.innerHTML=x; return e; }
function S(t,a){ var e=document.createElementNS(NS,t); if(a)for(var k in a)e.setAttribute(k,a[k]); return e; }
var VW=1000,VH=560,X0=70,X1=930,TOPY=70,BOTY=470;
function cxp(p){ return X0+(X1-X0)*p; }
function cyp(p){ return TOPY+(BOTY-TOPY)*(1-Math.pow(2*p-1,2)); }
function pathD(a,b){ var d=''; for(var i=0;i<=80;i++){ var p=a+(b-a)*i/80; d+=(i?'L':'M')+cxp(p).toFixed(2)+' '+cyp(p).toFixed(2)+' '; } return d; }
function startPosOf(g){ return (3-g)*(3-g); }
function niceStep(x){ if(x<=0)return 1; var e=Math.pow(10,Math.floor(Math.log10(x))); var f=x/e; var n=f>=5?5:(f>=2?2:1); return n*e; }

window.CH6Shrink=function(mount,sc){
  var RM=(typeof matchMedia!=='undefined')&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  var CT='#0071e3',CD='#17a34a',CS='#5e5ce6',SIX='#0071e3';
  var states=sc.states||[], idx=0;
  function emph(t){ return t.replace(/([^0-9.]|^)6([^0-9.]|$)/g,'$1<b style="color:'+SIX+';font-weight:800">6</b>$2'); }

  mount.appendChild(E('div','kicker reveal',sc.kicker));
  mount.appendChild(E('div','q reveal',sc.heading));
  if(sc.subline){ mount.appendChild(E('div','s2sub reveal', sc.subline.replace(/极限/g,'<b style="color:#5e5ce6;font-weight:800;font-size:1.08em">极限</b>'))); }
  /* 正文按用户要求去掉，不渲染 sc.body */

  /* 左图 + 右面板 */
  var row=E('div','s2row reveal'); mount.appendChild(row);
  var figWrap=E('div','s2fig'); row.appendChild(figWrap);
  var panelBox=E('div','s2panel'); row.appendChild(panelBox);

  var svg=S('svg',{viewBox:'0 0 '+VW+' '+VH,class:'herosvg'}); svg.setAttribute('preserveAspectRatio','xMidYMid meet'); figWrap.appendChild(svg);
  svg.appendChild(S('rect',{x:0,y:500,width:VW,height:VH-500,fill:'#eceef2'}));
  var futurePath=S('path',{d:pathD(0.5,1),fill:'none',stroke:'#b98a52','stroke-width':11,'stroke-linecap':'round',opacity:0.22}); svg.appendChild(futurePath);
  var track=S('path',{d:pathD(0,0.5),fill:'none',stroke:'#b98a52','stroke-width':11,'stroke-linecap':'round'}); svg.appendChild(track);
  var gTicks=S('g'); svg.appendChild(gTicks);
  var win=S('path',{d:'',fill:'none',stroke:CD,'stroke-width':11,'stroke-linecap':'round',opacity:0.9}); svg.appendChild(win);
  var seg=S('text',{fill:CD,'font-weight':700,'text-anchor':'middle'}); svg.appendChild(seg);
  var startLbl=S('text',{fill:CD,'font-weight':700,'text-anchor':'middle'}); svg.appendChild(startLbl);
  var startSq=S('rect',{fill:CD,rx:2}); svg.appendChild(startSq);
  var ring=S('circle',{fill:'none',stroke:'#1d1d1f'}); svg.appendChild(ring);
  var ringLbl=S('text',{fill:CT,'font-weight':700,'text-anchor':'start'}); svg.appendChild(ringLbl);
  var ringLbl2=S('text',{fill:CD,'font-weight':700,'text-anchor':'start'}); svg.appendChild(ringLbl2);
  var ball=S('circle',{fill:'#c9c9d2',stroke:'rgba(0,0,0,.18)'}); svg.appendChild(ball);
  var L=0; try{ L=track.getTotalLength()||0; }catch(e){}
  function posAt(d){ if(L>0){ try{ var pt=track.getPointAtLength(Math.max(0,Math.min(9,d))/9*L); return {x:pt.x,y:pt.y}; }catch(e){} } var p=Math.max(0,Math.min(0.5,d/18)); return {x:cxp(p),y:cyp(p)}; }
  function normalAt(d){ var a=posAt(d-0.02),b=posAt(d+0.02); var dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1; return {x:-dy/l,y:dx/l}; }

  /* 右面板：档位按钮 + 卡片 */
  var btns=E('div','statebtns');
  var btnEls=states.map(function(st,i){ var b=E('button','statebtn'+(st.terminal?' limit':''),st.btn); b.addEventListener('click',function(){ go(i); }); btns.appendChild(b); return b; });
  panelBox.appendChild(btns);
  var card=E('div','s2card'); panelBox.appendChild(card);

  var aux=E('div','reveal aux2'); (sc.aux||[]).forEach(function(t){ aux.appendChild(E('p',null,t)); }); panelBox.appendChild(aux);

  /* viewBox 局部放大 */
  var curVB=[0,0,VW,VH], vbRAF=null;
  function targetVB(sp){ var b=posAt(9),a=posAt(sp),sx=Math.abs(b.x-a.x),sy=Math.abs(b.y-a.y);
    var w=Math.max(sx*2.4,sy*2.4*(VW/VH),150), h=w*(VH/VW); return [b.x-w/2,b.y-h/2,w,h]; }
  function setVB(v){ svg.setAttribute('viewBox',v.map(function(n){return n.toFixed(1);}).join(' ')); curVB=v; }
  function animVB(to){ if(RM){ setVB(to); return; } if(vbRAF)cancelAnimationFrame(vbRAF); var from=curVB.slice(),t0=null;
    function stp(now){ if(t0==null)t0=now; var k=Math.min(1,(now-t0)/430); var e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2; setVB(from.map(function(f,i){return f+(to[i]-f)*e;})); if(k<1)vbRAF=requestAnimationFrame(stp); } vbRAF=requestAnimationFrame(stp); }

  function drawTicks(sp,k){ while(gTicks.firstChild)gTicks.removeChild(gTicks.firstChild);
    var span=9-sp, step=niceStep(span/6), minor=step/5, lo=Math.max(0,Math.floor(sp/step)*step);
    for(var d=lo;d<=9+1e-9;d+=minor){ var isMaj=Math.abs(d/step-Math.round(d/step))<1e-6, pt=posAt(d),nn=normalAt(d),len=(isMaj?12:6)*k;
      gTicks.appendChild(S('line',{x1:pt.x-nn.x*len,y1:pt.y-nn.y*len,x2:pt.x+nn.x*len,y2:pt.y+nn.y*len,stroke:'rgba(0,0,0,.4)','stroke-width':(isMaj?1.6:1)*k}));
      if(isMaj){ var lx=pt.x+nn.x*(len+10*k),ly=pt.y+nn.y*(len+10*k),lbl=(step>=1?String(Math.round(d)):String(+d.toFixed(6)));
        gTicks.appendChild(S('text',{x:lx,y:ly,'font-size':12.5*k,fill:CD,'text-anchor':'middle','dominant-baseline':'middle'})).textContent=lbl+'格'; } }
  }
  function colorFor(key){ if(key.indexOf('时间')>=0)return CT; if(key.indexOf('速度')>=0)return CS;
    if(key.indexOf('位置')>=0||key.indexOf('走了')>=0||key.indexOf('格')>=0)return CD; return CT; }
  function renderCard(st){
    card.innerHTML=''; card.appendChild(E('div','cardsub',st.title));
    if(st.terminal){ card.appendChild(E('div','s2seq',st.seq)); card.appendChild(E('div','s2approach',emph(st.approach))); }
    else{ (st.rows||[]).forEach(function(r){ var d=E('div','drow'); d.appendChild(E('span','dk',r[0])); var v=E('span','dv',r[1]); v.style.color=colorFor(r[0]); d.appendChild(v); card.appendChild(d); }); }
    var nb=E('div','s2note'); (st.note||[]).forEach(function(t){ nb.appendChild(E('p',null,emph(t))); }); card.appendChild(nb);
  }

  function go(i){ idx=i; render(); }
  function render(){
    var st=states[idx];
    var sp=(st.gap>0)?startPosOf(st.gap):0;     // 结论态：全景（0..9），不深缩、不显示高亮段
    var vb=targetVB(sp), k=vb[2]/VW;
    btnEls.forEach(function(b,i){ b.classList.toggle('on',i===idx); });
    track.setAttribute('stroke-width',11*k); futurePath.setAttribute('stroke-width',11*k); win.setAttribute('stroke-width',11*k);
    ring.setAttribute('r',11*k); ring.setAttribute('stroke-width',3*k);
    ball.setAttribute('r',11*k); ball.setAttribute('stroke-width',1*k);
    startSq.setAttribute('width',16*k); startSq.setAttribute('height',16*k); startSq.setAttribute('rx',2.5*k);
    // 高亮段
    var d=''; if(!st.terminal){ for(var i=0,n=44;i<=n;i++){ var dd=sp+(9-sp)*i/n, pt=posAt(dd); d+=(i?'L':'M')+pt.x.toFixed(2)+' '+pt.y.toFixed(2)+' '; } }
    win.setAttribute('d',d); win.setAttribute('opacity', st.terminal?0:0.9);
    var ps=posAt(sp), pn=normalAt(sp);
    startSq.setAttribute('x',ps.x-8*k); startSq.setAttribute('y',ps.y-8*k); startSq.setAttribute('opacity', st.terminal?'0':'1');
    startLbl.setAttribute('x',ps.x-pn.x*22*k); startLbl.setAttribute('y',ps.y-pn.y*22*k); startLbl.setAttribute('font-size',13*k);
    startLbl.setAttribute('opacity', st.terminal?'0':'1'); startLbl.textContent = (st.rows?st.rows[1][1]:'');   // 起点第X格
    var mid=posAt((sp+9)/2),mn=normalAt((sp+9)/2);
    seg.setAttribute('x',mid.x+mn.x*34*k); seg.setAttribute('y',mid.y+mn.y*34*k); seg.setAttribute('font-size',15*k);
    seg.setAttribute('opacity', st.terminal?'0':'1'); seg.textContent = st.terminal?'':('本段走了'+(st.rows?st.rows[3][1]:''));
    // 第3秒 / 第9格 目标环 + 固定小球
    var b9=posAt(9); ring.setAttribute('cx',b9.x); ring.setAttribute('cy',b9.y);
    ringLbl.setAttribute('x',b9.x+16*k); ringLbl.setAttribute('y',b9.y-3*k); ringLbl.setAttribute('font-size',15*k); ringLbl.textContent='第3秒';
    ringLbl2.setAttribute('x',b9.x+16*k); ringLbl2.setAttribute('y',b9.y+14*k); ringLbl2.setAttribute('font-size',13*k); ringLbl2.textContent='第9格';
    ball.setAttribute('cx',b9.x); ball.setAttribute('cy',b9.y-11*k);
    drawTicks(sp,k); renderCard(st); animVB(vb);
  }

  var started=false;
  return { activate:function(){ if(!started){ started=true; go(0); } else render(); }, deactivate:function(){ if(vbRAF)cancelAnimationFrame(vbRAF); } };
};
})();
