(function(){
  const report=document.getElementById('report');
  if(!report) return;
  window.AskBuyV66={
    renderTrust:function(data){
      const d=data||{};
      const ready=d.ready?'🟢 التقرير مستند إلى هوية وسعر موثقين':'🟡 التقرير يحتاج بيانات إضافية قبل قرار الشراء';
      const prices=Number(d.verified_prices||0);
      const conf=Math.round(Number(d.identity_confidence||0)*100);
      const evidence=(d.evidence||[]).map(x=>`<li>${x}</li>`).join('');
      report.insertAdjacentHTML('beforeend',`<section class="v66-panel"><h3>🛡️ مركز الثقة</h3><div class="v66-badge">${ready}</div><p>ثقة الهوية: <b>${conf}%</b> · أسعار موثقة: <b>${prices}</b></p><ul>${evidence}</ul><small>${d.authenticity||'الصورة وحدها ليست إثباتًا للأصالة.'}</small></section>`);
    },
    renderDeal:function(data){
      const d=data||{};
      const title=d.status==='verify'?'🟠 حارس الصفقة: تحقق قبل الدفع':d.status==='needs_data'?'🟡 حارس الصفقة: نحتاج بيانات أكثر':'🟢 حارس الصفقة: المقارنة متاحة';
      report.insertAdjacentHTML('beforeend',`<section class="v66-panel"><h3>${title}</h3><p>${d.reason||''}</p>${d.lowest?`<p>الأقل: <b>${d.lowest.amount} ${d.lowest.currency}</b> · الأعلى: <b>${d.highest.amount} ${d.highest.currency}</b></p>`:''}</section>`);
    },
    renderFeedback:function(data){
      const d=data||{};
      const mistakes=(d.common_mistakes||[]).map(x=>`<li>${x}</li>`).join('');
      report.insertAdjacentHTML('beforeend',`<section class="v66-panel"><h3>💬 أخطاء شائعة قبل الشراء</h3><ul>${mistakes}</ul><p class="v66-note">التعليقات والمراجعات المستقبلية يجب أن ترتبط بالمنتج والمصدر وتاريخ الإرسال.</p></section>`);
    }
  };
})();
