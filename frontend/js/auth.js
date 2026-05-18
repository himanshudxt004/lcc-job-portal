/* ============================================================
   LCC Frontend — Auth page logic (signup / login)
   ============================================================ */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else { fn(); }
  }

  function dashForRole(role) {
    if (role === 'admin') return 'dashboard-admin.html';
    if (role === 'employer') return 'dashboard-employer.html';
    return 'dashboard-jobseeker.html';
  }

  ready(function () {
    const isAdminPortal = new URLSearchParams(window.location.search).get('admin') === '1';

    if (LCCApi.isAuthed()) {
      const u = LCCApi.getUser();
      if (u && u.role) {
        window.location.replace(dashForRole(u.role));
        return;
      }
    }

    let selectedRole = isAdminPortal ? null : 'jobseeker';
    const tabs = document.querySelectorAll('.role-tab');
    const roleInput = document.querySelector('input[name="role"]');
    const roleTabsEl = document.querySelector('.role-tabs');

    if (isAdminPortal && roleTabsEl) {
      roleTabsEl.style.display = 'none';
      if (roleInput) roleInput.value = '';
      const h = document.querySelector('.auth-head h1');
      if (h) h.textContent = 'Admin Sign In';
      const p = document.querySelector('.auth-head p');
      if (p) p.textContent = 'Agency staff only. Use credentials from your administrator.';
    }

    function setRole(role) {
      selectedRole = role;
      if (roleInput) roleInput.value = role;
      tabs.forEach(function (t) {
        t.classList.toggle('active', t.getAttribute('data-role') === role);
      });
      document.querySelectorAll('[data-employer-only]').forEach(function (el) {
        el.style.display = (role === 'employer') ? '' : 'none';
      });
    }

    if (tabs.length && !isAdminPortal) {
      tabs.forEach(function (t) {
        t.addEventListener('click', function () {
          setRole(t.getAttribute('data-role'));
        });
      });
      const urlRole = new URLSearchParams(window.location.search).get('role');
      setRole(urlRole === 'employer' ? 'employer' : 'jobseeker');
    }

    const feedback = document.getElementById('authFeedback');
    function showError(msg) {
      if (!feedback) { alert(msg); return; }
      feedback.textContent = msg;
      feedback.className = 'auth-feedback error';
    }
    function showOK(msg) {
      if (!feedback) return;
      feedback.textContent = msg;
      feedback.className = 'auth-feedback ok';
    }
    function clearFeedback() {
      if (!feedback) return;
      feedback.textContent = '';
      feedback.className = 'auth-feedback';
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
      signupForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        clearFeedback();
        const fd = Object.fromEntries(new FormData(signupForm).entries());
        fd.role = selectedRole;
        if (fd.password !== fd.confirmPassword) {
          showError('Passwords do not match.');
          return;
        }
        const btn = signupForm.querySelector('button[type="submit"]');
        btn.disabled = true;
        try {
          const res = await LCCApi.post('/auth/signup', {
            name: fd.name, email: fd.email, password: fd.password,
            role: fd.role, phone: fd.phone, company: fd.company
          });
          LCCApi.setToken(res.token);
          LCCApi.setUser(res.user);
          showOK('Account created. Redirecting...');
          setTimeout(function () {
            window.location.replace(dashForRole(res.user.role));
          }, 600);
        } catch (err) {
          showError(err.message || 'Signup failed.');
          btn.disabled = false;
        }
      });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        clearFeedback();
        const fd = Object.fromEntries(new FormData(loginForm).entries());
        const payload = { email: fd.email, password: fd.password };
        if (!isAdminPortal && selectedRole) payload.role = selectedRole;

        const btn = loginForm.querySelector('button[type="submit"]');
        btn.disabled = true;
        try {
          const res = await LCCApi.post('/auth/login', payload);
          if (isAdminPortal && res.user.role !== 'admin') {
            showError('This account is not an admin user.');
            LCCApi.clearSession();
            btn.disabled = false;
            return;
          }
          LCCApi.setToken(res.token);
          LCCApi.setUser(res.user);
          showOK('Welcome back. Redirecting...');
          setTimeout(function () {
            window.location.replace(dashForRole(res.user.role));
          }, 400);
        } catch (err) {
          showError(err.message || 'Login failed.');
          btn.disabled = false;
        }
      });
    }
  });
})();
