/* 第6章 · 第4屏：一条真正的曲线（S 形弯道）。点按钮，小球变速跑完全程——
   谷底快、坡顶慢（像真实滚动）；已跑过的路径高亮；「此刻速度」进度条实时变化，
   末尾标 ? —— 能看到它一直在变，可这一刻到底多少？（正是下一章）。 */
(function(){
'use strict';
if(typeof window==='undefined') return;
var NS='http://www.w3.org/2000/svg';
function E(t,c,x){ var e=document.createElement(t); if(c)e.className=c; if(x!=null)e.innerHTML=x; return e; }
function S(t,a){ var e=document.createElementNS(NS,t); if(a)for(var k in a)e.setAttribute(k,a[k]); return e; }

window.CH6Track=function(mount,sc){
  var RM=(typeof matchMedia!=='undefined')&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  var CU='#b98a52', CTrail='#5e5ce6', CInk='#1d1d1f';

  mount.appendChild(E('div','kicker reveal',sc.kicker));
  mount.appendChild(E('div','q reveal',sc.heading));
  var body=E('div','copy reveal'); (sc.body||[]).forEach(function(t){ body.appendChild(E('p',null,t)); }); mount.appendChild(body);

  /* ---- 轨道 ---- */
  var VW=1000, VH=440, X0=60, X1=940;
  function yf(p){ return 220 - 96*Math.sin(p*Math.PI*2) - 42*Math.sin(p*Math.PI*4 + 0.9); }  // S 形 + 小起伏
  var N=180, yMin=1e9, yMax=-1e9, d='';
  for(var i=0;i<=N;i++){ var p=i/N, x=X0+(X1-X0)*p, y=yf(p); if(y<yMin)yMin=y; if(y>yMax)yMax=y; d+=(i?'L':'M')+x.toFixed(2)+' '+y.toFixed(2)+' '; }

  var fig=E('div','trackfig reveal');
  var svg=S('svg',{viewBox:'0 0 '+VW+' '+VH,class:'tracksvg'}); svg.setAttribute('preserveAspectRatio','xMidYMid meet'); fig.appendChild(svg);
  svg.appendChild(S('path',{d:d,fill:'none',stroke:CU,'stroke-width':11,'stroke-linecap':'round','stroke-linejoin':'round'}));
  var trail=S('path',{d:d,fill:'none',stroke:CTrail,'stroke-width':11,'stroke-linecap':'round','stroke-linejoin':'round'}); svg.appendChild(trail);
  var ball=S('circle',{r:15,fill:'#dfe0e6',stroke:'rgba(0,0,0,.2)','stroke-width':1.5}); svg.appendChild(ball);
  var gloss=S('circle',{r:5,fill:'rgba(255,255,255,.85)'}); svg.appendChild(gloss);
  mount.appendChild(fig);

  var L=0; try{ L=trail.getTotalLength()||0; }catch(e){}
  function ptAt(s){ if(L>0){ try{ return trail.getPointAtLength(Math.max(0,Math.min(L,s))); }catch(e){} } return {x:X0,y:yf(0)}; }
  function speed(y){ var n=(yMax>yMin)?(y-yMin)/(yMax-yMin):0.5; return 150+520*n; }   // 低处快、高处慢（px/s）
  function setTrail(s){ trail.setAttribute('stroke-dasharray', s.toFixed(1)+' '+(L+10)); }
  function setBall(s){ var q=ptAt(s); ball.setAttribute('cx',q.x); ball.setAttribute('cy',q.y-15); gloss.setAttribute('cx',q.x-4); gloss.setAttribute('cy',q.y-19); return q; }

  /* ---- 此刻速度 进度条 ---- */
  var gauge=E('div','tgauge reveal');
  gauge.appendChild(E('span','glabel',sc.gaugeLabel||'此刻速度'));
  var gbar=E('div','gbar'); var gfill=E('div','gfill'); gbar.appendChild(gfill); gauge.appendChild(gbar);
  gauge.appendChild(E('span','gq','？'));
  mount.appendChild(gauge);
  function setGauge(v){ var f=Math.max(0,Math.min(1,(v-150)/520)); gfill.style.width=(f*100).toFixed(0)+'%'; }

  /* ---- 按钮 + 下一章 ---- */
  var brow=E('div','btnrow reveal');
  var runBtn=E('button','trackbtn',sc.runBtn||'▶ 让小球跑一圈'); brow.appendChild(runBtn); mount.appendChild(brow);
  if(sc.note) mount.appendChild(E('div','tnote reveal',sc.note));
  var CH=window.CH6;
  if(CH&&CH.nav&&CH.nav.next){ var nrow=E('div','btnrow reveal');
    var nb=E('a','nextbtn',CH.nav.next.text); nb.href=CH.nav.next.href; nrow.appendChild(nb); mount.appendChild(nrow); }

  /* ---- 动画 ---- */
  var raf=null, last=null, s=0, running=false;
  function reset(){ s=0; setTrail(0); setBall(0); setGauge(speed(yf(0))); }
  function stop(){ running=false; if(raf){cancelAnimationFrame(raf);raf=null;} last=null; runBtn.textContent=sc.replayBtn||'↻ 再跑一次'; }
  function frame(ts){ if(last==null)last=ts||0; var dt=Math.min(0.05,((ts||0)-last)/1000); last=ts||0;
    var q=ptAt(s); var v=speed(q.y); s+=v*dt; setTrail(s); q=setBall(s); setGauge(speed(q.y));
    if(s>=L){ s=L; setTrail(L); stop(); return; }
    raf=requestAnimationFrame(frame); }
  function run(){ if(running)return; if(s>=L||s<=0){ reset(); } running=true; runBtn.textContent='奔跑中…';
    if(RM){ s=L; setTrail(L); var q=setBall(L); setGauge(speed(q.y)); stop(); return; }
    last=null; raf=requestAnimationFrame(frame); }
  runBtn.addEventListener('click',run);

  reset();                         // 初始定格：球在起点、进度条为起点速度
  return {
    activate:function(){ /* 不自动播放，等用户点按钮 */ },
    deactivate:function(){ if(raf){cancelAnimationFrame(raf);raf=null;} running=false; last=null; }
  };
};
})();
