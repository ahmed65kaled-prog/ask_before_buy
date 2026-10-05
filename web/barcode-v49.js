(function(){
  const btn=document.getElementById('barcode'), report=document.getElementById('report'), status=document.getElementById('status'), country=document.getElementById('country');
  if(!btn||!report)return;
  const panel=document.createElement('div'); panel.id='barcode-panel'; panel.className='barcode-panel hidden';
  panel.innerHTML=`<div class="barcode-head"><b>مسح الباركود</b><button type="button" id="barcode-close">إغلاق</button></div><video id="barcode-video" playsinline muted></video><div id="barcode-msg" class="barcode-msg">جارٍ تجهيز الكاميرا…</div><div class="barcode-manual"><input id="barcode-code" inputmode="numeric" autocomplete="off" placeholder="أو أدخل رقم الباركود يدويًا"><button type="button" id="barcode-submit">تحقق</button></div><small>سيتم استخدام الرقم للبحث عن المنتج في المصادر الحقيقية. لا يتم اعتبار الباركود وحده إثباتًا للأصالة.</small>`;
  btn.parentElement.parentElement.parentElement.insertBefore(panel, report);
  const video=panel.querySelector('#barcode-video'), msg=panel.querySelector('#barcode-msg'), code=panel.querySelector('#barcode-code');
  let stream=null, raf=0, detector=null;
  function close(){if(raf)cancelAnimationFrame(raf);raf=0;if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;panel.classList.add('hidden');}
  function submit(value){value=String(value||'').replace(/\s+/g,'').trim(); if(!value){msg.textContent='أدخل رقم الباركود أولًا.';return;} if(!/^(\d{8}|\d{12,14})$/.test(value) && !/^[A-Za-z0-9\-._]{4,64}$/.test(value)){msg.textContent='رقم الباركود غير واضح أو غير صالح.';return;} close(); if(window.AskBuyProductLookup){ window.AskBuyProductLookup.lookupBarcode(value).then(p=>{window.AskBuyProductLookup.renderProduct(report,p);status.textContent=p.cached?'تم عرض آخر بيانات محفوظة للباركود.':'تم التحقق من الباركود الآن.'}).catch(e=>{status.textContent='تعذر العثور على المنتج بهذا الباركود.';report.classList.remove('hidden');report.innerHTML=`<section class="v76-live-report"><div class="warn">${String(e.message||'تعذر البحث عن المنتج').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}</div><p>لم نعرض أي سعر أو متجر غير موثق.</p></section>`}) } else { status.textContent='تم التقاط الباركود، وموصل المنتج غير متاح.'; } ;}
  async function open(){panel.classList.remove('hidden');msg.textContent='جارٍ تشغيل الكاميرا…';
    if(!navigator.mediaDevices?.getUserMedia){msg.textContent='الكاميرا غير مدعومة هنا. استخدم الإدخال اليدوي.';return;}
    try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});video.srcObject=stream;await video.play();
      if('BarcodeDetector' in window){detector=new BarcodeDetector({formats:['ean_13','ean_8','upc_a','upc_e','code_128','qr_code']}); msg.textContent='وجّه الكاميرا إلى الباركود.'; scan();}
      else msg.textContent='هذا المتصفح لا يوفر قارئ باركود مدمجًا. استخدم الإدخال اليدوي.';
    }catch(e){msg.textContent='تعذر تشغيل الكاميرا. تحقق من إذن الكاميرا أو استخدم الإدخال اليدوي.';}
  }
  async function scan(){if(panel.classList.contains('hidden')||!detector)return; try{const hits=await detector.detect(video);if(hits?.[0]?.rawValue){submit(hits[0].rawValue);return;}}catch(e){} raf=requestAnimationFrame(scan);}
  btn.addEventListener('click',open);panel.querySelector('#barcode-close').addEventListener('click',close);panel.querySelector('#barcode-submit').addEventListener('click',()=>submit(code.value));code.addEventListener('keydown',e=>{if(e.key==='Enter')submit(code.value);});
  window.AskBuyV49Barcode={open,close,submit};
})();
