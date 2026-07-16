/* 第 9 章 · 两条路汇合——微积分基本定理  【骨架，待审核 ch06 后填充】
   冻结案例：y = x 和从 0 到 x 的累积面积；面积函数的坡度 ＝ 原曲线高度。 */
window.CHAPTER = {
  id:'ch09', number:9, concept:'基本定理', stub:true,
  title:'两条路汇合', subtitle:'微积分基本定理',
  coreQuestion:'求切线（导数）和求面积（积分），怎么会是同一件事？',
  prev:{ file:'ch08.html' },
  story:{ heading:'两条路，竟然是一条',
    body:'前两章像两个方向：一个「求陡度」，一个「求面积」。微积分基本定理说：它们互为逆运算——<b>累积面积长起来的速度，正好等于原曲线此刻的高度</b>。' },
  experiment:{ kicker:'动手（待填）', heading:'面积长得多快',
    intro:'（骨架占位）看 y = x 从 0 到 x 扫过的面积；把 x 往右挪，量这块面积「长大的速度」，正好等于该处曲线高度。',
    figure:{ type:'placeholder', params:{ label:'y = x 从 0 到 x 的累积面积 · 面积坡度＝曲线高度' } } },
  transition:{ toFile:'ch10.html', toTitle:'下一章：神奇的 e →',
    teaser:'掌握了导数与积分，就能追问：有没有一种增长，长得和自己一样快？' },
  spec:{
    coreCase:'y = x 与从 0 到 x 的累积面积',
    core:'面积函数的坡度（导数）＝ 原曲线的高度 —— 这就是基本定理',
    plannedFigure:'area-slope：滑动 x，同步画累积面积 A(x) 与其增长速度，展示 A′(x)=原高度',
    plannedFormula:'∫ 与 d/dx 互逆；A(x)=∫₀ˣf，A′(x)=f(x)（公式仅末页出现）',
    plannedHistory:['fact: 牛顿、莱布尼茨各自独立发现','reconstruction: 二人优先权之争是史实，但不虚构对话','notation: 牛顿用流数记号、莱布尼茨用 ∫ 与 d，现代通用后者']
  }
};
