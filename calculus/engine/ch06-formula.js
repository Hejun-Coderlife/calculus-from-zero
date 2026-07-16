/* 第6章 · 第3屏：一张"速查表"——①先回顾平均速度 → ②极限的想法 → ③公式记法，
   底部一条历史带（伽利略 + 牛顿肖像）。全部 HTML + 一个小数轴 SVG。
   文案来自 scene.rows / scene.legend / scene.history；本文件只负责排版。 */
(function(){
'use strict';
if(typeof window==='undefined') return;
var NS='http://www.w3.org/2000/svg';
function E(t,c,x){ var e=document.createElement(t); if(c)e.className=c; if(x!=null)e.innerHTML=x; return e; }
function S(t,a){ var e=document.createElementNS(NS,t); if(a)for(var k in a)e.setAttribute(k,a[k]); return e; }

window.CH6Formula=function(mount,sc){
  var Cv='#0071e3',Clim='#5e5ce6',Cs='#16a34a',Cdt='#e11d63',Cink='#1d1d1f';
  function col(c,t){ return '<span style="color:'+c+'">'+t+'</span>'; }
  function frac(n,d){ return '<span class="frac2"><span class="fnum2">'+n+'</span><span class="fden2">'+d+'</span></span>'; }
  var EQ='<span class="eqs">＝</span>';

  mount.appendChild(E('div','kicker reveal',sc.kicker));
  mount.appendChild(E('div','q reveal',sc.heading));

  var rows=sc.rows||[];
  function badge(n,tag){ return '<span class="fsnum">'+n+'</span><span class="fstag">'+(tag||'')+'</span>'; }

  var sheet=E('div','fsheet reveal');

  /* ① 先回顾：平均速度 */
  var r1=E('div','fsrow r-blue');
  r1.appendChild(E('div','fscell tagcell',badge(1,rows[0]&&rows[0].tag)));
  r1.appendChild(E('div','fscell mid','平均速度'+EQ+frac(col(Cs,'走的距离'),col(Cv,'用的时间'))));
  r1.appendChild(E('div','fscell sym','<span class="vbar">v</span>'+EQ+frac(col(Cs,'Δs'),col(Cdt,'Δt'))));
  sheet.appendChild(r1);

  /* ② 极限的想法 */
  var r2=E('div','fsrow r-green');
  r2.appendChild(E('div','fscell tagcell',badge(2,rows[1]&&rows[1].tag)));
  var w2=(rows[1]&&rows[1].words)||'';
  w2=w2.replace('缩到 0','<b>缩到 0</b>').replace('极限','<b>极限</b>');
  r2.appendChild(E('div','fscell mid',w2));
  var nl=numberline();
  var s2=E('div','fscell sym'); s2.appendChild(nl.el); r2.appendChild(s2);
  sheet.appendChild(r2);

  /* ③ 公式（记法）＋ 逐符号注释 */
  var r3=E('div','fsrow r-amber');
  r3.appendChild(E('div','fscell tagcell',badge(3,rows[2]&&rows[2].tag)));
  var box=E('div','fscell bigf');
  box.appendChild(E('div','bigfeq',
    col(Cv,'v')+EQ+'<span class="lim" style="color:'+Clim+'">lim<span class="lsub">'+col(Cdt,'Δt')+' → 0</span></span>'+
    frac(col(Cs,'Δs'),col(Cdt,'Δt'))));
  var COLK={blue:Cv,indigo:Clim,green:Cs,pink:Cdt,amber:'#c8860a'};
  var ann=E('div','fann');
  ((rows[2]&&rows[2].ann)||[]).forEach(function(a){
    ann.appendChild(E('span','fchip','<b style="color:'+(COLK[a.c]||Cink)+'">'+a.s+'</b>'+a.t)); });
  box.appendChild(ann);
  r3.appendChild(box);
  sheet.appendChild(r3);

  mount.appendChild(sheet);

  /* 历史带 */
  if(sc.history){
    var hb=E('div','histband reveal');
    hb.appendChild(E('div','histicon','⏳'));
    var ht=E('div','histtext'); (sc.history.text||[]).forEach(function(t){ ht.appendChild(E('p',null,t)); }); hb.appendChild(ht);
    var pix=E('div','histpix');
    (sc.history.people||[]).forEach(function(pp){
      var fig=E('figure','hfig');
      var im=document.createElement('img'); im.src=pp.img; im.alt=pp.name; im.loading='lazy'; im.width=78; im.height=98;
      fig.appendChild(im);
      fig.appendChild(E('figcaption',null,'<b>'+pp.name+'</b><span class="hyr">'+pp.years+'</span>'));
      pix.appendChild(fig);
    });
    hb.appendChild(pix);
    mount.appendChild(hb);
  }

  var RM=(typeof matchMedia!=='undefined')&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  var raf=null,t0=null;
  function frame(ts){ if(t0==null)t0=ts||0;
    var T=(((ts||0)-t0)/1000)%3.4, u;
    if(T<2.3){ var k=T/2.3; u=1-(k<0.5?2*k*k:1-Math.pow(-2*k+2,2)/2); } else u=0;   // 缩 2.3s → 定 1.1s → 循环
    nl.set(u); raf=requestAnimationFrame(frame); }
  return {
    activate:function(){ if(RM){ nl.set(0.16); return; } if(raf)cancelAnimationFrame(raf); t0=null; raf=requestAnimationFrame(frame); },
    deactivate:function(){ if(raf){ cancelAnimationFrame(raf); raf=null; } }
  };

  /* 会动的收缩数轴：t+Δt 滑向 t、绿色 Δt 段缩到 0；到点时 t 处脉冲。set(u)：u=1 最长，u=0 收拢 */
  function numberline(){
    var wrap=E('div','nlwrap');
    var svg=S('svg',{viewBox:'0 0 240 104',class:'nlsvg'});
    var xt=58, xFar=208, span=xFar-xt, y=62, Cn='#16a34a', Ci='#5e5ce6';
    svg.appendChild(S('line',{x1:22,y1:y,x2:226,y2:y,stroke:'#c9ccd2','stroke-width':2}));
    [0.66,0.42,0.22].forEach(function(g){ svg.appendChild(S('circle',{cx:xt+span*g,cy:y,r:3,fill:Cn,opacity:0.16})); });  // 经过轨迹
    var seg=S('line',{x1:xt,y1:y,x2:xFar,y2:y,stroke:Cn,'stroke-width':4,'stroke-linecap':'round'}); svg.appendChild(seg);
    svg.appendChild(S('circle',{cx:xt,cy:y,r:5,fill:Cink}));                       // t（目标时刻）
    var tp=S('circle',{cx:xt,cy:y,r:5,fill:'none',stroke:Ci,'stroke-width':2,opacity:0}); svg.appendChild(tp);   // 到达脉冲
    var lt=S('text',{x:xt,y:y+22,'font-size':14,fill:Cink,'text-anchor':'middle','font-style':'italic','font-family':'Georgia,serif'}); lt.textContent='t'; svg.appendChild(lt);
    var td=S('circle',{cx:xFar,cy:y,r:5,fill:Cn}); svg.appendChild(td);            // t+Δt（移动）
    var ltd=S('text',{x:xFar,y:y+22,'font-size':13,fill:Cink,'text-anchor':'middle','font-style':'italic','font-family':'Georgia,serif'}); ltd.textContent='t + Δt'; svg.appendChild(ltd);
    var cap=S('text',{x:(xt+xFar)/2,y:24,'font-size':13,fill:Cn,'text-anchor':'middle','font-weight':700}); cap.textContent='Δt → 0'; svg.appendChild(cap);
    svg.appendChild(S('line',{x1:xFar-8,y1:38,x2:xt+18,y2:38,stroke:Cn,'stroke-width':1.5}));
    svg.appendChild(S('polygon',{points:(xt+18)+',38 '+(xt+27)+',34.5 '+(xt+27)+',41.5',fill:Cn}));
    wrap.appendChild(svg);
    function set(u){ var x=xt+span*u;
      td.setAttribute('cx',x); seg.setAttribute('x2',x); ltd.setAttribute('x',x);
      ltd.setAttribute('opacity', u<0.08?0:1);
      var pk=(u<0.06)?(1-u/0.06):0; tp.setAttribute('opacity',pk.toFixed(2)); tp.setAttribute('r',(5+pk*7).toFixed(1)); }
    return { el:wrap, set:set };
  }
};
})();
