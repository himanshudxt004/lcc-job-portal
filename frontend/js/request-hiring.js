/* ============================================================
   LCC — Request Hiring / Consultation
   File: frontend/js/request-hiring.js
   ============================================================ */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else { fn(); }
  }

  ready(function () {
    const params = new URLSearchParams(window.location.search);
    const typeParam = params.get('type');
    if (typeParam === 'consultation') {
      document.getElementById('reqType').value = 'consultation';
      document.getElementById('pageTitle').textContent = 'Book a Consultation';
    }

    const user = LCCApi.isAuthed() ? LCCApi.getUser() : null;
    if (user && user.role === 'employer') {
      document.getElementById('backLink').href = 'dashboard-employer.html';
      document.getElementById('backLink').textContent = '← Back to Dashboard';
      if (user.company) document.getElementById('hr-company').value = user.company;
      if (user.name)    document.getElementById('hr-contact').value = user.name;
      if (user.email)   document.getElementById('hr-email').value = user.email;
      if (user.phone)   document.getElementById('hr-phone').value = user.phone;
    }

    document.getElementById('hiringForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(e.target).entries());
      const btn = document.getElementById('submitBtn');
      btn.disabled = true;
      btn.textContent = 'Submitting...';

      try {
        await LCCApi.post('/hiring-requests', fd);
        LCCDash.showToast('Request submitted! Our recruitment team will contact you shortly.', 'ok');
        e.target.reset();
        if (user && user.role === 'employer') {
          setTimeout(function () {
            window.location.href = 'dashboard-employer.html';
          }, 1200);
        }
      } catch (err) {
        LCCDash.showToast(err.message || 'Submission failed', 'error');
      }
      btn.disabled = false;
      btn.textContent = 'Submit Request';
    });
  });
})();
