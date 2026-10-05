'use strict';
(function(){
  function renderFinalReport(report, root){
    if(!root) return;
    const r=report||{};
    const prices=Array.isArray(r.prices)?r.prices:[];
    const verified=prices.filter(p=>p&&p.amount!=null&&p.currency&&p.source_url&&p.checked_at);
    const cls=verified.length?'verified':'needs-connection';
    root.innerHTML=`<section class="v67-report ${cls}" dir="rtl">
      <div class="v67-status">${verified.length?'✅ بيانات سعر موثقة':'⏳ يحتاج اتصالًا بمصادر البيانات الحقيقية'}</div>
      <h2>${r.product_name||'تقرير الشراء'}</h2>
      <p>${r.recommendation||'لن نصدر توصية نهائية قبل اكتمال البيانات الموثقة.'}</p>
      <div class="v67-grid"><div><b>الأسعار الموثقة</b><span>${verified.length}</span></div><div><b>الثقة</b><span>${r.confidence!=null?Math.round(Number(r.confidence)*100)+'%':'—'}</span></div><div><b>آخر تحقق</b><span>${r.checked_at||'—'}</span></div></div>
      <small>الصورة وحدها ليست إثباتًا للأصالة، والسعر بدون مصدر ووقت تحقق لا يُعرض كسعر موثوق.</small>
    </section>`;
  }
  window.renderV67FinalReport=renderFinalReport;
})();
