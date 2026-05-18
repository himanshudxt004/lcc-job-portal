/* ============================================================
   LCC Frontend — API client (fetch wrapper)
   File: frontend/js/api.js

   Reads API base from window.LCC_API_BASE (set in HTML) or
   defaults to http://localhost:5000/api. Token persisted in
   localStorage under key "lcc_token".
   ============================================================ */
(function (global) {
  'use strict';

  const API_BASE   = global.LCC_API_BASE   || 'https://lcc-job-portal.onrender.com/api';
  const TOKEN_KEY  = 'lcc_token';
  const USER_KEY   = 'lcc_user';

  // -------- Token & user storage --------
  function getToken() { return localStorage.getItem(TOKEN_KEY); }
  function setToken(t) {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else   localStorage.removeItem(TOKEN_KEY);
  }
  function getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
    catch (e) { return null; }
  }
  function setUser(u) {
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else   localStorage.removeItem(USER_KEY);
  }
  function clearSession() {
    setToken(null);
    setUser(null);
  }

  // -------- Core fetch --------
  async function request(path, opts) {
    opts = opts || {};
    const url = API_BASE + path;

    const headers = Object.assign(
      { 'Accept': 'application/json' },
      opts.headers || {}
    );

    // JSON body
    let body = opts.body;
    if (body && !(body instanceof FormData) && typeof body !== 'string') {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(body);
    }

    // Auth header
    const token = getToken();
    if (token && !opts.noAuth) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    let response;
    try {
      response = await fetch(url, {
        method:  opts.method || 'GET',
        headers,
        body
      });
    } catch (netErr) {
      throw new Error('Network error — is the backend running at ' + API_BASE + '?');
    }

    let data = null;
    const ctype = response.headers.get('content-type') || '';
    if (ctype.indexOf('application/json') !== -1) {
      try { data = await response.json(); } catch (e) { data = null; }
    } else {
      try { data = { message: await response.text() }; } catch (e) { data = {}; }
    }

    if (!response.ok) {
      // 401 → likely expired token
      if (response.status === 401 && token) {
        clearSession();
      }
      const message = (data && data.message) || ('Request failed: ' + response.status);
      const err = new Error(message);
      err.status = response.status;
      err.data   = data;
      throw err;
    }

    return data || { ok: true };
  }

  // -------- Method shortcuts --------
  const api = {
    base:        API_BASE,
    getToken,
    setToken,
    getUser,
    setUser,
    clearSession,
    isAuthed:    function () { return !!getToken(); },

    get:    function (path)        { return request(path); },
    post:   function (path, body)  { return request(path, { method: 'POST',   body }); },
    put:    function (path, body)  { return request(path, { method: 'PUT',    body }); },
    patch:  function (path, body)  { return request(path, { method: 'PATCH',  body }); },
    delete: function (path)        { return request(path, { method: 'DELETE' }); },

    /**
     * Upload helper. data is a plain object; convert to FormData.
     * fileFieldName + file (File) are appended last.
     */
    upload: function (path, data, fileFieldName, file) {
      const fd = new FormData();
      if (data) {
        Object.keys(data).forEach(function (k) {
          if (data[k] !== undefined && data[k] !== null) fd.append(k, data[k]);
        });
      }
      if (file && fileFieldName) fd.append(fileFieldName, file);
      return request(path, { method: 'POST', body: fd });
    },

    uploadPut: function (path, data, fileFieldName, file) {
      const fd = new FormData();
      if (data) {
        Object.keys(data).forEach(function (k) {
          if (data[k] !== undefined && data[k] !== null) fd.append(k, data[k]);
        });
      }
      if (file && fileFieldName) fd.append(fileFieldName, file);
      return request(path, { method: 'PUT', body: fd });
    }
  };

  global.LCCApi = api;
})(window);
