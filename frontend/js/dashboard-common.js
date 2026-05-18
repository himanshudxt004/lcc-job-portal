/* ============================================================
   LCC — Dashboard common helpers
   File: frontend/js/dashboard-common.js
   Auth gating, user chip, toast, escape — shared by both dashboards.
   ============================================================ */
(function (global) {
  'use strict';

  function escapeHTML(str) {
    return String(str || '').replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c];
    });
  }

  function showToast(msg, type) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'toast ' + (type || '') + ' show';
    setTimeout(function () { el.className = 'toast ' + (type || ''); }, 3500);
  }

  function timeAgo(iso) {
    if (!iso) return '';
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60)        return 'Just now';
    if (diff < 3600)      return Math.floor(diff/60) + 'm ago';
    if (diff < 86400)     return Math.floor(diff/3600) + 'h ago';
    if (diff < 86400*30)  return Math.floor(diff/86400) + 'd ago';
    return new Date(iso).toLocaleDateString();
  }

  /**
   * Require auth + matching role. Redirects if missing.
   * Returns the user, or null on redirect.
   */
  function dashboardForRole(r) {
    if (r === 'admin') return 'dashboard-admin.html';
    if (r === 'employer') return 'dashboard-employer.html';
    return 'dashboard-jobseeker.html';
  }

  function requireAuth(role) {
    if (!LCCApi.isAuthed()) {
      const q = role === 'admin' ? '?admin=1' : '?role=' + (role || 'jobseeker');
      window.location.replace('login.html' + q);
      return null;
    }
    const u = LCCApi.getUser();
    if (role && u && u.role !== role) {
      window.location.replace(dashboardForRole(u.role));
      return null;
    }
    return u;
  }

  function renderUserChip(targetId) {
    const el = document.getElementById(targetId || 'authStrip');
    if (!el) return;
    const u = LCCApi.getUser() || {};
    const initial = (u.name || '?').charAt(0).toUpperCase();
    el.innerHTML =
      '<span class="user-chip">' +
        '<span class="avatar">' + escapeHTML(initial) + '</span>' +
        '<span>' +
          '<div>' + escapeHTML(u.name) + '</div>' +
          '<div class="role">' + escapeHTML(u.role || '') + '</div>' +
        '</span>' +
      '</span>' +
      '<button class="btn-logout" id="logoutBtn">Logout</button>';

    document.getElementById('logoutBtn').addEventListener('click', function () {
      LCCApi.clearSession();
      window.location.replace('index.html');
    });
  }

  global.LCCDash = {
    escapeHTML,
    showToast,
    timeAgo,
    dashboardForRole,
    requireAuth,
    renderUserChip
  };
})(window);
