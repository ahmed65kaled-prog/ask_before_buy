'use strict';
(function(){
  const report=document.getElementById('report');
  if(!report) return;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function verifiedPrices(prices){return (Array.isArray(prices)?prices:[]).filter(p=>p&&p.amount!=null&&p.currency&&p.source_url&&p.checked_at);}
  function render(data, meta){
    const r=data||{}, prices=verifiedPrices(r.prices), m=meta||{};
    const conf=r.confidence==null?null:Number(r.confidence);
    const trusted=conf!=null&&conf>=.75&&prices.length>0;
    const freshness=r.checked_at||prices.map(p=>p.checked_at).filter(Boolean).sort().pop()||'—';
    const cached=m.cached?'💾 محفوظ محليًا':'🌐 من البيانات الحالية';
    report.classList.remove('hidden');
    report.innerHTML=`<section class="v68-report ${trusted?'trusted':'guarded'}">
      <div class="v68-top"><span class="v68-pill">${trusted?'✅ جاهز للمقارنة':'🛡️ حماية قبل الشراء'}</span><span>${cached}</span></div>
      <h2>${esc(r.product_name||'تقرير الشراء')}</h2>
      <p class="v68-reco">${esc(trusted?(r.recommendation||'البيانات كافية للمقارنة، راجع المصدر قبل الدفع.'): 'لن نصدر توصية شراء نهائية قبل اكتمال هوية المنتج والسعر الموثق.')}</p>
      <div class="v68-grid"><div><small>ثقة الهوية</small><b>${conf==null?'—':Math.round(conf*100)+'%'}</b></div><div><small>أسعار موثقة</small><b>${prices.length}</b></div><div><small>آخر تحقق</small><b>${esc(freshness)}</b></div></div>
      ${prices.length?`<div class="v68-prices"><h3>💰 الأسعار الموثقة</h3>${prices.slice(0,8).map(p=>`<article><b>${esc(p.amount)} ${esc(p.currency)}</b><span>${esc(p.store||'المصدر')}</span><small>تم التحقق: ${esc(p.checked_at)}</small></article>`).join('')}</div>`:'<div class="v68-empty">⏳ لا يوجد سعر موثق حاليًا. لا تعرض أي سعر على أنه حقيقي بدون مصدر ووقت تحقق.</div>'}
      <div id="v68-trust"></div><div id="v68-deal"></div>
      <div class="v68-check"><h3>قبل الدفع</h3><ul><li>تحقق من الضمان وسياسة الاسترجاع.</li><li>قارن التكلفة النهائية، وليس السعر المعلن فقط.</li><li>تأكد من المصدر ووقت التحقق.</li><li>الصورة أو الباركود وحدهما لا يثبتان الأصالة.</li></ul></div>
      ${m.stale?'<div class="v68-stale">⚠️ هذه نسخة محفوظة وقد تكون أقدم من البيانات الحالية.</div>':''}
    </section>`;
    if(window.AskBuyV66){
      AskBuyV66.renderTrust({ready:trusted,verified_prices:prices.length,identity_confidence:conf||0,evidence:trusted?['هوية المنتج فوق حد الثقة.','يوجد سعر واحد على الأقل بمصدر ووقت تحقق.']:['تحتاج إلى هوية أوضح/باركود أو سعر موثق.']});
      AskBuyV66.renderDeal({status:prices.length>1?'compare':'needs_data',reason:prices.length>1?'قارن الأسعار بعد توحيد العملة والتكلفة النهائية.':'لا توجد بيانات كافية لبناء مقارنة سعرية آمنة.',lowest:prices[0],highest:prices[prices.length-1]});
      AskBuyV66.renderFeedback({common_mistakes:['الاعتماد على صورة المنتج فقط.','اختيار أرخص سعر دون فحص المصدر والضمان.','تجاهل الشحن والرسوم عند المقارنة.']});
    }
  }
  async function showSaved(key){
    if(!window.AskBuyV48) return false;
    try{const saved=await AskBuyV48.loadReport(key||'latest'); if(saved&&saved.report){render(saved.report,{cached:true,stale:saved.stale});return true;} }catch(e){}
    return false;
  }
  window.AskBuyV68={render,showSaved,verifiedPrices};
  window.addEventListener('offline',()=>showSaved('latest'));
})();
