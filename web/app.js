const $=s=>document.querySelector(s), report=$('#report'), status=$('#status');
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function renderError(message){report.classList.remove('hidden'); report.innerHTML=`<section class="v76-live-report"><div class="warn">${esc(message)}</div><p>لن نعرض سعرًا أو متجرًا غير موثق.</p></section>`;}
async function searchProduct(){
  const q=$('#query').value.trim(); if(!q){status.textContent='اكتب اسم المنتج أو الموديل أولًا.';return;}
  status.textContent='🔎 جارٍ البحث في قاعدة المنتجات العامة…';
  try{
    const result=await window.AskBuyProductLookup.searchText(q);
    report.classList.remove('hidden');
    report.innerHTML=`<section class="v76-live-report"><div class="v68-top"><span class="v68-pill">🌐 نتائج حقيقية</span><span>${esc(result.checked_at)}</span></div><h2>نتائج البحث عن «${esc(result.query)}»</h2>${result.products.length?result.products.map(p=>`<article class="search-result"><div>${p.image?`<img src="${esc(p.image)}" alt="" loading="lazy">`:''}</div><div><h3>${esc(p.product_name)}</h3><p>${esc(p.brand||'')} ${p.barcode?`· ${esc(p.barcode)}`:''}</p><button type="button" data-code="${esc(p.barcode)}" class="lookup-result">فتح تقرير المنتج</button></div></article>`).join(''):'<div class="v68-empty">لم نجد نتيجة مطابقة.</div>'}<div class="v68-empty">المصدر: <a href="https://world.openfoodfacts.org" target="_blank" rel="noopener">Open Food Facts</a> · وقت التحقق: ${esc(result.checked_at)}</div></section>`;
    report.querySelectorAll('.lookup-result').forEach(b=>b.onclick=()=>lookupBarcode(b.dataset.code)); status.textContent=`تم العثور على ${result.products.length} نتيجة.`;
  }catch(e){status.textContent='تعذر إكمال البحث.';renderError(e.message||'حدث خطأ في البحث.');}
}
async function lookupBarcode(code){
  status.textContent='🔎 جارٍ جلب بيانات المنتج الحقيقية…';
  try{const p=await window.AskBuyProductLookup.lookupBarcode(code); window.AskBuyProductLookup.renderProduct(report,p); status.textContent=p.cached?'تم عرض آخر بيانات محفوظة.':'تم التحقق من المنتج الآن.';}
  catch(e){status.textContent='لم يتم العثور على المنتج.';renderError(e.message||'تعذر الوصول إلى قاعدة المنتجات.');}
}
$('#search').onclick=searchProduct;
const near=document.getElementById('nearby-prices');
if(near) near.onclick=async()=>{status.textContent='📍 جارٍ البحث عن الأسعار والمتاجر القريبة…';try{const geo=await window.AskBuyProductLookup.requestLocation();const q=$('#query').value.trim();if(!q){status.textContent='اكتب اسم المنتج أو استخدم الباركود أولًا.';return;}const result=await window.AskBuyProductLookup.searchText(q);const first=result.products[0];if(!first){renderError('لم نجد منتجًا لعرض الأسعار القريبة.');return;}const p=await window.AskBuyProductLookup.lookupBarcode(first.barcode,{geo});window.AskBuyProductLookup.renderProduct(report,p);status.textContent=p.prices.length?`تم العثور على ${p.prices.length} سعر/سجل قريب.`:'لا توجد أسعار موثقة قريبة لهذا المنتج حاليًا.';}catch(e){status.textContent=e.message||'تعذر جلب الأسعار القريبة.';}};
 $('#query').addEventListener('keydown',e=>{if(e.key==='Enter')searchProduct();});
$('#image').onchange=e=>{if(e.target.files[0]){status.textContent='تم اختيار الصورة. تحليل الصورة يحتاج موصل رؤية/ذكاء اصطناعي إنتاجي؛ لن نخمن هوية المنتج.';renderError('تم استلام الصورة، لكن تحليلها يحتاج موصل رؤية إنتاجي موثوق.');}};
(function setupOfflineStatus(){const el=document.getElementById('offline-status'); if(!el)return; function update(){const offline=!navigator.onLine;el.textContent=offline?'📴 غير متصل — سيتم استخدام البيانات المحفوظة عند توفرها.':'🟢 متصل — يمكن تحديث بيانات المنتج الآن.';el.className='offline-status show '+(offline?'':'ok');}window.addEventListener('online',update);window.addEventListener('offline',update);update();})();
(function setupV48Sync(){const state=document.getElementById('sync-state'),retry=document.getElementById('retry-sync');let lastSync=null;function render(){state.textContent=navigator.onLine?`🟢 متصل — آخر تحقق: ${lastSync?new Date(lastSync).toLocaleString('ar-EG'):'لم يتم بعد'}`:'🔴 غير متصل — البيانات المحفوظة متاحة.';retry.hidden=true;}async function sync(){if(!navigator.onLine){render();return;}lastSync=new Date().toISOString();render();}retry.onclick=sync;window.addEventListener('online',sync);window.addEventListener('offline',render);render();window.AskBuyV48Sync={sync};})();
if(!navigator.onLine&&window.AskBuyV68) window.AskBuyV68.showSaved('latest');
