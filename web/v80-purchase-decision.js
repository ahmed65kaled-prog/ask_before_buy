'use strict';
(function(){
  function ageDays(value){
    const t=Date.parse(value||''); if(!Number.isFinite(t)) return Infinity;
    return Math.max(0,(Date.now()-t)/86400000);
  }
  function decide(product){
    const prices=(Array.isArray(product&&product.prices)?product.prices:[]).filter(p=>p&&Number.isFinite(Number(p.amount))&&p.currency);
    const groups={};
    prices.forEach(p=>{const c=String(p.currency).toUpperCase();(groups[c]||(groups[c]=[])).push(p);});
    const currencies=Object.keys(groups);
    if(!product || !product.barcode) return {status:'needs_data',label:'تحتاج بيانات',reason:'لم تكتمل هوية المنتج.',confidence:0,prices:[],currency:null};
    if(!prices.length) return {status:'needs_data',label:'انتظر',reason:'لا يوجد سعر موثق حاليًا؛ لن نخمن السعر.',confidence:.45,prices:[],currency:null};
    if(currencies.length!==1) return {status:'compare_more',label:'قارن أكثر',reason:'الأسعار بعملات مختلفة، ولن نقارنها رقميًا دون تحويل موثوق.',confidence:.65,prices,currency:null};
    const currency=currencies[0], list=groups[currency].slice().sort((a,b)=>Number(a.amount)-Number(b.amount));
    const freshest=Math.min(...list.map(p=>ageDays(p.date||p.checked_at)));
    const freshCount=list.filter(p=>ageDays(p.date||p.checked_at)<=30).length;
    const sourceCount=new Set(list.map(p=>String(p.source||'Open Prices'))).size;
    const provenCount=list.filter(p=>p.proof||p.source).length;
    const min=list[0], max=list[list.length-1];
    let status='compare_more', label='قارن أكثر', reason='توجد أسعار موثقة، لكن البيانات لا تكفي لحكم شراء حاسم.';
    if(list.length>=2 && freshest<=7){status='buy_candidate';label='مرشح للشراء';reason=`أفضل سعر موثق هو ${min.amount} ${currency}، لكن راجع الضمان والتكلفة النهائية قبل الدفع.`;}
    else if(list.length===1 && freshest<=7){status='compare_more';label='قارن أكثر';reason=`يوجد سعر حديث واحد فقط: ${min.amount} ${currency}. نحتاج سعرًا آخر للمقارنة.`;}
    else if(freshest>30){status='wait';label='انتظر';reason='آخر الأسعار المتاحة قديمة نسبيًا؛ انتظر تحديثًا أو تحقق من المتجر مباشرة.';}
    const spread=list.length>1 ? ((Number(max.amount)-Number(min.amount))/Number(min.amount))*100 : 0;
    const confidence=Math.min(.95, .45 + Math.min(.24,list.length*.08) + (freshest<=7?.18:freshest<=30?.07:0) + (freshCount>1?.05:0) + (provenCount===list.length?.04:0));
    return {status,label,reason,confidence,prices:list,currency,lowest:min,highest:max,spread_percent:spread,freshest_days:freshest,source_count:sourceCount,proven_count:provenCount};
  }
  window.AskBuyDecision={decide};
})();
