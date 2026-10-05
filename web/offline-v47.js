(function () {
  'use strict';
  const KEY = 'ask-before-buy-offline-v47';
  function saveSnapshot(snapshot) {
    localStorage.setItem(KEY, JSON.stringify({ savedAt: new Date().toISOString(), snapshot }));
  }
  function loadSnapshot() {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (_) { return null; }
  }
  function offlineLabel(savedAt) {
    if (!savedAt) return 'لا توجد بيانات محفوظة لهذا العنصر';
    return 'بيانات محفوظة — آخر حفظ: ' + new Date(savedAt).toLocaleString();
  }
  window.AskBeforeBuyOfflineV47 = { saveSnapshot, loadSnapshot, offlineLabel };
})();
