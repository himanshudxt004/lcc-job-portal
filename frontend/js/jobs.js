/* ============================================================
   LCC — Public Jobs Listing page logic
   File: frontend/js/jobs.js
   Depends: api.js
   ============================================================ */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else { fn(); }
  }

  function escapeHTML(str) {
    return String(str || '').replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c];
    });
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

  function showToast(msg, type) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'toast ' + (type || '') + ' show';
    setTimeout(function () { el.className = 'toast ' + (type || ''); }, 3000);
  }

  function renderAuthStrip() {
    const strip = document.getElementById('authStrip');
    if (!strip) return;
    if (LCCApi.isAuthed()) {
      const u = LCCApi.getUser() || {};
      const initial = (u.name || '?').charAt(0).toUpperCase();
      const dashHref = u.role === 'employer' ? 'dashboard-employer.html' : 'dashboard-jobseeker.html';
      strip.innerHTML =
        '<a href="' + dashHref + '" class="user-chip">' +
          '<span class="avatar">' + escapeHTML(initial) + '</span>' +
          '<span>' +
            '<div>' + escapeHTML(u.name) + '</div>' +
            '<div class="role">' + escapeHTML(u.role || '') + '</div>' +
          '</span>' +
        '</a>' +
        '<button class="btn-logout" id="logoutBtn">Logout</button>';

      document.getElementById('logoutBtn').addEventListener('click', function () {
        LCCApi.clearSession();
        window.location.reload();
      });
    } else {
      strip.innerHTML =
        '<a class="btn-secondary" href="login.html">Sign In</a> ' +
        '<a class="btn-primary btn-sm" href="signup.html" style="margin-left:8px;">Sign Up</a>';
    }
  }

  function jobCardHTML(job) {
    const initial = (job.company || job.title || '?').charAt(0).toUpperCase();
    const skills  = (job.skills || []).slice(0, 4)
      .map(function (s) { return '<span>' + escapeHTML(s) + '</span>'; }).join('');
    return '' +
      '<div class="job-card">' +
        '<div class="head">' +
          '<div class="logo-square">' + escapeHTML(initial) + '</div>' +
          '<div>' +
            '<h3>' + escapeHTML(job.title) + '</h3>' +
            '<div class="company">' + escapeHTML(job.company || '') + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="meta">' +
          '<span>📍 ' + escapeHTML(job.location || '—') + '</span>' +
          '<span>💼 ' + escapeHTML(job.type || '') + '</span>' +
          (job.experience ? '<span>⏱ ' + escapeHTML(job.experience) + '</span>' : '') +
          '<span class="salary">💰 ' + escapeHTML(job.salary || 'Not disclosed') + '</span>' +
        '</div>' +
        '<div class="desc">' + escapeHTML(job.description || '').slice(0, 220) + '</div>' +
        (skills ? '<div class="meta">' + skills + '</div>' : '') +
        '<div class="actions">' +
          '<span class="posted">Posted ' + escapeHTML(timeAgo(job.createdAt)) + '</span>' +
          '<a class="btn-link" href="job-details.html?id=' + encodeURIComponent(job._id) + '">View Details →</a>' +
        '</div>' +
      '</div>';
  }

  let currentPage = 1;

  async function loadJobs(page) {
    const list = document.getElementById('jobList');
    const pg   = document.getElementById('pagination');
    list.innerHTML = '<div class="loader">Loading jobs...</div>';
    pg.innerHTML   = '';

    const fd = new FormData(document.getElementById('filterBar'));
    const params = new URLSearchParams();
    fd.forEach(function (v, k) { if (v) params.append(k, v); });
    params.append('page', page || 1);
    params.append('limit', 12);

    try {
      const res = await LCCApi.get('/jobs?' + params.toString());
      const jobs = res.jobs || [];

      if (!jobs.length) {
        list.innerHTML =
          '<div class="empty-state" style="grid-column: 1 / -1;">' +
            '<div class="ico">🔍</div>' +
            '<h3>No jobs found</h3>' +
            '<p>Try adjusting your filters or check back soon — new jobs are posted daily.</p>' +
          '</div>';
        return;
      }
      list.innerHTML = jobs.map(jobCardHTML).join('');

      // Pagination
      if (res.pages > 1) {
        let html = '';
        for (let i = 1; i <= res.pages; i++) {
          html += '<button class="btn-secondary btn-sm" data-page="' + i + '" ' +
            'style="margin:0 3px;' + (i === res.page ? 'background:var(--navy);color:#fff;border-color:var(--navy);' : '') + '">' +
            i + '</button>';
        }
        pg.innerHTML = html;
        pg.querySelectorAll('button[data-page]').forEach(function (b) {
          b.addEventListener('click', function () {
            currentPage = parseInt(b.getAttribute('data-page'), 10);
            loadJobs(currentPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });
        });
      }
    } catch (err) {
      list.innerHTML =
        '<div class="empty-state" style="grid-column: 1 / -1;">' +
          '<div class="ico">⚠️</div>' +
          '<h3>Couldn\'t load jobs</h3>' +
          '<p>' + escapeHTML(err.message) + '</p>' +
        '</div>';
    }
  }

  ready(function () {
    renderAuthStrip();

    document.getElementById('filterBar').addEventListener('submit', function (e) {
      e.preventDefault();
      currentPage = 1;
      loadJobs(1);
    });

    loadJobs(1);
  });
})();
