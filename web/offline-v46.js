(function () {
  const DB_NAME = 'ask-before-buy-offline-v46';
  const STORE = 'buyer_cache';
  function openDB() {
    return new Promise((resolve, reject) => {
      const r = indexedDB.open(DB_NAME, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: 'key' });
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  }
  async function put(key, value) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put({ key, value, cached_at: new Date().toISOString() });
      tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
    });
  }
  async function get(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const req = db.transaction(STORE).objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result ? req.result.value : null);
      req.onerror = () => reject(req.error);
    });
  }
  window.AskBeforeBuyOfflineV46 = { put, get, isOnline: () => navigator.onLine };
})();
