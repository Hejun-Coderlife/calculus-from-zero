/* 第 11 章 · 套娃变化——变化里面还有变化  【骨架，待审核 ch06 后填充】
   冻结案例：圆形水波 / 圆形区域扩大：时间 → 半径 → 面积。
   不要使用「高度变化导致温度变化」作为主案例。 */
window.CHAPTER = {
  id:'ch11', number:11, concept:'链式法则', stub:true,
  title:'套娃变化', subtitle:'变化里面还有变化',
  coreQuestion:'一环带一环的变化，怎么连起来一起算？',
  prev:{ file:'ch10.html' },
  story:{ heading:'变化里面，还套着变化',
    body:'往水里丢一颗石子：<b>时间</b>推着<b>半径</b>变大，半径又推着<b>面积</b>变大。面积随时间变多快？得把两段变化<b>连乘</b>起来——这就是链式法则。' },
  experiment:{ kicker:'动手（待填）', heading:'水波一圈圈扩大',
    intro:'（骨架占位）水波半径随时间匀速扩大，面积随半径变大；看面积随时间的增速 ＝ 两段增速相乘。',
    figure:{ type:'placeholder', params:{ label:'圆形水波扩大：时间 → 半径 → 面积' } } },
  transition:{ toFile:'../index.html', toTitle:'← 回到目录',
    teaser:'从一个瞬间的速度，到套娃般的变化——微积分的地基，到这里就铺齐了。' },
  spec:{
    coreCase:'圆形水波/圆形区域扩大：时间 → 半径 → 面积',
    mustNot:['不要用「高度变化导致温度变化」作主案例'],
    core:'面积对时间的变化率 ＝ 面积对半径的变化率 × 半径对时间的变化率（连乘）',
    plannedFigure:'ripple：水波半径随时间扩大，联动显示 dA/dt = dA/dr · dr/dt',
    plannedFormula:'链式：外层变化率 × 内层变化率（公式仅末页出现）',
    plannedHistory:['notation: 链式法则的现代写法源自莱布尼茨的 dy/dx 记号可「像分数一样约」']
  }
};
