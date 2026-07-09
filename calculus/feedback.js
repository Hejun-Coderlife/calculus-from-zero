/* 反馈浮标 —— 全站共用。改表单链接 / 样式只需动这一个文件。 */
(function(){
  // ①【唯一要改的地方】把下面换成你的表单链接（金数据 / 腾讯问卷，选“免登录”那种）
  var FEEDBACK_URL = 'https://b9zdkgds.jsjform.com/f/fX08vQ';   // 金数据表单

  // 当前是哪一章 / 什么语言，随反馈一起带给你，方便定位问题
  function ctx(){
    var file  = (location.pathname.split('/').pop() || 'index.html');
    var lang  = document.documentElement.lang || 'zh';
    var title = (document.title || '').split('—')[0].split('|')[0].trim();
    return { file: file, lang: lang, title: title };
  }

  function openForm(){
    if (FEEDBACK_URL.indexOf('your-form-url') >= 0){
      alert('【站长提示】请在 feedback.js 里把 FEEDBACK_URL 换成你的表单链接。');
      return;
    }
    var c   = ctx();
    var sep = FEEDBACK_URL.indexOf('?') >= 0 ? '&' : '?';
    // 表单里开启“URL 参数预填”，把 from / page / lang 映射到对应字段即可自动收到章节信息
    var url = FEEDBACK_URL + sep
      + 'from=' + encodeURIComponent(c.title)
      + '&page=' + encodeURIComponent(c.file)
      + '&lang=' + encodeURIComponent(c.lang);
    window.open(url, '_blank', 'noopener');
  }

  // 蓝色圆角浮标，明底(章节页)/暗底(目录页)都清晰，不依赖各页 CSS 变量
  var css = ''
    + '.fb-fab{position:fixed;right:18px;bottom:20px;z-index:50;display:inline-flex;align-items:center;gap:7px;'
    + 'font:600 14px/1 -apple-system,BlinkMacSystemFont,"PingFang SC","Inter",sans-serif;color:#fff;'
    + 'background:#0071e3;border:none;border-radius:999px;padding:11px 16px;cursor:pointer;'
    + 'box-shadow:0 6px 20px rgba(0,80,200,.35),0 2px 6px rgba(0,0,0,.18);'
    + 'transition:transform .15s,box-shadow .2s,background .2s}'
    + '.fb-fab:hover{background:#0077ed;transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,80,200,.45)}'
    + '.fb-fab:active{transform:translateY(0)}'
    + '.fb-fab svg{width:17px;height:17px}'
    + '@media(max-width:600px){.fb-fab{right:12px;bottom:14px;padding:10px 13px}.fb-fab .txt{display:none}}';

  function init(){
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var b = document.createElement('button');
    b.className = 'fb-fab'; b.type = 'button';
    b.setAttribute('aria-label', '反馈 / Feedback');
    b.title = '有问题？点这里反馈 · Feedback';
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
      + 'stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 '
      + '8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8A8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z"/>'
      + '</svg><span class="txt">反馈</span>';
    b.addEventListener('click', openForm);
    document.body.appendChild(b);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
