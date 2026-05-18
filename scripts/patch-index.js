const fs = require('fs');
const p = require('path').join(__dirname, '..', 'frontend', 'index.html');
let c = fs.readFileSync(p, 'utf8');
c = c.replace(/<motion[^>]*>/g, '').replace(/<\/motion>/g, '');
c = c.replace(
  /      <div class="stats-band-item reveal">\s*<div class="stats-band-num" data-counter data-target="2500"[^<]*<\/motion><\/motion><\/motion><\/motion><\/motion><\/motion><\/motion><\/motion><\/motion><\/motion><\/div>\s*<div class="stats-band-num" data-counter data-target="2500"[^<]*<\/div>/,
  '      <motion class="stats-band-item reveal">\n        <div class="stats-band-num" data-counter data-target="2500" data-suffix="+">2500+</div>'
);
c = c.replace(
  `<div class="stats-band-item reveal">
        <motion class="stats-band-num" data-counter data-target="2500" data-suffix="+">2500+</motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></div>
        <div class="stats-band-num" data-counter data-target="2500" data-suffix="+">2500+</div>`,
  `<div class="stats-band-item reveal">
        <div class="stats-band-num" data-counter data-target="2500" data-suffix="+">2500+</motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></div>`
);
// manual fix duplicates
c = c.replace(
  `        <div class="stats-band-num" data-counter data-target="2500" data-suffix="+">2500+</div>
        <motion class="stats-band-num" data-counter data-target="2500" data-suffix="+">2500+</div>`,
  `        <div class="stats-band-num" data-counter data-target="2500" data-suffix="+">2500+</div>`
);
c = c.replace('<motion class="stats-band-label">Support</motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></div>', '<motion class="stats-band-label">Support</div>');
c = c.replace(/<motion[^>]*>/g, '').replace(/<\/motion>/g, '');

const insertBefore = '  <!-- ========== QUOTE BANNER ========== -->';
const newSections = `
  <!-- ========== FEATURED JOBS ========== -->
  <section class="block cream" id="featured-jobs">
    <div class="section-head">
      <div class="section-tag">Open Roles</motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></div>
      <div class="section-tag">Open Roles</div>
      <div class="section-title">Featured Opportunities</div>
      <div class="section-sub center-sub">Curated roles managed by LCC recruitment consultants.</div>
    </div>
    <div id="featuredJobsGrid" class="jobs-grid-home">
      <div class="loader">Loading featured jobs...</div>
    </div>
    <div style="text-align:center;margin-top:40px;">
      <a href="jobs.html" class="btn-primary">View All Jobs →</a>
    </div>
  </section>

  <!-- ========== TRUSTED PARTNERS ========== -->
  <section class="block partners-section">
    <div class="section-head">
      <div class="section-tag">Trusted By</div>
      <div class="section-title">Companies That Hire Through LCC</div>
    </div>
    <div class="partners-logos reveal">
      <div class="partner-logo">TechCorp</div>
      <div class="partner-logo">MediCare+</div>
      <div class="partner-logo">FinServe</motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></div>
      <div class="partner-logo">FinServe</div>
      <div class="partner-logo">RetailMax</div>
      <div class="partner-logo">EduBridge</div>
      <div class="partner-logo">LogiPro</div>
    </div>
  </section>

  <!-- ========== TESTIMONIALS ========== -->
  <section class="block cream testimonials-section">
    <div class="section-head">
      <div class="section-tag">Success Stories</div>
      <div class="section-title">What Our Clients & Candidates Say</div>
    </motion>
    </div>
    <div class="testimonials-grid">
      <div class="testimonial-card reveal">
        <p>"LCC placed our entire sales team in under 3 weeks. Quality candidates, zero hassle."</p>
        <div class="testimonial-author"><strong>Rajesh M.</strong> — HR Head, BFSI</div>
      </div>
      <div class="testimonial-card reveal">
        <p>"From campus to corporate — LCC training and placement changed my career trajectory."</p>
        <div class="testimonial-author"><strong>Priya S.</strong> — Software Developer</div>
      </div>
      <div class="testimonial-card reveal">
        <p>"Their consultancy model means we get pre-screened talent, not hundreds of irrelevant CVs."</p>
        <div class="testimonial-author"><strong>Dr. Anil K.</strong> — Hospital Administrator</div>
      </div>
    </div>
  </section>

`;

if (!c.includes('featured-jobs')) {
  c = c.replace(insertBefore, newSections.replace(/<motion[^>]*>/g, '').replace(/<\/motion>/g, '') + insertBefore);
}

c = c.replace(
  '      <a href="contact.html" class="btn-primary">Register as Candidate →</a>\n      <a href="contact.html" class="btn-outline">I Want to Hire</a>',
  '      <a href="jobs.html" class="btn-primary">Browse Jobs →</a>\n      <a href="request-hiring.html" class="btn-outline">Request Hiring Support</a>\n      <a href="blog.html" class="btn-secondary" style="margin-left:8px;">Read Our Blog</a>'
);

if (!c.includes('home-jobs.js')) {
  c = c.replace(
    '<script src="js/gsap-animations.js"></script>',
    '<script src="js/home-jobs.js"></script>\n  <script src="js/gsap-animations.js"></script>'
  );
}

fs.writeFileSync(p, c.replace(/<motion[^>]*>/g, '').replace(/<\/motion>/g, ''));
console.log('patched index');
