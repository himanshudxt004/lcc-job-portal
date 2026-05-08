/* ============================================================
   LCC Frontend — Auth page logic (signup / login)
   File: frontend/js/auth.js

   Depends on: js/api.js  (window.LCCApi)
   Used by:    signup.html, login.html
   ============================================================ */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else { fn(); }
  }

  ready(function () {
    // ---- Already logged in? Redirect to correct dashboard. ----
    if (LCCApi.isAuthed()) {
      const u = LCCApi.getUser();
      if (u && u.role) {
        window.location.replace(u.role === 'employer'
          ? 'dashboard-employer.html'
          : 'dashboard-jobseeker.html');
        return;
      }
    }

    // ---- Role tabs (used on both signup + login) ----
    let selectedRole = 'jobseeker';
    const tabs = document.querySelectorAll('.role-tab');
    const roleInput = document.querySelector('input[name="role"]');

    function setRole(role) {
      selectedRole = role;
      if (roleInput) roleInput.value = role;
      tabs.forEach(function (t) {
        t.classList.toggle('active', t.getAttribute('data-role') === role);
      });
      // Show/hide employer-only fields
      document.querySelectorAll('[data-employer-only]').forEach(function (el) {
        el.style.display = (role === 'employer') ? '' : 'none';
      });
    }

    if (tabs.length) {
      tabs.forEach(function (t) {
        t.addEventListener('click', function () {
          setRole(t.getAttribute('data-role'));
        });
      });
      // Init from URL ?role=employer or default to jobseeker
      const urlRole = new URLSearchParams(window.location.search).get('role');
      setRole(urlRole === 'employer' ? 'employer' : 'jobseeker');
    }

    // ---- Generic feedback helper ----
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

    // ---- SIGNUP form ----
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
        if ((fd.password || '').length < 6) {
          showError('Password must be at least 6 characters.');
          return;
        }

        const btn = signupForm.querySelector('button[type="submit"]');
        btn.disabled = true; btn.textContent = 'Creating account...';

        try {
          const res = await LCCApi.post('/auth/signup', {
            name:     fd.name,
            email:    fd.email,
            password: fd.password,
            role:     fd.role,
            phone:    fd.phone,
            company:  fd.company
          });
          LCCApi.setToken(res.token);
          LCCApi.setUser(res.user);

          showOK('Account created. Redirecting...');
          setTimeout(function () {
            window.location.replace(res.user.role === 'employer'
              ? 'dashboard-employer.html'
              : 'dashboard-jobseeker.html');
          }, 600);
        } catch (err) {
          showError(err.message || 'Signup failed. Please try again.');
          btn.disabled = false; btn.textContent = 'Create Account →';
        }
      });
    }

    // ---- LOGIN form ----
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        clearFeedback();

        const fd = Object.fromEntries(new FormData(loginForm).entries());
        fd.role = selectedRole;

        const btn = loginForm.querySelector('button[type="submit"]');
        btn.disabled = true; btn.textContent = 'Signing in...';

        try {
          const res = await LCCApi.post('/auth/login', {
            email:    fd.email,
            password: fd.password,
            role:     fd.role
          });
          LCCApi.setToken(res.token);
          LCCApi.setUser(res.user);

          showOK('Welcome back. Redirecting...');
          setTimeout(function () {
            window.location.replace(res.user.role === 'employer'
              ? 'dashboard-employer.html'
              : 'dashboard-jobseeker.html');
          }, 400);
        } catch (err) {
          showError(err.message || 'Login failed. Please try again.');
          btn.disabled = false; btn.textContent = 'Sign In →';
        }
      });
    }
  });
})();
