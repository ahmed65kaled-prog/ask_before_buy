'use strict';
(function(){
  const OFF='https://world.openfoodfacts.org';
  const OP='https://prices.openfoodfacts.org/api/v1';
  const PROXY_PRODUCT='/api/abb-product';
  const PROXY_PRICES='/api/abb-prices';
  const PROXY_SEARCH='/api/abb-search';
  const CACHE_PREFIX='abb:product:';
  const PRICE_CACHE_PREFIX='abb:prices:';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function normalizeBarcode(value){
    const s=String(value||'').replace(/\s+/g,'').trim();
    if(!/^(\d{8}|\d{12,14})$/.test(s)) throw new Error('رقم الباركود غير صالح.');
    return s;
  }
  async function fetchJson(url, timeout=12000){
    const c=new AbortController(), t=setTimeout(()=>c.abort(),timeout);
    try{
      const r=await fetch(url,{headers:{Accept:'application/json'} });
      if(!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    }finally{clearTimeout(t)}
  }
  function normalizePrice(item){
    if(!item || typeof item.price!=='number' || !item.currency) return null;
    const loc=item.location||{};
    return {
      id:item.id,
      amount:item.price,
      currency:item.currency,
      date:item.date||item.updated||item.created||'',
      discounted:Boolean(item.price_is_discounted),
      original:item.price_without_discount,
      store:loc.osm_name||loc.osm_brand||loc.osm_display_name||'متجر غير مسمى',
      address:loc.osm_display_name||[loc.osm_address_city,loc.osm_address_country].filter(Boolean).join('، '),
      lat:typeof loc.osm_lat==='number'?loc.osm_lat:null,
      lon:typeof loc.osm_lon==='number'?loc.osm_lon:null,
      distance_km:typeof item.distance_km==='number'?item.distance_km:null,
      proof:item.proof_id||null,
      source:item.source||'Open Prices'
    };
  }
  async function lookupPrices(code, geo){
    const params=new URLSearchParams({product_code:code,type:'PRODUCT',size:'50',order_by:'-date'});
    const cacheKey=PRICE_CACHE_PREFIX+code+(geo?'@near':'@all');
    const cached=localStorage.getItem(cacheKey);
    try{
      let data; try { data=await fetchJson(`${PROXY_PRICES}?${params.toString()}`); } catch (_) { data=await fetchJson(`${OP}/prices?${params.toString()}`); }
      let prices=(data.items||[]).map(normalizePrice).filter(Boolean);
      if(geo && Number.isFinite(geo.lat) && Number.isFinite(geo.lon)){
        const R=6371, rad=x=>x*Math.PI/180;
        prices=prices.map(p=>{ if(p.lat==null||p.lon==null) return p; const dLat=rad(p.lat-geo.lat), dLon=rad(p.lon-geo.lon); const a=Math.sin(dLat/2)**2+Math.cos(rad(geo.lat))*Math.cos(rad(p.lat))*Math.sin(dLon/2)**2; return {...p,distance_km:R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))}; }).filter(p=>p.distance_km==null || p.distance_km <= Number(geo.radius_km||25)).sort((a,b)=>(a.distance_km??999999)-(b.distance_km??999999));
      }
      const payload={prices,checked_at:new Date().toISOString(),source:{name:'Open Prices',url:OP+'/prices'}};
      localStorage.setItem(cacheKey,JSON.stringify(payload));
      return {...payload,cached:false};
    }catch(e){
      if(cached){try{return {...JSON.parse(cached),cached:true,stale:true};}catch(_) {}}
      throw e;
    }
  }
  function normalizeProduct(data, source){
    if(!data || !data.product) return null;
    const p=data.product;
    const code = p.code || data.code || '';
    return {
      product_name:p.product_name_ar||p.product_name_en||p.product_name||p.generic_name||'منتج غير مسمى',
      brand:p.brands||'', barcode:code, image:p.image_front_url||p.image_url||'',
      nutriscore:p.nutriscore_grade||p.nutrition_grades||'', categories:Array.isArray(p.categories_tags)?p.categories_tags.slice(0,8):[],
      source:{name:source,url:`${OFF}/product/${encodeURIComponent(code)}`,checked_at:new Date().toISOString()}, prices:[]
    };
  }
  async function lookupBarcode(barcode, options={}){
    const code=normalizeBarcode(barcode);
    const cached=localStorage.getItem(CACHE_PREFIX+code);
    try{
      let data; try { data=await fetchJson(`${PROXY_PRODUCT}?code=${encodeURIComponent(code)}`); } catch (_) { data=await fetchJson(`${OFF}/api/v3/product/${encodeURIComponent(code)}?product_type=all&cc=eg&lc=ar&tags_lc=ar&fields=code,product_name,product_name_ar,product_name_en,brands,image_front_url,image_url,nutriscore_grade,nutrition_grades,categories_tags,last_modified_t`); }
      const product=normalizeProduct(data,'Open Food Facts');
      if(!product) throw new Error('لم يتم العثور على المنتج بهذا الباركود في قاعدة المنتجات العامة.');
      let priceData;
      try{priceData=await lookupPrices(code,options.geo||null);}catch(_){priceData={prices:[],checked_at:new Date().toISOString(),source:{name:'Open Prices',url:OP+'/prices'},unavailable:true};}
      const payload={...product,prices:priceData.prices||[],price_checked_at:priceData.checked_at,price_source:priceData.source,price_cached:Boolean(priceData.cached),checked_at:new Date().toISOString()};
      localStorage.setItem(CACHE_PREFIX+code,JSON.stringify(payload));
      return {...payload,cached:false};
    }catch(e){
      if(cached){try{return {...JSON.parse(cached),cached:true,stale:true};}catch(_) {}}
      throw e;
    }
  }
  async function searchText(query){
    const q=String(query||'').trim(); if(q.length<2) throw new Error('اكتب اسم المنتج أو الموديل بشكل أوضح.');
    const queryUrl=`${PROXY_SEARCH}?q=${encodeURIComponent(q)}`;
    let data;
    try { data=await fetchJson(queryUrl); }
    catch (_) {
      const url=`${OFF}/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=8&lc=ar&cc=eg`;
      data=await fetchJson(url);
    }
    const products=(data.products||[]).filter(p=>p&&p.code).slice(0,8).map(p=>({product_name:p.product_name_ar||p.product_name||'منتج',brand:p.brands||'',barcode:p.code,image:p.image_front_small_url||p.image_front_url||'',nutriscore:p.nutriscore_grade||'',prices:[]}));
    return {query:q,products,checked_at:new Date().toISOString(),source:{name:'Open Food Facts',url:OFF,checked_at:new Date().toISOString()}};
  }
  function requestLocation(){
    return new Promise((resolve,reject)=>{
      if(!navigator.geolocation) return reject(new Error('المتصفح لا يدعم تحديد الموقع.'));
      navigator.geolocation.getCurrentPosition(p=>resolve({lat:p.coords.latitude,lon:p.coords.longitude,radius_km:25}),()=>reject(new Error('لم يتم السماح بتحديد الموقع. سنعرض الأسعار العامة بدلًا من القريبة.')),{enableHighAccuracy:false,timeout:8000,maximumAge:300000});
    });
  }
  function renderPrices(product){
    const prices=Array.isArray(product.prices)?product.prices:[];
    if(!prices.length) return `<div class="v68-empty">لا يوجد سعر موثق لهذا المنتج في Open Prices حاليًا. لن نخترع سعرًا بديلًا.</div>`;
    const rows=prices.slice(0,12).map(p=>`<article><div><b>${esc(p.store)}</b><small>${esc(p.address||'')}</small></div><div><b>${esc(p.amount)} ${esc(p.currency)}</b><small>${esc(p.date)}${p.discounted?' · عرض/خصم':''}</small></div>${p.proof?`<small>إثبات السعر #${esc(p.proof)}</small>`:'<small>سجل سعر موثق</small>'}</article>`).join('');
    return `<div class="v68-prices"><h3>الأسعار الموثقة</h3>${rows}</div>`;
  }

  function renderDecision(product){
    if(!window.AskBuyDecision) return '';
    const d=window.AskBuyDecision.decide(product);
    const conf=Math.round(d.confidence*100);
    const tone=d.status==='buy_candidate'?'good':d.status==='wait'?'warn':'guard';
    const best=d.lowest?`${esc(d.lowest.amount)} ${esc(d.currency)}`:'—';
    const spread=d.spread_percent!=null&&Number.isFinite(d.spread_percent)?` · فرق الأسعار ${Math.round(d.spread_percent)}%`:'';
    return `<section class="v80-decision ${tone}"><div class="v80-decision-head"><span>🧠 قرار الشراء</span><b>${esc(d.label)}</b></div><p>${esc(d.reason)}</p><div class="v80-decision-grid"><div><small>الثقة</small><b>${conf}%</b></div><div><small>أفضل سعر</small><b>${best}</b></div><div><small>البيانات</small><b>${d.prices.length} سعر${spread}</b></div></div></section>`;
  }

  function renderProduct(report, product){
    const prices=Array.isArray(product.prices)?product.prices:[];
    report.classList.remove('hidden');
    report.innerHTML=`<section class="v76-live-report"><div class="v68-top"><span class="v68-pill">${product.cached?'💾 نتيجة محفوظة':'🌐 نتيجة حقيقية'}</span><span>${esc(product.checked_at||new Date().toISOString())}</span></div><h2>${esc(product.product_name)}</h2><div class="cards"><div class="card"><div class="label">العلامة التجارية</div><div class="value">${esc(product.brand||'غير متوفر')}</div></div><div class="card"><div class="label">الباركود</div><div class="value">${esc(product.barcode||'—')}</div></div><div class="card"><div class="label">التقييم الغذائي</div><div class="value">${esc(product.nutriscore||'غير متوفر')}</div></div><div class="card"><div class="label">الأسعار</div><div class="value">${prices.length?`${prices.length} سجل موثق`:'لا يوجد'}</div></div></div>${product.image?`<img class="product-image" src="${esc(product.image)}" alt="${esc(product.product_name)}" loading="lazy">`:''}${renderPrices(product)}${renderDecision(product)}<div class="v68-empty">مصدر المنتج: <a href="${esc(product.source.url)}" target="_blank" rel="noopener">${esc(product.source.name)}</a><br>وقت التحقق: ${esc(product.source.checked_at)}<br>مصدر الأسعار: <a href="${esc(product.price_source?.url||OP+'/prices')}" target="_blank" rel="noopener">Open Prices</a> · آخر تحقق: ${esc(product.price_checked_at||'—')}<br><b>لا نعرض السعر إلا إذا وصل من مصدر الأسعار.</b></div><div class="v68-check"><h3>قبل الدفع</h3><ul><li>تحقق من الضمان وسياسة الاسترجاع.</li><li>قارن التكلفة النهائية، وليس السعر المعلن فقط.</li><li>الباركود يعرّف المنتج ولا يثبت الأصالة وحده.</li></ul></div></section>`;
  }
  window.AskBuyProductLookup={normalizeBarcode,lookupBarcode,lookupPrices,searchText,requestLocation,renderProduct};
})();
