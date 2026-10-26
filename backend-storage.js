/* ShopMax99 local SQLite storage bridge (development only).
   Runs before the app scripts. Existing synchronous localStorage calls remain compatible.
   The backend is bound to 127.0.0.1; do not expose this development bridge publicly. */
(function () {
  'use strict';
  var KEYS = [
    'shopmax99_cart','shopmax99_wishlist','shopmax99_user','shopmax99_orders',
    'shopmax99_sellers','shopmax99_products','shopmax99_transactions',
    'shopmax99_customer_account','shopmax99_customer_session','shopmax99_users',
    'shopmax99_settings','shopmax99_promocodes','shopmax99_applied_promo',
    'shopmax99_buy_now','shopmax99_admin_session'
  ];
  var endpoint = '/api/local-store';
  function request(method, url, body, sync) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open(method, url, !sync);
      if (body !== undefined) xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(body === undefined ? null : JSON.stringify(body));
      if (sync) return xhr.status >= 200 && xhr.status < 300 ? JSON.parse(xhr.responseText || '{}') : null;
      xhr.onload = function () {
        if (xhr.status < 200 || xhr.status >= 300) console.warn('[ShopMax99 DB] Sync failed:', xhr.status, xhr.responseText);
      };
      xhr.onerror = function () { console.warn('[ShopMax99 DB] Backend sync unavailable; local copy retained.'); };
      return xhr;
    } catch (e) { console.warn('[ShopMax99 DB] Request error:', e); return null; }
  }
  // Synchronous startup read prevents app.js/admin.js from rendering before database values load.
  var response = request('GET', endpoint, undefined, true);
  var dbValues = response && response.values ? response.values : {};
  KEYS.forEach(function (key) {
    try {
      if (Object.prototype.hasOwnProperty.call(dbValues, key)) {
        localStorage.setItem(key, JSON.stringify(dbValues[key]));
      } else {
        var existing = localStorage.getItem(key);
        if (existing !== null) {
          var value;
          try { value = JSON.parse(existing); } catch (_) { value = existing; }
          request('PUT', endpoint, { key: key, value: value }, false);
        }
      }
    } catch (e) { console.warn('[ShopMax99 DB] Startup migration issue for', key, e); }
  });
  // Keep the app's existing localStorage API synchronous, while mirroring writes to SQLite.
  var originalSetItem = Storage.prototype.setItem;
  var originalRemoveItem = Storage.prototype.removeItem;
  Storage.prototype.setItem = function (key, value) {
    originalSetItem.call(this, key, value);
    if (KEYS.indexOf(String(key)) !== -1) {
      var parsed;
      try { parsed = JSON.parse(String(value)); } catch (_) { parsed = String(value); }
      request('PUT', endpoint, { key: String(key), value: parsed }, false);
    }
  };
  Storage.prototype.removeItem = function (key) {
    originalRemoveItem.call(this, key);
    if (KEYS.indexOf(String(key)) !== -1) request('DELETE', endpoint + '?key=' + encodeURIComponent(String(key)), undefined, false);
  };
  window.ShopMax99DB = {
    enabled: !!response,
    keys: KEYS.slice(),
    syncNow: function () {
      KEYS.forEach(function (key) {
        var raw = localStorage.getItem(key);
        if (raw !== null) {
          var value;
          try { value = JSON.parse(raw); } catch (_) { value = raw; }
          request('PUT', endpoint, { key: key, value: value }, false);
        }
      });
    }
  };
  if (!response) console.warn('[ShopMax99 DB] Could not load SQLite data; localStorage remains active.');
  else console.info('[ShopMax99 DB] SQLite bridge ready.');
})();
