(function(){
  const DB='ask-before-buy-v48', STORE='reports', VERSION=1;
  function openDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,VERSION);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE,{keyPath:'key'});};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
  async function saveReport(report){const db=await openDb();return new Promise((res,rej)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(report);tx.oncomplete=()=>res(report);tx.onerror=()=>rej(tx.error);});}
  async function loadReport(key){const db=await openDb();return new Promise((res,rej)=>{const r=db.transaction(STORE).objectStore(STORE).get(key);r.onsuccess=()=>res(r.result||null);r.onerror=()=>rej(r.error);});}
  window.AskBuyV48={saveReport,loadReport};
})();
