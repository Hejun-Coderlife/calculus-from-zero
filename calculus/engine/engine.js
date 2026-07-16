/* ============================================================
   从 0 开始的微积分 · v2 章节渲染引擎（原生 JS，零构建）
   职责：读取 window.CHAPTER 数据，按固定 8 段结构渲染。
   内容/公式/历史/动画参数全部来自数据文件，引擎只负责渲染。
   可被 Node 加载（做 schema 校验），浏览器里自动渲染。
   ============================================================ */
(function(){
'use strict';

/* ---- 文案取值：现在是纯中文字符串；将来可换成 {zh,en} 而不改引擎 ---- */
var LANG='zh';
function T(v){ if(v==null) return ''; if(typeof v==='string') return v; return (v[LANG]!=null?v[LANG]:(v.zh!=null?v.zh:'')); }

/* ---- 固定 8 段职责（顺序不可变）---- */
var SECTIONS=['story','historicalProblem','experiment','observation','concept','formulaReveal','historicalNotes','transition'];
var HNOTE_LEVELS={fact:'史实',reconstruction:'情景还原',modern:'现代解释',notation:'后世记号'};

/* ---- 轻量 schema 校验（代替"类型检查"，供 Node 脚本调用）---- */
function validate(ch){
  var e=[];
  if(!ch||typeof ch!=='object') return ['CHAPTER 未定义或不是对象'];
  ['id','number','concept','title','coreQuestion'].forEach(function(k){ if(ch[k]==null) e.push('缺顶层字段: '+k); });
  var isStub=!!ch.stub;
  // 8 段：完整章要求都在；骨架章容许缺，但若存在必须结构合法
  if(!isStub){
    SECTIONS.forEach(function(s){ if(ch[s]==null) e.push('完整章缺段: '+s); });
  }
  if(ch.formulaReveal){
    if(ch.formulaReveal.steps && !Array.isArray(ch.formulaReveal.steps)) e.push('formulaReveal.steps 应为数组');
    (ch.formulaReveal.symbols||[]).forEach(function(s,i){ if(!s.sym) e.push('formulaReveal.symbols['+i+'] 缺 sym'); });
  }
  ((ch.historicalNotes&&ch.historicalNotes.notes)||[]).forEach(function(n,i){ if(!HNOTE_LEVELS[n.level]) e.push('historicalNotes.notes['+i+'].level 非法: '+n.level); });
  if(ch.transition && !isStub && !ch.transition.toFile) e.push('transition.toFile 缺失');
  // 防公式泄露：概念名/标题/副标题里不该混入 formulaReveal 的步骤原文
  if(ch.formulaReveal && ch.formulaReveal.steps){
    var leakZones=[T(ch.title),T(ch.subtitle),ch.concept&&ch.concept.name?T(ch.concept.name):''].join(' | ');
    ch.formulaReveal.steps.forEach(function(st){
      var plain=(T(st.html)||'').replace(/<[^>]+>/g,'').trim();
      if(plain.length>6 && leakZones.indexOf(plain)>=0) e.push('公式步骤疑似泄露到导航/概念区: '+plain.slice(0,20));
    });
  }
  return e;
}

/* 以下渲染部分仅浏览器执行；Node 里没有 document 就跳过 */
var HAS_DOM = (typeof document!=='undefined' && document.createElement);

function h(tag,cls,html){ var el=document.createElement(tag); if(cls)el.className=cls; if(html!=null)el.innerHTML=html; return el; }
function sec(type, nodes, opts){
  var s=h('section','section rv'+(opts&&opts.short?' short':''));
  s.setAttribute('data-sec',type);
  var w=h('div','wrap');
  (Array.isArray(nodes)?nodes:[nodes]).forEach(function(n){ if(n) w.appendChild(n); });
  s.appendChild(w); return s;
}

/* 当前页唯一的交互图实例（FormulaReveal 的符号高亮要找它）*/
var currentFig=null;

/* ---- 图形挂载：委托给 window.FIGURES[type] ---- */
function mountFigure(host, cfg){
  var reg=(typeof window!=='undefined' && window.FIGURES)||{};
  var factory=reg[cfg&&cfg.type]||reg.placeholder;
  if(!factory){ host.appendChild(h('div','fig placeholder','（占位图：未注册的图形类型 '+(cfg&&cfg.type)+'）')); return null; }
  return factory(host, (cfg&&cfg.params)||{});
}

/* ================= 8 段组件 ================= */

function ChapterHeader(ch){
  var nav=h('div','topnav');
  nav.appendChild(h('a','navbtn','← 目录')).setAttribute('href','../index.html');
  nav.appendChild(h('span','navctr','第 '+ch.number+' 章 · '+T(ch.concept)));
  var prev=h('a','navbtn','← 上一章'); prev.setAttribute('href',(ch.prev&&ch.prev.file)||'../index.html');
  nav.appendChild(prev);
  return nav;
}

function StoryOpening(d,ch){
  return sec('story',[
    h('div','kicker rv','第 '+ch.number+' 章 · '+T(ch.concept)),
    h('div','q rv', T(d.heading)||T(ch.coreQuestion)),
    d.body?h('div','sub rv',T(d.body)):null
  ]);
}
function HistoricalProblem(d){
  return sec('historicalProblem',[
    h('div','kicker hist rv', T(d.kicker)||'历史难题'),
    h('div','q rv', T(d.heading)),
    d.body?h('div','sub rv',T(d.body)):null,
    d.note?h('div','card amber rv',T(d.note)):null
  ]);
}
function InteractiveExperiment(d){
  var nodes=[
    h('div','kicker rv', T(d.kicker)||'动手试试'),
    h('div','q rv', T(d.heading)),
    d.intro?h('div','sub rv',T(d.intro)):null
  ];
  var figHost=h('div','fig rv');
  nodes.push(figHost);
  // 控件
  if(d.controls&&d.controls.length){
    var ctrl=h('div','ctrl rv');
    d.controls.forEach(function(c){
      ctrl.appendChild(h('label',null,T(c.label)));
      var inp=h('input'); inp.type='range'; inp.id=c.id;
      inp.min=c.min; inp.max=c.max; inp.value=c.value; inp.step=c.step||1;
      ctrl.appendChild(inp);
    });
    nodes.push(ctrl);
  }
  var readout=null;
  if(d.readout){ readout=h('div','readout rv'); readout.id=(d.readout.id||'readout'); nodes.push(readout); }
  var s=sec('experiment',nodes);
  // 图形延后挂载（等 DOM 进树）
  s.__mount=function(){ currentFig=mountFigure(figHost, d.figure); };
  return s;
}
function ObservationPrompt(d){
  var obs=h('div','obs rv');
  (d.points||[]).forEach(function(p){ obs.appendChild(h('div','op',T(p))); });
  return sec('observation',[
    h('div','kicker rv', T(d.kicker)||'看出什么了'),
    d.heading?h('div','q rv',T(d.heading)):null,
    obs,
    d.card?h('div','card rv',T(d.card)):null
  ]);
}
function ConceptReveal(d){
  // 揭示概念的"名字"，但绝不出现正式公式
  return sec('concept',[
    h('div','kicker rv', T(d.kicker)||'它有个名字'),
    h('div','q rv', T(d.name)),
    d.body?h('div','sub rv',T(d.body)):null
  ]);
}

/* ---- FormulaReveal：默认锁住，末尾才揭晓，分步显示，符号联动动画 ---- */
function FormulaReveal(d){
  var box=h('div','formula-box locked rv');
  if(d.lead) box.appendChild(h('div','sub',T(d.lead)));
  var stepsWrap=h('div'); box.appendChild(stepsWrap);
  var steps=(d.steps||[]).map(function(st){ var e=h('div','fstep',T(st.html)); stepsWrap.appendChild(e); return e; });
  var btn=h('button','reveal-btn','▶ 揭开公式');
  box.appendChild(btn);
  var shown=-1;
  function reveal(){
    shown++;
    if(shown===0){ box.classList.remove('locked'); }
    if(steps[shown]) steps[shown].classList.add('on');
    if(shown>=steps.length-1){ btn.style.display='none'; if(d.caption) box.appendChild(h('div','sub',T(d.caption))); wireSymbols(box); }
    else { btn.textContent='下一步 ▾'; }
  }
  btn.addEventListener('click',reveal);
  return sec('formulaReveal',[
    h('div','kicker rv', T(d.kicker)||'现在，上公式'),
    box
  ]);
}
/* 符号 ↔ 动画对象联动：<span class="sym" data-ref="dist">…</span> */
function wireSymbols(box){
  box.querySelectorAll('.sym').forEach(function(sp){
    var ref=sp.getAttribute('data-ref');
    function on(){ sp.classList.add('hot'); if(currentFig&&currentFig.highlight)currentFig.highlight(ref,true); }
    function off(){ sp.classList.remove('hot'); if(currentFig&&currentFig.highlight)currentFig.highlight(ref,false); }
    sp.addEventListener('mouseenter',on); sp.addEventListener('mouseleave',off);
    sp.addEventListener('click',function(){ on(); setTimeout(off,900); });
  });
}

function HistoricalNote(d){
  var list=h('div','histnotes rv');
  (d.notes||[]).forEach(function(n){
    var el=h('div','hnote '+n.level);
    el.innerHTML='<span class="tag">'+(HNOTE_LEVELS[n.level]||n.level)+'</span>'+T(n.text)+
      (n.source?' <span class="src">（'+T(n.source)+'）</span>':'');
    list.appendChild(el);
  });
  return sec('historicalNotes',[
    h('div','kicker hist rv', T(d.kicker)||'历史 · 分清哪些是真的'),
    d.heading?h('div','q rv',T(d.heading)):null,
    list
  ],{short:true});
}
function ChapterTransition(d){
  var nodes=[ d.teaser?h('div','teaser rv','“'+T(d.teaser)+'”'):null ];
  if(d.toFile){ var a=h('a','nextbtn rv', T(d.toTitle)||'下一章 →'); a.setAttribute('href',d.toFile); nodes.push(a); }
  return sec('transition',nodes,{short:true});
}

var BUILDERS={
  story:StoryOpening, historicalProblem:HistoricalProblem, experiment:InteractiveExperiment,
  observation:ObservationPrompt, concept:ConceptReveal, formulaReveal:FormulaReveal,
  historicalNotes:HistoricalNote, transition:ChapterTransition
};

function render(ch, root){
  if(!HAS_DOM||!root) return;
  var errs=validate(ch);
  if(errs.length) console.warn('[chapter '+ch.id+'] schema 警告:\n - '+errs.join('\n - '));
  document.documentElement.lang=LANG;
  document.title=T(ch.title)+' — 从 0 开始的微积分';
  root.appendChild(ChapterHeader(ch));
  if(ch.stub) root.appendChild(sec('stub',h('div','stub','🚧 骨架占位 · 内容待填（本章仅验证结构与布局）'),{short:true}));
  var mounts=[];
  SECTIONS.forEach(function(name){
    var d=ch[name]; if(d==null) return;
    var node=BUILDERS[name](d,ch);
    root.appendChild(node);
    if(node.__mount) mounts.push(node.__mount);
  });
  mounts.forEach(function(fn){ fn(); });         // 图形在进树后挂载
  setupReveal(root);
}

function setupReveal(root){
  var els=root.querySelectorAll('.rv');
  if(!('IntersectionObserver' in window)){ els.forEach(function(e){e.classList.add('in');}); return; }
  var io=new IntersectionObserver(function(en){ en.forEach(function(e){ if(e.isIntersecting) e.target.classList.add('in'); }); },{threshold:.12});
  els.forEach(function(e){ io.observe(e); });
}

/* 对外接口 */
var API={ validate:validate, render:render, setLang:function(l){LANG=l;}, SECTIONS:SECTIONS };
if(typeof window!=='undefined') window.ChapterEngine=API;
if(typeof module!=='undefined' && module.exports) module.exports=API;

/* 浏览器：自动渲染 */
if(HAS_DOM && document.addEventListener){
  document.addEventListener('DOMContentLoaded',function(){
    var root=document.getElementById('app');
    if(root && window.CHAPTER) render(window.CHAPTER, root);
  });
}
})();
