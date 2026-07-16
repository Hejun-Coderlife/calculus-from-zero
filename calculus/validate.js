/* 开发期校验（网站运行不依赖）。 用法： node validate.js
   - ch07–11：通用 schema 校验；
   - ch06：施工稿 §19 专项校验 + DOM-mock 冒烟渲染。            */
'use strict';
const fs=require('fs'), path=require('path');
const D=__dirname;
function read(p){ return fs.readFileSync(path.join(D,p),'utf8'); }
function run(code, ctx){ return new Function(...Object.keys(ctx), code)(...Object.values(ctx)); }
let fail=0; const bad=m=>{ console.log('  ✗ '+m); fail++; };
const ok=m=>console.log('  ✓ '+m);

/* ===== 通用 schema（ch07–11） ===== */
const modA={exports:{}};
run(read('engine/engine.js'), {window:{}, document:undefined, module:modA, console});
const validate=modA.exports.validate;
console.log('== 通用 schema（ch07–11 骨架）==');
for(const f of ['ch07','ch08','ch09','ch10','ch11']){
  const win={}; run(read('data/'+f+'.js'), {window:win});
  const errs=validate(win.CHAPTER);
  errs.length ? bad(f+': '+errs.join('; ')) : ok(f+' · 骨架');
}

/* ===== 第6章专项（施工稿 §19） ===== */
console.log('\n== 第6章专项校验（§19）==');
const win6={}; run(read('data/ch06.js'), {window:win6});
const CH=win6.CH6;
if(!CH){ bad('data/ch06.js 未定义 window.CH6'); }
else{
  // 场景（现为 Hero + 2 屏：缩小 shrink、公式 formula）
  const ids=(CH.scenes||[]).map(s=>s.id+':'+s.anim).join(' ');
  (CH.scenes&&CH.scenes.length>=1) ? ok('场景数 = '+CH.scenes.length+'（'+ids+'）') : bad('无场景');
  // 禁用记号：h→0 / 导数公式（lim/Δt/s(t) 已按用户指令在公式屏引入，不再拦截）
  const whole=JSON.stringify(CH);
  const forbid=['h→0','导数公式'].filter(t=>whole.indexOf(t)>=0);
  forbid.length ? bad('出现禁用记号: '+forbid.join(' ')) : ok('无 h→0 / 导数公式（lim/Δt/s(t) 已按指令引入）');
  // 教学正文不得出现「导数」（「极限」已按指令引入）
  const leak=['导数'].filter(t=>whole.indexOf(t)>=0);
  leak.length ? bad('出现「导数」: '+leak.join(' ')) : ok('无「导数」（「极限」已按指令引入）');
  // 下一章链接
  (CH.nav&&CH.nav.next&&CH.nav.next.href==='ch07.html') ? ok('下一章链接 → ch07.html') : bad('下一章链接缺失/错误');
}

/* ===== 第6章 DOM-mock 冒烟渲染（§19.9） ===== */
console.log('\n== 第6章冒烟渲染 ==');
function ctxProxy(){ return new Proxy({}, {get:(t,p)=>{
  if(p==='measureText')return ()=>({width:20});
  if(p==='createRadialGradient'||p==='createLinearGradient')return ()=>({addColorStop(){}});
  if(p==='canvas')return {}; return ()=>{}; }, set:()=>true}); }
function mkEl(tag){ const e={ tagName:tag, className:'', id:'', style:{}, value:'0', type:'', min:0,max:0,step:1,
  _html:'', set innerHTML(v){this._html=v;}, get innerHTML(){return this._html;}, textContent:'', children:[],
  appendChild(c){this.children.push(c);return c;}, setAttribute(){}, setAttributeNS(){}, getAttribute(){return null;},
  removeChild(){}, firstChild:null, getTotalLength:()=>800, getPointAtLength:()=>({x:100,y:100}),
  addEventListener(){}, classList:{add(){},remove(){},toggle(){},contains(){return false;}},
  getContext:()=>ctxProxy(), clientWidth:600, clientHeight:320, width:0, height:0,
  getBoundingClientRect:()=>({left:0,top:0,width:600,height:320}), scrollIntoView(){},
  querySelector:()=>null, querySelectorAll:()=>[], nextElementSibling:null }; return e; }
const win={ devicePixelRatio:2, addEventListener(){}, };
win.matchMedia=()=>({matches:true, addEventListener(){}});         // RM=true：多数动画走静态分支
win.IntersectionObserver=function(cb){ this.observe=el=>cb([{isIntersecting:true,target:el}]); this.disconnect=()=>{}; };
const appEl=mkEl('div');
const doc={ createElement:mkEl, createElementNS:(ns,t)=>mkEl(t), getElementById:id=>id==='app'?appEl:null, body:mkEl('body'),
  querySelectorAll:()=>[], addEventListener(){}, title:'', readyState:'complete' };
win.document=doc;
const heroCtx={ window:win, document:doc, matchMedia:win.matchMedia, requestAnimationFrame:()=>0, cancelAnimationFrame:()=>{},
  setTimeout:()=>0, clearTimeout:()=>{}, Date, Math, console };
try{
  run(read('data/ch06.js'), {window:win});
  run(read('engine/ch06-hero.js'), heroCtx);
  run(read('engine/ch06-s2.js'), heroCtx);
  run(read('engine/ch06-formula.js'), heroCtx);
  run(read('engine/ch06-track.js'), heroCtx);
  run(read('engine/ch06.js'), { window:win, document:doc, matchMedia:win.matchMedia,
    IntersectionObserver:win.IntersectionObserver, requestAnimationFrame:()=>0, cancelAnimationFrame:()=>{},
    setTimeout:()=>0, setInterval:()=>0, clearInterval:()=>{}, clearTimeout:()=>{}, console, Math });
  const want=1+(win.CH6.scenes?win.CH6.scenes.length:0);   // Hero + 场景数
  ok('ch06 渲染无抛错 · 生成 '+appEl.children.length+' 个顶层节点（Hero + '+(want-1)+' 屏）');
  appEl.children.length===want ? ok('节点数 = '+want+'（Hero + '+(want-1)+' 屏）') : bad('节点数应为 '+want+'，实为 '+appEl.children.length);
}catch(e){ bad('ch06 渲染抛错: '+e.message); }

console.log('\n'+(fail?('❌ '+fail+' 项未通过'):'✅ 全部通过'));
process.exit(fail?1:0);
