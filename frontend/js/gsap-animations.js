/* ============================================================
   Lead Connects Career (LCC) — GSAP Animations
   File: frontend/js/gsap-animations.js

   Requires (loaded via CDN in HTML <head>):
     - gsap.min.js
     - ScrollTrigger.min.js

   Animations:
     1. Hero entrance — staggered fade-up
     2. Page header entrance
     3. Section reveals via ScrollTrigger (.reveal, .gsap-fade-up)
     4. Card stagger (.services-grid, .pillars-grid, etc.)
     5. Stat counter on first scroll-into-view
     6. Ticker continues via CSS (no GSAP)

   Graceful fallback: if GSAP isn't loaded, main.js's IO observer
   handles the .reveal class.
   ============================================================ */
(function () {
  'use strict';

  function start() {
    if (typeof window.gsap === 'undefined') {
      // GSAP not loaded — main.js fallback handles reveals
      return;
    }

    if (typeof window.ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // -------------------------------------------------------
    // 1. HERO entrance
    // -------------------------------------------------------
    const heroBadge   = document.querySelector('.hero .hero-badge');
    const heroTitle   = document.querySelector('.hero h1');
    const heroDesc    = document.querySelector('.hero p');
    const heroBtns    = document.querySelector('.hero-buttons');
    const heroStats   = document.querySelectorAll('.hero-stats .stat-card');

    const heroTL = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.9 } });

    if (heroBadge) heroTL.from(heroBadge, { y: 24, opacity: 0 });
    if (heroTitle) heroTL.from(heroTitle, { y: 32, opacity: 0 }, '-=0.5');
    if (heroDesc)  heroTL.from(heroDesc,  { y: 24, opacity: 0 }, '-=0.6');
    if (heroBtns)  heroTL.from(heroBtns,  { y: 24, opacity: 0 }, '-=0.6');
    if (heroStats.length) {
      heroTL.from(heroStats, { y: 30, opacity: 0, stagger: 0.12 }, '-=0.7');
    }

    // -------------------------------------------------------
    // 2. PAGE HEADER entrance (inner pages)
    // -------------------------------------------------------
    const phInner = document.querySelector('.page-header-inner');
    if (phInner) {
      gsap.from(phInner.children, {
        y: 28, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1
      });
    }

    // -------------------------------------------------------
    // 3. SECTION REVEAL via ScrollTrigger
    // -------------------------------------------------------
    if (typeof window.ScrollTrigger !== 'undefined') {

      // Headings + lone reveal blocks
      gsap.utils.toArray('.section-head, .reveal:not(.service-card):not(.pillar-card):not(.approach-card):not(.challenge-card):not(.sector-card):not(.testi-card):not(.feature-item):not(.industry-pill):not(.advantage-stat):not(.step):not(.journey)').forEach(function (el) {
        gsap.from(el, {
          y: 32,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        });
        // Cancel CSS reveal so GSAP controls it
        el.classList.add('visible');
      });

      // Card grids — stagger
      const groups = [
        '.services-grid',
        '.pillars-grid',
        '.approach-grid',
        '.challenge-cards',
        '.sectors-grid',
        '.testi-grid',
        '.steps-grid',
        '.advantage-bar',
        '.industries-grid',
        '.features-list',
        '.journeys'
      ];
      groups.forEach(function (sel) {
        document.querySelectorAll(sel).forEach(function (group) {
          const items = group.children;
          if (!items.length) return;
          // Set initial hidden state via inline style (overrides CSS .reveal)
          // then animate TO visible — avoids opacity capture race condition with gsap.from()
          gsap.set(items, { opacity: 0, y: 30 });
          Array.prototype.forEach.call(items, function (i) {
            i.classList.add('visible'); // removes CSS transition so GSAP controls it
          });
          gsap.to(items, {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.08,
            scrollTrigger: { trigger: group, start: 'top 80%', once: true }
          });
        });
      });

      // Quote banner subtle scale-in
      const quote = document.querySelector('.quote-banner blockquote');
      if (quote) {
        gsap.from(quote, {
          scale: 0.96,
          opacity: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: { trigger: quote, start: 'top 80%', once: true }
        });
      }
    }

    // -------------------------------------------------------
    // 4. STAT counters
    // -------------------------------------------------------
    function animateNumber(el) {
      const targetRaw = el.getAttribute('data-target');
      const suffix    = el.getAttribute('data-suffix') || '';
      const prefix    = el.getAttribute('data-prefix') || '';
      const target    = parseFloat(targetRaw);
      if (isNaN(target)) return;

      const obj = { v: 0 };
      gsap.to(obj, {
        v: target,
        duration: 1.6,
        ease: 'power2.out',
        onUpdate: function () {
          const isInt = (target % 1 === 0);
          el.textContent = prefix + (isInt ? Math.floor(obj.v) : obj.v.toFixed(1)) + suffix;
        }
      });
    }

    const counterEls = document.querySelectorAll('[data-counter]');
    if (counterEls.length && typeof window.ScrollTrigger !== 'undefined') {
      counterEls.forEach(function (el) {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          once: true,
          onEnter: function () { animateNumber(el); }
        });
      });
    } else {
      // No ScrollTrigger — fire on load
      counterEls.forEach(function (el) { animateNumber(el); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();