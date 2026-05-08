/* ============================================================
   LCC — Job Seeker Dashboard
   File: frontend/js/dashboard-jobseeker.js
   ============================================================ */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else { fn(); }
  }

  ready(async function () {
    const user = LCCDash.requireAuth('jobseeker');
    if (!user) return;

    LCCDash.renderUserChip('authStrip');

    document.getElementById('welcomeTitle').textContent = 'Welcome, ' + (user.name || 'there');

    // -------- Profile prefill --------
    fillProfile(user);

    // Refresh user from server (in case localStorage stale)
    try {
      const me = await LCCApi.get('/auth/me');
      LCCApi.setUser(me.user);
      fillProfile(me.user);
    } catch (e) {
      // /me failed — token might be invalid
      if (e.status === 401) {
        LCCApi.clearSession();
        window.location.replace('login.html');
        return;
      }
    }

    // -------- Profile form --------
    document.getElementById('profileForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(e.target).entries());
      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true; btn.textContent = 'Saving...';
      try {
        const res = await LCCApi.patch('/auth/profile', fd);
        LCCApi.setUser(res.user);
        LCCDash.showToast('Profile updated.', 'ok');
      } catch (err) {
        LCCDash.showToast(err.message || 'Update failed', 'error');
      } finally {
        btn.disabled = false; btn.textContent = 'Save Profile';
      }
    });

    // -------- Resume upload --------
    renderResumeStatus(LCCApi.getUser());

    document.getElementById('resumeForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      const fileInput = e.target.querySelector('input[type="file"]');
      const file = fileInput.files[0];
      if (!file) { LCCDash.showToast('Please select a file', 'error'); return; }

      const btn = e.target.querySelector('button');
      btn.disabled = true; btn.textContent = 'Uploading...';
      try {
        const res = await LCCApi.upload('/auth/resume', {}, 'resume', file);
        const u = LCCApi.getUser();
        u.resume = res.resume;
        LCCApi.setUser(u);
        renderResumeStatus(u);
        LCCDash.showToast('Resume uploaded.', 'ok');
        fileInput.value = '';
      } catch (err) {
        LCCDash.showToast(err.message || 'Upload failed', 'error');
      } finally {
        btn.disabled = false; btn.textContent = 'Upload';
      }
    });

    // -------- Applications --------
    loadApplications();
  });

  function fillProfile(u) {
    if (!u) return;
    setVal('pf-name',     u.name);
    setVal('pf-phone',    u.phone);
    setVal('pf-headline', u.headline);
    setVal('pf-location', u.location);
    setVal('pf-skills',   (u.skills || []).join(', '));
  }

  function setVal(id, v) {
    const el = document.getElementById(id);
    if (el) el.value = v || '';
  }

  function renderResumeStatus(u) {
    const status = document.getElementById('resumeStatus');
    if (!status) return;
    if (u && u.resume) {
      status.innerHTML = '✓ Current resume on file: ' +
        '<a href="' + LCCApi.base.replace(/\/api$/, '') + LCCDash.escapeHTML(u.resume) +
        '" target="_blank" rel="noopener" style="color:var(--gold); text-decoration:none; font-weight:600;">' +
        'View / download</a>';
    } else {
      status.innerHTML = 'No resume uploaded yet.';
    }
  }

  async function loadApplications() {
    const list = document.getElementById('appList');
    try {
      const res = await LCCApi.get('/applications/user');
      const apps = res.applications || [];

      // Stats
      const stats = { total: apps.length, shortlisted: 0, reviewing: 0, hired: 0 };
      apps.forEach(function (a) {
        if (a.status === 'shortlisted') stats.shortlisted++;
        if (a.status === 'reviewing')   stats.reviewing++;
        if (a.status === 'hired')       stats.hired++;
      });
      document.getElementById('statTotal').textContent       = stats.total;
      document.getElementById('statShortlisted').textContent = stats.shortlisted;
      document.getElementById('statReviewing').textContent   = stats.reviewing;
      document.getElementById('statHired').textContent       = stats.hired;

      if (!apps.length) {
        list.innerHTML =
          '<div class="empty-state">' +
            '<div class="ico">📋</div>' +
            '<h3>No applications yet</h3>' +
            '<p>Start applying — every great career begins with one click.</p>' +
            '<a href="jobs.html" class="btn-primary">Browse Jobs →</a>' +
          '</div>';
        return;
      }

      list.innerHTML = apps.map(function (a) {
        const j = a.jobId || {};
        return '' +
          '<div class="row-item">' +
            '<div>' +
              '<h4>' + LCCDash.escapeHTML(j.title || 'Job removed') + '</h4>' +
              '<div class="meta">' +
                '<span>🏢 ' + LCCDash.escapeHTML(j.company || '—') + '</span>' +
                '<span>📍 ' + LCCDash.escapeHTML(j.location || '—') + '</span>' +
                '<span>💼 ' + LCCDash.escapeHTML(j.type || '') + '</span>' +
                '<span>Applied ' + LCCDash.escapeHTML(LCCDash.timeAgo(a.createdAt)) + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="actions">' +
              '<span class="status-pill status-' + LCCDash.escapeHTML(a.status) + '">' + LCCDash.escapeHTML(a.status) + '</span>' +
              (j._id ? '<a href="job-details.html?id=' + encodeURIComponent(j._id) + '" class="btn-secondary btn-sm">View</a>' : '') +
            '</div>' +
          '</div>';
      }).join('');
    } catch (err) {
      list.innerHTML = '<div class="empty-state"><div class="ico">⚠️</div><h3>Could not load</h3><p>' + LCCDash.escapeHTML(err.message) + '</p></div>';
    }
  }
})();
