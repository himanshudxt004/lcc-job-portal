/* ============================================================
   LCC â€” Employer Portal (Hiring Requests)
   ============================================================ */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else { fn(); }
  }

  const STATUS_LABELS = {
    new: 'New',
    contacted: 'Contacted',
    in_progress: 'In Progress',
    closed: 'Closed'
  };

  ready(async function () {
    const user = LCCDash.requireAuth('employer');
    if (!user) return;

    LCCDash.renderUserChip('authStrip');
    document.getElementById('welcomeTitle').textContent =
      (user.company ? user.company + ' Â· ' : '') + 'Hiring Partner Portal';

    await loadRequests();
  });

  async function loadRequests() {
    const wrap = document.getElementById('requestsList');
    try {
      const res = await LCCApi.get('/hiring-requests/mine');
      const requests = res.requests || [];

      document.getElementById('statTotal').textContent = requests.length;
      document.getElementById('statNew').textContent = requests.filter(function (r) { return r.status === 'new'; }).length;
      document.getElementById('statProgress').textContent = requests.filter(function (r) {
        return r.status === 'in_progress' || r.status === 'contacted';
      }).length;
      document.getElementById('statClosed').textContent = requests.filter(function (r) { return r.status === 'closed'; }).length;

      if (!requests.length) {
        wrap.innerHTML =
          '<div class="empty-state">' +
            'ðŸ“‹' +
            '<div class="ico">ðŸ“‹</div>' +
            '<h3>No hiring requests yet</h3>' +
            '<p>Submit your first hiring requirement and our recruitment consultants will reach out within 2 business hours.</p>' +
            '<a href="request-hiring.html" class="btn-primary">Request Hiring Support â†’</a>' +
          '</div>';
        return;
      }

      wrap.innerHTML = requests.map(function (r) {
        const typeLabel = r.type === 'consultation' ? 'Consultation' : 'Hiring Request';
        return '' +
          '<div class="row-item">' +
            '<div>' +
              '<h4>' + LCCDash.escapeHTML(r.companyName) +
                ' <span style="font-size:10px;background:rgba(201,168,76,0.15);color:var(--gold-dark);padding:2px 8px;border-radius:99px;font-weight:600;">' +
                LCCDash.escapeHTML(typeLabel) + '</span></h4>' +
              '' +
              '<div class="meta">' +
                '<span>' + LCCDash.escapeHTML(r.contactName) + '</span>' +
                (r.rolesNeeded ? '<span>' + LCCDash.escapeHTML(r.rolesNeeded) + '</span>' : '') +
                (r.location ? '<span>' + LCCDash.escapeHTML(r.location) + '</span>' : '') +
                '<span>' + LCCDash.escapeHTML(LCCDash.timeAgo(r.createdAt)) + '</span>' +
              '</div>' +
              (r.message ? '<div style="font-size:13px;color:var(--gray);margin-top:8px;max-width:640px;">' +
                LCCDash.escapeHTML(r.message.slice(0, 200)) + (r.message.length > 200 ? 'â€¦' : '') + '</div>' : '') +
            '</div>' +
            '<div class="actions">' +
              '<span class="status-pill status-' + LCCDash.escapeHTML(r.status) + '">' +
              LCCDash.escapeHTML(STATUS_LABELS[r.status] || r.status) + '</span>' +
            '</div>' +
          '</div>';
      }).join('');
    } catch (err) {
      wrap.innerHTML = '<div class="empty-state"><h3>Could not load requests</h3><p>' + LCCDash.escapeHTML(err.message) + '</p></div>';
    }
  }
})();

