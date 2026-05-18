/* ============================================================
   LCC — Admin panel shared utilities
   ============================================================ */
(function (global) {
  'use strict';

  const NAV = [
    { href: 'dashboard-admin.html', label: 'Overview', icon: '📊' },
    { href: 'admin-jobs.html', label: 'Jobs', icon: '💼' },
    { href: 'admin-applications.html', label: 'Applications', icon: '👥' },
    { href: 'admin-blogs.html', label: 'Blogs', icon: '📝' },
    { href: 'admin-hiring-requests.html', label: 'Hiring Requests', icon: '🏢' }
  ];

  function currentPage() {
    return (location.pathname.split('/').pop() || '').toLowerCase();
  }

  function requireAdmin() {
    return LCCDash.requireAuth('admin');
  }

  function renderSidebar(activeFile) {
    const el = document.getElementById('adminSidebar');
    if (!el) return;
    const page = activeFile || currentPage();
    el.innerHTML =
      '<div class="admin-sidebar-inner">' +
        '<div class="admin-brand">LCC Admin</div>' +
        '<nav class="admin-nav">' +
          NAV.map(function (item) {
            const active = page === item.href.toLowerCase() ? ' active' : '';
            return '<a href="' + item.href + '" class="admin-nav-link' + active + '">' +
              '<span>' + item.icon + '</span> ' + LCCDash.escapeHTML(item.label) + '</a>';
          }).join('') +
        '</nav>' +
        '<a href="index.html" class="admin-nav-link" style="margin-top:auto;">← View Site</a>' +
      '</div>';
  }

  function initAdminPage(activeFile) {
    const user = requireAdmin();
    if (!user) return null;
    LCCDash.renderUserChip('authStrip');
    renderSidebar(activeFile);
    return user;
  }

  function apiOrigin() {
    return LCCApi.base.replace(/\/api$/, '');
  }

  global.LCCAdmin = {
    NAV,
    requireAdmin,
    initAdminPage,
    apiOrigin,
    currentPage
  };
})(window);
