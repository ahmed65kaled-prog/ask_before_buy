(function () {
  const DB_NAME = 'ask-before-buy-offline-v44';
  const STORE = 'records';
  function openDB() {
    return new Promise((resolve, reject) => {
      const r = indexedDB.open(DB_NAME, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: 'key' });
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  }
  async function put(record) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(record);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }
  async function get(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const r = db.transaction(STORE).objectStore(STORE).get(key);
      r.onsuccess = () => resolve(r.result || null);
      r.onerror = () => reject(r.error);
    });
  }
  window.AskBeforeBuyOffline = { put, get, isOnline: () => navigator.onLine };
  window.addEventListener('online', () => document.documentElement.dataset.network = 'online');
  window.addEventListener('offline', () => document.documentElement.dataset.network = 'offline');
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
  document.documentElement.dataset.network = navigator.onLine ? 'online' : 'offline';
})();
