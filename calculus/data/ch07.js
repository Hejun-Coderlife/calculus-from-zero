/* 第 7 章 · 导数——曲线在这一点有多陡  【骨架，待审核 ch06 后填充】
   冻结案例：y = x² 的曲线、割线、切线。不得替换为复杂现实案例。 */
window.CHAPTER = {
  id:'ch07', number:7, concept:'导数', stub:true,
  title:'导数', subtitle:'曲线在这一点有多陡',
  coreQuestion:'一条弯曲的线，在某一点到底有多陡？',
  prev:{ file:'ch06.html' },
  story:{ heading:'曲线在这一点，有多陡？',
    body:'上一章把「一小段」缩到极限，抓住了此刻速度。这一章，把同样这条曲线上那条越缩越贴的<b>割线</b>看清楚——它最后绷成的<b>切线</b>，就是这一点的陡度。' },
  experiment:{ kicker:'动手（待填）', heading:'割线缩成切线',
    intro:'（骨架占位）在 y = x² 上取一点，另找一点连一条割线，让它往这点靠。',
    figure:{ type:'placeholder', params:{ label:'割线 → 切线（y = x² 上一点，割线缩成切线）' } } },
  transition:{ toFile:'ch08.html', toTitle:'下一章：积分 →',
    teaser:'切线管的是「一点有多陡」；反过来，把无数小块加回来，又是另一件事。' },
  /* —— 冻结规格，供后续填充，勿改主题/案例 —— */
  spec:{
    coreCase:'y = x² 的曲线、割线、切线',
    mustNot:['不得替换为复杂现实案例'],
    plannedFigure:'shrink-secant：y=x² 上定点 P，动点 Q 沿曲线靠近 P，割线绷成切线；读出切线陡度',
    plannedFormula:'导数 ＝ 切线的陡度 ＝ 极限〔竖直变化 ÷ 水平变化〕，当水平变化→0（公式仅末页 FormulaReveal 出现）',
    plannedHistory:['fact: 费马求极值时已在用「相邻两点」思路','notation: 记号 dy/dx（莱布尼茨）、f′（拉格朗日）为后世所定']
  }
};
