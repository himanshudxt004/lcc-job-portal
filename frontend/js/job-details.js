/* ============================================================
   LCC — Job Details + Apply
   File: frontend/js/job-details.js
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

  function showToast(msg, type) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'toast ' + (type || '') + ' show';
    setTimeout(function () { el.className = 'toast ' + (type || ''); }, 3500);
  }

  function getJobId() {
    return new URLSearchParams(window.location.search).get('id');
  }

  function renderJob(job) {
    const wrap = document.getElementById('jobDetail');
    const skills = (job.skills || [])
      .map(function (s) { return '<span>' + escapeHTML(s) + '</span>'; }).join('');

    const u = LCCApi.getUser();
    const isJobseeker = LCCApi.isAuthed() && u && u.role === 'jobseeker';
    const isOwnerEmployer = LCCApi.isAuthed() && u && u.role === 'employer' && job.employerId
      && (job.employerId._id === u._id || job.employerId === u._id);

    let asideCTA;
    if (isJobseeker) {
      asideCTA = '' +
        '<div class="card-block">' +
          '<h2>Apply to this job</h2>' +
          '<div class="card-sub">Upload your resume (PDF/DOC, max 5 MB) and add a quick cover note.</div>' +
          '<form id="applyForm">' +
            '<div class="form-group">' +
              '<label for="ap-resume">Resume</label>' +
              '<input id="ap-resume" name="resume" type="file" accept=".pdf,.doc,.docx" />' +
              '<div style="font-size:11px; color:var(--gray); margin-top:6px;">' +
                'Skip to use your previously uploaded resume' +
                (u && u.resume ? ' (✓ on file)' : '') +
              '</div>' +
            '</div>' +
            '<div class="form-group">' +
              '<label for="ap-cover">Cover Note (optional)</label>' +
              '<textarea id="ap-cover" name="coverNote" placeholder="Why you are a great fit..."></textarea>' +
            '</div>' +
            '<button type="submit" class="btn-primary btn-full">Submit Application →</button>' +
          '</form>' +
        '</div>';
    } else if (isOwnerEmployer) {
      asideCTA =
        '<div class="card-block">' +
          '<h2>This is your job posting</h2>' +
          '<div class="card-sub">Manage applicants and edit from your dashboard.</div>' +
          '<a href="dashboard-employer.html" class="btn-primary btn-full">Open Dashboard →</a>' +
        '</div>';
    } else if (LCCApi.isAuthed()) {
      asideCTA =
        '<div class="card-block">' +
          '<h2>Employer account</h2>' +
          '<div class="card-sub">Only candidates can apply. Switch to a jobseeker account.</div>' +
          '<a href="login.html?role=jobseeker" class="btn-secondary btn-full" style="justify-content:center;">Login as Job Seeker</a>' +
        '</div>';
    } else {
      asideCTA =
        '<div class="card-block">' +
          '<h2>Sign in to apply</h2>' +
          '<div class="card-sub">Create a free Job Seeker account or login to apply in seconds.</div>' +
          '<a href="signup.html?role=jobseeker" class="btn-primary btn-full" style="justify-content:center;">Create Account</a>' +
          '<a href="login.html?role=jobseeker" class="btn-secondary btn-full" style="justify-content:center; margin-top:10px;">I already have one</a>' +
        '</div>';
    }

    wrap.innerHTML = '' +
      '<div class="job-detail-grid">' +
        '<div class="job-detail-main">' +
          '<h1>' + escapeHTML(job.title) + '</h1>' +
          '<div class="company-line">' +
            escapeHTML(job.company || '') + ' &nbsp;·&nbsp; ' +
            escapeHTML(job.location || '') + ' &nbsp;·&nbsp; ' +
            escapeHTML(job.type || 'Full-Time') +
          '</div>' +
          '<div class="meta" style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:24px;">' +
            (job.salary     ? '<span style="font-size:12px;background:rgba(201,168,76,0.15);color:#8B6F2A;padding:6px 12px;border-radius:99px;font-weight:600;">💰 ' + escapeHTML(job.salary) + '</span>' : '') +
            (job.industry   ? '<span style="font-size:12px;background:var(--cream);padding:6px 12px;border-radius:99px;border:1px solid rgba(11,31,58,0.08);">🏢 ' + escapeHTML(job.industry) + '</span>' : '') +
            (job.experience ? '<span style="font-size:12px;background:var(--cream);padding:6px 12px;border-radius:99px;border:1px solid rgba(11,31,58,0.08);">⏱ ' + escapeHTML(job.experience) + '</span>' : '') +
          '</div>' +
          '<div class="description">' + escapeHTML(job.description) + '</div>' +
          (skills ? '<div style="margin-top:28px;"><div style="font-size:12px;color:var(--gray);font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:10px;">Skills</div><div class="meta" style="display:flex;gap:6px;flex-wrap:wrap;">' + skills + '</div></div>' : '') +
        '</div>' +
        '<aside class="job-detail-aside">' +
          asideCTA +
        '</aside>' +
      '</div>';

    // Apply form handler
    const form = document.getElementById('applyForm');
    if (form) {
      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const fileInput = form.querySelector('input[type="file"]');
        const cover     = form.querySelector('textarea[name="coverNote"]').value.trim();
        const file      = fileInput.files[0];

        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true; btn.textContent = 'Submitting...';

        try {
          const res = await LCCApi.upload('/apply',
            { jobId: job._id, coverNote: cover },
            file ? 'resume' : null,
            file
          );
          showToast('Application submitted successfully!', 'ok');
          form.outerHTML =
            '<div style="text-align:center; padding:24px 0;">' +
              '<div style="font-size:42px; margin-bottom:8px;">✅</div>' +
              '<div style="font-family:var(--font-display); font-size:20px; color:var(--navy); font-weight:700;">Application Sent</div>' +
              '<div style="font-size:13px; color:var(--gray); margin-top:6px;">Track status in your dashboard.</div>' +
              '<a href="dashboard-jobseeker.html" class="btn-primary btn-full" style="justify-content:center; margin-top:18px;">Go to Dashboard →</a>' +
            '</div>';
        } catch (err) {
          showToast(err.message || 'Application failed', 'error');
          btn.disabled = false; btn.textContent = 'Submit Application →';
        }
      });
    }
  }

  ready(async function () {
    const id = getJobId();
    const wrap = document.getElementById('jobDetail');
    if (!id) {
      wrap.innerHTML = '<div class="empty-state"><div class="ico">⚠️</div><h3>No job specified</h3><p>Pick a job from the listing.</p><a href="jobs.html" class="btn-primary">Browse Jobs →</a></div>';
      return;
    }
    try {
      const res = await LCCApi.get('/jobs/' + encodeURIComponent(id));
      renderJob(res.job);
    } catch (err) {
      wrap.innerHTML = '<div class="empty-state"><div class="ico">⚠️</div><h3>Couldn\'t load job</h3><p>' + err.message + '</p><a href="jobs.html" class="btn-primary">Back to Jobs</a></div>';
    }
  });
})();
