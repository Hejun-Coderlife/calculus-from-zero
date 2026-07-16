/* ============================================================
   图形注册表：window.FIGURES[type](host, params) → { highlight, draw }
   引擎按数据里的 figure.type 挂载。动画参数全来自数据。
   ============================================================ */
(function(){
'use strict';
if(typeof window==='undefined') return;
window.FIGURES = window.FIGURES || {};

/* ---- 占位图：骨架章用，只验证布局 ---- */
window.FIGURES.placeholder = function(host, params){
  var box=document.createElement('div');
  box.className='fig placeholder';
  box.textContent=(params&&params.label)||'占位动画（布局验证用）';
  host.appendChild(box);
  return { highlight:function(){}, draw:function(){} };
};

/* ---- 缩到极限：现代简化位置模型 s = t×t，缩小时间段看平均速度逼近此刻速度 ----
   params: { t0, gapId, outId }   —— 与数据里的控件/读数 id 对应              */
window.FIGURES.shrinkSpeed = function(host, params){
  var t0=(params&&params.t0)||1.60;
  var gapId=(params&&params.gapId)||'shrinkGap';
  var outId=(params&&params.outId)||'shrinkOut';
  var cv=document.createElement('canvas'); host.appendChild(cv);
  var hot=null;
  function dpr(){ return Math.min(window.devicePixelRatio||1,2); }
  function dot(ctx,x,y,c){ ctx.fillStyle='#fff';ctx.strokeStyle=c;ctx.lineWidth=2.4;ctx.beginPath();ctx.arc(x,y,5.5,0,Math.PI*2);ctx.fill();ctx.stroke(); }
  function draw(){
    var cssW=cv.clientWidth||600, cssH=360, r=dpr();
    cv.width=cssW*r; cv.height=cssH*r; cv.style.height=cssH+'px';
    var ctx=cv.getContext('2d'); ctx.setTransform(r,0,0,r,0,0); ctx.clearRect(0,0,cssW,cssH);
    var slider=document.getElementById(gapId);
    var gap = slider ? (+slider.value/100) : 0.60; if(gap<0.01) gap=0.01;
    var tmax=3.0, smax=tmax*tmax, W=cssW, H=cssH;
    var X0=54,X1=W-20,Ytop=22,Ybot=H-40;
    var px=function(t){ return X0+(X1-X0)*(t/tmax); };
    var py=function(s){ return Ybot-(Ybot-Ytop)*(s/smax); };
    // 轴
    ctx.strokeStyle='rgba(0,0,0,.16)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(X0,Ytop);ctx.lineTo(X0,Ybot);ctx.lineTo(X1,Ybot);ctx.stroke();
    ctx.fillStyle='#86868b';ctx.font='500 12px sans-serif';
    ctx.textAlign='left';ctx.textBaseline='top';ctx.fillText('走的距离 ↑',X0+4,Ytop-2);
    ctx.textAlign='right';ctx.textBaseline='bottom';ctx.fillText('时间 →',X1,Ybot+18);
    // 曲线 s = t×t（现代简化模型）
    ctx.strokeStyle='#0071e3';ctx.lineWidth=3;ctx.beginPath();
    for(var i=0;i<=120;i++){ var t=tmax*i/120,X=px(t),Y=py(t*t); i?ctx.lineTo(X,Y):ctx.moveTo(X,Y); }
    ctx.stroke();
    var t1=t0, t2=t0+gap;
    var Px=px(t1),Py=py(t1*t1),Qx=px(t2),Qy=py(t2*t2);
    var timeHot=(hot==='time'),distHot=(hot==='dist'),avgHot=(hot==='avg');
    // Δt 水平
    ctx.strokeStyle=timeHot?'#e0900a':'rgba(0,0,0,.4)';ctx.lineWidth=timeHot?3.4:1.6;
    ctx.beginPath();ctx.moveTo(Px,Qy);ctx.lineTo(Qx,Qy);ctx.stroke();
    if(timeHot){ctx.fillStyle='#c47f00';ctx.font='700 12px sans-serif';ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('用的时间',(Px+Qx)/2,Qy+4);}
    // Δs 垂直
    ctx.strokeStyle=distHot?'#e0900a':'rgba(0,0,0,.4)';ctx.lineWidth=distHot?3.4:1.6;
    ctx.beginPath();ctx.moveTo(Px,Py);ctx.lineTo(Px,Qy);ctx.stroke();
    if(distHot){ctx.save();ctx.fillStyle='#c47f00';ctx.font='700 12px sans-serif';ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText('走的距离',Px-6,(Py+Qy)/2);ctx.restore();}
    // 割线（平均速度 = 陡度）
    ctx.strokeStyle=avgHot?'#e0900a':'#c47f00';ctx.lineWidth=avgHot?3.6:2.4;
    ctx.beginPath();ctx.moveTo(Px,Py);ctx.lineTo(Qx,Qy);ctx.stroke();
    dot(ctx,Qx,Qy,'#c47f00'); dot(ctx,Px,Py,'#0071e3');
    ctx.fillStyle='#0071e3';ctx.font='700 11.5px sans-serif';ctx.textAlign='left';ctx.textBaseline='bottom';ctx.fillText('第 '+t1.toFixed(2)+' 份',Px+8,Py-4);
    // 读数（数字自洽：Δs 4 位、Δt 2 位、平均=两时间之和）
    var out=document.getElementById(outId);
    if(out){
      var ds=(t2*t2-t1*t1), dt=gap, avg=(t1+t2), near=gap<=0.05;
      out.innerHTML='平均速度 ＝ <span class="frac"><span class="num">走的距离 '+(+ds.toFixed(4))+'</span><span class="den">用的时间 '+(+dt.toFixed(2))+'</span></span> ＝ <b class="bl">'+avg.toFixed(2)+'</b>'+
        (near?' <span style="color:#c47f00;font-weight:700">— 缩到几乎一点，逼近此刻速度 '+(2*t1).toFixed(2)+'</span>':'');
    }
  }
  var slider=document.getElementById(gapId);
  if(slider) slider.addEventListener('input',function(){ requestAnimationFrame(draw); });
  window.addEventListener('resize',function(){ requestAnimationFrame(draw); });
  requestAnimationFrame(draw);
  return {
    highlight:function(ref,on){ hot=on?ref:null; requestAnimationFrame(draw); },
    draw:draw
  };
};
})();
