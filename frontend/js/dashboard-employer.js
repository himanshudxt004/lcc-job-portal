/* ============================================================
   LCC — Employer Dashboard
   File: frontend/js/dashboard-employer.js
   ============================================================ */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else { fn(); }
  }

  ready(async function () {
    const user = LCCDash.requireAuth('employer');
    if (!user) return;

    LCCDash.renderUserChip('authStrip');

    document.getElementById('welcomeTitle').textContent = (user.company ? user.company + ' · ' : '') + 'Dashboard';

    await loadJobs();
    await loadApplicants();

    document.getElementById('appFilterJob').addEventListener('change', loadApplicants);
    document.getElementById('appRefresh').addEventListener('click', loadApplicants);
  });

  async function loadJobs() {
    const wrap = document.getElementById('myJobs');
    try {
      const res = await LCCApi.get('/jobs/employer/mine');
      const jobs = res.jobs || [];

      // Stats
      document.getElementById('statJobs').textContent   = jobs.length;
      document.getElementById('statActive').textContent = jobs.filter(function (j) { return j.isActive; }).length;

      // Job filter dropdown
      const sel = document.getElementById('appFilterJob');
      sel.innerHTML = '<option value="">All Jobs</option>' +
        jobs.map(function (j) {
          return '<option value="' + j._id + '">' + LCCDash.escapeHTML(j.title) + '</option>';
        }).join('');

      if (!jobs.length) {
        wrap.innerHTML =
          '<div class="empty-state">' +
            '<div class="ico">📝</div>' +
            '<h3>No jobs posted yet</h3>' +
            '<p>Click "Post New Job" to publish your first opening — it takes a minute.</p>' +
            '<a href="post-job.html" class="btn-primary">Post Your First Job →</a>' +
          '</div>';
        return;
      }

      wrap.innerHTML = jobs.map(function (j) {
        return '' +
          '<div class="row-item">' +
            '<div>' +
              '<h4>' + LCCDash.escapeHTML(j.title) +
                (j.isActive ? '' : ' <span style="font-size:10px; background:rgba(220,38,38,0.1); color:#B91C1C; padding:2px 8px; border-radius:99px; font-weight:600; vertical-align:middle;">PAUSED</span>') +
              '</h4>' +
              '<div class="meta">' +
                '<span>📍 ' + LCCDash.escapeHTML(j.location || '—') + '</span>' +
                '<span>💼 ' + LCCDash.escapeHTML(j.type || '') + '</span>' +
                '<span>💰 ' + LCCDash.escapeHTML(j.salary || 'Not disclosed') + '</span>' +
                '<span>Posted ' + LCCDash.escapeHTML(LCCDash.timeAgo(j.createdAt)) + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="actions">' +
              '<a href="job-details.html?id=' + encodeURIComponent(j._id) + '" class="btn-secondary btn-sm">View</a>' +
              '<a href="post-job.html?id=' + encodeURIComponent(j._id) + '" class="btn-secondary btn-sm">Edit</a>' +
              '<button class="btn-sm" data-toggle="' + j._id + '" data-active="' + (j.isActive ? '1' : '0') + '" style="background:transparent; border:1.5px solid rgba(11,31,58,0.15); border-radius:var(--radius-sm); padding:8px 14px; font-size:13px; color:var(--navy); cursor:pointer; font-weight:500;">' +
                (j.isActive ? 'Pause' : 'Resume') +
              '</button>' +
              '<button class="btn-danger" data-delete="' + j._id + '">Delete</button>' +
            '</div>' +
          '</div>';
      }).join('');

      wrap.querySelectorAll('button[data-delete]').forEach(function (b) {
        b.addEventListener('click', function () { deleteJob(b.getAttribute('data-delete')); });
      });
      wrap.querySelectorAll('button[data-toggle]').forEach(function (b) {
        b.addEventListener('click', function () {
          toggleJob(b.getAttribute('data-toggle'), b.getAttribute('data-active') === '1');
        });
      });
    } catch (err) {
      wrap.innerHTML = '<div class="empty-state"><div class="ico">⚠️</div><h3>Could not load jobs</h3><p>' + LCCDash.escapeHTML(err.message) + '</p></div>';
    }
  }

  async function deleteJob(id) {
    if (!confirm('Delete this job? All applications for this job will also be removed.')) return;
    try {
      await LCCApi.delete('/jobs/' + encodeURIComponent(id));
      LCCDash.showToast('Job deleted.', 'ok');
      await loadJobs();
      await loadApplicants();
    } catch (err) {
      LCCDash.showToast(err.message || 'Delete failed', 'error');
    }
  }

  async function toggleJob(id, active) {
    try {
      await LCCApi.put('/jobs/' + encodeURIComponent(id), { isActive: !active });
      LCCDash.showToast(active ? 'Job paused.' : 'Job resumed.', 'ok');
      await loadJobs();
    } catch (err) {
      LCCDash.showToast(err.message || 'Update failed', 'error');
    }
  }

  async function loadApplicants() {
    const wrap = document.getElementById('applicantsList');
    const filterJob = document.getElementById('appFilterJob').value;
    wrap.innerHTML = '<div class="loader">Loading applicants...</div>';

    try {
      const path = '/applications/employer' + (filterJob ? '?jobId=' + encodeURIComponent(filterJob) : '');
      const res  = await LCCApi.get(path);
      const apps = res.applications || [];

      // Stats — applicants & shortlisted
      document.getElementById('statApplicants').textContent  = apps.length;
      document.getElementById('statShortlisted').textContent = apps.filter(function (a) { return a.status === 'shortlisted'; }).length;

      if (!apps.length) {
        wrap.innerHTML =
          '<div class="empty-state">' +
            '<div class="ico">👥</div>' +
            '<h3>No applicants yet</h3>' +
            '<p>Once candidates apply, they will show up here. Make sure your jobs are active.</p>' +
          '</div>';
        return;
      }

      const apiOrigin = LCCApi.base.replace(/\/api$/, '');

      wrap.innerHTML = apps.map(function (a) {
        const u = a.userId || {};
        const j = a.jobId  || {};
        const initial = (u.name || '?').charAt(0).toUpperCase();
        const resumeURL = u.resume ? (apiOrigin + u.resume)
                        : a.resume ? (apiOrigin + a.resume) : '';
        return '' +
          '<div class="row-item">' +
            '<div style="display:flex; gap:14px; align-items:flex-start;">' +
              '<div class="logo-square">' + LCCDash.escapeHTML(initial) + '</div>' +
              '<div>' +
                '<h4>' + LCCDash.escapeHTML(u.name || 'Candidate') + '</h4>' +
                '<div class="meta">' +
                  '<span>📧 ' + LCCDash.escapeHTML(u.email || '') + '</span>' +
                  (u.phone ? '<span>📞 ' + LCCDash.escapeHTML(u.phone) + '</span>' : '') +
                  '<span>Applied for: <strong>' + LCCDash.escapeHTML(j.title || '—') + '</strong></span>' +
                  '<span>' + LCCDash.escapeHTML(LCCDash.timeAgo(a.createdAt)) + '</span>' +
                '</div>' +
                (u.headline ? '<div style="font-size:13px; color:var(--gray); margin-top:6px;">' + LCCDash.escapeHTML(u.headline) + '</div>' : '') +
                (a.coverNote ? '<div style="font-size:13px; color:var(--dark-text); margin-top:8px; padding:10px 14px; background:var(--cream); border-radius:8px; border-left:3px solid var(--gold);">' + LCCDash.escapeHTML(a.coverNote) + '</div>' : '') +
              '</div>' +
            '</div>' +
            '<div class="actions" style="flex-direction:column; align-items:flex-end; gap:8px;">' +
              '<select data-status="' + a._id + '" style="padding:6px 10px; border:1.5px solid rgba(11,31,58,0.15); border-radius:6px; font-size:12px; background:var(--cream); color:var(--navy); font-weight:500;">' +
                ['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'].map(function (s) {
                  return '<option value="' + s + '"' + (s === a.status ? ' selected' : '') + '>' + s.charAt(0).toUpperCase() + s.slice(1) + '</option>';
                }).join('') +
              '</select>' +
              (resumeURL ? '<a class="btn-secondary btn-sm" href="' + resumeURL + '" target="_blank" rel="noopener">View Resume</a>' : '<span style="font-size:11px; color:var(--gray);">No resume</span>') +
            '</div>' +
          '</div>';
      }).join('');

      wrap.querySelectorAll('select[data-status]').forEach(function (sel) {
        sel.addEventListener('change', function () {
          updateStatus(sel.getAttribute('data-status'), sel.value);
        });
      });
    } catch (err) {
      wrap.innerHTML = '<div class="empty-state"><div class="ico">⚠️</div><h3>Could not load applicants</h3><p>' + LCCDash.escapeHTML(err.message) + '</p></div>';
    }
  }

  async function updateStatus(id, status) {
    try {
      await LCCApi.patch('/applications/' + encodeURIComponent(id) + '/status', { status });
      LCCDash.showToast('Status updated to ' + status + '.', 'ok');
      // Refresh stats
      await loadApplicants();
    } catch (err) {
      LCCDash.showToast(err.message || 'Update failed', 'error');
    }
  }
})();
