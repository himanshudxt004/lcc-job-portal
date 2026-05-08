/* ============================================================
   Lead Connects Career (LCC) — Core UI behaviours
   File: frontend/js/main.js

   Handles: navbar scroll-shadow, mobile hamburger toggle,
            CSS-fallback reveal observer, contact form,
            WhatsApp redirect on form submit.
   ============================================================ */
(function () {
  'use strict';

  // Wait until include.js has injected the navbar/footer
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    // Defer one tick so include.js gets a chance to inject DOM
    setTimeout(init, 0);
  });

  function init() {
    // --------------------------------------------------------
    // 1. NAVBAR scroll shadow
    // --------------------------------------------------------
    const navbar = document.getElementById('navbar');
    if (navbar) {
      const onScroll = function () {
        if (window.scrollY > 20) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    // --------------------------------------------------------
    // 2. HAMBURGER toggle
    // --------------------------------------------------------
    const hamburger  = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', function () {
        mobileMenu.classList.toggle('open');
      });
      mobileMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          mobileMenu.classList.remove('open');
        });
      });
    }

    // --------------------------------------------------------
    // 3. CSS-fallback reveal observer
    //    (GSAP ScrollTrigger will override these via .gsap-ready
    //     class once gsap-animations.js loads. If GSAP fails
    //     to load — say, offline — these CSS reveals still work.)
    // --------------------------------------------------------
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      revealEls.forEach(function (el) { io.observe(el); });
    }

    // --------------------------------------------------------
    // 4. CONTACT / LEAD form — basic validation + WhatsApp redirect
    // --------------------------------------------------------
    const leadForm = document.getElementById('leadForm');
    if (leadForm) {
      leadForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name    = (leadForm.querySelector('[name="name"]')    || {}).value || '';
        const phone   = (leadForm.querySelector('[name="phone"]')   || {}).value || '';
        const email   = (leadForm.querySelector('[name="email"]')   || {}).value || '';
        const role    = (leadForm.querySelector('[name="role"]')    || {}).value || '';
        const subject = (leadForm.querySelector('[name="subject"]') || {}).value || '';
        const message = (leadForm.querySelector('[name="message"]') || {}).value || '';

        if (!name.trim())  { alert('Please enter your full name.');         return; }
        if (!phone.trim()) { alert('Please enter your phone number.');      return; }
        if (!role || role.indexOf('Select') > -1) {
          alert('Please choose: Job Seeker, Employer, or Student.');
          return;
        }

        const lines = [
          'Hi LCC — new enquiry from website:',
          '',
          'Name:    ' + name,
          'Phone:   ' + phone,
          'Email:   ' + email,
          'Role:    ' + role,
          'Subject: ' + subject,
          '',
          'Message:',
          message
        ].filter(Boolean);

        const text = encodeURIComponent(lines.join('\n'));
        const waURL = 'https://wa.me/919196109055?text=' + text;

        const btn = leadForm.querySelector('button[type="submit"], #submitBtn');
        if (btn) {
          btn.textContent = 'Opening WhatsApp...';
          btn.disabled = true;
        }

        // Open WhatsApp in a new tab
        window.open(waURL, '_blank');

        setTimeout(function () {
          if (btn) {
            btn.textContent = '✓ Sent! We will respond shortly.';
            btn.style.background = '#2D6A4F';
            btn.style.color = '#fff';
          }
          leadForm.reset();
        }, 600);

        setTimeout(function () {
          if (btn) {
            btn.textContent = 'Submit Enquiry →';
            btn.style.background = '';
            btn.style.color = '';
            btn.disabled = false;
          }
        }, 5000);
      });
    }

    // --------------------------------------------------------
    // 5. SMOOTH ANCHOR scrolling for in-page links
    // --------------------------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const offset = 84;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });

    // --------------------------------------------------------
    // 6. CURRENT YEAR in footer (if placeholder used)
    // --------------------------------------------------------
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }
})();
