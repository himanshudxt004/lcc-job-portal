/* ============================================================
   LCC — Post / Edit Job (employer)
   File: frontend/js/post-job.js
   ============================================================ */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else { fn(); }
  }

  function getId() {
    return new URLSearchParams(window.location.search).get('id');
  }

  function setVal(name, v) {
    const el = document.querySelector('[name="' + name + '"]');
    if (el) el.value = v == null ? '' : v;
  }

  ready(async function () {
    const user = LCCDash.requireAuth('employer');
    if (!user) return;

    // Default company from user profile
    setVal('company', user.company || '');

    const editId = getId();
    if (editId) {
      document.getElementById('pageTitle').textContent = 'Edit Job';
      document.getElementById('submitBtn').textContent = 'Save Changes →';
      try {
        const res = await LCCApi.get('/jobs/' + encodeURIComponent(editId));
        const j = res.job;
        setVal('title',       j.title);
        setVal('company',     j.company);
        setVal('location',    j.location);
        setVal('salary',      j.salary);
        setVal('type',        j.type);
        setVal('industry',    j.industry);
        setVal('experience',  j.experience);
        setVal('skills',      (j.skills || []).join(', '));
        setVal('description', j.description);
      } catch (err) {
        LCCDash.showToast(err.message || 'Could not load job', 'error');
      }
    }

    document.getElementById('jobForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(e.target).entries());

      const btn = document.getElementById('submitBtn');
      btn.disabled = true; btn.textContent = editId ? 'Saving...' : 'Publishing...';

      try {
        if (editId) {
          await LCCApi.put('/jobs/' + encodeURIComponent(editId), fd);
          LCCDash.showToast('Job updated.', 'ok');
        } else {
          await LCCApi.post('/jobs', fd);
          LCCDash.showToast('Job published!', 'ok');
        }
        setTimeout(function () {
          window.location.href = 'dashboard-employer.html';
        }, 800);
      } catch (err) {
        LCCDash.showToast(err.message || 'Save failed', 'error');
        btn.disabled = false; btn.textContent = editId ? 'Save Changes →' : 'Publish Job →';
      }
    });
  });
})();
