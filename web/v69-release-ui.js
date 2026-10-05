'use strict';
(function(){
 const report=document.getElementById('report'); if(!report)return;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function statusBanner(){
  const online=navigator.onLine;
  const old=document.getElementById('v69-release-state');
  if(old) old.remove();
  const el=document.createElement('div'); el.id='v69-release-state'; el.className='v69-state '+(online?'online':'offline');
  el.textContent=online?'🟢 وضع التشغيل: متصل — التقرير الحي يحتاج مصادر الإنتاج المصرح بها.':'📴 وضع عدم الاتصال — سيتم استخدام البيانات المحفوظة فقط.';
  report.prepend(el);
 }
 window.AskBuyV69={
  renderReleaseState:statusBanner,
  renderLiveGate:function(cfg){
   const root=document.getElementById('report'); if(!root)return;
   const ready=!!(cfg&&cfg.ai&&cfg.db&&cfg.places&&cfg.commerce);
   const box=document.createElement('div'); box.className='v69-gate '+(ready?'ready':'blocked');
   box.innerHTML='<b>'+(ready?'🟢 جميع الموصلات مهيأة — يلزم اختبار اتصال فعلي قبل LIVE.':'🛡️ التشغيل الحي متوقف للحماية.')+'</b><small>وجود المفاتيح وحده لا يثبت نجاح الاتصال، ولا توجد أسعار وهمية.</small>';
   root.append(box);
  }
 };
 window.addEventListener('online',statusBanner); window.addEventListener('offline',statusBanner); statusBanner();
})();
