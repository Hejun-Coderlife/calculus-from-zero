/* 第 10 章 · 神奇的 e——自己长得和自己一样快  【骨架，待审核 ch06 后填充】
   冻结案例：连续复利为核心。细菌/人口只作补充，并注明指数增长只在特定条件下近似成立。 */
window.CHAPTER = {
  id:'ch10', number:10, concept:'常数 e', stub:true,
  title:'神奇的 e', subtitle:'自己长得和自己一样快',
  coreQuestion:'有没有一种增长，它此刻的速度正好等于它此刻的大小？',
  prev:{ file:'ch09.html' },
  story:{ heading:'长得和自己一样快',
    body:'钱越多、利越多，利又变成钱……如果利息<b>时时刻刻</b>都在滚，会滚出什么？答案里藏着一个绕不开的数：e ≈ 2.71828。它描述的，是一种「此刻多大，就以多快长」的增长。' },
  experiment:{ kicker:'动手（待填）', heading:'把复利结算得越来越勤',
    intro:'（骨架占位）同样年利，一年结一次 → 每月 → 每天 → 时时刻刻；结算越勤，年底越多，但会顶到一个上限 e。',
    figure:{ type:'placeholder', params:{ label:'连续复利：结算越来越勤，逼近 e' } } },
  transition:{ toFile:'ch11.html', toTitle:'下一章：链式法则 →',
    teaser:'现实里的变化常常是「一环套一环」——最后一章把它们连起来算。' },
  spec:{
    coreCase:'连续复利（核心）',
    supplement:'细菌繁殖、人口增长仅作补充，且必须注明：指数增长只在资源无限等特定条件下近似成立',
    core:'e 的增长，此刻速度 ＝ 此刻大小',
    plannedFigure:'compound：滑块调「一年结算几次」，年底本利和逼近 e',
    plannedFormula:'(1 + 1/n)ⁿ 当 n→∞ ＝ e；eˣ 的导数还是 eˣ（公式仅末页出现）',
    plannedHistory:['fact: 雅各布·伯努利研究复利时逼近了 e','notation: 记号 e 由欧拉确立','modern: 现实增长受限，纯指数只是理想模型']
  }
};
