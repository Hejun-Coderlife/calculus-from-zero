/* 第 8 章 · 怎么积分——把无数小块加回来  【骨架，待审核 ch06 后填充】
   冻结案例：不断变化的车速，通过越来越窄的矩形累积路程。核心＝速度-时间图面积。 */
window.CHAPTER = {
  id:'ch08', number:8, concept:'积分', stub:true,
  title:'怎么积分', subtitle:'把无数小块加回来',
  coreQuestion:'速度一直在变，一段时间到底走了多远？',
  prev:{ file:'ch07.html' },
  story:{ heading:'速度一直在变，走了多远？',
    body:'速度不是常数，就没法「速度 × 时间」一步算距离。办法：把时间切成很多小块，每小块当匀速、算一小段路，再<b>全部加起来</b>；块越切越窄，加出来越准。' },
  experiment:{ kicker:'动手（待填）', heading:'越来越窄的矩形',
    intro:'（骨架占位）速度-时间图下面塞满矩形，滑块让矩形越切越窄，看总面积逼近真实路程。',
    figure:{ type:'placeholder', params:{ label:'速度-时间图下越来越窄的矩形 · 面积＝路程' } } },
  transition:{ toFile:'ch09.html', toTitle:'下一章：基本定理 →',
    teaser:'求陡度（导数）和求面积（积分）看着是两件事——下一章它们汇到一起。' },
  spec:{
    coreCase:'不断变化的车速；越来越窄的矩形累积路程',
    core:'速度-时间图的面积 ＝ 走的路程',
    plannedFigure:'riemann：v-t 曲线下矩形黎曼和，滑块调块数，读出总面积→逼近真实路程',
    plannedFormula:'路程 ＝ 无数小块（速度 × 一小段时间）之和 的极限（公式仅末页出现）',
    plannedHistory:['fact: 阿基米德「穷竭法」求面积','reconstruction: 黎曼和是后来对「累积」的严格表述','notation: ∫ 记号（莱布尼茨，拉长的 S＝Sum）']
  }
};
