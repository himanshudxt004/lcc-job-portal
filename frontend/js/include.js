/* ============================================================
   LCC — Shared Header / Footer Injector
   File: frontend/js/include.js

   Usage in each page:
     <div data-include="header"></div>
     <div data-include="footer"></div>

   Loads BEFORE main.js so navbar/hamburger elements exist when
   main.js queries them. If api.js is also loaded, the header
   becomes auth-aware (shows Dashboard / Logout vs Sign In / Sign Up).
   ============================================================ */
(function () {
  'use strict';

  // ----- HEADER (Navbar + Mobile Menu) -----
  const headerHTML = `
    <nav id="navbar">
      <a href="index.html" class="logo">
        <div class="logo-icon">L</div>
        <div class="logo-text">LCC<span>Career</span></div>
      </a>
      <ul class="nav-links">
        <li><a href="index.html" data-nav="home">Home</a></li>
        <li><a href="about.html" data-nav="about">About</a></li>
        <li><a href="services.html" data-nav="services">Services</a></li>
        <li><a href="industries.html" data-nav="industries">Industries</a></li>
        <li><a href="how-it-works.html" data-nav="how">How It Works</a></li>
        <li><a href="jobs.html" data-nav="jobs">Jobs</a></li>
        <li><a href="contact.html" data-nav="contact">Contact</a></li>
        <li id="navAuthSlot"></li>
      </ul>
      <div class="hamburger" id="hamburger">
        <span></span><span></span><span></span>
      </div>
    </nav>

    <div class="mobile-menu" id="mobileMenu">
      <a href="index.html" data-nav="home">Home</a>
      <a href="about.html" data-nav="about">About</a>
      <a href="services.html" data-nav="services">Services</a>
      <a href="industries.html" data-nav="industries">Industries</a>
      <a href="how-it-works.html" data-nav="how">How It Works</a>
      <a href="jobs.html" data-nav="jobs">Jobs</a>
      <a href="reviews.html" data-nav="reviews">Reviews</a>
      <a href="contact.html" data-nav="contact">Contact</a>
      <div id="mobileAuthSlot"></div>
    </div>
  `;

  // ----- FOOTER -----
  const footerHTML = `
    <footer>
      <div class="footer-top">
        <div class="footer-brand">
          <a href="index.html" class="logo">
            <div class="logo-icon">L</div>
            <div class="logo-text footer-logo-text">LCC<span>Career</span></div>
          </a>
          <p>Lead Connects Career Pvt Ltd — an education-driven recruitment &amp; training organisation building India's next generation of industry-ready professionals.</p>
        </div>

        <div class="footer-col">
          <h4>Company</h4>
          <ul>
            <li><a href="about.html">About Us</a></li>
            <li><a href="services.html">Services</a></li>
            <li><a href="industries.html">Industries</a></li>
            <li><a href="how-it-works.html">How It Works</a></li>
            <li><a href="reviews.html">Reviews</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>For You</h4>
          <ul>
            <li><a href="jobs.html">Browse Jobs</a></li>
            <li><a href="signup.html?role=jobseeker">Sign Up — Candidate</a></li>
            <li><a href="signup.html?role=employer">Sign Up — Employer</a></li>
            <li><a href="login.html">Sign In</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Reach Us</h4>
          <ul>
            <li><a href="https://maps.google.com/?q=Sai+Complex+Ayodhya+Road+Lucknow" target="_blank" rel="noopener">📍 Sai Complex, Ayodhya Road, Lucknow - 226028</a></li>
            <li><a href="tel:+919196109055">📞 +91 91961 09055</a></li>
            <li><a href="tel:+919455405381">📞 +91 94554 05381</a></li>
            <li><a href="mailto:leadconnectscareer@gmail.com">✉️ leadconnectscareer@gmail.com</a></li>
            <li><a href="https://www.lead-jobs.com" target="_blank" rel="noopener">🌐 www.lead-jobs.com</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© 2026 Lead Connects Career Private Limited. All rights reserved.</p>
        <div class="social-links">
          <a class="social-link" href="#" aria-label="LinkedIn">in</a>
          <a class="social-link" href="#" aria-label="Facebook">f</a>
          <a class="social-link" href="#" aria-label="Twitter">✕</a>
          <a class="social-link" href="#" aria-label="YouTube">▶</a>
        </div>
      </div>
    </footer>

    <a class="wa-float"
       href="https://wa.me/919196109055?text=Hi%20LCC%2C%20I%20want%20to%20know%20more%20about%20your%20services."
       target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
      🟢
    </a>
  `;

  function renderAuthSlots() {
    const desktopSlot = document.getElementById('navAuthSlot');
    const mobileSlot  = document.getElementById('mobileAuthSlot');

    const isAuthed = (typeof window.LCCApi !== 'undefined') && LCCApi.isAuthed();

    if (isAuthed) {
      const u = LCCApi.getUser() || {};
      const dashHref = u.role === 'employer' ? 'dashboard-employer.html' : 'dashboard-jobseeker.html';
      if (desktopSlot) {
        desktopSlot.innerHTML =
          '<a href="' + dashHref + '" class="nav-cta" data-nav="dashboard">Dashboard</a>';
      }
      if (mobileSlot) {
        mobileSlot.innerHTML =
          '<a href="' + dashHref + '" data-nav="dashboard">Dashboard</a>' +
          '<a href="#" id="mobLogout">Logout</a>';
        const mlo = document.getElementById('mobLogout');
        if (mlo) mlo.addEventListener('click', function (e) {
          e.preventDefault();
          LCCApi.clearSession();
          window.location.replace('index.html');
        });
      }
    } else {
      if (desktopSlot) {
        desktopSlot.innerHTML =
          '<a href="login.html" data-nav="login" style="margin-right:8px;">Sign In</a>' +
          '<a href="signup.html" class="nav-cta" data-nav="signup">Sign Up</a>';
      }
      if (mobileSlot) {
        mobileSlot.innerHTML =
          '<a href="login.html">Sign In</a>' +
          '<a href="signup.html">Sign Up</a>';
      }
    }
  }

  function inject() {
    document.querySelectorAll('[data-include="header"]').forEach((el) => {
      el.outerHTML = headerHTML;
    });
    document.querySelectorAll('[data-include="footer"]').forEach((el) => {
      el.outerHTML = footerHTML;
    });

    renderAuthSlots();

    // Highlight active nav link based on <body data-page="...">
    const page = document.body.getAttribute('data-page');
    if (page) {
      document.querySelectorAll('[data-nav]').forEach((a) => {
        if (a.getAttribute('data-nav') === page) {
          a.classList.add('active');
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
